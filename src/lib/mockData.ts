import { QuizQuestion, VoiceScenario, UserProgress } from '@/types';

export const tenCodesQuestions: QuizQuestion[] = [
  {
    id: '1',
    question: 'What does "10-4" mean?',
    options: [
      { id: 'a', text: 'Message received', isCorrect: true },
      { id: 'b', text: 'Officer needs assistance', isCorrect: false },
      { id: 'c', text: 'Out of service', isCorrect: false },
      { id: 'd', text: 'Traffic stop in progress', isCorrect: false },
    ],
    explanation: '"10-4" is the most common radio code meaning acknowledgment or "received".',
    category: 'codes',
    difficulty: 'easy',
    hasAudio: true,
  },
  {
    id: '2',
    question: 'What does "10-20" mean?',
    options: [
      { id: 'a', text: 'What is your location?', isCorrect: true },
      { id: 'b', text: 'Proceed to location', isCorrect: false },
      { id: 'c', text: 'Clear to copy', isCorrect: false },
      { id: 'd', text: 'Stand by', isCorrect: false },
    ],
    explanation: '"10-20" is used to ask for or provide location information.',
    category: 'codes',
    difficulty: 'easy',
  },
  {
    id: '3',
    question: 'What does "10-33" mean?',
    options: [
      { id: 'a', text: 'Traffic stop', isCorrect: false },
      { id: 'b', text: 'Emergency traffic only', isCorrect: true },
      { id: 'c', text: 'Meal break', isCorrect: false },
      { id: 'd', text: 'Report in person', isCorrect: false },
    ],
    explanation: '"10-33" indicates emergency traffic only - all non-emergency communications should cease.',
    category: 'codes',
    difficulty: 'medium',
  },
  {
    id: '4',
    question: 'What does "10-99" mean?',
    options: [
      { id: 'a', text: 'Officer down', isCorrect: false },
      { id: 'b', text: 'Officer needs assistance', isCorrect: false },
      { id: 'c', text: 'Officer available', isCorrect: false },
      { id: 'd', text: 'Officer wanted/stolen', isCorrect: true },
    ],
    explanation: '"10-99" typically refers to wanted or stolen, though codes can vary by department.',
    category: 'codes',
    difficulty: 'hard',
  },
  {
    id: '5',
    question: 'What does "10-8" mean?',
    options: [
      { id: 'a', text: 'Out of service', isCorrect: false },
      { id: 'b', text: 'In service/available', isCorrect: true },
      { id: 'c', text: 'On duty', isCorrect: false },
      { id: 'd', text: 'Off duty', isCorrect: false },
    ],
    explanation: '"10-8" means the officer is in service and available for calls.',
    category: 'codes',
    difficulty: 'easy',
  },
];

export const phoneticQuestions: QuizQuestion[] = [
  {
    id: '6',
    question: 'What is the phonetic alphabet for the letter "A"?',
    options: [
      { id: 'a', text: 'Alpha', isCorrect: true },
      { id: 'b', text: 'Able', isCorrect: false },
      { id: 'c', text: 'Apple', isCorrect: false },
      { id: 'd', text: 'Adam', isCorrect: false },
    ],
    explanation: 'The NATO phonetic alphabet uses "Alpha" for the letter A.',
    category: 'phonetic',
    difficulty: 'easy',
  },
  {
    id: '7',
    question: 'What is the phonetic alphabet for the letter "M"?',
    options: [
      { id: 'a', text: 'Mary', isCorrect: false },
      { id: 'b', text: 'Mike', isCorrect: true },
      { id: 'c', text: 'Metro', isCorrect: false },
      { id: 'd', text: 'Mother', isCorrect: false },
    ],
    explanation: 'The NATO phonetic alphabet uses "Mike" for the letter M.',
    category: 'phonetic',
    difficulty: 'easy',
  },
  {
    id: '8',
    question: 'Spell "CAR" using the phonetic alphabet:',
    options: [
      { id: 'a', text: 'Charlie-Alpha-Romeo', isCorrect: true },
      { id: 'b', text: 'Charlie-Adam-Romeo', isCorrect: false },
      { id: 'c', text: 'Charlie-Alpha-Robert', isCorrect: false },
      { id: 'd', text: 'Charles-Alpha-Romeo', isCorrect: false },
    ],
    explanation: 'C=Charlie, A=Alpha, R=Romeo in the NATO phonetic alphabet.',
    category: 'phonetic',
    difficulty: 'medium',
  },
];

export const voiceScenarios: VoiceScenario[] = [
  {
    id: 'v1',
    title: 'License Plate Spelling',
    instruction: 'Spell this license plate using phonetic alphabet:',
    targetText: 'ABC-123',
    expectedAnswer: 'Alpha-Bravo-Charlie dash One-Two-Three',
    category: 'phonetic',
  },
  {
    id: 'v2',
    title: 'Status Update',
    instruction: 'Report your status as available for calls:',
    targetText: '10-8',
    expectedAnswer: 'Unit 123, 10-8, available for calls',
    category: 'radio-protocol',
  },
  {
    id: 'v3',
    title: 'Location Request',
    instruction: 'Request another unit\'s location:',
    targetText: '10-20',
    expectedAnswer: 'Unit 456, what\'s your 10-20?',
    category: 'radio-protocol',
  },
];

export const mockUserProgress: UserProgress = {
  overallAccuracy: 85,
  totalCorrect: 247,
  totalTime: '15.2h',
  level: 3,
  categoryBreakdown: [
    { name: '10-Codes', accuracy: 80, color: '#1e40af' },
    { name: 'Phonetic Alphabet', accuracy: 90, color: '#10b981' },
    { name: 'Mixed Practice', accuracy: 70, color: '#f59e0b' },
  ],
  weeklyData: [
    { day: 'M', accuracy: 75 },
    { day: 'T', accuracy: 82 },
    { day: 'W', accuracy: 78 },
    { day: 'T', accuracy: 88 },
    { day: 'F', accuracy: 85 },
    { day: 'S', accuracy: 90 },
    { day: 'S', accuracy: 83 },
  ],
  recentActivity: [
    { date: 'Today', type: 'Mixed Quiz', accuracy: 85, icon: '📝' },
    { date: 'Yesterday', type: 'Phonetic Practice', accuracy: 92, icon: '🔤' },
    { date: '2 days ago', type: '10-Codes Quiz', accuracy: 78, icon: '📻' },
    { date: '3 days ago', type: 'Voice Practice', accuracy: 88, icon: '🎤' },
  ],
};

export const getAllQuestions = (): QuizQuestion[] => [
  ...tenCodesQuestions,
  ...phoneticQuestions,
];

export const getQuestionsByCategory = (category: 'codes' | 'phonetic' | 'mixed'): QuizQuestion[] => {
  if (category === 'mixed') {
    return getAllQuestions();
  }
  return getAllQuestions().filter(q => q.category === category);
};