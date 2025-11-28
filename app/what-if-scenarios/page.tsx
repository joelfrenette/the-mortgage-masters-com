"use client"

import { useState } from "react"
import { Navigation } from "@/components/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  SlidersIcon,
  TrendingDownIcon,
  RefreshCwIcon,
  PlusIcon,
  TrashIcon,
  CopyIcon,
  ArrowRightIcon,
} from "lucide-react"

interface Scenario {
  id: string
  name: string
  loanAmount: number
  interestRate: number
  loanTerm: number
  extraPayment: number
}

export default function WhatIfScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([
    {
      id: "1",
      name: "Current Mortgage",
      loanAmount: 400000,
      interestRate: 2.75,
      loanTerm: 30,
      extraPayment: 0,
    },
  ])

  const [refinanceCurrentRate, setRefinanceCurrentRate] = useState(6.5)
  const [refinanceCurrentBalance, setRefinanceCurrentBalance] = useState(450000)
  const [refinanceCurrentTerm, setRefinanceCurrentTerm] = useState(30)
  const [refinanceNewRate, setRefinanceNewRate] = useState(5.5)
  const [refinanceNewTerm, setRefinanceNewTerm] = useState(30)
  const [refinanceClosingCosts, setRefinanceClosingCosts] = useState(5000)

  const calculateMortgage = (loan: number, rate: number, term: number, extra = 0) => {
    const monthlyRate = rate / 100 / 12
    const numberOfPayments = term * 12

    const payment =
      (loan * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    let balance = loan
    let totalInterest = 0
    let months = 0

    for (let i = 0; i < numberOfPayments * 2; i++) {
      const interestPayment = balance * monthlyRate
      totalInterest += interestPayment
      const principalPayment = payment + extra - interestPayment
      balance -= principalPayment
      months++
      if (balance <= 0) break
    }

    return {
      monthlyPayment: Math.round(payment),
      totalInterest: Math.round(totalInterest),
      totalCost: Math.round(loan + totalInterest),
      yearsToPayoff: (months / 12).toFixed(1),
    }
  }

  const addScenario = () => {
    const newId = (scenarios.length + 1).toString()
    setScenarios([
      ...scenarios,
      {
        id: newId,
        name: `Scenario ${newId}`,
        loanAmount: 400000,
        interestRate: 2.75,
        loanTerm: 30,
        extraPayment: 0,
      },
    ])
  }

  const duplicateScenario = (scenario: Scenario) => {
    const newId = (scenarios.length + 1).toString()
    setScenarios([
      ...scenarios,
      {
        ...scenario,
        id: newId,
        name: `${scenario.name} (Copy)`,
      },
    ])
  }

  const deleteScenario = (id: string) => {
    if (scenarios.length > 1) {
      setScenarios(scenarios.filter((s) => s.id !== id))
    }
  }

  const updateScenario = (id: string, updates: Partial<Scenario>) => {
    setScenarios(scenarios.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  // Refinance calculations
  const currentMortgage = calculateMortgage(refinanceCurrentBalance, refinanceCurrentRate, refinanceCurrentTerm)

  const refinancedMortgage = calculateMortgage(
    refinanceCurrentBalance + refinanceClosingCosts,
    refinanceNewRate,
    refinanceNewTerm,
  )

  const refinanceSavings = currentMortgage.totalCost - refinancedMortgage.totalCost
  const monthlyDifference = currentMortgage.monthlyPayment - refinancedMortgage.monthlyPayment
  const breakEvenMonths = refinanceClosingCosts / Math.abs(monthlyDifference)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background">
      <Navigation />

      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">
              <SlidersIcon className="w-3 h-3 mr-1" />
              Compare & Explore
            </Badge>
            <h1 className="text-5xl font-bold mb-4 text-balance">What-If Scenarios & Refinance Calculator</h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Compare multiple mortgage scenarios side-by-side and explore refinancing options to find your optimal
              path.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="compare" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="compare">Compare Scenarios</TabsTrigger>
            <TabsTrigger value="refinance">Refinance Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="compare" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Scenario Comparison</h2>
              <Button onClick={addScenario} className="gap-2">
                <PlusIcon className="w-4 h-4" />
                Add Scenario
              </Button>
            </div>

            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {scenarios.map((scenario) => {
                const results = calculateMortgage(
                  scenario.loanAmount,
                  scenario.interestRate,
                  scenario.loanTerm,
                  scenario.extraPayment,
                )

                return (
                  <Card key={scenario.id} className="border-primary/20">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-2">
                        <Input
                          value={scenario.name}
                          onChange={(e) => updateScenario(scenario.id, { name: e.target.value })}
                          className="font-bold text-lg h-auto p-1 border-none focus-visible:ring-1"
                        />
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => duplicateScenario(scenario)}
                          >
                            <CopyIcon className="w-4 h-4" />
                          </Button>
                          {scenarios.length > 1 && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive"
                              onClick={() => deleteScenario(scenario.id)}
                            >
                              <TrashIcon className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-xs">Loan Amount</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={scenario.loanAmount}
                            onChange={(e) => updateScenario(scenario.id, { loanAmount: Number(e.target.value) })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Interest Rate (%)</Label>
                        <Input
                          type="number"
                          step="0.1"
                          value={scenario.interestRate}
                          onChange={(e) => updateScenario(scenario.id, { interestRate: Number(e.target.value) })}
                          className="mt-1 h-9"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Loan Term (Years)</Label>
                        <Input
                          type="number"
                          value={scenario.loanTerm}
                          onChange={(e) => updateScenario(scenario.id, { loanTerm: Number(e.target.value) })}
                          className="mt-1 h-9"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Extra Monthly Payment</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={scenario.extraPayment}
                            onChange={(e) => updateScenario(scenario.id, { extraPayment: Number(e.target.value) })}
                            className="h-9"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Monthly Payment</span>
                          <span className="font-semibold">${results.monthlyPayment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total Interest</span>
                          <span className="font-semibold text-orange-600">
                            ${results.totalInterest.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Years to Payoff</span>
                          <span className="font-semibold text-primary">{results.yearsToPayoff} years</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t">
                          <span className="text-sm font-semibold">Total Cost</span>
                          <span className="font-bold text-lg">${results.totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {scenarios.length > 1 && (
              <Card className="border-2 border-primary bg-primary/5">
                <CardHeader>
                  <CardTitle>Comparison Summary</CardTitle>
                  <CardDescription>Best to worst scenarios by total cost</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {scenarios
                      .map((s) => ({
                        ...s,
                        results: calculateMortgage(s.loanAmount, s.interestRate, s.loanTerm, s.extraPayment),
                      }))
                      .sort((a, b) => a.results.totalCost - b.results.totalCost)
                      .map((scenario, index) => (
                        <div
                          key={scenario.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Badge variant={index === 0 ? "default" : "outline"}>#{index + 1}</Badge>
                            <span className="font-semibold">{scenario.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">${scenario.results.totalCost.toLocaleString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {scenario.results.monthlyPayment.toLocaleString()}/mo
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="refinance" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Refinance Analysis</h2>
              <p className="text-muted-foreground">Compare your current mortgage with refinancing options</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Current Mortgage */}
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">Current Mortgage</CardTitle>
                  <CardDescription>Your existing loan details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="currentBalance">Current Balance</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        id="currentBalance"
                        type="number"
                        value={refinanceCurrentBalance}
                        onChange={(e) => setRefinanceCurrentBalance(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="currentRate">Current Interest Rate (%)</Label>
                    <Input
                      id="currentRate"
                      type="number"
                      step="0.1"
                      value={refinanceCurrentRate}
                      onChange={(e) => setRefinanceCurrentRate(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="currentTerm">Remaining Term (Years)</Label>
                    <Input
                      id="currentTerm"
                      type="number"
                      value={refinanceCurrentTerm}
                      onChange={(e) => setRefinanceCurrentTerm(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Payment</span>
                      <span className="font-semibold">${currentMortgage.monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-semibold">${currentMortgage.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Cost</span>
                      <span className="font-bold text-lg">${currentMortgage.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Refinance Option */}
              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCwIcon className="w-5 h-5 text-primary" />
                    Refinance Option
                  </CardTitle>
                  <CardDescription>New loan terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="newRate">New Interest Rate (%)</Label>
                    <Input
                      id="newRate"
                      type="number"
                      step="0.1"
                      value={refinanceNewRate}
                      onChange={(e) => setRefinanceNewRate(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="newTerm">New Loan Term (Years)</Label>
                    <Input
                      id="newTerm"
                      type="number"
                      value={refinanceNewTerm}
                      onChange={(e) => setRefinanceNewTerm(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="closingCosts">Closing Costs</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm text-muted-foreground">$</span>
                      <Input
                        id="closingCosts"
                        type="number"
                        value={refinanceClosingCosts}
                        onChange={(e) => setRefinanceClosingCosts(Number(e.target.value))}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">New Monthly Payment</span>
                      <span className="font-semibold">${refinancedMortgage.monthlyPayment.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Interest</span>
                      <span className="font-semibold">${refinancedMortgage.totalInterest.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Total Cost</span>
                      <span className="font-bold text-lg">${refinancedMortgage.totalCost.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Refinance Summary */}
            <Card
              className={`border-2 ${refinanceSavings > 0 ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-orange-500 bg-orange-50 dark:bg-orange-950"}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {refinanceSavings > 0 ? (
                    <TrendingDownIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <ArrowRightIcon className="w-5 h-5 text-orange-600" />
                  )}
                  Refinance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Monthly Difference</div>
                    <div
                      className={`text-2xl font-bold ${monthlyDifference > 0 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {monthlyDifference > 0 ? "-" : "+"}${Math.abs(monthlyDifference).toLocaleString()}/mo
                    </div>
                  </div>

                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Total Savings</div>
                    <div
                      className={`text-2xl font-bold ${refinanceSavings > 0 ? "text-green-600" : "text-orange-600"}`}
                    >
                      {refinanceSavings > 0 ? "+" : ""}${refinanceSavings.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-background rounded-lg">
                    <div className="text-sm text-muted-foreground mb-1">Break-Even Point</div>
                    <div className="text-2xl font-bold">
                      {isFinite(breakEvenMonths) ? Math.round(breakEvenMonths) : "--"} months
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-background rounded-lg">
                  <h4 className="font-semibold mb-2">Recommendation</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {refinanceSavings > 0
                      ? `Refinancing could save you $${refinanceSavings.toLocaleString()} over the life of the loan and reduce your monthly payment by $${monthlyDifference.toLocaleString()}. You'll break even on closing costs in ${Math.round(breakEvenMonths)} months.`
                      : `Based on these terms, refinancing would cost you $${Math.abs(refinanceSavings).toLocaleString()} more over the life of the loan. Consider negotiating better terms or waiting for lower rates.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
