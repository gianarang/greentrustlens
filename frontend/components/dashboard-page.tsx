'use client'

import { motion } from 'framer-motion'
import { CheckCircle, AlertCircle, Download, FileText, Link as LinkIcon, Search } from 'lucide-react'
import { Button } from './ui/button'
import GreenTrustBadge from './green-trust-badge'
import ScoreBreakdown from './score-breakdown'
import ClaimsDetector from './claims-detector'
import SentimentChart from './sentiment-chart'
import { ScrollReveal } from './scroll-reveal'
import { apiUrl, type AnalysisResult } from '@/lib/api'

interface DashboardPageProps {
  data: AnalysisResult
  onBack: () => void
}

const SOURCE_META = {
  search: { label: 'AI knowledge search', icon: Search },
  url: { label: 'Website / report URL', icon: LinkIcon },
  upload: { label: 'Uploaded document', icon: FileText },
} as const

export default function DashboardPage({ data, onBack }: DashboardPageProps) {
  const SourceIcon = SOURCE_META[data.source]?.icon ?? Search

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const href = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = href
    a.download = `greentrustlens-${data.companyName.replace(/\s+/g, '-').toLowerCase()}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(href)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Analysis Report</h1>
          <Button className="bg-secondary text-primary hover:bg-secondary/90" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Company Header */}
        <motion.div
          className="card-premium p-8 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="text-4xl font-bold gradient-heading mb-2">{data.companyName}</h2>
              <p className="text-foreground/70 font-medium mb-3">Comprehensive sustainability analysis</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/50 rounded-full">
                <SourceIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  {SOURCE_META[data.source]?.label ?? data.source}
                </span>
              </div>
              {data.sourceUrl && (
                <a
                  href={data.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-2 text-xs text-primary hover:underline break-all"
                >
                  {data.sourceUrl}
                </a>
              )}
            </div>
            <GreenTrustBadge score={data.scores.overall} size="large" />
          </div>

          {/* Summary */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-foreground/80 leading-relaxed">{data.summary}</p>
          </div>
        </motion.div>

        {/* Main Grid */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Score Breakdown */}
          <ScrollReveal direction="left" delay={0.1}>
            <ScoreBreakdown scores={data.scores} />
          </ScrollReveal>

          {/* Right Column - Charts and Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Claims Section */}
            <ScrollReveal direction="right" delay={0.2}>
              <ClaimsDetector claims={data.claims} />
            </ScrollReveal>

            {/* Score Dimensions Chart */}
            <ScrollReveal direction="up" delay={0.3}>
              <SentimentChart scores={data.scores} />
            </ScrollReveal>
          </div>
        </motion.div>

        {/* Strengths and Weaknesses */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <ScrollReveal direction="left" delay={0.3}>
            <div className="card-premium">
              <div className="flex items-center gap-2 mb-6">
                <motion.div whileHover={{ scale: 1.1 }} className="p-2 bg-gradient-to-br from-green-500/20 to-accent/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </motion.div>
                <h3 className="text-lg font-semibold gradient-heading">What Strengthened This Score</h3>
              </div>
              <ul className="space-y-3">
                {data.strengths.length === 0 ? (
                  <li className="text-sm text-foreground/60">No notable strengths identified.</li>
                ) : (
                  data.strengths.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.4}>
            <div className="card-premium">
              <div className="flex items-center gap-2 mb-6">
                <motion.div whileHover={{ scale: 1.1 }} className="p-2 bg-gradient-to-br from-red-500/20 to-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </motion.div>
                <h3 className="text-lg font-semibold gradient-heading">What Weakened This Score</h3>
              </div>
              <ul className="space-y-3">
                {data.weaknesses.length === 0 ? (
                  <li className="text-sm text-foreground/60">No notable weaknesses identified.</li>
                ) : (
                  data.weaknesses.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-foreground/80">
                      <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </ScrollReveal>
        </motion.div>

        {/* Uploaded document link */}
        {data.document && (
          <ScrollReveal direction="up" delay={0.5}>
            <div className="card-premium">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold gradient-heading">Source Document</h3>
                  <a
                    href={apiUrl(data.document.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    {data.document.filename}
                  </a>
                </div>
              </div>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  )
}
