'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface GreenTrustBadgeProps {
  score: number
  size?: 'small' | 'medium' | 'large'
  animate?: boolean
}

export default function GreenTrustBadge({ score, size = 'medium', animate = true }: GreenTrustBadgeProps) {
  const [displayScore, setDisplayScore] = useState(animate ? 0 : score)
  const getColor = (score: number) => {
    if (score >= 75) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getBgColor = (score: number) => {
    if (score >= 75) return 'bg-green-50 border-green-200'
    if (score >= 50) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  const sizeClasses = {
    small: 'w-16 h-16 text-sm',
    medium: 'w-24 h-24 text-lg',
    large: 'w-32 h-32 text-3xl',
  }

  const ringClass = {
    small: 'w-14 h-14',
    medium: 'w-20 h-20',
    large: 'w-28 h-28',
  }

  const labelSize = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base',
  }

  useEffect(() => {
    if (!animate) return
    let interval: NodeJS.Timeout
    const increment = score / 30
    let current = 0

    interval = setInterval(() => {
      current += increment
      if (current >= score) {
        setDisplayScore(score)
        clearInterval(interval)
      } else {
        setDisplayScore(Math.floor(current))
      }
    }, 30)

    return () => clearInterval(interval)
  }, [score, animate])

  return (
    <motion.div
      className="flex flex-col items-center gap-3"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${sizeClasses[size]} ${getBgColor(displayScore)} border rounded-full flex items-center justify-center shadow-lg`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        <div className="flex flex-col items-center">
          <motion.span className={`font-bold ${getColor(displayScore)}`}>
            {displayScore}
          </motion.span>
          <span className={`text-foreground/60 ${labelSize[size]}`}>/ 100</span>
        </div>
      </motion.div>
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="font-semibold text-foreground">Green Trust Score</p>
        <p className="text-sm text-foreground/70">
          {displayScore >= 75
            ? 'Strong Evidence'
            : displayScore >= 50
              ? 'Mixed Signals'
              : 'High Risk'}
        </p>
      </motion.div>
    </motion.div>
  )
}
