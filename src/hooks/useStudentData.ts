import { useCallback, useMemo } from 'react'
import { useInstructorDashboardStore } from '@/store/instructorDashboardStore'
import { Student, StudentFilters, SortOptions, BulkActionResult, StudentStatus } from '@/types/instructor'

export function useStudentData() {
  const {
    students,
    selectedStudents,
    filters,
    sortBy,
    view,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalStudents,
    
    // Actions
    fetchStudents,
    setSelectedStudents,
    applyFilters,
    setSortBy,
    setView,
    bulkUpdateStudents,
    updateStudentStatus,
    sendMessage,
    addStudentNote,
    clearError,
  } = useInstructorDashboardStore()

  // Student list operations
  const loadStudents = useCallback((page?: number) => {
    return fetchStudents(page)
  }, [fetchStudents])

  const reloadStudents = useCallback(() => {
    return fetchStudents(currentPage)
  }, [fetchStudents, currentPage])

  // Filtering and sorting
  const updateFilters = useCallback((newFilters: Partial<StudentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    applyFilters(updatedFilters)
  }, [filters, applyFilters])

  const clearFilters = useCallback(() => {
    applyFilters({})
  }, [applyFilters])

  const updateSort = useCallback((field: 'name' | 'progress' | 'accuracy' | 'lastActivity' | 'enrollmentDate', direction?: 'asc' | 'desc') => {
    const newDirection = direction || (sortBy.field === field && sortBy.direction === 'asc' ? 'desc' : 'asc')
    setSortBy({ field, direction: newDirection })
  }, [sortBy, setSortBy])

  // Student selection
  const selectStudent = useCallback((studentId: string) => {
    const newSelection = selectedStudents.includes(studentId)
      ? selectedStudents.filter(id => id !== studentId)
      : [...selectedStudents, studentId]
    setSelectedStudents(newSelection)
  }, [selectedStudents, setSelectedStudents])

  const selectAllStudents = useCallback(() => {
    const allIds = students.map(student => student.id)
    setSelectedStudents(selectedStudents.length === students.length ? [] : allIds)
  }, [students, selectedStudents, setSelectedStudents])

  const selectMultipleStudents = useCallback((studentIds: string[]) => {
    setSelectedStudents(studentIds)
  }, [setSelectedStudents])

  const clearSelection = useCallback(() => {
    setSelectedStudents([])
  }, [setSelectedStudents])

  // Bulk operations
  const performBulkAction = useCallback(async (action: string, payload?: any): Promise<BulkActionResult> => {
    if (selectedStudents.length === 0) {
      throw new Error('No students selected')
    }

    const updates = { action, ...payload }
    return bulkUpdateStudents(selectedStudents, updates)
  }, [selectedStudents, bulkUpdateStudents])

  const bulkUpdateStatus = useCallback(async (status: Student['status']): Promise<BulkActionResult> => {
    return performBulkAction('updateStatus', { status })
  }, [performBulkAction])

  const bulkSendMessage = useCallback(async (message: string, subject?: string): Promise<BulkActionResult> => {
    return performBulkAction('sendMessage', { message, subject })
  }, [performBulkAction])

  const bulkAddTag = useCallback(async (tag: string): Promise<BulkActionResult> => {
    return performBulkAction('addTag', { tag })
  }, [performBulkAction])

  const bulkRemoveTag = useCallback(async (tag: string): Promise<BulkActionResult> => {
    return performBulkAction('removeTag', { tag })
  }, [performBulkAction])

  // Individual student operations
  const updateStudent = useCallback(async (studentId: string, status: Student['status']) => {
    return updateStudentStatus(studentId, status)
  }, [updateStudentStatus])

  const messageStudent = useCallback(async (studentId: string, message: string) => {
    return sendMessage(studentId, message)
  }, [sendMessage])

  const addNoteToStudent = useCallback(async (studentId: string, note: string, type?: string) => {
    return addStudentNote(studentId, note, type)
  }, [addStudentNote])

  // Search functionality
  const searchStudents = useCallback((searchTerm: string) => {
    updateFilters({ searchTerm })
  }, [updateFilters])

  // Pagination
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadStudents(page)
    }
  }, [loadStudents, totalPages])

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadStudents(currentPage + 1)
    }
  }, [currentPage, totalPages, loadStudents])

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      loadStudents(currentPage - 1)
    }
  }, [currentPage, loadStudents])

  // Computed values
  const filteredStudentCount = useMemo(() => students.length, [students])
  
  const selectedStudentObjects = useMemo(() => {
    return students.filter(student => selectedStudents.includes(student.id))
  }, [students, selectedStudents])

  const hasFiltersApplied = useMemo(() => {
    return Object.values(filters).some(value => {
      if (Array.isArray(value)) return value.length > 0
      if (typeof value === 'object' && value !== null) return true
      return value !== undefined && value !== null && value !== ''
    })
  }, [filters])

  const isAllSelected = useMemo(() => {
    return students.length > 0 && selectedStudents.length === students.length
  }, [students, selectedStudents])

  const isPartiallySelected = useMemo(() => {
    return selectedStudents.length > 0 && selectedStudents.length < students.length
  }, [selectedStudents, students])

  // Status-based filtering helpers
  const getStudentsByStatus = useCallback((status: Student['status']) => {
    return students.filter(student => student.status === status)
  }, [students])

  const getActiveStudents = useCallback(() => {
    return getStudentsByStatus(StudentStatus.ACTIVE)
  }, [getStudentsByStatus])

  const getAtRiskStudents = useCallback(() => {
    return getStudentsByStatus(StudentStatus.AT_RISK)
  }, [getStudentsByStatus])

  const getInactiveStudents = useCallback(() => {
    return getStudentsByStatus(StudentStatus.INACTIVE)
  }, [getStudentsByStatus])

  return {
    // Data
    students,
    selectedStudents: selectedStudentObjects,
    filters,
    sortBy,
    view,
    
    // State
    isLoading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    totalStudents,
    filteredStudentCount,
    
    // Selection state
    isAllSelected,
    isPartiallySelected,
    hasFiltersApplied,
    
    // Data operations
    loadStudents,
    reloadStudents,
    searchStudents,
    clearError,
    
    // Filtering and sorting
    updateFilters,
    clearFilters,
    updateSort,
    setView,
    
    // Selection operations
    selectStudent,
    selectAllStudents,
    selectMultipleStudents,
    clearSelection,
    
    // Bulk operations
    performBulkAction,
    bulkUpdateStatus,
    bulkSendMessage,
    bulkAddTag,
    bulkRemoveTag,
    
    // Individual student operations
    updateStudent,
    messageStudent,
    addNoteToStudent,
    
    // Pagination
    goToPage,
    goToNextPage,
    goToPreviousPage,
    
    // Status-based helpers
    getStudentsByStatus,
    getActiveStudents,
    getAtRiskStudents,
    getInactiveStudents,
  }
}