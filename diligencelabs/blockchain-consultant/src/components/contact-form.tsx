"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GlassMorphismCard } from "@/components/ui/consistent-theme"
import { 
  AccessibleInput, 
  AccessibleTextarea, 
  AccessibleSelect, 
  AccessibleButton,
  useFormValidation 
} from "@/components/ui/accessible-form"
import { useAccessibility } from "@/components/ui/accessibility"
import { motion } from "framer-motion"

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
  const { errors, validateField, setFieldError, clearErrors } = useFormValidation()
  const { announceToScreenReader } = useAccessibility()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    clearErrors()

    // Enhanced validation
    const nameError = validateField("Name", formData.name, { required: true })
    const emailError = validateField("Email", formData.email, { required: true, email: true })
    const messageError = validateField("Message", formData.message, { required: true, minLength: 10 })

    if (nameError) setFieldError("name", nameError)
    if (emailError) setFieldError("email", emailError)
    if (messageError) setFieldError("message", messageError)

    if (nameError || emailError || messageError) {
      setIsLoading(false)
      announceToScreenReader("Form contains errors. Please review and correct.")
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
        announceToScreenReader("Message sent successfully! We'll get back to you soon.")
        // Reset form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: ""
        })
      } else {
        const errorMsg = data.error || "Failed to send message"
        setError(errorMsg)
        announceToScreenReader(`Error: ${errorMsg}`)
      }
    } catch (error) {
      const errorMsg = "An error occurred while sending your message"
      setError(errorMsg)
      announceToScreenReader(`Error: ${errorMsg}`)
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
        <GlassMorphismCard variant="accent" hover={true}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative group"
          >
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
                  Thank you for reaching out. We&apos;ll get back to you soon.
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
          </motion.div>
        </GlassMorphismCard>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <GlassMorphismCard variant="primary" hover={true}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative group"
        >
          <Card className="bg-transparent border-0 relative z-10">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-light text-white">
                Get In <span className="font-normal bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Touch</span>
              </CardTitle>
              <CardDescription className="text-gray-400 text-lg">
                Have questions? We&apos;d love to hear from you.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" role="form" aria-label="Contact form">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AccessibleInput
                    label="Full Name"
                    type="text"
                    value={formData.name}
                    onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
                    required
                    placeholder="Your full name"
                    errorMessage={errors.name}
                    helpText="Enter your full name as you'd like us to address you"
                    autoComplete="name"
                  />

                  <AccessibleInput
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
                    required
                    placeholder="your@email.com"
                    errorMessage={errors.email}
                    helpText="We'll use this to respond to your inquiry"
                    autoComplete="email"
                  />
                </div>

                <AccessibleSelect
                  label="Subject"
                  value={formData.subject}
                  onChange={(value) => setFormData(prev => ({ ...prev, subject: contactSubjects.find(s => s.value === value)?.label || "" }))}
                  options={contactSubjects}
                  placeholder="Select a subject"
                  helpText="Choose the topic that best describes your inquiry"
                />

                <AccessibleTextarea
                  label="Message"
                  value={formData.message}
                  onChange={(value) => setFormData(prev => ({ ...prev, message: value }))}
                  required
                  placeholder="Tell us about your project or question..."
                  errorMessage={errors.message}
                  helpText="Please provide details about your inquiry (minimum 10 characters)"
                  minLength={10}
                  maxLength={1000}
                  rows={5}
                />

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    role="alert"
                    aria-live="polite"
                  >
                    <p className="text-red-400 text-sm flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {error}
                    </p>
                  </motion.div>
                )}

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    aria-label="Send contact message"
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <svg 
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle 
                            className="opacity-25" 
                            cx="12" 
                            cy="12" 
                            r="10" 
                            stroke="currentColor" 
                            strokeWidth="4"
                          />
                          <path 
                            className="opacity-75" 
                            fill="currentColor" 
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        Send Message
                        <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </GlassMorphismCard>
    </div>
  )
}