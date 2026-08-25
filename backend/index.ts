import express, { Request, Response } from 'express'
import cors from 'cors'
import { PrismaClient } from './generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import multer from 'multer'
import fs from 'fs'
import { Groq } from 'groq-sdk'
import axios from 'axios'
import * as cheerio from 'cheerio'
import bcrypt from 'bcrypt'

// ─── ENV ──────────────────────────────────────────────────────────────────────
// In production (Docker / Northflank) the platform injects real environment
// variables. dotenv is only a local-development convenience — it never
// overrides variables that are already set in the process environment.
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })
dotenv.config({ path: path.resolve(__dirname, '.env'), quiet: true })
dotenv.config({ path: path.resolve(__dirname, '../.env'), quiet: true })

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}. See .env.example.`)
  }
  return value
}

function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key]
  return value && value.length > 0 ? value : fallback
}

function numberEnv(key: string, fallback: number): number {
  const raw = process.env[key]
  if (!raw) return fallback
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Environment variable ${key} must be a number, received "${raw}".`)
  }
  return parsed
}

const config = {
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  // Northflank injects PORT — always bind 0.0.0.0 so the container is reachable
  port: numberEnv('PORT', 3000),
  host: optionalEnv('HOST', '0.0.0.0'),
  databaseUrl: requireEnv('DATABASE_URL'),
  groqApiKey: requireEnv('GROQ_API_KEY'),
  groqModel: optionalEnv('GROQ_MODEL', 'openai/gpt-oss-120b'),
  // "*" or a comma-separated list of allowed origins
  corsOrigin: optionalEnv('CORS_ORIGIN', '*'),
  // Point at a mounted volume in production — the container filesystem is ephemeral
  uploadDir: path.resolve(optionalEnv('UPLOAD_DIR', path.join(__dirname, 'uploads'))),
  maxUploadMb: numberEnv('MAX_UPLOAD_MB', 20),
  jsonBodyLimit: optionalEnv('JSON_BODY_LIMIT', '10mb'),
  scrapeTimeoutMs: numberEnv('SCRAPE_TIMEOUT_MS', 15000),
  scrapeUserAgent: optionalEnv(
    'SCRAPE_USER_AGENT',
    'Mozilla/5.0 (compatible; GreenTrustLens/1.0; +https://greentrustlens.com/bot)'
  ),
}

// ─── DB ───────────────────────────────────────────────────────────────────────
const pool = new pg.Pool({ connectionString: config.databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ─── GROQ ─────────────────────────────────────────────────────────────────────
const groq = new Groq({ apiKey: config.groqApiKey })

// ─── UPLOAD DIR ───────────────────────────────────────────────────────────────
const uploadDir = config.uploadDir
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// ─── MULTER CONFIG ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, `${unique}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: config.maxUploadMb * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/webp',
      'text/plain',
    ]
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`))
    }
  },
})

// ─── EXPRESS ──────────────────────────────────────────────────────────────────
const app = express()
app.use(
  cors({
    origin:
      config.corsOrigin === '*'
        ? '*'
        : config.corsOrigin.split(',').map((o) => o.trim()).filter(Boolean),
  })
)
app.use(express.json({ limit: config.jsonBodyLimit }))

// Serve uploaded files publicly
app.use('/uploads', express.static(uploadDir))

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Extract plain text from an uploaded file based on its MIME type
 */
async function extractTextFromFile(
  filePath: string,
  mimeType: string,
  originalName: string
): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      // pdf-parse v2 exposes a class-based API (no default callable export).
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { PDFParse } = require('pdf-parse')
      const dataBuffer = fs.readFileSync(filePath)
      const parser = new PDFParse({ data: dataBuffer })
      try {
        const data = await parser.getText()
        return data.text?.trim() || ''
      } finally {
        await parser.destroy()
      }
    }

    if (
      mimeType === 'application/msword' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mammoth = require('mammoth')
      const result = await mammoth.extractRawText({ path: filePath })
      return result.value?.trim() || ''
    }

    if (mimeType === 'text/plain') {
      return fs.readFileSync(filePath, 'utf-8').trim()
    }

    if (mimeType.startsWith('image/')) {
      // For images, we'll use the filename and tell LLM it's an image
      return `[IMAGE FILE: ${originalName}] — This is a sustainability document image. Please analyze based on context.`
    }

    return ''
  } catch (err) {
    console.error('Text extraction error:', err)
    return ''
  }
}

/**
 * Core LLM analysis function — runs Groq on the provided text and returns
 * a structured ESG / greenwashing analysis
 */
async function runGreenwashingAnalysis(
  companyName: string,
  contentText: string,
  source: 'upload' | 'url' | 'search'
): Promise<{
  overallScore: number
  specificity: number
  evidence: number
  sentiment: number
  operational: number
  claims: Array<{ text: string; type: 'verified' | 'unverified' | 'misleading'; confidence: number }>
  strengths: string[]
  weaknesses: string[]
  summary: string
}> {
  const systemPrompt = `You are an expert ESG (Environmental, Social, Governance) analyst specializing in greenwashing detection.
Your job is to analyze sustainability claims made by companies and score them objectively.

You must respond ONLY with a valid JSON object — no markdown, no explanation, just raw JSON.

The JSON must have this exact structure:
{
  "overallScore": <integer 0-100>,
  "specificity": <integer 0-100, how specific and measurable the claims are>,
  "evidence": <integer 0-100, how well-backed by third-party evidence>,
  "sentiment": <integer 0-100, public sentiment around the company's ESG efforts>,
  "operational": <integer 0-100, operational proof that backs claims>,
  "claims": [
    {
      "text": "<exact claim extracted from the content>",
      "type": "<'verified' | 'unverified' | 'misleading'>",
      "confidence": <integer 0-100>
    }
  ],
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "weaknesses": ["<weakness 1>", "<weakness 2>", ...],
  "summary": "<2-3 sentence executive summary of the greenwashing analysis>"
}

Scoring guide:
- 80-100: Excellent, transparent, well-evidenced sustainability practices
- 60-79: Mostly credible with some gaps
- 40-59: Mixed — some valid claims, but notable gaps or vague language
- 20-39: Mostly greenwashing — vague, unsubstantiated claims
- 0-19: Severe greenwashing — misleading or false claims

Always extract at least 3 specific claims from the content.
Always provide at least 3 strengths and 3 weaknesses.`

  const userPrompt = source === 'search'
    ? `Analyze the ESG / sustainability reputation of the company: "${companyName}".
Use your knowledge of this company's publicly known sustainability record, controversies, and reporting.
If you don't have specific knowledge, provide a realistic analysis based on their industry.`
    : `Analyze the following sustainability content from "${companyName}" for greenwashing.

CONTENT:
${contentText.slice(0, 8000)}

Identify all sustainability claims, score their credibility, and provide an overall greenwashing score.`

  const chatCompletion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    model: config.groqModel,
    temperature: 0.1,
    max_completion_tokens: 1500,
    top_p: 1,
    stream: false,
    stop: null,
  })

  const raw = chatCompletion.choices[0]?.message?.content || '{}'

  // Strip markdown code fences if LLM wrapped in them
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)

    // Clamp all scores to 0-100
    const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)))

    return {
      overallScore: clamp(parsed.overallScore ?? 50),
      specificity: clamp(parsed.specificity ?? 50),
      evidence: clamp(parsed.evidence ?? 50),
      sentiment: clamp(parsed.sentiment ?? 50),
      operational: clamp(parsed.operational ?? 50),
      claims: Array.isArray(parsed.claims) ? parsed.claims.slice(0, 10) : [],
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 6) : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 6) : [],
      summary: parsed.summary || 'Analysis complete.',
    }
  } catch (err) {
    console.error('JSON parse error from LLM:', cleaned)
    // Return safe defaults if LLM response is malformed
    return {
      overallScore: 50,
      specificity: 50,
      evidence: 50,
      sentiment: 50,
      operational: 50,
      claims: [{ text: 'Unable to extract claims from content', type: 'unverified', confidence: 0 }],
      strengths: ['Analysis attempted'],
      weaknesses: ['Could not fully parse the content'],
      summary: 'The analysis encountered an issue parsing the content. Please try again.',
    }
  }
}

// ─── ROUTES ───────────────────────────────────────────────────────────────────

// Health check
app.get('/ok', async (_req: Request, res: Response): Promise<any> => {
  return res.status(200).json({ msg: 'server is up and healthy' })
})

// ── AUTH ──────────────────────────────────────────────────────────────────────

// Sign in / Sign up (combined)
app.post('/signin', async (req: Request, res: Response): Promise<any> => {
  const userData = req.body // name, email, password

  const response = await prisma.user.findFirst({
    where: { email: userData.email },
  })

  if (response) {
    // Sign in
    const checkPassword = await bcrypt.compare(userData.password, response.password)
    if (checkPassword) {
      return res.status(200).json({ id: response.id, msg: 'You have successfully signed in' })
    }
    return res.status(401).json({ msg: 'Your password is incorrect' })
  }

  // Sign up
  const hashedPassword = await bcrypt.hash(userData.password, 10)
  const userResponse = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
    },
  })
  return res.status(202).json({ id: userResponse.id, msg: 'Your account was successfully created' })
})

// ── ANALYSIS ROUTES ───────────────────────────────────────────────────────────

/**
 * POST /analyze-company
 * Body: { companyName: string, userId?: string }
 * Runs LLM-based ESG analysis based on company name using model knowledge
 */
app.post('/analyze-company', async (req: Request, res: Response): Promise<any> => {
  try {
    const { companyName, userId } = req.body

    if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
      return res.status(400).json({ error: 'companyName is required' })
    }

    const analysis = await runGreenwashingAnalysis(companyName.trim(), '', 'search')

    // Persist to DB
    const saved = await prisma.analysis.create({
      data: {
        companyName: companyName.trim(),
        source: 'search',
        overallScore: analysis.overallScore,
        specificity: analysis.specificity,
        evidence: analysis.evidence,
        sentiment: analysis.sentiment,
        operational: analysis.operational,
        claims: analysis.claims,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary,
        userId: userId || null,
      },
    })

    return res.status(200).json({
      id: saved.id,
      companyName: saved.companyName,
      source: 'search',
      scores: {
        overall: analysis.overallScore,
        specificity: analysis.specificity,
        evidence: analysis.evidence,
        sentiment: analysis.sentiment,
        operational: analysis.operational,
      },
      claims: analysis.claims,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      summary: analysis.summary,
    })
  } catch (err: any) {
    console.error('/analyze-company error:', err)
    return res.status(500).json({ error: 'Analysis failed', detail: err.message })
  }
})

/**
 * POST /upload-document
 * Form-data: documents (file), companyName (string), userId? (string)
 * Accepts PDF, DOCX, DOC, images, plain text
 * Extracts text → LLM analysis → stores document + analysis in DB
 */
app.post(
  '/upload-document',
  upload.single('documents'),
  async (req: Request, res: Response): Promise<any> => {
    try {
      const file = req.file
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded. Use multipart field name "documents".' })
      }

      const companyName = (req.body.companyName as string)?.trim() || 'Unknown Company'
      const userId = (req.body.userId as string) || undefined

      // Extract text from the file
      const rawText = await extractTextFromFile(file.path, file.mimetype, file.originalname)

      if (!rawText && !file.mimetype.startsWith('image/')) {
        // Clean up the uploaded file if extraction fails
        fs.unlinkSync(file.path)
        return res.status(422).json({
          error: 'Could not extract text from the document. Make sure it is a readable PDF, DOCX, or text file.',
        })
      }

      // Run LLM analysis
      const analysis = await runGreenwashingAnalysis(companyName, rawText, 'upload')

      // Save analysis to DB
      const savedAnalysis = await prisma.analysis.create({
        data: {
          companyName,
          source: 'upload',
          overallScore: analysis.overallScore,
          specificity: analysis.specificity,
          evidence: analysis.evidence,
          sentiment: analysis.sentiment,
          operational: analysis.operational,
          claims: analysis.claims,
          strengths: analysis.strengths,
          weaknesses: analysis.weaknesses,
          summary: analysis.summary,
          rawText: rawText.slice(0, 10000), // cap stored text at 10k chars
          userId: userId || null,
        },
      })

      // Save document record linked to the analysis
      const savedDoc = await prisma.document.create({
        data: {
          filename: file.originalname,
          filePath: file.path,
          mimeType: file.mimetype,
          analysisId: savedAnalysis.id,
          userId: userId || null,
        },
      })

      const fileUrl = `/uploads/${path.basename(file.path)}`

      return res.status(200).json({
        id: savedAnalysis.id,
        companyName,
        source: 'upload',
        document: {
          id: savedDoc.id,
          filename: file.originalname,
          url: fileUrl,
          mimeType: file.mimetype,
        },
        scores: {
          overall: analysis.overallScore,
          specificity: analysis.specificity,
          evidence: analysis.evidence,
          sentiment: analysis.sentiment,
          operational: analysis.operational,
        },
        claims: analysis.claims,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary,
      })
    } catch (err: any) {
      console.error('/upload-document error:', err)
      return res.status(500).json({ error: 'Upload and analysis failed', detail: err.message })
    }
  }
)

/**
 * POST /analyze-url
 * Body: { url: string, companyName?: string, userId?: string }
 * Scrapes the URL content → LLM analysis → stores in DB
 */
app.post('/analyze-url', async (req: Request, res: Response): Promise<any> => {
  try {
    const { url, userId } = req.body
    let { companyName } = req.body

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'url is required' })
    }

    // Basic URL validation
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return res.status(400).json({ error: 'Invalid URL format. Include http:// or https://' })
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      return res.status(400).json({ error: 'Only http and https URLs are supported' })
    }

    // Scrape the URL
    let rawText = ''
    let pageTitle = ''
    try {
      const response = await axios.get(url, {
        timeout: config.scrapeTimeoutMs,
        headers: {
          'User-Agent': config.scrapeUserAgent,
          Accept: 'text/html,application/xhtml+xml',
        },
        maxRedirects: 5,
      })

      const $ = cheerio.load(response.data)

      // Remove scripts, styles, nav, footer for cleaner content
      $('script, style, nav, footer, header, .nav, .footer, .header, noscript').remove()

      pageTitle = $('title').text().trim() || $('h1').first().text().trim()

      // Prefer sustainability-related sections
      const bodyText = $('body').text()
      rawText = bodyText.replace(/\s+/g, ' ').trim()
    } catch (scrapeErr: any) {
      console.error('Scraping error:', scrapeErr.message)
      return res.status(422).json({
        error: 'Could not fetch the URL. Make sure it is publicly accessible.',
        detail: scrapeErr.message,
      })
    }

    if (!rawText || rawText.length < 100) {
      return res.status(422).json({
        error: 'The URL did not return enough text content to analyze.',
      })
    }

    // Use page title as company name fallback
    if (!companyName || companyName.trim().length === 0) {
      companyName = pageTitle || parsedUrl.hostname
    }

    // Run LLM analysis
    const analysis = await runGreenwashingAnalysis(companyName.trim(), rawText, 'url')

    // Save to DB
    const saved = await prisma.analysis.create({
      data: {
        companyName: companyName.trim(),
        source: 'url',
        sourceUrl: url,
        overallScore: analysis.overallScore,
        specificity: analysis.specificity,
        evidence: analysis.evidence,
        sentiment: analysis.sentiment,
        operational: analysis.operational,
        claims: analysis.claims,
        strengths: analysis.strengths,
        weaknesses: analysis.weaknesses,
        summary: analysis.summary,
        rawText: rawText.slice(0, 10000),
        userId: userId || null,
      },
    })

    return res.status(200).json({
      id: saved.id,
      companyName: companyName.trim(),
      source: 'url',
      sourceUrl: url,
      scores: {
        overall: analysis.overallScore,
        specificity: analysis.specificity,
        evidence: analysis.evidence,
        sentiment: analysis.sentiment,
        operational: analysis.operational,
      },
      claims: analysis.claims,
      strengths: analysis.strengths,
      weaknesses: analysis.weaknesses,
      summary: analysis.summary,
    })
  } catch (err: any) {
    console.error('/analyze-url error:', err)
    return res.status(500).json({ error: 'URL analysis failed', detail: err.message })
  }
})

/**
 * GET /analyses
 * Query: userId? — list all analyses, optionally filtered by user
 */
app.get('/analyses', async (req: Request, res: Response): Promise<any> => {
  try {
    const { userId } = req.query
    const analyses = await prisma.analysis.findMany({
      ...(userId ? { where: { userId: userId as string } } : {}),
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        companyName: true,
        source: true,
        sourceUrl: true,
        overallScore: true,
        createdAt: true,
        summary: true,
      },
    })
    return res.status(200).json({ analyses })
  } catch (err: any) {
    return res.status(500).json({ error: 'Could not fetch analyses', detail: err.message })
  }
})

/**
 * GET /analysis/:id
 * Get full analysis result by ID
 */
app.get('/analysis/:id', async (req: Request, res: Response): Promise<any> => {
  try {
    const { id } = req.params
    const analysis = await prisma.analysis.findUnique({
      where: { id: id as string },
      include: { documents: true },
    })
    if (!analysis) {
      return res.status(404).json({ error: 'Analysis not found' })
    }
    return res.status(200).json(analysis)
  } catch (err: any) {
    return res.status(500).json({ error: 'Could not fetch analysis', detail: err.message })
  }
})

// ─── START ────────────────────────────────────────────────────────────────────
const server = app.listen(config.port, config.host, () => {
  console.log(`🌿 GreenTrustLens backend listening on ${config.host}:${config.port} (${config.nodeEnv})`)
  console.log(`   Uploads dir: ${uploadDir}`)
  console.log(`   Routes:`)
  console.log(`   GET  /ok`)
  console.log(`   POST /signin`)
  console.log(`   POST /analyze-company`)
  console.log(`   POST /upload-document`)
  console.log(`   POST /analyze-url`)
  console.log(`   GET  /analyses`)
  console.log(`   GET  /analysis/:id`)
})

// ─── GRACEFUL SHUTDOWN ────────────────────────────────────────────────────────
// Northflank sends SIGTERM before replacing a container; drain in-flight
// requests and close DB handles so rolling deploys don't drop connections.
let shuttingDown = false
function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received — shutting down…`)

  const forceExit = setTimeout(() => {
    console.error('Shutdown timed out, forcing exit.')
    process.exit(1)
  }, 10000)
  forceExit.unref()

  server.close(async () => {
    try {
      await prisma.$disconnect()
      await pool.end()
    } catch (err) {
      console.error('Error during shutdown:', err)
    }
    clearTimeout(forceExit)
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))