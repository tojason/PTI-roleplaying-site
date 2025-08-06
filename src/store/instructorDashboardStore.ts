import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { 
  DashboardStats, 
  Student, 
  Activity, 
  Alert, 
  StudentFilters, 
  SortOptions,
  BulkAction,
  BulkActionResult,
  Assignment
} from '@/types/instructor'

const defaultFilters: StudentFilters = {
  status: undefined,
  progressRange: undefined,
  accuracyRange: undefined,
  cohorts: undefined,
  departments: undefined,
  supervisors: undefined,
  dateRange: undefined,
  searchTerm: undefined,
  tags: undefined,
  riskLevel: undefined,
  hasNotes: undefined,
  lastActivityDays: undefined
}

const defaultSortOptions: SortOptions = {
  field: 'name',
  direction: 'asc'
}

interface DashboardStore {
  // Data state
  stats: DashboardStats | null;
  students: Student[];
  selectedStudents: string[];
  filters: StudentFilters;
  sortBy: SortOptions;
  view: 'grid' | 'list';
  isLoading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  totalStudents: number;
  
  // Recent data
  recentActivity: Activity[];
  alerts: Alert[];
  assignments: Assignment[];
  
  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchStudents: (page?: number) => Promise<void>;
  setSelectedStudents: (ids: string[]) => void;
  applyFilters: (filters: StudentFilters) => void;
  setSortBy: (sort: SortOptions) => void;
  setView: (view: 'grid' | 'list') => void;
  bulkUpdateStudents: (ids: string[], updates: any) => Promise<BulkActionResult>;
  refreshData: () => Promise<void>;
  clearError: () => void;
  
  // Student management
  updateStudentStatus: (studentId: string, status: Student['status']) => Promise<void>;
  sendMessage: (studentId: string, message: string) => Promise<void>;
  addStudentNote: (studentId: string, note: string, type?: string) => Promise<void>;
  
  // Alert management
  markAlertAsRead: (alertId: string) => void;
  dismissAlert: (alertId: string) => void;
}

export const useInstructorDashboardStore = create<DashboardStore>()(
  devtools(
    (set, get) => ({
      // State
      stats: null,
      students: [],
      selectedStudents: [],
      filters: defaultFilters,
      sortBy: defaultSortOptions,
      view: 'grid',
      isLoading: false,
      error: null,
      
      // Pagination
      currentPage: 1,
      totalPages: 1,
      totalStudents: 0,
      
      // Recent data
      recentActivity: [],
      alerts: [],
      assignments: [],

      // Actions
      fetchDashboardData: async () => {
        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/instructor/dashboard')
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to load dashboard data')
          }

          set({
            stats: data.stats,
            recentActivity: data.recentActivity || [],
            alerts: data.alerts || [],
            assignments: data.assignments || [],
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load dashboard data'
          })
        }
      },

      fetchStudents: async (page = 1) => {
        set({ isLoading: true, error: null })

        try {
          const { filters, sortBy } = get()
          const params = new URLSearchParams({
            page: page.toString(),
            limit: '20',
            sort: `${sortBy.field}:${sortBy.direction}`
          })

          // Add filters to params
          if (filters.searchTerm) params.append('search', filters.searchTerm)
          if (filters.status?.length) params.append('status', filters.status.join(','))
          if (filters.cohorts?.length) params.append('cohorts', filters.cohorts.join(','))
          if (filters.departments?.length) params.append('departments', filters.departments.join(','))
          if (filters.supervisors?.length) params.append('supervisors', filters.supervisors.join(','))
          if (filters.tags?.length) params.append('tags', filters.tags.join(','))
          if (filters.riskLevel?.length) params.append('riskLevel', filters.riskLevel.join(','))
          if (filters.hasNotes !== undefined) params.append('hasNotes', filters.hasNotes.toString())
          if (filters.lastActivityDays) params.append('lastActivityDays', filters.lastActivityDays.toString())

          if (filters.progressRange) {
            params.append('progressMin', filters.progressRange.min.toString())
            params.append('progressMax', filters.progressRange.max.toString())
          }

          if (filters.accuracyRange) {
            params.append('accuracyMin', filters.accuracyRange.min.toString())
            params.append('accuracyMax', filters.accuracyRange.max.toString())
          }

          if (filters.dateRange) {
            params.append('startDate', filters.dateRange.start.toISOString())
            params.append('endDate', filters.dateRange.end.toISOString())
          }

          const response = await fetch(`/api/instructor/students?${params}`)
          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Failed to load students')
          }

          set({
            students: data.students || [],
            currentPage: data.meta?.currentPage || page,
            totalPages: data.meta?.totalPages || 1,
            totalStudents: data.meta?.totalCount || 0,
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to load students'
          })
        }
      },

      refreshData: async () => {
        const { fetchDashboardData, fetchStudents, currentPage } = get()
        await Promise.all([
          fetchDashboardData(),
          fetchStudents(currentPage)
        ])
      },

      updateStudentStatus: async (studentId: string, status: Student['status']) => {
        try {
          const response = await fetch(`/api/instructor/students/${studentId}/status`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to update student status')
          }

          // Update local state
          set({
            students: get().students.map(student =>
              student.id === studentId ? { ...student, status } : student
            )
          })
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to update student status'
          })
          throw error
        }
      },

      sendMessage: async (studentId: string, message: string) => {
        try {
          const response = await fetch('/api/instructor/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              recipientIds: [studentId], 
              subject: 'Message from Instructor',
              content: message,
              priority: 'normal'
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to send message')
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to send message'
          })
          throw error
        }
      },

      addStudentNote: async (studentId: string, note: string, type = 'general') => {
        try {
          const response = await fetch(`/api/instructor/students/${studentId}/notes`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              content: note,
              type,
              priority: 'medium',
              isPrivate: false
            }),
          })

          if (!response.ok) {
            const data = await response.json()
            throw new Error(data.message || 'Failed to add note')
          }

          // Refresh the student data to show the new note
          get().fetchStudents(get().currentPage)
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to add note'
          })
          throw error
        }
      },

      bulkUpdateStudents: async (ids: string[], updates: any): Promise<BulkActionResult> => {
        try {
          const response = await fetch('/api/instructor/students/bulk', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ studentIds: ids, updates }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Bulk update failed')
          }

          // Refresh students after bulk update
          get().fetchStudents(get().currentPage)
          
          return data.result
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Bulk update failed'
          })
          throw error
        }
      },

      markAlertAsRead: (alertId: string) => {
        set({
          alerts: get().alerts.map(alert =>
            alert.id === alertId ? { ...alert, isRead: true } : alert
          )
        })

        // Update on server
        fetch(`/api/instructor/alerts/${alertId}/read`, {
          method: 'PATCH',
        }).catch(error => {
          console.error('Failed to mark alert as read:', error)
        })
      },

      dismissAlert: (alertId: string) => {
        set({
          alerts: get().alerts.filter(alert => alert.id !== alertId)
        })

        // Update on server
        fetch(`/api/instructor/alerts/${alertId}`, {
          method: 'DELETE',
        }).catch(error => {
          console.error('Failed to dismiss alert:', error)
        })
      },

      setSelectedStudents: (studentIds: string[]) => {
        set({ selectedStudents: studentIds })
      },

      applyFilters: (filters: StudentFilters) => {
        set({ filters, currentPage: 1 })
        get().fetchStudents(1)
      },

      setSortBy: (sortBy: SortOptions) => {
        set({ sortBy })
        get().fetchStudents(get().currentPage)
      },

      setView: (view: 'grid' | 'list') => {
        set({ view })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'instructor-dashboard'
    }
  )
)