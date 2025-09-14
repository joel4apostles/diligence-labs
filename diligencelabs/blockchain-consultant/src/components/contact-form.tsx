"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ProminentBorder } from "@/components/ui/border-effects"
import { HorizontalDivider } from "@/components/ui/section-divider"

const contactSubjects = [
  { value: "general", label: "General Inquiry" },
  { value: "consultation", label: "Consultation Request" },
  { value: "partnership", label: "Partnership Opportunity" },
  { value: "technical", label: "Technical Question" },
  { value: "support", label: "Support" },
  { value: "other", label: "Other" }
]

export function ContactForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please fill in all required fields")
      setIsLoading(false)
      return
    }

    if (formData.message.length < 10) {
      setError("Message must be at least 10 characters")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        })
      } else {
        setError(data.error || "Failed to send message")
      }
    } catch (error) {
      setError("An error occurred while sending your message")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      subject: contactSubjects.find(s => s.value === value)?.label || ""
    }))
  }

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
          <div className="relative group bg-gradient-to-br from-gray-900/80 to-gray-800/50 backdrop-blur-xl">
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-700 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
            
            <Card className="bg-transparent border-0 relative z-10">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  Message Sent Successfully!
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">
                  Thank you for reaching out. We'll get back to you soon.
                </CardDescription>
              </CardHeader>

              <CardContent className="text-center">
                <p className="text-gray-300 mb-6">
                  We typically respond within 24 hours during business days.
                </p>
                
                <Button
                  onClick={() => setIsSubmitted(false)}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 transition-all duration-300"
                >
                  Send Another Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </ProminentBorder>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ProminentBorder className="rounded-2xl overflow-hidden" animated={true} movingBorder={true}>
        <div className="relative group bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl">
          <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-all duration-700 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
          
          <Card className="bg-transparent border-0 relative z-10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-white">
                Get In <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Have questions? We'd love to hear from you.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-gray-300">Full Name *</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                  <Select onValueChange={handleSelectChange}>
                    <SelectTrigger className="mt-1 bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      {contactSubjects.map((subject) => (
                        <SelectItem 
                          key={subject.value} 
                          value={subject.value}
                          className="hover:bg-gray-700"
                        >
                          {subject.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="message" className="text-gray-300">Message *</Label>
                  <Textarea
                    id="message"
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    className="mt-1 bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 min-h-[120px]"
                    placeholder="Tell us about your project or question (minimum 10 characters)..."
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all duration-300 hover:scale-105"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </ProminentBorder>
    </div>
  )
}