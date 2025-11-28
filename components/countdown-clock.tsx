"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { CalendarIcon } from "lucide-react"

interface CountdownClockProps {
  targetDate: Date
  startDate: Date
  totalPayments: number // This is already the REMAINING payments with extra strategies
  paymentDayOfMonth?: number
  isBiWeekly?: boolean
  originalLoanTermYears: number
  originalStartDate: Date
  remainingStandardPayments: number
}

export function CountdownClock({
  targetDate,
  startDate,
  totalPayments,
  paymentDayOfMonth = 1,
  isBiWeekly = false,
  originalLoanTermYears,
  originalStartDate,
  remainingStandardPayments,
}: CountdownClockProps) {
  const calculateTimeRemaining = () => {
    const now = new Date()
    const diff = targetDate.getTime() - now.getTime()

    if (diff <= 0) {
      return { years: 0, months: 0, days: 0 }
    }

    const today = new Date()
    const currentDay = today.getDate()
    let daysUntilPayment = paymentDayOfMonth - currentDay

    if (daysUntilPayment < 0) {
      const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, paymentDayOfMonth)
      daysUntilPayment = Math.floor((nextMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    }

    const yearsDiff = targetDate.getFullYear() - now.getFullYear()
    const monthsDiff = targetDate.getMonth() - now.getMonth()

    let totalMonths = yearsDiff * 12 + monthsDiff
    if (now.getDate() > targetDate.getDate()) {
      totalMonths -= 1
    }

    const years = Math.floor(totalMonths / 12)
    const months = totalMonths % 12

    return {
      years,
      months,
      days: daysUntilPayment,
    }
  }

  const calculateOriginalTimeRemaining = () => {
    const now = new Date()

    // Calculate years and months from remaining standard payments
    const years = Math.floor(remainingStandardPayments / 12)
    const months = remainingStandardPayments % 12

    const currentDay = now.getDate()
    let daysUntilPayment = paymentDayOfMonth - currentDay

    if (daysUntilPayment < 0) {
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, paymentDayOfMonth)
      daysUntilPayment = Math.floor((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    return {
      years,
      months,
      days: daysUntilPayment,
      payments: remainingStandardPayments,
    }
  }

  const [timeRemaining, setTimeRemaining] = useState(() => calculateTimeRemaining())
  const [originalTimeRemaining, setOriginalTimeRemaining] = useState(() => calculateOriginalTimeRemaining())
  const [paymentsRemaining, setPaymentsRemaining] = useState(() => totalPayments)

  useEffect(() => {
    setTimeRemaining(calculateTimeRemaining())
    setOriginalTimeRemaining(calculateOriginalTimeRemaining())
    setPaymentsRemaining(totalPayments)
  }, [
    targetDate,
    startDate,
    totalPayments,
    paymentDayOfMonth,
    originalLoanTermYears,
    originalStartDate,
    isBiWeekly,
    remainingStandardPayments,
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining())
      setOriginalTimeRemaining(calculateOriginalTimeRemaining())
      setPaymentsRemaining(totalPayments)
    }, 60000)

    return () => clearInterval(interval)
  }, [
    targetDate,
    startDate,
    totalPayments,
    paymentDayOfMonth,
    originalLoanTermYears,
    originalStartDate,
    isBiWeekly,
    remainingStandardPayments,
  ])

  return (
    <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5">
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Old/Standard Mortgage Timeline */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-lg font-semibold text-muted-foreground">Old</span>
              <CalendarIcon className="w-5 h-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-muted-foreground">Countdown to Mortgage Slavery</h3>
            </div>

            <div className="flex gap-3 justify-center items-start">
              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{originalTimeRemaining.years}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Years</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{originalTimeRemaining.months}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Months</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{originalTimeRemaining.days}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Days</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[120px]">
                  <span className="text-5xl font-bold">{originalTimeRemaining.payments}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Payments Remaining</span>
              </div>
            </div>
          </div>

          {/* New/Optimized Mortgage Timeline */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-lg font-semibold text-primary">New</span>
              <CalendarIcon className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Countdown to Mortgage Freedom</h3>
            </div>

            <div className="flex gap-3 justify-center items-start">
              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{timeRemaining.years}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Years</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{timeRemaining.months}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Months</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[100px]">
                  <span className="text-5xl font-bold">{timeRemaining.days}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Days</span>
              </div>

              <div className="text-center">
                <div className="bg-[#003B5C] text-white rounded-xl p-6 mb-2 min-w-[120px]">
                  <span className="text-5xl font-bold">{paymentsRemaining}</span>
                </div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide">Payments Remaining</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
