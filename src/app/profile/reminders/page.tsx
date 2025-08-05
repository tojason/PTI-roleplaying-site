'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ClockIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';


export default function PracticeRemindersPage() {
  const router = useRouter();
  const { isAuthenticated, userSettings, updateReminders, addReminder, updateReminder, deleteReminder } = useAppStore();
  const reminders = userSettings.reminders;
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReminder, setNewReminder] = useState({
    time: '09:00',
    days: [] as string[],
    message: '',
    type: 'daily' as const,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);


  const handleToggleReminder = (id: string) => {
    const reminder = reminders.find(r => r.id === id);
    if (reminder) {
      updateReminder(id, { enabled: !reminder.enabled });
    }
  };

  const handleDeleteReminder = (id: string) => {
    deleteReminder(id);
  };

  const handleAddReminder = () => {
    if (!newReminder.message || newReminder.days.length === 0) {
      alert('Please fill in all fields');
      return;
    }

    const reminder = {
      id: Date.now().toString(),
      ...newReminder,
      enabled: true,
    };

    addReminder(reminder);
    setNewReminder({
      time: '09:00',
      days: [],
      message: '',
      type: 'daily',
    });
    setShowAddForm(false);
  };

  const handleDayToggle = (day: string) => {
    setNewReminder(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  if (!isAuthenticated) {
    return null;
  }

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Layout 
      headerProps={{
        title: 'Practice Reminders',
        showBack: true,
        onBack: () => router.push('/profile'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <ClockIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Stay Consistent</CardTitle>
            <p className="text-gray-600 text-sm">
              Set up reminders to maintain regular practice sessions and build lasting habits.
            </p>
          </CardContent>
        </Card>

        {/* Existing Reminders */}
        {reminders.length > 0 ? (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <Card key={reminder.id} padding="lg">
                <CardContent>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="text-2xl font-bold text-primary-600 mr-3">
                          {reminder.time}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          reminder.enabled 
                            ? 'bg-success-100 text-success-800' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {reminder.enabled ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      
                      <p className="text-gray-900 font-medium mb-1">
                        {reminder.message}
                      </p>
                      
                      <div className="flex flex-wrap gap-1 mb-3">
                        {reminder.days.map((day) => (
                          <span 
                            key={day}
                            className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded"
                          >
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 ml-3">
                      <button
                        onClick={() => handleToggleReminder(reminder.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          reminder.enabled ? 'bg-primary-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            reminder.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReminder(reminder.id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card padding="lg" className="text-center">
            <CardContent>
              <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Reminders Set</h3>
              <p className="text-gray-500 text-sm mb-4">
                You haven't created any practice reminders yet. Set up your first reminder to build a consistent practice habit.
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="inline-flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Create Your First Reminder
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Add New Reminder Form */}
        {showAddForm ? (
          <Card padding="lg">
            <CardContent>
              <CardTitle className="mb-4">Add New Reminder</CardTitle>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={newReminder.time}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {dayNames.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                          newReminder.days.includes(day)
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={newReminder.message}
                    onChange={(e) => setNewReminder(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Enter reminder message..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleAddReminder} className="flex-1">
                    Add Reminder
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAddForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : reminders.length > 0 && (
          <Button
            onClick={() => setShowAddForm(true)}
            variant="ghost"
            className="w-full border-2 border-dashed border-gray-300 hover:border-primary-300 hover:bg-primary-50"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Another Reminder
          </Button>
        )}

        {/* Tips */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">Reminder Tips</CardTitle>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Set reminders for times when you're usually free and alert
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Start with short, frequent sessions rather than long, infrequent ones
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Customize your message to stay motivated and focused
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}