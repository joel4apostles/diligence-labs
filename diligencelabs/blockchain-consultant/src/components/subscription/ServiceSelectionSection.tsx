"use client"

import { UseFormReturn } from "react-hook-form"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { SubscriptionFormData, serviceOptions } from "./schema"

interface ServiceSelectionSectionProps {
  form: UseFormReturn<SubscriptionFormData>
}

export function ServiceSelectionSection({ form }: ServiceSelectionSectionProps) {
  const watchedService = form.watch("primaryService")
  const selectedService = serviceOptions.find(s => s.value === watchedService)

  return (
    <Card className="mb-6 bg-gradient-to-br from-gray-900/60 to-gray-800/30 backdrop-blur-xl border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white text-xl">Service Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="primaryService"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Primary Service Need</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="Select your primary service need" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-600">
                  {serviceOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${option.color}`}></div>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-gray-400">{option.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedService && (
          <div className="p-4 bg-gradient-to-r from-gray-800/30 to-gray-700/30 rounded-lg border border-gray-600/30">
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${selectedService.color}`}></div>
              <Badge variant="outline" className="border-gray-500 text-gray-300">
                {selectedService.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-400">{selectedService.description}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}