"use client"

import { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubscriptionFormData } from "./schema"

interface ConsultationPreferencesSectionProps {
  form: UseFormReturn<SubscriptionFormData>
}

export function ConsultationPreferencesSection({ form }: ConsultationPreferencesSectionProps) {
  const scheduleOptions = [
    { value: "MORNING", label: "Morning (9 AM - 12 PM)" },
    { value: "AFTERNOON", label: "Afternoon (12 PM - 5 PM)" },
    { value: "EVENING", label: "Evening (5 PM - 8 PM)" },
    { value: "FLEXIBLE", label: "Flexible" }
  ]

  const communicationOptions = [
    { value: "EMAIL", label: "Email" },
    { value: "PHONE", label: "Phone" },
    { value: "SLACK", label: "Slack" },
    { value: "VIDEO_CALL", label: "Video Call" }
  ]

  return (
    <Card className="mb-6 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white text-xl">Consultation Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="preferredSchedule"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Preferred Schedule</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select preferred time" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {scheduleOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="communicationPreference"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Communication Preference</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                      <SelectValue placeholder="Select communication method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    {communicationOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}