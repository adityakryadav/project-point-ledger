'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Wallet, Home, Shield, TrendingUp, FileText, Settings, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Dashboard', icon: Wallet },
  { href: '/aggregation', label: 'Aggregation', icon: TrendingUp },
  { href: '/exchange', label: 'Exchange', icon: TrendingUp },
  { href: '/ledger', label: 'Ledger', icon: FileText },
  { href: '/fraud', label: 'Fraud Detection', icon: Shield },
  { href: '/compliance', label: 'Compliance', icon: Shield },
  { href: '/pricing', label: 'Pricing Engine', icon: Settings },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Navbar() {
  const pathname = usePathname()
  
  // Hide navbar on landing page
  if (pathname === '/') {
    return null
  }

  return (
    <nav className="glass border-b border-primary-700/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-electric to-accent-neon flex items-center justify-center">
              <span className="text-primary-900 font-bold text-xl">IL</span>
            </div>
            <span className="text-xl font-bold gradient-text">ILPEP</span>
          </Link>
          <div className="flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all',
                    isActive
                      ? 'bg-accent-electric/20 text-accent-electric'
                      : 'text-gray-400 hover:text-accent-electric hover:bg-primary-800/50'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
