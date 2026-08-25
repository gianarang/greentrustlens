// ─────────────────────────────────────────────────────────────────────────────
// GreenTrustLens API client
//
// All calls target the backend at NEXT_PUBLIC_API_URL. Set this in Vercel
// (and .env.local for local development) to the deployed Northflank URL, e.g.
//   NEXT_PUBLIC_API_URL=https://greentrustlens-backend.northflank.app
// ─────────────────────────────────────────────────────────────────────────────

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '')

export type ClaimType = 'verified' | 'unverified' | 'misleading'

export interface Claim {
  text: string
  type: ClaimType
  confidence: number
}

export interface AnalysisScores {
  overall: number
  specificity: number
  evidence: number
  sentiment: number
  operational: number
}

export interface AnalysisResult {
  id: string
  companyName: string
  source: 'upload' | 'url' | 'search'
  sourceUrl?: string
  document?: {
    id: string
    filename: string
    url: string
    mimeType: string
  }
  scores: AnalysisScores
  claims: Claim[]
  strengths: string[]
  weaknesses: string[]
  summary: string
}

export interface AuthResult {
  id: string
  msg: string
}

/** Build a fully-qualified URL for a backend-relative path (e.g. an upload). */
export function apiUrl(path: string): string {
  if (!path) return API_URL
  return /^https?:\/\//.test(path) ? path : `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json()
    return body?.error || body?.msg || body?.detail || `Request failed (${res.status})`
  } catch {
    return `Request failed (${res.status})`
  }
}

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(apiUrl(path), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<T>
}

// ─── AUTH ──────────────────────────────────────────────────────────────────

/**
 * Combined sign-in / sign-up. The backend creates the account if the email is
 * unknown, otherwise verifies the password.
 */
export async function signIn(params: {
  name?: string
  email: string
  password: string
}): Promise<AuthResult> {
  return postJson<AuthResult>('/signin', params)
}

// ─── ANALYSIS ────────────────────────────────────────────────────────────────

export async function analyzeCompany(companyName: string, userId?: string): Promise<AnalysisResult> {
  return postJson<AnalysisResult>('/analyze-company', { companyName, userId })
}

export async function analyzeUrl(
  url: string,
  companyName?: string,
  userId?: string,
): Promise<AnalysisResult> {
  return postJson<AnalysisResult>('/analyze-url', { url, companyName, userId })
}

export async function uploadDocument(params: {
  file: File
  companyName: string
  userId?: string
}): Promise<AnalysisResult> {
  const form = new FormData()
  form.append('documents', params.file)
  form.append('companyName', params.companyName)
  if (params.userId) form.append('userId', params.userId)

  const res = await fetch(apiUrl('/upload-document'), { method: 'POST', body: form })
  if (!res.ok) throw new Error(await parseError(res))
  return res.json() as Promise<AnalysisResult>
}

export interface AnalysisSummary {
  id: string
  companyName: string
  source: string
  sourceUrl?: string
  overallScore: number
  createdAt: string
  summary: string
}

export async function listAnalyses(userId?: string): Promise<AnalysisSummary[]> {
  const url = apiUrl(`/analyses${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(await parseError(res))
  const data = await res.json()
  return data.analyses ?? []
}

/**
 * Fetch a stored analysis by id and map the flat DB record into the
 * AnalysisResult shape the dashboard renders. No LLM call — this just replays a
 * previously computed result.
 */
export async function getAnalysis(id: string): Promise<AnalysisResult> {
  const res = await fetch(apiUrl(`/analysis/${id}`))
  if (!res.ok) throw new Error(await parseError(res))
  const a = await res.json()

  const doc = Array.isArray(a.documents) && a.documents.length > 0 ? a.documents[0] : null

  return {
    id: a.id,
    companyName: a.companyName,
    source: a.source,
    sourceUrl: a.sourceUrl ?? undefined,
    scores: {
      overall: a.overallScore,
      specificity: a.specificity,
      evidence: a.evidence,
      sentiment: a.sentiment,
      operational: a.operational,
    },
    claims: Array.isArray(a.claims) ? a.claims : [],
    strengths: Array.isArray(a.strengths) ? a.strengths : [],
    weaknesses: Array.isArray(a.weaknesses) ? a.weaknesses : [],
    summary: a.summary ?? '',
    ...(doc
      ? {
          document: {
            id: doc.id,
            filename: doc.filename,
            url: `/uploads/${String(doc.filePath ?? '').split('/').pop() ?? ''}`,
            mimeType: doc.mimeType,
          },
        }
      : {}),
  }
}
