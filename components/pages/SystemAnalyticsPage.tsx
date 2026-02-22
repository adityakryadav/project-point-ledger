'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Gauge, Database, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const tpsData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 5}s`,
  tps: Math.floor(Math.random() * 2000) + 3000,
}))

const latencyData = Array.from({ length: 20 }, (_, i) => ({
  time: `${i * 5}s`,
  latency: Math.floor(Math.random() * 50) + 120,
}))

const apiResponseData = [
  { endpoint: 'Auth', p50: 45, p95: 120, p99: 250 },
  { endpoint: 'Exchange', p50: 180, p95: 350, p99: 500 },
  { endpoint: 'Fraud', p50: 142, p95: 195, p99: 220 },
  { endpoint: 'Ledger', p50: 95, p95: 180, p99: 300 },
]

export default function SystemAnalyticsPage() {
  const [tps, setTps] = useState(4500)
  const [fraudLatency, setFraudLatency] = useState(142)
  const [cacheHitRatio, setCacheHitRatio] = useState(87.5)
  const [modelDrift, setModelDrift] = useState(0.023)

  useEffect(() => {
    const interval = setInterval(() => {
      setTps(Math.floor(Math.random() * 1000) + 4000)
      setFraudLatency(Math.floor(Math.random() * 30) + 130)
      setCacheHitRatio(85 + Math.random() * 5)
      setModelDrift(0.02 + Math.random() * 0.01)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">System Analytics Dashboard</h1>
          <p className="text-gray-400">Real-time monitoring of TPS, latency, and model performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent-electric/20 to-accent-neon/20">
                <Activity className="w-6 h-6 text-accent-electric" />
              </div>
              <Badge variant={tps > 4500 ? 'success' : 'warning'}>
                {tps > 4500 ? 'Optimal' : 'Normal'}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-1">Transactions Per Second</p>
            <p className="text-3xl font-bold gradient-text">{tps.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">Target: 5,000 TPS</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Gauge className="w-6 h-6 text-green-400" />
              </div>
              <Badge variant={fraudLatency < 200 ? 'success' : 'danger'}>
                {fraudLatency < 200 ? 'OK' : 'Slow'}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-1">Fraud Model Latency</p>
            <p className="text-3xl font-bold text-green-400">{fraudLatency}ms</p>
            <p className="text-xs text-gray-500 mt-1">Target: &lt;200ms</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-teal-500/20">
                <Database className="w-6 h-6 text-teal-400" />
              </div>
              <Badge variant={cacheHitRatio > 85 ? 'success' : 'warning'}>
                {cacheHitRatio > 85 ? 'Good' : 'Low'}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-1">Redis Cache Hit Ratio</p>
            <p className="text-3xl font-bold text-teal-400">{cacheHitRatio.toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Target: &gt;85%</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <TrendingUp className="w-6 h-6 text-yellow-400" />
              </div>
              <Badge variant={modelDrift < 0.05 ? 'success' : 'warning'}>
                {modelDrift < 0.05 ? 'Stable' : 'Drift'}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-1">Model Drift (KL Divergence)</p>
            <p className="text-3xl font-bold text-yellow-400">{modelDrift.toFixed(3)}</p>
            <p className="text-xs text-gray-500 mt-1">Threshold: &lt;0.05</p>
          </Card>
        </div>

        {/* TPS Monitor */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">TPS Monitor (Real-time)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={tpsData}>
              <defs>
                <linearGradient id="colorTps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis domain={[2000, 6000]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2f47',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value.toLocaleString() + ' TPS', 'Transactions']}
              />
              <Area
                type="monotone"
                dataKey="tps"
                stroke="#00D9FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTps)"
              />
              <Line
                type="monotone"
                dataKey={() => 5000}
                stroke="#00FFD1"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-accent-electric rounded"></div>
              <span>Current TPS</span>
              <div className="w-3 h-3 bg-accent-neon rounded ml-4" style={{ borderStyle: 'dashed' }}></div>
              <span>Target (5,000 TPS)</span>
            </div>
          </div>
        </Card>

        {/* Fraud Model Latency */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Fraud Model Latency Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={latencyData}>
              <XAxis dataKey="time" stroke="#6B7280" />
              <YAxis domain={[100, 250]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2f47',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [value + 'ms', 'Latency']}
              />
              <Line
                type="monotone"
                dataKey="latency"
                stroke="#00FFD1"
                strokeWidth={2}
                dot={{ fill: '#00FFD1' }}
              />
              <Line
                type="monotone"
                dataKey={() => 200}
                stroke="#FF6B6B"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 flex items-center justify-center">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <div className="w-3 h-3 bg-accent-neon rounded"></div>
              <span>Current Latency</span>
              <div className="w-3 h-3 bg-red-500 rounded ml-4" style={{ borderStyle: 'dashed' }}></div>
              <span>Threshold (200ms)</span>
            </div>
          </div>
        </Card>

        {/* API Response Times */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">API Response Time (Percentiles)</h2>
          <div className="space-y-4">
            {apiResponseData.map((api, index) => (
              <motion.div
                key={api.endpoint}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-lg p-4 border border-primary-700/30"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold">{api.endpoint} Service</span>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-xs text-gray-400">P50</span>
                      <p className="text-sm font-semibold text-green-400">{api.p50}ms</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">P95</span>
                      <p className="text-sm font-semibold text-yellow-400">{api.p95}ms</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-gray-400">P99</span>
                      <p className="text-sm font-semibold text-red-400">{api.p99}ms</p>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: `${(api.p50 / api.p99) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-500"
                      style={{ width: `${(api.p95 / api.p99) * 100}%` }}
                    />
                  </div>
                  <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500" style={{ width: '100%' }} />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Model Drift Indicator */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Model Drift Indicator (KL Divergence)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Current Drift</span>
                  <span className="text-2xl font-bold gradient-text">{modelDrift.toFixed(3)}</span>
                </div>
                <ProgressBar
                  value={modelDrift * 1000}
                  max={100}
                  color={modelDrift < 0.05 ? 'green' : 'red'}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Stable (&lt;0.05)</span>
                <span className="text-yellow-400">Warning (0.05-0.1)</span>
                <span className="text-red-400">Critical (&gt;0.1)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Model Status</span>
                  {modelDrift < 0.05 ? (
                    <Badge variant="success">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Stable
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Drift Detected
                    </Badge>
                  )}
                </div>
              </div>
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Last Retrain</span>
                  <span className="text-sm font-semibold">2024-01-10</span>
                </div>
              </div>
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Cache Hit Ratio</span>
                  <span className="text-sm font-semibold text-teal-400">
                    {cacheHitRatio.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
