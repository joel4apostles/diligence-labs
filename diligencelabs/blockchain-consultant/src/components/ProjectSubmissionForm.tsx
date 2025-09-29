'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  FileCheck, 
  Globe, 
  Github, 
  Twitter, 
  Linkedin,
  DollarSign,
  Calendar,
  Users,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from 'lucide-react'

interface ProjectSubmissionFormProps {
  onClose: () => void
  onSuccess?: () => void
}

export default function ProjectSubmissionForm({ onClose, onSuccess }: ProjectSubmissionFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    description: '',
    website: '',
    category: '',
    
    // Team Info
    foundingTeam: [{ name: '', role: '', linkedin: '', experience: '' }],
    teamSize: '',
    
    // Technical Details
    blockchain: '',
    technologyStack: [] as string[],
    smartContract: '',
    repository: '',
    whitepaper: '',
    
    // Business Metrics
    fundingRaised: '',
    userBase: '',
    monthlyRevenue: '',
    currentTraction: '',
    
    // Evaluation Requirements
    evaluationDeadline: '',
    priorityLevel: 'MEDIUM',
    evaluationBudget: '',
    
    // Social Links
    twitterHandle: '',
    linkedinProfile: '',
    discordServer: '',
    telegramGroup: ''
  })

  const projectCategories = [
    'DEFI', 'NFT', 'GAMEFI', 'INFRASTRUCTURE', 'LAYER2', 
    'DAO', 'METAVERSE', 'SOCIAL', 'PRIVACY', 'LENDING',
    'DEX', 'STABLECOIN', 'BRIDGE', 'WALLET', 'TOOLING', 'OTHER'
  ]

  const blockchains = [
    'Ethereum', 'Polygon', 'Arbitrum', 'Optimism', 'Base',
    'Avalanche', 'BNB Chain', 'Solana', 'Sui', 'Aptos'
  ]

  const technologyOptions = [
    'Smart Contracts', 'DeFi Protocols', 'NFT Standards', 'Layer 2 Solutions',
    'Cross-chain Bridges', 'Oracle Integration', 'DAO Governance', 'Tokenomics',
    'MEV Protection', 'Yield Farming', 'Liquidity Mining', 'Staking'
  ]

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      foundingTeam: [...prev.foundingTeam, { name: '', role: '', linkedin: '', experience: '' }]
    }))
  }

  const updateTeamMember = (index: number, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      foundingTeam: prev.foundingTeam.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }))
  }

  const removeTeamMember = (index: number) => {
    setFormData(prev => ({
      ...prev,
      foundingTeam: prev.foundingTeam.filter((_, i) => i !== index)
    }))
  }

  const toggleTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      technologyStack: prev.technologyStack.includes(tech)
        ? prev.technologyStack.filter(t => t !== tech)
        : [...prev.technologyStack, tech]
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamSize: formData.teamSize ? parseInt(formData.teamSize) : null,
          fundingRaised: formData.fundingRaised ? parseFloat(formData.fundingRaised) : null,
          userBase: formData.userBase ? parseInt(formData.userBase) : null,
          monthlyRevenue: formData.monthlyRevenue ? parseFloat(formData.monthlyRevenue) : null,
          evaluationBudget: formData.evaluationBudget ? parseFloat(formData.evaluationBudget) : null
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit project')
      }

      setSuccess(true)
      onSuccess?.()
      
      setTimeout(() => {
        onClose()
      }, 2000)

    } catch (error) {
      console.error('Project submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to submit project')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.category
      case 2:
        return formData.foundingTeam[0].name && formData.foundingTeam[0].role
      case 3:
        return true // Technical details are optional
      case 4:
        return true // All fields optional in final step
      default:
        return false
    }
  }

  if (success) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Project Submitted!</h3>
          <p className="text-gray-400 mb-4">
            Your project has been successfully submitted for due diligence evaluation.
          </p>
          <p className="text-sm text-gray-500">
            You'll receive an email notification once experts are assigned to your project.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="bg-gray-900/50 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-white mb-2">Submit Project for Due Diligence</CardTitle>
              <p className="text-gray-400">Step {currentStep} of 4</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="border-gray-600 text-gray-400"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 mt-4">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Basic Project Information</h3>
              
              <div>
                <label className="block text-white font-medium mb-2">Project Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter your project name"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Project Description *</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your project, its purpose, and key features"
                  className="bg-gray-800/50 border-gray-700 text-white min-h-[120px]"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Category *</label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select project category" />
                  </SelectTrigger>
                  <SelectContent>
                    {projectCategories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={formData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://yourproject.com"
                    className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Team Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Team Information</h3>
              
              <div>
                <label className="block text-white font-medium mb-2">Team Size</label>
                <Input
                  type="number"
                  value={formData.teamSize}
                  onChange={(e) => handleInputChange('teamSize', e.target.value)}
                  placeholder="Total team members"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-white font-medium">Founding Team *</label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTeamMember}
                    className="border-blue-500/30 text-blue-400"
                  >
                    Add Member
                  </Button>
                </div>
                
                {formData.foundingTeam.map((member, index) => (
                  <Card key={index} className="bg-gray-800/30 border-gray-700 mb-4">
                    <CardContent className="p-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Name</label>
                          <Input
                            value={member.name}
                            onChange={(e) => updateTeamMember(index, 'name', e.target.value)}
                            placeholder="Founder name"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Role</label>
                          <Input
                            value={member.role}
                            onChange={(e) => updateTeamMember(index, 'role', e.target.value)}
                            placeholder="CEO, CTO, etc."
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">LinkedIn</label>
                          <Input
                            value={member.linkedin}
                            onChange={(e) => updateTeamMember(index, 'linkedin', e.target.value)}
                            placeholder="LinkedIn profile URL"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 text-sm mb-1">Experience</label>
                          <Input
                            value={member.experience}
                            onChange={(e) => updateTeamMember(index, 'experience', e.target.value)}
                            placeholder="Years of experience"
                            className="bg-gray-800/50 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      {formData.foundingTeam.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeTeamMember(index)}
                          className="mt-2 border-red-500/30 text-red-400"
                        >
                          Remove
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Technical Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Technical Information</h3>
              
              <div>
                <label className="block text-white font-medium mb-2">Blockchain</label>
                <Select value={formData.blockchain} onValueChange={(value) => handleInputChange('blockchain', value)}>
                  <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                    <SelectValue placeholder="Select blockchain" />
                  </SelectTrigger>
                  <SelectContent>
                    {blockchains.map(blockchain => (
                      <SelectItem key={blockchain} value={blockchain}>
                        {blockchain}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-white font-medium mb-3">Technology Stack</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {technologyOptions.map(tech => (
                    <button
                      key={tech}
                      type="button"
                      onClick={() => toggleTechnology(tech)}
                      className={`p-2 rounded-lg border text-sm transition-all ${
                        formData.technologyStack.includes(tech)
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-gray-800/30 border-gray-600 text-gray-400 hover:border-gray-500'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Smart Contract Address</label>
                  <Input
                    value={formData.smartContract}
                    onChange={(e) => handleInputChange('smartContract', e.target.value)}
                    placeholder="0x..."
                    className="bg-gray-800/50 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Repository</label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.repository}
                      onChange={(e) => handleInputChange('repository', e.target.value)}
                      placeholder="GitHub repository URL"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Whitepaper</label>
                <Input
                  value={formData.whitepaper}
                  onChange={(e) => handleInputChange('whitepaper', e.target.value)}
                  placeholder="Link to whitepaper or documentation"
                  className="bg-gray-800/50 border-gray-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Step 4: Business & Evaluation Details */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-white mb-4">Business Metrics & Evaluation Requirements</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Funding Raised (USD)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.fundingRaised}
                      onChange={(e) => handleInputChange('fundingRaised', e.target.value)}
                      placeholder="0"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">User Base</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="number"
                      value={formData.userBase}
                      onChange={(e) => handleInputChange('userBase', e.target.value)}
                      placeholder="Number of users"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Current Traction</label>
                <Textarea
                  value={formData.currentTraction}
                  onChange={(e) => handleInputChange('currentTraction', e.target.value)}
                  placeholder="Describe your current traction, partnerships, achievements"
                  className="bg-gray-800/50 border-gray-700 text-white min-h-[80px]"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Evaluation Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      type="date"
                      value={formData.evaluationDeadline}
                      onChange={(e) => handleInputChange('evaluationDeadline', e.target.value)}
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Priority Level</label>
                  <Select value={formData.priorityLevel} onValueChange={(value) => handleInputChange('priorityLevel', value)}>
                    <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Twitter Handle</label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.twitterHandle}
                      onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                      placeholder="@yourproject"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">LinkedIn Profile</label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      value={formData.linkedinProfile}
                      onChange={(e) => handleInputChange('linkedinProfile', e.target.value)}
                      placeholder="LinkedIn company page"
                      className="pl-10 bg-gray-800/50 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-8">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="border-gray-600 text-gray-400"
            >
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStepValid()}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4 mr-2" />
                    Submit Project
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}