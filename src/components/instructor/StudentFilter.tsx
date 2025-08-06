'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StudentFilters, StudentStatus } from '@/types/instructor'

interface StudentFilterProps {
  filters: StudentFilters
  onFiltersChange: (filters: Partial<StudentFilters>) => void
  onClearFilters: () => void
}

interface FilterPreset {
  id: string
  name: string
  filters: StudentFilters
  isDefault?: boolean
}

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Students',
    filters: {},
    isDefault: true
  },
  {
    id: 'at-risk',
    name: 'At Risk Students',
    filters: {
      status: ['at-risk' as StudentStatus],
      riskLevel: ['medium', 'high', 'critical']
    }
  },
  {
    id: 'high-performers',
    name: 'High Performers',
    filters: {
      accuracyRange: { min: 85, max: 100 },
      progressRange: { min: 75, max: 100 }
    }
  },
  {
    id: 'need-attention',
    name: 'Need Attention',
    filters: {
      accuracyRange: { min: 0, max: 70 },
      lastActivityDays: 7
    }
  },
  {
    id: 'recently-enrolled',
    name: 'Recently Enrolled',
    filters: {
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        end: new Date()
      }
    }
  }
]

export function StudentFilter({ filters, onFiltersChange, onClearFilters }: StudentFilterProps) {
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([])
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    status: true,
    performance: true,
    activity: false,
    demographics: false,
    presets: true
  })

  // Load saved presets from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('instructor-filter-presets')
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to load filter presets:', error)
      }
    }
  }, [])

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleStatusChange = (status: StudentStatus, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    onFiltersChange({ status: newStatuses.length > 0 ? newStatuses : undefined })
  }

  const handleRiskLevelChange = (level: string, checked: boolean) => {
    const currentLevels = filters.riskLevel || []
    const newLevels = checked
      ? [...currentLevels, level as any]
      : currentLevels.filter(l => l !== level)
    
    onFiltersChange({ riskLevel: newLevels.length > 0 ? newLevels : undefined })
  }

  const handleRangeChange = (type: 'progressRange' | 'accuracyRange', field: 'min' | 'max', value: number) => {
    const currentRange = filters[type] || { min: 0, max: 100 }
    const newRange = { ...currentRange, [field]: value }
    onFiltersChange({ [type]: newRange })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    const currentRange = filters.dateRange || { start: new Date(), end: new Date() }
    const newRange = { ...currentRange, [field]: new Date(value) }
    onFiltersChange({ dateRange: newRange })
  }

  const applyPreset = (preset: FilterPreset) => {
    onFiltersChange(preset.filters)
  }

  const saveCurrentAsPreset = () => {
    const name = prompt('Enter a name for this filter preset:')
    if (!name) return

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name,
      filters: { ...filters }
    }

    const updatedPresets = [...savedPresets, newPreset]
    setSavedPresets(updatedPresets)
    localStorage.setItem('instructor-filter-presets', JSON.stringify(updatedPresets))
  }

  const deletePreset = (presetId: string) => {
    const updatedPresets = savedPresets.filter(p => p.id !== presetId)
    setSavedPresets(updatedPresets)
    localStorage.setItem('instructor-filter-presets', JSON.stringify(updatedPresets))
  }

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0
    if (typeof value === 'object' && value !== null) return true
    return value !== undefined && value !== null && value !== ''
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      <div className="max-h-[70vh] overflow-y-auto">
        {/* Filter Presets */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('presets')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Quick Filters</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.presets ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {expandedSections.presets && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {DEFAULT_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset)}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {preset.name}
                    </button>
                  ))}
                  
                  {savedPresets.length > 0 && (
                    <>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide px-3 py-1">
                          Saved Presets
                        </p>
                        {savedPresets.map((preset) => (
                          <div key={preset.id} className="flex items-center justify-between px-3 py-2">
                            <button
                              onClick={() => applyPreset(preset)}
                              className="flex-1 text-left text-sm hover:text-blue-600 transition-colors"
                            >
                              {preset.name}
                            </button>
                            <button
                              onClick={() => deletePreset(preset.id)}
                              className="text-red-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  
                  {hasActiveFilters && (
                    <button
                      onClick={saveCurrentAsPreset}
                      className="w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      + Save Current Filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Status Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('status')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Status</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.status ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {expandedSections.status && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-2">
                  {Object.values(StudentStatus).map((status) => (
                    <label key={status} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={filters.status?.includes(status) || false}
                        onChange={(e) => handleStatusChange(status, e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 capitalize">
                        {status === 'at-risk' ? 'At Risk' : status}
                      </span>
                    </label>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performance Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('performance')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Performance</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.performance ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {expandedSections.performance && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-4">
                  {/* Progress Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Progress Range (%)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.progressRange?.min || 0}
                        onChange={(e) => handleRangeChange('progressRange', 'min', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.progressRange?.max || 100}
                        onChange={(e) => handleRangeChange('progressRange', 'max', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Accuracy Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accuracy Range (%)
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.accuracyRange?.min || 0}
                        onChange={(e) => handleRangeChange('accuracyRange', 'min', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={filters.accuracyRange?.max || 100}
                        onChange={(e) => handleRangeChange('accuracyRange', 'max', parseInt(e.target.value))}
                        className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Risk Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Risk Level
                    </label>
                    <div className="space-y-2">
                      {['low', 'medium', 'high', 'critical'].map((level) => (
                        <label key={level} className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={filters.riskLevel?.includes(level as any) || false}
                            onChange={(e) => handleRiskLevelChange(level, e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className={`text-sm capitalize ${
                            level === 'critical' ? 'text-red-600' :
                            level === 'high' ? 'text-orange-600' :
                            level === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {level}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Activity Filter */}
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('activity')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Activity</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.activity ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {expandedSections.activity && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-4">
                  {/* Last Activity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Activity (days ago)
                    </label>
                    <select
                      value={filters.lastActivityDays || ''}
                      onChange={(e) => onFiltersChange({ 
                        lastActivityDays: e.target.value ? parseInt(e.target.value) : undefined 
                      })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Any time</option>
                      <option value="1">Within 1 day</option>
                      <option value="3">Within 3 days</option>
                      <option value="7">Within 1 week</option>
                      <option value="14">Within 2 weeks</option>
                      <option value="30">Within 1 month</option>
                    </select>
                  </div>

                  {/* Date Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Date Range
                    </label>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">From</label>
                        <input
                          type="date"
                          value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateRangeChange('start', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">To</label>
                        <input
                          type="date"
                          value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                          onChange={(e) => handleDateRangeChange('end', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Demographics Filter */}
        <div>
          <button
            onClick={() => toggleSection('demographics')}
            className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
          >
            <span className="font-medium text-gray-900">Demographics</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${
                expandedSections.demographics ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <AnimatePresence>
            {expandedSections.demographics && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 pb-3 space-y-4">
                  {/* Department Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <select
                      multiple
                      value={filters.departments || []}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        onFiltersChange({ departments: selected.length > 0 ? selected : undefined })
                      }}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      size={4}
                    >
                      <option value="Metro Police">Metro Police</option>
                      <option value="Highway Patrol">Highway Patrol</option>
                      <option value="Sheriff's Office">Sheriff's Office</option>
                      <option value="State Police">State Police</option>
                      <option value="Campus Security">Campus Security</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>

                  {/* Has Notes Filter */}
                  <div>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={filters.hasNotes || false}
                        onChange={(e) => onFiltersChange({ hasNotes: e.target.checked || undefined })}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Has instructor notes</span>
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}