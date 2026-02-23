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
import { Plus, BookOpen, X, Download, List, Pencil } from 'lucide-react'
import { api } from '@/lib/api'
import { studyToCsv, downloadCsv } from '@/lib/export-csv'

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
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editHours, setEditHours] = useState('')
  const [editTopic, setEditTopic] = useState('')

  const load = () =>
    api.study
      .get()
      .then((res) => setData({ dailyHours: res.dailyHours, topics: res.topics }))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false))

  useEffect(() => {
    load()
  }, [])

  const addStudySession = async () => {
    if (!newHours || isNaN(Number(newHours))) return
    const hours = Number(newHours)
    setSaving(true)
    try {
      const res = await api.study.addSession(hours, newTopic || undefined)
      setData({ dailyHours: res.dailyHours, topics: res.topics })
      setNewHours('')
      setNewTopic('')
      toast.success('Session added')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add session')
    } finally {
      setSaving(false)
    }
  }

  const deleteStudySession = async (id: string) => {
    try {
      const res = await api.study.deleteSession(id)
      setData({ dailyHours: res.dailyHours, topics: res.topics })
      toast.success('Session deleted')
      if (editingId === id) setEditingId(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete')
    }
  }

  const updateSession = async (id: string) => {
    const h = editHours === '' ? undefined : Number(editHours)
    if (h !== undefined && (isNaN(h) || h <= 0)) return
    setSaving(true)
    try {
      const res = await api.study.updateSession(id, {
        ...(h !== undefined && { hours: h }),
        ...(editTopic !== undefined && { topic: editTopic }),
      })
      setData({ dailyHours: res.dailyHours, topics: res.topics })
      setEditingId(null)
      setEditHours('')
      setEditTopic('')
      toast.success('Session updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to update')
    } finally {
      setSaving(false)
    }
  }

  const handleExport = () => {
    try {
      downloadCsv(studyToCsv(data.topics), `study-${new Date().toISOString().split('T')[0]}.csv`)
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

  const totalHours = data.topics.reduce((sum, t) => sum + t.hours, 0)
  const uniqueTopics = new Set(data.topics.map((t) => t.topic)).size

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-card-foreground">Study Tracker</CardTitle>
          <div className="flex items-center gap-1">
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8" title="View all">
                  <List className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Study Tracker – View all</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total hours: {totalHours.toFixed(1)}</span>
                    <span className="text-muted-foreground">Topics: {uniqueTopics}</span>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {data.topics.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No sessions yet.</p>
                    ) : (
                      data.topics.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-2 p-2 rounded border border-border"
                        >
                          {editingId === entry.id ? (
                            <>
                              <Input
                                type="number"
                                placeholder="Hours"
                                value={editHours}
                                onChange={(e) => setEditHours(e.target.value)}
                                className="w-20 h-8"
                              />
                              <Input
                                placeholder="Topic"
                                value={editTopic}
                                onChange={(e) => setEditTopic(e.target.value)}
                                className="flex-1 h-8"
                              />
                              <Button size="sm" onClick={() => updateSession(entry.id)} disabled={saving}>
                                Save
                              </Button>
                              <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{entry.topic}</p>
                                <p className="text-xs text-muted-foreground">{entry.date} · {entry.hours}h</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0"
                                onClick={() => {
                                  setEditingId(entry.id)
                                  setEditHours(String(entry.hours))
                                  setEditTopic(entry.topic)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-destructive"
                                onClick={() => deleteStudySession(entry.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      ))
                    )}
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
            <BookOpen className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
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
              className="bg-input border-border w-24"
              step="0.5"
            />
            <Input
              type="text"
              placeholder="Topic"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              className="bg-input border-border flex-1"
              onKeyPress={(e) => e.key === 'Enter' && addStudySession()}
            />
            <Button
              onClick={addStudySession}
              size="sm"
              disabled={saving}
              className="bg-secondary text-secondary-foreground"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto">
          {data.topics.length > 0 ? (
            data.topics.map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-start text-xs py-2 px-2 rounded border border-border/30 hover:bg-muted/30 transition group"
              >
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
