'use client'

import { Leaf } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[linear-gradient(175deg,var(--charcoal)_0%,#12292A_45%,var(--forest-deep)_100%)] text-white/90">
      <div className="absolute inset-0 texture-grid opacity-60" />
      <div className="relative max-w-[76rem] mx-auto px-5 sm:px-8 lg:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 mb-14">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[7px] flex items-center justify-center bg-white/[0.07] border border-white/10">
                <Leaf className="w-[17px] h-[17px] text-eucalyptus" />
              </div>
              <span className="text-[1.0625rem] font-semibold tracking-[-0.015em]">GreenTrustLens</span>
            </div>
            <p className="text-sm text-eucalyptus/60 leading-[1.75] max-w-sm">
              AI-assisted sustainability research designed to evaluate the evidence, transparency, and public credibility behind brand claims.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="footer-heading">Product</h3>
            <ul className="space-y-3.5 text-sm">
              <li><a href="#" className="footer-link">How It Works</a></li>
              <li><a href="#" className="footer-link">What We Analyse</a></li>
              <li><a href="#" className="footer-link">Methodology</a></li>
              <li><a href="#" className="footer-link">Sample Report</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="footer-heading">Company</h3>
            <ul className="space-y-3.5 text-sm">
              <li><a href="#" className="footer-link">About</a></li>
              <li><a href="#" className="footer-link">Blog</a></li>
              <li><a href="#" className="footer-link">Contact</a></li>
              <li><a href="#" className="footer-link">Research</a></li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="footer-heading">Legal</h3>
            <ul className="space-y-3.5 text-sm">
              <li><a href="#" className="footer-link">Privacy</a></li>
              <li><a href="#" className="footer-link">Terms</a></li>
              <li><a href="#" className="footer-link">Disclaimer</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="rule-fade-dark" />
        <div className="pt-8">
          <p className="text-[0.8125rem] text-eucalyptus/45 text-center leading-relaxed">
            © 2024 GreenTrustLens. All rights reserved. | AI-assisted sustainability research tool.
          </p>
        </div>
      </div>
    </footer>
  )
}
