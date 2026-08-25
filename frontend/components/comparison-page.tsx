'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Loader2 } from 'lucide-react'
import { Button } from './ui/button'
import GreenTrustBadge from './green-trust-badge'
import { analyzeCompany, type AnalysisResult } from '@/lib/api'

interface ComparisonPageProps {
  companies: string[]
  userId?: string
  onBack: () => void
}

interface CompanyRow {
  name: string
  score: number
  specificity: number
  evidence: number
  sentiment: number
  operational: number
}

export default function ComparisonPage({ companies, userId, onBack }: ComparisonPageProps) {
  const [rows, setRows] = useState<CompanyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (companies.length === 0) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    Promise.all(
      companies.map((name) =>
        analyzeCompany(name, userId).then(
          (r: AnalysisResult): CompanyRow => ({
            name: r.companyName,
            score: r.scores.overall,
            specificity: r.scores.specificity,
            evidence: r.scores.evidence,
            sentiment: r.scores.sentiment,
            operational: r.scores.operational,
          }),
        ),
      ),
    )
      .then((results) => {
        if (!cancelled) setRows(results)
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Could not load comparison data.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [companies, userId])

  if (companies.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">No Companies Selected</h2>
          <p className="text-foreground/70 mb-6">
            Go back to search and select companies to compare
          </p>
          <Button onClick={onBack} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-foreground/70">Analyzing {companies.length} companies…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-4">Comparison Failed</h2>
          <p className="text-foreground/70 mb-6">{error}</p>
          <Button onClick={onBack} className="bg-primary text-primary-foreground hover:bg-primary/90">
            Back to Search
          </Button>
        </div>
      </div>
    )
  }

  const comparisonChartData = [
    { metric: 'Overall Score', ...Object.fromEntries(rows.map((c) => [c.name, c.score])) },
    { metric: 'Specificity', ...Object.fromEntries(rows.map((c) => [c.name, c.specificity])) },
    { metric: 'Evidence', ...Object.fromEntries(rows.map((c) => [c.name, c.evidence])) },
    { metric: 'Sentiment', ...Object.fromEntries(rows.map((c) => [c.name, c.sentiment])) },
    { metric: 'Operational', ...Object.fromEntries(rows.map((c) => [c.name, c.operational])) },
  ]

  const colors = ['#1B4332', '#74C69D', '#52b788']

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">Company Comparison</h1>
          <div className="w-24" />
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {rows.map((company) => (
            <div key={company.name} className="bg-card border border-border rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">{company.name}</h3>
              <div className="flex flex-col items-center mb-6">
                <GreenTrustBadge score={company.score} size="medium" />
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-foreground/70">Specificity</span>
                  <span className="font-semibold text-primary">{company.specificity}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Evidence</span>
                  <span className="font-semibold text-primary">{company.evidence}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Sentiment</span>
                  <span className="font-semibold text-primary">{company.sentiment}/100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foreground/70">Operational</span>
                  <span className="font-semibold text-primary">{company.operational}/100</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Chart */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Metric Comparison</h3>
          <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" />
                <XAxis dataKey="metric" stroke="#666" />
                <YAxis stroke="#666" domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e8ddd5',
                    borderRadius: '8px',
                  }}
                  formatter={(value) => `${value}/100`}
                />
                <Legend />
                {rows.map((company, idx) => (
                  <Bar
                    key={company.name}
                    dataKey={company.name}
                    fill={colors[idx % colors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-card border border-border rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-foreground mb-4">Detailed Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-3 font-semibold text-foreground">Metric</th>
                  {rows.map((company) => (
                    <th key={company.name} className="text-center py-3 px-3 font-semibold text-foreground">
                      {company.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: 'Overall Score', key: 'score' },
                  { label: 'Specificity', key: 'specificity' },
                  { label: 'Evidence Backing', key: 'evidence' },
                  { label: 'Public Sentiment', key: 'sentiment' },
                  { label: 'Operational Proof', key: 'operational' },
                ].map((metric) => (
                  <tr key={metric.key} className="border-b border-border/50 hover:bg-background/50">
                    <td className="py-3 px-3 font-medium text-foreground">{metric.label}</td>
                    {rows.map((company) => (
                      <td key={company.name} className="text-center py-3 px-3 text-primary font-semibold">
                        {company[metric.key as keyof CompanyRow]}/100
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
