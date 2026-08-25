'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts'
import type { AnalysisScores } from '@/lib/api'

interface SentimentChartProps {
  scores: AnalysisScores
}

const barColor = (value: number) => {
  if (value >= 75) return '#74C69D'
  if (value >= 50) return '#f59e0b'
  return '#dc2626'
}

export default function SentimentChart({ scores }: SentimentChartProps) {
  const data = [
    { category: 'Overall', value: scores.overall },
    { category: 'Specificity', value: scores.specificity },
    { category: 'Evidence', value: scores.evidence },
    { category: 'Sentiment', value: scores.sentiment },
    { category: 'Operational', value: scores.operational },
  ]

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Score Dimensions</h3>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8ddd5" />
            <XAxis dataKey="category" stroke="#666" />
            <YAxis stroke="#666" domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e8ddd5',
                borderRadius: '8px',
              }}
              formatter={(value) => `${value}/100`}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.category} fill={barColor(entry.value)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-xs text-foreground/60 mt-4">
        Lower scores on Evidence and Operational proof relative to marketing tone indicate higher greenwashing risk.
      </p>
    </div>
  )
}
