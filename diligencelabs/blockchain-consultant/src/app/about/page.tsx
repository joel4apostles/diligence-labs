"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ParallaxBackground } from "@/components/ui/parallax-background"
import { FloatingElements } from "@/components/ui/animated-background"
import { SectionGridLines } from "@/components/ui/grid-lines"
import { SubtleBorder, ProminentBorder } from "@/components/ui/border-effects"
import { PageStructureLines } from "@/components/ui/page-structure"
import { HorizontalDivider } from "@/components/ui/section-divider"
import { Logo } from "@/components/ui/logo"



const clientTypes = [
  {
    title: "Early-Stage Blockchain Projects",
    description: "Startups and emerging protocols seeking strategic guidance and technical validation",
    features: ["Technical architecture review", "Token launch consultation", "Go-to-market strategy", "Compliance guidance"]
  },
  {
    title: "Existing Blockchain Ventures",
    description: "Established projects looking to optimize, scale, or pivot their blockchain strategies",
    features: ["Performance optimization", "Strategic pivots", "Market expansion", "Partnership strategies"]
  },
  {
    title: "Traditional Companies",
    description: "Enterprises exploring blockchain integration and digital transformation opportunities",
    features: ["Blockchain integration planning", "Token launch strategies", "Technology assessment", "Implementation roadmaps"]
  },
  {
    title: "Investors & Institutions",
    description: "Investment funds and institutions requiring comprehensive due diligence analysis",
    features: ["Investment due diligence", "Risk assessment", "Technology evaluation", "Market analysis"]
  }
]

export default function AboutPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false)

  useEffect(() => {
    setIsPageLoaded(true)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <PageStructureLines />
      <SectionGridLines />
      <ParallaxBackground />
      <FloatingElements />
      
      {/* Animated Background Elements */}
      <div className="absolute top-1/4 right-1/6 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full filter blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/6 w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-pink-500/10 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className={`text-center mb-16 transition-all duration-1000 ${isPageLoaded ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <nav className="flex items-center justify-center mb-8">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300">
                ← Back to Home
              </Button>
            </Link>
          </nav>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Logo size="xl" href={null} />
          </div>

          <h1 className="text-5xl md:text-6xl font-light mb-6">
            About <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Diligence Labs</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-4xl mx-auto leading-relaxed mb-8">
            Diligence Labs stands at the forefront of blockchain consulting, bridging the gap between complex Web3 technologies and practical business solutions. Founded with the vision of democratizing access to expert blockchain guidance, we specialize in transforming innovative ideas into sustainable, scalable blockchain ventures.
          </p>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-xl border border-blue-500/10">
              <div className="text-2xl font-bold text-blue-400 mb-2">5+</div>
              <div className="text-sm text-gray-400">Years Experience</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl border border-purple-500/10">
              <div className="text-2xl font-bold text-purple-400 mb-2">3+</div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-r from-green-500/5 to-emerald-500/5 rounded-xl border border-green-500/10">
              <div className="text-2xl font-bold text-green-400 mb-2">100%</div>
              <div className="text-sm text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        {/* Client Types */}
        <div className={`mb-20 transition-all duration-1000 delay-300 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">
              <span className="font-normal bg-gradient-to-r from-cyan-400 to-green-400 bg-clip-text text-transparent">Who We Serve</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              From early-stage blockchain projects to established enterprises, we provide tailored consulting solutions 
              for every stage of the Web3 journey
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {clientTypes.map((client, index) => {
              // Define colors for each client type
              const colors = [
                { bg: 'from-blue-500/20 to-cyan-500/20', border: 'from-blue-500 to-cyan-500', shadow: 'hover:shadow-blue-500/20' },
                { bg: 'from-purple-500/20 to-pink-500/20', border: 'from-purple-500 to-pink-500', shadow: 'hover:shadow-purple-500/20' },
                { bg: 'from-green-500/20 to-emerald-500/20', border: 'from-green-500 to-emerald-500', shadow: 'hover:shadow-green-500/20' },
                { bg: 'from-orange-500/20 to-red-500/20', border: 'from-orange-500 to-red-500', shadow: 'hover:shadow-orange-500/20' }
              ];
              const color = colors[index % colors.length];
              
              return (
                <SubtleBorder key={index} className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
                  <div className={`relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl ${color.shadow} h-full rounded-xl`}>
                    {/* Dynamic background gradient */}
                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br ${color.bg}`} />
                    
                    {/* Enhanced Hover Effects */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
                    <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${color.border} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`} />
                    
                    <Card className="bg-transparent border-0 h-full relative z-10">
                  <CardHeader>
                    <CardTitle className="text-xl text-white">{client.title}</CardTitle>
                    <CardDescription className="text-gray-400">{client.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {client.features.map((feature, fIndex) => (
                        <li key={fIndex} className="flex items-center gap-3 text-gray-300">
                          <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex-shrink-0"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                    </Card>
                  </div>
                </SubtleBorder>
              );
            })}
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        {/* Professional Background Section */}
        <div className={`mb-20 transition-all duration-1000 delay-400 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <ProminentBorder className="rounded-3xl overflow-hidden shadow-2xl shadow-blue-500/10" animated={true} movingBorder={true}>
            <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 rounded-3xl">
              {/* Dynamic background gradient */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
              
              {/* Enhanced Hover Effects */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/3 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 transform -rotate-12 scale-110" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
              
              <Card className="bg-transparent border-0 relative z-10">
              <CardContent className="p-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                  <div className="lg:col-span-1 text-center">
                    <div className="w-48 h-48 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-blue-500/20">
                      <div className="text-6xl font-light text-gray-300 opacity-80">
                        JT
                      </div>
                    </div>
                    <h2 className="text-3xl font-light mb-2">Joel Titus</h2>
                    <p className="text-blue-400 text-lg font-medium mb-6">Founder & Lead Consultant</p>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg p-3 border border-blue-500/10">
                        <p className="text-blue-300 font-medium mb-1">🎓 Education</p>
                        <div className="text-gray-400 space-y-1 text-xs">
                          <p>• Bachelor of Technology</p>
                          <p>• Master of Information Technology</p>
                          <p>• Master in Global Communication</p>
                          <p>• PhD Candidate</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-lg p-3 border border-green-500/10">
                        <p className="text-green-300 font-medium mb-1">🔍 Specialization</p>
                        <div className="text-gray-400 space-y-1 text-xs">
                          <p>• Blockchain Research</p>
                          <p>• Due Diligence Expert</p>
                          <p>• Launchpad Advisor</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-2">
                    <h3 className="text-2xl font-semibold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Professional Background
                    </h3>
                    <div className="space-y-6 text-gray-300 leading-relaxed">
                      <p className="text-lg">
                        With over <strong className="text-white">5 years of professional experience</strong> as a blockchain researcher and due diligence expert, 
                        Joel has established himself as a trusted advisor in the Web3 ecosystem. His expertise spans across technical analysis, 
                        business strategy, and risk assessment for blockchain ventures.
                      </p>
                      
                      <p>
                        Joel has worked extensively with <strong className="text-blue-400">top-tier launchpads</strong>, conducting comprehensive 
                        due diligence assessments that have helped identify promising projects and mitigate investment risks. His analytical 
                        approach combines technical expertise with deep market understanding.
                      </p>
                      
                      <p>
                        Currently, Joel is actively advising <strong className="text-purple-400">3+ blockchain projects</strong>, providing ongoing 
                        strategic guidance on tokenomics, technical architecture, and market positioning. His hands-on experience with both 
                        early-stage startups and established protocols gives him unique insights into the challenges and opportunities in the space.
                      </p>
                      
                      <p>
                        Beyond pure blockchain ventures, Joel specializes in helping <strong className="text-cyan-400">traditional companies</strong> 
                        explore blockchain integration opportunities, design token launch strategies, and navigate the regulatory landscape of Web3 adoption.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              </Card>
            </div>
          </ProminentBorder>
        </div>

        <HorizontalDivider style="subtle" />

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <p className="text-gray-400 mb-8 text-lg">Ready to elevate your blockchain project?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group relative bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 px-8 py-3 rounded-lg transition-all duration-300 hover:scale-105 overflow-hidden">
                <Link href="/book-consultation" className="relative z-10 flex items-center justify-center">
                  <span className="relative">
                    Book Consultation
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-purple-400/30 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="group relative border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 px-8 py-3 rounded-lg transition-all duration-300 overflow-hidden">
                <Link href="/#services" className="relative z-10 flex items-center justify-center">
                  <span className="relative">
                    View Services
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-700/30 via-gray-600/40 to-gray-700/30 opacity-0 group-hover:opacity-100 rounded-lg transition-all duration-500" />
                  <svg className="ml-2 w-4 h-4 transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                </Link>
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}