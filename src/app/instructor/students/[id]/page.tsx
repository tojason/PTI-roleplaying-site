'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { StudentProfile } from '@/components/instructor/StudentProfile'
import { Student, StudentStatus } from '@/types/instructor'
import { toast } from 'react-hot-toast'

// Mock student data - in real app this would come from API
const mockStudent: Student = {
  id: '1',
  pid: 'STU001',
  name: 'Alex Johnson',
  firstName: 'Alex',
  lastName: 'Johnson',
  email: 'alex.johnson@department.gov',
  department: 'Metro Police',
  badgeNumber: '12345',
  avatar: '',
  status: StudentStatus.ACTIVE,
  enrollmentDate: new Date('2024-01-15'),
  lastActivity: new Date('2024-01-20'),
  progress: {
    overallCompletion: 75,
    moduleProgress: [
      {
        moduleId: '1',
        moduleName: '10-Codes',
        category: 'codes',
        completion: 90,
        accuracy: 88,
        timeSpent: 120,
        lastAccessed: new Date('2024-01-20'),
        isCompleted: false
      },
      {
        moduleId: '2',
        moduleName: 'Phonetic Alphabet',
        category: 'phonetic',
        completion: 85,
        accuracy: 92,
        timeSpent: 90,
        lastAccessed: new Date('2024-01-19'),
        isCompleted: false
      },
      {
        moduleId: '3',
        moduleName: 'Radio Protocol',
        category: 'radio-protocol',
        completion: 60,
        accuracy: 78,
        timeSpent: 75,
        lastAccessed: new Date('2024-01-18'),
        isCompleted: false
      }
    ],
    currentModule: '10-Codes',
    timeSpent: 285,
    totalLessonsCompleted: 45,
    totalLessonsAvailable: 60,
    certificationProgress: [],
    milestones: [],
    lastProgressUpdate: new Date('2024-01-20')
  },
  performance: {
    overallAccuracy: 86,
    recentAccuracy: 88,
    accuracyTrend: 5.2,
    streak: 12,
    longestStreak: 18,
    totalSessions: 24,
    averageSessionTime: 45,
    totalTimeSpent: 1080,
    practiceSessionsThisWeek: 5,
    practiceSessionsThisMonth: 18,
    moduleScores: [],
    categoryBreakdown: [],
    weakAreas: ['Emergency Codes', 'Radio Etiquette'],
    strongAreas: ['Basic 10-Codes', 'Phonetic Alphabet'],
    improvementRate: 12.5,
    consistencyScore: 78,
    engagementScore: 82,
    lastPerformanceUpdate: new Date('2024-01-20'),
    // Adding missing properties for TypeScript compatibility
    period: 'month' as const,
    data: [],
    moduleBreakdown: []
  },
  notes: [
    {
      id: '1',
      content: 'Student shows excellent progress in phonetic alphabet. Consider advancing to intermediate level.',
      type: 'performance',
      priority: 'medium',
      isPrivate: false,
      createdBy: 'inst-1',
      createdByName: 'Sarah Wilson',
      createdAt: new Date('2024-01-19'),
      updatedAt: new Date('2024-01-19')
    }
  ],
  goals: [
    {
      id: '1',
      title: 'Complete 10-Codes Module',
      description: 'Achieve 90% accuracy in all 10-codes categories',
      targetValue: 90,
      currentValue: 88,
      unit: 'accuracy',
      deadline: new Date('2024-02-15'),
      isCompleted: false,
      createdBy: 'inst-1',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Increase Practice Frequency',
      description: 'Complete at least 6 practice sessions per week',
      targetValue: 6,
      currentValue: 5,
      unit: 'sessions',
      isCompleted: false,
      createdBy: 'inst-1',
      createdAt: new Date('2024-01-10')
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
}

interface QuickActionModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'message' | 'assign' | 'note' | 'goal'
  student: Student
  onSubmit: (data: any) => Promise<void>
}

function QuickActionModal({ isOpen, onClose, action, student, onSubmit }: QuickActionModalProps) {
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await onSubmit(formData)
      onClose()
      setFormData({})
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderForm = () => {
    switch (action) {
      case 'message':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Message subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={formData.message || ''}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Your message to ${student.firstName}...`}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || 'normal'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
        )

      case 'assign':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assignment Type
              </label>
              <select
                value={formData.type || ''}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select type...</option>
                <option value="quiz">Quiz</option>
                <option value="practice">Practice Session</option>
                <option value="assessment">Assessment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Module/Category
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select category...</option>
                <option value="codes">10-Codes</option>
                <option value="phonetic">Phonetic Alphabet</option>
                <option value="radio-protocol">Radio Protocol</option>
                <option value="mixed">Mixed Practice</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date (Optional)
              </label>
              <input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <textarea
                value={formData.instructions || ''}
                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Assignment instructions..."
              />
            </div>
          </div>
        )

      case 'note':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Type
              </label>
              <select
                value={formData.type || 'general'}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="performance">Performance</option>
                <option value="behavior">Behavior</option>
                <option value="goal">Goal Related</option>
                <option value="intervention">Intervention</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority || 'low'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note Content
              </label>
              <textarea
                value={formData.content || ''}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your note about the student..."
                required
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPrivate"
                checked={formData.isPrivate || false}
                onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPrivate" className="ml-2 text-sm text-gray-700">
                Private note (only visible to instructors)
              </label>
            </div>
          </div>
        )

      case 'goal':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Goal Title
              </label>
              <input
                type="text"
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Goal title"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Goal description..."
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Value
                </label>
                <input
                  type="number"
                  value={formData.targetValue || ''}
                  onChange={(e) => setFormData({ ...formData, targetValue: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="90"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={formData.unit || 'accuracy'}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="accuracy">% Accuracy</option>
                  <option value="completion">% Completion</option>
                  <option value="sessions">Sessions</option>
                  <option value="time">Hours</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getModalTitle = () => {
    switch (action) {
      case 'message': return `Send Message to ${student.firstName}`
      case 'assign': return `Assign Practice to ${student.firstName}`
      case 'note': return `Add Note for ${student.firstName}`
      case 'goal': return `Set Goal for ${student.firstName}`
      default: return 'Quick Action'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getModalTitle()}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {renderForm()}

          <div className="flex space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Submit'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default function StudentProfilePage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.id as string

  const [student, setStudent] = useState<Student | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quickActionModal, setQuickActionModal] = useState<{
    isOpen: boolean
    action: 'message' | 'assign' | 'note' | 'goal' | null
  }>({ isOpen: false, action: null })

  // Load student data
  useEffect(() => {
    const loadStudent = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (studentId === '1') {
          setStudent(mockStudent)
        } else {
          setError('Student not found')
        }
      } catch (err) {
        setError('Failed to load student data')
      } finally {
        setIsLoading(false)
      }
    }

    if (studentId) {
      loadStudent()
    }
  }, [studentId])

  // Quick action handlers
  const handleQuickAction = (action: 'message' | 'assign' | 'note' | 'goal') => {
    setQuickActionModal({ isOpen: true, action })
  }

  const executeQuickAction = async (action: string, data: any) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      switch (action) {
        case 'message':
          toast.success('Message sent successfully')
          break
        case 'assign':
          toast.success('Assignment created successfully')
          break
        case 'note':
          toast.success('Note added successfully')
          // Add note to student data
          if (student) {
            const newNote = {
              id: Date.now().toString(),
              content: data.content,
              type: data.type,
              priority: data.priority,
              isPrivate: data.isPrivate || false,
              createdBy: 'current-instructor',
              createdByName: 'Current Instructor',
              createdAt: new Date(),
              updatedAt: new Date()
            }
            setStudent({
              ...student,
              notes: [newNote, ...(student.notes || [])]
            })
          }
          break
        case 'goal':
          toast.success('Goal set successfully')
          // Add goal to student data
          if (student) {
            const newGoal = {
              id: Date.now().toString(),
              title: data.title,
              description: data.description,
              targetValue: data.targetValue,
              currentValue: 0,
              unit: data.unit,
              deadline: data.deadline ? new Date(data.deadline) : undefined,
              isCompleted: false,
              createdBy: 'current-instructor',
              createdAt: new Date()
            }
            setStudent({
              ...student,
              goals: [...(student.goals || []), newGoal]
            })
          }
          break
      }
    } catch (error) {
      toast.error('Action failed. Please try again.')
      throw error
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading student profile...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The requested student profile could not be found.'}</p>
          <Link
            href="/instructor/students"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Back to Student List
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              href="/instructor/students"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Students</span>
            </Link>
          </div>

          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="relative">
                {student.avatar ? (
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-medium">
                      {student.firstName[0]}{student.lastName[0]}
                    </span>
                  </div>
                )}
                {/* Status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                  student.status === 'active' ? 'bg-green-400' :
                  student.status === 'at-risk' ? 'bg-yellow-400' :
                  student.status === 'inactive' ? 'bg-gray-400' :
                  'bg-blue-400'
                }`} />
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-600">
                  Badge #{student.badgeNumber} • {student.department}
                </p>
                <p className="text-sm text-gray-500">
                  Enrolled: {student.enrollmentDate.toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handleQuickAction('message')}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Message</span>
              </button>

              <button
                onClick={() => handleQuickAction('assign')}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Assign</span>
              </button>

              <button
                onClick={() => handleQuickAction('note')}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Add Note</span>
              </button>

              <button
                onClick={() => handleQuickAction('goal')}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>Set Goal</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Profile Component */}
        <StudentProfile
          student={student}
          onUpdateStudent={setStudent}
          onSendMessage={() => handleQuickAction('message')}
          onAssignPractice={() => handleQuickAction('assign')}
          onAddNote={() => handleQuickAction('note')}
          onSetGoal={() => handleQuickAction('goal')}
        />
      </div>

      {/* Quick Action Modal */}
      {quickActionModal.action && (
        <QuickActionModal
          isOpen={quickActionModal.isOpen}
          onClose={() => setQuickActionModal({ isOpen: false, action: null })}
          action={quickActionModal.action}
          student={student}
          onSubmit={(data) => executeQuickAction(quickActionModal.action!, data)}
        />
      )}
    </div>
  )
}