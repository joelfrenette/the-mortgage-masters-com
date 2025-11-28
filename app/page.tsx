"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  DollarSign,
  TrendingDown,
  Clock,
  Target,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Calculator,
  X,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Download,
  Share2,
  Copy,
} from "lucide-react"
import { MortgageChart } from "@/components/mortgage-chart"
import { PayoffTimeline } from "@/components/payoff-timeline"
import { StrategyComparison } from "@/components/strategy-comparison"
import { CountdownClock } from "@/components/countdown-clock"
import { Navigation } from "@/components/navigation"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"

export default function MortgageCalculator() {
  // Family budget inputs
  const [partner1Contribution, setPartner1Contribution] = useState(3000)
  const [partner2Contribution, setPartner2Contribution] = useState(3000)
  const [monthlyExpenses, setMonthlyExpenses] = useState(6000)

  // Mortgage details
  const [loanAmount, setLoanAmount] = useState(400000)
  const [interestRate, setInterestRate] = useState(2.75)
  const [loanTermYears, setLoanTermYears] = useState(30)
  const [startYear, setStartYear] = useState(2021)
  const [startMonth, setStartMonth] = useState(9)

  const [includePMI, setIncludePMI] = useState(false)
  const [pmiYearly, setPmiYearly] = useState(0)
  const [includeTaxes, setIncludeTaxes] = useState(true)
  const [taxesYearly, setTaxesYearly] = useState(5500)
  const [includeInsurance, setIncludeInsurance] = useState(true)
  const [insuranceYearly, setInsuranceYearly] = useState(4610)

  const pmiAmount = pmiYearly / 12
  const taxesAmount = taxesYearly / 12
  const insuranceAmount = insuranceYearly / 12

  // Retirement planning inputs
  const [retirementAge, setRetirementAge] = useState(59.5)
  const [currentAge, setCurrentAge] = useState(50.5)

  // Strategies
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState(0)
  const [quarterlyLumpSum, setQuarterlyLumpSum] = useState(0)
  const [yearlyLumpSum, setYearlyLumpSum] = useState(0)
  const [lumpSumPayment, setLumpSumPayment] = useState(0)
  const [lumpSumYear, setLumpSumYear] = useState(1)
  const [biWeeklyPayments, setBiWeeklyPayments] = useState(false)

  const totalMonthlyBudget = partner1Contribution + partner2Contribution
  const availableExtra = totalMonthlyBudget - monthlyExpenses

  const resultsRef = useRef<HTMLDivElement>(null)

  const [showShareModal, setShowShareModal] = useState(false)
  const [shareText, setShareText] = useState("")

  useEffect(() => {
    setExtraMonthlyPayment(availableExtra)
  }, [availableExtra])

  const retirementCalculations = useMemo(() => {
    const yearsUntilRetirement = retirementAge - currentAge
    const today = new Date()
    const retirementDate = new Date(today.getFullYear() + yearsUntilRetirement, today.getMonth(), today.getDate())

    return {
      yearsUntilRetirement,
      retirementDate,
    }
  }, [retirementAge, currentAge])

  const equityPercentage = useMemo(() => {
    const currentValue = loanAmount // Assuming property value equals loan amount at start
    const equity = ((currentValue - loanAmount) / currentValue) * 100
    return equity
  }, [loanAmount])

  const calculations = useMemo(() => {
    const principal = Number.parseFloat(loanAmount) || 0
    const annualRate = Number.parseFloat(interestRate) / 100
    const monthlyRate = annualRate / 12
    const numberOfPayments = loanTermYears * 12
    const pmiAmount = pmiYearly / 12
    const taxesAmount = taxesYearly / 12
    const insuranceAmount = insuranceYearly / 12

    const today = new Date()
    const mortgageStartDate = new Date(startYear, startMonth - 1, 1)
    const elapsedMonths = Math.max(
      0,
      (today.getFullYear() - mortgageStartDate.getFullYear()) * 12 + (today.getMonth() - mortgageStartDate.getMonth()),
    )

    const remainingStandardPayments = Math.max(0, numberOfPayments - elapsedMonths)

    // Standard monthly payment
    const standardPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
      (Math.pow(1 + monthlyRate, numberOfPayments) - 1)

    const additionalMonthly = Math.round(
      (includePMI ? pmiAmount : 0) + (includeTaxes ? taxesAmount : 0) + (includeInsurance ? insuranceAmount : 0),
    )

    let currentBalance = principal
    let totalInterestPaidSoFar = 0
    for (let i = 0; i < elapsedMonths; i++) {
      const interestPayment = currentBalance * monthlyRate
      totalInterestPaidSoFar += interestPayment
      const principalPayment = standardPayment - interestPayment
      currentBalance -= principalPayment
      if (currentBalance <= 0) {
        currentBalance = 0
        break
      }
    }

    // Calculate total interest for standard payment (remaining from now)
    let balance = currentBalance
    let totalInterestStandard = 0
    for (let i = 0; i < remainingStandardPayments; i++) {
      const interestPayment = balance * monthlyRate
      totalInterestStandard += interestPayment
      const principalPayment = standardPayment - interestPayment
      balance -= principalPayment
      if (balance <= 0) break
    }

    balance = currentBalance
    let totalInterestWithExtra = 0
    let paymentsToPayoff = 0

    if (biWeeklyPayments) {
      // Bi-weekly payments: 26 payments per year (every 2 weeks)
      const biWeeklyPayment = standardPayment / 2
      const biWeeklyRate = monthlyRate / 2

      const maxBiWeeklyPayments = remainingStandardPayments * 2.5

      for (let i = 0; i < maxBiWeeklyPayments; i++) {
        const interestPayment = balance * biWeeklyRate
        totalInterestWithExtra += interestPayment

        let principalPayment = biWeeklyPayment + extraMonthlyPayment / 2 - interestPayment

        if (quarterlyLumpSum > 0 && i > 0 && i % 7 === 0) {
          principalPayment += quarterlyLumpSum
        }

        if (yearlyLumpSum > 0 && i > 0 && i % 26 === 0) {
          principalPayment += yearlyLumpSum
        }

        if (i === lumpSumYear * 26) {
          principalPayment += lumpSumPayment
        }

        balance -= principalPayment
        paymentsToPayoff++

        if (balance <= 0) break
      }
    } else {
      // Monthly payments
      const monthlyPayment = standardPayment + extraMonthlyPayment

      for (let i = 0; i < remainingStandardPayments * 3; i++) {
        const interestPayment = balance * monthlyRate
        totalInterestWithExtra += interestPayment

        let principalPayment = monthlyPayment - interestPayment

        if (quarterlyLumpSum > 0 && i > 0 && i % 3 === 0) {
          principalPayment += quarterlyLumpSum
        }

        if (yearlyLumpSum > 0 && i > 0 && i % 12 === 0) {
          principalPayment += yearlyLumpSum
        }

        if (i === lumpSumYear * 12) {
          principalPayment += lumpSumPayment
        }

        balance -= principalPayment
        paymentsToPayoff++

        if (balance <= 0) break
      }
    }

    const yearsToPayoff = biWeeklyPayments ? paymentsToPayoff / 26 : paymentsToPayoff / 12
    const remainingYearsStandard = remainingStandardPayments / 12
    const interestSaved = totalInterestStandard - totalInterestWithExtra
    const timeSaved = remainingYearsStandard - yearsToPayoff

    const payoffDate = new Date()
    if (biWeeklyPayments) {
      payoffDate.setDate(payoffDate.getDate() + paymentsToPayoff * 14)
    } else {
      payoffDate.setMonth(payoffDate.getMonth() + paymentsToPayoff)
    }

    return {
      standardPayment: Math.round(standardPayment),
      totalPaymentWithExtras: Math.round(standardPayment + additionalMonthly),
      totalInterestStandard: Math.round(totalInterestStandard),
      totalInterestWithExtra: Math.round(totalInterestWithExtra),
      interestSaved: Math.round(interestSaved),
      yearsToPayoff: yearsToPayoff.toFixed(1),
      timeSaved: timeSaved.toFixed(1),
      payoffDate,
      paymentsRemaining: paymentsToPayoff,
      additionalMonthly: Math.round(additionalMonthly),
      currentBalance: Math.round(currentBalance),
      elapsedMonths,
      remainingStandardPayments,
    }
  }, [
    loanAmount,
    interestRate,
    loanTermYears,
    extraMonthlyPayment,
    quarterlyLumpSum,
    yearlyLumpSum,
    lumpSumPayment,
    lumpSumYear,
    biWeeklyPayments,
    startYear,
    startMonth,
    includePMI,
    pmiYearly,
    includeTaxes,
    taxesYearly,
    includeInsurance,
    insuranceYearly,
    retirementAge,
    currentAge,
  ])

  const percentageSaved = ((calculations.interestSaved / calculations.totalInterestStandard) * 100).toFixed(1)

  const paidOffBeforeRetirement = calculations.payoffDate < retirementCalculations.retirementDate
  const yearsAfterRetirement =
    calculations.payoffDate.getFullYear() - retirementCalculations.retirementDate.getFullYear()

  // Determine card color scheme based on payoff timing
  const getCardColorScheme = () => {
    if (paidOffBeforeRetirement) {
      return {
        borderColor: "border-green-500",
        bgColor: "bg-green-600",
        textColor: "text-white",
        accentBg: "bg-green-50 dark:bg-green-950",
        alertBg: "bg-green-100 dark:bg-green-900",
        alertText: "text-green-800 dark:text-green-200",
        alertDetailText: "text-green-700 dark:text-green-300",
      }
    } else if (yearsAfterRetirement > 0 && yearsAfterRetirement <= 15) {
      return {
        borderColor: "border-amber-500",
        bgColor: "bg-amber-600",
        textColor: "text-white",
        accentBg: "bg-amber-50 dark:bg-amber-950",
        alertBg: "bg-amber-100 dark:bg-amber-900",
        alertText: "text-amber-800 dark:text-amber-200",
        alertDetailText: "text-amber-700 dark:text-amber-300",
      }
    } else {
      return {
        borderColor: "border-red-500",
        bgColor: "bg-red-600",
        textColor: "text-white",
        accentBg: "bg-red-50 dark:bg-red-950",
        alertBg: "bg-red-100 dark:bg-red-900",
        alertText: "text-red-800 dark:text-red-200",
        alertDetailText: "text-red-700 dark:text-red-300",
      }
    }
  }

  const colorScheme = getCardColorScheme()

  const retirementInsight = useMemo(() => {
    const totalMonthsDiff = Math.abs(
      (calculations.payoffDate.getFullYear() - retirementCalculations.retirementDate.getFullYear()) * 12 +
        (calculations.payoffDate.getMonth() - retirementCalculations.retirementDate.getMonth()),
    )

    if (paidOffBeforeRetirement) {
      if (totalMonthsDiff < 12) {
        return `You'll achieve mortgage freedom ${totalMonthsDiff} ${totalMonthsDiff === 1 ? "month" : "months"} before retirement—perfect timing for a stress-free retirement!`
      } else {
        const yearsEarly = Math.abs(yearsAfterRetirement)
        return `You'll achieve mortgage freedom ${yearsEarly} ${yearsEarly === 1 ? "year" : "years"} before retirement—perfect timing for a stress-free retirement!`
      }
    } else if (yearsAfterRetirement > 15) {
      return `You may have to delay retirement by ${yearsAfterRetirement} years, UNLESS you can reduce your mortgage term by at least ${yearsAfterRetirement} years through aggressive payoff strategies!`
    } else {
      if (totalMonthsDiff < 12) {
        return `Your mortgage extends ${totalMonthsDiff} ${totalMonthsDiff === 1 ? "month" : "months"} into retirement. Consider increasing extra payments to eliminate this burden and retire truly debt-free!`
      } else {
        return `Your mortgage extends ${yearsAfterRetirement} ${yearsAfterRetirement === 1 ? "year" : "years"} into retirement. Consider increasing extra payments to eliminate this ${yearsAfterRetirement}-year burden and retire truly debt-free!`
      }
    }
  }, [paidOffBeforeRetirement, yearsAfterRetirement, calculations.payoffDate, retirementCalculations.retirementDate])

  const hasActiveStrategies =
    extraMonthlyPayment > 0 || quarterlyLumpSum > 0 || yearlyLumpSum > 0 || lumpSumPayment > 0 || biWeeklyPayments
  const hasSavings = calculations.interestSaved > 0 && Number.parseFloat(calculations.timeSaved) > 0

  const generatePlanSummary = () => {
    // Create a printable summary that works with modern CSS
    const summaryData = {
      loanAmount,
      interestRate,
      loanTerm: loanTermYears,
      monthlyPayment: calculations.standardPayment.toFixed(0),
      additionalMonthly: calculations.additionalMonthly,
      extraMonthlyPayment: extraMonthlyPayment,
      totalMonthlyBudget: partner1Contribution + partner2Contribution,
      availableForExtra: availableExtra,
      yearsToPayoff: Math.floor(calculations.paymentsRemaining / (biWeeklyPayments ? 26 : 12)),
      monthsToPayoff: Math.round(calculations.paymentsRemaining % (biWeeklyPayments ? 26 : 12)),
      interestSaved: calculations.interestSaved,
      mortgageFreeYear: calculations.payoffDate.getFullYear(),
      retirementYear: retirementCalculations.retirementDate.getFullYear(),
    }
    return summaryData
  }

  const handleSavePlan = () => {
    const summary = generatePlanSummary()

    // Create a new window with printable content
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to save your plan")
      return
    }

    const timeSavedYears = Math.floor(Number.parseFloat(calculations.timeSaved))
    const timeSavedMonths = Math.round((Number.parseFloat(calculations.timeSaved) - timeSavedYears) * 12)

    const yearsToPayoff = Math.floor(calculations.paymentsRemaining / 12)
    const monthsToPayoff = calculations.paymentsRemaining % 12

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>My Mortgage Plan - The-Mortgage-Masters.com</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            color: #1a1a1a;
            background: #fff;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #0f766e;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #0f766e;
            margin: 0 0 10px 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 0;
          }
          .section {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
          }
          .section h2 {
            color: #0f766e;
            margin: 0 0 16px 0;
            font-size: 18px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 8px;
          }
          .row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #eee;
          }
          .row:last-child {
            border-bottom: none;
          }
          .label {
            color: #666;
          }
          .value {
            font-weight: 600;
            color: #1a1a1a;
          }
          .highlight {
            background: linear-gradient(135deg, #0f766e 0%, #14b8a6 100%);
            color: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            text-align: center;
          }
          .highlight h2 {
            margin: 0 0 8px 0;
            font-size: 20px;
          }
          .highlight .big-number {
            font-size: 48px;
            font-weight: 700;
            margin: 10px 0;
          }
          .highlight .subtitle {
            opacity: 0.9;
            font-size: 14px;
          }
          .savings {
            background: #dcfce7;
            border: 2px solid #22c55e;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            margin-bottom: 20px;
          }
          .savings h2 {
            color: #15803d;
            margin: 0 0 16px 0;
          }
          .savings-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .savings-item .number {
            font-size: 32px;
            font-weight: 700;
            color: #15803d;
          }
          .savings-item .label {
            color: #166534;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          @media print {
            body { padding: 20px; }
            .section, .highlight, .savings { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>My Mortgage Freedom Plan</h1>
          <p>Generated on ${new Date().toLocaleDateString()} | The-Mortgage-Masters.com</p>
        </div>
        
        <div class="highlight">
          <h2>Mortgage Freedom Date</h2>
          <div class="big-number">${yearsToPayoff} Years ${monthsToPayoff} Months</div>
          <div class="subtitle">You'll be mortgage-free in ${calculations.payoffDate.getFullYear()}!</div>
        </div>
        
        <div class="savings">
          <h2>Your Savings</h2>
          <div class="savings-grid">
            <div class="savings-item">
              <div class="number">${timeSavedYears}y ${timeSavedMonths}m</div>
              <div class="label">Time Saved</div>
            </div>
            <div class="savings-item">
              <div class="number">$${calculations.interestSaved.toLocaleString()}</div>
              <div class="label">Interest Saved</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>Loan Details</h2>
          <div class="row">
            <span class="label">Original Loan Amount</span>
            <span class="value">$${loanAmount.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Current Balance</span>
            <span class="value">$${calculations.currentBalance.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Interest Rate</span>
            <span class="value">${interestRate}%</span>
          </div>
          <div class="row">
            <span class="label">Original Loan Term</span>
            <span class="value">${loanTermYears} years</span>
          </div>
          <div class="row">
            <span class="label">Payments Remaining</span>
            <span class="value">${calculations.paymentsRemaining} months</span>
          </div>
        </div>
        
        <div class="section">
          <h2>Monthly Payment Breakdown</h2>
          <div class="row">
            <span class="label">Principal & Interest</span>
            <span class="value">$${calculations.standardPayment.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Escrow (PMI/Taxes/Insurance)</span>
            <span class="value">$${calculations.additionalMonthly.toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Extra Principal Payment</span>
            <span class="value">$${extraMonthlyPayment.toLocaleString()}</span>
          </div>
          <div class="row" style="border-top: 2px solid #0f766e; margin-top: 8px; padding-top: 12px;">
            <span class="label" style="font-weight: 600;">Total Monthly Payment</span>
            <span class="value" style="color: #0f766e; font-size: 18px;">$${(calculations.standardPayment + calculations.additionalMonthly + extraMonthlyPayment).toLocaleString()}</span>
          </div>
        </div>
        
        <div class="section">
          <h2>Retirement Planning</h2>
          <div class="row">
            <span class="label">Mortgage-Free Year</span>
            <span class="value">${calculations.payoffDate.getFullYear()}</span>
          </div>
          <div class="row">
            <span class="label">Planned Retirement Year</span>
            <span class="value">${retirementCalculations.retirementDate.getFullYear()}</span>
          </div>
          <div class="row">
            <span class="label">Status</span>
            <span class="value" style="color: ${calculations.payoffDate.getFullYear() <= retirementCalculations.retirementDate.getFullYear() ? "#15803d" : "#dc2626"};">
              ${
                calculations.payoffDate.getFullYear() <= retirementCalculations.retirementDate.getFullYear()
                  ? `Mortgage-free ${retirementCalculations.retirementDate.getFullYear() - calculations.payoffDate.getFullYear()} years BEFORE retirement!`
                  : `Mortgage extends ${calculations.payoffDate.getFullYear() - retirementCalculations.retirementDate.getFullYear()} years AFTER retirement`
              }
            </span>
          </div>
        </div>
        
        <div class="footer">
          <p>Start your journey to mortgage freedom at <strong>https://the-mortgage-masters.com</strong></p>
        </div>
      </body>
      </html>
    `)
    printWindow.document.close()

    // Trigger print dialog (user can save as PDF)
    setTimeout(() => {
      printWindow.print()
    }, 250)
  }

  const handleShareResults = () => {
    const timeSavedNum = Number.parseFloat(calculations.timeSaved)
    const yearsSaved = Math.floor(timeSavedNum)
    const monthsSaved = Math.round((timeSavedNum - yearsSaved) * 12)
    const interestSaved = calculations.interestSaved

    const timeText = monthsSaved > 0 ? `${yearsSaved} years and ${monthsSaved} months` : `${yearsSaved} years`
    const shareText = `I just discovered I can save ${timeText} and $${interestSaved.toLocaleString()} on my mortgage! Check out this amazing calculator:`

    setShareText(shareText)
    setShowShareModal(true)
  }

  const handleEmailShare = () => {
    const timeSavedNum = Number.parseFloat(calculations.timeSaved)
    const yearsSaved = Math.floor(timeSavedNum)
    const monthsSaved = Math.round((timeSavedNum - yearsSaved) * 12)
    const timeText = monthsSaved > 0 ? `${yearsSaved} years and ${monthsSaved} months` : `${yearsSaved} years`

    const subject = encodeURIComponent("Check out my Mortgage Freedom Plan!")
    const body = encodeURIComponent(
      `I just discovered I can save ${timeText} and $${calculations.interestSaved.toLocaleString()} on my mortgage!\n\n` +
        `Calculate your own savings at https://the-mortgage-masters.com\n\n` +
        `#MortgageFreedom #DebtFree`,
    )
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank")
  }

  const handleTwitterShare = () => {
    const timeSavedNum = Number.parseFloat(calculations.timeSaved)
    const yearsSaved = Math.floor(timeSavedNum)
    const monthsSaved = Math.round((timeSavedNum - yearsSaved) * 12)
    const timeText = monthsSaved > 0 ? `${yearsSaved} years and ${monthsSaved} months` : `${yearsSaved} years`

    const text = encodeURIComponent(
      `I just discovered I can save ${timeText} and $${calculations.interestSaved.toLocaleString()} on my mortgage!\n\n` +
        `Calculate your own savings at https://the-mortgage-masters.com\n\n` +
        `#MortgageFreedom #DebtFree`,
    )
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank", "width=550,height=420")
  }

  const handleFacebookShare = () => {
    const url = encodeURIComponent("https://the-mortgage-masters.com")
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "width=550,height=420")
  }

  const handleLinkedInShare = () => {
    const url = encodeURIComponent("https://the-mortgage-masters.com")
    const title = encodeURIComponent("My Mortgage Freedom Plan")
    const summary = encodeURIComponent(`I just discovered I can save years on my mortgage! Calculate your own savings.`)
    window.open(
      `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}&summary=${summary}`,
      "_blank",
      "width=550,height=420",
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <Navigation />

      {/* Hero Section */}
      <div className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <Badge className="mb-4 bg-secondary text-secondary-foreground border-none">
              <Sparkles className="w-3 h-3 mr-1" />
              Mortgage Freedom Accelerator
            </Badge>
            <h1 className="text-5xl font-bold mb-4 text-balance">Master Your Mortgage, Retire Debt-Free</h1>
            <p className="text-xl text-primary-foreground/90 leading-relaxed">
              Take control of your financial future with proven strategies to eliminate your mortgage years early.
              Calculate your path to a debt-free retirement and unlock the freedom you deserve.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <CountdownClock
            targetDate={calculations.payoffDate}
            startDate={new Date(startYear, startMonth - 1, 1)}
            totalPayments={calculations.paymentsRemaining}
            paymentDayOfMonth={1}
            isBiWeekly={biWeeklyPayments}
            originalLoanTermYears={loanTermYears}
            originalStartDate={new Date(startYear, startMonth - 1, 1)}
            remainingStandardPayments={calculations.remainingStandardPayments}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Inputs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Mortgage Details */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default" className="text-sm font-bold px-3 py-1">
                    Step 1
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Mortgage Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="loanAmount">Loan Amount</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="loanAmount"
                      type="number"
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="interestRate">Interest Rate (%)</Label>
                  <Input
                    id="interestRate"
                    type="number"
                    step="0.1"
                    value={interestRate}
                    onChange={(e) => setInterestRate(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="loanTerm">Loan Term (Years)</Label>
                  <Input
                    id="loanTerm"
                    type="number"
                    value={loanTermYears}
                    onChange={(e) => setLoanTermYears(Number(e.target.value))}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startYear">Start Year</Label>
                    <Input
                      id="startYear"
                      type="number"
                      value={startYear}
                      onChange={(e) => setStartYear(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="startMonth">Start Month</Label>
                    <Input
                      id="startMonth"
                      type="number"
                      min="1"
                      max="12"
                      value={startMonth}
                      onChange={(e) => setStartMonth(Number(e.target.value))}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                  <div className="grid grid-cols-[1fr,auto,auto] items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includePMI"
                        checked={includePMI}
                        onCheckedChange={(checked) => setIncludePMI(checked as boolean)}
                      />
                      <Label htmlFor="includePMI" className="cursor-pointer text-sm">
                        Include PMI
                      </Label>
                    </div>
                    {includePMI ? (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={pmiYearly || ""}
                            onChange={(e) => setPmiYearly(Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                            placeholder="yearly"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-xs">$</span>
                          <span className="w-16 h-8 text-sm flex items-center justify-end pr-2 bg-muted rounded">
                            {(pmiYearly / 12).toFixed(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20" />
                        <div className="w-16" />
                      </>
                    )}
                  </div>
                  {includePMI && (
                    <p className="text-xs text-amber-600 ml-6">
                      💡 Remove PMI once you reach 20% equity to save money!
                    </p>
                  )}

                  <div className="grid grid-cols-[1fr,auto,auto] items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includeTaxes"
                        checked={includeTaxes}
                        onCheckedChange={(checked) => setIncludeTaxes(checked as boolean)}
                      />
                      <Label htmlFor="includeTaxes" className="cursor-pointer text-sm">
                        Include Property Taxes
                      </Label>
                    </div>
                    {includeTaxes ? (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={taxesYearly || ""}
                            onChange={(e) => setTaxesYearly(Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                            placeholder="yearly"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-xs">$</span>
                          <span className="w-16 h-8 text-sm flex items-center justify-end pr-2 bg-muted rounded">
                            {(taxesYearly / 12).toFixed(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20" />
                        <div className="w-16" />
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-[1fr,auto,auto] items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="includeInsurance"
                        checked={includeInsurance}
                        onCheckedChange={(checked) => setIncludeInsurance(checked as boolean)}
                      />
                      <Label htmlFor="includeInsurance" className="cursor-pointer text-sm">
                        Include Home Insurance
                      </Label>
                    </div>
                    {includeInsurance ? (
                      <>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">$</span>
                          <Input
                            type="number"
                            value={insuranceYearly || ""}
                            onChange={(e) => setInsuranceYearly(Number(e.target.value))}
                            className="w-20 h-8 text-sm"
                            placeholder="yearly"
                          />
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span className="text-xs">$</span>
                          <span className="w-16 h-8 text-sm flex items-center justify-end pr-2 bg-muted rounded">
                            {(insuranceYearly / 12).toFixed(0)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-20" />
                        <div className="w-16" />
                      </>
                    )}
                  </div>

                  {calculations.additionalMonthly > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-semibold">Additional Monthly:</span>
                        <span className="font-bold text-primary">
                          +${calculations.additionalMonthly.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Family Budget */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default" className="text-sm font-bold px-3 py-1">
                    Step 2
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  Family Budget
                </CardTitle>
                <CardDescription>Monthly contributions to household expenses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="partner1">Partner 1 Contribution</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="partner1"
                      type="number"
                      value={partner1Contribution}
                      onChange={(e) => setPartner1Contribution(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="partner2">Partner 2 Contribution</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="partner2"
                      type="number"
                      value={partner2Contribution}
                      onChange={(e) => setPartner2Contribution(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold">Total Monthly Budget</span>
                    <span className="text-2xl font-bold text-primary">${totalMonthlyBudget.toLocaleString()}</span>
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
                    <span className="text-2xl font-bold text-green-600">${availableExtra.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payoff Strategies */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="default" className="text-sm font-bold px-3 py-1">
                    Step 3
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Simple Payoff Strategies
                </CardTitle>
                <CardDescription>Accelerate your mortgage freedom</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="extraPayment">Extra Monthly Payment</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="extraPayment"
                      type="number"
                      value={extraMonthlyPayment}
                      onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-green-600 mt-1">💡 Auto-applied from available budget</p>
                </div>
                <div>
                  <Label htmlFor="quarterlyLumpSum">Quarterly Lump Sum</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="quarterlyLumpSum"
                      type="number"
                      value={quarterlyLumpSum}
                      onChange={(e) => setQuarterlyLumpSum(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Paid every 3 months</p>
                </div>
                <div>
                  <Label htmlFor="yearlyLumpSum">Extra Yearly Lump Sum</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="yearlyLumpSum"
                      type="number"
                      value={yearlyLumpSum}
                      onChange={(e) => setYearlyLumpSum(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Paid once per year</p>
                </div>
                <div>
                  <Label htmlFor="lumpSum">One-Time Lump Sum</Label>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-sm text-muted-foreground">$</span>
                    <Input
                      id="lumpSum"
                      type="number"
                      value={lumpSumPayment}
                      onChange={(e) => setLumpSumPayment(Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <Label htmlFor="biweekly" className="cursor-pointer">
                    Bi-Weekly Payments
                  </Label>
                  <Button
                    id="biweekly"
                    variant={biWeeklyPayments ? "default" : "outline"}
                    size="sm"
                    onClick={() => setBiWeeklyPayments(!biWeeklyPayments)}
                  >
                    {biWeeklyPayments ? "ON" : "OFF"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Velocity Banking Bonus */}
            <Card className="border-2 border-primary/40 bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Badge
                    variant="secondary"
                    className="text-sm font-bold px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-none"
                  >
                    Bonus Step
                  </Badge>
                </div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Velocity Banking
                </CardTitle>
                <CardDescription>Advanced strategy for aggressive mortgage payoff</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Use a HELOC to accelerate your mortgage payoff by strategically managing your cash flow. This advanced
                  technique can save you even more on interest!
                </p>
                <Link
                  href={`/velocity-banking?p1=${partner1Contribution}&p2=${partner2Contribution}&exp=${monthlyExpenses}&bal=${loanAmount}&rate=${interestRate}&pmt=${calculations.standardPayment}`}
                >
                  <Button className="w-full" size="lg" variant="default">
                    Explore Velocity Banking
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div ref={resultsRef} className="lg:col-span-2 space-y-6">
            {/* Motivational Call to Action */}
            <Card className={`border-2 ${colorScheme.borderColor} ${colorScheme.bgColor} ${colorScheme.textColor}`}>
              <CardHeader>
                <CardTitle className="text-2xl">
                  {hasSavings ? (paidOffBeforeRetirement ? "🎉" : yearsAfterRetirement > 15 ? "🚨" : "⚠️") : "🚀"} Your
                  Path to Mortgage Freedom
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!hasSavings ? (
                  <>
                    <p className="text-lg leading-relaxed font-semibold">
                      Welcome to your mortgage freedom journey! You're currently on track to pay off your mortgage in{" "}
                      {loanTermYears} years.
                    </p>
                    <p className="text-lg leading-relaxed">
                      Ready to accelerate your path to freedom? Start by adjusting your{" "}
                      <strong>Extra Monthly Payment</strong>, explore <strong>Bi-Weekly Payments</strong>, or try adding{" "}
                      <strong>Quarterly Lump Sums</strong>. Even small extra payments can save you thousands and shave
                      years off your mortgage!
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg leading-relaxed">
                      By implementing these strategies, you're saving{" "}
                      <strong>${calculations.interestSaved.toLocaleString()}</strong> and gaining{" "}
                      <strong>{calculations.timeSaved} years</strong> of financial freedom!
                    </p>
                    <p className="text-lg leading-relaxed font-semibold">{retirementInsight}</p>
                  </>
                )}
                <div className="flex gap-3">
                  <Button variant="secondary" size="lg" className="flex-1" onClick={handleSavePlan}>
                    <Download className="h-4 w-4 mr-2" />
                    Save Plan
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 bg-white/20 border-white/30 text-white hover:bg-white/30"
                    onClick={handleShareResults}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Results
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Retirement Planning Card */}
            <Card className={`border-2 ${colorScheme.borderColor} ${colorScheme.accentBg}`}>
              <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {paidOffBeforeRetirement ? "🎉" : yearsAfterRetirement > 15 ? "🚨" : "⚠️"} Retirement Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 p-4 bg-background rounded-lg">
                  <div>
                    <Label htmlFor="currentAge" className="text-sm font-semibold">
                      Your Current Age
                    </Label>
                    <Input
                      id="currentAge"
                      type="number"
                      step="0.5"
                      value={currentAge}
                      onChange={(e) => setCurrentAge(Number(e.target.value))}
                      className="mt-2 text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <Label htmlFor="retirementAge" className="text-sm font-semibold">
                      Planned Retirement Age
                    </Label>
                    <Input
                      id="retirementAge"
                      type="number"
                      step="0.5"
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      className="mt-2 text-lg font-semibold"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Common: 59.5, 62, 65, 67</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {/* Time to Mortgage Freedom */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Mortgage Freedom
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-4 rounded-lg bg-background border-2 border-primary/20">
                          <div className="text-4xl font-bold text-primary mb-1">
                            {Math.floor(calculations.paymentsRemaining / (biWeeklyPayments ? 26 : 12))}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Years</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background border-2 border-primary/20">
                          <div className="text-4xl font-bold text-primary mb-1">
                            {calculations.paymentsRemaining % (biWeeklyPayments ? 26 : 12)}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Months</div>
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <div className="text-lg font-bold text-primary">{calculations.payoffDate.getFullYear()}</div>
                        <div className="text-xs text-muted-foreground uppercase">Mortgage Free</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background border border-primary/20">
                        <div className="text-2xl font-bold text-primary">{calculations.paymentsRemaining}</div>
                        <div className="text-xs text-muted-foreground uppercase">Payments Remaining</div>
                      </div>
                    </div>

                    {/* Time to Retirement */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 justify-center">
                        <Target className="w-4 h-4 text-muted-foreground" />
                        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                          Retirement
                        </h3>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="text-center p-4 rounded-lg bg-background border-2 border-primary/20">
                          <div className="text-4xl font-bold text-primary mb-1">
                            {Math.floor(retirementCalculations.yearsUntilRetirement)}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Years</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-background border-2 border-primary/20">
                          <div className="text-4xl font-bold text-primary mb-1">
                            {Math.floor((retirementCalculations.yearsUntilRetirement % 1) * 12)}
                          </div>
                          <div className="text-xs text-muted-foreground uppercase font-semibold">Months</div>
                        </div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-primary/10">
                        <div className="text-lg font-bold text-primary">
                          {retirementCalculations.retirementDate.getFullYear()}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Retirement Year</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-background border border-primary/20">
                        <div className="text-2xl font-bold text-primary">
                          {Math.floor(retirementCalculations.yearsUntilRetirement * 12)}
                        </div>
                        <div className="text-xs text-muted-foreground uppercase">Months to Retirement</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`p-6 rounded-lg ${colorScheme.alertBg} border-l-4 ${colorScheme.borderColor}`}>
                  {paidOffBeforeRetirement ? (
                    <div className="space-y-2">
                      <p className={`text-lg font-bold ${colorScheme.alertText} flex items-center gap-2`}>
                        <CheckCircle className="h-6 w-6" /> Excellent Plan!
                      </p>
                      <p className={`text-sm ${colorScheme.alertDetailText} leading-relaxed`}>
                        {(() => {
                          const totalMonthsDiff = Math.abs(
                            (calculations.payoffDate.getFullYear() -
                              retirementCalculations.retirementDate.getFullYear()) *
                              12 +
                              (calculations.payoffDate.getMonth() - retirementCalculations.retirementDate.getMonth()),
                          )

                          if (totalMonthsDiff < 12) {
                            return `You'll pay off your mortgage ${totalMonthsDiff} months BEFORE retirement in ${calculations.payoffDate.getFullYear()}! This means you'll enter retirement with zero mortgage debt and significantly lower monthly expenses, giving you the financial freedom you deserve.`
                          } else {
                            return `You'll pay off your mortgage ${Math.abs(yearsAfterRetirement)} years BEFORE retirement in ${calculations.payoffDate.getFullYear()}! This means you'll enter retirement with zero mortgage debt and significantly lower monthly expenses, giving you the financial freedom you deserve.`
                          }
                        })()}
                      </p>
                    </div>
                  ) : yearsAfterRetirement > 15 ? (
                    <div className="space-y-2">
                      <p className={`text-lg font-bold ${colorScheme.alertText} flex items-center gap-2`}>
                        <AlertTriangle className="h-6 w-6" /> Critical: Major Action Required
                      </p>
                      <p className={`text-sm ${colorScheme.alertDetailText} leading-relaxed`}>
                        Your mortgage won't be paid off until{" "}
                        <strong className="text-base">{calculations.payoffDate.getFullYear()}</strong>, which is{" "}
                        <strong className="text-base">{yearsAfterRetirement} years AFTER retirement</strong> at age{" "}
                        {Math.round(retirementAge + yearsAfterRetirement)}. This represents a significant financial
                        burden during retirement. You need to dramatically increase your extra payments or consider
                        refinancing to a shorter term to achieve a debt-free retirement!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className={`text-lg font-bold ${colorScheme.alertText} flex items-center gap-2`}>
                        <AlertTriangle className="h-6 w-6" /> Caution: Action Needed
                      </p>
                      <p className={`text-sm ${colorScheme.alertDetailText} leading-relaxed`}>
                        Your mortgage won't be paid off until{" "}
                        <strong className="text-base">{calculations.payoffDate.getFullYear()}</strong>, which is{" "}
                        <strong className="text-base">{yearsAfterRetirement} years AFTER retirement</strong> at age{" "}
                        {Math.round(retirementAge + yearsAfterRetirement)}. Consider increasing your extra payments or
                        exploring velocity banking strategies to retire mortgage-free and enjoy true financial freedom!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Monthly Payment Card - Redesigned with clear breakdown */}
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription className="text-xs uppercase tracking-wide">
                    Monthly Payment Breakdown
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Principal + Interest */}
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Principal + Interest</span>
                    <span className="font-medium">${calculations.standardPayment.toLocaleString()}</span>
                  </div>

                  {/* Escrow (PMI/Taxes/Insurance) */}
                  {calculations.additionalMonthly > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Monthly Escrow <span className="text-xs">(PMI/Taxes/Ins)</span>
                      </span>
                      <span className="font-medium">+ ${calculations.additionalMonthly.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Extra Principal Curtailment */}
                  {extraMonthlyPayment > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-muted-foreground">Extra Principal</span>
                        <p className="text-xs text-muted-foreground/70">(excludes quarterly/lump sums)</p>
                      </div>
                      <span className="font-medium text-primary">+ ${extraMonthlyPayment.toLocaleString()}</span>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t pt-3 mt-3">
                    {/* Total Monthly Payment - Largest */}
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Monthly Payment</span>
                      <span className="text-3xl font-bold text-primary">
                        $
                        {(
                          calculations.standardPayment +
                          calculations.additionalMonthly +
                          extraMonthlyPayment
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-1">
                    Interest Saved
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  </CardDescription>
                  <CardTitle className="text-3xl text-green-600">
                    ${calculations.interestSaved.toLocaleString()}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">That's {percentageSaved}% in savings!</p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Time Saved
                  </CardDescription>
                  <CardTitle className="text-3xl text-primary">{calculations.timeSaved} years</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Pay off in {calculations.yearsToPayoff} years instead of {loanTermYears}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardDescription>Payoff Date</CardDescription>
                  <CardTitle className="text-3xl">
                    {calculations.payoffDate.getFullYear()} - {calculations.payoffDate.getMonth() + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{calculations.paymentsRemaining} payments remaining</p>
                </CardContent>
              </Card>
            </div>

            {/* Tabs for different views */}
            <Tabs defaultValue="chart" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chart">Payment Breakdown</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="strategies">Strategies</TabsTrigger>
              </TabsList>

              <TabsContent value="chart" className="mt-4">
                <MortgageChart
                  loanAmount={loanAmount}
                  standardInterest={calculations.totalInterestStandard}
                  optimizedInterest={calculations.totalInterestWithExtra}
                  interestSaved={calculations.interestSaved}
                />
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                <PayoffTimeline
                  standardYears={loanTermYears}
                  optimizedYears={Number.parseFloat(calculations.yearsToPayoff)}
                  startYear={startYear}
                  startMonth={startMonth}
                />
              </TabsContent>

              <TabsContent value="strategies" className="mt-4">
                <StrategyComparison
                  loanAmount={loanAmount}
                  interestRate={interestRate}
                  loanTermYears={loanTermYears}
                  standardPayment={calculations.standardPayment}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Share Your Results
                <Button variant="ghost" size="sm" onClick={() => setShowShareModal(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>Share your mortgage savings with others</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-3 rounded-lg text-sm">{shareText}</div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    window.open(
                      `mailto:?subject=Check out my mortgage savings!&body=${encodeURIComponent(shareText + "\n\nhttps://the-mortgage-masters.com")}`,
                      "_blank",
                    )
                  }}
                >
                  <Mail className="h-4 w-4" />
                  Email
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    window.open(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent("https://the-mortgage-masters.com")}`,
                      "_blank",
                    )
                  }}
                >
                  <Twitter className="h-4 w-4" />
                  Twitter/X
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    window.open(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://the-mortgage-masters.com")}&quote=${encodeURIComponent(shareText)}`,
                      "_blank",
                    )
                  }}
                >
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 bg-transparent"
                  onClick={() => {
                    window.open(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://the-mortgage-masters.com")}`,
                      "_blank",
                    )
                  }}
                >
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </div>

              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(shareText + "\n\nhttps://the-mortgage-masters.com")
                  alert("Copied to clipboard!")
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  )
}
