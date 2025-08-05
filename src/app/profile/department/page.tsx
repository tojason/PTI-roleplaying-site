'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BuildingOfficeIcon, UsersIcon, MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';


export default function DepartmentSettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, userSettings, updateDepartmentSettings } = useAppStore();
  const settings = userSettings.department;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);


  const handleToggleModule = (module: string) => {
    const updatedModules = settings.trainingModules.includes(module)
      ? settings.trainingModules.filter(m => m !== module)
      : [...settings.trainingModules, module];
    
    updateDepartmentSettings({ trainingModules: updatedModules });
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const availableModules = [
    { id: '10-codes', name: '10-Code Training', description: 'Essential radio codes' },
    { id: 'phonetic', name: 'Phonetic Alphabet', description: 'NATO phonetic alphabet' },
    { id: 'radio-protocol', name: 'Radio Protocol', description: 'Communication procedures' },
    { id: 'emergency-codes', name: 'Emergency Codes', description: 'Critical situation codes' },
    { id: 'traffic-codes', name: 'Traffic Codes', description: 'Traffic enforcement codes' },
    { id: 'incident-codes', name: 'Incident Codes', description: 'Incident classification codes' },
  ];

  return (
    <Layout 
      headerProps={{
        title: 'Department Settings',
        showBack: true,
        onBack: () => router.push('/profile'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Department Info */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <BuildingOfficeIcon className="w-6 h-6 text-primary-600 mr-3" />
              <div>
                <CardTitle>{user.department}</CardTitle>
                <p className="text-sm text-gray-600">Police Department</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-4 h-4 mr-2" />
                <span>Metropolitan District</span>
              </div>
              <div className="flex items-center text-gray-600">
                <UsersIcon className="w-4 h-4 mr-2" />
                <span>450+ Officers</span>
              </div>
              <div className="flex items-center text-gray-600">
                <PhoneIcon className="w-4 h-4 mr-2" />
                <span>24/7 Dispatch</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Requirements */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Training Requirements</CardTitle>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level Required
                </label>
                <select
                  value={settings.requirementLevel}
                  onChange={(e) => {
                    updateDepartmentSettings({ requirementLevel: e.target.value as any });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="basic">Basic (70% accuracy)</option>
                  <option value="standard">Standard (80% accuracy)</option>
                  <option value="advanced">Advanced (90% accuracy)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Voice Protocol Standard
                </label>
                <select
                  value={settings.voiceProtocols}
                  onChange={(e) => {
                    updateDepartmentSettings({ voiceProtocols: e.target.value });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="standard">Standard Protocol</option>
                  <option value="military">Military Style</option>
                  <option value="local">Local Department Custom</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Modules */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Required Training Modules</CardTitle>
            <p className="text-sm text-gray-600 mb-4">
              Select which training modules are required for your department.
            </p>

            <div className="space-y-3">
              {availableModules.map((module) => (
                <div key={module.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{module.name}</p>
                    <p className="text-sm text-gray-600">{module.description}</p>
                  </div>
                  <button
                    onClick={() => handleToggleModule(module.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      settings.trainingModules.includes(module.id) ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.trainingModules.includes(module.id) ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Codes */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Custom Code Support</CardTitle>
            
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">Enable Custom 10-Codes</p>
                <p className="text-sm text-gray-600">
                  Allow department-specific code variations
                </p>
              </div>
              <button
                onClick={() => {
                  updateDepartmentSettings({ customCodes: !settings.customCodes });
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.customCodes ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.customCodes ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {settings.customCodes && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Custom codes require approval from your training administrator.
                  Contact IT support to configure department-specific codes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Auto-Save Info */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center justify-center text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              Settings are automatically saved when changed
            </div>
          </CardContent>
        </Card>

        {/* Contact IT */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">Need Help?</CardTitle>
            <p className="text-sm text-gray-600 mb-3">
              For changes to department settings, contact your IT administrator or training coordinator.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>IT Support:</strong> it-support@{user.department.toLowerCase().replace(/\s+/g, '')}.gov</p>
              <p><strong>Training Dept:</strong> training@{user.department.toLowerCase().replace(/\s+/g, '')}.gov</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}