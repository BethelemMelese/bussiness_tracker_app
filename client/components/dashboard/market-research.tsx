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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Plus, BarChart3, X, Download, List, Pencil, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'
import { marketToCsv, downloadCsv } from '@/lib/export-csv'

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

const CAT_LABELS = { store: 'Store', competitor: 'Competitor', supplier: 'Supplier' } as const

export function MarketResearch() {
  const [data, setData] = useState<MarketData>(DEFAULT_MARKET)
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'store' | 'competitor' | 'supplier'>('store')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<ResearchItem | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [editCategory, setEditCategory] = useState<'store' | 'competitor' | 'supplier'>('store')
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false)

  const load = () =>
    api.market
      .get()
      .then((res) => setData(res as MarketData))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const addItem = async () => {
    if (!newName) return
    setSaving(true)
    try {
      const res = await api.market.addItem(newName, selectedCategory, newNotes)
      setData(res as MarketData)
      setNewName('')
      setNewNotes('')
      toast.success('Item added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add item')
    } finally {
      setSaving(false)
    }
  }

  const removeItem = async (id: string, category: 'store' | 'competitor' | 'supplier') => {
    try {
      const res = await api.market.deleteItem(category, id)
      setData(res as MarketData)
      toast.success('Item removed')
      if (editingItem?.id === id) setEditingItem(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to remove')
    }
  }

  const updateItem = async () => {
    if (!editingItem) return
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await api.market.updateItem(editingItem.category, editingItem.id, {
        name: editName.trim(),
        notes: editNotes,
        ...(editCategory !== editingItem.category && { category: editCategory }),
      })
      setData(res as MarketData)
      setEditingItem(null)
      setEditName('')
      setEditNotes('')
      toast.success('Item updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    try {
      downloadCsv(marketToCsv(data), `market-research-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exported to CSV')
    } catch {
      toast.error('Export failed')
    }
  }

  const deleteAll = async () => {
    try {
      const res = await api.market.deleteAll()
      setData(res as MarketData)
      setEditingItem(null)
      setDeleteAllConfirmOpen(false)
      setModalOpen(false)
      toast.success('All market research items deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete all')
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
  const allItems = [
    ...data.stores.map((i) => ({ ...i, category: 'store' as const })),
    ...data.competitors.map((i) => ({ ...i, category: 'competitor' as const })),
    ...data.suppliers.map((i) => ({ ...i, category: 'supplier' as const })),
  ]

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Market Research</CardTitle>
          <div className="flex gap-2">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View all">
                  <List className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Market Research – View all</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">
                    Stores: {data.stores.length} · Competitors: {data.competitors.length} · Suppliers: {data.suppliers.length}
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No items yet.</p>
                    ) : editingItem ? (
                      <div className="space-y-2 p-2 rounded border border-border">
                        <Input
                          placeholder="Name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-input"
                        />
                        <Input
                          placeholder="Notes"
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          className="bg-input"
                        />
                        <select
                          value={editCategory}
                          onChange={(e) => setEditCategory(e.target.value as 'store' | 'competitor' | 'supplier')}
                          className="w-full px-3 py-2 rounded-md bg-input border border-border text-sm"
                        >
                          <option value="store">Store</option>
                          <option value="competitor">Competitor</option>
                          <option value="supplier">Supplier</option>
                        </select>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={updateItem} disabled={saving}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      allItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 p-2 rounded border border-border"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{CAT_LABELS[item.category]}</p>
                            {item.notes && <p className="text-xs text-muted-foreground truncate">{item.notes}</p>}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => {
                              setEditingItem(item)
                              setEditName(item.name)
                              setEditNotes(item.notes || '')
                              setEditCategory(item.category)
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => removeItem(item.id, item.category)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  {totalItems > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-destructive border-destructive/50 hover:bg-destructive/10"
                        onClick={() => setDeleteAllConfirmOpen(true)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete all
                      </Button>
                      <AlertDialog open={deleteAllConfirmOpen} onOpenChange={setDeleteAllConfirmOpen}>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete all market research?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove all stores, competitors, and suppliers. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={deleteAll} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete all
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleExport} title="Export CSV">
              <Download className="w-5 h-5 text-accent" />
            </Button>
            <BarChart3 className="w-5 h-5 text-accent mt-1" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
                  {allItems.filter((i) => i.notes).length}
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
            className="bg-input border-border"
          />
          <Input
            type="text"
            placeholder="Notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            className="bg-input border-border"
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
