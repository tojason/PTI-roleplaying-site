import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { InstructorUser, InstructorPreferences, LoginCredentials, AuthResponse, InstructorRole } from '@/types/instructor'

const defaultPreferences: InstructorPreferences = {
  // Display preferences
  dashboardLayout: 'grid',
  defaultView: 'overview',
  theme: 'light',
  compactMode: false,
  showAvatars: true,
  animationsEnabled: true,
  
  // Data preferences
  studentsPerPage: 20,
  defaultTimeRange: '30d',
  autoRefresh: true,
  refreshInterval: 30,
  
  // Notification preferences
  notifications: {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    frequency: 'immediate',
    types: {
      studentProgress: true,
      riskAlerts: true,
      assignments: true,
      systemUpdates: true,
      achievements: true
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '07:00'
    }
  },
  
  // Alert thresholds
  alertThresholds: {
    atRiskAccuracy: 65,
    inactivityDays: 7,
    criticalFailureRate: 40,
    lowEngagementThreshold: 50
  },
  
  // Chart preferences
  chartPreferences: {
    defaultChartType: 'line',
    showTrendLines: true,
    showComparisons: false,
    colorScheme: 'default'
  },
  
  // Advanced preferences
  advancedFeatures: {
    enablePredictiveAnalytics: false,
    enableRealTimeUpdates: true,
    enableBulkActions: true,
    enableAdvancedFilters: true
  },
  
  // Privacy preferences
  privacy: {
    shareAnonymizedData: false,
    allowUsageAnalytics: true,
    dataSharingLevel: 'department'
  }
}

interface InstructorStore {
  // Authentication state
  user: InstructorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  refreshToken: string | null;
  sessionExpiry: Date | null;
  preferences: InstructorPreferences;
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (updates: Partial<InstructorUser>) => Promise<void>;
  updatePreferences: (updates: Partial<InstructorPreferences>) => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  clearError: () => void;
}

export const useInstructorStore = create<InstructorStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      token: null,
      refreshToken: null,
      sessionExpiry: null,
      preferences: defaultPreferences,

      // Actions
      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          // For development - simulate API call but don't set auth state
          // Let NextAuth handle the actual authentication state
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Validate credentials (mock validation)
          if (!credentials.email || !credentials.password || !credentials.departmentCode) {
            throw new Error('All fields are required')
          }
          
          // Mock successful login response - but don't set authentication state here
          // This will be handled by NextAuth session after signIn
          set({ isLoading: false, error: null })
          
          // Return nothing - actual auth state will be managed by NextAuth
          return
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          })
          throw error
        }
      },

      logout: async () => {
        set({ isLoading: true })
        
        try {
          await fetch('/api/instructor/auth/logout', {
            method: 'POST',
          })
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            token: null,
            refreshToken: null,
            sessionExpiry: null
          })
        }
      },

      updateProfile: async (updates: Partial<InstructorUser>) => {
        const { user } = get()
        if (!user) return

        set({ isLoading: true, error: null })

        try {
          const response = await fetch('/api/instructor/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Profile update failed')
          }

          set({
            user: { ...user, ...data.user },
            isLoading: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed'
          })
          throw error
        }
      },

      updatePreferences: async (updates: Partial<InstructorPreferences>) => {
        const { preferences } = get()
        const newPreferences = { ...preferences, ...updates }

        set({ preferences: newPreferences })

        try {
          await fetch('/api/instructor/preferences', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(updates),
          })
        } catch (error) {
          console.error('Failed to save preferences:', error)
          // Revert on failure
          set({ preferences })
        }
      },

      checkAuth: async () => {
        // Remove local auth checking - this will be handled by NextAuth
        // Just reset loading state and let NextAuth manage authentication
        set({ isLoading: false })
      },

      refreshAuthToken: async () => {
        const { refreshToken } = get()
        if (!refreshToken) return

        try {
          const response = await fetch('/api/instructor/auth/refresh', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          })

          if (!response.ok) {
            throw new Error('Token refresh failed')
          }

          const data: AuthResponse = await response.json()
          const expiryDate = new Date(Date.now() + data.expiresIn * 1000)

          set({
            token: data.token,
            refreshToken: data.refreshToken,
            sessionExpiry: expiryDate
          })
        } catch (error) {
          // If refresh fails, logout user
          get().logout()
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'instructor-auth',
      partialize: (state) => ({
        // Only persist user preferences, not auth state
        // Auth state will be managed by NextAuth
        preferences: state.preferences,
      }),
    }
  )
)