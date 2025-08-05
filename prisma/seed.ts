import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Seed phonetic alphabet
  console.log('Seeding phonetic alphabet...')
  const phoneticAlphabet = [
    { letter: 'A', phoneticWord: 'Alpha', pronunciation: 'AL-fah' },
    { letter: 'B', phoneticWord: 'Bravo', pronunciation: 'BRAH-voh' },
    { letter: 'C', phoneticWord: 'Charlie', pronunciation: 'CHAR-lee' },
    { letter: 'D', phoneticWord: 'Delta', pronunciation: 'DELL-tah' },
    { letter: 'E', phoneticWord: 'Echo', pronunciation: 'ECK-oh' },
    { letter: 'F', phoneticWord: 'Foxtrot', pronunciation: 'FOKS-trot' },
    { letter: 'G', phoneticWord: 'Golf', pronunciation: 'GOLF' },
    { letter: 'H', phoneticWord: 'Hotel', pronunciation: 'hoh-TELL' },
    { letter: 'I', phoneticWord: 'India', pronunciation: 'IN-dee-ah' },
    { letter: 'J', phoneticWord: 'Juliet', pronunciation: 'JEW-lee-ETT' },
    { letter: 'K', phoneticWord: 'Kilo', pronunciation: 'KEE-loh' },
    { letter: 'L', phoneticWord: 'Lima', pronunciation: 'LEE-mah' },
    { letter: 'M', phoneticWord: 'Mike', pronunciation: 'MIKE' },
    { letter: 'N', phoneticWord: 'November', pronunciation: 'no-VEM-ber' },
    { letter: 'O', phoneticWord: 'Oscar', pronunciation: 'OSS-cah' },
    { letter: 'P', phoneticWord: 'Papa', pronunciation: 'pah-PAH' },
    { letter: 'Q', phoneticWord: 'Quebec', pronunciation: 'keh-BECK' },
    { letter: 'R', phoneticWord: 'Romeo', pronunciation: 'ROW-me-oh' },
    { letter: 'S', phoneticWord: 'Sierra', pronunciation: 'see-AIR-rah' },
    { letter: 'T', phoneticWord: 'Tango', pronunciation: 'TANG-go' },
    { letter: 'U', phoneticWord: 'Uniform', pronunciation: 'YOU-nee-form' },
    { letter: 'V', phoneticWord: 'Victor', pronunciation: 'VIK-tah' },
    { letter: 'W', phoneticWord: 'Whiskey', pronunciation: 'WISS-key' },
    { letter: 'X', phoneticWord: 'X-ray', pronunciation: 'ECKS-ray' },
    { letter: 'Y', phoneticWord: 'Yankee', pronunciation: 'YANG-key' },
    { letter: 'Z', phoneticWord: 'Zulu', pronunciation: 'ZOO-loh' },
  ]

  for (const item of phoneticAlphabet) {
    await prisma.phoneticAlphabet.upsert({
      where: { letter: item.letter },
      update: item,
      create: item,
    })
  }

  // Seed 10-codes
  console.log('Seeding 10-codes...')
  const tenCodes = [
    { code: '10-1', meaning: 'Receiving Poorly', category: 'radio', isCommon: true },
    { code: '10-2', meaning: 'Receiving Well', category: 'radio', isCommon: true },
    { code: '10-3', meaning: 'Stop Transmitting', category: 'radio', isCommon: true },
    { code: '10-4', meaning: 'Acknowledged', category: 'radio', isCommon: true },
    { code: '10-5', meaning: 'Relay', category: 'radio', isCommon: false },
    { code: '10-6', meaning: 'Busy', category: 'radio', isCommon: true },
    { code: '10-7', meaning: 'Out of Service', category: 'status', isCommon: true },
    { code: '10-8', meaning: 'In Service', category: 'status', isCommon: true },
    { code: '10-9', meaning: 'Repeat', category: 'radio', isCommon: true },
    { code: '10-10', meaning: 'Fight in Progress', category: 'emergency', isCommon: false },
    { code: '10-11', meaning: 'Dog Case', category: 'incident', isCommon: false },
    { code: '10-12', meaning: 'Stand By', category: 'radio', isCommon: true },
    { code: '10-13', meaning: 'Weather/Road Conditions', category: 'information', isCommon: false },
    { code: '10-14', meaning: 'Prowler Report', category: 'incident', isCommon: false },
    { code: '10-15', meaning: 'Civil Disturbance', category: 'emergency', isCommon: false },
    { code: '10-16', meaning: 'Domestic Problem', category: 'incident', isCommon: true },
    { code: '10-17', meaning: 'Meet Complainant', category: 'administrative', isCommon: false },
    { code: '10-18', meaning: 'Complete Assignment Quickly', category: 'administrative', isCommon: false },
    { code: '10-19', meaning: 'Return to Station', category: 'administrative', isCommon: true },
    { code: '10-20', meaning: 'Location', category: 'information', isCommon: true },
    { code: '10-21', meaning: 'Call by Telephone', category: 'administrative', isCommon: true },
    { code: '10-22', meaning: 'Disregard', category: 'radio', isCommon: true },
    { code: '10-23', meaning: 'Arrived at Scene', category: 'status', isCommon: true },
    { code: '10-24', meaning: 'Assignment Completed', category: 'status', isCommon: true },
    { code: '10-25', meaning: 'Report in Person', category: 'administrative', isCommon: false },
    { code: '10-26', meaning: 'Detaining Subject', category: 'status', isCommon: true },
    { code: '10-27', meaning: "Driver's License Information", category: 'information', isCommon: false },
    { code: '10-28', meaning: 'Vehicle Registration Information', category: 'information', isCommon: false },
    { code: '10-29', meaning: 'Check for Wanted', category: 'information', isCommon: true },
    { code: '10-30', meaning: 'Illegal Use of Radio', category: 'radio', isCommon: false },
    { code: '10-31', meaning: 'Crime in Progress', category: 'emergency', isCommon: true },
    { code: '10-32', meaning: 'Man with Gun', category: 'emergency', isCommon: true },
    { code: '10-33', meaning: 'Emergency', category: 'emergency', isCommon: true },
    { code: '10-34', meaning: 'Riot', category: 'emergency', isCommon: false },
    { code: '10-35', meaning: 'Major Crime Alert', category: 'emergency', isCommon: false },
    { code: '10-36', meaning: 'Correct Time', category: 'information', isCommon: false },
    { code: '10-37', meaning: 'Investigate Suspicious Vehicle', category: 'incident', isCommon: true },
    { code: '10-38', meaning: 'Stopping Suspicious Vehicle', category: 'traffic', isCommon: true },
    { code: '10-39', meaning: 'Urgent - Use Light, Siren', category: 'emergency', isCommon: false },
    { code: '10-40', meaning: 'Silent Run - No Light, Siren', category: 'tactical', isCommon: false },
    { code: '10-41', meaning: 'Beginning Tour of Duty', category: 'status', isCommon: true },
    { code: '10-42', meaning: 'Ending Tour of Duty', category: 'status', isCommon: true },
    { code: '10-43', meaning: 'Information', category: 'information', isCommon: false },
    { code: '10-44', meaning: 'Permission to Leave Patrol', category: 'administrative', isCommon: false },
    { code: '10-45', meaning: 'Dead Body', category: 'incident', isCommon: false },
    { code: '10-46', meaning: 'Assist Motorist', category: 'service', isCommon: false },
    { code: '10-47', meaning: 'Emergency Road Repair', category: 'service', isCommon: false },
    { code: '10-48', meaning: 'Traffic Standard Repair', category: 'service', isCommon: false },
    { code: '10-49', meaning: 'Traffic Light Out', category: 'service', isCommon: false },
    { code: '10-50', meaning: 'Accident', category: 'traffic', isCommon: true },
    { code: '10-51', meaning: 'Wrecker Needed', category: 'service', isCommon: false },
    { code: '10-52', meaning: 'Ambulance Needed', category: 'emergency', isCommon: true },
    { code: '10-53', meaning: 'Road Blocked', category: 'traffic', isCommon: false },
    { code: '10-54', meaning: 'Livestock on Highway', category: 'traffic', isCommon: false },
    { code: '10-55', meaning: 'Intoxicated Driver', category: 'traffic', isCommon: true },
    { code: '10-56', meaning: 'Intoxicated Pedestrian', category: 'incident', isCommon: false },
    { code: '10-57', meaning: 'Hit and Run', category: 'traffic', isCommon: true },
    { code: '10-58', meaning: 'Direct Traffic', category: 'traffic', isCommon: false },
    { code: '10-59', meaning: 'Convoy or Escort', category: 'service', isCommon: false },
    { code: '10-60', meaning: 'Squad in Vicinity', category: 'information', isCommon: false }
  ]

  for (const code of tenCodes) {
    await prisma.tenCode.upsert({
      where: { code: code.code },
      update: code,
      create: code,
    })
  }

  // Seed quiz questions for 10-codes
  console.log('Seeding quiz questions for 10-codes...')
  const codeQuestions = [
    {
      category: 'CODES_10' as const,
      difficulty: 'EASY' as const,
      question: 'What does 10-4 mean?',
      options: ['Acknowledged', 'Busy', 'Out of Service', 'Emergency'],
      correctAnswer: 'Acknowledged',
      explanation: '10-4 is the most common police code meaning "Acknowledged" or "Message received and understood"',
      tags: ['common', 'basic']
    },
    {
      category: 'CODES_10' as const,
      difficulty: 'EASY' as const,
      question: 'What code means "Emergency"?',
      options: ['10-31', '10-33', '10-32', '10-30'],
      correctAnswer: '10-33',
      explanation: '10-33 is the emergency code that requires immediate attention',
      tags: ['emergency', 'priority']
    },
    {
      category: 'CODES_10' as const,
      difficulty: 'MEDIUM' as const,
      question: 'What does 10-20 mean?',
      options: ['Return to Station', 'Location', 'Stand By', 'Repeat'],
      correctAnswer: 'Location',
      explanation: '10-20 is used to request or provide location information',
      tags: ['location', 'information']
    },
    {
      category: 'CODES_10' as const,
      difficulty: 'MEDIUM' as const,
      question: 'Which code means "Man with Gun"?',
      options: ['10-31', '10-32', '10-33', '10-34'],
      correctAnswer: '10-32',
      explanation: '10-32 indicates a person with a firearm, requiring immediate response',
      tags: ['emergency', 'weapon']
    },
    {
      category: 'CODES_10' as const,
      difficulty: 'HARD' as const,
      question: 'What does 10-57 mean?',
      options: ['Intoxicated Driver', 'Hit and Run', 'Road Blocked', 'Direct Traffic'],
      correctAnswer: 'Hit and Run',
      explanation: '10-57 is the code for hit and run incidents',
      tags: ['traffic', 'incident']
    }
  ]

  for (const question of codeQuestions) {
    await prisma.quizQuestion.create({
      data: question
    })
  }

  // Seed quiz questions for phonetic alphabet
  console.log('Seeding quiz questions for phonetic alphabet...')
  const phoneticQuestions = [
    {
      category: 'PHONETIC_ALPHABET' as const,
      difficulty: 'EASY' as const,
      question: 'What is the phonetic word for the letter "A"?',
      options: ['Alpha', 'Apple', 'Able', 'Adam'],
      correctAnswer: 'Alpha',
      explanation: 'Alpha is the NATO phonetic alphabet word for the letter A',
      tags: ['nato', 'basic']
    },
    {
      category: 'PHONETIC_ALPHABET' as const,
      difficulty: 'EASY' as const,
      question: 'What letter does "Bravo" represent?',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',
      explanation: 'Bravo represents the letter B in the NATO phonetic alphabet',
      tags: ['nato', 'basic']
    },
    {
      category: 'PHONETIC_ALPHABET' as const,
      difficulty: 'MEDIUM' as const,
      question: 'What is the phonetic word for "M"?',
      options: ['Mike', 'Mary', 'Metro', 'Mark'],
      correctAnswer: 'Mike',
      explanation: 'Mike is the NATO phonetic alphabet word for the letter M',
      tags: ['nato', 'intermediate']
    },
    {
      category: 'PHONETIC_ALPHABET' as const,
      difficulty: 'MEDIUM' as const,
      question: 'Which letter does "Whiskey" represent?',
      options: ['V', 'W', 'X', 'Y'],
      correctAnswer: 'W',
      explanation: 'Whiskey represents the letter W in the NATO phonetic alphabet',
      tags: ['nato', 'intermediate']
    },
    {
      category: 'PHONETIC_ALPHABET' as const,
      difficulty: 'HARD' as const,
      question: 'What is the phonetic word for "Q"?',
      options: ['Queen', 'Quebec', 'Quiver', 'Quick'],
      correctAnswer: 'Quebec',
      explanation: 'Quebec is the NATO phonetic alphabet word for the letter Q',
      tags: ['nato', 'advanced']
    }
  ]

  for (const question of phoneticQuestions) {
    await prisma.quizQuestion.create({
      data: question
    })
  }

  // Seed voice scenarios
  console.log('Seeding voice scenarios...')
  const voiceScenarios = [
    {
      title: 'Basic Alpha-Bravo-Charlie',
      instruction: 'Pronounce the first three letters of the phonetic alphabet clearly',
      targetText: 'Alpha Bravo Charlie',
      expectedAnswer: 'Alpha Bravo Charlie',
      category: 'PHONETIC' as const,
      difficulty: 'EASY' as const,
      tags: ['basic', 'alphabet'],
      estimatedDuration: 15
    },
    {
      title: 'License Plate Spelling',
      instruction: 'Spell out this license plate using phonetic alphabet: ABC123',
      targetText: 'ABC123',
      expectedAnswer: 'Alpha Bravo Charlie One Two Three',
      category: 'PHONETIC' as const,
      difficulty: 'MEDIUM' as const,
      tags: ['license', 'mixed'],
      estimatedDuration: 25
    },
    {
      title: 'Emergency Response Code',
      instruction: 'Clearly state "10-33" for emergency response',
      targetText: '10-33',
      expectedAnswer: 'Ten Thirty-Three',
      category: 'CODES' as const,
      difficulty: 'EASY' as const,
      tags: ['emergency', 'priority'],
      estimatedDuration: 10
    },
    {
      title: 'Traffic Stop Protocol',
      instruction: 'Request backup using proper radio protocol',
      targetText: 'Unit 123 requesting backup at 10-20',
      expectedAnswer: 'Unit One Two Three requesting backup at Ten Twenty',
      category: 'RADIO_PROTOCOL' as const,
      difficulty: 'MEDIUM' as const,
      tags: ['backup', 'location'],
      estimatedDuration: 20
    },
    {
      title: 'Complete Phonetic Sequence',
      instruction: 'Recite the full phonetic alphabet from A to Z',
      targetText: 'A through Z phonetic alphabet',
      expectedAnswer: 'Alpha Bravo Charlie Delta Echo Foxtrot Golf Hotel India Juliet Kilo Lima Mike November Oscar Papa Quebec Romeo Sierra Tango Uniform Victor Whiskey X-ray Yankee Zulu',
      category: 'PHONETIC' as const,
      difficulty: 'HARD' as const,
      tags: ['complete', 'advanced'],
      estimatedDuration: 60
    }
  ]

  for (const scenario of voiceScenarios) {
    await prisma.voiceScenario.create({
      data: scenario
    })
  }

  // Seed achievements
  console.log('Seeding achievements...')
  const achievements = [
    {
      name: 'first_quiz',
      title: 'First Steps',
      description: 'Complete your first quiz',
      category: 'quiz',
      icon: '🎯',
      badgeColor: '#10B981',
      criteria: { type: 'quiz_completed', count: 1 },
      points: 10
    },
    {
      name: 'quiz_streak_7',
      title: 'Week Warrior',
      description: 'Complete quizzes for 7 days in a row',
      category: 'streak',
      icon: '🔥',
      badgeColor: '#F59E0B',
      criteria: { type: 'daily_streak', count: 7, activity: 'quiz' },
      points: 50
    },
    {
      name: 'perfect_score',
      title: 'Perfect Score',
      description: 'Score 100% on any quiz',
      category: 'accuracy',
      icon: '⭐',
      badgeColor: '#EF4444',
      criteria: { type: 'accuracy_score', score: 100, activity: 'quiz' },
      points: 25
    },
    {
      name: 'voice_master',
      title: 'Voice Master',
      description: 'Complete 50 voice practice sessions',
      category: 'voice',
      icon: '🎤',
      badgeColor: '#8B5CF6',
      criteria: { type: 'voice_sessions', count: 50 },
      points: 100
    },
    {
      name: 'phonetic_expert',
      title: 'Phonetic Expert',
      description: 'Achieve 95% accuracy in phonetic alphabet practice',
      category: 'voice',
      icon: '📢',
      badgeColor: '#06B6D4',
      criteria: { type: 'category_accuracy', category: 'PHONETIC', score: 95 },
      points: 75
    },
    {
      name: 'code_master',
      title: '10-Code Master',
      description: 'Perfect score on 10 different 10-code quizzes',
      category: 'quiz',
      icon: '🚔',
      badgeColor: '#1E40AF',
      criteria: { type: 'perfect_quizzes', category: 'CODES_10', count: 10 },
      points: 150
    }
  ]

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { name: achievement.name },
      update: achievement,
      create: achievement
    })
  }

  // Create demo admin user (optional)
  console.log('Creating demo admin user...')
  const adminPassword = await hash('admin123!', 12)
  
  await prisma.user.upsert({
    where: { email: 'admin@policetraining.local' },
    update: {},
    create: {
      email: 'admin@policetraining.local',
      password: adminPassword,
      name: 'Admin User',
      pid: 'ADMIN001',
      badgeNumber: 'ADMIN001',
      department: 'Administration',
      rank: 'Administrator',
      role: 'ADMIN',
      isActive: true
    }
  })

  // Create demo instructor user
  console.log('Creating demo instructor user...')
  const instructorPassword = await hash('instructor123!', 12)
  
  await prisma.user.upsert({
    where: { email: 'instructor@policetraining.local' },
    update: {},
    create: {
      email: 'instructor@policetraining.local',
      password: instructorPassword,
      name: 'John Instructor',
      pid: 'INST001',
      badgeNumber: 'INST001',
      department: 'Training Division',
      rank: 'Sergeant',
      role: 'INSTRUCTOR',
      isActive: true
    }
  })

  console.log('Database seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })