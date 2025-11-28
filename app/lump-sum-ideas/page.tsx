'use client'

import { Navigation } from '@/components/navigation'
import { LumpSumIdeas } from '@/components/lump-sum-ideas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LightbulbIcon, TrendingUpIcon, DollarSignIcon, CalendarIcon } from 'lucide-react'

export default function LumpSumIdeasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navigation />
      
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">
              <LightbulbIcon className="w-3 h-3 mr-1" />
              Extra Income & Savings
            </Badge>
            <h1 className="text-5xl font-bold mb-4 text-balance">
              Lump-Sum Payment Ideas
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Creative strategies to find extra money for mortgage payoff. Every dollar counts toward your financial freedom.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Quick Stats */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <TrendingUpIcon className="w-4 h-4" />
                  Potential Extra Income
                </CardDescription>
                <CardTitle className="text-2xl">$500-$2,000/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">From side hustles</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <DollarSignIcon className="w-4 h-4" />
                  Windfalls
                </CardDescription>
                <CardTitle className="text-2xl">$2,000-$10,000/yr</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">Tax returns, bonuses</p>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20">
              <CardHeader className="pb-3">
                <CardDescription className="flex items-center gap-1">
                  <CalendarIcon className="w-4 h-4" />
                  Monthly Savings
                </CardDescription>
                <CardTitle className="text-2xl">$300-$800/mo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">From reduced spending</p>
              </CardContent>
            </Card>
          </div>

          <LumpSumIdeas />

          {/* Tips Section */}
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Pro Tips for Maximizing Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Start Small, Think Big</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Even $100 extra per month can save thousands in interest. Pick one easy idea and build momentum.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Automate Your Extra Payments</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Set up automatic transfers to your mortgage the day after you get paid. Out of sight, out of mind.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Combine Strategies</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Mix income generation (side hustles) with expense reduction (no-spend challenges) for maximum impact.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Track Your Progress</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Return to the calculator monthly to see how each extra payment brings your freedom date closer.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
