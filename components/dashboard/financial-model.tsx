'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { DollarSign, Download, List, RotateCcw } from 'lucide-react'
import { api } from '@/lib/api'
import { financialToCsv, downloadCsv } from '@/lib/export-csv'

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
  const [modalOpen, setModalOpen] = useState(false)

  const load = () =>
    api.financial
      .get()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const handleChange = async (field: keyof FinancialData, value: string) => {
    const num = parseFloat(value) || 0
    const updated = { ...data, [field]: num }
    setData(updated)
    try {
      await api.financial.update(updated)
      toast.success('Saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all financial data to zero?')) return
    try {
      await api.financial.update({
        costPerUnit: 0,
        sellingPrice: 0,
        monthlyFixedCosts: 0,
        unitsSoldPerMonth: 0,
      })
      setData(DEFAULT_FINANCIAL)
      setModalOpen(false)
      toast.success('Financial data reset')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reset failed')
    }
  }

  const handleExport = () => {
    try {
      downloadCsv(financialToCsv(data), `financial-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exported to CSV')
    } catch {
      toast.error('Export failed')
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
          <div className="flex items-center gap-1">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View all">
                  <List className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Financial Model – View all</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cost per Unit</span>
                      <span>${data.costPerUnit.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Selling Price</span>
                      <span>${data.sellingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Fixed Costs</span>
                      <span>${data.monthlyFixedCosts.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Units Sold/Month</span>
                      <span>{data.unitsSoldPerMonth}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between">
                      <span className="text-muted-foreground">Gross Margin</span>
                      <span>${grossMargin.toFixed(2)} ({marginPercent}%)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Revenue</span>
                      <span>${monthlyRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Monthly Cost</span>
                      <span>${monthlyCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Monthly Profit</span>
                      <span className={monthlyProfit >= 0 ? 'text-primary' : 'text-destructive'}>
                        ${monthlyProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Break-Even Units</span>
                      <span>{breakEvenUnits} units</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="destructive" size="sm" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Reset all
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExport}>
                      <Download className="h-4 w-4 mr-1" />
                      Export CSV
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Cost per Unit ($)</label>
            <Input
              type="number"
              value={data.costPerUnit || ''}
              onChange={(e) => handleChange('costPerUnit', e.target.value)}
              className="bg-input border-border"
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
              className="bg-input border-border"
              placeholder="0"
              step="0.01"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Monthly Fixed Costs ($)</label>
            <Input
              type="number"
              value={data.monthlyFixedCosts || ''}
              onChange={(e) => handleChange('monthlyFixedCosts', e.target.value)}
              className="bg-input border-border"
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
              className="bg-input border-border"
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
