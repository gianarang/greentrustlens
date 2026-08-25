'use client'

import { motion } from 'framer-motion'
import { containerVariants, fadeInUp } from '@/lib/animations'
import type { AnalysisScores } from '@/lib/api'

interface ScoreBreakdownProps {
  scores: AnalysisScores
}

export default function ScoreBreakdown({ scores }: ScoreBreakdownProps) {
  const subscores = [
    { label: 'Specificity', value: scores.specificity },
    { label: 'Evidence Backing', value: scores.evidence },
    { label: 'Public Sentiment', value: scores.sentiment },
    { label: 'Operational Proof', value: scores.operational },
  ]

  return (
    <motion.div className="card-glass rounded-xl" variants={fadeInUp} initial="hidden" animate="visible">
      <h3 className="text-lg font-semibold text-foreground mb-6">Score Breakdown</h3>
      <motion.div className="space-y-5" variants={containerVariants} initial="hidden" animate="visible">
        {subscores.map((item, index) => (
          <motion.div key={item.label} variants={fadeInUp}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">{item.label}</label>
              <span className="text-sm font-semibold text-primary">{Math.min(100, item.value)}/100</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-secondary"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, item.value)}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div className="mt-6 pt-6 border-t border-white/20" variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
        <div className="text-xs text-foreground/60 space-y-2">
          <p>
            <strong>Specificity:</strong> How concrete and measurable the claims are.
          </p>
          <p>
            <strong>Evidence:</strong> Availability of third-party verification.
          </p>
          <p>
            <strong>Sentiment:</strong> Public perception alignment with claims.
          </p>
          <p>
            <strong>Operational:</strong> Real-world implementation proof.
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
