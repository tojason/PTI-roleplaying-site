'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  ChatBubbleLeftRightIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function ContactSupportPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAppStore();
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    message: '',
    priority: 'normal',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      // In a real app, this would send the support ticket to your backend
      console.log('Support ticket submitted:', {
        ...formData,
        user: user?.name,
        department: user?.department,
        timestamp: new Date().toISOString(),
      });
      
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const handleReset = () => {
    setFormData({
      subject: '',
      category: 'general',
      message: '',
      priority: 'normal',
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
          title: 'Contact Support',
          showBack: true,
          onBack: () => router.push('/help'),
        }}
      >
        <div className="p-4 space-y-6">
          <Card padding="lg" className="text-center">
            <CardContent>
              <CheckCircleIcon className="w-16 h-16 text-success-600 mx-auto mb-4" />
              <CardTitle className="mb-4 text-success-900">Message Sent Successfully!</CardTitle>
              <p className="text-gray-600 mb-6">
                Thank you for contacting us. We've received your message and will respond within 24 hours during business days.
              </p>
              <div className="space-y-3">
                <Button onClick={handleReset} className="w-full">
                  Send Another Message
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
        title: 'Contact Support',
        showBack: true,
        onBack: () => router.push('/help'),
      }}
    >
      <div className="p-4 space-y-6">
        {/* Header */}
        <Card padding="lg" className="text-center">
          <CardContent>
            <ChatBubbleLeftRightIcon className="w-12 h-12 text-primary-600 mx-auto mb-4" />
            <CardTitle className="mb-2">Get Help</CardTitle>
            <p className="text-gray-600 text-sm">
              Our support team is here to help you with any questions or issues.
            </p>
          </CardContent>
        </Card>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card padding="md" className="text-center">
            <CardContent>
              <PhoneIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 mb-1">Phone</p>
              <p className="text-sm text-gray-600 mb-2">1-800-POLICE-1</p>
              <p className="text-xs text-gray-500">Mon-Fri 8AM-6PM EST</p>
            </CardContent>
          </Card>

          <Card padding="md" className="text-center">
            <CardContent>
              <EnvelopeIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 mb-1">Email</p>
              <p className="text-sm text-gray-600 mb-2">support@policetraining.app</p>
              <p className="text-xs text-gray-500">Response within 24hrs</p>
            </CardContent>
          </Card>

          <Card padding="md" className="text-center">
            <CardContent>
              <ClockIcon className="w-8 h-8 text-primary-600 mx-auto mb-2" />
              <p className="font-semibold text-gray-900 mb-1">Live Chat</p>
              <p className="text-sm text-gray-600 mb-2">Coming Soon</p>
              <p className="text-xs text-gray-500">Real-time support</p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-4">Send us a Message</CardTitle>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User Info Display */}
              <div className="bg-gray-50 p-3 rounded-lg text-sm">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Department:</strong> {user?.department}</p>
                <p><strong>Badge:</strong> {user?.pid}</p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="general">General Question</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Problem</option>
                  <option value="training">Training Content</option>
                  <option value="voice">Voice Recognition</option>
                  <option value="performance">Performance Issues</option>
                  <option value="feedback">Feedback/Suggestion</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="low">Low - General inquiry</option>
                  <option value="normal">Normal - Standard support</option>
                  <option value="high">High - Urgent issue</option>
                  <option value="critical">Critical - System down</option>
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Please provide as much detail as possible about your question or issue..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Include details like: What were you trying to do? What happened? Any error messages?
                </p>
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
                    Sending Message...
                  </>
                ) : (
                  'Send Message'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Quick Links */}
        <Card padding="lg">
          <CardContent>
            <CardTitle className="mb-3">Common Questions</CardTitle>
            <div className="space-y-2">
              {[
                'How do I improve voice recognition accuracy?',
                'Why can\'t I hear audio in quizzes?',
                'How do I reset my progress?',
                'Can I practice offline?',
                'How do I change my department?'
              ].map((question, index) => (
                <button
                  key={index}
                  onClick={() => router.push('/help/guide')}
                  className="w-full text-left p-2 text-sm text-gray-700 hover:bg-gray-50 rounded transition-colors"
                >
                  • {question}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}