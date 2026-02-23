'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'

interface CapitalData {
  monthlyIncome: number
  savings: number
  target: number
}

const DEFAULT_CAPITAL: CapitalData = {
  monthlyIncome: 0,
  savings: 0,
  target: 10000,
}

export function CapitalTracker() {
  const [data, setData] = useState<CapitalData>(DEFAULT_CAPITAL)
  const [newIncome, setNewIncome] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.capital.get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addIncome = async () => {
    if (!newIncome || isNaN(Number(newIncome))) return
    const amount = Number(newIncome)
    setSaving(true)
    setError('')
    try {
      const updated = await api.capital.addIncome(amount)
      setData(updated)
      setNewIncome('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add income')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
      </Card>
    )
  }

  const savingsPercent = data.target > 0 ? (data.savings / data.target) * 100 : 0
  const progressColor = savingsPercent >= 100 ? 'bg-primary' : 'bg-accent'

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Capital Tracker</CardTitle>
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Total Savings</p>
          <p className="text-3xl font-bold text-card-foreground">{data.savings.toLocaleString()} birr</p>
          <p className="text-xs text-muted-foreground">Target: {data.target.toLocaleString()} birr</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium text-card-foreground">{Math.min(savingsPercent, 100).toFixed(0)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${progressColor} transition-all duration-300`}
              style={{ width: `${Math.min(savingsPercent, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Input
            type="number"
            placeholder="Add income"
            value={newIncome}
            onChange={(e) => setNewIncome(e.target.value)}
            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
            onKeyPress={(e) => e.key === 'Enter' && addIncome()}
          />
          <Button
            onClick={addIncome}
            size="sm"
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
