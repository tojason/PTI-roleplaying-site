'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { 
  QuestionMarkCircleIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';

export default function HelpPage() {
  const router = useRouter();
  const { isAuthenticated, setActiveTab } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Set the active tab to help when this page loads
    setActiveTab('help');
  }, [isAuthenticated, router, setActiveTab]);

  if (!isAuthenticated) {
    return null;
  }

  const helpSections = [
    {
      title: 'Getting Started',
      icon: BookOpenIcon,
      items: [
        'Complete your profile setup',
        'Take your first practice quiz',
        'Review your performance',
        'Set daily practice goals'
      ]
    },
    {
      title: 'Practice Modes',
      icon: InformationCircleIcon,
      items: [
        '10-Codes Quiz: Learn essential radio codes',
        'Phonetic Alphabet: Master letter pronunciation',
        'Voice Practice: Simulate real radio communication',
        'Mixed Practice: Combined learning experience'
      ]
    },
    {
      title: 'Features',
      icon: QuestionMarkCircleIcon,
      items: [
        'Progress tracking and analytics',
        'Adaptive difficulty adjustment',
        'Voice recognition technology',
        'Achievement system'
      ]
    },
    {
      title: 'Troubleshooting',
      icon: ExclamationTriangleIcon,
      items: [
        'Voice recognition not working? Check microphone permissions',
        'App running slowly? Clear your browser cache',
        'Questions not loading? Check your internet connection',
        'Still having issues? Contact IT support'
      ]
    }
  ];

  return (
    <Layout 
      showNavigation={true}
      headerProps={{
        title: 'Help & Support',
        showMenu: true,
        showNotifications: true,
      }}
    >
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <QuestionMarkCircleIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <CardTitle className="mb-2">How can we help?</CardTitle>
            <p className="text-gray-600">
              Find answers to common questions and learn how to make the most of your training experience.
            </p>
          </CardContent>
        </Card>

        {/* Help Sections */}
        {helpSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card key={section.title} padding="lg">
              <CardContent>
                <div className="flex items-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600 mr-3" />
                  <CardTitle>{section.title}</CardTitle>
                </div>
                <ul className="space-y-2">
                  {section.items.map((item, index) => (
                    <li key={index} className="text-gray-700 flex items-start">
                      <span className="w-2 h-2 bg-primary-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          );
        })}

        {/* Contact Section */}
        <Card padding="lg">
          <CardContent>
            <div className="flex items-center mb-4">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-primary-600 mr-3" />
              <CardTitle>Need More Help?</CardTitle>
            </div>
            <p className="text-gray-600 mb-4">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>Email:</strong> support@policetraining.app</p>
              <p><strong>Phone:</strong> 1-800-POLICE-1</p>
              <p><strong>Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM EST</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}