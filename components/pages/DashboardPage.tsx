'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, TrendingUp, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import ProgressBar from '@/components/ui/ProgressBar'
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts'

const COLORS = ['#00D9FF', '#00FFD1', '#4DD0E1', '#26C6DA', '#00BCD4']

const loyaltyPrograms = [
  { name: 'HDFC Rewards', points: 45000, inr: 13500, color: COLORS[0] },
  { name: 'SBI Rewards', points: 32000, inr: 9600, color: COLORS[1] },
  { name: 'InterMiles', points: 18000, inr: 5400, color: COLORS[2] },
  { name: 'Axis Points', points: 12000, inr: 3600, color: COLORS[3] },
  { name: 'ICICI Rewards', points: 8000, inr: 2400, color: COLORS[4] },
]

const transactions = [
  {
    id: 1,
    type: 'exchange',
    from: 'HDFC Rewards',
    to: 'Amazon Voucher',
    amount: 5000,
    rate: 0.30,
    fraudScore: 0.12,
    status: 'success',
    timestamp: '2024-01-15 14:30',
  },
  {
    id: 2,
    type: 'exchange',
    from: 'SBI Rewards',
    to: 'Flipkart Voucher',
    amount: 3000,
    rate: 0.28,
    fraudScore: 0.45,
    status: 'flagged',
    timestamp: '2024-01-15 10:15',
  },
  {
    id: 3,
    type: 'aggregate',
    from: 'InterMiles',
    to: 'Wallet',
    amount: 18000,
    rate: 0.30,
    fraudScore: 0.08,
    status: 'success',
    timestamp: '2024-01-14 16:45',
  },
]

const chartData = [
  { name: 'Mon', value: 12000 },
  { name: 'Tue', value: 19000 },
  { name: 'Wed', value: 15000 },
  { name: 'Thu', value: 22000 },
  { name: 'Fri', value: 18000 },
  { name: 'Sat', value: 25000 },
  { name: 'Sun', value: 21000 },
]

export default function DashboardPage() {
  const totalINR = loyaltyPrograms.reduce((sum, p) => sum + p.inr, 0)
  const walletLimit = 200000
  const usedLimit = 45000

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-400">Welcome back! Here's your loyalty wallet overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Balance</p>
                <p className="text-3xl font-bold gradient-text">₹{totalINR.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">Across 5 programs</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-accent-electric/20 to-accent-neon/20">
                <Wallet className="w-8 h-8 text-accent-electric" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">This Month</p>
                <p className="text-3xl font-bold text-green-400">+₹12,500</p>
                <p className="text-xs text-gray-500 mt-1">From exchanges</p>
              </div>
              <div className="p-4 rounded-lg bg-green-500/20">
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Risk Level</p>
                <p className="text-3xl font-bold text-yellow-400">Low</p>
                <p className="text-xs text-gray-500 mt-1">Avg score: 0.22</p>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/20">
                <AlertTriangle className="w-8 h-8 text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Wallet Limit Progress */}
        <Card className="mb-8">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-semibold">Wallet Limit</h2>
              <Badge variant={usedLimit < walletLimit * 0.8 ? 'success' : 'warning'}>
                {((usedLimit / walletLimit) * 100).toFixed(1)}% Used
              </Badge>
            </div>
            <ProgressBar
              value={usedLimit}
              max={walletLimit}
              color="electric"
            />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Program Distribution */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Program Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={loyaltyPrograms}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, inr }) => `${name}: ₹${(inr / 1000).toFixed(1)}K`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="inr"
                >
                  {loyaltyPrograms.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          {/* Transaction Trend */}
          <Card>
            <h2 className="text-xl font-semibold mb-4">Weekly Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <XAxis dataKey="name" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1a2f47',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#00D9FF"
                  strokeWidth={2}
                  dot={{ fill: '#00D9FF' }}
                  name="INR Value"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Recent Transactions */}
        <Card>
          <h2 className="text-xl font-semibold mb-6">Recent Transactions</h2>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass rounded-lg p-4 border border-primary-700/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`p-3 rounded-lg ${
                        tx.type === 'exchange'
                          ? 'bg-accent-electric/20'
                          : 'bg-teal-500/20'
                      }`}
                    >
                      {tx.type === 'exchange' ? (
                        <ArrowUpRight className="w-5 h-5 text-accent-electric" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-teal-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">
                        {tx.from} → {tx.to}
                      </p>
                      <p className="text-sm text-gray-400">{tx.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{tx.amount.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">Rate: {tx.rate}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <Badge
                        variant={
                          tx.fraudScore < 0.3
                            ? 'success'
                            : tx.fraudScore < 0.6
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        Risk: {(tx.fraudScore * 100).toFixed(0)}%
                      </Badge>
                      <Badge
                        variant={
                          tx.status === 'success'
                            ? 'success'
                            : tx.status === 'flagged'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
