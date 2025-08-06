'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Student, InstructorNote, StudentGoal } from '@/types/instructor'

interface StudentProfileProps {
  student: Student
  onUpdateStudent: (student: Student) => void
  onSendMessage: () => void
  onAssignPractice: () => void
  onAddNote: () => void
  onSetGoal: () => void
}

interface TabProps {
  id: string
  label: string
  badge?: number
  isActive: boolean
  onClick: () => void
}

function Tab({ id, label, badge, isActive, onClick }: TabProps) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors relative ${
        isActive
          ? 'bg-blue-100 text-blue-700 border border-blue-200'
          : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {label}
      {badge !== undefined && badge > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}

interface ProgressChartProps {
  moduleProgress: Student['progress']['moduleProgress']
}

function ProgressChart({ moduleProgress }: ProgressChartProps) {
  const maxCompletion = Math.max(...moduleProgress.map(m => m.completion))
  
  return (
    <div className="space-y-4">
      {moduleProgress.map((module, index) => (
        <motion.div
          key={module.moduleId}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-gray-50 rounded-lg p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <h4 className="font-semibold text-gray-900">{module.moduleName}</h4>
              <p className="text-sm text-gray-600 capitalize">{module.category.replace('-', ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900">{module.completion}%</p>
              <p className="text-sm text-gray-600">{module.accuracy}% accuracy</p>
            </div>
          </div>
          
          <div className="relative">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  module.completion >= 90 ? 'bg-green-500' :
                  module.completion >= 70 ? 'bg-blue-500' :
                  module.completion >= 50 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                initial={{ width: 0 }}
                animate={{ width: `${module.completion}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
            <span>{Math.round(module.timeSpent / 60)} hours spent</span>
            <span>
              Last accessed: {module.lastAccessed ? new Date(module.lastAccessed).toLocaleDateString() : 'Never'}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface PerformanceMetricsProps {
  performance: Student['performance']
}

function PerformanceMetrics({ performance }: PerformanceMetricsProps) {
  const metrics = [
    {
      label: 'Overall Accuracy',
      value: performance.overallAccuracy,
      unit: '%',
      color: performance.overallAccuracy >= 85 ? 'green' : performance.overallAccuracy >= 70 ? 'blue' : 'red',
      trend: performance.accuracyTrend
    },
    {
      label: 'Current Streak',
      value: performance.streak,
      unit: ' days',
      color: 'blue',
      description: `Best: ${performance.longestStreak} days`
    },
    {
      label: 'Total Sessions',
      value: performance.totalSessions,
      unit: '',
      color: 'purple',
      description: `Avg: ${performance.averageSessionTime}min each`
    },
    {
      label: 'Weekly Sessions',
      value: performance.practiceSessionsThisWeek,
      unit: '',
      color: 'green',
      description: `Monthly: ${performance.practiceSessionsThisMonth}`
    },
    {
      label: 'Improvement Rate',
      value: performance.improvementRate,
      unit: '%',
      color: performance.improvementRate > 10 ? 'green' : performance.improvementRate > 0 ? 'blue' : 'red',
      description: 'Over last 30 days'
    },
    {
      label: 'Consistency Score',
      value: performance.consistencyScore,
      unit: '%',
      color: performance.consistencyScore >= 80 ? 'green' : performance.consistencyScore >= 60 ? 'blue' : 'yellow',
      description: 'Practice regularity'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-600">{metric.label}</h4>
            {metric.trend !== undefined && (
              <div className={`flex items-center text-sm ${
                metric.trend > 0 ? 'text-green-600' : metric.trend < 0 ? 'text-red-600' : 'text-gray-600'
              }`}>
                <svg className={`w-4 h-4 mr-1 ${metric.trend === 0 ? 'hidden' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                    metric.trend > 0 ? "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" : "M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                  } />
                </svg>
                {Math.abs(metric.trend).toFixed(1)}%
              </div>
            )}
          </div>
          
          <div className="mb-2">
            <span className={`text-3xl font-bold ${
              metric.color === 'green' ? 'text-green-600' :
              metric.color === 'blue' ? 'text-blue-600' :
              metric.color === 'purple' ? 'text-purple-600' :
              metric.color === 'yellow' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {metric.value}
            </span>
            <span className="text-lg text-gray-600">{metric.unit}</span>
          </div>
          
          {metric.description && (
            <p className="text-sm text-gray-500">{metric.description}</p>
          )}
        </motion.div>
      ))}
    </div>
  )
}

interface SessionHistoryProps {
  student: Student
}

function SessionHistory({ student }: SessionHistoryProps) {
  // Mock session data - in real app this would come from API
  const sessions = [
    {
      id: '1',
      date: new Date('2024-01-20'),
      module: '10-Codes',
      duration: 45,
      score: 92,
      questionsCorrect: 23,
      questionsTotal: 25,
      type: 'practice'
    },
    {
      id: '2',
      date: new Date('2024-01-19'),
      module: 'Phonetic Alphabet',
      duration: 30,
      score: 88,
      questionsCorrect: 22,
      questionsTotal: 25,
      type: 'quiz'
    },
    {
      id: '3',
      date: new Date('2024-01-18'),
      module: 'Radio Protocol',
      duration: 38,
      score: 76,
      questionsCorrect: 19,
      questionsTotal: 25,
      type: 'practice'
    },
    {
      id: '4',
      date: new Date('2024-01-17'),
      module: '10-Codes',
      duration: 52,
      score: 84,
      questionsCorrect: 21,
      questionsTotal: 25,
      type: 'assessment'
    }
  ]

  return (
    <div className="space-y-4">
      {sessions.map((session, index) => (
        <motion.div
          key={session.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                session.score >= 90 ? 'bg-green-400' :
                session.score >= 80 ? 'bg-blue-400' :
                session.score >= 70 ? 'bg-yellow-400' :
                'bg-red-400'
              }`} />
              <div>
                <h4 className="font-semibold text-gray-900">{session.module}</h4>
                <p className="text-sm text-gray-600">
                  {session.date.toLocaleDateString()} • {session.duration} minutes
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-lg font-bold ${
                session.score >= 90 ? 'text-green-600' :
                session.score >= 80 ? 'text-blue-600' :
                session.score >= 70 ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {session.score}%
              </div>
              <div className="text-sm text-gray-600">
                {session.questionsCorrect}/{session.questionsTotal}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
              session.type === 'assessment' ? 'bg-purple-100 text-purple-700' :
              session.type === 'quiz' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {session.type.charAt(0).toUpperCase() + session.type.slice(1)}
            </div>
            
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${
                  session.score >= 90 ? 'bg-green-500' :
                  session.score >= 80 ? 'bg-blue-500' :
                  session.score >= 70 ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${session.score}%` }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

interface NotesAndGoalsProps {
  notes: InstructorNote[]
  goals: StudentGoal[]
  onAddNote: () => void
  onSetGoal: () => void
}

function NotesAndGoals({ notes, goals, onAddNote, onSetGoal }: NotesAndGoalsProps) {
  const [activeTab, setActiveTab] = useState<'notes' | 'goals'>('notes')

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2">
        <Tab
          id="notes"
          label="Notes"
          badge={notes?.length}
          isActive={activeTab === 'notes'}
          onClick={() => setActiveTab('notes')}
        />
        <Tab
          id="goals"
          label="Goals"
          badge={goals?.length}
          isActive={activeTab === 'goals'}
          onClick={() => setActiveTab('goals')}
        />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Instructor Notes</h3>
              <button
                onClick={onAddNote}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
              >
                Add Note
              </button>
            </div>

            {notes && notes.length > 0 ? (
              <div className="space-y-3">
                {notes.map((note, index) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.type === 'performance' ? 'bg-blue-100 text-blue-700' :
                          note.type === 'behavior' ? 'bg-yellow-100 text-yellow-700' :
                          note.type === 'goal' ? 'bg-green-100 text-green-700' :
                          note.type === 'intervention' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                        </div>
                        
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          note.priority === 'high' ? 'bg-red-100 text-red-700' :
                          note.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {note.priority} priority
                        </div>
                        
                        {note.isPrivate && (
                          <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                            Private
                          </div>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {note.createdAt.toLocaleDateString()}
                      </div>
                    </div>
                    
                    <p className="text-gray-800 mb-2">{note.content}</p>
                    
                    <div className="text-sm text-gray-600">
                      — {note.createdByName}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">📝</div>
                <p className="text-gray-600">No notes yet. Add your first note about this student.</p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Student Goals</h3>
              <button
                onClick={onSetGoal}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
              >
                Set Goal
              </button>
            </div>

            {goals && goals.length > 0 ? (
              <div className="space-y-3">
                {goals.map((goal, index) => (
                  <motion.div
                    key={goal.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{goal.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                      </div>
                      
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        goal.isCompleted ? 'bg-green-100 text-green-700' :
                        goal.deadline && new Date(goal.deadline) < new Date() ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {goal.isCompleted ? 'Completed' :
                         goal.deadline && new Date(goal.deadline) < new Date() ? 'Overdue' :
                         'In Progress'}
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-600">Progress</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {goal.currentValue} / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            goal.isCompleted ? 'bg-green-500' :
                            (goal.currentValue / goal.targetValue) * 100 >= 80 ? 'bg-blue-500' :
                            (goal.currentValue / goal.targetValue) * 100 >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Created: {goal.createdAt.toLocaleDateString()}</span>
                      {goal.deadline && (
                        <span>
                          Due: {new Date(goal.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-2">🎯</div>
                <p className="text-gray-600">No goals set yet. Create goals to track student progress.</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function StudentProfile({
  student,
  onUpdateStudent,
  onSendMessage,
  onAssignPractice,
  onAddNote,
  onSetGoal
}: StudentProfileProps) {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'progress', label: 'Progress' },
    { id: 'performance', label: 'Performance' },
    { id: 'history', label: 'Session History' },
    { id: 'notes', label: 'Notes & Goals', badge: (student.notes?.length || 0) + (student.goals?.length || 0) }
  ]

  const statusColor = {
    active: 'text-green-600 bg-green-100',
    'at-risk': 'text-yellow-600 bg-yellow-100',
    inactive: 'text-gray-600 bg-gray-100',
    completed: 'text-blue-600 bg-blue-100',
    suspended: 'text-red-600 bg-red-100'
  }[student.status]

  return (
    <div className="space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-2xl font-bold text-gray-900">{student.progress.overallCompletion}%</p>
            </div>
            <div className="text-blue-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold text-gray-900">{student.performance.overallAccuracy}%</p>
            </div>
            <div className="text-green-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Streak</p>
              <p className="text-2xl font-bold text-gray-900">{student.performance.streak}</p>
            </div>
            <div className="text-orange-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-lg p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                {student.status === 'at-risk' ? 'At Risk' : student.status.charAt(0).toUpperCase() + student.status.slice(1)}
              </div>
            </div>
            <div className="text-purple-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            badge={tab.badge}
            isActive={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
          />
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="text-sm text-gray-900">{student.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Department</dt>
                    <dd className="text-sm text-gray-900">{student.department}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Badge Number</dt>
                    <dd className="text-sm text-gray-900">#{student.badgeNumber}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Enrollment Date</dt>
                    <dd className="text-sm text-gray-900">{student.enrollmentDate.toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-600">Last Activity</dt>
                    <dd className="text-sm text-gray-900">
                      {student.lastActivity ? student.lastActivity.toLocaleDateString() : 'Never'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Focus</h3>
                {student.progress.currentModule ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Module</p>
                      <p className="text-lg font-semibold text-gray-900">{student.progress.currentModule}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Weak Areas</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.performance.weakAreas.map((area) => (
                          <span key={area} className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-600">Strong Areas</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {student.performance.strongAreas.map((area) => (
                          <span key={area} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-600">No current module assigned</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'progress' && (
          <motion.div
            key="progress"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Module Progress</h3>
              <ProgressChart moduleProgress={student.progress.moduleProgress} />
            </div>
          </motion.div>
        )}

        {activeTab === 'performance' && (
          <motion.div
            key="performance"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
              <PerformanceMetrics performance={student.performance} />
            </div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Practice Session History</h3>
              <SessionHistory student={student} />
            </div>
          </motion.div>
        )}

        {activeTab === 'notes' && (
          <motion.div
            key="notes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <NotesAndGoals
                notes={student.notes || []}
                goals={student.goals || []}
                onAddNote={onAddNote}
                onSetGoal={onSetGoal}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}