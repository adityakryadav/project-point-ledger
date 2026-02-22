'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle, XCircle, MapPin, Smartphone } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'

const fraudHistory = [
  { date: '2024-01-10', score: 0.15 },
  { date: '2024-01-11', score: 0.22 },
  { date: '2024-01-12', score: 0.18 },
  { date: '2024-01-13', score: 0.25 },
  { date: '2024-01-14', score: 0.20 },
  { date: '2024-01-15', score: 0.22 },
]

const recentChecks = [
  {
    id: 1,
    transaction: 'TXN-001',
    score: 0.12,
    level: 'low',
    device: 'iPhone 14 Pro',
    location: 'Mumbai, MH',
    velocity: 'Normal',
    timestamp: '2024-01-15 14:30:22',
  },
  {
    id: 2,
    transaction: 'TXN-002',
    score: 0.45,
    level: 'medium',
    device: 'Samsung Galaxy S21',
    location: 'Delhi, DL',
    velocity: 'High',
    timestamp: '2024-01-15 10:15:45',
  },
  {
    id: 3,
    transaction: 'TXN-003',
    score: 0.08,
    level: 'low',
    device: 'iPhone 13',
    location: 'Mumbai, MH',
    velocity: 'Normal',
    timestamp: '2024-01-14 16:45:12',
  },
  {
    id: 4,
    transaction: 'TXN-004',
    score: 0.78,
    level: 'high',
    device: 'Unknown Device',
    location: 'Bangalore, KA',
    velocity: 'Very High',
    timestamp: '2024-01-14 09:20:33',
  },
]

export default function FraudDetectionPage() {
  const [selectedCheck, setSelectedCheck] = useState<number | null>(null)

  const getRiskLevel = (score: number) => {
    if (score < 0.3) return { level: 'low', color: 'green', label: 'Low Risk' }
    if (score < 0.6) return { level: 'medium', color: 'yellow', label: 'Medium Risk' }
    return { level: 'high', color: 'red', label: 'High Risk' }
  }

  const avgScore = fraudHistory.reduce((sum, h) => sum + h.score, 0) / fraudHistory.length
  const riskLevel = getRiskLevel(avgScore)

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Fraud Detection Dashboard</h1>
          <p className="text-gray-400">
            Real-time fraud scoring with XGBoost model and velocity checks
          </p>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent-electric/20 to-accent-neon/20">
                <Shield className="w-6 h-6 text-accent-electric" />
              </div>
              <Badge variant={riskLevel.level === 'low' ? 'success' : riskLevel.level === 'medium' ? 'warning' : 'danger'}>
                {riskLevel.label}
              </Badge>
            </div>
            <p className="text-sm text-gray-400 mb-2">Average Fraud Score</p>
            <p className="text-3xl font-bold gradient-text">{(avgScore * 100).toFixed(1)}%</p>
            <p className="text-xs text-gray-500 mt-1">Last 7 days</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-2">Model Latency</p>
            <p className="text-3xl font-bold text-green-400">142ms</p>
            <p className="text-xs text-gray-500 mt-1">Target: &lt;200ms</p>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            <p className="text-sm text-gray-400 mb-2">Flagged Transactions</p>
            <p className="text-3xl font-bold text-yellow-400">
              {recentChecks.filter((c) => c.level !== 'low').length}
            </p>
            <p className="text-xs text-gray-500 mt-1">Requires review</p>
          </Card>
        </div>

        {/* Fraud Score Meter */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Current Risk Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Fraud Probability</span>
                  <span className="text-2xl font-bold gradient-text">{(avgScore * 100).toFixed(1)}%</span>
                </div>
                <ProgressBar
                  value={avgScore * 100}
                  max={100}
                  color={riskLevel.color as 'electric' | 'teal' | 'green' | 'red'}
                />
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-400">Low (0-30%)</span>
                <span className="text-yellow-400">Medium (30-60%)</span>
                <span className="text-red-400">High (60-100%)</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-400">Device Fingerprint</span>
                <Badge variant="success">Verified</Badge>
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-400">Geo Consistency</span>
                <Badge variant="success">Consistent</Badge>
              </div>
              <div className="flex items-center justify-between p-3 glass rounded-lg">
                <span className="text-sm text-gray-400">Velocity Check</span>
                <Badge variant="warning">Moderate</Badge>
              </div>
            </div>
          </div>
        </Card>

        {/* Fraud Score Trend */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Fraud Score Trend (7 Days)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={fraudHistory}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00D9FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#6B7280" />
              <YAxis domain={[0, 1]} stroke="#6B7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1a2f47',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [(value * 100).toFixed(1) + '%', 'Fraud Score']}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00D9FF"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorScore)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Fraud Checks */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Recent Fraud Checks</h2>
          <div className="space-y-4">
            {recentChecks.map((check) => {
              const risk = getRiskLevel(check.score)
              return (
                <motion.div
                  key={check.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedCheck(check.id)}
                  className={`glass rounded-lg p-4 border-2 cursor-pointer transition-all ${
                    selectedCheck === check.id
                      ? 'border-accent-electric bg-accent-electric/10'
                      : 'border-primary-700/30 hover:border-primary-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${
                          risk.level === 'low'
                            ? 'bg-green-500/20'
                            : risk.level === 'medium'
                            ? 'bg-yellow-500/20'
                            : 'bg-red-500/20'
                        }`}
                      >
                        <Shield
                          className={`w-5 h-5 ${
                            risk.level === 'low'
                              ? 'text-green-400'
                              : risk.level === 'medium'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        />
                      </div>
                      <div>
                        <p className="font-semibold">{check.transaction}</p>
                        <p className="text-xs text-gray-400">{check.timestamp}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold gradient-text">
                        {(check.score * 100).toFixed(0)}%
                      </p>
                      <Badge
                        variant={
                          risk.level === 'low'
                            ? 'success'
                            : risk.level === 'medium'
                            ? 'warning'
                            : 'danger'
                        }
                        className="mt-1"
                      >
                        {risk.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 pt-3 border-t border-primary-700/30">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{check.device}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">{check.location}</span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-400">Velocity: </span>
                      <Badge
                        variant={
                          check.velocity === 'Normal'
                            ? 'success'
                            : check.velocity === 'High'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {check.velocity}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
