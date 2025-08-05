'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BellIcon, DevicePhoneMobileIcon, EnvelopeIcon } from '@heroicons/react/24/outline';


export default function NotificationPreferencesPage() {
  const router = useRouter();
  const { isAuthenticated, userSettings, updateNotificationSettings } = useAppStore();
  const settings = userSettings.notifications;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleToggle = (key: keyof typeof settings) => {
    const updates = {
      [key]: !settings[key]
    };
    updateNotificationSettings(updates);
  };

  const handleReset = () => {
    const defaultSettings = {
      pushNotifications: true,
      emailNotifications: true,
      smsNotifications: false,
      practiceReminders: true,
      achievementAlerts: true,
      weeklyReports: true,
      systemUpdates: true,
      quietHours: {
        start: '22:00',
        end: '07:00'
      },
      soundProfile: 'default'
    };
    updateNotificationSettings(defaultSettings);
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
        title: 'Notification Preferences',
        showBack: true,
        onBack: () => router.push('/profile'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Notification Channels */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <BellIcon className="w-5 h-5 text-primary-600 mr-2" />
              <CardTitle>Notification Channels</CardTitle>
            </div>

            <div className="space-y-1">
              <ToggleSwitch
                checked={settings.pushNotifications}
                onChange={() => handleToggle('pushNotifications')}
                label="Push Notifications"
                description="Receive notifications directly on this device"
              />
              
              <ToggleSwitch
                checked={settings.emailNotifications}
                onChange={() => handleToggle('emailNotifications')}
                label="Email Notifications"
                description="Get updates sent to your email address"
              />
              
              <ToggleSwitch
                checked={settings.smsNotifications}
                onChange={() => handleToggle('smsNotifications')}
                label="SMS Notifications"
                description="Receive text messages for important alerts"
              />
            </div>
          </CardContent>
        </Card>

        {/* Content Preferences */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <EnvelopeIcon className="w-5 h-5 text-primary-600 mr-2" />
              <CardTitle>Content Preferences</CardTitle>
            </div>

            <div className="space-y-1">
              <ToggleSwitch
                checked={settings.practiceReminders}
                onChange={() => handleToggle('practiceReminders')}
                label="Practice Reminders"
                description="Daily reminders to keep up with your training"
              />
              
              <ToggleSwitch
                checked={settings.achievementAlerts}
                onChange={() => handleToggle('achievementAlerts')}
                label="Achievement Alerts"
                description="Notifications when you earn new achievements"
              />
              
              <ToggleSwitch
                checked={settings.weeklyReports}
                onChange={() => handleToggle('weeklyReports')}
                label="Weekly Reports"
                description="Summary of your progress and performance"
              />
              
              <ToggleSwitch
                checked={settings.systemUpdates}
                onChange={() => handleToggle('systemUpdates')}
                label="System Updates"
                description="Information about app updates and new features"
              />
            </div>
          </CardContent>
        </Card>

        {/* Device Settings */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <DevicePhoneMobileIcon className="w-5 h-5 text-primary-600 mr-2" />
              <CardTitle>Device Settings</CardTitle>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900 mb-1">Quiet Hours</p>
                <p className="text-sm text-gray-600 mb-2">No notifications during these hours</p>
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    value={settings.quietHours.start}
                    onChange={(e) => updateNotificationSettings({
                      quietHours: { ...settings.quietHours, start: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="time"
                    value={settings.quietHours.end}
                    onChange={(e) => updateNotificationSettings({
                      quietHours: { ...settings.quietHours, end: e.target.value }
                    })}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-1">Sound</p>
                <select 
                  value={settings.soundProfile}
                  onChange={(e) => updateNotificationSettings({ soundProfile: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="default">Default</option>
                  <option value="police-radio">Police Radio</option>
                  <option value="alert">Alert Tone</option>
                  <option value="silent">Silent</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button variant="ghost" onClick={handleReset} className="w-full">
            Reset to Defaults
          </Button>
        </div>

        {/* Auto-Save Info */}
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