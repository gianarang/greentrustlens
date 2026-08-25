'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

interface AnimatedGaugeProps {
  score: number
  size?: number
}

export function AnimatedGauge({ score, size = 200 }: AnimatedGaugeProps) {
  const [displayScore, setDisplayScore] = useState(0)
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference

  useEffect(() => {
    let interval: NodeJS.Timeout
    const increment = score / 30

    interval = setInterval(() => {
      setDisplayScore((prev) => {
        if (prev >= score) return score
        return Math.floor(prev + increment)
      })
    }, 30)

    return () => clearInterval(interval)
  }, [score])

  const getColor = (value: number) => {
    if (value >= 75) return '#52b788'
    if (value >= 50) return '#FFB84D'
    return '#FF6B6B'
  }

  const color = getColor(displayScore)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Animated glow behind */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${color}20 0%, transparent 70%)`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* SVG Gauge */}
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
        />
        {/* Gradient defs */}
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Animated progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r="45"
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2.5, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center content */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <motion.div
          className="text-4xl font-bold"
          style={{ color }}
        >
          {displayScore}
        </motion.div>
        <div className="text-xs text-foreground/60 mt-1">/ 100</div>
      </motion.div>
    </div>
  )
}
