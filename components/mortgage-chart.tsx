'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'

interface MortgageChartProps {
  loanAmount: number
  standardInterest: number
  optimizedInterest: number
  interestSaved: number
}

export function MortgageChart({ loanAmount, standardInterest, optimizedInterest, interestSaved }: MortgageChartProps) {
  const data = [
    {
      name: 'Standard Plan',
      Principal: loanAmount,
      Interest: standardInterest,
      total: loanAmount + standardInterest
    },
    {
      name: 'Optimized Plan',
      Principal: loanAmount,
      Interest: optimizedInterest,
      total: loanAmount + optimizedInterest
    }
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-gray-700 dark:text-gray-300">
              <span style={{ color: entry.color }}>●</span> {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
          <p className="text-sm font-semibold text-gray-900 dark:text-white mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
            Total: ${payload.reduce((sum: number, entry: any) => sum + entry.value, 0).toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Breakdown Comparison</CardTitle>
        <CardDescription>See how much you save with your optimized strategy</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#374151" />
            <YAxis 
              stroke="#374151"
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="Principal" stackId="a" fill="#0c2f54" radius={[0, 0, 4, 4]} />
            <Bar dataKey="Interest" stackId="a" fill="#00a886" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        
        <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <p className="text-center text-lg font-semibold text-green-600">
            💰 You're saving ${interestSaved.toLocaleString()} in interest!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
