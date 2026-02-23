'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, BookOpen, X } from 'lucide-react'
import { api } from '@/lib/api'

interface StudyEntry {
  id: string
  hours: number
  topic: string
  date: string
}

interface StudyData {
  dailyHours: number
  topics: StudyEntry[]
}

const DEFAULT_STUDY: StudyData = {
  dailyHours: 0,
  topics: [],
}

export function StudyTracker() {
  const [data, setData] = useState<StudyData>(DEFAULT_STUDY)
  const [newHours, setNewHours] = useState('')
  const [newTopic, setNewTopic] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.study.get()
      .then((res) => setData({ dailyHours: res.dailyHours, topics: res.topics }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const addStudySession = async () => {
    if (!newHours || isNaN(Number(newHours))) return
    const hours = Number(newHours)
    setSaving(true)
    setError('')
    try {
      const res = await api.study.addSession(hours, newTopic || undefined)
      setData({ dailyHours: res.dailyHours, topics: res.topics })
      setNewHours('')
      setNewTopic('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add session')
    } finally {
      setSaving(false)
    }
  }

  const deleteStudySession = async (id: string) => {
    setError('')
    try {
      const res = await api.study.deleteSession(id)
      setData({ dailyHours: res.dailyHours, topics: res.topics })
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

  const totalHours = data.topics.reduce((sum, t) => sum + t.hours, 0)
  const uniqueTopics = new Set(data.topics.map(t => t.topic)).size

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Study Tracker</CardTitle>
          <BookOpen className="w-5 h-5 text-secondary" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">Total Hours</p>
            <p className="text-2xl font-bold text-card-foreground">{totalHours.toFixed(1)}h</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">Topics Covered</p>
            <p className="text-2xl font-bold text-card-foreground">{uniqueTopics}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Hours"
              value={newHours}
              onChange={(e) => setNewHours(e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground w-24"
              step="0.5"
            />
            <Input
              type="text"
              placeholder="Topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="bg-input border-border text-card-foreground placeholder:text-muted-foreground flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addStudySession()}
            />
            <Button
              onClick={addStudySession}
              size="sm"
              disabled={saving}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.topics.length > 0 ? (
            data.topics.map((entry) => (
              <div key={entry.id} className="flex justify-between items-start text-xs py-2 px-2 rounded border border-border/30 hover:border-border/60 hover:bg-muted/30 transition group">
                <div className="flex-1">
                  <p className="font-medium text-card-foreground">{entry.topic}</p>
                  <p className="text-muted-foreground text-xs">{entry.date}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <p className="font-semibold text-secondary">{entry.hours}h</p>
                  <button
                    onClick={() => deleteStudySession(entry.id)}
                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-destructive/10 rounded"
                    title="Delete session"
                  >
                    <X className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-xs text-muted-foreground py-4">No study sessions yet. Start learning!</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
