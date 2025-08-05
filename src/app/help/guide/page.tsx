'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  BookOpenIcon, 
  PlayIcon, 
  ChevronRightIcon, 
  ChevronDownIcon,
  MicrophoneIcon,
  RadioIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface GuideSection {
  id: string;
  title: string;
  icon: any;
  steps: {
    title: string;
    description: string;
    tips?: string[];
  }[];
}

export default function AppGuidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAppStore();
  const [expandedSection, setExpandedSection] = useState<string | null>('getting-started');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const guideSections: GuideSection[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: BookOpenIcon,
      steps: [
        {
          title: 'Complete Your Profile',
          description: 'Set up your personal information and department details in the Profile section.',
          tips: [
            'Make sure your department is correctly selected',
            'Choose your experience level accurately for better training recommendations',
          ]
        },
        {
          title: 'Take Your First Quiz',
          description: 'Start with the 10-Codes quiz to get familiar with the interface.',
          tips: [
            'Don\'t worry about perfect scores initially',
            'Read the explanations after each question',
          ]
        },
        {
          title: 'Check Your Progress',
          description: 'Visit the Progress tab to see your performance metrics and improvement areas.',
        },
        {
          title: 'Set Up Practice Reminders',
          description: 'Configure daily reminders to maintain consistent practice habits.',
        }
      ]
    },
    {
      id: 'practice-modes',
      title: 'Practice Modes',
      icon: PlayIcon,
      steps: [
        {
          title: '10-Codes Quiz',
          description: 'Learn essential radio codes used in police communication.',
          tips: [
            'Start with easy difficulty and work your way up',
            'Focus on the most commonly used codes first',
            'Practice regularly to build muscle memory',
          ]
        },
        {
          title: 'Phonetic Alphabet',
          description: 'Master the NATO phonetic alphabet for clear communication.',
          tips: [
            'Practice spelling license plates and names',
            'Use voice practice to improve pronunciation',
            'Learn the rhythm and flow of phonetic spelling',
          ]
        },
        {
          title: 'Voice Practice',
          description: 'Simulate real radio communication scenarios.',
          tips: [
            'Speak clearly and at a steady pace',
            'Use proper radio etiquette and procedures',
            'Practice in a quiet environment for best results',
          ]
        },
        {
          title: 'Mixed Practice',
          description: 'Combine different types of training for comprehensive learning.',
          tips: [
            'Use mixed practice to prepare for real-world scenarios',
            'Challenge yourself with varied question types',
          ]
        }
      ]
    },
    {
      id: 'voice-features',
      title: 'Voice Recognition',
      icon: MicrophoneIcon,
      steps: [
        {
          title: 'Microphone Setup',
          description: 'Ensure your microphone is properly configured and permissions are granted.',
          tips: [
            'Use a good quality microphone or headset',
            'Test your microphone in browser settings',
            'Speak 6-12 inches from the microphone',
          ]
        },
        {
          title: 'Speaking Clearly',
          description: 'Learn how to speak for optimal voice recognition accuracy.',
          tips: [
            'Speak at a normal, steady pace',
            'Pronounce each word clearly',
            'Avoid background noise and distractions',
            'Pause briefly between words in phonetic spelling',
          ]
        },
        {
          title: 'Improving Accuracy',
          description: 'Tips to get better voice recognition results.',
          tips: [
            'Practice in a quiet environment',
            'Maintain consistent volume and tone',
            'Repeat exercises if recognition is poor',
            'Use the phonetic alphabet exactly as taught',
          ]
        }
      ]
    },
    {
      id: 'radio-protocols',
      title: 'Radio Protocol',
      icon: RadioIcon,
      steps: [
        {
          title: 'Basic Radio Etiquette',
          description: 'Learn the fundamental rules of radio communication.',
          tips: [
            'Think before you speak',
            'Keep transmissions brief and clear',
            'Use proper call signs and identifiers',
            'Wait for acknowledgment before continuing',
          ]
        },
        {
          title: 'Emergency Procedures',
          description: 'Understand priority communication protocols.',
          tips: [
            'Know when to use emergency frequencies',
            'Understand the hierarchy of radio traffic',
            'Practice emergency call procedures',
          ]
        },
        {
          title: 'Code Usage',
          description: 'When and how to use various radio codes effectively.',
          tips: [
            'Use codes appropriately for the situation',
            'Know your department\'s specific code variations',
            'Practice common code combinations',
          ]
        }
      ]
    }
  ];

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Layout 
      headerProps={{
        title: 'How to Use App',
        showBack: true,
        onBack: () => router.push('/help'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <BookOpenIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Training App Guide</CardTitle>
            <p className="text-gray-600 text-sm">
              Learn how to make the most of your police radio training experience.
            </p>
          </CardContent>
        </Card>

        {/* Guide Sections */}
        {guideSections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSection === section.id;

          return (
            <Card key={section.id} padding="lg">
              <CardContent>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center">
                    <Icon className="w-6 h-6 text-primary-600 mr-3" />
                    <CardTitle>{section.title}</CardTitle>
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {section.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="border-l-2 border-primary-200 pl-4">
                        <div className="flex items-start">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                            <span className="text-xs font-semibold text-primary-600">
                              {stepIndex + 1}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {step.title}
                            </h4>
                            <p className="text-gray-600 text-sm mb-2">
                              {step.description}
                            </p>
                            {step.tips && (
                              <div className="mt-2">
                                <p className="text-xs font-medium text-gray-700 mb-1">Tips:</p>
                                <ul className="space-y-1">
                                  {step.tips.map((tip, tipIndex) => (
                                    <li key={tipIndex} className="text-xs text-gray-600 flex items-start">
                                      <span className="w-1 h-1 bg-primary-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                                      {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Quick Start Actions */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Quick Start</CardTitle>
            <div className="space-y-3">
              <Button
                onClick={() => router.push('/practice/codes')}
                className="w-full justify-start"
                variant="ghost"
              >
                <RadioIcon className="w-4 h-4 mr-3" />
                Start 10-Codes Practice
              </Button>
              
              <Button
                onClick={() => router.push('/practice/phonetic')}
                className="w-full justify-start"
                variant="ghost"
              >
                <ChatBubbleBottomCenterTextIcon className="w-4 h-4 mr-3" />
                Try Phonetic Alphabet
              </Button>
              
              <Button
                onClick={() => router.push('/practice/voice')}
                className="w-full justify-start"
                variant="ghost"
              >
                <MicrophoneIcon className="w-4 h-4 mr-3" />
                Test Voice Practice
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Need More Help */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">Still Need Help?</CardTitle>
            <p className="text-gray-600 text-sm mb-4">
              If you can't find what you're looking for, don't hesitate to reach out for support.
            </p>
            <div className="flex space-x-3">
              <Button
                onClick={() => router.push('/help/contact')}
                variant="ghost"
                className="flex-1"
              >
                Contact Support
              </Button>
              <Button
                onClick={() => router.push('/help/report')}
                variant="ghost"
                className="flex-1"
              >
                Report Issue
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}