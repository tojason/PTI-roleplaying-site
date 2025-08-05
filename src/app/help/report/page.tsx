'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ExclamationTriangleIcon, 
  BugAntIcon, 
  CheckCircleIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

export default function ReportProblemPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [formData, setFormData] = useState({
    problemType: 'bug',
    title: '',
    description: '',
    stepsToReproduce: '',
    expectedBehavior: '',
    actualBehavior: '',
    frequency: 'sometimes',
    affectsTraining: false,
  });
  const [systemInfo, setSystemInfo] = useState({
    userAgent: '',
    platform: '',
    language: '',
    screenResolution: '',
    timestamp: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Collect system information
    setSystemInfo({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      screenResolution: `${screen.width}x${screen.height}`,
      timestamp: new Date().toISOString(),
    });
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in the required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would send the bug report to your backend
      console.log('Bug report submitted:', {
        ...formData,
        systemInfo,
        user: {
          name: user?.name,
          department: user?.department,
          pid: user?.pid,
        },
        reportId: `BUG-${Date.now()}`,
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      problemType: 'bug',
      title: '',
      description: '',
      stepsToReproduce: '',
      expectedBehavior: '',
      actualBehavior: '',
      frequency: 'sometimes',
      affectsTraining: false,
    });
    setIsSubmitted(false);
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isSubmitted) {
    return (
      <Layout 
        headerProps={{
          title: 'Report a Problem',
          showBack: true,
          onBack: () => router.push('/help'),
        }}
      >
        <div className="p-4 space-y-6">
          <Card padding="lg" className="text-center">
            <CardContent>
              <CheckCircleIcon className="w-16 h-16 text-success-600 mx-auto mb-4" />
              <CardTitle className="mb-4 text-success-900">Report Submitted!</CardTitle>
              <p className="text-gray-600 mb-2">
                Thank you for reporting this issue. Your report helps us improve the app.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Report ID: BUG-{Date.now()}
              </p>
              <div className="space-y-3">
                <Button onClick={handleReset} className="w-full">
                  Report Another Issue
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => router.push('/help')}
                  className="w-full"
                >
                  Back to Help
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      headerProps={{
        title: 'Report a Problem',
        showBack: true,
        onBack: () => router.push('/help'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <BugAntIcon className="w-12 h-12 text-warning-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Found a Problem?</CardTitle>
            <p className="text-gray-600 text-sm">
              Help us improve the app by reporting bugs, issues, or suggesting improvements.
            </p>
          </CardContent>
        </Card>

        {/* Problem Type Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              type: 'bug',
              title: 'Bug Report',
              description: 'Something isn\'t working correctly',
              icon: BugAntIcon,
              color: 'text-red-600'
            },
            {
              type: 'feature',
              title: 'Feature Request',
              description: 'Suggest a new feature',
              icon: ExclamationTriangleIcon,
              color: 'text-blue-600'
            },
            {
              type: 'improvement',
              title: 'Improvement',
              description: 'Suggest an enhancement',
              icon: CheckCircleIcon,
              color: 'text-green-600'
            }
          ].map((option) => {
            const Icon = option.icon;
            return (
              <Card
                key={option.type}
                padding="md"
                className={`cursor-pointer transition-all ${
                  formData.problemType === option.type
                    ? 'border-primary-500 bg-primary-50'
                    : 'hover:border-gray-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, problemType: option.type }))}
              >
                <CardContent className="text-center">
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${option.color}`} />
                  <p className="font-semibold text-gray-900 mb-1">{option.title}</p>
                  <p className="text-xs text-gray-600">{option.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Report Form */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Problem Details</CardTitle>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Problem Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Brief summary of the problem"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what happened in detail..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Steps to Reproduce (for bugs) */}
              {formData.problemType === 'bug' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Steps to Reproduce
                  </label>
                  <textarea
                    value={formData.stepsToReproduce}
                    onChange={(e) => setFormData(prev => ({ ...prev, stepsToReproduce: e.target.value }))}
                    placeholder="1. Go to...&#10;2. Click on...&#10;3. See error..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              )}

              {/* Expected vs Actual Behavior (for bugs) */}
              {formData.problemType === 'bug' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expected Behavior
                    </label>
                    <textarea
                      value={formData.expectedBehavior}
                      onChange={(e) => setFormData(prev => ({ ...prev, expectedBehavior: e.target.value }))}
                      placeholder="What should have happened?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Actual Behavior
                    </label>
                    <textarea
                      value={formData.actualBehavior}
                      onChange={(e) => setFormData(prev => ({ ...prev, actualBehavior: e.target.value }))}
                      placeholder="What actually happened?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              )}

              {/* Frequency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How often does this happen?
                </label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="always">Always</option>
                  <option value="often">Often</option>
                  <option value="sometimes">Sometimes</option>
                  <option value="rarely">Rarely</option>
                  <option value="once">Just once</option>
                </select>
              </div>

              {/* Affects Training */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="affectsTraining"
                  checked={formData.affectsTraining}
                  onChange={(e) => setFormData(prev => ({ ...prev, affectsTraining: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                />
                <label htmlFor="affectsTraining" className="ml-2 text-sm text-gray-700">
                  This problem prevents me from completing training effectively
                </label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting Report...
                  </>
                ) : (
                  'Submit Report'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Information */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">System Information</CardTitle>
            <p className="text-sm text-gray-600 mb-3">
              This information will be included automatically to help diagnose the issue.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Platform: {systemInfo.platform}</span>
              </div>
              <div className="flex items-center">
                <GlobeAltIcon className="w-4 h-4 mr-2 text-gray-400" />
                <span className="text-gray-600">Language: {systemInfo.language}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}