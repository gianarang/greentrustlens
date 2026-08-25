'use client'

import { motion } from 'framer-motion'
import { Badge as BadgeComp } from './ui/badge'
import { containerVariants, fadeInUp } from '@/lib/animations'
import type { Claim } from '@/lib/api'

interface ClaimsDetectorProps {
  claims: Claim[]
}

const TYPE_META: Record<Claim['type'], { label: string; className: string }> = {
  verified: { label: 'Verified', className: 'bg-green-100 text-green-800 border-green-300' },
  unverified: { label: 'Unverified', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  misleading: { label: 'Misleading', className: 'bg-red-100 text-red-800 border-red-300' },
}

export default function ClaimsDetector({ claims }: ClaimsDetectorProps) {
  return (
    <motion.div className="card-glass rounded-xl" variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
      <h3 className="text-lg font-semibold text-foreground mb-4">Claims Detected</h3>
      {claims.length === 0 ? (
        <p className="text-sm text-foreground/60">No specific claims were extracted from this source.</p>
      ) : (
        <motion.div className="space-y-3" variants={containerVariants} initial="hidden" animate="visible">
          {claims.map((claim, idx) => {
            const meta = TYPE_META[claim.type] ?? TYPE_META.unverified
            return (
              <motion.div
                key={idx}
                className="flex items-start gap-3 bg-white/5 rounded-lg p-3 border border-white/10 hover:border-white/20"
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <div className="flex-1">
                  <p className="text-sm text-foreground mb-2">{claim.text}</p>
                  <div className="flex items-center gap-2">
                    <BadgeComp className={`text-xs font-medium border ${meta.className}`}>
                      {meta.label}
                    </BadgeComp>
                    <span className="text-xs text-foreground/50">{claim.confidence}% confidence</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
