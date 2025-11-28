'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingDownIcon, CalendarIcon, DollarSignIcon } from 'lucide-react'

interface StrategyComparisonProps {
  loanAmount: number
  interestRate: number
  loanTermYears: number
  standardPayment: number
}

export function StrategyComparison({ loanAmount, interestRate, loanTermYears, standardPayment }: StrategyComparisonProps) {
  const monthlyRate = interestRate / 100 / 12
  const numberOfPayments = loanTermYears * 12

  // Calculate different strategies
  const strategies = [
    {
      name: 'Extra $200/month',
      description: 'Add $200 to your monthly payment',
      calculation: calculateStrategy(200, 0, false),
      color: 'bg-blue-500/10 border-blue-500/20 text-blue-600'
    },
    {
      name: 'Extra $500/month',
      description: 'Add $500 to your monthly payment',
      calculation: calculateStrategy(500, 0, false),
      color: 'bg-purple-500/10 border-purple-500/20 text-purple-600'
    },
    {
      name: 'Bi-Weekly Payments',
      description: 'Pay half your mortgage every 2 weeks',
      calculation: calculateStrategy(0, 0, true),
      color: 'bg-green-500/10 border-green-500/20 text-green-600'
    },
    {
      name: '$10k Lump Sum (Year 1)',
      description: 'One-time payment in the first year',
      calculation: calculateStrategy(0, 10000, false),
      color: 'bg-orange-500/10 border-orange-500/20 text-orange-600'
    }
  ]

  function calculateStrategy(extraPayment: number, lumpSum: number, biWeekly: boolean) {
    let balance = loanAmount
    let totalInterest = 0
    let months = 0
    const maxMonths = numberOfPayments * 2

    for (let i = 0; i < maxMonths; i++) {
      const rate = biWeekly ? monthlyRate / 2 : monthlyRate
      const interest = balance * rate
      totalInterest += interest
      
      let payment = biWeekly ? standardPayment / 2 : standardPayment + extraPayment
      let principal = payment - interest
      
      if (lumpSum > 0 && i === (biWeekly ? 26 : 12)) {
        principal += lumpSum
      }
      
      balance -= principal
      months++
      
      if (balance <= 0) break
    }

    const years = biWeekly ? months / 26 : months / 12
    const standardTotalInterest = standardPayment * numberOfPayments - loanAmount
    const saved = standardTotalInterest - totalInterest
    const timeSaved = loanTermYears - years

    return {
      years: years.toFixed(1),
      interestSaved: Math.round(saved),
      timeSaved: timeSaved.toFixed(1)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy Comparison</CardTitle>
        <CardDescription>Compare different payoff strategies side by side</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {strategies.map((strategy, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 ${strategy.color} transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{strategy.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{strategy.description}</p>
                </div>
                <Badge variant="outline" className="bg-background">
                  Rank #{index + 1}
                </Badge>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <DollarSignIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Interest Saved</p>
                    <p className="font-bold">${strategy.calculation.interestSaved.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Time Saved</p>
                    <p className="font-bold">{strategy.calculation.timeSaved} yrs</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingDownIcon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Payoff In</p>
                    <p className="font-bold">{strategy.calculation.years} yrs</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
