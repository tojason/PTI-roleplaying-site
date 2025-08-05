'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ShieldCheckIcon, 
  EyeIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';


export default function PrivacySecurityPage() {
  const router = useRouter();
  const { user, isAuthenticated, userSettings, updatePrivacySettings } = useAppStore();
  const settings = userSettings.privacy;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleToggle = (key: keyof typeof settings, value?: any) => {
    const updates = {
      [key]: value !== undefined ? value : !settings[key]
    };
    updatePrivacySettings(updates);
  };

  const handleDeleteAllData = () => {
    if (window.confirm('Are you sure you want to delete all your training data? This action cannot be undone.')) {
      // In a real app, this would call an API to delete user data
      localStorage.clear();
      alert('All training data has been deleted.');
      setShowDeleteConfirm(false);
    }
  };

  const handleExportData = () => {
    // In a real app, this would call an API to export user data
    const userData = {
      profile: user,
      settings: settings,
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `police-training-data-${user?.pid}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  if (!isAuthenticated) {
    return null;
  }

  const ToggleSwitch = ({ checked, onChange, label, description }: {
    checked: boolean;
    onChange: () => void;
    label: string;
    description: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
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

  return (
    <Layout 
      headerProps={{
        title: 'Privacy & Security',
        showBack: true,
        onBack: () => router.push('/profile'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Privacy Overview */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <ShieldCheckIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Your Privacy Matters</CardTitle>
            <p className="text-gray-600 text-sm">
              Control how your data is used and shared while using the training app.
            </p>
          </CardContent>
        </Card>

        {/* Data Privacy Settings */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <EyeIcon className="w-5 h-5 text-primary-600 mr-2" />
              <CardTitle>Data Privacy</CardTitle>
            </div>

            <div className="space-y-1">
              <ToggleSwitch
                checked={settings.analyticsOptIn}
                onChange={() => handleToggle('analyticsOptIn')}
                label="Analytics & Usage Data"
                description="Help improve the app by sharing anonymous usage statistics"
              />
              
              <ToggleSwitch
                checked={settings.performanceTracking}
                onChange={() => handleToggle('performanceTracking')}
                label="Performance Tracking"
                description="Allow tracking of training performance for insights"
              />
              
              <ToggleSwitch
                checked={settings.crashReporting}
                onChange={() => handleToggle('crashReporting')}
                label="Crash Reporting"
                description="Automatically send crash reports to help fix issues"
              />
              
              <ToggleSwitch
                checked={settings.dataSharing}
                onChange={() => handleToggle('dataSharing')}
                label="Data Sharing with Department"
                description="Share training progress with your department administrators"
              />
            </div>
          </CardContent>
        </Card>

        {/* Profile Visibility */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Profile Visibility</CardTitle>
            <p className="text-sm text-gray-600 mb-4">
              Choose who can see your training progress and achievements.
            </p>

            <div className="space-y-2">
              {[
                { 
                  value: 'private', 
                  label: 'Private', 
                  description: 'Only you can see your progress' 
                },
                { 
                  value: 'department', 
                  label: 'Department Only', 
                  description: 'Visible to your department colleagues' 
                },
                { 
                  value: 'public', 
                  label: 'Public', 
                  description: 'Visible to all app users (anonymous)' 
                },
              ].map((option) => (
                <label 
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    settings.profileVisibility === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={settings.profileVisibility === option.value}
                    onChange={(e) => handleToggle('profileVisibility', e.target.value)}
                    className="w-4 h-4 text-primary-600 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="w-5 h-5 text-primary-600 mr-2" />
              <CardTitle>Data Management</CardTitle>
            </div>

            <div className="space-y-3">
              <Button
                variant="ghost"
                onClick={handleExportData}
                className="w-full justify-start"
              >
                <DocumentTextIcon className="w-4 h-4 mr-2" />
                Export My Data
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete All My Data
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-2">
                      Permanently Delete All Data?
                    </p>
                    <p className="text-sm text-red-700 mb-4">
                      This will permanently delete all your training progress, achievements, and settings. This action cannot be undone.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        variant="error"
                        size="sm"
                        onClick={handleDeleteAllData}
                      >
                        Yes, Delete Everything
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Info */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">Security Information</CardTitle>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-900">Data Encryption</p>
                  <p className="text-gray-600">All data is encrypted in transit and at rest</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-900">Access Control</p>
                  <p className="text-gray-600">Strict access controls protect your personal information</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <div>
                  <p className="font-medium text-gray-900">Data Retention</p>
                  <p className="text-gray-600">Data is retained only as long as necessary for training purposes</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Auto-Save Info */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Settings are automatically saved when changed
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}