'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Smartphone, CreditCard, FileText, Video } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

type AuthStep = 'otp' | 'pan' | 'aadhaar' | 'vkyc'

export default function AuthPage() {
  const [step, setStep] = useState<AuthStep>('otp')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [pan, setPan] = useState('')
  const [kycStatus, setKycStatus] = useState<'none' | 'small-ppi' | 'full-kyc'>('none')

  const handleOTPSubmit = () => {
    // Simulate OTP verification
    setKycStatus('small-ppi')
    setStep('pan')
  }

  const handlePANSubmit = () => {
    // Simulate PAN verification
    setStep('aadhaar')
  }

  const handleAadhaarSubmit = () => {
    // Simulate Aadhaar verification
    setStep('vkyc')
  }

  const handleVKYCComplete = () => {
    setKycStatus('full-kyc')
  }

  return (
    <div className="min-h-screen bg-navy-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <Link href="/" className="inline-flex items-center text-accent-electric mb-6 hover:underline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <Card className="p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Authentication & KYC</h1>
            <p className="text-gray-400">Complete your verification to unlock full wallet limits</p>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-between mb-8">
            {[
              { key: 'otp', label: 'OTP', icon: Smartphone },
              { key: 'pan', label: 'PAN', icon: CreditCard },
              { key: 'aadhaar', label: 'Aadhaar', icon: FileText },
              { key: 'vkyc', label: 'V-KYC', icon: Video },
            ].map((s, index) => {
              const stepIndex = ['otp', 'pan', 'aadhaar', 'vkyc'].indexOf(step)
              const isActive = index <= stepIndex
              const StepIcon = s.icon

              return (
                <div key={s.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                        isActive
                          ? 'bg-accent-electric border-accent-electric text-primary-900'
                          : 'border-primary-600 text-gray-500'
                      }`}
                    >
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <span className={`text-xs mt-2 ${isActive ? 'text-accent-electric' : 'text-gray-500'}`}>
                      {s.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 ${
                        index < stepIndex ? 'bg-accent-electric' : 'bg-primary-700'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          {/* OTP Step */}
          {step === 'otp' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button onClick={handleOTPSubmit} className="w-full">
                Send OTP
              </Button>
              {otp && (
                <>
                  <Input
                    label="Enter OTP"
                    type="text"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <Button onClick={handleOTPSubmit} className="w-full">
                    Verify OTP
                  </Button>
                </>
              )}
            </motion.div>
          )}

          {/* PAN Step */}
          {step === 'pan' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-primary-800/50 rounded-lg p-4 border border-primary-700/30">
                <p className="text-sm text-gray-300 mb-2">
                  Current Status: <Badge variant="warning">Small PPI (₹10K limit)</Badge>
                </p>
                <p className="text-xs text-gray-400">
                  Complete PAN verification to increase your limit
                </p>
              </div>
              <Input
                label="PAN Number"
                type="text"
                placeholder="ABCDE1234F"
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                maxLength={10}
              />
              <Button onClick={handlePANSubmit} className="w-full">
                Verify PAN
              </Button>
            </motion.div>
          )}

          {/* Aadhaar Step */}
          {step === 'aadhaar' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-primary-800/50 rounded-lg p-4 border border-primary-700/30">
                <p className="text-sm text-gray-300 mb-4">
                  Upload Aadhaar XML file for e-KYC
                </p>
                <div className="border-2 border-dashed border-primary-600 rounded-lg p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400 mb-2">
                    Drag and drop XML file or click to browse
                  </p>
                  <Button variant="outline" size="sm">
                    Select File
                  </Button>
                </div>
              </div>
              <Button onClick={handleAadhaarSubmit} className="w-full">
                Process Aadhaar
              </Button>
            </motion.div>
          )}

          {/* V-KYC Step */}
          {step === 'vkyc' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="bg-primary-800/50 rounded-lg p-4 border border-primary-700/30">
                <p className="text-sm text-gray-300 mb-4">
                  Complete Video KYC for full wallet access
                </p>
                <div className="border-2 border-dashed border-primary-600 rounded-lg p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-gray-500" />
                  <p className="text-sm text-gray-400 mb-4">
                    Video KYC session will verify your identity and location
                  </p>
                  <Button variant="outline" size="sm">
                    Start V-KYC Session
                  </Button>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <p className="text-sm text-green-400">
                  ✓ Geo-validation enabled
                </p>
              </div>
              <Button onClick={handleVKYCComplete} className="w-full">
                Complete Verification
              </Button>
            </motion.div>
          )}

          {/* KYC Status Display */}
          {kycStatus === 'full-kyc' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-400 font-semibold">Full KYC Verified</p>
                  <p className="text-sm text-gray-400">Wallet limit: ₹2,00,000</p>
                </div>
                <Badge variant="success">Active</Badge>
              </div>
            </motion.div>
          )}
        </Card>
      </div>
    </div>
  )
}
