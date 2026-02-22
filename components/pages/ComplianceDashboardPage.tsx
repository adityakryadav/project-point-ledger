'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, AlertCircle, Users, Filter, Search } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const suspiciousTransactions = [
  {
    id: 'STR-001',
    userId: 'USER-1234',
    kycLevel: 'Small PPI',
    amount: 52000,
    monthlyTotal: 1250000,
    pattern: 'Smurfing',
    riskScore: 0.85,
    date: '2024-01-15',
    status: 'pending',
  },
  {
    id: 'STR-002',
    userId: 'USER-5678',
    kycLevel: 'Full KYC',
    amount: 75000,
    monthlyTotal: 850000,
    pattern: 'High Value',
    riskScore: 0.72,
    date: '2024-01-14',
    status: 'submitted',
  },
  {
    id: 'STR-003',
    userId: 'USER-9012',
    kycLevel: 'Small PPI',
    amount: 48000,
    monthlyTotal: 1100000,
    pattern: 'Smurfing',
    riskScore: 0.91,
    date: '2024-01-13',
    status: 'pending',
  },
]

const monthlyAlerts = [
  {
    userId: 'USER-1234',
    name: 'John Doe',
    monthlyTotal: 1250000,
    threshold: 1000000,
    kycLevel: 'Small PPI',
    status: 'alert',
  },
  {
    userId: 'USER-5678',
    name: 'Jane Smith',
    monthlyTotal: 850000,
    threshold: 1000000,
    kycLevel: 'Full KYC',
    status: 'warning',
  },
]

const smurfingAlerts = [
  {
    userId: 'USER-1234',
    pattern: 'Multiple small transactions',
    count: 15,
    totalAmount: 75000,
    timeWindow: '24 hours',
    riskScore: 0.88,
  },
  {
    userId: 'USER-9012',
    pattern: 'Rapid sequential exchanges',
    count: 12,
    totalAmount: 60000,
    timeWindow: '12 hours',
    riskScore: 0.92,
  },
]

export default function ComplianceDashboardPage() {
  const [kycFilter, setKycFilter] = useState<string>('all')
  const [search, setSearch] = useState('')

  const handleExportSTR = (id: string) => {
    // Simulate STR XML export
    console.log('Exporting STR:', id)
  }

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Compliance Dashboard</h1>
            <p className="text-gray-400">FIU-IND / GSTN Reporting & STR Management</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Bulk Export
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Pending STRs</p>
                <p className="text-3xl font-bold text-yellow-400">
                  {suspiciousTransactions.filter((s) => s.status === 'pending').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Submitted STRs</p>
                <p className="text-3xl font-bold text-green-400">
                  {suspiciousTransactions.filter((s) => s.status === 'submitted').length}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-green-500/20">
                <FileText className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Monthly Alerts</p>
                <p className="text-3xl font-bold text-red-400">{monthlyAlerts.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-red-500/20">
                <AlertCircle className="w-6 h-6 text-red-400" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400 mb-1">Smurfing Cases</p>
                <p className="text-3xl font-bold text-orange-400">{smurfingAlerts.length}</p>
              </div>
              <div className="p-3 rounded-lg bg-orange-500/20">
                <Users className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Transaction Alerts */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Monthly Transactions Over ₹10L</h2>
          <div className="space-y-4">
            {monthlyAlerts.map((alert, index) => (
              <motion.div
                key={alert.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-lg p-4 border border-primary-700/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{alert.name}</p>
                    <p className="text-sm text-gray-400">User ID: {alert.userId}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      KYC Level: <Badge variant="warning">{alert.kycLevel}</Badge>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-400">
                      ₹{alert.monthlyTotal.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-400">
                      Threshold: ₹{alert.threshold.toLocaleString()}
                    </p>
                    <Badge
                      variant={alert.status === 'alert' ? 'danger' : 'warning'}
                      className="mt-2"
                    >
                      {alert.status === 'alert' ? 'Action Required' : 'Warning'}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Smurfing Detection */}
        <Card className="mb-8">
          <h2 className="text-xl font-semibold mb-6">Smurfing Detection Alerts</h2>
          <div className="space-y-4">
            {smurfingAlerts.map((alert, index) => (
              <motion.div
                key={alert.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="glass rounded-lg p-4 border border-red-500/30"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">User ID: {alert.userId}</p>
                    <p className="text-sm text-gray-400">{alert.pattern}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge variant="info">{alert.count} transactions</Badge>
                      <Badge variant="warning">{alert.timeWindow}</Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-red-400">
                      ₹{alert.totalAmount.toLocaleString()}
                    </p>
                    <Badge variant="danger" className="mt-2">
                      Risk: {(alert.riskScore * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Suspicious Transaction Reports */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Suspicious Transaction Reports (STR)</h2>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={kycFilter}
                onChange={(e) => setKycFilter(e.target.value)}
                className="px-4 py-2 rounded-lg glass border border-primary-600/30 bg-primary-900/50 text-white focus:outline-none focus:ring-2 focus:ring-accent-electric"
              >
                <option value="all">All KYC Levels</option>
                <option value="Small PPI">Small PPI</option>
                <option value="Full KYC">Full KYC</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {suspiciousTransactions
              .filter(
                (str) =>
                  (kycFilter === 'all' || str.kycLevel === kycFilter) &&
                  (str.id.toLowerCase().includes(search.toLowerCase()) ||
                    str.userId.toLowerCase().includes(search.toLowerCase()))
              )
              .map((str, index) => (
                <motion.div
                  key={str.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-4 border border-primary-700/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="font-mono font-semibold">{str.id}</span>
                        <Badge
                          variant={str.status === 'pending' ? 'warning' : 'success'}
                        >
                          {str.status}
                        </Badge>
                        <Badge variant="info">{str.kycLevel}</Badge>
                      </div>
                      <p className="text-sm text-gray-400 mb-1">User: {str.userId}</p>
                      <p className="text-sm text-gray-400">
                        Pattern: <span className="text-yellow-400">{str.pattern}</span>
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-400">
                          Amount: <span className="text-white font-semibold">₹{str.amount.toLocaleString()}</span>
                        </span>
                        <span className="text-sm text-gray-400">
                          Monthly Total: <span className="text-red-400 font-semibold">₹{str.monthlyTotal.toLocaleString()}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 ml-6">
                      <div className="text-right mr-4">
                        <p className="text-sm text-gray-400">Risk Score</p>
                        <p className="text-2xl font-bold text-red-400">
                          {(str.riskScore * 100).toFixed(0)}%
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportSTR(str.id)}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export STR XML
                      </Button>
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
