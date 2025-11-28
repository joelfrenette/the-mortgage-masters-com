'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { HomeIcon, LightbulbIcon, SlidersIcon, TrendingUpIcon, RefreshCwIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    name: 'Calculator',
    href: '/',
    icon: HomeIcon
  },
  {
    name: 'Lump-Sum Ideas',
    href: '/lump-sum-ideas',
    icon: LightbulbIcon
  },
  {
    name: 'What-If Scenarios',
    href: '/what-if-scenarios',
    icon: SlidersIcon
  },
  {
    name: 'Velocity Banking',
    href: '/velocity-banking',
    icon: TrendingUpIcon
  },
  {
    name: 'When to Refinance',
    href: '/when-to-refinance',
    icon: RefreshCwIcon
  }
]

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link 
              href="https://The-Mortgage-Masters.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xl font-bold text-primary hover:underline"
            >
              The-Mortgage-Masters.com
            </Link>
          </div>
          <div className="flex gap-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
