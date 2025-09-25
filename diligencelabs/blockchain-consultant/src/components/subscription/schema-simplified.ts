import * as z from "zod"

// Simplified subscription form with only 5 essential fields for better conversion
export const simplifiedSubscriptionSchema = z.object({
  // Service Selection - Required
  service: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION"], {
    required_error: "Please select a service package",
  }),
  
  // Project Overview - Required
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(20, "Please provide at least 20 characters describing your project"),
  
  // Budget - Required  
  budget: z.enum(["STRATEGIC_1500", "DUE_DILIGENCE_2500", "TOKEN_LAUNCH_5000", "MONTHLY_3000"], {
    required_error: "Please select a service package",
  }),
  
  // Timeline - Required
  timeline: z.enum(["ASAP", "1_WEEK", "2_WEEKS", "1_MONTH"], {
    required_error: "Please select when you need this completed",
  }),
})

export type SimplifiedSubscriptionData = z.infer<typeof simplifiedSubscriptionSchema>

// New service packages with clear pricing and deliverables
export const servicePackages = [
  {
    value: "STRATEGIC_ADVISORY",
    budgetValue: "STRATEGIC_1500",
    label: "Strategic Review",
    price: "$1,500",
    duration: "1-time",
    description: "Comprehensive blockchain strategy assessment and recommendations",
    deliverables: [
      "Market analysis and competitive positioning",
      "Technology stack recommendations", 
      "Implementation roadmap",
      "Risk assessment",
      "30-min follow-up call"
    ],
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "DUE_DILIGENCE", 
    budgetValue: "DUE_DILIGENCE_2500",
    label: "Due Diligence Report",
    price: "$2,500",
    duration: "1-time", 
    description: "Deep technical and business analysis of blockchain projects",
    deliverables: [
      "Technical architecture review",
      "Smart contract audit summary",
      "Team and background verification",
      "Market potential analysis",
      "Detailed written report (15-20 pages)",
      "Executive summary presentation"
    ],
    color: "from-purple-500 to-pink-500"
  },
  {
    value: "TOKEN_LAUNCH",
    budgetValue: "TOKEN_LAUNCH_5000", 
    label: "Token Launch Package",
    price: "$5,000",
    duration: "1-time",
    description: "Complete token launch strategy and execution guidance",
    deliverables: [
      "Tokenomics design and modeling",
      "Launch strategy and timeline",
      "Regulatory compliance review",
      "Marketing and community building plan",
      "Exchange listing strategy",
      "Post-launch monitoring plan",
      "2 hours of consultation calls"
    ],
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "BLOCKCHAIN_INTEGRATION",
    budgetValue: "MONTHLY_3000",
    label: "Monthly Retainer", 
    price: "$3,000",
    duration: "/month",
    description: "Ongoing strategic advisory and implementation support",
    deliverables: [
      "4 hours of consultation calls per month",
      "Unlimited email support",
      "Technology vendor evaluations",
      "Monthly strategy reviews",
      "Priority support for urgent issues",
      "Flexible service allocation"
    ],
    color: "from-orange-500 to-red-500"
  }
]

export const timelineOptions = [
  { value: "ASAP", label: "ASAP (Rush fee may apply)" },
  { value: "1_WEEK", label: "Within 1 week" },
  { value: "2_WEEKS", label: "Within 2 weeks" },
  { value: "1_MONTH", label: "Within 1 month" }
]