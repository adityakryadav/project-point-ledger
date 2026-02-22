'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link2, RefreshCw, Check, X, Building2, Plane, CreditCard } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

const programs = [
  {
    id: 1,
    name: 'HDFC Rewards',
    type: 'bank',
    icon: Building2,
    connected: true,
    balance: 45000,
    inr: 13500,
    lastSync: '2 min ago',
  },
  {
    id: 2,
    name: 'SBI Rewards',
    type: 'bank',
    icon: Building2,
    connected: true,
    balance: 32000,
    inr: 9600,
    lastSync: '5 min ago',
  },
  {
    id: 3,
    name: 'InterMiles',
    type: 'airline',
    icon: Plane,
    connected: true,
    balance: 18000,
    inr: 5400,
    lastSync: '1 hour ago',
  },
  {
    id: 4,
    name: 'Axis Points',
    type: 'bank',
    icon: Building2,
    connected: false,
    balance: 0,
    inr: 0,
    lastSync: null,
  },
  {
    id: 5,
    name: 'ICICI Rewards',
    type: 'bank',
    icon: Building2,
    connected: false,
    balance: 0,
    inr: 0,
    lastSync: null,
  },
  {
    id: 6,
    name: 'Amazon Pay',
    type: 'merchant',
    icon: CreditCard,
    connected: false,
    balance: 0,
    inr: 0,
    lastSync: null,
  },
]

export default function LoyaltyAggregationPage() {
  const [syncing, setSyncing] = useState<number | null>(null)

  const handleConnect = (id: number) => {
    // Simulate connection
    console.log('Connecting program:', id)
  }

  const handleSync = async (id: number) => {
    setSyncing(id)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setSyncing(null)
  }

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Loyalty Aggregation</h1>
          <p className="text-gray-400">
            Connect your bank, airline, and merchant loyalty programs
          </p>
        </div>

        {/* Connected Programs Summary */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Connected Programs</h2>
            <Badge variant="success">
              {programs.filter((p) => p.connected).length} Active
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {programs
              .filter((p) => p.connected)
              .map((program) => {
                const Icon = program.icon
                return (
                  <div
                    key={program.id}
                    className="glass rounded-lg p-4 border border-primary-700/30"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon className="w-5 h-5 text-accent-electric" />
                        <span className="font-semibold">{program.name}</span>
                      </div>
                      <Check className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="mt-2">
                      <p className="text-2xl font-bold gradient-text">
                        ₹{program.inr.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {program.balance.toLocaleString()} points
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Synced {program.lastSync}
                      </p>
                    </div>
                  </div>
                )
              })}
          </div>
        </Card>

        {/* Available Programs */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Available Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {programs.map((program, index) => {
              const Icon = program.icon
              return (
                <motion.div
                  key={program.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card hover className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-lg bg-gradient-to-br from-accent-electric/20 to-accent-neon/20">
                          <Icon className="w-6 h-6 text-accent-electric" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{program.name}</h3>
                          <p className="text-xs text-gray-400 capitalize">{program.type}</p>
                        </div>
                      </div>
                      {program.connected ? (
                        <Badge variant="success">Connected</Badge>
                      ) : (
                        <Badge variant="default">Not Connected</Badge>
                      )}
                    </div>

                    {program.connected ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-2xl font-bold gradient-text">
                            ₹{program.inr.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-400">
                            {program.balance.toLocaleString()} points
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleSync(program.id)}
                            disabled={syncing === program.id}
                          >
                            {syncing === program.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Sync Now
                              </>
                            )}
                          </Button>
                          <Button variant="primary" size="sm" className="flex-1">
                            Exchange
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray-400 mb-4">
                          Connect your {program.name} account to start aggregating points
                        </p>
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(program.id)}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Connect Account
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </Card>

        {/* Real-time Balance Fetch UI */}
        <Card className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Real-time Balance Sync</h3>
              <p className="text-sm text-gray-400">
                Automatically fetch latest balances from connected programs
              </p>
            </div>
            <Button
              onClick={() => {
                programs
                  .filter((p) => p.connected)
                  .forEach((p) => handleSync(p.id))
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Sync All
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
