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
import { Plus, Trash2, Download, List, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { disciplineToCsv, downloadCsv } from '@/lib/export-csv'

interface DisciplineItem {
  id: string
  name: string
  checkedDays: boolean[]
  startDate: string
  habitFormed: boolean
}

interface DisciplineData {
  habits: DisciplineItem[]
}

const DEFAULT_DISCIPLINE: DisciplineData = {
  habits: [],
}

/** Today as YYYY-MM-DD (local timezone) */
function dateToday(): string {
  const n = new Date()
  const y = n.getFullYear()
  const m = String(n.getMonth() + 1).padStart(2, '0')
  const d = String(n.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Parse startDate string to a Date at noon for stable day math */
function parseStartDate(s: string): Date {
  if (!s?.trim()) return new Date()
  const iso = s.trim().slice(0, 10)
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return new Date(iso + 'T12:00:00')
  const d = new Date(s)
  return isNaN(d.getTime()) ? new Date() : d
}

/** Day index (0–20) for today relative to habit startDate; -1 if before start, 21+ if past window */
function getDayIndex(startDateStr: string): number {
  const start = parseStartDate(startDateStr)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  const diffMs = today.getTime() - start.getTime()
  return Math.floor(diffMs / (24 * 60 * 60 * 1000))
}

/** Whether habit should reset: missed yesterday or past window without completing */
function needsReset(habit: DisciplineItem): boolean {
  const checkedDays = habit.checkedDays || Array(21).fill(false)
  const dayIndex = getDayIndex(habit.startDate || dateToday())
  if (dayIndex < 0) return false
  if (dayIndex >= 1 && dayIndex <= 20) {
    if (!checkedDays[dayIndex - 1]) return true
    return false
  }
  if (dayIndex > 20) {
    const allChecked = checkedDays.length === 21 && checkedDays.every(Boolean)
    return !allChecked
  }
  return false
}

/** Format date for display (e.g. "Feb 22") */
function formatDayLabel(startDateStr: string, dayOffset: number): string {
  const start = parseStartDate(startDateStr)
  const d = new Date(start)
  d.setDate(d.getDate() + dayOffset)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function DisciplineScore() {
  const [data, setData] = useState<DisciplineData>(DEFAULT_DISCIPLINE)
  const [newHabit, setNewHabit] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [deleteAllConfirmOpen, setDeleteAllConfirmOpen] = useState(false)

  const load = async () => {
    try {
      const res = await api.discipline.get()
      let habits = res.habits
      const toReset = habits.filter(needsReset)
      if (toReset.length > 0) {
        const todayStr = dateToday()
        await Promise.all(
          toReset.map((h) =>
            api.discipline.updateHabit(h.id, {
              startDate: todayStr,
              checkedDays: Array(21).fill(false),
              habitFormed: false,
            })
          )
        )
        const res2 = await api.discipline.get()
        habits = res2.habits
      }
      setData({ habits })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const addHabit = async () => {
    if (!newHabit) return
    setSaving(true)
    try {
      const res = await api.discipline.addHabit(newHabit)
      setData({ habits: res.habits })
      setNewHabit('')
      toast.success('Habit added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add habit')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = async (habitId: string, dayIndex: number) => {
    const habit = data.habits.find((h) => h.id === habitId)
    if (!habit) return

    const currentDayIndex = getDayIndex(habit.startDate || dateToday())
    if (dayIndex !== currentDayIndex || currentDayIndex < 0 || currentDayIndex > 20) return

    const newCheckedDays = [...(habit.checkedDays || Array(21).fill(false))]
    newCheckedDays[dayIndex] = !newCheckedDays[dayIndex]
    const allChecked = newCheckedDays.length === 21 && newCheckedDays.every(Boolean)

    try {
      const res = await api.discipline.updateHabit(habitId, {
        checkedDays: newCheckedDays,
        habitFormed: allChecked,
      })
      setData({ habits: res.habits })
      if (allChecked) toast.success('Habit formed!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  const deleteHabit = async (habitId: string) => {
    try {
      const res = await api.discipline.deleteHabit(habitId)
      setData({ habits: res.habits })
      toast.success('Habit deleted')
      if (editingId === habitId) setEditingId(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  const updateHabitName = async (habitId: string) => {
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await api.discipline.updateHabit(habitId, { name: editName.trim() })
      setData({ habits: res.habits })
      setEditingId(null)
      setEditName('')
      toast.success('Habit updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    try {
      downloadCsv(disciplineToCsv(data.habits), `habits-${new Date().toISOString().split('T')[0]}.csv`)
      toast.success('Exported to CSV')
    } catch {
      toast.error('Export failed')
    }
  }

  const deleteAll = async () => {
    try {
      const res = await api.discipline.deleteAll()
      setData({ habits: res.habits })
      setEditingId(null)
      setDeleteAllConfirmOpen(false)
      setModalOpen(false)
      toast.success('All habits deleted')
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

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">21-Day Habit Builder</CardTitle>
          <div className="flex items-center gap-1">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View all">
                  <List className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Habits – View all</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground">{data.habits.length} habit(s)</div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data.habits.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No habits yet.</p>
                    ) : (
                      data.habits.map((habit) => {
                        const checkedDays = habit.checkedDays || Array(21).fill(false)
                        const checkedCount = checkedDays.filter((d) => d === true).length
                        const progress = (checkedCount / 21) * 100
                        return (
                          <div
                            key={habit.id}
                            className="rounded-lg border border-border p-3 space-y-2"
                          >
                            {editingId === habit.id ? (
                              <div className="flex gap-2">
                                <Input
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                  placeholder="Habit name"
                                  className="flex-1"
                                />
                                <Button size="sm" onClick={() => updateHabitName(habit.id)} disabled={saving}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold text-sm">{habit.name}</h3>
                                  <p className="text-xs text-muted-foreground">
                                    {checkedCount}/21 days {habit.habitFormed && '· Formed!'}
                                  </p>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditingId(habit.id)
                                      setEditName(habit.name)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive"
                                    onClick={() => deleteHabit(habit.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  habit.habitFormed ? 'bg-primary' : 'bg-secondary'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExport} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  {data.habits.length > 0 && (
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
                            <AlertDialogTitle>Delete all habits?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove all habits and their progress. This cannot be undone.
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
              <Download className="h-4 w-4" />
            </Button>
            <Plus className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add new habit"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="bg-input border-border flex-1"
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          />
          <Button
            onClick={addHabit}
            size="sm"
            disabled={saving}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {data.habits.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-6">
              No habits yet. Add one to start your 21-day journey!
            </p>
          ) : (
            data.habits.map((habit) => {
              const checkedDays = habit.checkedDays || Array(21).fill(false)
              const checkedCount = checkedDays.filter((d) => d === true).length
              const progress = (checkedCount / 21) * 100
              const startDateStr = habit.startDate || dateToday()
              const currentDayIndex = getDayIndex(startDateStr)
              const isTodayCheckable = currentDayIndex >= 0 && currentDayIndex <= 20

              return (
                <div key={habit.id} className="border border-border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-card-foreground text-sm">{habit.name}</h3>
                      <p className="text-xs text-muted-foreground">{checkedCount}/21 days</p>
                    </div>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1 hover:bg-destructive/10 rounded transition"
                      title="Delete habit"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>

                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        habit.habitFormed ? 'bg-primary' : 'bg-secondary'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {checkedDays.map((isChecked, dayIndex) => {
                      const isToday = dayIndex === currentDayIndex
                      const canToggle = isTodayCheckable && isToday
                      return (
                        <button
                          key={`${habit.id}-day-${dayIndex}`}
                          onClick={() => canToggle && toggleDay(habit.id, dayIndex)}
                          type="button"
                          disabled={!canToggle}
                          className={`aspect-square rounded text-xs font-semibold transition flex items-center justify-center ${
                            !canToggle
                              ? 'bg-muted/50 border border-border text-muted-foreground cursor-not-allowed'
                              : isChecked
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted border border-border hover:border-muted-foreground/50 text-muted-foreground'
                          }`}
                          title={canToggle ? `Today – check to mark day ${dayIndex + 1}` : `${formatDayLabel(startDateStr, dayIndex)} (Day ${dayIndex + 1})`}
                        >
                          {dayIndex + 1}
                        </button>
                      )
                    })}
                  </div>

                  {!habit.habitFormed && isTodayCheckable && (
                    <p className="text-xs text-muted-foreground">
                      Check today&apos;s box to keep your streak. Miss a day and progress resets.
                    </p>
                  )}

                  {habit.habitFormed && (
                    <div className="text-center py-2 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-xs font-bold text-primary">✓ HABIT FORMED!</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
