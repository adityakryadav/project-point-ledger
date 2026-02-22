'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showValue?: boolean
  className?: string
  color?: 'electric' | 'teal' | 'green' | 'red'
}

export default function ProgressBar({
  value,
  max,
  label,
  showValue = true,
  className,
  color = 'electric',
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)
  
  const colors = {
    electric: 'bg-gradient-to-r from-accent-electric to-accent-neon',
    teal: 'bg-teal-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
  }

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-300">{label}</span>
          {showValue && (
            <span className="text-sm font-semibold text-accent-electric">
              {value.toLocaleString()} / {max.toLocaleString()}
            </span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-primary-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={cn('h-full rounded-full', colors[color])}
        />
      </div>
    </div>
  )
}
