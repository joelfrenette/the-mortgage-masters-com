'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DollarSignIcon, TrendingDownIcon, BriefcaseIcon, ShoppingBagIcon, LightbulbIcon, PiggyBankIcon, CalendarIcon, SparklesIcon } from 'lucide-react'
import { useState } from 'react'

type IdeaCategory = 'windfalls' | 'side-hustle' | 'no-spend' | 'selling' | 'reduce-expenses'

interface LumpSumIdea {
  title: string
  description: string
  estimatedAmount: string
  category: IdeaCategory
  frequency: string
  icon: any
}

const lumpSumIdeas: LumpSumIdea[] = [
  // Windfalls
  {
    title: 'Tax Return Deposit',
    description: 'Apply your annual tax refund directly to mortgage principal',
    estimatedAmount: '$2,000 - $5,000',
    category: 'windfalls',
    frequency: 'Yearly',
    icon: DollarSignIcon
  },
  {
    title: 'Work Bonus Deposit',
    description: 'Put your annual or quarterly bonus toward the mortgage',
    estimatedAmount: '$1,000 - $10,000',
    category: 'windfalls',
    frequency: 'Yearly/Quarterly',
    icon: SparklesIcon
  },
  
  // Side Hustles
  {
    title: 'Dog Walking',
    description: 'Walk dogs on weekends through Rover or Wag',
    estimatedAmount: '$200 - $500/mo',
    category: 'side-hustle',
    frequency: 'Monthly',
    icon: BriefcaseIcon
  },
  {
    title: 'Donate Plasma',
    description: 'Regular plasma donations at local centers',
    estimatedAmount: '$200 - $400/mo',
    category: 'side-hustle',
    frequency: 'Monthly',
    icon: DollarSignIcon
  },
  {
    title: 'Weekend Gig Work',
    description: 'Uber, DoorDash, or TaskRabbit on weekends',
    estimatedAmount: '$300 - $800/mo',
    category: 'side-hustle',
    frequency: 'Monthly',
    icon: BriefcaseIcon
  },
  {
    title: 'Freelance Skills',
    description: 'Use your professional skills for freelance projects',
    estimatedAmount: '$500 - $2,000/mo',
    category: 'side-hustle',
    frequency: 'Monthly',
    icon: LightbulbIcon
  },
  
  // No-Spend Challenges
  {
    title: 'No Dine-Out Month',
    description: 'Cook all meals at home for one month',
    estimatedAmount: '$400 - $800',
    category: 'no-spend',
    frequency: 'Monthly Challenge',
    icon: TrendingDownIcon
  },
  {
    title: 'No Shopping Month',
    description: 'Buy only essentials (groceries, gas) for 30 days',
    estimatedAmount: '$300 - $600',
    category: 'no-spend',
    frequency: 'Monthly Challenge',
    icon: ShoppingBagIcon
  },
  
  // Selling Items
  {
    title: 'Yard Sale Month',
    description: 'Declutter and sell items you no longer need',
    estimatedAmount: '$200 - $1,000',
    category: 'selling',
    frequency: 'One-Time',
    icon: ShoppingBagIcon
  },
  {
    title: 'Online Marketplace Sales',
    description: 'Sell items on Facebook Marketplace, eBay, or Poshmark',
    estimatedAmount: '$100 - $500',
    category: 'selling',
    frequency: 'Monthly',
    icon: ShoppingBagIcon
  },
  
  // Reduce Expenses
  {
    title: 'Quarterly Subscription Review',
    description: 'Cancel unused subscriptions and services',
    estimatedAmount: '$50 - $200/mo',
    category: 'reduce-expenses',
    frequency: 'Quarterly',
    icon: CalendarIcon
  },
  {
    title: 'Negotiate Bills',
    description: 'Call providers to negotiate lower rates on internet, phone, insurance',
    estimatedAmount: '$50 - $150/mo',
    category: 'reduce-expenses',
    frequency: 'Yearly',
    icon: TrendingDownIcon
  },
  {
    title: 'Refinance Auto Loans',
    description: 'Lower interest rates on car loans and apply savings',
    estimatedAmount: '$50 - $200/mo',
    category: 'reduce-expenses',
    frequency: 'One-Time',
    icon: PiggyBankIcon
  }
]

const categoryConfig = {
  windfalls: { label: 'Windfalls', color: 'bg-green-100 text-green-800 border-green-300' },
  'side-hustle': { label: 'Side Hustles', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  'no-spend': { label: 'No-Spend Challenges', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  selling: { label: 'Selling Items', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  'reduce-expenses': { label: 'Reduce Expenses', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' }
}

export function LumpSumIdeas() {
  const [selectedCategory, setSelectedCategory] = useState<IdeaCategory | 'all'>('all')
  
  const filteredIdeas = selectedCategory === 'all' 
    ? lumpSumIdeas 
    : lumpSumIdeas.filter(idea => idea.category === selectedCategory)

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LightbulbIcon className="w-6 h-6 text-primary" />
          Lump-Sum Payment Ideas
        </CardTitle>
        <CardDescription>
          Creative strategies to accelerate your mortgage payoff
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Ideas
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(key as IdeaCategory)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Ideas Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea, index) => {
            const Icon = idea.icon
            const categoryStyle = categoryConfig[idea.category]
            
            return (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                    <Badge variant="outline" className={`${categoryStyle.color} border text-xs`}>
                      {idea.frequency}
                    </Badge>
                  </div>
                  <CardTitle className="text-base leading-tight">{idea.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {idea.description}
                  </p>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Potential</span>
                      <span className="text-sm font-semibold text-primary">{idea.estimatedAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Summary Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <SparklesIcon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Maximize Your Impact</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Combine multiple strategies for the biggest impact. Even small amounts add up over time. 
                  Try picking one idea from each category to create a comprehensive payoff plan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
