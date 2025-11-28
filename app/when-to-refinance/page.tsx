'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, TrendingDown, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function WhenToRefinance() {
  // Current mortgage
  const [currentBalance, setCurrentBalance] = useState(450000)
  const [currentRate, setCurrentRate] = useState(6.5)
  const [currentTerm, setCurrentTerm] = useState(30)
  const [yearsRemaining, setYearsRemaining] = useState(25)
  
  // Refinance option 1
  const [refi1Rate, setRefi1Rate] = useState(5.5)
  const [refi1Term, setRefi1Term] = useState(30)
  const [refi1Fees, setRefi1Fees] = useState(5000)
  
  // Refinance option 2
  const [refi2Rate, setRefi2Rate] = useState(4.5)
  const [refi2Term, setRefi2Term] = useState(15)
  const [refi2Fees, setRefi2Fees] = useState(7500)

  const calculateMortgage = (principal: number, annualRate: number, termYears: number) => {
    const monthlyRate = annualRate / 100 / 12
    const numberOfPayments = termYears * 12
    
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
    
    let balance = principal
    let totalInterest = 0
    
    for (let i = 0; i < numberOfPayments; i++) {
      const interestPayment = balance * monthlyRate
      totalInterest += interestPayment
      const principalPayment = monthlyPayment - interestPayment
      balance -= principalPayment
      if (balance <= 0) break
    }
    
    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(principal + totalInterest)
    }
  }

  const current = useMemo(() => {
    return calculateMortgage(currentBalance, currentRate, yearsRemaining)
  }, [currentBalance, currentRate, yearsRemaining])

  const refi1 = useMemo(() => {
    const calc = calculateMortgage(currentBalance, refi1Rate, refi1Term)
    const totalCostWithFees = calc.totalCost + refi1Fees
    const savingsVsCurrent = (current.totalCost - totalCostWithFees)
    const breakEvenMonths = Math.ceil(refi1Fees / (current.monthlyPayment - calc.monthlyPayment))
    
    return {
      ...calc,
      totalCostWithFees,
      savingsVsCurrent,
      breakEvenMonths,
      fees: refi1Fees
    }
  }, [currentBalance, refi1Rate, refi1Term, refi1Fees, current])

  const refi2 = useMemo(() => {
    const calc = calculateMortgage(currentBalance, refi2Rate, refi2Term)
    const totalCostWithFees = calc.totalCost + refi2Fees
    const savingsVsCurrent = (current.totalCost - totalCostWithFees)
    const breakEvenMonths = Math.ceil(refi2Fees / (current.monthlyPayment - calc.monthlyPayment))
    
    return {
      ...calc,
      totalCostWithFees,
      savingsVsCurrent,
      breakEvenMonths,
      fees: refi2Fees
    }
  }, [currentBalance, refi2Rate, refi2Term, refi2Fees, current])

  // Calculate how much interest has already been paid (approximate)
  const yearsIntoMortgage = currentTerm - yearsRemaining
  const monthsIntoMortgage = yearsIntoMortgage * 12
  const originalLoan = currentBalance / (1 - (monthsIntoMortgage * (currentRate / 100 / 12)))
  
  let interestAlreadyPaid = 0
  let bal = originalLoan
  const monthlyRate = currentRate / 100 / 12
  const originalPayment = calculateMortgage(originalLoan, currentRate, currentTerm).monthlyPayment
  
  for (let i = 0; i < monthsIntoMortgage; i++) {
    const interestPayment = bal * monthlyRate
    interestAlreadyPaid += interestPayment
    const principalPayment = originalPayment - interestPayment
    bal -= principalPayment
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">
              <RefreshCw className="w-3 h-3 mr-1" />
              Refinance Analysis
            </Badge>
            <h1 className="text-5xl font-bold mb-4 text-balance">
              When Should You Refinance?
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Understanding front-loaded interest and making smart refinancing decisions based on your situation.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        
        {/* Educational Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-orange-500/30 bg-orange-50/50 dark:bg-orange-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-5 h-5" />
                The Front-Loaded Interest Trap
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed">
                Mortgages are designed so you pay mostly interest in the early years. For a 30-year mortgage at 6.5%, you'll pay approximately:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">Year 1-5:</span>
                  <span>~85% of your payment goes to interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">Year 10:</span>
                  <span>~75% still going to interest</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">Year 15:</span>
                  <span>~60% to interest</span>
                </li>
              </ul>
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  You've already paid <strong>${Math.round(interestAlreadyPaid).toLocaleString()}</strong> in interest over {yearsIntoMortgage} years. Refinancing restarts this cycle!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/30 bg-green-50/50 dark:bg-green-950/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-5 h-5" />
                When Refinancing Makes Sense
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm leading-relaxed font-semibold">
                The BEST time to refinance is when you can "right-size" your mortgage:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Shorten the term</strong> (30-year → 15-year)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Lower rate by 1-2%+</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Payment stays affordable</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Break-even under 3-5 years</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Plan to stay in home 5+ years</strong></span>
                </li>
              </ul>
              <Alert className="mt-4 border-red-500/50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-xs text-red-700 dark:text-red-400">
                  <strong>Don't refinance</strong> just for a lower rate if you're keeping the same term. You'll restart the interest clock!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Calculator Inputs */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <CardTitle>Your Current Mortgage</CardTitle>
            <CardDescription>Enter your existing mortgage details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="currentBalance">Remaining Balance</Label>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input
                    id="currentBalance"
                    type="number"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="currentRate">Interest Rate (%)</Label>
                <Input
                  id="currentRate"
                  type="number"
                  step="0.1"
                  value={currentRate}
                  onChange={(e) => setCurrentRate(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="currentTerm">Original Term (Years)</Label>
                <Input
                  id="currentTerm"
                  type="number"
                  value={currentTerm}
                  onChange={(e) => setCurrentTerm(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="yearsRemaining">Years Remaining</Label>
                <Input
                  id="yearsRemaining"
                  type="number"
                  value={yearsRemaining}
                  onChange={(e) => setYearsRemaining(Number(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Side-by-Side Comparison */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Current Mortgage */}
          <Card className="border-2 border-gray-400">
            <CardHeader className="bg-gray-100 dark:bg-gray-900">
              <CardTitle className="text-lg">Keep Current Mortgage</CardTitle>
              <CardDescription>{currentRate}% for {yearsRemaining} years</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
                <div className="text-3xl font-bold">${current.monthlyPayment.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Interest</div>
                <div className="text-xl font-semibold text-orange-600">${current.totalInterest.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
                <div className="text-lg">${current.totalCost.toLocaleString()}</div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground mb-2">Already Paid in Interest</div>
                <div className="text-lg font-semibold text-red-600">${Math.round(interestAlreadyPaid).toLocaleString()}</div>
              </div>
            </CardContent>
          </Card>

          {/* Refinance Option 1 */}
          <Card className="border-2 border-blue-500">
            <CardHeader className="bg-blue-50 dark:bg-blue-950">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Refinance Option 1</span>
                <Badge variant="outline" className="text-xs">Same Term</Badge>
              </CardTitle>
              <CardDescription>Lower rate, same term length</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <Label htmlFor="refi1Rate" className="text-xs">Rate %</Label>
                  <Input
                    id="refi1Rate"
                    type="number"
                    step="0.1"
                    value={refi1Rate}
                    onChange={(e) => setRefi1Rate(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refi1Term" className="text-xs">Years</Label>
                  <Input
                    id="refi1Term"
                    type="number"
                    value={refi1Term}
                    onChange={(e) => setRefi1Term(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refi1Fees" className="text-xs">Fees $</Label>
                  <Input
                    id="refi1Fees"
                    type="number"
                    value={refi1Fees}
                    onChange={(e) => setRefi1Fees(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
                <div className="text-3xl font-bold">${refi1.monthlyPayment.toLocaleString()}</div>
                <div className="text-xs text-green-600 mt-1">
                  Save ${(current.monthlyPayment - refi1.monthlyPayment).toLocaleString()}/mo
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Interest</div>
                <div className="text-xl font-semibold text-orange-600">${refi1.totalInterest.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Cost (with fees)</div>
                <div className="text-lg">${refi1.totalCostWithFees.toLocaleString()}</div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">Net Savings vs Current</div>
                <div className={`text-2xl font-bold ${refi1.savingsVsCurrent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {refi1.savingsVsCurrent > 0 ? '+' : ''}{refi1.savingsVsCurrent > 0 ? '$' : '-$'}{Math.abs(refi1.savingsVsCurrent).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Break-Even Time</div>
                <div className="text-lg font-semibold">{refi1.breakEvenMonths} months</div>
              </div>
              
              {refi1.savingsVsCurrent < 50000 && (
                <Alert className="border-orange-500/50 bg-orange-50 dark:bg-orange-950/20">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-xs">
                    ⚠️ Limited savings - you're restarting the interest clock!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Refinance Option 2 */}
          <Card className="border-2 border-green-500">
            <CardHeader className="bg-green-50 dark:bg-green-950">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>Refinance Option 2</span>
                <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900">Right-Size</Badge>
              </CardTitle>
              <CardDescription>Lower rate + shorter term</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div>
                  <Label htmlFor="refi2Rate" className="text-xs">Rate %</Label>
                  <Input
                    id="refi2Rate"
                    type="number"
                    step="0.1"
                    value={refi2Rate}
                    onChange={(e) => setRefi2Rate(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refi2Term" className="text-xs">Years</Label>
                  <Input
                    id="refi2Term"
                    type="number"
                    value={refi2Term}
                    onChange={(e) => setRefi2Term(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="refi2Fees" className="text-xs">Fees $</Label>
                  <Input
                    id="refi2Fees"
                    type="number"
                    value={refi2Fees}
                    onChange={(e) => setRefi2Fees(Number(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <div className="text-sm text-muted-foreground">Monthly Payment</div>
                <div className="text-3xl font-bold">${refi2.monthlyPayment.toLocaleString()}</div>
                {refi2.monthlyPayment > current.monthlyPayment ? (
                  <div className="text-xs text-orange-600 mt-1">
                    +${(refi2.monthlyPayment - current.monthlyPayment).toLocaleString()}/mo more
                  </div>
                ) : (
                  <div className="text-xs text-green-600 mt-1">
                    Save ${(current.monthlyPayment - refi2.monthlyPayment).toLocaleString()}/mo
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Interest</div>
                <div className="text-xl font-semibold text-green-600">${refi2.totalInterest.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Total Cost (with fees)</div>
                <div className="text-lg">${refi2.totalCostWithFees.toLocaleString()}</div>
              </div>
              <div className="pt-4 border-t">
                <div className="text-sm text-muted-foreground">Net Savings vs Current</div>
                <div className={`text-2xl font-bold ${refi2.savingsVsCurrent > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {refi2.savingsVsCurrent > 0 ? '+' : ''}{refi2.savingsVsCurrent > 0 ? '$' : '-$'}{Math.abs(refi2.savingsVsCurrent).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Payoff Time Saved</div>
                <div className="text-lg font-semibold text-green-600">{yearsRemaining - refi2Term} years</div>
              </div>
              
              {refi2.savingsVsCurrent > 50000 && refi2Term < currentTerm && (
                <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-xs text-green-700 dark:text-green-400">
                    ✓ Excellent choice! You're right-sizing your mortgage.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Analysis */}
        <Card className="mt-6 border-2 border-primary">
          <CardHeader className="bg-primary text-primary-foreground">
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              Refinancing Recommendation
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm">Option 1</span>
                  Lower Rate, Same Term
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  While you save ${(current.monthlyPayment - refi1.monthlyPayment).toLocaleString()}/month, you're restarting the interest amortization schedule. 
                  You've already paid ${Math.round(interestAlreadyPaid).toLocaleString()} in interest, and most of your new payments will still go to interest in the early years.
                  {refi1.savingsVsCurrent < 30000 && " The total savings may not justify restarting the clock."}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-sm">Option 2</span>
                  Right-Size Your Mortgage
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This is the ideal refinance scenario! You're shortening your term to {refi2Term} years AND getting a {refi2Rate}% rate. 
                  Even though your monthly payment {refi2.monthlyPayment > current.monthlyPayment ? 'increases' : 'stays similar'}, you'll save ${refi2.savingsVsCurrent.toLocaleString()} in total 
                  and own your home {yearsRemaining - refi2Term} years sooner. More of each payment goes to principal instead of interest.
                </p>
              </div>
            </div>
            
            <Alert className="mt-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Key Takeaway</AlertTitle>
              <AlertDescription>
                Don't refinance just because rates dropped 0.5-1%. The real value in refinancing comes when you can "right-size" your mortgage 
                by significantly shortening the term while keeping payments affordable. This way, you break free from the front-loaded interest cycle 
                and build equity faster.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
