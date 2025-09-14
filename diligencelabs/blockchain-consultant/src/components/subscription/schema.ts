import * as z from "zod"

export const subscriptionFormSchema = z.object({
  // Account Information (for non-authenticated users)
  fullName: z.string().optional(),
  email: z.string().optional(), 
  password: z.string().optional(),
  confirmPassword: z.string().optional(),
  company: z.string().optional(),
  
  // Service Selection
  primaryService: z.enum(["STRATEGIC_ADVISORY", "DUE_DILIGENCE", "TOKEN_LAUNCH", "BLOCKCHAIN_INTEGRATION_ADVISORY"], {
    required_error: "Please select your primary service need",
  }),
  additionalServices: z.array(z.string()).optional(),
  
  // Project Information
  projectName: z.string().min(1, "Project name is required"),
  projectDescription: z.string().min(10, "Please provide details about your project"),
  primaryGoals: z.string().min(5, "Please describe your primary goals"),
  timeline: z.enum(["IMMEDIATE", "1_MONTH", "3_MONTHS", "6_MONTHS"], {
    required_error: "Please select your timeline",
  }),
  budgetRange: z.enum(["UNDER_10K", "10K_50K", "50K_100K", "100K_PLUS"], {
    required_error: "Please select your budget range",
  }),
  teamSize: z.enum(["SOLO", "2_5", "6_10", "11_PLUS"], {
    required_error: "Please select your team size",
  }),
  industryFocus: z.string().min(1, "Please specify your industry focus"),
  specificChallenges: z.string().optional(),
  
  // Consultation Preferences
  preferredSchedule: z.enum(["MORNING", "AFTERNOON", "EVENING", "FLEXIBLE"]).optional(),
  communicationPreference: z.enum(["EMAIL", "PHONE", "SLACK", "VIDEO_CALL"]).optional(),
}).superRefine((data, ctx) => {
  // Only validate account fields if user is actually trying to create an account
  if (data.fullName && data.email && data.password) {
    if (data.fullName.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Full name must be at least 2 characters",
        path: ["fullName"]
      })
    }
    if (!z.string().email().safeParse(data.email).success) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please enter a valid email address",
        path: ["email"]
      })
    }
    if (data.password.length < 6) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Password must be at least 6 characters",
        path: ["password"]
      })
    }
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match",
        path: ["confirmPassword"]
      })
    }
    if (!data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Please confirm your password",
        path: ["confirmPassword"]
      })
    }
  }
})

export type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>

export const serviceOptions = [
  {
    value: "STRATEGIC_ADVISORY",
    label: "Strategic Advisory",
    description: "Navigate complex blockchain landscapes with expert guidance",
    color: "from-blue-500 to-cyan-500"
  },
  {
    value: "DUE_DILIGENCE",
    label: "Due Diligence",
    description: "Comprehensive analysis of technical architecture and market potential",
    color: "from-purple-500 to-pink-500"
  },
  {
    value: "TOKEN_LAUNCH",
    label: "Token Launch Consultation",
    description: "End-to-end guidance for successful token launches",
    color: "from-green-500 to-emerald-500"
  },
  {
    value: "BLOCKCHAIN_INTEGRATION_ADVISORY",
    label: "Blockchain Integration Advisory",
    description: "Strategic guidance on blockchain deployment and technical solutions",
    color: "from-orange-500 to-red-500"
  }
]