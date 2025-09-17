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
    title: "New Blockchain Projects",
    description: "Startups building something new and want to make sure they're on the right track",
    features: ["Check if your tech approach makes sense", "Help with token planning", "Figure out your launch strategy", "Navigate legal requirements"]
  },
  {
    title: "Existing Crypto Projects",
    description: "Projects that are already running but want to improve or try new things",
    features: ["Make your project run better", "Help you change direction if needed", "Find new opportunities", "Connect with the right partners"]
  },
  {
    title: "Regular Companies",
    description: "Traditional businesses wondering if blockchain could help them somehow",
    features: ["Honest assessment of blockchain fit", "Help plan a token if it makes sense", "Evaluate blockchain tools and platforms", "Create a realistic implementation plan"]
  },
  {
    title: "Investors & Funds",
    description: "People with money who want to know if a blockchain project is worth investing in",
    features: ["Thorough project analysis", "Identify potential risks", "Evaluate the technology", "Assess market potential"]
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
            We're a small team that helps people make sense of blockchain technology and decide if it's right for their business. Instead of throwing around confusing tech jargon, we give you straight answers about what blockchain can and can't do for you.
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
              Whether you're just getting started with crypto or you're a company looking to explore blockchain, 
              we work with all kinds of people at different stages
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
                        Joel has been working with blockchain projects for over <strong className="text-white">5 years</strong>. 
                        He's good at figuring out if projects are worth investing in and helping them avoid common mistakes. 
                        His background in research and technology helps him see both the technical and business sides of projects.
                      </p>
                      
                      <p>
                        He's worked with several <strong className="text-blue-400">crypto launchpads</strong> (platforms that help new projects raise money), 
                        where his job was to thoroughly examine projects and spot potential problems before investors put money in. 
                        This gave him a really good eye for what works and what doesn't.
                      </p>
                      
                      <p>
                        Right now, Joel is helping <strong className="text-purple-400">3+ blockchain projects</strong> with their strategy, 
                        token design, and general direction. Working with projects at different stages - from brand new ideas to 
                        established companies - has taught him a lot about what challenges come up and how to solve them.
                      </p>
                      
                      <p>
                        Joel also helps <strong className="text-cyan-400">regular companies</strong> figure out if blockchain makes sense for their business, 
                        how to launch a token if they need one, and how to deal with all the legal stuff that comes with crypto.
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

        {/* Team Section */}
        <div className={`mb-20 transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light mb-4">
              <span className="font-normal bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Our Team</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto">
              A small but experienced team focused on giving you practical blockchain advice
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 - Sarah Chen */}
            <SubtleBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-purple-500/20 rounded-xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
                
                <Card className="bg-transparent border-0 relative z-10">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-purple-500/20">
                      <div className="text-3xl font-light text-gray-300 opacity-80">SC</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Sarah Chen</h3>
                    <p className="text-purple-400 text-sm font-medium mb-4">Technical Research Lead</p>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg p-3 border border-purple-500/10">
                        <p className="text-purple-300 font-medium mb-1">🎓 Background</p>
                        <div className="text-gray-400 text-xs">
                          <p>• Computer Science PhD</p>
                          <p>• Former DeFi Protocol Developer</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-lg p-3 border border-green-500/10">
                        <p className="text-green-300 font-medium mb-1">🔍 Focus Areas</p>
                        <div className="text-gray-400 text-xs">
                          <p>• Smart Contract Analysis</p>
                          <p>• Protocol Security Review</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                      Sarah digs deep into the technical stuff so you don't have to. She's great at explaining complex blockchain concepts in ways that actually make sense.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </SubtleBorder>

            {/* Team Member 2 - Marcus Rodriguez */}
            <SubtleBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-blue-500/20 rounded-xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20" />
                
                <Card className="bg-transparent border-0 relative z-10">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/20">
                      <div className="text-3xl font-light text-gray-300 opacity-80">MR</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Marcus Rodriguez</h3>
                    <p className="text-blue-400 text-sm font-medium mb-4">Business Strategy Advisor</p>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-lg p-3 border border-blue-500/10">
                        <p className="text-blue-300 font-medium mb-1">🎓 Background</p>
                        <div className="text-gray-400 text-xs">
                          <p>• MBA in Finance</p>
                          <p>• 8 Years Traditional Finance</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-lg p-3 border border-green-500/10">
                        <p className="text-green-300 font-medium mb-1">🔍 Focus Areas</p>
                        <div className="text-gray-400 text-xs">
                          <p>• Token Economics</p>
                          <p>• Market Analysis</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                      Marcus helps figure out if your blockchain project makes business sense. He's especially good at designing token systems that actually work long-term.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </SubtleBorder>

            {/* Team Member 3 - Lisa Park */}
            <SubtleBorder className="rounded-xl overflow-hidden" animated={true} movingBorder={true}>
              <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl transition-all duration-700 hover:shadow-2xl hover:shadow-emerald-500/20 rounded-xl">
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                
                <Card className="bg-transparent border-0 relative z-10">
                  <CardContent className="p-8 text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                      <div className="text-3xl font-light text-gray-300 opacity-80">LP</div>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Lisa Park</h3>
                    <p className="text-emerald-400 text-sm font-medium mb-4">Regulatory & Compliance Advisor</p>
                    <div className="space-y-3 text-sm">
                      <div className="bg-gradient-to-r from-emerald-500/5 to-teal-500/5 rounded-lg p-3 border border-emerald-500/10">
                        <p className="text-emerald-300 font-medium mb-1">🎓 Background</p>
                        <div className="text-gray-400 text-xs">
                          <p>• Law Degree (JD)</p>
                          <p>• Former SEC Compliance Officer</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-green-500/5 to-teal-500/5 rounded-lg p-3 border border-green-500/10">
                        <p className="text-green-300 font-medium mb-1">🔍 Focus Areas</p>
                        <div className="text-gray-400 text-xs">
                          <p>• Crypto Regulations</p>
                          <p>• Legal Risk Assessment</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                      Lisa helps navigate the confusing world of crypto regulations. She keeps track of what's legal, what's not, and what's changing so you don't get in trouble.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </SubtleBorder>
          </div>
        </div>

        <HorizontalDivider style="subtle" />

        {/* CTA Section */}
        <div className={`text-center transition-all duration-1000 delay-500 ${isPageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="text-center">
            <p className="text-gray-400 mb-8 text-lg">Have questions about your blockchain project?</p>
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