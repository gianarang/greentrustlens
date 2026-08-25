'use client'

export function GradientBlobBg() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Primary blob - top left */}
      <div
        className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-accent/30 to-primary/20 rounded-full blur-3xl opacity-40 animate-pulse"
        style={{ animationDuration: '8s' }}
      />
      {/* Secondary blob - top right */}
      <div
        className="absolute -top-60 -right-40 w-96 h-96 bg-gradient-to-bl from-accent/25 to-secondary/15 rounded-full blur-3xl opacity-30 animate-pulse"
        style={{ animationDuration: '10s', animationDelay: '1s' }}
      />
      {/* Tertiary blob - bottom center */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-t from-primary/15 to-accent/20 rounded-full blur-3xl opacity-25 animate-pulse"
        style={{ animationDuration: '12s', animationDelay: '2s' }}
      />
    </div>
  )
}

export function GradientBlobSection() {
  return (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div
          className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-accent/25 to-transparent rounded-full blur-2xl opacity-40"
          style={{ animation: 'float 6s ease-in-out infinite' }}
        />
        <div
          className="absolute -bottom-20 -left-20 w-72 h-72 bg-gradient-to-tl from-primary/20 to-transparent rounded-full blur-2xl opacity-30"
          style={{ animation: 'float 8s ease-in-out infinite reverse' }}
        />
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
      `}</style>
    </>
  )
}
