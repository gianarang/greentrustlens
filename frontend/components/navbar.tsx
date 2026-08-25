'use client'

import { useState, useEffect } from 'react'
import { Leaf, LogOut } from 'lucide-react'
import { Button } from './ui/button'

interface NavbarProps {
  currentPage: string
  onNavigate: (page: string) => void
  isAuthenticated?: boolean
  onSignOut?: () => void
}

export default function Navbar({ currentPage, onNavigate, isAuthenticated = false, onSignOut }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hide navbar on sign-in page
  if (currentPage === 'signin') {
    return null
  }
  const navItems = [
    { id: 'landing', label: 'How It Works' },
    { id: 'search', label: 'What We Analyse' },
    { id: 'comparison', label: 'Methodology' },
  ]

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-[rgba(247,246,241,0.82)] backdrop-blur-xl border-b border-border/80 shadow-[0_1px_24px_-16px_rgba(16,63,54,0.45)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[76rem] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer group" onClick={() => onNavigate('landing')}>
            <div className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-[linear-gradient(150deg,#1A5748_0%,#103F36_100%)] shadow-[0_2px_8px_-3px_rgba(16,63,54,0.6)] transition-transform duration-300 group-hover:scale-[1.05]">
              <Leaf className="w-[17px] h-[17px] text-eucalyptus" />
            </div>
            <div className="hidden sm:flex items-baseline gap-0.5 tracking-[-0.015em]">
              <h1 className="text-[1.0625rem] font-semibold text-forest">GreenTrust</h1>
              <h1 className="text-[1.0625rem] font-semibold text-emerald">Lens</h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-9">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                data-active={currentPage === item.id}
                className="nav-link"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-2 sm:gap-4">
                <button
                  onClick={() => onNavigate('search')}
                  className="btn-primary !px-5 !py-2.5 !text-[0.8125rem]"
                >
                  Analyse a Brand
                </button>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 px-2 py-2 text-sm font-medium text-slate-muted hover:text-forest transition-colors duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('signin')}
                className="btn-primary !px-5 !py-2.5 !text-[0.8125rem]"
              >
                Analyse a Brand
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
