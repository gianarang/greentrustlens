'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check } from 'lucide-react'
import { ScrollReveal } from './scroll-reveal'

interface LandingPageProps {
  onAnalyze: () => void
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const inViewProps = {
  variants: staggerContainer,
  initial: 'hidden' as const,
  whileInView: 'visible' as const,
  viewport: { once: true, amount: 0.2 },
}

export default function LandingPage({ onAnalyze }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden bg-ivory-sage pt-20 pb-28 sm:pt-24 sm:pb-32 lg:pt-28 lg:pb-40 px-5 sm:px-8 lg:px-10">
        {/* Faint data-grid texture */}
        <div className="absolute inset-0 texture-grid-light opacity-70 [mask-image:radial-gradient(80%_60%_at_50%_35%,black,transparent)]" />

        <div className="relative max-w-[76rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_0.95fr] gap-16 lg:gap-20 items-center">
            {/* Left: Text Content */}
            <motion.div
              className="space-y-7"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12 },
                },
              }}
            >
              <motion.div variants={fadeInUp}>
                <p className="eyebrow">AI-Powered Sustainability Intelligence</p>
              </motion.div>

              <motion.h1
                className="font-display text-[2.75rem] sm:text-[3.5rem] lg:text-[4.25rem] text-forest-deep"
                variants={fadeInUp}
              >
                See beyond{' '}
                <span className="relative whitespace-nowrap">
                  <span className="text-emphasis">sustainability claims.</span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-[10px] text-sage/70"
                    viewBox="0 0 300 10"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M1 7.5C60 3 120 2.2 180 4.2C222 5.6 265 7 299 5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </motion.h1>

              <motion.p
                className="text-[1.0625rem] text-slate-muted leading-[1.75] measure pt-1"
                variants={fadeInUp}
              >
                GreenTrustLens evaluates whether a brand's environmental and ethical claims are supported by measurable evidence, transparent reporting, credible certifications, and public sentiment.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3.5 pt-3"
                variants={fadeInUp}
              >
                <button onClick={onAnalyze} className="btn-primary">
                  Analyse a Brand
                  <ArrowRight className="btn-arrow w-4 h-4" />
                </button>
                <button onClick={onAnalyze} className="btn-secondary">
                  Explore the Methodology
                </button>
              </motion.div>

              <motion.div className="pt-6" variants={fadeInUp}>
                <div className="rule-fade max-w-[22rem]" />
                <p className="text-[0.9375rem] text-slate-muted/90 italic pt-4 font-display tracking-normal leading-snug">
                  Built to distinguish verified progress from unsupported marketing.
                </p>
              </motion.div>
            </motion.div>

            {/* Right: Dashboard Preview */}
            <motion.div
              className="hidden lg:block relative glow-emerald"
              initial={{ opacity: 0, x: 32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="relative z-10 panel-analytics p-8">
                <div className="space-y-7">
                  {/* Score block — subtle tinted well */}
                  <div className="relative -mx-3 -mt-3 px-4 pt-4 pb-5 rounded-xl bg-[linear-gradient(155deg,rgba(238,243,239,0.9),rgba(238,243,239,0.25))]">
                    <p className="text-[0.6875rem] font-semibold text-slate-muted uppercase tracking-[0.16em] mb-3">
                      Overall Assessment
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="font-display text-[4rem] leading-[0.85] text-forest">72</span>
                      <span className="text-base text-slate-muted font-medium">/100</span>
                    </div>
                    <p className="inline-flex items-center gap-2 text-[0.8125rem] text-emerald font-semibold mt-4">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald" />
                      Moderately Supported
                    </p>
                  </div>

                  <div className="rule-fade" />

                  <div className="space-y-[1.125rem]">
                    <MetricBar label="Evidence Quality" value={85} tone={0} />
                    <MetricBar label="Transparency" value={72} tone={1} />
                    <MetricBar label="Public Sentiment" value={68} tone={2} />
                    <MetricBar label="AI Confidence" value={81} tone={3} />
                  </div>

                  <div className="rule-fade" />

                  <div>
                    <p className="text-[0.6875rem] font-semibold text-slate-muted uppercase tracking-[0.16em] mb-3.5">
                      Key Findings
                    </p>
                    <div className="space-y-2.5">
                      {['Strong ESG reporting', 'Credible certifications'].map((finding) => (
                        <div key={finding} className="flex items-start gap-2.5">
                          <span className="mt-[3px] flex-shrink-0 w-[18px] h-[18px] rounded-full bg-eucalyptus/60 flex items-center justify-center">
                            <Check className="w-3 h-3 text-emerald" strokeWidth={3} />
                          </span>
                          <span className="text-sm text-charcoal leading-relaxed">{finding}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================ PROBLEM ============================ */}
      <section className="bg-stone-warm py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[76rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-14 lg:gap-20 items-start">
            {/* Left: Text */}
            <ScrollReveal direction="left" delay={0}>
              <div className="space-y-6">
                <p className="eyebrow">The Problem</p>
                <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep">
                  Sustainability language is everywhere. Evidence is not.
                </h2>
                <div className="space-y-5 pt-1">
                  <p className="text-[1.0625rem] text-slate-muted leading-[1.75] measure">
                    Terms such as "natural," "ethical," "carbon neutral," and "eco-friendly" are widely used across packaging, websites, and campaigns. Yet these claims are often presented without clear data, traceable sources, or consistent standards.
                  </p>
                  <p className="text-[1.0625rem] text-slate-muted leading-[1.75] measure">
                    GreenTrustLens helps users look beyond the language by examining the quality, credibility, and transparency of the evidence behind each claim.
                  </p>
                </div>

                {/* Editorial pull-quote */}
                <figure className="relative mt-10 pl-7">
                  <span className="absolute left-0 top-1 bottom-1 w-[2px] bg-[linear-gradient(180deg,var(--emerald),var(--sage),transparent)]" />
                  <p className="font-display italic text-[1.5rem] sm:text-[1.75rem] leading-[1.35] text-forest">
                    "A convincing claim is not the same as a verified claim."
                  </p>
                </figure>
              </div>
            </ScrollReveal>

            {/* Right: Visual Claims */}
            <ScrollReveal direction="right" delay={0.1}>
              <motion.div className="space-y-2" {...inViewProps}>
                <ClaimCard claim="Sustainably sourced" status="Verified" tone="verified" />
                <ClaimCard claim="Planet positive" status="Partially supported" tone="partial" />
                <ClaimCard claim="Ethically produced" status="Insufficient evidence" tone="insufficient" />
                <ClaimCard claim="Clean and natural" status="Verified" tone="verified" />
                <ClaimCard claim="Carbon conscious" status="Unclear methodology" tone="unclear" />
                <ClaimCard claim="Responsibly made" status="Partially supported" tone="partial" />
              </motion.div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= CORE VALUE PROPOSITION (DARK) ================= */}
      <section className="relative overflow-hidden bg-forest-depth text-white py-28 sm:py-32 lg:py-40 px-5 sm:px-8 lg:px-10">
        <div className="absolute inset-0 texture-grid opacity-90" />
        {/* Soft light bloom */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[54rem] h-[34rem] rounded-full bg-emerald/20 blur-[120px] pointer-events-none" />

        <div className="relative max-w-[72rem] mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center max-w-[46rem] mx-auto mb-20 lg:mb-24">
              <h2 className="font-display text-[2.25rem] sm:text-[2.875rem] lg:text-[3.5rem] text-white mb-7">
                One score. Multiple layers of evidence.
              </h2>
              <p className="text-[1.0625rem] lg:text-lg text-eucalyptus/85 leading-[1.75] max-w-[42rem] mx-auto">
                GreenTrustLens combines company disclosures, certifications, supply-chain information, public reporting, media coverage, and consumer sentiment to produce a more complete view of brand credibility.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-10 lg:gap-x-0"
            {...inViewProps}
          >
            <ValuePropositionCard
              index="01"
              title="Evidence"
              description="Evaluates whether claims are supported by measurable data, published reports, and traceable sources."
            />
            <ValuePropositionCard
              index="02"
              title="Transparency"
              description="Examines how clearly the brand communicates its methodology, targets, limitations, and progress."
            />
            <ValuePropositionCard
              index="03"
              title="Public Sentiment"
              description="Analyses how consumers, journalists, and public sources respond to the brand's sustainability practices."
            />
            <ValuePropositionCard
              index="04"
              title="Operational Alignment"
              description="Assesses whether the company's reported commitments appear consistent with its products, supply chain, and wider business activity."
            />
          </motion.div>
        </div>
      </section>

      {/* ========================== HOW IT WORKS ========================== */}
      <section className="bg-mint-fade py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[68rem] mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div className="text-center max-w-[44rem] mx-auto mb-20">
              <p className="eyebrow eyebrow-center mb-6">The Analysis Process</p>
              <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep mb-6">
                From brand claims to a structured trust assessment.
              </h2>
              <p className="text-[1.0625rem] text-slate-muted leading-[1.75] max-w-[38rem] mx-auto">
                Each analysis moves through four stages designed to separate brand messaging from independently verifiable evidence.
              </p>
            </div>
          </ScrollReveal>

          {/* Timeline */}
          <motion.div className="relative max-w-[46rem] mx-auto" {...inViewProps}>
            {/* Connecting spine */}
            <div className="absolute left-[1.375rem] sm:left-[2.25rem] top-4 bottom-4 w-px bg-[linear-gradient(180deg,transparent,var(--eucalyptus)_12%,var(--eucalyptus)_88%,transparent)]" />

            <div className="space-y-2">
              <ProcessStep
                number="01"
                title="Submit the Brand"
                description="Enter a brand name, website, sustainability report, campaign page, or relevant public source."
              />
              <ProcessStep
                number="02"
                title="Analyse the Evidence"
                description="The platform identifies sustainability claims and examines the data, disclosures, certifications, and language supporting them."
              />
              <ProcessStep
                number="03"
                title="Cross-Check Credibility"
                description="Claims are compared with public reports, operational information, media coverage, consumer sentiment, and other available evidence."
              />
              <ProcessStep
                number="04"
                title="Generate the Green Trust Score"
                description="The results are organised into a transparent score with supporting evidence, confidence levels, strengths, and unresolved concerns."
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================= WHAT WE ANALYSE ========================= */}
      <section className="relative bg-[linear-gradient(180deg,#FFFFFF_0%,var(--ivory)_55%,var(--mint)_100%)] py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[72rem] mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div className="max-w-[44rem] mb-16 lg:mb-20">
              <p className="eyebrow mb-6">Evidence Sources</p>
              <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep mb-6">
                A broader view of sustainability credibility.
              </h2>
              <p className="text-[1.0625rem] text-slate-muted leading-[1.75] measure-wide">
                No single report, certification, or review can provide the full picture. GreenTrustLens analyses evidence across multiple sources to identify both alignment and contradiction.
              </p>
            </div>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            {...inViewProps}
          >
            <EvidenceCard
              index="01"
              title="Sustainability Reports"
              description="Published targets, progress data, emissions information, material use, and impact disclosures."
            />
            <EvidenceCard
              index="02"
              title="ESG Disclosures"
              description="Environmental, social, governance, and risk-related reporting available through company or public sources."
            />
            <EvidenceCard
              index="03"
              title="Certifications"
              description="Third-party standards, certification bodies, verification status, scope, and relevance."
            />
            <EvidenceCard
              index="04"
              title="Supply-Chain Information"
              description="Sourcing practices, production information, labour transparency, and supplier disclosures."
            />
            <EvidenceCard
              index="05"
              title="Consumer and Public Sentiment"
              description="Patterns across reviews, public discussions, complaints, and brand perception."
            />
            <EvidenceCard
              index="06"
              title="News and Independent Coverage"
              description="Reports, investigations, controversies, recognitions, and updates from external sources."
            />
          </motion.div>
        </div>
      </section>

      {/* ======================== GREEN TRUST SCORE ======================== */}
      <section className="bg-[linear-gradient(180deg,var(--mint)_0%,#FFFFFF_45%)] py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[76rem] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-14 lg:gap-20 items-center">
            {/* Left: Explanation */}
            <ScrollReveal direction="left" delay={0}>
              <div className="space-y-6">
                <p className="eyebrow">The Green Trust Score</p>
                <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep">
                  A score designed to be understood, not simply accepted.
                </h2>
                <p className="text-[1.0625rem] text-slate-muted leading-[1.75] measure">
                  The Green Trust Score summarises the strength of the available evidence while retaining the detail behind the result. Users can view how each component contributes to the final assessment and where uncertainty remains.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 pt-4 max-w-lg">
                  <ScoreComponent label="Evidence Quality" tone={0} />
                  <ScoreComponent label="Transparency" tone={1} />
                  <ScoreComponent label="Public Sentiment" tone={2} />
                  <ScoreComponent label="Operational Alignment" tone={3} />
                </div>

                <div className="pt-6">
                  <div className="rule-fade max-w-[26rem]" />
                  <p className="text-sm text-slate-muted leading-relaxed pt-4 measure">
                    AI Confidence reflects the strength and completeness of the available information, not the sustainability score itself.
                  </p>
                </div>
              </div>
            </ScrollReveal>

            {/* Right: Score Visual */}
            <ScrollReveal direction="right" delay={0.1}>
              <div className="relative glow-emerald">
                <div className="relative z-10 panel-analytics p-8 sm:p-9">
                  <div className="space-y-7">
                    <div className="relative text-center -mx-4 -mt-4 px-4 pt-9 pb-7 rounded-xl bg-[linear-gradient(170deg,rgba(238,243,239,0.95),rgba(238,243,239,0.15))]">
                      <div className="font-display text-[4.5rem] leading-[0.85] text-forest">72</div>
                      <div className="text-sm text-slate-muted mt-3 font-medium">/100</div>
                    </div>

                    <div className="rule-fade" />

                    <div>
                      <p className="text-[0.6875rem] font-semibold text-slate-muted uppercase tracking-[0.16em] mb-3">
                        Status
                      </p>
                      <p className="inline-flex items-center gap-2.5 text-[1.0625rem] font-semibold text-forest mb-5">
                        <span className="w-2 h-2 rounded-full bg-emerald shadow-[0_0_0_4px_rgba(23,107,89,0.12)]" />
                        Moderately Supported
                      </p>

                      <p className="text-sm text-slate-muted leading-[1.7]">
                        The brand demonstrates credible reporting and generally positive public sentiment, but some product-level claims require clearer verification and more specific sourcing evidence.
                      </p>
                    </div>

                    <div className="rule-fade" />

                    <div className="space-y-0.5 text-sm">
                      <ScoreBand range="80–100:" label="Strongly Supported" active={false} />
                      <ScoreBand range="60–79:" label="Moderately Supported" active />
                      <ScoreBand range="40–59:" label="Limited Support" active={false} />
                      <ScoreBand range="0–39:" label="Weak or Insufficient Evidence" active={false} />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* =========================== METHODOLOGY =========================== */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#FFFFFF_0%,var(--mint)_35%,var(--eucalyptus)_100%)] py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="absolute inset-0 texture-grid-light opacity-60" />
        <div className="relative max-w-[52rem] mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <div className="space-y-10">
              <div>
                <p className="eyebrow mb-6">Methodology</p>
                <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep mb-7">
                  AI-assisted analysis with visible evidence and limitations.
                </h2>
                <p className="text-[1.0625rem] text-slate-muted leading-[1.75] measure-wide">
                  GreenTrustLens uses AI to organise, compare, and interpret publicly available information. It does not replace formal audits, legal verification, or independent certification. Every assessment should clearly distinguish between confirmed evidence, reasonable inference, and information that could not be verified.
                </p>
              </div>

              <div className="rule-fade" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-9">
                <MethodPrinciple
                  index="i"
                  title="Source Visibility"
                  description="Users should be able to see the information contributing to the analysis."
                />
                <MethodPrinciple
                  index="ii"
                  title="Confidence, Not Certainty"
                  description="Results should communicate uncertainty where evidence is incomplete, inconsistent, or outdated."
                />
                <MethodPrinciple
                  index="iii"
                  title="Evidence Over Language"
                  description="Scores should be shaped by the quality of supporting information, not by the confidence or popularity of a brand's messaging."
                />
              </div>

              <div className="rule-fade" />

              <p className="text-sm text-slate-muted italic leading-relaxed measure-wide">
                GreenTrustLens is an analytical research tool and should not be treated as a formal certification body or financial recommendation.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* =========================== WHO IT IS FOR =========================== */}
      <section className="bg-[linear-gradient(180deg,var(--eucalyptus)_0%,var(--mint)_18%,#FFFFFF_60%)] py-24 sm:py-28 lg:py-36 px-5 sm:px-8 lg:px-10">
        <div className="max-w-[72rem] mx-auto">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-[2.25rem] sm:text-[2.75rem] lg:text-[3.25rem] text-forest-deep text-center max-w-[32rem] mx-auto mb-16 lg:mb-20">
              Built for more informed decisions.
            </h2>
          </ScrollReveal>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            {...inViewProps}
          >
            <UserCard
              title="Consumers"
              description="Compare brand claims before making purchasing decisions."
            />
            <UserCard
              title="Researchers and Students"
              description="Organise sustainability evidence and identify gaps for further investigation."
            />
            <UserCard
              title="Brands"
              description="Understand where sustainability communication is credible and where stronger disclosure is required."
            />
            <UserCard
              title="Investors and Analysts"
              description="Review environmental and reputational signals as part of wider due diligence."
            />
          </motion.div>
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="relative overflow-hidden bg-forest-depth text-white py-28 sm:py-32 lg:py-40 px-5 sm:px-8 lg:px-10">
        <div className="absolute inset-0 texture-grid opacity-80" />
        <div className="absolute bottom-[-14rem] left-1/2 -translate-x-1/2 w-[46rem] h-[30rem] rounded-full bg-emerald/25 blur-[120px] pointer-events-none" />

        <div className="relative max-w-[42rem] mx-auto text-center">
          <ScrollReveal direction="up" delay={0}>
            <h2 className="font-display text-[2.375rem] sm:text-[3rem] lg:text-[3.75rem] text-white mb-7">
              Look beyond the claim. Examine the evidence.
            </h2>
            <p className="text-[1.0625rem] lg:text-lg text-eucalyptus/85 leading-[1.75] mb-11 max-w-[34rem] mx-auto">
              Analyse a brand's sustainability communication through a clearer, more transparent lens.
            </p>
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center">
              <button onClick={onAnalyze} className="btn-on-dark">
                Analyse a Brand
                <ArrowRight className="btn-arrow w-4 h-4" />
              </button>
              <button onClick={onAnalyze} className="btn-on-dark-outline">
                View a Sample Report
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

// Distinct but related green shades per data category
const METRIC_TONES = [
  { from: '#103F36', to: '#2F8A73' },
  { from: '#176B59', to: '#4FA187' },
  { from: '#2F8A73', to: '#8EAA9A' },
  { from: '#4A7F6D', to: '#A8C3B4' },
]

function MetricBar({ label, value, tone = 0 }: { label: string; value: number; tone?: number }) {
  const { from, to } = METRIC_TONES[tone % METRIC_TONES.length]
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[0.8125rem] font-medium text-charcoal">{label}</span>
        <span className="text-[0.8125rem] font-semibold text-forest tabular-nums">{value}%</span>
      </div>
      <div className="h-[6px] bg-mint rounded-full overflow-hidden ring-1 ring-inset ring-black/[0.03]">
        <motion.div
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${from}, ${to})` }}
          initial={{ width: 0 }}
          whileInView={{ width: `${value}%` }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  )
}

// Muted, differentiated status treatments — all within the core palette
const CLAIM_TONES = {
  verified: { dot: '#176B59', text: '#12594A', tint: 'rgba(23,107,89,0.06)' },
  partial: { dot: '#5E9280', text: '#3F6D5D', tint: 'rgba(94,146,128,0.06)' },
  insufficient: { dot: '#9AA6A0', text: '#66736F', tint: 'rgba(154,166,160,0.07)' },
  unclear: { dot: '#A99B82', text: '#7A7059', tint: 'rgba(169,155,130,0.08)' },
} as const

function ClaimCard({
  claim,
  status,
  tone,
}: {
  claim: string
  status: string
  tone: keyof typeof CLAIM_TONES
}) {
  const t = CLAIM_TONES[tone]
  return (
    <motion.div
      className="group relative flex items-center justify-between gap-4 rounded-[10px] border border-border bg-white/70 px-4 py-3.5 sm:px-5 sm:py-4 transition-all duration-300 hover:bg-white hover:border-sage/60 hover:shadow-[0_10px_28px_-18px_rgba(16,63,54,0.45)]"
      variants={fadeInUp}
      whileHover={{ x: 3 }}
    >
      {/* Left accent rail, revealed on hover */}
      <span
        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: t.dot }}
      />
      <p className="text-[0.9375rem] text-charcoal font-medium">{claim}</p>
      <p
        className="flex items-center gap-2 flex-shrink-0 text-[0.75rem] font-semibold tracking-[0.01em] rounded-full px-2.5 py-1"
        style={{ color: t.text, background: t.tint }}
      >
        <span className="w-[5px] h-[5px] rounded-full flex-shrink-0" style={{ background: t.dot }} />
        {status}
      </p>
    </motion.div>
  )
}

function ValuePropositionCard({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description: string
}) {
  return (
    <motion.div
      className="group relative lg:border-l lg:border-white/[0.12] lg:pl-8 lg:first:border-l-0 lg:first:pl-0"
      variants={fadeInUp}
    >
      <div className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-eucalyptus/50 mb-4 tabular-nums transition-colors duration-300 group-hover:text-eucalyptus/90">
        {index}
      </div>
      <h3 className="text-[1.1875rem] font-semibold text-white mb-3.5 tracking-[-0.01em]">{title}</h3>
      <p className="text-[0.9375rem] text-eucalyptus/80 leading-[1.7]">{description}</p>
    </motion.div>
  )
}

function ProcessStep({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <motion.div
      className="group relative flex gap-5 sm:gap-8 rounded-xl p-4 sm:p-6 transition-colors duration-300 hover:bg-white/70"
      variants={fadeInUp}
    >
      {/* Number node sitting on the spine */}
      <div className="relative flex-shrink-0">
        <div className="relative z-10 w-11 h-11 sm:w-[4.5rem] sm:h-[4.5rem] -ml-[0.375rem] sm:-ml-[0.75rem] rounded-full bg-white border border-eucalyptus flex items-center justify-center shadow-[0_2px_10px_-6px_rgba(16,63,54,0.4)] transition-all duration-300 group-hover:border-emerald group-hover:shadow-[0_6px_18px_-8px_rgba(16,63,54,0.5)]">
          <span className="font-display text-[1.25rem] sm:text-[1.875rem] text-forest/85 tabular-nums leading-none transition-colors duration-300 group-hover:text-emerald">
            {number}
          </span>
        </div>
      </div>
      <div className="pt-1 sm:pt-3.5">
        <h3 className="text-[1.1875rem] sm:text-[1.375rem] font-semibold text-forest-deep mb-2.5 tracking-[-0.015em]">
          {title}
        </h3>
        <p className="text-[0.9375rem] sm:text-base text-slate-muted leading-[1.75] max-w-[32rem]">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

function EvidenceCard({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description: string
}) {
  return (
    <motion.div className="card-refined card-interactive p-6 sm:p-7" variants={fadeInUp}>
      <div className="flex items-start justify-between gap-4 mb-4">
        <h3 className="text-[1.0625rem] font-semibold text-forest-deep tracking-[-0.01em] leading-snug">
          {title}
        </h3>
        <span className="flex-shrink-0 text-[0.6875rem] font-semibold tabular-nums text-sage tracking-[0.12em] pt-1">
          {index}
        </span>
      </div>
      <p className="text-[0.9375rem] text-slate-muted leading-[1.7]">{description}</p>
    </motion.div>
  )
}

function ScoreComponent({ label, tone = 0 }: { label: string; tone?: number }) {
  const { from } = METRIC_TONES[tone % METRIC_TONES.length]
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-border/70">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: from }} />
      <span className="text-[0.9375rem] text-charcoal">{label}</span>
    </div>
  )
}

function ScoreBand({ range, label, active }: { range: string; label: string; active: boolean }) {
  return (
    <div
      className={`flex justify-between items-center gap-4 rounded-md px-2.5 py-2 -mx-2.5 transition-colors ${
        active ? 'bg-mint' : ''
      }`}
    >
      <span className={`tabular-nums ${active ? 'text-forest font-semibold' : 'text-charcoal'}`}>
        {range}
      </span>
      <span className={active ? 'text-forest font-medium' : 'text-slate-muted'}>{label}</span>
    </div>
  )
}

function MethodPrinciple({
  index,
  title,
  description,
}: {
  index: string
  title: string
  description: string
}) {
  return (
    <div>
      <div className="font-display text-[1.125rem] text-sage mb-3 lowercase">{index}</div>
      <h3 className="text-[1.0625rem] font-semibold text-forest-deep mb-3 tracking-[-0.01em]">
        {title}
      </h3>
      <p className="text-[0.9375rem] text-slate-muted leading-[1.7]">{description}</p>
    </div>
  )
}

function UserCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div className="card-refined card-interactive p-6 sm:p-7" variants={fadeInUp}>
      <h3 className="text-[1.0625rem] font-semibold text-forest-deep mb-3 tracking-[-0.01em] leading-snug">
        {title}
      </h3>
      <p className="text-[0.9375rem] text-slate-muted leading-[1.7]">{description}</p>
    </motion.div>
  )
}
