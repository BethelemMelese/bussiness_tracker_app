'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, BarChart3, X, Download } from 'lucide-react'
import { api } from '@/lib/api'

interface ResearchItem {
  id: string
  name: string
  category: 'store' | 'competitor' | 'supplier'
  notes: string
}

interface MarketData {
  stores: ResearchItem[]
  competitors: ResearchItem[]
  suppliers: ResearchItem[]
}

const DEFAULT_MARKET: MarketData = {
  stores: [],
  competitors: [],
  suppliers: [],
}

const generateCSV = (data: MarketData): string => {
  const allItems = [
    ...data.stores.map((item) => ({ ...item, category: 'Store' })),
    ...data.competitors.map((item) => ({ ...item, category: 'Competitor' })),
    ...data.suppliers.map((item) => ({ ...item, category: 'Supplier' })),
  ]

  const headers = ['Category', 'Name', 'Notes']
  const rows = allItems.map((item) => [
    item.category,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${(item.notes || '').replace(/"/g, '""')}"`,
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  return csv
}

const downloadCSV = (data: MarketData) => {
  const csv = generateCSV(data)
  const timestamp = new Date().toISOString().split('T')[0]
  const filename = `market-research-${timestamp}.csv`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function MarketResearch() {
  const [data, setData] = useState<MarketData>(DEFAULT_MARKET)
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'store' | 'competitor' | 'supplier'>('store')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.market
      .get()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addItem = async () => {
    if (!newName) return
    setSaving(true)
    setError('')
    try {
      const res = await api.market.addItem(newName, selectedCategory, newNotes)
      setData(res)
      setNewName('')
      setNewNotes('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (id: string, category: 'store' | 'competitor' | 'supplier') => {
    setError('')
    try {
      const res = await api.market.deleteItem(category, id)
      setData(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove')
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center text-muted-foreground">Loading...</CardContent>
      </Card>
    )
  }

  const totalItems = data.stores.length + data.competitors.length + data.suppliers.length

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Market Research</CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => downloadCSV(data)}
              className="p-2 hover:bg-muted rounded transition"
              title="Download as CSV"
            >
              <Download className="w-5 h-5 text-accent" />
            </button>
            <BarChart3 className="w-5 h-5 text-accent" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground">Stores</p>
            <p className="text-2xl font-bold text-card-foreground">{data.stores.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Competitors</p>
            <p className="text-2xl font-bold text-card-foreground">{data.competitors.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Suppliers</p>
            <p className="text-2xl font-bold text-card-foreground">{data.suppliers.length}</p>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase">Analytics</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Total Items</p>
                <p className="font-bold text-card-foreground text-lg">{totalItems}</p>
              </div>
              <div>
                <p className="text-muted-foreground">With Notes</p>
                <p className="font-bold text-card-foreground text-lg">
                  {[...data.stores, ...data.competitors, ...data.suppliers].filter((i) => i.notes).length}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg Notes/Item</p>
                <p className="font-bold text-card-foreground text-lg">
                  {(
                    [...data.stores, ...data.competitors, ...data.suppliers].reduce(
                      (sum, i) => sum + (i.notes ? i.notes.split(' ').length : 0),
                      0
                    ) / Math.max(totalItems, 1)
                  ).toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Top Category</p>
                <p className="font-bold text-card-foreground">
                  {['Stores', 'Competitors', 'Suppliers'][
                    [data.stores.length, data.competitors.length, data.suppliers.length].indexOf(
                      Math.max(data.stores.length, data.competitors.length, data.suppliers.length)
                    )
                  ]}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value as 'store' | 'competitor' | 'supplier')}
            className="w-full px-3 py-2 text-sm rounded-md bg-input border border-border text-card-foreground"
          >
            <option value="store">Store</option>
            <option value="competitor">Competitor</option>
            <option value="supplier">Supplier</option>
          </select>
          <Input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
          />
          <Input
            type="text"
            placeholder="Notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground"
            onKeyPress={(e) => e.key === 'Enter' && addItem()}
          />
          <Button
            onClick={addItem}
            size="sm"
            disabled={saving}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Research
          </Button>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {[
            ...(selectedCategory === 'store' ? data.stores : []),
            ...(selectedCategory === 'competitor' ? data.competitors : []),
            ...(selectedCategory === 'supplier' ? data.suppliers : []),
          ]
            .slice(0, 4)
            .map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-start gap-2 p-2 bg-muted/30 rounded text-xs"
              >
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{item.name}</p>
                  {item.notes && <p className="text-muted-foreground text-xs">{item.notes}</p>}
                </div>
                <button
                  onClick={() => removeItem(item.id, item.category)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
