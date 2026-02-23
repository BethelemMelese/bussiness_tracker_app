'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { DollarSign } from 'lucide-react'
import { api } from '@/lib/api'

interface FinancialData {
  costPerUnit: number
  sellingPrice: number
  monthlyFixedCosts: number
  unitsSoldPerMonth: number
}

const DEFAULT_FINANCIAL: FinancialData = {
  costPerUnit: 0,
  sellingPrice: 0,
  monthlyFixedCosts: 0,
  unitsSoldPerMonth: 0,
}

export function FinancialModel() {
  const [data, setData] = useState<FinancialData>(DEFAULT_FINANCIAL)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.financial
      .get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = async (field: keyof FinancialData, value: string) => {
    const num = parseFloat(value) || 0
    const updated = { ...data, [field]: num }
    setData(updated)
    setError('')
    try {
      await api.financial.update(updated)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
      </Card>
    )
  }

  const grossMargin = data.sellingPrice > 0 ? data.sellingPrice - data.costPerUnit : 0
  const marginPercent = data.sellingPrice > 0 ? ((grossMargin / data.sellingPrice) * 100).toFixed(1) : 0
  const monthlyRevenue = data.unitsSoldPerMonth * data.sellingPrice
  const monthlyCost = data.unitsSoldPerMonth * data.costPerUnit
  const monthlyProfit = monthlyRevenue - monthlyCost - data.monthlyFixedCosts
  const breakEvenUnits =
    data.monthlyFixedCosts > 0 && grossMargin > 0 ? Math.ceil(data.monthlyFixedCosts / grossMargin) : 0

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Financial Model</CardTitle>
          <DollarSign className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Cost per Unit ($)</label>
            <Input
              type="number"
              value={data.costPerUnit || ''}
              onChange={(e) => handleChange('costPerUnit', e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Selling Price ($)</label>
            <Input
              type="number"
              value={data.sellingPrice || ''}
              onChange={(e) => handleChange('sellingPrice', e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Monthly Fixed Costs ($)
            </label>
            <Input
              type="number"
              value={data.monthlyFixedCosts || ''}
              onChange={(e) => handleChange('monthlyFixedCosts', e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Units Sold/Month</label>
            <Input
              type="number"
              value={data.unitsSoldPerMonth || ''}
              onChange={(e) => handleChange('unitsSoldPerMonth', e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
              placeholder="0"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-border space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Gross Margin</span>
            <span className="font-semibold text-card-foreground">
              ${grossMargin.toFixed(2)} ({marginPercent}%)
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Monthly Revenue</span>
            <span className="font-semibold text-card-foreground">${monthlyRevenue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Monthly Cost</span>
            <span className="font-semibold text-card-foreground">${monthlyCost.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm pt-2 border-t border-border/50">
            <span className="font-medium text-muted-foreground">Monthly Profit</span>
            <span className={`font-bold ${monthlyProfit >= 0 ? 'text-primary' : 'text-destructive'}`}>
              ${monthlyProfit.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Break-Even Units</span>
            <span className="font-semibold text-card-foreground">{breakEvenUnits} units</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
