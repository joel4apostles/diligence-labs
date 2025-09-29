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
      answer: "We help with strategy, technical integration, due diligence, token launches, regulatory guidance, and market research. Basically, if it involves blockchain and business strategy, we can probably help you figure it out."
    },
    {
      question: "How do I know if blockchain is right for my business?",
      answer: "During our first conversation, we'll dig into what you're trying to achieve and honestly tell you whether blockchain makes sense for your situation. Sometimes it does, sometimes it doesn't - we'll give you a straight answer either way."
    },
    {
      question: "What is your typical project timeline?",
      answer: "It depends on what you need. Strategy sessions usually take 2-4 weeks, token launches need 4-8 weeks, and technical work can be anywhere from 1-12 weeks. We'll give you realistic timelines upfront so you know what to expect."
    },
    {
      question: "Do you help with regulatory compliance?",
      answer: "Yes, we help you understand what legal requirements apply to your project and connect you with experienced lawyers when needed. Regulations change frequently, so it's important to stay on top of what's current."
    },
    {
      question: "What makes your approach different?",
      answer: "We focus on practical solutions that actually work in the real world. Our team has hands-on experience building and launching blockchain projects, so we understand both the technical and business sides of what you're dealing with."
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
              Whether you're just getting started or need help with complex integration, 
              our team provides practical guidance that gets results. Real experience, straightforward advice.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ModularFeatureCard
              title="Strategic Advisory"
              description="We help new projects build successful go-to-market strategies and connect existing businesses with the right blockchain solutions. Our team introduces you to trusted solution providers, whitelabel services, and market makers while guiding you toward genuine product-market fit. Whether you're launching fresh or exploring blockchain integration, we provide practical advice that actually works."
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
              description="Before you invest or partner with any project, get the full picture. We thoroughly examine the technology, team credentials, financial structure, and business model to spot potential red flags. Our detailed reports help you make informed decisions and avoid costly mistakes in the fast-moving blockchain space."
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
              description="Launching a token involves much more than just writing smart contracts. We guide you through the entire process from initial concept to public release, helping with legal requirements, community building, liquidity planning, and launch timing. Our goal is to set your token up for sustainable success, not just a quick launch."
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
              description="Adding blockchain features to your existing business doesn't have to be overwhelming. We work with your current systems and team to implement the right blockchain solutions without disrupting your operations. From simple payment integrations to complex smart contract systems, we make the technical side manageable."
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
              description="Legal requirements for blockchain projects change frequently and vary by location. We help you understand what rules apply to your specific situation and connect you with experienced legal professionals when needed. Better to get it right from the start than deal with problems later."
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
              description="Understanding your competition and target audience is crucial for success. We research the market landscape, identify opportunities, and help you position your project where it has the best chance to succeed. No guesswork - just solid research and practical insights."
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
              Here's how we work with you to get things done right, without the confusion or unnecessary complexity.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Discovery & Analysis",
                description: "First, we take time to understand your business and honestly assess whether blockchain makes sense for what you're trying to achieve."
              },
              {
                step: "02",
                title: "Strategy Development", 
                description: "Together, we build a practical roadmap with realistic timelines and clear milestones, so you always know what's happening next."
              },
              {
                step: "03",
                title: "Implementation",
                description: "We roll up our sleeves and work alongside your team, providing regular updates and solving problems as they come up."
              },
              {
                step: "04",
                title: "Optimization",
                description: "After launch, we monitor how everything's working and make improvements based on real user feedback and performance data."
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
              Start with a free consultation to see if we're a good fit, then choose ongoing support that matches your needs and budget.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative group bg-gradient-to-br from-gray-900/50 to-gray-800/40 border border-white/10 rounded-2xl backdrop-blur-xl hover:border-orange-500/30 transition-all duration-300 flex flex-col h-full ${
                  plan.popular ? 'border-orange-500/50 shadow-2xl shadow-orange-500/10 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Header Section - Fixed Height */}
                <div className="text-center p-6 pb-4 flex-shrink-0">
                  <h3 className="text-2xl font-bold text-white mb-3">{plan.name}</h3>
                  <p className="text-gray-300 mb-4 text-sm leading-relaxed min-h-[2.5rem] flex items-center justify-center">{plan.description}</p>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price.monthly}</span>
                    <span className="text-gray-400 text-base">/month</span>
                  </div>
                </div>

                {/* Features Section - Flexible Height */}
                <div className="px-6 flex-grow">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <svg className="w-4 h-4 text-orange-400 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-300 text-sm leading-relaxed">
                          {feature.name}
                          {feature.limit && <span className="text-gray-500 ml-1">({feature.limit})</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Section - Fixed at Bottom */}
                <div className="p-6 pt-0 mt-auto">
                  <Link href={plan.price.monthly === 0 ? "/guest-booking" : "/auth/unified-signin"} className="block">
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      className={`
                        w-full py-3 px-6 font-semibold rounded-xl text-sm
                        transition-all duration-300 transform
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
                        ${plan.price.monthly === 0
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:from-green-600 hover:to-green-700 focus:ring-green-500'
                          : plan.popular
                          ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:from-orange-600 hover:to-orange-700 focus:ring-orange-500'
                          : 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700 hover:border-gray-500 shadow-md hover:shadow-lg focus:ring-gray-500'
                        }
                      `}
                    >
                      <span className="flex items-center justify-center">
                        {plan.price.monthly === 0 ? (
                          <>
                            <span>Get Started Free</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Choose Plan</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </>
                        )}
                      </span>
                    </motion.button>
                  </Link>
                  
                  {/* Secondary action for popular plan */}
                  {plan.popular && (
                    <p className="text-center mt-3 text-xs text-gray-400">
                      Most chosen by teams
                    </p>
                  )}
                </div>
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
              Ready to move forward with your blockchain project? Let's have a conversation 
              about what you're building and how we can help make it successful.
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
                Common questions about working with us and what to expect from our consulting services.
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