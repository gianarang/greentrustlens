'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, Link as LinkIcon, Search, Loader2, X, GitCompare, Clock, FileText } from 'lucide-react'
import { Button } from './ui/button'
import { containerVariants, fadeInUp } from '@/lib/animations'
import { ScrollReveal } from './scroll-reveal'
import { listAnalyses, type AnalysisSummary } from '@/lib/api'
import type { AnalyzeInput } from '@/app/page'

interface SearchPageProps {
  onAnalyze: (input: AnalyzeInput) => Promise<void>
  onOpenAnalysis: (id: string) => Promise<void>
  onCompare: (company: string) => void
  selectedCompanies: string[]
  onViewComparison: () => void
  userId?: string
}

const scoreColor = (score: number) =>
  score >= 75 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'

const SOURCE_LABEL: Record<string, string> = {
  search: 'Company search',
  url: 'URL',
  upload: 'Document',
}

const SAMPLE_COMPANIES = [
  'Patagonia',
  'Shell',
  'Tesla',
  'Nestlé',
  'Unilever',
  'ExxonMobil',
]

export default function SearchPage({
  onAnalyze,
  onOpenAnalysis,
  onCompare,
  selectedCompanies,
  onViewComparison,
  userId,
}: SearchPageProps) {
  const [activeTab, setActiveTab] = useState<'search' | 'upload' | 'url'>('search')
  const [searchTerm, setSearchTerm] = useState('')

  // Previously analyzed companies, loaded from the backend.
  const [recent, setRecent] = useState<AnalysisSummary[]>([])
  const [recentLoading, setRecentLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setRecentLoading(true)
    listAnalyses(userId)
      .then((list) => {
        if (!cancelled) setRecent(list)
      })
      .catch(() => {
        if (!cancelled) setRecent([])
      })
      .finally(() => {
        if (!cancelled) setRecentLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  // upload tab
  const [file, setFile] = useState<File | null>(null)
  const [uploadCompany, setUploadCompany] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // url tab
  const [url, setUrl] = useState('')
  const [urlCompany, setUrlCompany] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const runTask = async (task: () => Promise<void>, failMessage: string) => {
    setError('')
    setLoading(true)
    try {
      await task()
    } catch (err: any) {
      setError(err?.message || failMessage)
    } finally {
      setLoading(false)
    }
  }

  const run = (input: AnalyzeInput) =>
    runTask(() => onAnalyze(input), 'Analysis failed. Please try again.')

  const handleSearchAnalyze = (company: string) => {
    const name = company.trim()
    if (!name) return
    run({ mode: 'search', companyName: name })
  }

  const handleOpen = (id: string) =>
    runTask(() => onOpenAnalysis(id), 'Could not open that analysis.')

  const handleUploadAnalyze = () => {
    if (!file) {
      setError('Please choose a file to upload.')
      return
    }
    run({ mode: 'upload', file, companyName: uploadCompany.trim() || file.name })
  }

  const handleUrlAnalyze = () => {
    if (!url.trim()) {
      setError('Please paste a URL to analyze.')
      return
    }
    run({ mode: 'url', url: url.trim(), companyName: urlCompany.trim() || undefined })
  }

  const filteredCompanies = SAMPLE_COMPANIES.filter((c) =>
    c.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-bold gradient-heading mb-3">Analyze a Company</h1>
          <p className="text-foreground/70 font-medium">
            Search for a company, upload documents, or paste a URL to get started
          </p>
        </motion.div>

        {/* Compare bar */}
        {selectedCompanies.length > 0 && (
          <motion.div
            className="flex flex-wrap items-center gap-3 mb-6 p-4 rounded-lg bg-card border border-border"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-sm font-medium text-foreground/70">Comparing:</span>
            {selectedCompanies.map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-secondary/20 text-sm font-medium text-foreground">
                {c}
                <button onClick={() => onCompare(c)} className="hover:text-destructive" aria-label={`Remove ${c}`}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <Button
              size="sm"
              onClick={onViewComparison}
              disabled={selectedCompanies.length < 2}
              className="ml-auto bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              <GitCompare className="w-4 h-4 mr-2" />
              Compare ({selectedCompanies.length})
            </Button>
          </motion.div>
        )}

        {/* Tabs */}
        <motion.div className="flex gap-2 mb-8 border-b-2 border-white/10" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          {[
            { id: 'search', label: 'Search Company', icon: Search },
            { id: 'upload', label: 'Upload Documents', icon: Upload },
            { id: 'url', label: 'Paste URL', icon: LinkIcon },
          ].map(({ id, label, icon: Icon }) => (
            <motion.button
              key={id}
              onClick={() => {
                setActiveTab(id as any)
                setError('')
              }}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all duration-300 border-b-2 relative group ${
                activeTab === id
                  ? 'text-primary border-primary glow-effect'
                  : 'text-foreground/60 border-transparent hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
              {activeTab === id && (
                <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 rounded" initial={false} transition={{ type: 'spring', stiffness: 300 }} />
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Loading overlay */}
        {loading && (
          <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-primary/5 border border-primary/20 text-primary">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Running greenwashing analysis… this can take a few seconds.</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'search' && (
            <div>
              <div className="relative mb-6 flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-foreground/50" />
                  <input
                    type="text"
                    placeholder="Enter a company name (e.g. Patagonia)…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchAnalyze(searchTerm)}
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
                  />
                </div>
                <Button
                  onClick={() => handleSearchAnalyze(searchTerm)}
                  disabled={loading || !searchTerm.trim()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  Analyze
                </Button>
              </div>

              {/* Recently analyzed (from the backend) */}
              {recentLoading ? (
                <div className="flex items-center gap-2 text-sm text-foreground/50 mb-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading your recent analyses…
                </div>
              ) : recent.length > 0 ? (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-4 h-4 text-foreground/60" />
                    <h2 className="text-sm font-semibold text-foreground/80">Recently Analyzed</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recent.map((a) => {
                      const selected = selectedCompanies.includes(a.companyName)
                      return (
                        <div key={a.id} className="card-premium p-6 relative overflow-hidden">
                          <div className="space-y-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="font-bold text-lg text-primary mb-1 truncate">{a.companyName}</h3>
                                <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium flex items-center gap-1">
                                  {a.source === 'upload' && <FileText className="w-3 h-3" />}
                                  {a.source === 'url' && <LinkIcon className="w-3 h-3" />}
                                  {a.source === 'search' && <Search className="w-3 h-3" />}
                                  {SOURCE_LABEL[a.source] ?? a.source}
                                  {' · '}
                                  {new Date(a.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className={`text-2xl font-bold ${scoreColor(a.overallScore)}`}>{a.overallScore}</p>
                                <p className="text-[10px] text-muted-foreground">/ 100</p>
                              </div>
                            </div>

                            <p className="text-xs text-foreground/60 line-clamp-2">{a.summary}</p>

                            <div className="flex gap-2 pt-2">
                              <Button
                                variant="default"
                                size="sm"
                                disabled={loading}
                                onClick={() => handleOpen(a.id)}
                                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                              >
                                View Report
                              </Button>
                              <button
                                onClick={() => onCompare(a.companyName)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                  selected
                                    ? 'bg-secondary text-white'
                                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                                }`}
                              >
                                {selected ? '✓ Added' : '+ Compare'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : null}

              <p className="text-sm text-foreground/60 mb-4">Or try one of these:</p>

              <ScrollReveal direction="up" delay={0.2}>
                <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-4" variants={containerVariants} initial="hidden" animate="visible">
                  {filteredCompanies.map((company) => {
                    const selected = selectedCompanies.includes(company)
                    return (
                      <motion.div
                        key={company}
                        className="card-premium p-6 relative overflow-hidden group"
                        variants={fadeInUp}
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                      >
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-bold text-lg text-primary mb-1">{company}</h3>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">Public company</p>
                          </div>

                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                            <div className="w-2 h-2 bg-accent rounded-full" />
                            <span className="text-xs font-medium text-muted-foreground">AI analysis available</span>
                          </div>

                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="default"
                              size="sm"
                              disabled={loading}
                              onClick={() => handleSearchAnalyze(company)}
                              className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            >
                              Analyze
                            </Button>
                            <button
                              onClick={() => onCompare(company)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                                selected
                                  ? 'bg-secondary text-white'
                                  : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80'
                              }`}
                            >
                              {selected ? '✓ Added' : '+ Compare'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </motion.div>
              </ScrollReveal>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name <span className="text-foreground/40">(optional)</span>
                </label>
                <input
                  type="text"
                  value={uploadCompany}
                  onChange={(e) => setUploadCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-card border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
                />
              </div>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,image/*"
                onChange={(e) => {
                  setError('')
                  setFile(e.target.files?.[0] ?? null)
                }}
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-card/50"
              >
                <Upload className="w-12 h-12 text-foreground/50 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  {file ? file.name : 'Upload Sustainability Documents'}
                </h3>
                <p className="text-sm text-foreground/60 mb-4">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB — click to choose a different file`
                    : 'PDF, DOC, DOCX, TXT, or image files (max 20 MB)'}
                </p>
                <Button variant="outline" size="sm" type="button">
                  Choose File
                </Button>
              </div>

              <Button
                onClick={handleUploadAnalyze}
                disabled={loading || !file}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? 'Analyzing…' : 'Analyze Document'}
              </Button>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Name <span className="text-foreground/40">(optional)</span>
                </label>
                <input
                  type="text"
                  value={urlCompany}
                  onChange={(e) => setUrlCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Company Website or Report URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUrlAnalyze()}
                    placeholder="https://example.com/sustainability-report"
                    className="flex-1 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:border-primary text-foreground"
                  />
                  <Button
                    onClick={handleUrlAnalyze}
                    disabled={loading || !url.trim()}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                  >
                    Analyze
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
