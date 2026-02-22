'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Shield, Zap, TrendingUp, Lock, Brain, BarChart3 } from 'lucide-react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Link from 'next/link'

export default function LandingPage() {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Pricing',
      description: 'Deep Q-Network reinforcement learning optimizes exchange rates in real-time',
    },
    {
      icon: Shield,
      title: 'Fraud Detection',
      description: 'XGBoost model with velocity checks and device fingerprinting',
    },
    {
      icon: Lock,
      title: 'GST Compliance',
      description: 'Automated CGST/SGST/IGST calculation and FIU-IND reporting',
    },
    {
      icon: Zap,
      title: 'Real-Time Exchange',
      description: 'Sub-2-second transaction processing with ACID guarantees',
    },
    {
      icon: TrendingUp,
      title: 'Multi-Program Aggregation',
      description: 'Connect HDFC, SBI, InterMiles and more in one wallet',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into transactions, fraud, and compliance',
    },
  ]

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-6xl md:text-7xl font-bold mb-6"
          >
            Convert Loyalty Into
            <br />
            <span className="gradient-text">Liquid Value</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-8"
          >
            RBI-regulated AI-driven fintech platform for aggregating, exchanging, and liquidating loyalty points across banks, airlines, and merchants.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center space-x-4"
          >
            <Link href="/register">
              <Button size="lg">Start Exchanging</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg">View Dashboard</Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="glass-strong rounded-3xl p-8 mb-20 shadow-glow"
        >
          <div className="bg-primary-900/50 rounded-xl p-6 border border-primary-700/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm text-gray-400">Dashboard Preview</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-primary-800/50 rounded-lg p-4 h-32"></div>
              <div className="bg-primary-800/50 rounded-lg p-4 h-32"></div>
              <div className="bg-primary-800/50 rounded-lg p-4 h-32"></div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Platform Features</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Built for scale, security, and compliance
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hover glow>
                <div className="flex items-start space-x-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-accent-electric/20 to-accent-neon/20">
                    <feature.icon className="w-6 h-6 text-accent-electric" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-strong rounded-3xl p-12 text-center"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of users exchanging loyalty points with AI-powered rates and fraud protection.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register">
              <Button size="lg">
                Create Account
                <ArrowRight className="ml-2 w-5 h-5 inline" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-primary-700/30 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold gradient-text">ILPEP</span>
              <p className="text-sm text-gray-400 mt-2">
                Indian Loyalty Points Exchange Platform
              </p>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 ILPEP. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
