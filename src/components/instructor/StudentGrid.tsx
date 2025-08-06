'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useStudentData } from '@/hooks/useStudentData'
import { StudentCard } from './StudentCard'
import { StudentStatus } from '@/types/instructor'

interface StudentGridProps {
  preview?: boolean
  limit?: number
  showFilters?: boolean
  showSearch?: boolean
  showPagination?: boolean
  title?: string
  subtitle?: string
}

export function StudentGrid({ 
  preview = false, 
  limit = 6,
  showFilters = !preview,
  showSearch = !preview,
  showPagination = !preview,
  title,
  subtitle
}: StudentGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<'all' | StudentStatus>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const {
    students,
    isLoading,
    error,
    loadStudents,
    reloadStudents,
    searchStudents,
    updateFilters,
    clearFilters,
    view,
    setView,
    currentPage,
    totalPages,
    totalStudents,
    goToPage,
    goToNextPage,
    goToPreviousPage
  } = useStudentData()

  useEffect(() => {
    if (students.length === 0 && !isLoading) {
      loadStudents()
    }
  }, [students.length, isLoading, loadStudents])

  // Search and filter handlers
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (!preview) {
      searchStudents(term)
    }
  }

  const handleFilterChange = (filter: 'all' | StudentStatus) => {
    setSelectedFilter(filter)
    if (!preview) {
      if (filter === 'all') {
        updateFilters({ status: undefined })
      } else {
        updateFilters({ status: [filter] })
      }
    }
  }

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    if (!preview) {
      setView(mode)
    }
  }

  const handleViewProfile = (studentId: string) => {
    // Navigation will be handled by the Link in StudentCard
  }

  const handleSendMessage = async (studentId: string) => {
    // This would open a message modal or navigate to messaging
    console.log('Send message to student:', studentId)
  }

  const handleAssignPractice = async (studentId: string) => {
    // This would open an assignment modal
    console.log('Assign practice to student:', studentId)
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center">
          <svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={reloadStudents}
            className="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Filter students for preview mode
  let displayStudents = students
  
  if (preview) {
    // Apply client-side filtering for preview
    if (selectedFilter !== 'all') {
      displayStudents = displayStudents.filter(student => student.status === selectedFilter)
    }
    if (searchTerm) {
      displayStudents = displayStudents.filter(student => 
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.badgeNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    displayStudents = displayStudents.slice(0, limit)
  }

  const activeStudentCount = students.filter(s => s.status === 'active').length
  const atRiskStudentCount = students.filter(s => s.status === 'at-risk').length
  const inactiveStudentCount = students.filter(s => s.status === 'inactive').length
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
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">
            {title || (preview ? 'Students Overview' : 'All Students')}
          </h3>
          <p className="text-sm text-slate-600">
            {subtitle || (preview 
              ? `${displayStudents.length} of ${students.length} students shown`
              : `${totalStudents || students.length} total students`
            )}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!preview && showFilters && (
            <div className="flex items-center space-x-2">
              {/* View mode toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    (preview ? viewMode : view) === 'grid'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 rounded-md transition-colors ${
                    (preview ? viewMode : view) === 'list'
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {preview && students.length > limit && (
            <Link
              href="/instructor/students"
              className="text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              View All Students →
            </Link>
          )}
        </div>
      </div>

      {/* Search and filters */}
      {(showSearch || showFilters) && (
        <div className="mb-6 space-y-4">
          {/* Search bar */}
          {showSearch && (
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search students by name, department, or badge number..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          )}
          
          {/* Filter buttons */}
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Students', count: students.length },
                { key: 'active' as StudentStatus, label: 'Active', count: activeStudentCount },
                { key: 'at-risk' as StudentStatus, label: 'At Risk', count: atRiskStudentCount },
                { key: 'inactive' as StudentStatus, label: 'Inactive', count: inactiveStudentCount }
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => handleFilterChange(key as 'all' | StudentStatus)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === key
                      ? 'bg-teal-100 text-teal-800 border border-teal-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(preview ? limit : 12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-2 bg-gray-200 rounded w-full" />
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                  <div className="h-8 bg-gray-200 rounded flex-1" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : displayStudents.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`${
            (preview ? viewMode : view) === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }`}
        >
          {displayStudents.map((student) => (
            <motion.div key={student.id} variants={itemVariants}>
              <StudentCard
                student={student}
                onViewProfile={handleViewProfile}
                onSendMessage={handleSendMessage}
                onAssignPractice={handleAssignPractice}
                showQuickActions={true}
                compact={(preview ? viewMode : view) === 'list'}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-3-5.197m-9 1a3 3 0 006 0M9 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
          <p className="text-gray-600 mb-6">
            {preview 
              ? "No students are currently active. Check back later or add new students to get started."
              : "You haven't added any students yet. Start by adding your first student to begin tracking their progress."
            }
          </p>
          <button className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition-colors">
            Add Student
          </button>
        </div>
      )}

      {/* Pagination */}
      {!preview && showPagination && totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalStudents)} of {totalStudents} students
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + Math.max(1, currentPage - 2)
                if (pageNum > totalPages) return null
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg ${
                      pageNum === currentPage
                        ? 'bg-teal-600 text-white'
                        : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
            </div>
            
            <button
              onClick={goToNextPage}
              disabled={currentPage >= totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {preview && displayStudents.length > 0 && students.length > limit && (
        <div className="mt-6 text-center">
          <Link
            href="/instructor/students"
            className="inline-flex items-center space-x-2 text-teal-600 hover:text-teal-700 font-medium transition-colors"
          >
            <span>View All {students.length} Students</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  )
}