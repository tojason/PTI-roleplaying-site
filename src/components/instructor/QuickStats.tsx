'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DashboardStats } from '@/types/instructor'
import { StatCard } from './StatCard'

interface QuickStatsProps {
  stats: DashboardStats | null
  isLoading: boolean
  onStatClick?: (statType: string) => void
}


export function QuickStats({ stats, isLoading, onStatClick }: QuickStatsProps) {
  const router = useRouter()

  const handleStatClick = (statType: string) => {
    if (onStatClick) {
      onStatClick(statType)
    } else {
      // Default navigation behavior
      switch (statType) {
        case 'total-students':
        case 'active-students':
        case 'at-risk-students':
          router.push('/instructor/students')
          break
        case 'completion-rate':
        case 'average-accuracy':
          router.push('/instructor/analytics')
          break
        default:
          break
      }
    }
  }
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6"
    >
      <motion.div variants={itemVariants}>
        <StatCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          trend={stats?.trends ? {
            value: stats.trends.enrollmentTrend,
            direction: stats.trends.enrollmentTrend > 0 ? 'up' : stats.trends.enrollmentTrend < 0 ? 'down' : 'neutral',
            period: 'last month'
          } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-3-5.197m-9 1a3 3 0 006 0M9 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
          variant="primary"
          loading={isLoading}
          onClick={() => handleStatClick('total-students')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          title="Active Students"
          value={stats?.activeStudents || 0}
          trend={stats?.trends ? {
            value: stats.trends.engagementTrend,
            direction: stats.trends.engagementTrend > 0 ? 'up' : stats.trends.engagementTrend < 0 ? 'down' : 'neutral',
            period: 'last month'
          } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
          variant="success"
          loading={isLoading}
          onClick={() => handleStatClick('active-students')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          title="Completion Rate"
          value={stats ? `${stats.completionRate}%` : '0%'}
          trend={stats?.trends ? {
            value: stats.trends.completionTrend,
            direction: stats.trends.completionTrend > 0 ? 'up' : stats.trends.completionTrend < 0 ? 'down' : 'neutral',
            period: 'last month'
          } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="info"
          loading={isLoading}
          onClick={() => handleStatClick('completion-rate')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          title="Average Accuracy"
          value={stats ? `${stats.averageAccuracy}%` : '0%'}
          trend={stats?.trends ? {
            value: stats.trends.accuracyTrend,
            direction: stats.trends.accuracyTrend > 0 ? 'up' : stats.trends.accuracyTrend < 0 ? 'down' : 'neutral',
            period: 'last month'
          } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          variant="primary"
          loading={isLoading}
          onClick={() => handleStatClick('average-accuracy')}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <StatCard
          title="At Risk Students"
          value={stats?.atRiskStudents || 0}
          trend={stats?.atRiskStudents && stats.trends ? {
            value: Math.abs(stats.trends.retentionTrend),
            direction: stats.trends.retentionTrend > 0 ? 'down' : stats.trends.retentionTrend < 0 ? 'up' : 'neutral',
            period: 'last month'
          } : undefined}
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
          variant={stats && stats.atRiskStudents > 0 ? "warning" : "success"}
          loading={isLoading}
          onClick={() => handleStatClick('at-risk-students')}
        />
      </motion.div>
    </motion.div>
  )
}