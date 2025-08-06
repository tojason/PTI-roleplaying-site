import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useCallback, useMemo } from 'react'
import { PerformanceMetrics, ChartData, TimeRange, ComparisonPeriod } from '@/types/instructor'

// Analytics Store
interface AnalyticsStore {
  // Data state
  metrics: PerformanceMetrics | null;
  chartData: ChartData[];
  timeRange: TimeRange;
  compareMode: boolean;
  comparisonPeriod: ComparisonPeriod | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  
  // Cached data
  cachedMetrics: Map<string, { data: PerformanceMetrics; timestamp: Date }>;
  cachedCharts: Map<string, { data: ChartData[]; timestamp: Date }>;
  
  // Actions
  fetchMetrics: (timeRange: TimeRange) => Promise<void>;
  fetchChartData: (chartType: string, timeRange: TimeRange) => Promise<void>;
  updateTimeRange: (range: TimeRange) => void;
  toggleCompareMode: () => void;
  setComparisonPeriod: (period: ComparisonPeriod) => void;
  exportData: (format: 'csv' | 'pdf' | 'excel') => Promise<string>;
  clearError: () => void;
  refreshData: () => Promise<void>;
  invalidateCache: () => void;
}

const defaultTimeRange: TimeRange = {
  start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
  end: new Date(),
  preset: '30d',
  label: 'Last 30 Days'
}

const useAnalyticsStore = create<AnalyticsStore>()(
  persist(
    (set, get) => ({
      // State
      metrics: null,
      chartData: [],
      timeRange: defaultTimeRange,
      compareMode: false,
      comparisonPeriod: null,
      isLoading: false,
      error: null,
      lastUpdated: null,
      
      // Cache
      cachedMetrics: new Map(),
      cachedCharts: new Map(),

      // Actions
      fetchMetrics: async (timeRange: TimeRange) => {
        const cacheKey = `${timeRange.start.toISOString()}-${timeRange.end.toISOString()}`
        const cached = get().cachedMetrics.get(cacheKey)
        
        // Check cache (5 minutes)
        if (cached && Date.now() - cached.timestamp.getTime() < 5 * 60 * 1000) {
          set({ metrics: cached.data, lastUpdated: cached.timestamp })
          return
        }

        set({ isLoading: true, error: null })

        try {
          const params = new URLSearchParams({
            start: timeRange.start.toISOString(),
            end: timeRange.end.toISOString(),
            preset: timeRange.preset || 'custom'
          })

          const response = await fetch(`/api/instructor/analytics/metrics?${params}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch metrics')
          }

          const metrics: PerformanceMetrics = data.metrics
          const timestamp = new Date()

          // Update cache
          const { cachedMetrics } = get()
          cachedMetrics.set(cacheKey, { data: metrics, timestamp })

          set({
            metrics,
            isLoading: false,
            lastUpdated: timestamp,
            cachedMetrics
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch metrics'
          })
        }
      },

      fetchChartData: async (chartType: string, timeRange: TimeRange) => {
        const cacheKey = `${chartType}-${timeRange.start.toISOString()}-${timeRange.end.toISOString()}`
        const cached = get().cachedCharts.get(cacheKey)
        
        // Check cache (1 minute for charts)
        if (cached && Date.now() - cached.timestamp.getTime() < 1 * 60 * 1000) {
          const existingCharts = get().chartData.filter(chart => chart.id !== chartType)
          set({ chartData: [...existingCharts, ...cached.data] })
          return
        }

        try {
          const params = new URLSearchParams({
            type: chartType,
            start: timeRange.start.toISOString(),
            end: timeRange.end.toISOString(),
            preset: timeRange.preset || 'custom'
          })

          const response = await fetch(`/api/instructor/analytics/charts?${params}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch chart data')
          }

          const chartData: ChartData[] = Array.isArray(data.charts) ? data.charts : [data.chart]
          const timestamp = new Date()

          // Update cache
          const { cachedCharts } = get()
          cachedCharts.set(cacheKey, { data: chartData, timestamp })

          // Update chart data
          const existingCharts = get().chartData.filter(chart => 
            !chartData.some(newChart => newChart.id === chart.id)
          )

          set({
            chartData: [...existingCharts, ...chartData],
            cachedCharts
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to fetch chart data'
          })
        }
      },

      updateTimeRange: (range: TimeRange) => {
        set({ timeRange: range })
        const { fetchMetrics } = get()
        fetchMetrics(range)
      },

      toggleCompareMode: () => {
        const { compareMode, timeRange } = get()
        const newCompareMode = !compareMode
        
        let comparisonPeriod: ComparisonPeriod | null = null
        
        if (newCompareMode) {
          // Calculate previous period
          const duration = timeRange.end.getTime() - timeRange.start.getTime()
          const previousStart = new Date(timeRange.start.getTime() - duration)
          const previousEnd = new Date(timeRange.end.getTime() - duration)
          
          comparisonPeriod = {
            current: timeRange,
            previous: {
              start: previousStart,
              end: previousEnd,
              preset: 'custom',
              label: 'Previous Period'
            },
            label: 'vs Previous Period'
          }
        }
        
        set({ compareMode: newCompareMode, comparisonPeriod })
      },

      setComparisonPeriod: (period: ComparisonPeriod) => {
        set({ comparisonPeriod: period, compareMode: true })
      },

      exportData: async (format: 'csv' | 'pdf' | 'excel'): Promise<string> => {
        const { metrics, timeRange } = get()
        
        if (!metrics) {
          throw new Error('No data to export')
        }

        try {
          const response = await fetch('/api/instructor/analytics/export', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              format,
              timeRange,
              data: metrics
            }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Export failed')
          }

          return data.downloadUrl
        } catch (error) {
          throw error instanceof Error ? error : new Error('Export failed')
        }
      },

      refreshData: async () => {
        const { timeRange, fetchMetrics } = get()
        await fetchMetrics(timeRange)
      },

      invalidateCache: () => {
        set({ 
          cachedMetrics: new Map(), 
          cachedCharts: new Map() 
        })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'instructor-analytics',
      partialize: (state) => ({
        timeRange: state.timeRange,
        compareMode: state.compareMode,
        comparisonPeriod: state.comparisonPeriod,
      }),
    }
  )
)

// Hook for performance metrics
export function usePerformanceMetrics() {
  const {
    metrics,
    chartData,
    timeRange,
    compareMode,
    comparisonPeriod,
    isLoading,
    error,
    lastUpdated,
    
    fetchMetrics,
    fetchChartData,
    updateTimeRange,
    toggleCompareMode,
    setComparisonPeriod,
    exportData,
    refreshData,
    invalidateCache,
    clearError,
  } = useAnalyticsStore()

  // Time range management
  const setTimeRange = useCallback((range: TimeRange) => {
    updateTimeRange(range)
  }, [updateTimeRange])

  const setPresetTimeRange = useCallback((preset: TimeRange['preset']) => {
    let start: Date, end: Date, label: string

    const now = new Date()
    end = now

    switch (preset) {
      case '24h':
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        label = 'Last 24 Hours'
        break
      case '7d':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        label = 'Last 7 Days'
        break
      case '30d':
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        label = 'Last 30 Days'
        break
      case '90d':
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        label = 'Last 90 Days'
        break
      case '1y':
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        label = 'Last Year'
        break
      default:
        return
    }

    const range: TimeRange = { start, end, preset, label }
    updateTimeRange(range)
  }, [updateTimeRange])

  const setCustomTimeRange = useCallback((start: Date, end: Date) => {
    const range: TimeRange = {
      start,
      end,
      preset: 'custom',
      label: 'Custom Range'
    }
    updateTimeRange(range)
  }, [updateTimeRange])

  // Chart data management
  const loadChartData = useCallback((chartType: string, customTimeRange?: TimeRange) => {
    const range = customTimeRange || timeRange
    return fetchChartData(chartType, range)
  }, [fetchChartData, timeRange])

  const getChartData = useCallback((chartId: string) => {
    return chartData.find(chart => chart.id === chartId)
  }, [chartData])

  const getChartsByType = useCallback((type: ChartData['type']) => {
    return chartData.filter(chart => chart.type === type)
  }, [chartData])

  // Export functionality
  const exportMetrics = useCallback(async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const downloadUrl = await exportData(format)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = `performance-metrics-${timeRange.start.toISOString().split('T')[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      return downloadUrl
    } catch (error) {
      throw error
    }
  }, [exportData, timeRange])

  // Comparison functionality
  const enableComparison = useCallback((previousPeriod?: TimeRange) => {
    if (previousPeriod) {
      const period: ComparisonPeriod = {
        current: timeRange,
        previous: previousPeriod,
        label: 'vs Custom Period'
      }
      setComparisonPeriod(period)
    } else {
      toggleCompareMode()
    }
  }, [timeRange, setComparisonPeriod, toggleCompareMode])

  const disableComparison = useCallback(() => {
    if (compareMode) {
      toggleCompareMode()
    }
  }, [compareMode, toggleCompareMode])

  // Data refresh
  const refresh = useCallback(async () => {
    invalidateCache()
    await refreshData()
  }, [invalidateCache, refreshData])

  // Computed values
  const hasData = useMemo(() => !!metrics, [metrics])
  
  const isDataStale = useMemo(() => {
    if (!lastUpdated) return true
    return Date.now() - lastUpdated.getTime() > 5 * 60 * 1000 // 5 minutes
  }, [lastUpdated])

  const chartCount = useMemo(() => chartData.length, [chartData])

  // Performance summary
  const performanceSummary = useMemo(() => {
    if (!metrics) return null

    const summary = {
      totalSessions: metrics.data?.reduce((sum, day) => sum + day.completions, 0) || 0,
      averageAccuracy: metrics.data?.reduce((sum, day) => sum + day.accuracy, 0) / (metrics.data?.length || 1) || 0,
      activeUsers: metrics.data?.[metrics.data.length - 1]?.activeUsers || 0,
      trend: 'stable' as 'improving' | 'declining' | 'stable'
    }

    // Calculate trend
    if (metrics.data && metrics.data.length > 1) {
      const recent = metrics.data.slice(-7).reduce((sum, day) => sum + day.accuracy, 0) / 7
      const previous = metrics.data.slice(-14, -7).reduce((sum, day) => sum + day.accuracy, 0) / 7
      
      if (recent > previous + 2) summary.trend = 'improving'
      else if (recent < previous - 2) summary.trend = 'declining'
    }

    return summary
  }, [metrics])

  return {
    // Data
    metrics,
    chartData,
    timeRange,
    compareMode,
    comparisonPeriod,
    performanceSummary,
    
    // State
    isLoading,
    error,
    lastUpdated,
    hasData,
    isDataStale,
    chartCount,
    
    // Data operations
    fetchMetrics,
    loadChartData,
    refresh,
    clearError,
    
    // Time range management
    setTimeRange,
    setPresetTimeRange,
    setCustomTimeRange,
    
    // Chart operations
    getChartData,
    getChartsByType,
    
    // Comparison
    enableComparison,
    disableComparison,
    
    // Export
    exportMetrics,
  }
}