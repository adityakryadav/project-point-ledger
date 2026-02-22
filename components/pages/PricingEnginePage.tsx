'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, TrendingUp, TrendingDown, Sliders } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts'

const revenueData = [
  { time: '00:00', revenue: 12000, inventory: 450000 },
  { time: '04:00', revenue: 15000, inventory: 420000 },
  { time: '08:00', revenue: 18000, inventory: 400000 },
  { time: '12:00', revenue: 22000, inventory: 380000 },
  { time: '16:00', revenue: 25000, inventory: 350000 },
  { time: '20:00', revenue: 28000, inventory: 320000 },
]

const demandData = [
  { program: 'HDFC', demand: 85, multiplier: 1.15 },
  { program: 'SBI', demand: 72, multiplier: 1.08 },
  { program: 'InterMiles', demand: 65, multiplier: 1.02 },
  { program: 'Axis', demand: 45, multiplier: 0.95 },
]

const heatmapData = [
  { hour: 0, multiplier: 0.95 },
  { hour: 4, multiplier: 0.98 },
  { hour: 8, multiplier: 1.05 },
  { hour: 12, multiplier: 1.15 },
  { hour: 16, multiplier: 1.20 },
  { hour: 20, multiplier: 1.12 },
]

export default function PricingEnginePage() {
  const [multiplier, setMultiplier] = useState(1.15)
  const [modelStatus, setModelStatus] = useState<'active' | 'training'>('active')

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Pricing Engine Admin</h1>
            <p className="text-gray-400">Deep Q-Network Reinforcement Learning Controls</p>
          </div>
          <Badge variant={modelStatus === 'active' ? 'success' : 'warning'}>
            {modelStatus === 'active' ? 'Model Active' : 'Training'}
          </Badge>
        </div>

        {/* DQN Controls */}
        <Card className="mb-8">
          <div className="flex items-center space-x-2 mb-6">
            <Brain className="w-5 h-5 text-accent-electric" />
            <h2 className="text-xl font-semibold">DQN Multiplier Control</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Exchange Multiplier</span>
                  <span className="text-2xl font-bold gradient-text">{multiplier.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.01"
                  value={multiplier}
                  onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                  className="w-full h-2 bg-primary-800 rounded-lg appearance-none cursor-pointer accent-accent-electric"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.5x</span>
                  <span>1.0x</span>
                  <span>1.5x</span>
                  <span>2.0x</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMultiplier(1.0)}
                  className="w-full"
                >
                  Reset to 1.0x
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setModelStatus(modelStatus === 'active' ? 'training' : 'active')}
                  className="w-full"
                >
                  {modelStatus === 'active' ? 'Start Training' : 'Activate Model'}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <p className="text-sm text-gray-400 mb-1">Current State</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Inventory Level</span>
                    <Badge variant="info">380K points</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Demand Level</span>
                    <Badge variant="warning">High</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Time Factor</span>
                    <Badge variant="info">Peak Hours</Badge>
                  </div>
                </div>
              </div>
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <p className="text-sm text-gray-400 mb-1">Model Performance</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Reward</span>
                    <span className="text-green-400 font-semibold">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Q-Value</span>
                    <span className="text-accent-electric font-semibold">0.87</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Revenue vs Inventory */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-xl font-semibold mb-6">Revenue vs Inventory</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <XAxis dataKey="time" stroke="#6B7280" />
                <YAxis yAxisId="left" stroke="#6B7280" />
                <YAxis yAxisId="right" orientation="right" stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2f47',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#00D9FF"
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="inventory"
                  stroke="#00FFD1"
                  strokeWidth={2}
                  name="Inventory (points)"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <h2 className="text-xl font-semibold mb-6">Exchange Demand Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={demandData}>
                <XAxis dataKey="program" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2f47',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="demand" fill="#00D9FF" name="Demand (%)" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Time-based Pricing Heatmap */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Time-based Pricing Heatmap</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={heatmapData}>
              <XAxis dataKey="hour" stroke="#6B7280" />
              <YAxis domain={[0.9, 1.25]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2f47',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toFixed(2) + 'x', 'Multiplier']}
              />
              <Bar dataKey="multiplier">
                {heatmapData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.multiplier < 1.0
                        ? '#4B5563'
                        : entry.multiplier < 1.1
                        ? '#00D9FF'
                        : entry.multiplier < 1.15
                        ? '#00FFD1'
                        : '#00BCD4'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-600 rounded"></div>
              <span className="text-xs text-gray-400">&lt; 1.0x</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-accent-electric rounded"></div>
              <span className="text-xs text-gray-400">1.0x - 1.1x</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-accent-neon rounded"></div>
              <span className="text-xs text-gray-400">1.1x - 1.15x</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-teal-500 rounded"></div>
              <span className="text-xs text-gray-400">&gt; 1.15x</span>
            </div>
          </div>
        </Card>

        {/* Program-wise Multipliers */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Program-wise Current Multipliers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {demandData.map((program, index) => (
              <motion.div
                key={program.program}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-lg p-4 border border-primary-700/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{program.program}</span>
                  {program.multiplier > 1.0 ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                </div>
                <p className="text-2xl font-bold gradient-text mb-2">
                  {program.multiplier.toFixed(2)}x
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Demand</span>
                  <Badge variant="info">{program.demand}%</Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
