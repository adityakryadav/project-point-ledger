'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Filter, Search } from 'lucide-react'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'

const transactions = [
  {
    id: 'TXN-001',
    date: '2024-01-15',
    description: 'HDFC Rewards → Amazon Voucher',
    debit: 5000,
    credit: 0,
    cgst: 40.5,
    sgst: 40.5,
    igst: 0,
    status: 'success',
    fraudScore: 0.12,
  },
  {
    id: 'TXN-002',
    date: '2024-01-15',
    description: 'SBI Rewards → Flipkart Voucher',
    debit: 3000,
    credit: 0,
    cgst: 24.3,
    sgst: 24.3,
    igst: 0,
    status: 'flagged',
    fraudScore: 0.45,
  },
  {
    id: 'TXN-003',
    date: '2024-01-14',
    description: 'InterMiles Aggregation',
    debit: 0,
    credit: 5400,
    cgst: 0,
    sgst: 0,
    igst: 0,
    status: 'success',
    fraudScore: 0.08,
  },
  {
    id: 'TXN-004',
    date: '2024-01-14',
    description: 'Service Fee Collection',
    debit: 100,
    credit: 0,
    cgst: 4.5,
    sgst: 4.5,
    igst: 0,
    status: 'success',
    fraudScore: 0.05,
  },
]

export default function LedgerPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.id.toLowerCase().includes(search.toLowerCase()) ||
      tx.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || tx.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalDebit = filteredTransactions.reduce((sum, tx) => sum + tx.debit, 0)
  const totalCredit = filteredTransactions.reduce((sum, tx) => sum + tx.credit, 0)
  const totalCGST = filteredTransactions.reduce((sum, tx) => sum + tx.cgst, 0)
  const totalSGST = filteredTransactions.reduce((sum, tx) => sum + tx.sgst, 0)
  const totalIGST = filteredTransactions.reduce((sum, tx) => sum + tx.igst, 0)

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Ledger & Transaction History</h1>
            <p className="text-gray-400">Double-entry bookkeeping with GST breakdown</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <p className="text-sm text-gray-400 mb-1">Total Debit</p>
            <p className="text-2xl font-bold text-red-400">₹{totalDebit.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-400 mb-1">Total Credit</p>
            <p className="text-2xl font-bold text-green-400">₹{totalCredit.toLocaleString()}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-400 mb-1">CGST</p>
            <p className="text-2xl font-bold text-yellow-400">₹{totalCGST.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-400 mb-1">SGST</p>
            <p className="text-2xl font-bold text-yellow-400">₹{totalSGST.toFixed(2)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-400 mb-1">IGST</p>
            <p className="text-2xl font-bold text-yellow-400">₹{totalIGST.toFixed(2)}</p>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 rounded-lg glass border border-primary-600/30 bg-primary-900/50 text-white focus:outline-none focus:ring-2 focus:ring-accent-electric"
              >
                <option value="all">All Status</option>
                <option value="success">Success</option>
                <option value="flagged">Flagged</option>
                <option value="review">Under Review</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Ledger Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary-700/30">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                    Transaction ID
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                    Date
                  </th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">
                    Description
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                    Debit (₹)
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                    Credit (₹)
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                    CGST
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                    SGST
                  </th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">
                    IGST
                  </th>
                  <th className="text-center py-4 px-4 text-sm font-semibold text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, index) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-primary-700/10 hover:bg-primary-800/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm">{tx.id}</span>
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-400">{tx.date}</td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium">{tx.description}</p>
                        <Badge
                          variant={
                            tx.fraudScore < 0.3
                              ? 'success'
                              : tx.fraudScore < 0.6
                              ? 'warning'
                              : 'danger'
                          }
                          className="mt-1"
                        >
                          Risk: {(tx.fraudScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {tx.debit > 0 ? (
                        <span className="text-red-400 font-semibold">
                          {tx.debit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {tx.credit > 0 ? (
                        <span className="text-green-400 font-semibold">
                          {tx.credit.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-400">
                      {tx.cgst > 0 ? `₹${tx.cgst.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-400">
                      {tx.sgst > 0 ? `₹${tx.sgst.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 px-4 text-right text-sm text-gray-400">
                      {tx.igst > 0 ? `₹${tx.igst.toFixed(2)}` : '-'}
                    </td>
                    <td className="py-4 px-4 text-center">
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
                    </td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-primary-700/30 font-semibold">
                  <td colSpan={3} className="py-4 px-4">
                    Total
                  </td>
                  <td className="py-4 px-4 text-right text-red-400">
                    ₹{totalDebit.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-green-400">
                    ₹{totalCredit.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right text-yellow-400">
                    ₹{totalCGST.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-yellow-400">
                    ₹{totalSGST.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-yellow-400">
                    ₹{totalIGST.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Double Entry Validation */}
        <Card className="mt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-accent-electric" />
              <div>
                <p className="font-semibold">Double Entry Validation</p>
                <p className="text-sm text-gray-400">
                  SUM(Debit) = SUM(Credit): {totalDebit === totalCredit ? '✓ Balanced' : '✗ Unbalanced'}
                </p>
              </div>
            </div>
            {totalDebit === totalCredit ? (
              <Badge variant="success">ACID Compliant</Badge>
            ) : (
              <Badge variant="danger">Error</Badge>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
