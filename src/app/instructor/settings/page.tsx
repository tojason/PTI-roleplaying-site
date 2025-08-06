'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClientSafeInstructorLayout } from '@/components/instructor/ClientSafeInstructorLayout';
import { Button } from '@/components/ui/Button';
import { 
  Cog6ToothIcon,
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon,
  AcademicCapIcon,
  ChartBarIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const settingsCategories = [
  {
    id: 'profile',
    title: 'Profile Settings',
    description: 'Manage your account information and personal details',
    icon: UserCircleIcon,
    href: '/instructor/profile',
    color: 'bg-blue-500',
    items: [
      'Personal information',
      'Contact details',
      'Department information',
      'Emergency contacts'
    ]
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Customize your instructor portal experience',
    icon: Cog6ToothIcon,
    href: '/instructor/preferences',
    color: 'bg-purple-500',
    items: [
      'Display settings',
      'Dashboard preferences',
      'Teaching preferences',
      'Language & locale'
    ]
  },
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Control how and when you receive alerts',
    icon: BellIcon,
    href: '/instructor/preferences',
    anchor: 'notifications',
    color: 'bg-yellow-500',
    items: [
      'Email notifications',
      'Push notifications',
      'Student progress alerts',
      'System updates'
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    description: 'Manage your account security and privacy settings',
    icon: ShieldCheckIcon,
    href: '/instructor/profile',
    anchor: 'security',
    color: 'bg-red-500',
    items: [
      'Password settings',
      'Privacy controls',
      'Session management',
      'Account status'
    ]
  },
  {
    id: 'teaching',
    title: 'Teaching Settings',
    description: 'Configure default settings for assignments and assessments',
    icon: AcademicCapIcon,
    href: '/instructor/preferences',
    anchor: 'teaching',
    color: 'bg-green-500',
    items: [
      'Default quiz duration',
      'Passing scores',
      'Hint settings',
      'Retry policies'
    ]
  },
  {
    id: 'dashboard',
    title: 'Dashboard Settings',
    description: 'Customize your dashboard layout and data display',
    icon: ChartBarIcon,
    href: '/instructor/preferences',
    anchor: 'dashboard',
    color: 'bg-indigo-500',
    items: [
      'Default view',
      'Auto-refresh settings',
      'Widget configuration',
      'Data display options'
    ]
  }
];

const quickActions = [
  {
    id: 'change-password',
    title: 'Change Password',
    description: 'Update your account password',
    icon: KeyIcon,
    href: '/instructor/change-password',
    variant: 'primary' as const
  },
  {
    id: 'backup-settings',
    title: 'Backup Settings',
    description: 'Export your preferences and configurations',
    icon: ComputerDesktopIcon,
    action: 'backup',
    variant: 'secondary' as const
  },
  {
    id: 'reset-settings',
    title: 'Reset to Defaults',
    description: 'Restore all settings to their default values',
    icon: ExclamationTriangleIcon,
    action: 'reset',
    variant: 'error' as const
  }
];

export default function InstructorSettingsPage() {
  const router = useRouter();

  const handleCategoryClick = (category: typeof settingsCategories[0]) => {
    const url = category.anchor ? `${category.href}#${category.anchor}` : category.href;
    router.push(url);
  };

  const handleQuickAction = (actionId: string) => {
    switch (actionId) {
      case 'change-password':
        // TODO: Implement change password functionality
        router.push('/instructor/profile');
        break;
      case 'backup-settings':
        handleBackupSettings();
        break;
      case 'reset-settings':
        handleResetSettings();
        break;
    }
  };

  const handleBackupSettings = () => {
    try {
      // Get all settings from localStorage
      const preferences = localStorage.getItem('instructorPreferences');
      const tutorialState = localStorage.getItem('tutorialState');
      const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
      
      const backup = {
        preferences: preferences ? JSON.parse(preferences) : null,
        tutorialState: tutorialState ? JSON.parse(tutorialState) : null,
        hasSeenTutorial,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      // Create and download backup file
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `instructor-settings-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert('Settings backup downloaded successfully!');
    } catch (error) {
      console.error('Backup failed:', error);
      alert('Failed to create backup. Please try again.');
    }
  };

  const handleResetSettings = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.'
    );
    
    if (confirmed) {
      try {
        // Clear all settings from localStorage
        localStorage.removeItem('instructorPreferences');
        localStorage.removeItem('tutorialState');
        localStorage.removeItem('hasSeenTutorial');
        
        alert('Settings have been reset to defaults. The page will reload.');
        window.location.reload();
      } catch (error) {
        console.error('Reset failed:', error);
        alert('Failed to reset settings. Please try again.');
      }
    }
  };

  return (
    <ClientSafeInstructorLayout>
      <div className="p-4 sm:p-6 lg:ml-80">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <Cog6ToothIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                  <p className="text-gray-600">Manage your account, preferences, and portal settings</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
              <div className="flex items-center mb-4">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-blue-900">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <motion.div
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant={action.variant}
                      size="md"
                      onClick={() => handleQuickAction(action.id)}
                      className="w-full justify-start"
                      icon={<action.icon className="w-5 h-5" />}
                    >
                      <div className="text-left flex-1">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs opacity-90">{action.description}</div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Settings Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {settingsCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCategoryClick(category)}
                className="bg-white rounded-lg shadow-card border border-gray-200 p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${category.color} rounded-lg flex items-center justify-center`}>
                    <category.icon className="w-6 h-6 text-white" />
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                
                <ul className="space-y-1">
                  {category.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-xs text-gray-500 flex items-center">
                      <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>

          {/* Help Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.8 }}
            className="bg-gray-50 rounded-lg p-6 border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help?</h3>
                <p className="text-gray-600 text-sm">
                  Contact support or check our documentation for assistance with settings and configuration.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open('mailto:support@policetraining.com', '_blank')}
                >
                  Contact Support
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => alert('Documentation coming soon!')}
                >
                  View Documentation
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Back to Dashboard */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
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