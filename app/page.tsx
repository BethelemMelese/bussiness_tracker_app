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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between gap-4 min-h-[52px] sm:min-h-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <img
              src="/icon.svg"
              alt="Business Dashboard"
              className="h-8 w-8 sm:h-10 sm:w-10 shrink-0 rounded-lg object-contain"
            />
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-card-foreground truncate">
                Business Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 hidden sm:block">
                Track your entrepreneurial journey
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {(user.name || user.email) && (
              <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline max-w-[100px] md:max-w-[140px] lg:max-w-[200px] truncate" title={[user.name, user.email].filter(Boolean).join(' ')}>
                {user.name && <span className="font-medium">{user.name}</span>}
                {user.name && user.email && <span className="mx-1">·</span>}
                {user.email}
              </span>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-10 w-10 sm:h-9 sm:w-9 shrink-0 border-border text-foreground hover:bg-muted"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleLogout}
              className="h-10 w-10 sm:h-9 sm:w-9 shrink-0 border-border text-foreground hover:bg-muted"
              aria-label="Log out"
            >
              <LogOut className="h-4 w-4" />
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
