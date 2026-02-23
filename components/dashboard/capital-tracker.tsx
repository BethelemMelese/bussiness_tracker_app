'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, TrendingUp, Download, List, Pencil, RotateCcw } from 'lucide-react'
import { api } from '@/lib/api'
import { capitalToCsv, downloadCsv } from '@/lib/export-csv'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState('')
  const [editSavings, setEditSavings] = useState('')

  const load = () =>
    api.capital
      .get()
      .then(setData)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const addIncome = async () => {
    if (!newIncome || isNaN(Number(newIncome))) return
    const amount = Number(newIncome)
    setSaving(true)
    try {
      const updated = await api.capital.addIncome(amount)
      setData(updated)
      setNewIncome('')
      toast.success('Income added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add income')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    try {
      downloadCsv(capitalToCsv(data), `capital-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exported to CSV')
    } catch {
      toast.error('Export failed')
    }
  }

  const handleUpdate = async () => {
    const target = editTarget === '' ? undefined : Number(editTarget)
    const savings = editSavings === '' ? undefined : Number(editSavings)
    if (target === undefined && savings === undefined) return
    setSaving(true)
    try {
      const updated = await api.capital.update({
        ...(target !== undefined && !isNaN(target) && { target }),
        ...(savings !== undefined && !isNaN(savings) && { savings }),
      })
      setData(updated)
      setEditTarget('')
      setEditSavings('')
      toast.success('Updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Reset all capital data to zero?')) return
    setSaving(true)
    try {
      const updated = await api.capital.update({
        monthlyIncome: 0,
        savings: 0,
        target: data.target,
      })
      setData(updated)
      setModalOpen(false)
      toast.success('Capital reset')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Reset failed')
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
          <div className="flex items-center gap-1">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View all">
                  <List className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Capital Tracker – View all</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Monthly income</p>
                    <p className="text-2xl font-bold">{data.monthlyIncome.toLocaleString()} birr</p>
                    <p className="text-sm text-muted-foreground">Savings</p>
                    <p className="text-2xl font-bold">{data.savings.toLocaleString()} birr</p>
                    <p className="text-sm text-muted-foreground">Target</p>
                    <p className="text-2xl font-bold">{data.target.toLocaleString()} birr</p>
                    <p className="text-xs text-muted-foreground">
                      Progress: {Math.min(savingsPercent, 100).toFixed(0)}%
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Edit</p>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder={`Target (${data.target})`}
                        value={editTarget}
                        onChange={(e) => setEditTarget(e.target.value)}
                        className="bg-input border-border"
                      />
                      <Input
                        type="number"
                        placeholder={`Savings (${data.savings})`}
                        value={editSavings}
                        onChange={(e) => setEditSavings(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleUpdate} disabled={saving}>
                        <Pencil className="h-4 w-4 mr-1" />
                        Update
                      </Button>
                      <Button size="sm" variant="destructive" onClick={handleReset} disabled={saving}>
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport} title="Export CSV">
              <Download className="h-4 w-4" />
            </Button>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
