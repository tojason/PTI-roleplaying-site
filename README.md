# 🚔 Police Training App

A comprehensive, mobile-first training application designed for law enforcement officers to practice and master essential radio communication skills including 10-codes, phonetic alphabet, and voice protocols.

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-336791)

## 🎯 Features

### 🔐 **Authentication & User Management**
- **Police ID (PID) based authentication** - Officers login with their unique Police ID
- **Secure session management** with NextAuth.js
- **Role-based access control** (User, Instructor, Admin)
- **User profiles** with department information and experience levels
- **Remember me** functionality with secure credential storage

### 📚 **Training Modules**
- **10-Codes Quiz** - Interactive practice for 50+ essential police radio codes
- **Phonetic Alphabet Quiz** - Master NATO phonetic alphabet (A-Z)
- **Mixed Practice Mode** - Combined training sessions mixing both modules
- **Voice Practice** - Real-time speech recognition for pronunciation training
- **Progressive difficulty** with adaptive learning algorithms

### 🎤 **Voice Recognition System**
- **Web Speech API integration** for real-time voice recognition
- **Advanced accuracy scoring** with 80-85% accuracy thresholds
- **Professional pronunciation feedback** and coaching
- **Cross-browser compatibility** with fallback support
- **Microphone permission management**

### 📱 **Mobile-First Design**
- **Responsive interface** optimized for phones and tablets
- **Touch-friendly controls** with 44px minimum touch targets
- **Professional police aesthetic** with law enforcement color schemes
- **Offline capability** for quiz modules
- **Progressive Web App** features

### 📊 **Progress Tracking & Analytics**
- **Learning streaks** and daily practice goals
- **Visual progress charts** and performance statistics
- **Achievement system** with unlockable badges
- **Department leaderboards** and peer comparisons
- **Comprehensive session history** and analytics

### 🎓 **Interactive Onboarding Tutorial System**
- **6-step guided tutorial** with beautiful animations and transitions
- **Smart onboarding flow** that auto-triggers for first-time users
- **Progress tracking** with visual indicators and completion states
- **Mobile-responsive tooltips** with intelligent positioning
- **Skip and restart options** for flexible user experience
- **Persistent tutorial state** across browser sessions

### 🔔 **Interactive Features**
- **Real-time notifications** for achievements and reminders
- **User menu system** with profile access and settings
- **Navigation system** with intuitive bottom navigation
- **Help and support** system with troubleshooting guides

## 🏗️ Technical Architecture

### **Frontend Stack**
- **Next.js 14** with App Router for modern React development
- **TypeScript 5** for type safety and better developer experience
- **Tailwind CSS 3.4** with custom police training design system
- **Framer Motion** for smooth animations, transitions, and tutorial system
- **Zustand** for state management with persistence and tutorial state
- **Heroicons** for consistent iconography
- **Custom Hook System** for tutorial management and browser storage

### **Backend & Database**
- **Next.js API Routes** for RESTful backend services
- **PostgreSQL** database with Prisma ORM
- **NextAuth.js** for authentication with JWT tokens
- **Zod** for runtime type validation and API security
- **bcryptjs** for secure password hashing

### **Voice & Audio**
- **Web Speech API** for real-time speech recognition
- **Custom speech accuracy algorithms** for pronunciation scoring
- **Audio recording capabilities** with browser compatibility checks
- **Advanced voice feedback systems**

## 📁 Project Structure

```
police-training-app/
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── api/               # Backend API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── quiz/          # Quiz management
│   │   │   ├── voice/         # Voice practice APIs
│   │   │   ├── progress/      # Progress tracking
│   │   │   └── user/          # User management
│   │   ├── dashboard/         # Main dashboard page
│   │   ├── practice/          # Training modules
│   │   │   ├── codes/         # 10-codes practice
│   │   │   ├── phonetic/      # Phonetic alphabet
│   │   │   ├── mixed/         # Mixed practice mode
│   │   │   └── voice/         # Voice practice
│   │   ├── login/             # Authentication pages
│   │   ├── register/          
│   │   ├── profile/           # User profile management
│   │   ├── progress/          # Progress tracking page
│   │   └── notifications/     # Notification center
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # Reusable UI components
│   │   └── auth/             # Authentication components
│   ├── lib/                  # Utilities and configurations
│   │   ├── auth.ts           # NextAuth configuration
│   │   ├── db.ts             # Database connection
│   │   ├── utils.ts          # Utility functions
│   │   └── mockData.ts       # Sample data
│   ├── hooks/                # Custom React hooks
│   │   ├── useLocalStorage.ts # Browser storage management
│   │   └── useTutorial.ts     # Tutorial state management
│   ├── services/             # Business logic services
│   │   ├── speechRecognition.ts
│   │   ├── speechAccuracy.ts
│   │   └── tutorialService.ts # Tutorial logic and positioning
│   ├── store/                # Zustand state management
│   │   └── tutorialStore.ts   # Tutorial state persistence
│   └── types/                # TypeScript type definitions
│       └── tutorial.ts       # Tutorial-specific types
├── prisma/                   # Database schema and migrations
│   ├── schema.prisma         # Database schema
│   └── migrations/           # Database migrations
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (local or cloud)
- Modern web browser with microphone support

### 1. Clone and Install
```bash
git clone <repository-url>
cd police-training-app
npm install
```

### 2. Environment Setup
Create a `.env` file with the required environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/police_training_db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"
```

### 3. Database Setup

#### Option A: Using Supabase (Recommended)
1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the PostgreSQL connection string
4. Update `DATABASE_URL` in your `.env` file

#### Option B: Local PostgreSQL
```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb police_training_db

# Set password
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your-password';"
```

### 4. Initialize Database
```bash
# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma db push

# Seed with sample data (optional)
npx prisma db seed
```

### 5. Start Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### 6. Create Your First Account
1. Go to `/register`
2. Fill in:
   - **Full Name**: Your name
   - **Police ID (PID)**: Your unique police identifier
   - **Password**: Secure password
3. Click "Create Account"
4. You'll be automatically logged in and redirected to the dashboard

## 📱 Usage Guide

### **Getting Started with the Tutorial**
- **First-time users** automatically see the 6-step onboarding tutorial
- **Interactive guidance** shows you how to navigate the app
- **Beautiful animations** make learning engaging and memorable
- **Skip anytime** if you're already familiar with the interface
- **Restart tutorial** from Settings → Help → Restart Tutorial

### **Dashboard**
- View your learning progress and stats
- Access quick practice sessions
- Check recent achievements
- See daily streak information

### **Practice Modes**
- **10-Codes**: Learn essential police radio codes with interactive quizzes
- **Phonetic Alphabet**: Master NATO phonetic alphabet pronunciation
- **Voice Practice**: Use speech recognition to practice communication
- **Mixed Practice**: Combined sessions for comprehensive training

### **Voice Features**
- Click "Allow" when prompted for microphone access
- Speak clearly into your device's microphone
- Receive real-time pronunciation feedback
- View accuracy scores and improvement suggestions

### **Progress Tracking**
- Monitor daily practice streaks
- View detailed performance analytics
- Track improvement over time
- Compare with department peers

## 🛠️ Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run database migrations
npm run db:deploy       # Deploy migrations to production
npm run db:seed         # Seed database with sample data
npm run db:reset        # Reset database (development only)
npm run db:studio       # Open Prisma Studio GUI

# Tutorial System
npm run tutorial:debug   # Enable tutorial debugging mode
npm run tutorial:reset   # Reset tutorial state for testing
```

## 🧪 Development Tools & Debugging

### **Tutorial Debugging System**
Comprehensive debugging tools for the tutorial system:

- **TutorialDebugger Component**: Real-time state monitoring with browser storage inspection
- **TutorialDemo Component**: Manual tutorial testing with step navigation controls
- **Advanced Logging**: Detailed console logs for tutorial flow and state changes
- **Browser Storage Tools**: localStorage and sessionStorage debugging utilities
- **Visual Indicators**: Debug overlays showing tutorial positioning and state

### **Debug Console Commands**
```javascript
// Reset tutorial state
localStorage.removeItem('hasSeenTutorial')

// Enable debug mode
localStorage.setItem('tutorialDebug', 'true')

// View current tutorial state
console.log(JSON.parse(localStorage.getItem('tutorialState') || '{}'))

// Force tutorial restart
window.location.reload()
```

### **Agent Collaboration Methodology**
This project uses a systematic multi-agent approach:

- **ux-researcher**: User experience analysis and flow optimization
- **ui-designer**: Visual design, animations, and mobile responsiveness
- **frontend-developer**: Implementation, debugging tools, and technical solutions
- **Systematic workflow**: Research → Design → Develop → Test → Iterate
- **Agent-driven problem solving**: Each agent contributes specialized expertise

## 🔧 Configuration

### **Voice Recognition Settings**
- **Language**: English (US) by default
- **Accuracy Threshold**: 80% for passing scores
- **Timeout**: 10 seconds for voice input
- **Retry Attempts**: 3 attempts per question

### **Tutorial System Settings**
- **Auto-trigger**: First-time users see tutorial automatically
- **Completion tracking**: Persistent state across browser sessions
- **Animation duration**: 300-500ms for smooth transitions
- **Mobile positioning**: Intelligent tooltip placement avoiding screen edges
- **Debug mode**: Toggle with localStorage flag for development

### **Quiz Settings**
- **Question Count**: 20 questions per session
- **Time Limit**: No time limit (self-paced)
- **Passing Score**: 70% for completion
- **Randomization**: Questions shuffled each session

### **Security Features**
- Rate limiting on authentication endpoints
- CORS protection for API routes
- XSS protection with secure headers
- SQL injection prevention with Prisma ORM
- Secure password hashing with bcryptjs

## 🚀 Deployment

### **Vercel Deployment (Recommended)**
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### **Database Setup for Production**
- Use managed PostgreSQL (Supabase, Railway, PlanetScale)
- Set up SSL/TLS connections
- Configure backup and monitoring

### **Environment Variables for Production**
```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="secure-random-secret-for-production"
```

## 📊 Performance & Browser Support

### **Performance Targets**
- **First Contentful Paint**: < 1.8s
- **Time to Interactive**: < 3.9s
- **Cumulative Layout Shift**: < 0.1
- **Bundle Size**: < 200KB gzipped

### **Browser Compatibility**
- Chrome 80+ (recommended for voice features)
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile browsers with microphone support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:
- Check the in-app Help section
- Review troubleshooting guides
- Contact your IT department for technical issues
- Report bugs through GitHub issues

## 💡 Development Insights & Lessons Learned

### **Technical Decisions**
- **Framer Motion** chosen for tutorial animations due to React integration and performance
- **Browser localStorage** for tutorial state persistence without backend complexity
- **Custom positioning system** to handle mobile viewport challenges
- **Zustand integration** for seamless state management across components

### **UI/UX Solutions Implemented**
- **Smart tooltip positioning** that adapts to screen edges and mobile viewports
- **Progressive disclosure** showing one tutorial step at a time
- **Visual hierarchy** using blur overlays and focused highlighting
- **Consistent animation timing** for professional feel

### **Debugging Innovations**
- **Real-time state monitoring** with live localStorage inspection
- **Manual step navigation** for efficient testing workflows
- **Comprehensive logging** for production troubleshooting
- **Visual debug indicators** for development efficiency

## 🏁 Project Status

✅ **Production Ready** - Full-featured police training application with comprehensive onboarding system, ready for deployment and use by law enforcement officers.

### **Recent Major Additions**
- ✅ Interactive 6-step onboarding tutorial system
- ✅ Comprehensive debugging and testing tools
- ✅ Mobile-responsive tutorial positioning
- ✅ Agent collaboration methodology implemented
- ✅ Advanced state management and persistence

---

**Built with ❤️ for law enforcement professionals**

*Helping officers master critical communication skills through modern, mobile-first learning technology with guided onboarding.*