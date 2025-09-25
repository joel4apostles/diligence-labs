"use client"

import React, { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import Link from 'next/link'
import { Logo } from './logo'
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans'
import { 
  WingbitsInspiredHero, 
  ModularFeatureCard, 
  SectionTransition
} from './wingbits-inspired'
import { ErrorBoundary } from './error-boundary'
import { 
  PageWrapper, 
  GlassMorphismCard, 
  FloatingOrb,
  theme,
  animations
} from './consistent-theme'


// ==================== ENHANCED LANDING PAGE ====================
export const EnhancedLandingPage: React.FC = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqs = [
    {
      question: "What blockchain consulting services do you offer?",
      answer: "We provide comprehensive blockchain consulting including strategic advisory, due diligence, token launch consultation, technical integration, regulatory compliance, and market analysis. Our services cover everything from initial feasibility assessment to full implementation support."
    },
    {
      question: "How do I know if blockchain is right for my business?",
      answer: "Our initial consultation process includes a thorough analysis of your business needs, use case evaluation, and cost-benefit assessment. We help you understand whether blockchain technology adds real value to your specific situation or if traditional solutions might be more appropriate."
    },
    {
      question: "What is your typical project timeline?",
      answer: "Project timelines vary based on scope and complexity. Strategic advisory typically takes 2-4 weeks, token launches require 4-8 weeks, and technical integration can range from 1-12 weeks depending on the project requirements. We provide detailed timelines during our initial consultation."
    },
    {
      question: "Do you help with regulatory compliance?",
      answer: "Yes, regulatory compliance is a critical part of our services. We help navigate complex legal requirements across multiple jurisdictions, ensure your project meets regulatory standards, and connect you with specialized legal partners when needed."
    },
    {
      question: "What makes your approach different?",
      answer: "We operate through a decentralized network of verified blockchain experts, ensuring you get access to the best talent for your specific needs. Our transparent, results-driven approach focuses on practical implementation rather than just theoretical advice."
    }
  ]

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

      {/* Hero Section */}
      <WingbitsInspiredHero />

      {/* Services Section */}
      <SectionTransition background="gradient">
        <div id="services" className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Comprehensive
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Blockchain Services
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              From strategic advisory to technical implementation, we provide end-to-end 
              blockchain consulting services powered by our decentralized network of experts.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ModularFeatureCard
              title="Strategic Advisory"
              description="Navigate the complex blockchain landscape with expert guidance on technology selection, tokenomics design, and regulatory compliance."
              gradient="from-blue-900/80 via-blue-800/60 to-blue-900/80"
              delay={0.1}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            />

            <ModularFeatureCard
              title="Due Diligence"
              description="Comprehensive technical and business analysis of blockchain projects, smart contracts, and tokenomics with detailed risk assessments."
              gradient="from-purple-900/80 via-purple-800/60 to-purple-900/80"
              delay={0.2}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            />

            <ModularFeatureCard
              title="Token Launch"
              description="End-to-end support for token launches including technical architecture, legal compliance, and go-to-market strategy."
              gradient="from-green-900/80 via-green-800/60 to-green-900/80"
              delay={0.3}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />

            <ModularFeatureCard
              title="Technical Integration"
              description="Seamless integration of blockchain technology into existing systems with custom development and implementation support."
              gradient="from-orange-900/80 via-orange-800/60 to-orange-900/80"
              delay={0.4}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <ModularFeatureCard
              title="Regulatory Compliance"
              description="Navigate complex regulatory landscapes with expert guidance on compliance requirements across multiple jurisdictions."
              gradient="from-red-900/80 via-red-800/60 to-red-900/80"
              delay={0.5}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                </svg>
              }
            />

            <ModularFeatureCard
              title="Market Analysis"
              description="In-depth market research and competitive analysis to position your blockchain project for maximum impact and success."
              gradient="from-indigo-900/80 via-indigo-800/60 to-indigo-900/80"
              delay={0.6}
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </SectionTransition>

      {/* Process Section - Keep this as it's valuable */}
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
                Our Proven
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Process
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              How we work with you step-by-step to achieve your blockchain goals with clarity and precision.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery & Analysis",
                description: "We analyze your business needs and determine if blockchain is the right solution for your specific use case."
              },
              {
                step: "02",
                title: "Strategy Development", 
                description: "Create a comprehensive roadmap with clear milestones, timeline, and budget that aligns with your goals."
              },
              {
                step: "03",
                title: "Implementation",
                description: "Execute the plan with hands-on support, regular updates, and expert guidance throughout the process."
              },
              {
                step: "04",
                title: "Optimization",
                description: "Monitor performance, gather feedback, and continuously improve your blockchain solution for maximum impact."
              }
            ].map((process, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 text-center hover:border-orange-500/30 transition-all duration-300 backdrop-blur-xl"
              >
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500/20 to-orange-600/20 border border-orange-500/30 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl font-bold text-orange-400">{process.step}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-orange-100 transition-colors duration-300">
                    {process.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed group-hover:text-gray-200 transition-colors duration-300">
                    {process.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionTransition>

      {/* Pricing Section */}
      <SectionTransition background="solid">
        <div id="pricing" className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Simple
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Pricing Plans
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Choose the perfect plan for your blockchain consulting needs. Start with our free consultation or subscribe for ongoing support.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative group bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl p-8 backdrop-blur-xl hover:border-orange-500/30 transition-all duration-300 ${
                  plan.popular ? 'border-orange-500/50 shadow-2xl shadow-orange-500/10' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price.monthly}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <svg className="w-5 h-5 text-orange-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">
                        {feature.name}
                        {feature.limit && <span className="text-gray-500"> ({feature.limit})</span>}
                      </span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.price.monthly === 0 ? "/guest-booking" : "/auth/unified-signin"}>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-full py-4 font-medium rounded-xl transition-all duration-300 ${
                      plan.price.monthly === 0
                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40'
                        : plan.popular
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
                        : 'bg-gray-800 text-white border border-gray-700 hover:bg-gray-700'
                    }`}
                  >
                    {plan.price.monthly === 0 ? 'Start Free Consultation' : 'Subscribe & Get Started'}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </SectionTransition>

      {/* CTA Section */}
      <SectionTransition background="gradient">
        <div id="about" className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-light mb-6">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                Your Blockchain Vision?
              </span>
            </h2>
            
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of successful blockchain projects that have leveraged our 
              decentralized network of experts to achieve their goals.
            </p>
          </motion.div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center mb-12"
            >
              <h3 className="text-4xl font-light mb-4">
                <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Frequently Asked
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                  Questions
                </span>
              </h3>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Get answers to common questions about our blockchain consulting services and how we can help transform your project.
              </p>
            </motion.div>

            {/* FAQ Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-gray-800/40 border border-gray-600/30 rounded-xl backdrop-blur-sm overflow-hidden hover:border-blue-500/30 transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 hover:bg-gray-700/30 transition-colors duration-300 flex justify-between items-start"
                  >
                    <span className="text-white font-medium pr-4 leading-relaxed">{faq.question}</span>
                    <motion.svg
                      animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </motion.svg>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: expandedFaq === index ? "auto" : 0,
                      opacity: expandedFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 text-gray-300 leading-relaxed border-t border-gray-600/20 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              SOC 2 Compliant
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Enterprise Grade Security
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              24/7 Support
            </div>
          </motion.div>
        </div>
      </SectionTransition>

      {/* Footer */}
      <footer className="bg-black/80 border-t border-white/10 py-12 backdrop-blur-xl">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Logo size="large" />
            </div>
            <div className="flex space-x-6 text-gray-300">
              <Link href="/privacy" className="hover:text-white transition-colors duration-200">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors duration-200">
                Terms
              </Link>
              <Link href="/about" className="hover:text-white transition-colors duration-200">
                About
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

// ==================== ENHANCED NAVIGATION ====================
export const EnhancedNavigation: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { id: 'home', label: 'Home', href: '/' },
    { id: 'services', label: 'Services', href: '#services' },
    { id: 'pricing', label: 'Pricing', href: '#pricing' },
    { id: 'about', label: 'About', href: '#about' }
  ]

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`
        fixed top-0 left-0 right-0 z-50 transition-all duration-300
        ${isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/10' 
          : 'bg-transparent'
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
          >
            <Logo size="large" />
          </motion.div>

          {/* Navigation items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <motion.div key={item.id}>
                {item.href.startsWith('#') ? (
                  <motion.a
                    href={item.href}
                    onClick={() => setActiveSection(item.id)}
                    className={`
                      relative text-sm font-medium transition-colors duration-200
                      ${activeSection === item.id ? 'text-orange-400' : 'text-gray-300 hover:text-white'}
                    `}
                    whileHover={{ y: -2 }}
                  >
                    {item.label}
                    {activeSection === item.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute -bottom-2 left-0 right-0 h-0.5 bg-orange-400"
                        initial={false}
                      />
                    )}
                  </motion.a>
                ) : (
                  <Link href={item.href}>
                    <motion.span
                      className={`
                        relative text-sm font-medium transition-colors duration-200
                        ${activeSection === item.id ? 'text-orange-400' : 'text-gray-300 hover:text-white'}
                      `}
                      whileHover={{ y: -2 }}
                    >
                      {item.label}
                    </motion.span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <Link href="/auth/unified-signin">
            <motion.button
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium rounded-lg shadow-lg hover:shadow-orange-500/25 transition-all duration-300"
            >
              Get Started
            </motion.button>
          </Link>
        </div>
      </div>
    </motion.nav>
  )
}