'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePerformanceMetrics } from '@/hooks/usePerformanceMetrics'
import { TimeRange } from '@/types/instructor'

type ChartPeriod = '24h' | '7d' | '30d' | '90d' | '1y'
type ChartType = 'line' | 'bar' | 'pie' | 'area'
type MetricType = 'completion' | 'accuracy' | 'engagement'

interface PerformanceChartProps {
  title?: string
  height?: number
  showExport?: boolean
  showPeriodSelector?: boolean
  defaultChartType?: ChartType
  defaultMetric?: MetricType
  className?: string
}

export function PerformanceChart({
  title = 'Performance Analytics',
  height = 320,
  showExport = true,
  showPeriodSelector = true,
  defaultChartType = 'line',
  defaultMetric = 'completion',
  className = ''
}: PerformanceChartProps = {}) {
  const [selectedPeriod, setSelectedPeriod] = useState<ChartPeriod>('30d')
  const [selectedChartType, setSelectedChartType] = useState<ChartType>(defaultChartType)
  const [selectedMetric, setSelectedMetric] = useState<MetricType>(defaultMetric)
  
  const { 
    metrics, 
    chartData,
    timeRange,
    isLoading, 
    error, 
    hasData,
    setPresetTimeRange,
    loadChartData,
    exportMetrics,
    performanceSummary
  } = usePerformanceMetrics()

  const handlePeriodChange = async (period: ChartPeriod) => {
    setSelectedPeriod(period)
    setPresetTimeRange(period)
  }

  const handleChartTypeChange = (type: ChartType) => {
    setSelectedChartType(type)
  }

  const handleMetricChange = (metric: MetricType) => {
    setSelectedMetric(metric)
  }

  const handleRefresh = () => {
    // Force a data refresh by reloading with current parameters
    // Convert ChartPeriod to TimeRange or use the existing timeRange
    loadChartData(selectedMetric, timeRange)
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'excel' = 'csv') => {
    try {
      await exportMetrics(format)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  // Load chart data when parameters change
  useEffect(() => {
    if (timeRange) {
      loadChartData(`${selectedMetric}-${selectedChartType}`, timeRange)
    }
  }, [selectedMetric, selectedChartType, timeRange, loadChartData])

  // Prepare chart data based on selected metric
  const processedChartData = useMemo(() => {
    if (!metrics?.data) return []
    
    return metrics.data.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      }),
      value: selectedMetric === 'completion' 
        ? item.completions 
        : selectedMetric === 'accuracy' 
        ? item.accuracy 
        : item.activeUsers,
      label: selectedMetric === 'completion' 
        ? 'Completions'
        : selectedMetric === 'accuracy'
        ? 'Accuracy (%)'
        : 'Active Students'
    }))
  }, [metrics, selectedMetric])

  const getCurrentTrend = () => {
    if (!performanceSummary) return 0
    return performanceSummary.trend === 'improving' ? 5.2 : 
           performanceSummary.trend === 'declining' ? -3.1 : 0
  }

  const getChartTitle = () => {
    const metricName = selectedMetric === 'completion' ? 'Training Completions' :
                      selectedMetric === 'accuracy' ? 'Average Accuracy' :
                      'Active Students'
    return `${title} - ${metricName}`
  }

  const trend = getCurrentTrend()
  const maxValue = Math.max(...processedChartData.map(d => d.value), 1)

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Chart Error</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-800">{getChartTitle()}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-slate-600">
                  {timeRange?.label || 'Loading...'}
                </span>
                {trend !== 0 && (
                  <div className={`flex items-center space-x-1 ${
                    trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {trend > 0 && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    {trend < 0 && (
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <span className="text-sm font-medium">{Math.abs(trend).toFixed(1)}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Metric selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'completion', label: 'Completions' },
              { key: 'accuracy', label: 'Accuracy' },
              { key: 'engagement', label: 'Active' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => handleMetricChange(key as MetricType)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedMetric === key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          
          {/* Chart type selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'line', label: 'Line', icon: '📈' },
              { key: 'bar', label: 'Bar', icon: '📊' },
              { key: 'area', label: 'Area', icon: '🏔️' }
            ].map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => handleChartTypeChange(key as ChartType)}
                className={`px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedChartType === key
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
                title={`${label} chart`}
              >
                {icon}
              </button>
            ))}
          </div>
          
          {/* Period selector */}
          {showPeriodSelector && (
            <select
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value as ChartPeriod)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          )}
          
          {/* Export button */}
          {showExport && (
            <div className="relative group">
              <button
                onClick={() => handleExport('csv')}
                className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                title="Export data"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              
              {/* Export dropdown */}
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-t-lg"
                >
                  CSV
                </button>
                <button
                  onClick={() => handleExport('excel')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  Excel
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 rounded-b-lg"
                >
                  PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chart area */}
      <div className="relative" style={{ height: `${height}px` }}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-600 rounded-full animate-spin" />
              <p className="text-sm text-slate-600">Loading chart data...</p>
            </div>
          </div>
        ) : processedChartData.length > 0 ? (
          <div className="h-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-slate-500 pr-3">
              <span>{maxValue}</span>
              <span>{Math.round(maxValue * 0.75)}</span>
              <span>{Math.round(maxValue * 0.5)}</span>
              <span>{Math.round(maxValue * 0.25)}</span>
              <span>0</span>
            </div>
            
            {/* Chart visualization */}
            <div className="ml-8 h-full flex items-end justify-between space-x-1 sm:space-x-2">
              {selectedChartType === 'bar' ? (
                // Bar Chart
                processedChartData.map((item, index) => (
                  <motion.div
                    key={index}
                    className="flex flex-col items-center flex-1 group"
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                  >
                    <div className="w-full flex flex-col justify-end h-full mb-2">
                      <motion.div
                        className="w-full bg-gradient-to-t from-teal-500 to-teal-400 rounded-t-sm hover:from-teal-600 hover:to-teal-500 transition-colors group-hover:shadow-lg"
                        initial={{ height: 0 }}
                        animate={{ height: `${(item.value / maxValue) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.8, ease: 'easeOut' }}
                        style={{ minHeight: item.value > 0 ? '4px' : '0px' }}
                      />
                    </div>
                    
                    <span className="text-xs text-slate-500 transform -rotate-45 origin-top-left mt-1 whitespace-nowrap">
                      {item.date}
                    </span>
                    
                    <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                      <div className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                        {item.date}: {item.value}{selectedMetric === 'accuracy' && '%'}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : selectedChartType === 'line' ? (
                // Line Chart
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(20, 184, 166)" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="rgb(20, 184, 166)" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area fill - temporarily disabled for build */}
                  {/* {selectedChartType === 'area' && (
                    <motion.path
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                      d={`M 0,${100 - (processedChartData[0]?.value || 0) / maxValue * 100} ${
                        processedChartData.map((item, index) => 
                          `L ${(index / (processedChartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                        ).join(' ')
                      } L 100,100 L 0,100 Z`}
                      fill="url(#lineGradient)"
                    />
                  )} */}
                  
                  {/* Line */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    d={`M 0,${100 - (processedChartData[0]?.value || 0) / maxValue * 100} ${
                      processedChartData.map((item, index) => 
                        `L ${(index / (processedChartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                      ).join(' ')
                    }`}
                    fill="none"
                    stroke="rgb(20, 184, 166)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  {processedChartData.map((item, index) => (
                    <motion.circle
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 1, duration: 0.3 }}
                      cx={(index / (processedChartData.length - 1)) * 100}
                      cy={100 - (item.value / maxValue) * 100}
                      r="2"
                      fill="rgb(20, 184, 166)"
                      className="cursor-pointer hover:r-3 transition-all"
                    />
                  ))}
                </svg>
              ) : (
                // Area Chart
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>
                  
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    d={`M 0,100 L 0,${100 - (processedChartData[0]?.value || 0) / maxValue * 100} ${
                      processedChartData.map((item, index) => 
                        `L ${(index / (processedChartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                      ).join(' ')
                    } L 100,100 Z`}
                    fill="url(#areaGradient)"
                  />
                  
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                    d={`M 0,${100 - (processedChartData[0]?.value || 0) / maxValue * 100} ${
                      processedChartData.map((item, index) => 
                        `L ${(index / (processedChartData.length - 1)) * 100},${100 - (item.value / maxValue) * 100}`
                      ).join(' ')
                    }`}
                    fill="none"
                    stroke="rgb(59, 130, 246)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              
              {/* X-axis labels for line/area charts */}
              {(selectedChartType === 'line' || selectedChartType === 'area') && (
                <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-slate-500">
                  {processedChartData.map((item, index) => (
                    <span key={index} className="transform -rotate-45 origin-top-left">
                      {item.date}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-500 font-medium">No data available</p>
              <p className="text-gray-400 text-sm mt-1">Chart will update when data becomes available</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer with data summary */}
      {hasData && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {performanceSummary && (
                <>Total: {performanceSummary.totalSessions.toLocaleString()} sessions</>
              )}
            </span>
            <span>
              {processedChartData.length} data points
            </span>
          </div>
        </div>
      )}
    </div>
  )
}