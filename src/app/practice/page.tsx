'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  RadioIcon, 
  ChatBubbleBottomCenterTextIcon,
  TrophyIcon,
  MicrophoneIcon
} from '@heroicons/react/24/outline';

export default function PracticePage() {
  const router = useRouter();
  const { isAuthenticated, setActiveTab } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    
    // Set the active tab to practice when this page loads
    setActiveTab('practice');
  }, [isAuthenticated, router, setActiveTab]);

  if (!isAuthenticated) {
    return null;
  }

  const practiceOptions = [
    {
      id: 'codes',
      title: '10-Codes Quiz',
      description: 'Master essential radio codes',
      features: ['15 min sessions', 'Adaptive difficulty'],
      icon: RadioIcon,
      href: '/practice/codes',
      color: 'primary',
    },
    {
      id: 'phonetic',
      title: 'Phonetic Alphabet',
      description: 'Practice letter pronunciation',
      features: ['Voice recognition', 'Real scenarios'],
      icon: ChatBubbleBottomCenterTextIcon,
      href: '/practice/phonetic',
      color: 'success',
    },
    {
      id: 'mixed',
      title: 'Mixed Practice',
      description: 'Combined quiz types',
      features: ['Adaptive learning', 'Optimized for retention'],
      icon: TrophyIcon,
      href: '/practice/mixed',
      color: 'warning',
    },
    {
      id: 'voice',
      title: 'Voice Practice',
      description: 'Simulate radio communication',
      features: ['Real scenarios', 'Pronunciation feedback'],
      icon: MicrophoneIcon,
      href: '/practice/voice',
      color: 'info',
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      primary: 'bg-primary-50 border-primary-200 text-primary-800',
      success: 'bg-success-50 border-success-200 text-success-800',
      warning: 'bg-warning-50 border-warning-200 text-warning-800',
      info: 'bg-info-50 border-info-200 text-info-800',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  const getIconColorClasses = (color: string) => {
    const colorMap = {
      primary: 'text-primary-600',
      success: 'text-success-600',
      warning: 'text-warning-600',
      info: 'text-info-600',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <Layout 
      headerProps={{
        title: 'Practice',
        showBack: true,
        onBack: () => router.push('/dashboard'),
      }}
    >
      <div className="p-4 space-y-6">
        {practiceOptions.map((option) => {
          const Icon = option.icon;
          
          return (
            <Card 
              key={option.id} 
              variant="interactive" 
              padding="lg"
              className="transition-transform duration-200 hover:scale-[1.01]"
            >
              <CardContent>
                <div className={`inline-flex p-3 rounded-lg mb-4 ${getColorClasses(option.color)}`}>
                  <Icon className={`w-6 h-6 ${getIconColorClasses(option.color)}`} />
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
                
                <ul className="space-y-1 mb-6">
                  {option.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-center">
                      <span className="w-1 h-1 bg-gray-400 rounded-full mr-2"></span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link href={option.href}>
                  <Button className="w-full">
                    {option.id === 'voice' ? 'Start Voice' : 
                     option.id === 'mixed' ? 'Start Mixed' : 
                     `Start ${option.id === 'codes' ? 'Quiz' : 'Practice'}`}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </Layout>
  );
}