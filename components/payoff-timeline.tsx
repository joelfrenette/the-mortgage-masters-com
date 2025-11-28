'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface PayoffTimelineProps {
  standardYears: number
  optimizedYears: number
  startYear: number
}

export function PayoffTimeline({ standardYears, optimizedYears, startYear }: PayoffTimelineProps) {
  const standardEndYear = startYear + standardYears
  const optimizedEndYear = startYear + optimizedYears
  const currentYear = new Date().getFullYear()
  const progressPercent = ((currentYear - startYear) / optimizedYears) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payoff Timeline</CardTitle>
        <CardDescription>Track your journey to mortgage freedom</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">Current Progress</span>
            <span className="text-sm text-muted-foreground">{Math.min(progressPercent, 100).toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(progressPercent, 100)} className="h-3" />
        </div>

        {/* Timeline Visualization */}
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">{startYear}</div>
              <div className="flex-1 h-2 bg-muted rounded-full relative overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-primary rounded-full"
                  style={{ width: `${(optimizedYears / standardYears) * 100}%` }}
                />
              </div>
              <div className="w-24 text-sm font-medium text-right">{standardEndYear}</div>
            </div>
            <div className="mt-2 ml-24">
              <p className="text-xs text-muted-foreground">Standard 30-year timeline</p>
            </div>
          </div>

          <div className="relative">
            <div className="flex items-center gap-4">
              <div className="w-24 text-sm font-medium">{startYear}</div>
              <div className="flex-1 h-4 bg-gradient-to-r from-primary to-green-600 rounded-full relative">
                <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-2">
                  <div className="w-6 h-6 bg-green-600 rounded-full border-4 border-background" />
                </div>
              </div>
              <div className="w-24 text-sm font-bold text-green-600 text-right">{Math.round(optimizedEndYear)}</div>
            </div>
            <div className="mt-2 ml-24">
              <p className="text-xs font-medium text-green-600">✨ Your optimized timeline - {(standardYears - optimizedYears).toFixed(1)} years faster!</p>
            </div>
          </div>
        </div>

        {/* Milestones */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Start Date</p>
            <p className="text-lg font-bold">{startYear}</p>
          </div>
          <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary/20">
            <p className="text-sm text-muted-foreground mb-1">Freedom Date</p>
            <p className="text-lg font-bold text-primary">{Math.round(optimizedEndYear)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
