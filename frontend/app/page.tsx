'use client'

import { useState } from 'react'
import Navbar from '@/components/navbar'
import Footer from '@/components/footer'
import LandingPage from '@/components/landing-page'
import SearchPage from '@/components/search-page'
import DashboardPage from '@/components/dashboard-page'
import ComparisonPage from '@/components/comparison-page'
import SignInPage from '@/components/signin-page'
import {
  analyzeCompany,
  analyzeUrl,
  uploadDocument,
  getAnalysis,
  type AnalysisResult,
} from '@/lib/api'

export type AnalyzeInput =
  | { mode: 'search'; companyName: string }
  | { mode: 'url'; url: string; companyName?: string }
  | { mode: 'upload'; file: File; companyName: string }

export default function Page() {
  const [currentPage, setCurrentPage] = useState('landing')
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([])
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | undefined>(undefined)

  const handleNavigate = (page: string) => {
    setCurrentPage(page)
  }

  const handleSignIn = (id: string) => {
    setUserId(id)
    setIsAuthenticated(true)
    setCurrentPage('search')
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setUserId(undefined)
    setCurrentPage('landing')
  }

  // Runs the real backend analysis. Throws on failure so the calling page can
  // surface the error inline; navigates to the dashboard on success.
  const handleAnalyze = async (input: AnalyzeInput) => {
    let result: AnalysisResult
    if (input.mode === 'search') {
      result = await analyzeCompany(input.companyName, userId)
    } else if (input.mode === 'url') {
      result = await analyzeUrl(input.url, input.companyName, userId)
    } else {
      result = await uploadDocument({ file: input.file, companyName: input.companyName, userId })
    }
    setAnalysisData(result)
    setCurrentPage('dashboard')
  }

  // Opens a previously stored analysis (no LLM re-run). Throws on failure so the
  // caller can surface the error inline.
  const handleOpenAnalysis = async (id: string) => {
    const result = await getAnalysis(id)
    setAnalysisData(result)
    setCurrentPage('dashboard')
  }

  const handleCompanySelect = (company: string) => {
    setSelectedCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : prev.length < 3
          ? [...prev, company]
          : prev,
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} isAuthenticated={isAuthenticated} onSignOut={handleSignOut} />
      <main className={currentPage === 'signin' ? 'pt-0' : 'pt-20'}>
        {currentPage === 'signin' && (
          <SignInPage onSignIn={handleSignIn} onNavigate={handleNavigate} />
        )}
        {currentPage === 'landing' && (
          <LandingPage onAnalyze={() => handleNavigate('search')} />
        )}
        {currentPage === 'search' && (
          <SearchPage
            onAnalyze={handleAnalyze}
            onOpenAnalysis={handleOpenAnalysis}
            onCompare={handleCompanySelect}
            selectedCompanies={selectedCompanies}
            onViewComparison={() => handleNavigate('comparison')}
            userId={userId}
          />
        )}
        {currentPage === 'dashboard' && analysisData && (
          <DashboardPage data={analysisData} onBack={() => handleNavigate('search')} />
        )}
        {currentPage === 'comparison' && (
          <ComparisonPage
            companies={selectedCompanies}
            userId={userId}
            onBack={() => handleNavigate('search')}
          />
        )}
      </main>
      {currentPage !== 'signin' && <Footer />}
    </div>
  )
}
