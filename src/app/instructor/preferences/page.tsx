'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  Cog6ToothIcon,
  BellIcon,
  EyeIcon,
  ClockIcon,
  ComputerDesktopIcon,
  SunIcon,
  MoonIcon,
  DevicePhoneMobileIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

interface PreferencesFormData {
  // Notification Preferences
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  studentProgressAlerts: boolean;
  systemUpdates: boolean;
  weeklyReports: boolean;
  
  // Display Preferences
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  compactView: boolean;
  showAvatars: boolean;
  
  // Dashboard Preferences
  defaultDashboardTab: 'overview' | 'students' | 'analytics';
  studentsPerPage: number;
  autoRefresh: boolean;
  refreshInterval: number;
  
  // Teaching Preferences
  defaultQuizDuration: number;
  showHints: boolean;
  allowRetries: boolean;
  passingScore: number;
  
  // Privacy & Security
  showOnlineStatus: boolean;
  allowStudentMessages: boolean;
  requirePasswordChange: boolean;
  sessionTimeout: number;
  
  // Language & Locale
  language: 'en' | 'es' | 'fr';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export default function InstructorPreferencesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  
  const [formData, setFormData] = useState<PreferencesFormData>({
    // Notification Preferences
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    studentProgressAlerts: true,
    systemUpdates: true,
    weeklyReports: true,
    
    // Display Preferences
    theme: 'system',
    fontSize: 'medium',
    compactView: false,
    showAvatars: true,
    
    // Dashboard Preferences
    defaultDashboardTab: 'overview',
    studentsPerPage: 20,
    autoRefresh: true,
    refreshInterval: 30,
    
    // Teaching Preferences
    defaultQuizDuration: 30,
    showHints: true,
    allowRetries: true,
    passingScore: 70,
    
    // Privacy & Security
    showOnlineStatus: true,
    allowStudentMessages: true,
    requirePasswordChange: false,
    sessionTimeout: 60,
    
    // Language & Locale
    language: 'en',
    timezone: 'America/New_York',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
  });

  // Load user preferences from local storage or API
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        // Try to load from localStorage first
        const savedPrefs = localStorage.getItem('instructorPreferences');
        if (savedPrefs) {
          const parsed = JSON.parse(savedPrefs);
          setFormData(prev => ({ ...prev, ...parsed }));
        }

        // TODO: Load from API
        // const response = await fetch('/api/instructor/preferences');
        // if (response.ok) {
        //   const prefs = await response.json();
        //   setFormData(prev => ({ ...prev, ...prefs }));
        // }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  const handleInputChange = <K extends keyof PreferencesFormData>(
    field: K,
    value: PreferencesFormData[K]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Save to localStorage
      localStorage.setItem('instructorPreferences', JSON.stringify(formData));
      
      // TODO: Save to API
      // const response = await fetch('/api/instructor/preferences', {
      //   method: 'PUT',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (!response.ok) {
      //   throw new Error('Failed to save preferences');
      // }

      setMessage({ type: 'success', text: 'Preferences saved successfully!' });
      setHasChanges(false);

      // Apply theme changes immediately
      if (formData.theme !== 'system') {
        document.documentElement.classList.toggle('dark', formData.theme === 'dark');
      } else {
        // Use system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }
      
    } catch (error) {
      console.error('Preferences save error:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to save preferences. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to default values
    setFormData({
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false,
      studentProgressAlerts: true,
      systemUpdates: true,
      weeklyReports: true,
      theme: 'system',
      fontSize: 'medium',
      compactView: false,
      showAvatars: true,
      defaultDashboardTab: 'overview',
      studentsPerPage: 20,
      autoRefresh: true,
      refreshInterval: 30,
      defaultQuizDuration: 30,
      showHints: true,
      allowRetries: true,
      passingScore: 70,
      showOnlineStatus: true,
      allowStudentMessages: true,
      requirePasswordChange: false,
      sessionTimeout: 60,
      language: 'en',
      timezone: 'America/New_York',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
    });
    setHasChanges(true);
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void; 
    label: string; 
    description?: string;
  }) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{label}</h3>
        {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-gray-200'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const SelectField = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (value: string) => void; 
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <ClientSafeInstructorLayout>
      <div className="p-4 sm:p-6 lg:ml-80">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                    <Cog6ToothIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Preferences</h1>
                    <p className="text-gray-600">Customize your instructor portal experience</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                  >
                    Reset to Defaults
                  </Button>
                  
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    isLoading={isLoading}
                    disabled={!hasChanges}
                    icon={<CheckCircleIcon className="w-4 h-4" />}
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Alert Message */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-success-50 border-success-200 text-success-800'
                  : 'bg-error-50 border-error-200 text-error-800'
              }`}
            >
              <div className="flex items-center">
                {message.type === 'success' ? (
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5 mr-2" />
                )}
                {message.text}
              </div>
            </motion.div>
          )}

          <div className="space-y-6">
            {/* Notification Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <BellIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <ToggleSwitch
                  checked={formData.emailNotifications}
                  onChange={(checked) => handleInputChange('emailNotifications', checked)}
                  label="Email Notifications"
                  description="Receive notifications via email"
                />
                
                <ToggleSwitch
                  checked={formData.pushNotifications}
                  onChange={(checked) => handleInputChange('pushNotifications', checked)}
                  label="Push Notifications"
                  description="Browser and mobile push notifications"
                />
                
                <ToggleSwitch
                  checked={formData.smsNotifications}
                  onChange={(checked) => handleInputChange('smsNotifications', checked)}
                  label="SMS Notifications"
                  description="Text message notifications for urgent alerts"
                />
                
                <ToggleSwitch
                  checked={formData.studentProgressAlerts}
                  onChange={(checked) => handleInputChange('studentProgressAlerts', checked)}
                  label="Student Progress Alerts"
                  description="Get notified when students complete assignments or need help"
                />
                
                <ToggleSwitch
                  checked={formData.systemUpdates}
                  onChange={(checked) => handleInputChange('systemUpdates', checked)}
                  label="System Updates"
                  description="Notifications about system maintenance and updates"
                />
                
                <ToggleSwitch
                  checked={formData.weeklyReports}
                  onChange={(checked) => handleInputChange('weeklyReports', checked)}
                  label="Weekly Reports"
                  description="Receive weekly summary reports"
                />
              </div>
            </motion.div>

            {/* Display Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <EyeIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Display Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Theme"
                  value={formData.theme}
                  onChange={(value) => handleInputChange('theme', value as 'light' | 'dark' | 'system')}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System Default' },
                  ]}
                />
                
                <SelectField
                  label="Font Size"
                  value={formData.fontSize}
                  onChange={(value) => handleInputChange('fontSize', value as 'small' | 'medium' | 'large')}
                  options={[
                    { value: 'small', label: 'Small' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'large', label: 'Large' },
                  ]}
                />
              </div>
              
              <div className="mt-6 space-y-4">
                <ToggleSwitch
                  checked={formData.compactView}
                  onChange={(checked) => handleInputChange('compactView', checked)}
                  label="Compact View"
                  description="Use dense layout with less spacing"
                />
                
                <ToggleSwitch
                  checked={formData.showAvatars}
                  onChange={(checked) => handleInputChange('showAvatars', checked)}
                  label="Show Avatars"
                  description="Display student profile pictures in lists"
                />
              </div>
            </motion.div>

            {/* Dashboard Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <ChartBarIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Dashboard Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Default Tab"
                  value={formData.defaultDashboardTab}
                  onChange={(value) => handleInputChange('defaultDashboardTab', value as 'overview' | 'students' | 'analytics')}
                  options={[
                    { value: 'overview', label: 'Overview' },
                    { value: 'students', label: 'Students' },
                    { value: 'analytics', label: 'Analytics' },
                  ]}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Students Per Page</label>
                  <select
                    value={formData.studentsPerPage}
                    onChange={(e) => handleInputChange('studentsPerPage', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <ToggleSwitch
                  checked={formData.autoRefresh}
                  onChange={(checked) => handleInputChange('autoRefresh', checked)}
                  label="Auto Refresh"
                  description="Automatically refresh dashboard data"
                />
                
                {formData.autoRefresh && (
                  <div className="ml-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      min={10}
                      max={300}
                      value={formData.refreshInterval}
                      onChange={(e) => handleInputChange('refreshInterval', Number(e.target.value))}
                      className="w-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Teaching Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <AcademicCapIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Teaching Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Quiz Duration (minutes)</label>
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={formData.defaultQuizDuration}
                    onChange={(e) => handleInputChange('defaultQuizDuration', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passing Score (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={100}
                    value={formData.passingScore}
                    onChange={(e) => handleInputChange('passingScore', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <ToggleSwitch
                  checked={formData.showHints}
                  onChange={(checked) => handleInputChange('showHints', checked)}
                  label="Show Hints"
                  description="Allow students to see hints during quizzes"
                />
                
                <ToggleSwitch
                  checked={formData.allowRetries}
                  onChange={(checked) => handleInputChange('allowRetries', checked)}
                  label="Allow Retries"
                  description="Let students retake failed assessments"
                />
              </div>
            </motion.div>

            {/* Privacy & Security */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <ShieldCheckIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Privacy & Security</h2>
              </div>
              
              <div className="space-y-4">
                <ToggleSwitch
                  checked={formData.showOnlineStatus}
                  onChange={(checked) => handleInputChange('showOnlineStatus', checked)}
                  label="Show Online Status"
                  description="Let students see when you're online"
                />
                
                <ToggleSwitch
                  checked={formData.allowStudentMessages}
                  onChange={(checked) => handleInputChange('allowStudentMessages', checked)}
                  label="Allow Student Messages"
                  description="Students can send you direct messages"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                  <select
                    value={formData.sessionTimeout}
                    onChange={(e) => handleInputChange('sessionTimeout', Number(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none max-w-xs"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                    <option value={240}>4 hours</option>
                    <option value={480}>8 hours</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Language & Locale */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="bg-white rounded-lg shadow-card border border-gray-200 p-6"
            >
              <div className="flex items-center mb-4">
                <GlobeAltIcon className="w-5 h-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Language & Locale</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SelectField
                  label="Language"
                  value={formData.language}
                  onChange={(value) => handleInputChange('language', value as 'en' | 'es' | 'fr')}
                  options={[
                    { value: 'en', label: 'English' },
                    { value: 'es', label: 'Spanish' },
                    { value: 'fr', label: 'French' },
                  ]}
                />
                
                <SelectField
                  label="Date Format"
                  value={formData.dateFormat}
                  onChange={(value) => handleInputChange('dateFormat', value as 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD')}
                  options={[
                    { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                    { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                    { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                  ]}
                />
                
                <SelectField
                  label="Time Format"
                  value={formData.timeFormat}
                  onChange={(value) => handleInputChange('timeFormat', value as '12h' | '24h')}
                  options={[
                    { value: '12h', label: '12 Hour (AM/PM)' },
                    { value: '24h', label: '24 Hour' },
                  ]}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-4 focus:ring-primary-200 focus:border-primary-500 focus:outline-none"
                  >
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                    <option value="America/Anchorage">Alaska Time</option>
                    <option value="Pacific/Honolulu">Hawaii Time</option>
                  </select>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            className="mt-8 text-center"
          >
            <Button
              variant="ghost"
              onClick={() => router.push('/instructor/dashboard')}
            >
              ← Back to Dashboard
            </Button>
          </motion.div>
        </div>
      </div>
    </ClientSafeInstructorLayout>
  );
}