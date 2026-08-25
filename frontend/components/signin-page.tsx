'use client'

import { useState } from 'react'
import { Eye, EyeOff, Leaf } from 'lucide-react'
import { Button } from './ui/button'
import { signIn } from '@/lib/api'

interface SignInPageProps {
  onSignIn: (userId: string) => void
  onNavigate: (page: string) => void
}

export default function SignInPage({ onSignIn, onNavigate }: SignInPageProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || (isSignUp && !name)) {
      setError('Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      const result = await signIn({
        email: email.trim(),
        password,
        ...(isSignUp ? { name: name.trim() } : {}),
      })
      onSignIn(result.id)
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-primary">GreenTrustLens</h1>
          </div>

          {/* Card */}
          <div className="bg-card rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {isSignUp ? 'Create Your Account' : 'Welcome Back'}
            </h2>
            <p className="text-foreground/60 text-sm mb-6">
              {isSignUp
                ? 'Sign up to start analyzing sustainability claims'
                : 'Sign in to continue analyzing sustainability claims'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name Input (sign up only) */}
              {isSignUp && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              )}

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/60 hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm dark:bg-red-900/20 dark:text-red-400">{error}</div>}

              {/* Remember Me & Forgot Password */}
              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-border accent-primary" />
                    <span className="text-sm text-foreground/70">Remember me</span>
                  </label>
                  <button type="button" className="text-sm text-primary hover:text-primary/80 transition-colors font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-10 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : isSignUp ? 'Sign Up' : 'Sign In'}
              </Button>
            </form>

            {/* Toggle Sign In / Sign Up */}
            <p className="text-center text-sm text-foreground/60 mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                className="text-primary hover:text-primary/80 transition-colors font-medium"
                onClick={() => {
                  setError('')
                  setMode(isSignUp ? 'signin' : 'signup')
                }}
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>

          {/* Back to Home */}
          <button
            onClick={() => onNavigate('landing')}
            className="mt-6 w-full text-center text-sm text-foreground/60 hover:text-foreground transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  )
}
