"use client"

import { UseFormReturn } from "react-hook-form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubscriptionFormData } from "./schema"

interface ProjectInfoSectionProps {
  form: UseFormReturn<SubscriptionFormData>
}

export function ProjectInfoSection({ form }: ProjectInfoSectionProps) {
  const timelineOptions = [
    { value: "IMMEDIATE", label: "Immediate (Within 2 weeks)" },
    { value: "1_MONTH", label: "1 Month" },
    { value: "3_MONTHS", label: "3 Months" },
    { value: "6_MONTHS", label: "6 Months or more" }
  ]

  const budgetOptions = [
    { value: "UNDER_10K", label: "Under $10,000" },
    { value: "10K_50K", label: "$10,000 - $50,000" },
    { value: "50K_100K", label: "$50,000 - $100,000" },
    { value: "100K_PLUS", label: "$100,000+" }
  ]

  const teamSizeOptions = [
    { value: "SOLO", label: "Solo founder" },
    { value: "2_5", label: "2-5 people" },
    { value: "6_10", label: "6-10 people" },
    { value: "11_PLUS", label: "11+ people" }
  ]

  return (
    <Card className="mb-6 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white text-xl">Project Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="projectName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Project Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your project name" 
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="projectDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Project Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your blockchain project, including the problem it solves and target market"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="primaryGoals"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Primary Goals</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What are your main objectives for this consultation?"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="timeline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Timeline</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {timelineOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetRange"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Budget Range</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select budget" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {budgetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="teamSize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Team Size</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select team size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {teamSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="industryFocus"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Industry Focus</FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., DeFi, NFTs, Gaming, Supply Chain, Healthcare"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specificChallenges"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Specific Challenges (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What specific challenges or blockers are you facing?"
                  className="bg-gray-800/50 border-gray-600 text-white placeholder:text-gray-400 min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}