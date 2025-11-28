'use client'

import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TrendingUpIcon, AlertCircleIcon, CheckCircleIcon, DollarSignIcon, CalendarIcon, PercentIcon } from 'lucide-react'
import { Navigation } from '@/components/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function VelocityBankingPage() {
  
  const searchParams = useSearchParams()
  
  const [partner1Income, setPartner1Income] = useState(() => {
    const p1 = searchParams.get('p1')
    return p1 ? Number(p1) : 3000
  })
  const [partner2Income, setPartner2Income] = useState(() => {
    const p2 = searchParams.get('p2')
    return p2 ? Number(p2) : 3000
  })
  const [monthlyExpenses, setMonthlyExpenses] = useState(() => {
    const exp = searchParams.get('exp')
    return exp ? Number(exp) : 6000
  })
  const [mortgageBalance, setMortgageBalance] = useState(() => {
    const bal = searchParams.get('bal')
    return bal ? Number(bal) : 450000
  })
  const [mortgageRate, setMortgageRate] = useState(() => {
    const rate = searchParams.get('rate')
    return rate ? Number(rate) : 6.5
  })
  const [mortgagePayment, setMortgagePayment] = useState(() => {
    const pmt = searchParams.get('pmt')
    return pmt ? Number(pmt) : 2844
  })
  
  const [helocCreditLimit, setHelocCreditLimit] = useState(200000)
  const [helocRate, setHelocRate] = useState(10.5)
  const [chunkAmount, setChunkAmount] = useState(20000)
  const [chunkFrequency, setChunkFrequency] = useState<'quarterly' | 'semiannual' | 'annual'>('semiannual')
  
  const totalMonthlyIncome = partner1Income + partner2Income
  const monthlyExpenseAmount = monthlyExpenses
  const cashFlowSurplus = totalMonthlyIncome - monthlyExpenseAmount
  
  const calculations = useMemo(() => {
    // Initial chunk payment to mortgage
    let helocBalance = chunkAmount
    
    const chunksPerYear = chunkFrequency === 'quarterly' ? 4 : chunkFrequency === 'semiannual' ? 2 : 1
    const monthsBetweenChunks = 12 / chunksPerYear
    
    // Calculate months needed to paydown HELOC to zero
    const monthsToPaydownHeloc = Math.ceil(chunkAmount / cashFlowSurplus)
    
    // If we chunk faster than we can pay down, balances will stack
    let maxHelocBalance = 0
    let currentBalance = 0
    const monthsToSimulate = Math.min(monthsToPaydownHeloc * chunksPerYear, 120) // Simulate up to 10 years
    
    for (let month = 0; month <= monthsToSimulate; month++) {
      // Check if it's time to chunk (at month 0 and then every X months based on frequency)
      if (month % monthsBetweenChunks === 0) {
        currentBalance += chunkAmount
      }
      
      // Track maximum balance
      if (currentBalance > maxHelocBalance) {
        maxHelocBalance = currentBalance
      }
      
      // Pay down with surplus (after the chunk is added)
      currentBalance = Math.max(0, currentBalance - cashFlowSurplus)
      
      // If balance reaches 0, we've completed a full cycle
      if (currentBalance === 0 && month > 0) {
        break
      }
    }
    
    const requiredCreditLimit = Math.ceil(maxHelocBalance / 1000) * 1000 // Round up to nearest $1000
    const creditLimitSufficient = helocCreditLimit >= requiredCreditLimit
    
    // Can we chunk again before paying off HELOC? (Check if credit limit supports it)
    const maxSimultaneousChunks = Math.floor(helocCreditLimit / chunkAmount)
    const canStackChunks = maxSimultaneousChunks > 1
    
    // Check if credit limit can support the desired chunk frequency
    const creditLimitSupportsFrequency = helocCreditLimit >= chunkAmount
    
    // Average daily balance calculation for HELOC interest
    const avgHelocBalance = chunkAmount - (totalMonthlyIncome / 2) + (monthlyExpenseAmount / 2)
    const monthlyHelocInterest = (avgHelocBalance * (helocRate / 100)) / 12
    
    // Monthly principal reduction on mortgage (based on CURRENT/REMAINING balance)
    const monthlyMortgageInterest = (mortgageBalance * (mortgageRate / 100)) / 12
    const standardMonthlyTowardPrincipal = mortgagePayment - monthlyMortgageInterest
    
    // With velocity banking, we chunk principal periodically based on frequency
    const annualChunkPrincipalReduction = chunksPerYear * chunkAmount
    const monthlyEquivalentExtra = annualChunkPrincipalReduction / 12
    
    // Total effective monthly principal payment
    const velocityMonthlyTowardPrincipal = standardMonthlyTowardPrincipal + monthlyEquivalentExtra
    
    const simpleMonthlyRate = mortgageRate / 100 / 12
    const simpleEffectivePayment = mortgagePayment + cashFlowSurplus
    
    let simpleBalance = mortgageBalance // Start from REMAINING balance
    let simpleTotalInterest = 0
    let simpleMonths = 0
    const maxPayments = 360 * 3 // Safety limit
    
    // Calculate REMAINING months and interest for simple strategy from NOW
    for (let i = 0; i < maxPayments; i++) {
      if (simpleBalance <= 0) break
      
      const interestPayment = simpleBalance * simpleMonthlyRate
      simpleTotalInterest += interestPayment
      
      const principalPayment = simpleEffectivePayment - interestPayment
      simpleBalance -= principalPayment
      simpleMonths++
      
      if (simpleBalance <= 0) break
    }
    
    const velocityMonthlyRate = mortgageRate / 100 / 12
    const velocityEffectivePayment = mortgagePayment + monthlyEquivalentExtra
    
    let velocityBalance = mortgageBalance // Start from REMAINING balance
    let velocityTotalInterest = 0
    let velocityMonths = 0
    
    for (let i = 0; i < maxPayments; i++) {
      if (velocityBalance <= 0) break
      
      const interestPayment = velocityBalance * velocityMonthlyRate
      velocityTotalInterest += interestPayment
      
      const principalPayment = velocityEffectivePayment - interestPayment
      velocityBalance -= principalPayment
      velocityMonths++
      
      if (velocityBalance <= 0) break
    }
    
    // Add HELOC interest cost to velocity banking
    const totalHelocInterest = monthlyHelocInterest * velocityMonths
    const velocityTotalCost = velocityTotalInterest + totalHelocInterest
    
    const netInterestSaved = simpleTotalInterest - velocityTotalCost
    
    const monthsSaved = simpleMonths - velocityMonths
    const yearsSaved = monthsSaved / 12
    
    const simpleTotalPaid = simpleEffectivePayment * simpleMonths
    
    return {
      helocBalance: chunkAmount,
      monthsToPaydownHeloc,
      monthsBetweenChunks,
      canStackChunks,
      maxSimultaneousChunks,
      creditLimitSupportsFrequency,
      requiredCreditLimit,
      creditLimitSufficient,
      maxHelocBalance,
      avgHelocBalance,
      monthlyHelocInterest,
      monthlyMortgageInterest,
      standardMonthlyTowardPrincipal,
      velocityMonthlyTowardPrincipal,
      monthlyEquivalentExtra,
      chunksPerYear,
      annualChunkPrincipalReduction,
      monthsSaved,
      yearsSaved,
      netInterestSaved,
      velocityMonths,
      totalHelocInterest,
      velocityTotalCost,
      helocUtilization: ((chunkAmount / helocCreditLimit) * 100).toFixed(1),
      // Simple strategy calculations
      simpleMonths,
      simpleYears: simpleMonths / 12,
      simpleTotalInterest,
      simpleMonthlyPrincipal: standardMonthlyTowardPrincipal + cashFlowSurplus,
      simpleEffectivePayment,
      simpleTotalPaid,
      velocityTotalInterest,
    }
  }, [totalMonthlyIncome, monthlyExpenseAmount, mortgageBalance, mortgageRate, mortgagePayment, helocRate, helocCreditLimit, chunkAmount, chunkFrequency, cashFlowSurplus])
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navigation />
      
      {/* Hero Section */}
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">
              <TrendingUpIcon className="w-3 h-3 mr-1" />
              Advanced Debt Payoff Strategy
            </Badge>
            <h1 className="text-5xl font-bold mb-4 text-balance">
              Velocity Banking Explained
            </h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Use a HELOC as a checking account to reduce your mortgage principal faster by leveraging average daily balance (ADB) calculations instead of front-loaded mortgage interest.
            </p>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* HELOC Configuration */}
            <Card className="border-2 border-primary/30">
              <CardHeader>
                <CardTitle>HELOC Configuration</CardTitle>
                <CardDescription>Set up your line of credit details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="helocLimit">HELOC Credit Limit</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="helocLimit"
                      type="number"
                      value={helocCreditLimit}
                      onChange={(e) => setHelocCreditLimit(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Total available credit</p>
                </div>
                
                <div>
                  <Label htmlFor="helocRate">HELOC Interest Rate (%)</Label>
                  <Input
                    id="helocRate"
                    type="number"
                    step="0.1"
                    value={helocRate}
                    onChange={(e) => setHelocRate(Number(e.target.value))}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Simple interest on ADB</p>
                </div>
                
                <div>
                  <Label htmlFor="chunkAmount">Chunk Amount</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="chunkAmount"
                      type="number"
                      value={chunkAmount}
                      onChange={(e) => setChunkAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Principal payment size</p>
                </div>
                
                <div>
                  <Label htmlFor="chunkFrequency">Chunk Frequency</Label>
                  <Select value={chunkFrequency} onValueChange={(value: any) => setChunkFrequency(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quarterly">Every 3 Months (Quarterly)</SelectItem>
                      <SelectItem value="semiannual">Every 6 Months (Semi-Annual)</SelectItem>
                      <SelectItem value="annual">Every 12 Months (Annual)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">How often you chunk to mortgage</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <PercentIcon className="w-5 h-5" />
                  HELOC Utilization
                </CardTitle>
                <CardDescription>Your credit usage and paydown metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">HELOC Utilization:</span>
                  <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">{calculations.helocUtilization}%</span>
                </div>
                <Progress value={Number(calculations.helocUtilization)} className="h-2" />
                
                <div className="pt-3 border-t space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Paydown Time:</span>
                    <span className="text-xl font-semibold text-blue-900 dark:text-blue-100">{calculations.monthsToPaydownHeloc} months</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Chunks Per Year:</span>
                    <span className="text-xl font-semibold text-blue-900 dark:text-blue-100">{calculations.chunksPerYear}</span>
                  </div>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">Maximum Credit Needed:</span>
                    <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ${calculations.requiredCreditLimit.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Peak HELOC balance during cycle: ${calculations.maxHelocBalance.toLocaleString()}
                  </p>
                </div>
                
                {!calculations.creditLimitSufficient && (
                  <Alert className="border-red-500 bg-red-50 dark:bg-red-950/30">
                    <AlertCircleIcon className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-900 dark:text-red-100">Insufficient Credit Limit</AlertTitle>
                    <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                      Your current credit limit (${helocCreditLimit.toLocaleString()}) is not enough for this strategy. 
                      You need at least ${calculations.requiredCreditLimit.toLocaleString()} to support {calculations.chunksPerYear} chunks of ${chunkAmount.toLocaleString()} per year with your current cash flow.
                    </AlertDescription>
                  </Alert>
                )}
                
                {calculations.creditLimitSufficient && calculations.monthsToPaydownHeloc > calculations.monthsBetweenChunks && (
                  <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950/30">
                    <AlertCircleIcon className="h-4 w-4 text-amber-600" />
                    <AlertTitle className="text-amber-900 dark:text-amber-100">Paydown time ({calculations.monthsToPaydownHeloc} mo) exceeds chunk frequency ({calculations.monthsBetweenChunks} mo)</AlertTitle>
                    <AlertDescription className="text-amber-800 dark:text-amber-200 text-xs">
                      You'll need to wait or have sufficient credit to stack chunks.
                    </AlertDescription>
                  </Alert>
                )}
                
                {calculations.creditLimitSufficient && calculations.canStackChunks && (
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950/30">
                    <CheckCircleIcon className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200 text-sm">
                      Credit limit allows up to {calculations.maxSimultaneousChunks} simultaneous chunks
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Budget Inputs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSignIcon className="w-5 h-5 text-primary" />
                  Family Budget
                </CardTitle>
                <CardDescription>Monthly contributions to household expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="partner1Income">Partner 1 Contribution</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="partner1Income"
                      type="number"
                      value={partner1Income}
                      onChange={(e) => setPartner1Income(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="partner2Income">Partner 2 Contribution</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="partner2Income"
                      type="number"
                      value={partner2Income}
                      onChange={(e) => setPartner2Income(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total Monthly Budget</span>
                    <span className="text-2xl font-bold text-primary">${totalMonthlyIncome.toLocaleString()}</span>
                  </div>
                  <div>
                    <Label htmlFor="monthlyExpenses">Total Monthly Expenses</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        id="monthlyExpenses"
                        type="number"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <span className="font-semibold text-green-600">Available for Extra Payments</span>
                    <span className="text-2xl font-bold text-green-600">${cashFlowSurplus.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Right Column - How It Works */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Requirements card */}
            <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                  <AlertCircleIcon className="w-5 h-5" />
                  Important Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">Positive monthly cash flow required</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">HELOC with sufficient available credit</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">Discipline to avoid increasing debt</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-900 dark:text-amber-100">Prefer simple interest (ADB) over front-loaded mortgage interest</p>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="example" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="example">How It Works</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="strategy">Implementation</TabsTrigger>
              </TabsList>
              
              <TabsContent value="example" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Velocity Banking Cycle</CardTitle>
                    <CardDescription>See how chunking works with your cash flow</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Step 1: Initial Chunk */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                          <span className="font-semibold">Initial Chunk to Mortgage</span>
                        </div>
                        <span className="text-lg font-bold text-red-600">${chunkAmount.toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">Use HELOC to pay ${chunkAmount.toLocaleString()} toward mortgage principal</p>
                      <div className="ml-11 mt-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                        <p className="text-sm font-semibold">HELOC Balance: ${chunkAmount.toLocaleString()}</p>
                        <Progress value={Number(calculations.helocUtilization)} className="mt-2" />
                        <p className="text-xs text-muted-foreground mt-1">{calculations.helocUtilization}% of credit limit used</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">2</div>
                          <span className="font-semibold">Re-amortize Your Mortgage Loan</span>
                        </div>
                        <span className="text-sm font-bold text-indigo-600">Required</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">Call your mortgage broker and re-amortize your loan so your monthly payments also pay more towards the principal</p>
                      <div className="ml-11 mt-2 p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-md border-2 border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm"><strong>Important:</strong> Re-amortization recalculates your loan schedule, ensuring maximum principal reduction with each payment!</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                          <span className="font-semibold">Transfer Partner Contributions to Joint HELOC</span>
                        </div>
                        <span className="text-lg font-bold text-green-600">-${totalMonthlyIncome.toLocaleString()}/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">Both partner contributions transferred immediately, reducing HELOC balance</p>
                      <div className="ml-11 mt-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                        <p className="text-sm font-semibold">Balance drops instantly when partner contributions are transferred</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">4</div>
                          <span className="font-semibold">Pay Expenses from HELOC</span>
                        </div>
                        <span className="text-lg font-bold text-orange-600">+${monthlyExpenseAmount.toLocaleString()}/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">All expenses paid from HELOC throughout the month</p>
                      <div className="ml-11 mt-2 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-md">
                        <p className="text-sm font-semibold">Net monthly reduction: ${cashFlowSurplus.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">5</div>
                          <span className="font-semibold">Interest on Average Daily Balance</span>
                        </div>
                        <span className="text-lg font-bold text-blue-600">+${calculations.monthlyHelocInterest.toFixed(2)}/mo</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">At {helocRate}% on average balance (NOT end balance)</p>
                      <div className="ml-11 mt-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-md border-2 border-blue-200 dark:border-blue-800">
                        <p className="text-sm"><strong>Key Advantage:</strong> Interest calculated on average daily balance means lower interest than mortgage's front-loaded schedule!</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">6</div>
                          <span className="font-semibold">Pay Down HELOC</span>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{calculations.monthsToPaydownHeloc} months</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">Continue cycle until HELOC is paid to $0 (or low enough to chunk again)</p>
                      <div className="ml-11 mt-2 p-3 bg-purple-50 dark:bg-purple-950/20 rounded-md">
                        <p className="text-sm font-semibold">With ${cashFlowSurplus.toLocaleString()}/month surplus, pay down ${chunkAmount.toLocaleString()} in {calculations.monthsToPaydownHeloc} months</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">7</div>
                          <span className="font-semibold">Chunk Again & Repeat</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{calculations.chunksPerYear}x/year</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-11">Make another ${chunkAmount.toLocaleString()} principal payment and restart the cycle!</p>
                    </div>
                    
                    {/* Result */}
                    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-lg">Annual Principal Reduction</span>
                        <span className="text-2xl font-bold">${calculations.annualChunkPrincipalReduction.toLocaleString()}</span>
                      </div>
                      <p className="text-sm opacity-90">
                        That's ${calculations.monthlyEquivalentExtra.toFixed(2)}/month equivalent extra payment without actually paying it monthly!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="comparison" className="mt-4 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Simple Payoff Strategies</CardTitle>
                      <CardDescription>From main calculator with extra payments</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Principal + Extra</span>
                        <span className="font-semibold">${calculations.simpleMonthlyPrincipal.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 -mt-1">
                        (${calculations.standardMonthlyTowardPrincipal.toFixed(2)} principal + ${cashFlowSurplus.toLocaleString()} extra)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Months to Payoff</span>
                        <span className="font-semibold">{Math.round(calculations.simpleMonths)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Years to Payoff</span>
                        <span className="font-bold">{calculations.simpleYears.toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUpIcon className="w-4 h-4" />
                        Velocity Banking
                      </CardTitle>
                      <CardDescription>With HELOC chunking strategy</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly Principal + Chunks</span>
                        <span className="font-semibold text-green-600">${calculations.velocityMonthlyTowardPrincipal.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mb-2 -mt-1">
                        (${calculations.standardMonthlyTowardPrincipal.toFixed(2)} principal + ${calculations.monthlyEquivalentExtra.toFixed(2)}/mo equiv.)
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Months to Payoff</span>
                        <span className="font-semibold text-green-600">{Math.round(calculations.velocityMonths)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm text-muted-foreground">Years to Payoff</span>
                        <span className="font-bold text-green-600">{(calculations.velocityMonths / 12).toFixed(1)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
                  <CardHeader>
                    <CardTitle className="text-green-900 dark:text-green-100">Velocity Banking vs. Simple Strategies</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Additional Time Saved</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                          {calculations.yearsSaved.toFixed(1)} years
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          ({Math.round(calculations.monthsSaved)} months faster than simple strategies)
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-green-700 dark:text-green-300 mb-1">Additional Interest Saved</p>
                        <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                          ${Math.round(calculations.netInterestSaved).toLocaleString()}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          (Compared to simple extra payment strategy)
                        </p>
                      </div>
                    </div>
                    <div className="pt-3 border-t">
                      <p className="text-sm text-green-800 dark:text-green-200 leading-relaxed">
                        <strong>Why Velocity Banking wins:</strong> By leveraging average daily balance (ADB) interest calculation instead of front-loaded amortization, 
                        you're accelerating principal reduction more efficiently than simply making ${cashFlowSurplus.toLocaleString()} extra payments monthly. The HELOC chunks create immediate principal reduction, 
                        while your cash flow surplus pays down the HELOC balance throughout the month.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="strategy" className="mt-4 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Step-by-Step Implementation</CardTitle>
                    <CardDescription>How to get started with velocity banking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Alert>
                      <AlertCircleIcon className="h-4 w-4" />
                      <AlertTitle>Before You Start</AlertTitle>
                      <AlertDescription>
                        Ensure you have consistent positive cash flow and a HELOC with sufficient credit. Understand the risks involved.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                        <div>
                          <h4 className="font-semibold mb-1">Obtain or Use HELOC</h4>
                          <p className="text-sm text-muted-foreground">
                            Apply for a HELOC or ensure your existing one has enough available credit for your strategy.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                        <div>
                          <h4 className="font-semibold mb-1">Make Extra Mortgage Principal Payment (Chunk)</h4>
                          <p className="text-sm text-muted-foreground">
                            From your HELOC, pay down a significant amount of your mortgage principal. This sets your initial HELOC balance. 
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                        <div>
                          <h4 className="font-semibold mb-1">Re-amortize Your Mortgage Loan</h4>
                          <p className="text-sm text-muted-foreground">
                            Once you make the payment to principal (chunk), call your mortgage broker and re-amortize your loan so your monthly payments also pay towards the principal.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">4</div>
                        <div>
                          <h4 className="font-semibold mb-1">Transfer Partner Contributions Directly to Joint HELOC</h4>
                          <p className="text-sm text-muted-foreground">
                            Change your monthly transfers from your joint checking account to go into your Joint HELOC account.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">5</div>
                        <div>
                          <h4 className="font-semibold mb-1">Pay ALL Expenses from HELOC</h4>
                          <p className="text-sm text-muted-foreground">
                            Use the HELOC like a checking account for all your monthly expenses.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">6</div>
                        <div>
                          <h4 className="font-semibold mb-1">Pay Down HELOC Balance</h4>
                          <p className="text-sm text-muted-foreground">
                            Your cash flow surplus will naturally pay down the HELOC balance. This takes time based on your surplus and chunk amount.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">7</div>
                        <div>
                          <h4 className="font-semibold mb-1 text-green-700 dark:text-green-400">Chunk Mortgage Again & Repeat</h4>
                          <p className="text-sm text-muted-foreground">
                            Once the HELOC is paid down sufficiently, make another large principal payment (chunk) to your mortgage. Restart the cycle, aiming for faster paydown each time.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
                      <AlertCircleIcon className="w-5 h-5" />
                      Risks and Considerations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-amber-900 dark:text-amber-100">
                    <p>• <strong>Variable Rates:</strong> HELOC interest rates can increase, impacting costs.</p>
                    <p>• <strong>Discipline is Crucial:</strong> Must resist the temptation to overspend using the HELOC.</p>
                    <p>• <strong>Cash Flow Dependent:</strong> Strategy relies heavily on consistent positive cash flow.</p>
                    <p>• <strong>Home Equity Risk:</strong> Your home serves as collateral for the HELOC.</p>
                    <p>• <strong>Complexity:</strong> Requires careful tracking and understanding of interest calculations.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
