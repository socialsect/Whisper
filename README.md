# Whisper - Anonymous Employee Feedback System

A modern, secure, and anonymous employee feedback system built with React, Vite, and Firebase Realtime Database.

## 🚀 Features

### For Employees
- **100% Anonymous Feedback** - No tracking, no personal data collection
- **Multi-step Survey Form** - Smooth transitions with progress indicator
- **Auto-save Functionality** - Prevents data loss during form completion
- **Mobile-responsive Design** - Works perfectly on all devices
- **Trust-building Interface** - Clear privacy messaging and security features

### For Administrators
- **Real-time Dashboard** - Live updates of feedback submissions
- **Interactive Charts** - Visual representation of pulse scores and trends
- **CSV Export** - Download all feedback data for analysis
- **Secure Authentication** - Admin-only access with Firebase Auth
- **Randomized Display** - Responses shown in random order to maintain anonymity

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: CSS Modules (no external CSS frameworks)
- **Database**: Firebase Realtime Database
- **Authentication**: Firebase Auth
- **Charts**: Chart.js + React-ChartJS-2
- **Routing**: React Router DOM

## 📋 Survey Questions

### Pulse Questions (1-5 Rating Scale)
1. Work Satisfaction
2. Team Collaboration
3. Work-Life Balance
4. Management Support
5. Career Growth Opportunities
6. Overall Wellbeing

### Text Feedback Questions
1. What is working well in our organization?
2. What areas need improvement?
3. What suggestions do you have for positive change?
4. Any additional feedback you'd like to share?
5. Is there anyone you'd like to appreciate or recognize?

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase project with Realtime Database enabled

### 1. Clone and Install
```bash
git clone <repository-url>
cd whisper
npm install
```

### 2. Firebase Configuration
1. Create a new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Realtime Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase config and create a `.env` file:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project_id-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 3. Set Up Firebase Security Rules
Deploy the security rules from `firebase-rules.json` to your Firebase project:

```bash
firebase deploy --only database
```

### 4. Create Admin User
1. Go to Firebase Console > Authentication > Users
2. Add a new user with email/password
3. Use these credentials to access the admin dashboard

### 5. Run the Application
```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

## 🔒 Security Features

### Data Protection
- **Input Sanitization** - All text inputs are sanitized before storage
- **Length Limits** - Maximum 1000 characters per text response
- **No Personal Data** - No names, emails, or identifying information collected
- **Anonymous IDs** - Random, non-sequential identifiers for responses

### Access Control
- **Write-only for Anonymous Users** - Employees can only submit feedback
- **Read-only for Authenticated Admins** - Only logged-in admins can view data
- **Secure Firebase Rules** - Database rules prevent unauthorized access

### Privacy Measures
- **No Tracking** - No cookies, analytics, or session storage
- **Random Delays** - Submission delays prevent timing attacks
- **Data Encryption** - All data encrypted in transit and at rest
- **Response Randomization** - Admin dashboard shows responses in random order

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ErrorBoundary.jsx
│   ├── ExportButton.jsx
│   ├── ProgressIndicator.jsx
│   ├── ProtectedRoute.jsx
│   ├── PulseQuestion.jsx
│   ├── ResponseCard.jsx
│   └── TextQuestion.jsx
├── contexts/           # React contexts
│   └── AuthContext.jsx
├── pages/              # Page components
│   ├── AdminDashboard.jsx
│   ├── AdminLogin.jsx
│   ├── LandingPage.jsx
│   ├── SurveyPage.jsx
│   └── ThankYouPage.jsx
├── styles/             # Global styles
├── utils/              # Utility functions
│   ├── firebase.js
│   └── security.js
├── App.jsx
└── main.jsx
```

## 🎨 Design System

### Color Palette
- **Primary Blue**: #3b82f6
- **Success Green**: #10b981
- **Warning Orange**: #f59e0b
- **Error Red**: #ef4444
- **Neutral Grays**: #f8fafc to #ffffff

### Typography
- **Font Family**: System fonts (San Francisco, Segoe UI, etc.)
- **Headings**: 600 weight, clear hierarchy
- **Body Text**: 400 weight, optimized for readability

### Components
- **Custom Form Elements** - No default browser styling
- **Smooth Animations** - Subtle hover states and transitions
- **Accessibility First** - WCAG compliant, keyboard navigation
- **Mobile-First** - Responsive design from 320px to 1920px

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Netlify
1. Build the project: `npm run build`
2. Deploy the `dist` folder to Netlify
3. Add environment variables in Netlify dashboard

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

## 📊 Admin Dashboard Features

### Real-time Statistics
- Total response count
- Average satisfaction score
- Weekly response trends

### Data Visualization
- **Bar Chart**: Pulse scores overview
- **Doughnut Chart**: Satisfaction distribution
- **Response Cards**: Individual feedback with expandable details

### Data Export
- CSV export with all response data
- Formatted for easy analysis in Excel/Google Sheets
- Includes timestamps and all survey responses

## 🔧 Customization

### Adding New Questions
1. Update `SURVEY_QUESTIONS` in `SurveyPage.jsx`
2. Add corresponding validation in `security.js`
3. Update Firebase security rules
4. Modify admin dashboard to display new data

### Styling Changes
- All styles use CSS Modules for component isolation
- Global styles in `App.css`
- Component-specific styles in `*.module.css` files

### Database Schema
```json
{
  "submissions": {
    "responseId": {
      "pulse": {
        "work_satisfaction": 1-5,
        "team_collaboration": 1-5,
        "work_life_balance": 1-5,
        "management_support": 1-5,
        "career_growth": 1-5,
        "overall_wellbeing": 1-5
      },
      "text": {
        "what_works_well": "string",
        "improvement_areas": "string",
        "suggestions": "string",
        "additional_feedback": "string",
        "appreciation": "string"
      },
      "timestamp": "ISO string",
      "anonymousId": "string",
      "version": "string"
    }
  }
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support or questions:
1. Check the documentation above
2. Review Firebase console for database issues
3. Check browser console for client-side errors
4. Create an issue in the repository

## 🔄 Version History

- **v1.0.0** - Initial release with core functionality
  - Anonymous feedback system
  - Admin dashboard with real-time updates
  - CSV export functionality
  - Mobile-responsive design
  - Security features and input validation