'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Calculator, AlertCircle, CheckCircle2 } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Modal from '@/components/ui/Modal'

const sourcePrograms = [
  { id: 1, name: 'HDFC Rewards', balance: 45000, rate: 0.30 },
  { id: 2, name: 'SBI Rewards', balance: 32000, rate: 0.28 },
  { id: 3, name: 'InterMiles', balance: 18000, rate: 0.30 },
]

const destinationVouchers = [
  { id: 1, name: 'Amazon Voucher', category: 'E-commerce', minAmount: 500 },
  { id: 2, name: 'Flipkart Voucher', category: 'E-commerce', minAmount: 500 },
  { id: 3, name: 'Swiggy Voucher', category: 'Food', minAmount: 300 },
  { id: 4, name: 'Zomato Voucher', category: 'Food', minAmount: 300 },
]

export default function ExchangeFlowPage() {
  const [source, setSource] = useState<number | null>(null)
  const [destination, setDestination] = useState<number | null>(null)
  const [points, setPoints] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  const selectedSource = sourcePrograms.find((p) => p.id === source)
  const selectedDest = destinationVouchers.find((v) => v.id === destination)

  const calculateExchange = () => {
    if (!selectedSource || !selectedDest || !points) return null

    const pointsNum = parseInt(points)
    if (isNaN(pointsNum) || pointsNum <= 0) return null

    const baseValue = pointsNum * selectedSource.rate
    const serviceFee = baseValue * 0.02 // 2% service fee
    const gst = serviceFee * 0.18 // 18% GST on service fee
    const finalAmount = baseValue - serviceFee

    return {
      points: pointsNum,
      baseValue,
      serviceFee,
      gst,
      finalAmount,
      rate: selectedSource.rate,
    }
  }

  const exchange = calculateExchange()

  const handleConfirm = () => {
    // Simulate transaction
    setShowConfirm(false)
    // Reset form
    setSource(null)
    setDestination(null)
    setPoints('')
  }

  return (
    <div className="min-h-screen bg-navy-gradient p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Exchange Loyalty Points</h1>
          <p className="text-gray-400">
            Convert your loyalty points to vouchers with AI-powered rates
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exchange Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Source Selection */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Select Source Program</h2>
              <div className="grid grid-cols-1 gap-3">
                {sourcePrograms.map((program) => (
                  <motion.button
                    key={program.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSource(program.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      source === program.id
                        ? 'border-accent-electric bg-accent-electric/10'
                        : 'border-primary-700/30 glass hover:border-primary-600'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{program.name}</p>
                        <p className="text-sm text-gray-400">
                          {program.balance.toLocaleString()} points available
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="info">Rate: {program.rate}</Badge>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Destination Selection */}
            <Card>
              <h2 className="text-xl font-semibold mb-4">Select Destination Voucher</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {destinationVouchers.map((voucher) => (
                  <motion.button
                    key={voucher.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setDestination(voucher.id)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      destination === voucher.id
                        ? 'border-accent-electric bg-accent-electric/10'
                        : 'border-primary-700/30 glass hover:border-primary-600'
                    }`}
                  >
                    <p className="font-semibold">{voucher.name}</p>
                    <p className="text-xs text-gray-400">{voucher.category}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Min: ₹{voucher.minAmount}
                    </p>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Points Input */}
            {source && (
              <Card>
                <h2 className="text-xl font-semibold mb-4">Enter Points</h2>
                <Input
                  type="number"
                  placeholder="Enter points to exchange"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  max={selectedSource?.balance}
                />
                {selectedSource && (
                  <p className="text-sm text-gray-400 mt-2">
                    Available: {selectedSource.balance.toLocaleString()} points
                  </p>
                )}
              </Card>
            )}
          </div>

          {/* Exchange Calculator */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <div className="flex items-center space-x-2 mb-4">
                <Calculator className="w-5 h-5 text-accent-electric" />
                <h2 className="text-xl font-semibold">Exchange Calculator</h2>
              </div>

              {exchange ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="glass rounded-lg p-4 border border-primary-700/30">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Points</span>
                      <span className="font-semibold">{exchange.points.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Base Value</span>
                      <span className="font-semibold">₹{exchange.baseValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Service Fee (2%)</span>
                      <span className="text-yellow-400">-₹{exchange.serviceFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">GST (18%)</span>
                      <span className="text-yellow-400">-₹{exchange.gst.toFixed(2)}</span>
                    </div>
                    <div className="border-t border-primary-700/30 pt-2 mt-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Final Amount</span>
                        <span className="text-2xl font-bold gradient-text">
                          ₹{exchange.finalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-primary-800/50 rounded-lg p-3 border border-primary-700/30">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5" />
                      <div className="text-xs text-gray-400">
                        <p className="font-semibold text-yellow-400 mb-1">GST Breakdown:</p>
                        <p>CGST (9%): ₹{(exchange.gst / 2).toFixed(2)}</p>
                        <p>SGST (9%): ₹{(exchange.gst / 2).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setShowConfirm(true)}
                  >
                    Confirm Exchange
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Select source and destination to calculate</p>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Confirmation Modal */}
        <Modal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          title="Confirm Exchange"
          size="md"
        >
          {exchange && selectedSource && selectedDest && (
            <div className="space-y-4">
              <div className="glass rounded-lg p-4 border border-primary-700/30">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-400">From</p>
                    <p className="font-semibold">{selectedSource.name}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-accent-electric" />
                  <div className="text-right">
                    <p className="text-sm text-gray-400">To</p>
                    <p className="font-semibold">{selectedDest.name}</p>
                  </div>
                </div>
                <div className="border-t border-primary-700/30 pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Points</span>
                    <span className="font-semibold">{exchange.points.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">You will receive</span>
                    <span className="text-xl font-bold gradient-text">
                      ₹{exchange.finalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirm}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Confirm
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
