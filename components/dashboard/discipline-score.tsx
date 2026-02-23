'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Trash2 } from 'lucide-react'
import { api } from '@/lib/api'

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

export function DisciplineScore() {
  const [data, setData] = useState<DisciplineData>(DEFAULT_DISCIPLINE)
  const [newHabit, setNewHabit] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.discipline
      .get()
      .then((res) => setData({ habits: res.habits }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addHabit = async () => {
    if (!newHabit) return
    setSaving(true)
    setError('')
    try {
      const res = await api.discipline.addHabit(newHabit)
      setData({ habits: res.habits })
      setNewHabit('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add habit')
    } finally {
      setSaving(false)
    }
  }

  const toggleDay = async (habitId: string, dayIndex: number) => {
    const habit = data.habits.find((h) => h.id === habitId)
    if (!habit) return

    const newCheckedDays = [...(habit.checkedDays || Array(21).fill(false))]
    if (newCheckedDays[dayIndex]) {
      newCheckedDays[dayIndex] = false
    } else {
      const allPreviousDaysChecked = newCheckedDays.slice(0, dayIndex).every((d) => d === true)
      if (allPreviousDaysChecked || dayIndex === 0) {
        newCheckedDays[dayIndex] = true
      } else {
        for (let i = 0; i < newCheckedDays.length; i++) {
          newCheckedDays[i] = false
        }
        newCheckedDays[0] = true
      }
    }
    const allChecked = newCheckedDays.length === 21 && newCheckedDays.every((d) => d === true)

    setError('')
    try {
      const res = await api.discipline.updateHabit(habitId, {
        checkedDays: newCheckedDays,
        habitFormed: allChecked,
      })
      setData({ habits: res.habits })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update')
    }
  }

  const deleteHabit = async (habitId: string) => {
    setError('')
    try {
      const res = await api.discipline.deleteHabit(habitId)
      setData({ habits: res.habits })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete')
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
          <Plus className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Add new habit"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            className="bg-input border-border text-card-foreground placeholder:text-muted-foreground flex-1"
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
                    {checkedDays.map((isChecked, dayIndex) => (
                      <button
                        key={`${habit.id}-day-${dayIndex}`}
                        onClick={() => toggleDay(habit.id, dayIndex)}
                        type="button"
                        className={`aspect-square rounded text-xs font-semibold transition flex items-center justify-center ${
                          isChecked
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted border border-border hover:border-muted-foreground/50 text-muted-foreground'
                        }`}
                        title={`Day ${dayIndex + 1}`}
                      >
                        {dayIndex + 1}
                      </button>
                    ))}
                  </div>

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
