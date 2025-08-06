'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export interface StatCardProps {
  title: string
  value: string | number
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    period: string
  }
  icon?: ReactNode
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
  onClick?: () => void
  className?: string
}

const variantStyles = {
  primary: {
    iconBg: 'bg-gradient-to-r from-blue-500 to-blue-600',
    accent: 'text-blue-600'
  },
  success: {
    iconBg: 'bg-gradient-to-r from-green-500 to-green-600',
    accent: 'text-green-600'
  },
  warning: {
    iconBg: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
    accent: 'text-yellow-600'
  },
  danger: {
    iconBg: 'bg-gradient-to-r from-red-500 to-red-600',
    accent: 'text-red-600'
  },
  info: {
    iconBg: 'bg-gradient-to-r from-cyan-500 to-cyan-600',
    accent: 'text-cyan-600'
  }
}

const trendColors = {
  up: 'text-green-600',
  down: 'text-red-600',
  neutral: 'text-gray-600'
}

const TrendIcon = ({ direction }: { direction: 'up' | 'down' | 'neutral' }) => {
  if (direction === 'up') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
      </svg>
    )
  }
  
  if (direction === 'down') {
    return (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    )
  }
  
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
    </svg>
  )
}

const LoadingSkeleton = () => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-lg" />
      <div className="w-16 h-6 bg-gray-200 rounded" />
    </div>
    <div className="space-y-3">
      <div className="w-20 h-8 bg-gray-200 rounded" />
      <div className="w-32 h-4 bg-gray-200 rounded" />
      <div className="w-24 h-3 bg-gray-200 rounded" />
    </div>
  </div>
)

export function StatCard({
  title,
  value,
  trend,
  icon,
  variant = 'primary',
  loading = false,
  onClick,
  className = ''
}: StatCardProps) {
  if (loading) {
    return <LoadingSkeleton />
  }

  const styles = variantStyles[variant]
  const isClickable = !!onClick

  const cardContent = (
    <>
      {/* Header with icon and trend */}
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={`w-12 h-12 ${styles.iconBg} rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
            {icon}
          </div>
        )}
        
        {trend && (
          <div className={`flex items-center space-x-1 ${trendColors[trend.direction]} ml-auto`}>
            <TrendIcon direction={trend.direction} />
            <span className="text-sm font-semibold">
              {Math.abs(trend.value).toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="space-y-1">
        {/* Primary value */}
        <div className="flex items-baseline space-x-2">
          <motion.span
            key={value}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={`text-3xl font-bold ${styles.accent}`}
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </motion.span>
        </div>

        {/* Title */}
        <h3 className="text-sm font-medium text-gray-600 leading-tight">
          {title}
        </h3>

        {/* Trend comparison text */}
        {trend && (
          <p className="text-xs text-gray-500">
            vs {trend.period}
          </p>
        )}
      </div>
    </>
  )

  const baseClasses = `
    bg-white rounded-xl p-6 shadow-sm border border-gray-200 
    transition-all duration-300 ease-out relative overflow-hidden
    ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-1' : ''}
    ${className}
  `.trim()

  if (isClickable) {
    return (
      <motion.button
        onClick={onClick}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        className={baseClasses}
      >
        {cardContent}
        
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-blue-50 opacity-0 hover:opacity-30 transition-opacity duration-300" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={baseClasses}
    >
      {cardContent}
    </motion.div>
  )
}