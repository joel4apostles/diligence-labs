'use client'

import { useState } from 'react'
import Link from 'next/link'
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Shield, 
  Users, 
  Target, 
  Star, 
  Trophy, 
  Coins, 
  CheckCircle, 
  ArrowRight,
  Globe,
  Lock,
  TrendingUp,
  FileCheck,
  Mail,
  Eye,
  EyeOff,
  User,
  UserPlus,
  LogIn
} from 'lucide-react'

// Dynamically import background components for consistency with main site
const FloatingElements = dynamic(() => import("@/components/ui/animated-background").then(mod => ({ default: mod.FloatingElements })), {
  ssr: false,
  loading: () => null
})

const ParallaxBackground = dynamic(() => import("@/components/ui/parallax-background").then(mod => ({ default: mod.ParallaxBackground })), {
  ssr: false,
  loading: () => null
})

const HeroGridLines = dynamic(() => import("@/components/ui/grid-lines").then(mod => ({ default: mod.HeroGridLines })), {
  ssr: false,
  loading: () => null
})

const DynamicPageBackground = dynamic(() => import("@/components/ui/dynamic-page-background").then(mod => ({ default: mod.DynamicPageBackground })), {
  ssr: false,
  loading: () => null
})

export default function DueDiligencePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [authMode, setAuthMode] = useState<'login' | 'signup' | null>(null)
  const [userType, setUserType] = useState<'expert' | 'submitter' | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    expertise: '',
    linkedIn: '',
    github: '',
    experience: ''
  })

  const features = [
    {
      icon: Shield,
      title: "Verified Expert Network",
      description: "KYC-verified professionals with proven track records in blockchain and Web3 evaluation",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: Users,
      title: "Community-Driven Assessment",
      description: "Collaborative evaluation process ensuring comprehensive project analysis",
      color: "from-green-500 to-teal-500"
    },
    {
      icon: Target,
      title: "Multi-Dimensional Scoring",
      description: "Structured evaluation across team, PMF, infrastructure, and competitive landscape",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Coins,
      title: "DeFi Incentives",
      description: "Token-based reward system with staking mechanisms for quality assurance",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: Trophy,
      title: "Gamified Participation",
      description: "Leaderboards, badges, and reputation tiers drive engagement and expertise",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Lock,
      title: "Transparent & Secure",
      description: "Blockchain-backed verification with decentralized governance and dispute resolution",
      color: "from-indigo-500 to-blue-500"
    }
  ]

  const evaluationCriteria = [
    { category: "Team", weight: "25%", description: "Founder experience, team composition, track record" },
    { category: "Product-Market Fit", weight: "20%", description: "Market demand, user traction, competitive advantage" },
    { category: "Infrastructure", weight: "20%", description: "Technical architecture, security, scalability" },
    { category: "Current Status", weight: "15%", description: "Development progress, roadmap execution" },
    { category: "Competitive Landscape", weight: "10%", description: "Market position, differentiation" },
    { category: "Risk Assessment", weight: "10%", description: "Technical, regulatory, market risks" }
  ]

  const expertTiers = [
    { tier: "Bronze", color: "from-amber-600 to-amber-800", requirements: "5+ evaluations, 80%+ accuracy", perks: "Basic rewards, public profile" },
    { tier: "Silver", color: "from-gray-400 to-gray-600", requirements: "15+ evaluations, 85%+ accuracy", perks: "Higher rewards, priority assignments" },
    { tier: "Gold", color: "from-yellow-400 to-yellow-600", requirements: "30+ evaluations, 90%+ accuracy", perks: "Premium rewards, governance voting" },
    { tier: "Platinum", color: "from-purple-400 to-purple-600", requirements: "50+ evaluations, 95%+ accuracy", perks: "Maximum rewards, expert panel access" }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAuth = (mode: 'login' | 'signup', type: 'expert' | 'submitter') => {
    setAuthMode(mode)
    setUserType(type)
    setActiveTab('auth')
  }

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle authentication logic here
    console.log('Auth submission:', { authMode, userType, formData })
  }

  const TabButton = ({ id, label, active, onClick }: { id: string, label: string, active: boolean, onClick: (id: string) => void }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg' 
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Dynamic Page Background with Enhanced Effects */}
      <DynamicPageBackground variant="default" opacity={0.25} />
      
      {/* Sophisticated Grid Lines System */}
      <HeroGridLines />
      
      {/* Parallax Background */}
      <ParallaxBackground />
      {/* Floating Elements */}
      <FloatingElements />

      {/* Hero Section */}
      <div className="relative py-20 overflow-hidden z-10">
        <div className="container mx-auto px-6 relative">
          {/* Back to Homepage Link */}
          <div className="mb-8">
            <Link 
              href="/"
              className="inline-flex items-center text-gray-400 hover:text-white transition-colors group"
            >
              <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Homepage
            </Link>
          </div>
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <FileCheck className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Decentralized Due Diligence
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 mb-8 leading-relaxed">
              Community-driven project evaluation powered by verified experts, 
              transparent scoring, and blockchain-backed incentives
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 text-lg"
                onClick={() => handleAuth('signup', 'submitter')}
              >
                Submit Project <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 px-8 py-4 text-lg"
                onClick={() => handleAuth('signup', 'expert')}
              >
                Become an Expert
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="py-20 relative z-10">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <TabButton id="overview" label="How It Works" active={activeTab === 'overview'} onClick={setActiveTab} />
            <TabButton id="evaluation" label="Evaluation Criteria" active={activeTab === 'evaluation'} onClick={setActiveTab} />
            <TabButton id="experts" label="Expert Tiers" active={activeTab === 'experts'} onClick={setActiveTab} />
            <TabButton id="submit" label="Submit Project" active={activeTab === 'submit'} onClick={setActiveTab} />
            <TabButton id="auth" label="Join Platform" active={activeTab === 'auth'} onClick={setActiveTab} />
          </div>


          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">1. Project Submission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      VCs and founders submit projects with comprehensive details including team info, 
                      current traction, and technical infrastructure.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">2. Expert Assignment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Verified experts are assigned based on expertise and availability to conduct 
                      comprehensive due diligence evaluation.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">3. Evaluation & Report</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-400">
                      Collaborative assessment across multiple dimensions results in detailed reports 
                      with scoring, commentary, and recommendations.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Evaluation Criteria Tab */}
          {activeTab === 'evaluation' && (
            <div className="max-w-4xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">Evaluation Framework</CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="space-y-6">
                    {evaluationCriteria.map((criteria, index) => (
                      <div key={index} className="flex items-start space-x-4 p-6 bg-gray-800/30 rounded-xl">
                        <div className="text-2xl font-bold text-blue-400 min-w-[60px]">
                          {criteria.weight}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-2">{criteria.category}</h3>
                          <p className="text-gray-400">{criteria.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Expert Tiers Tab */}
          {activeTab === 'experts' && (
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {expertTiers.map((tier, index) => (
                  <Card key={index} className="bg-gray-900/50 border-gray-800 hover:scale-105 transition-transform duration-300">
                    <CardHeader className="text-center">
                      <div className={`w-16 h-16 mx-auto bg-gradient-to-r ${tier.color} rounded-full flex items-center justify-center mb-4`}>
                        <Trophy className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-xl text-white">{tier.tier}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <p className="text-sm text-gray-400 mb-4">{tier.requirements}</p>
                      <Badge variant="outline" className="text-blue-400 border-blue-400/30">
                        {tier.perks}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Submit Project Tab */}
          {activeTab === 'submit' && (
            <div className="max-w-2xl mx-auto">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-2xl text-white text-center">Submit Your Project</CardTitle>
                  <p className="text-gray-400 text-center">Get comprehensive due diligence from verified experts</p>
                </CardHeader>
                <CardContent className="p-8">
                  <form className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Project Name</label>
                      <Input 
                        placeholder="Enter your project name" 
                        className="bg-gray-800/50 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Project Description</label>
                      <Textarea 
                        placeholder="Describe your project, its mission, and key objectives"
                        className="bg-gray-800/50 border-gray-700 text-white min-h-[120px]"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white font-medium mb-2">Website URL</label>
                        <Input 
                          placeholder="https://yourproject.com" 
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-white font-medium mb-2">Twitter Handle</label>
                        <Input 
                          placeholder="@yourproject" 
                          className="bg-gray-800/50 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Founding Team</label>
                      <Textarea 
                        placeholder="List key team members and their roles"
                        className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-medium mb-2">Current Status & Traction</label>
                      <Textarea 
                        placeholder="Describe current development status, user metrics, partnerships"
                        className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                      />
                    </div>
                    <Button 
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3"
                    >
                      Submit for Evaluation
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Authentication Tab */}
          {activeTab === 'auth' && (
            <div className="max-w-4xl mx-auto">
              {!authMode ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Expert Registration Card */}
                  <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20 hover:border-purple-400/30 transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4">
                        <Shield className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-white mb-2">Join as Expert</CardTitle>
                      <p className="text-gray-400">Become a verified expert and earn rewards for quality evaluations</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Stake tokens to participate</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Earn rewards for accurate evaluations</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Build reputation and tier status</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Participate in DAO governance</span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                          onClick={() => handleAuth('signup', 'expert')}
                        >
                          <UserPlus className="mr-2 w-4 h-4" />
                          Sign Up as Expert
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
                          onClick={() => handleAuth('login', 'expert')}
                        >
                          <LogIn className="mr-2 w-4 h-4" />
                          Login as Expert
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Project Submitter Card */}
                  <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-500/20 hover:border-blue-400/30 transition-all duration-300">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mb-4">
                        <FileCheck className="w-8 h-8 text-white" />
                      </div>
                      <CardTitle className="text-2xl text-white mb-2">Submit Project</CardTitle>
                      <p className="text-gray-400">Get comprehensive due diligence for your blockchain project</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Professional evaluation by verified experts</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Comprehensive reports with scoring</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Multi-dimensional analysis</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-300">
                          <CheckCircle className="w-5 h-5 text-green-400" />
                          <span>Transparent and unbiased evaluation</span>
                        </div>
                      </div>
                      <div className="space-y-2 pt-4">
                        <Button 
                          className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                          onClick={() => handleAuth('signup', 'submitter')}
                        >
                          <UserPlus className="mr-2 w-4 h-4" />
                          Sign Up to Submit
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                          onClick={() => handleAuth('login', 'submitter')}
                        >
                          <LogIn className="mr-2 w-4 h-4" />
                          Login to Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* Authentication Form */
                <Card className="bg-gray-900/50 border-gray-800 max-w-2xl mx-auto">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mb-4">
                      {authMode === 'login' ? 
                        <LogIn className="w-8 h-8 text-white" /> : 
                        <UserPlus className="w-8 h-8 text-white" />
                      }
                    </div>
                    <CardTitle className="text-2xl text-white mb-2">
                      {authMode === 'login' ? 'Welcome Back' : 'Join the Platform'}
                    </CardTitle>
                    <p className="text-gray-400">
                      {authMode === 'login' ? 'Sign in to your account' : 
                       `Create your ${userType} account to get started`}
                    </p>
                    <div className="flex justify-center mt-4">
                      <Badge variant="outline" className={`${
                        userType === 'expert' 
                          ? 'border-purple-500/50 text-purple-400' 
                          : 'border-blue-500/50 text-blue-400'
                      }`}>
                        {userType === 'expert' ? 'Expert Account' : 'Project Submitter'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAuthSubmit} className="space-y-6">
                      {/* Basic Auth Fields */}
                      {authMode === 'signup' && (
                        <div>
                          <label className="block text-white font-medium mb-2">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <Input
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                              required
                            />
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Email Address</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter your email"
                            className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white font-medium mb-2">Password</label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <Input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-white"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {authMode === 'signup' && (
                        <>
                          <div>
                            <label className="block text-white font-medium mb-2">Confirm Password</label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <Input
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                                required
                              />
                            </div>
                          </div>

                          {/* Expert-specific fields */}
                          {userType === 'expert' && (
                            <>
                              <div>
                                <label className="block text-white font-medium mb-2">Company/Organization</label>
                                <Input
                                  name="company"
                                  value={formData.company}
                                  onChange={handleInputChange}
                                  placeholder="Current company or organization"
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                />
                              </div>
                              
                              <div>
                                <label className="block text-white font-medium mb-2">Areas of Expertise</label>
                                <Input
                                  name="expertise"
                                  value={formData.expertise}
                                  onChange={handleInputChange}
                                  placeholder="e.g., DeFi, NFTs, Layer 2, Smart Contracts"
                                  className="bg-gray-800/50 border-gray-700 text-white"
                                />
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-white font-medium mb-2">LinkedIn Profile</label>
                                  <Input
                                    name="linkedIn"
                                    value={formData.linkedIn}
                                    onChange={handleInputChange}
                                    placeholder="LinkedIn URL"
                                    className="bg-gray-800/50 border-gray-700 text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-white font-medium mb-2">GitHub Profile</label>
                                  <Input
                                    name="github"
                                    value={formData.github}
                                    onChange={handleInputChange}
                                    placeholder="GitHub URL"
                                    className="bg-gray-800/50 border-gray-700 text-white"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <label className="block text-white font-medium mb-2">Experience Summary</label>
                                <Textarea
                                  name="experience"
                                  value={formData.experience}
                                  onChange={handleInputChange}
                                  placeholder="Brief summary of your blockchain/Web3 experience and qualifications"
                                  className="bg-gray-800/50 border-gray-700 text-white min-h-[100px]"
                                />
                              </div>
                            </>
                          )}
                        </>
                      )}

                      <div className="flex flex-col space-y-3 pt-4">
                        <Button
                          type="submit"
                          className={`w-full py-3 ${
                            userType === 'expert'
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600'
                              : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
                          }`}
                        >
                          {authMode === 'login' ? 'Sign In' : 'Create Account'}
                        </Button>
                        
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                            className="text-gray-400 hover:text-white transition-colors text-sm"
                          >
                            {authMode === 'login' 
                              ? "Don't have an account? Sign up" 
                              : "Already have an account? Sign in"}
                          </button>
                        </div>
                        
                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode(null)
                              setUserType(null)
                              setActiveTab('overview')
                            }}
                            className="text-gray-500 hover:text-gray-400 transition-colors text-sm"
                          >
                            ← Back to options
                          </button>
                        </div>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Platform Features */}
      <div className="py-20 bg-black/40 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Platform Features</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Comprehensive due diligence through verified expertise and transparent evaluation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon
              return (
                <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-800/50 transition-all duration-300 group">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}