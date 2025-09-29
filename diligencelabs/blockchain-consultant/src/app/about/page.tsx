"use client"

import React, { useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { Logo } from '@/components/ui/logo'
import { SectionTransition } from '@/components/ui/wingbits-inspired'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from '@/components/ui/consistent-theme'
import dynamic from 'next/dynamic'

// Dynamically import contact form
const ContactForm = dynamic(() => import("@/components/contact-form").then(mod => ({ default: mod.ContactForm })), {
  loading: () => <div className="h-96 animate-pulse bg-gray-800/50 rounded-xl" />,
  ssr: false
})

const faqData = [
  {
    question: "What services does Diligence Labs offer?",
    answer: "We provide comprehensive blockchain consulting services including Strategic Advisory (helping you understand if blockchain fits your business), Due Diligence (technical and business analysis), Token Launch Consultation (end-to-end token launch guidance), Technical Integration (blockchain deployment guidance), Regulatory Compliance (legal compliance navigation), and Market Analysis (competitive research and positioning)."
  },
  {
    question: "How do you help blockchain project founders?",
    answer: "We help founders in several key ways: evaluate if blockchain is right for their project, design sustainable token economics, navigate legal compliance requirements, build and engage their community, choose the right technology stack and platforms, connect with reliable development partners, and provide ongoing strategic guidance throughout their project lifecycle."
  },
  {
    question: "What do you offer to VCs and investors?",
    answer: "We provide comprehensive due diligence services including thorough project review and market fit evaluation, team credential verification and background checks, technical architecture and smart contract analysis, business model and tokenomics assessment, market opportunity and competitive analysis, risk assessment and mitigation strategies. This helps investors make informed decisions and avoid costly mistakes."
  },
  {
    question: "How is Diligence Labs different from other blockchain consultants?",
    answer: "We focus on practical, no-nonsense advice without industry jargon. We'll honestly tell you if blockchain isn't right for your project rather than trying to sell you something you don't need. Our approach is research-backed, based on real experience, and we prioritize long-term success over quick fixes. We also offer transparent pricing and maintain a decentralized network of verified experts."
  },
  {
    question: "What is your pricing structure?",
    answer: "We offer flexible pricing options: a completely free initial consultation to assess your needs, monthly subscription plans for ongoing support (starting at $97/month), and project-based pricing for comprehensive consulting engagements. Our Basic plan is free and includes one consultation session, while our paid plans provide monthly consultation credits, priority support, and access to our expert network."
  },
  {
    question: "How do you ensure the quality of your advice?",
    answer: "All our consultants are thoroughly vetted experts with proven track records in blockchain technology, business strategy, and regulatory compliance. We maintain strict quality standards, provide transparent credentials for all team members, offer detailed reports and documentation for all consultations, and have a 98% client satisfaction rate with a money-back guarantee."
  },
  {
    question: "Do you work with projects in all stages of development?",
    answer: "Yes, we work with projects at every stage: early-stage ideas and concept validation, projects in development and looking for technical guidance, established projects seeking optimization or pivoting, companies considering blockchain integration, and investors evaluating blockchain opportunities. Our approach is tailored to your specific stage and needs."
  },
  {
    question: "What blockchain networks and technologies do you cover?",
    answer: "We have expertise across all major blockchain networks including Ethereum, Bitcoin, Binance Smart Chain, Polygon, Solana, Cardano, Polkadot, Avalanche, and emerging Layer 2 solutions. We also cover various blockchain applications like DeFi, NFTs, GameFi, enterprise blockchain, supply chain solutions, and Web3 infrastructure."
  },
  {
    question: "How quickly can I get started?",
    answer: "You can book a free consultation immediately through our platform. Free consultations are typically scheduled within 24-48 hours. For paid subscriptions, you get immediate access to our platform and can schedule consultations right away. Emergency or urgent consultations can often be arranged within a few hours for existing subscribers."
  },
  {
    question: "Do you provide ongoing support after consultation?",
    answer: "Yes, we offer several levels of ongoing support: monthly subscription plans include regular check-ins and ongoing consultation credits, project-based engagements include follow-up support periods, access to our expert network for specialized questions, documentation and resources for self-service support, and priority access to our team for urgent questions or critical decisions."
  }
]

export default function AboutPage() {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

  return (
    <ErrorBoundary>
      <PageWrapper>
      {/* Progress indicator */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-orange-600 z-50 origin-left"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="bg-black/80 backdrop-blur-xl border-b border-white/10 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Logo size="medium" />
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
              >
                ← Back to Home
              </motion.button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-16"
            >
              <h1 className="text-6xl md:text-8xl font-light mb-8">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent">
                  About
                </span>
                <br />
                <span className="bg-gradient-to-r from-orange-400 via-orange-300 to-orange-400 bg-clip-text text-transparent">
                  Diligence Labs
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed font-light">
                We're a team of blockchain experts dedicated to providing 
                <span className="text-white font-medium"> honest, practical advice</span> without the confusing jargon.
              </p>

              {/* Stats Section */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">Deep Dive</div>
                  <div className="text-gray-400 text-sm">Project Analysis</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">Risk First</div>
                  <div className="text-gray-400 text-sm">Due Diligence</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">Proven</div>
                  <div className="text-gray-400 text-sm">Track Record</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">Always On</div>
                  <div className="text-gray-400 text-sm">Expert Support</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Our Mission Section */}
      <SectionTransition background="gradient">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Our
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Mission
              </span>
            </h2>
            <div className="max-w-4xl mx-auto">
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                To democratize access to expert blockchain knowledge and help businesses make informed decisions about blockchain technology without falling victim to hype or making costly mistakes.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Expert Guidance</h3>
                  <p className="text-gray-300">
                    Access to verified blockchain experts with proven track records and real-world experience.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Honest Assessment</h3>
                  <p className="text-gray-300">
                    Transparent advice that prioritizes your success over sales. We'll tell you if blockchain isn't right for you.
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4">Practical Results</h3>
                  <p className="text-gray-300">
                    Actionable recommendations and real-world solutions that drive measurable business outcomes.
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </SectionTransition>

      {/* FAQ Section */}
      <SectionTransition background="solid">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Frequently Asked
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Find answers to common questions about our blockchain consulting services and approach.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            {faqData.map((faq, index) => {
              const isExpanded = expandedFaq === index
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="mb-4"
                >
                  <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl backdrop-blur-xl overflow-hidden hover:border-orange-500/30 transition-all duration-300">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-white/5 transition-all duration-300"
                    >
                      <h3 className="text-lg font-semibold text-white pr-4">
                        {faq.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-shrink-0"
                      >
                        <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </button>
                    <motion.div
                      initial={false}
                      animate={{
                        height: isExpanded ? "auto" : 0,
                        opacity: isExpanded ? 1 : 0
                      }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 border-t border-white/10">
                        <p className="text-gray-300 pt-4 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </SectionTransition>

      {/* Contact Section */}
      <SectionTransition background="gradient">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div>
                <h2 className="text-5xl font-light mb-6">
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Get in
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                    Touch
                  </span>
                </h2>
                <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                  Ready to discuss your blockchain project? Have questions about our services? 
                  We're here to help with honest, expert advice.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Email</h3>
                    <p className="text-gray-300">info@diligencelabs.xyz</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Response Time</h3>
                    <p className="text-gray-300">Within 24 hours</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-green-600/20 border border-green-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Availability</h3>
                    <p className="text-gray-300">Global timezone support</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/guest-booking">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all duration-300"
                  >
                    Book Free Consultation
                  </motion.button>
                </Link>
                <Link href="/#pricing">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 border border-white/20 text-white font-medium rounded-lg backdrop-blur-sm hover:bg-white/5 transition-all duration-300"
                  >
                    View Pricing
                  </motion.button>
                </Link>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
            >
              <h3 className="text-2xl font-semibold text-white mb-6">Send us a Message</h3>
              <ContactForm />
            </motion.div>
          </div>
        </div>
      </SectionTransition>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-white/10 py-12 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="medium" />
            </div>
            <div className="flex space-x-6 text-gray-300">
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link href="/" className="hover:text-white transition-colors duration-200">
                Home
              </Link>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 Diligence Labs. All rights reserved. Expert blockchain consulting and advisory services.
            </p>
          </div>
        </div>
      </footer>
      </PageWrapper>
    </ErrorBoundary>
  )
}