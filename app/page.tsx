'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CapitalTracker } from '@/components/dashboard/capital-tracker'
import { StudyTracker } from '@/components/dashboard/study-tracker'
import { MarketResearch } from '@/components/dashboard/market-research'
import { FinancialModel } from '@/components/dashboard/financial-model'
import { DisciplineScore } from '@/components/dashboard/discipline-score'
import { Button } from '@/components/ui/button'
import { Moon, Sun, LogOut } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/lib/auth-context'

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !isLoading && !user) {
      router.push('/login')
    }
  }, [mounted, isLoading, user, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
    router.refresh()
  }

  if (!mounted || isLoading || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground">Business Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your entrepreneurial journey</p>
          </div>
          <div className="flex items-center gap-2">
            {(user.name || user.email) && (
              <span className="text-sm text-muted-foreground hidden sm:inline">
                {user.name && <span className="font-medium">{user.name}</span>}
                {user.name && user.email && <span className="mx-1">·</span>}
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="border-border text-foreground hover:bg-muted"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-border text-foreground hover:bg-muted"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Row 1 */}
          <div className="lg:col-span-1">
            <CapitalTracker />
          </div>
          <div className="lg:col-span-1">
            <StudyTracker />
          </div>
          <div className="lg:col-span-1">
            <DisciplineScore />
          </div>

          {/* Row 2 */}
          <div className="md:col-span-2 lg:col-span-2">
            <MarketResearch />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <FinancialModel />
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 py-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>Build, Learn, Grow. Every day counts towards your entrepreneurial success.</p>
        </div>
      </main>
    </div>
  )
}
