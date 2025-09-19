import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { database } from '../utils/firebase';
import { sanitizeInput, validatePulseScore, validateTextResponse, validateFullReview, addRandomDelay, generateAnonymousId } from '../utils/security';
import { MessageSquare, X, Flame } from 'lucide-react';
import ProgressIndicator from '../components/ProgressIndicator';
import PulseQuestion from '../components/PulseQuestion';
import TextQuestion from '../components/TextQuestion';
import styles from './SurveyPage.module.css';

const SURVEY_QUESTIONS = {
  pulse: [
    { id: 'clarity_of_role', question: 'I have clarity about what\'s expected of me in my role.', required: true },
    { id: 'collaboration_team_flow', question: 'Our team collaborates effectively and supports each other.', required: true },
    { id: 'balance_energy', question: 'I\'m able to maintain a healthy balance between work and life.', required: true },
    { id: 'leadership_support', question: 'Leadership/management gives me the backing I need to succeed.', required: true },
    { id: 'growth_future', question: 'I see opportunities to grow and advance at Socialsect.', required: true },
    { id: 'wellbeing_at_work', question: 'I feel good about my overall wellbeing as part of this team.', required: true }
  ],
  text: [
    { id: 'what_works_well', question: 'What\'s working well at Socialsect right now?\n(What should we double down on — systems, habits, or people that make the team stronger?)', required: true },
    { id: 'what_slowing_down', question: 'What\'s slowing us down or creating friction?\n(Processes, tools, culture, or leadership — where do you feel drag?)', required: true },
    { id: 'leadership_perspective', question: 'Your Perspective on Leadership\n(How do you feel about the way Rayansh and Aakash  lead? What\'s strong, what\'s weak, what should evolve?)', required: true },
    { id: 'team_perspective', question: 'Your Perspective on the Team\n(Do you want to share anything about a teammate — positive or negative? Think honesty, not politics.)', required: false },
    { id: 'one_change_tomorrow', question: 'If you could change one thing tomorrow, what would it be?\n(Big or small — what shift would instantly improve your experience here?)', required: true },
    { id: 'anything_else', question: 'Anything else you want leadership to know?\n(Uncensored space — if it\'s on your mind, write it down.)', required: false },
    { id: 'recognition', question: 'Recognition\n(Is there anyone on the team you\'d like to call out for doing great work?)', required: false }
  ]
};

const SurveyPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    pulse: {},
    text: {}
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [showCustomRecommendation, setShowCustomRecommendation] = useState(false);
  const [customRecommendation, setCustomRecommendation] = useState('');
  const [isSubmittingCustom, setIsSubmittingCustom] = useState(false);

  const totalSteps = 3; // Pulse questions, Text questions, Review
  const currentStepNumber = currentStep + 1;

  // Auto-save functionality
  useEffect(() => {
    const autoSave = () => {
      const hasData = Object.keys(formData.pulse).length > 0 || Object.keys(formData.text).length > 0;
      if (hasData) {
        localStorage.setItem('whisper_survey_draft', JSON.stringify(formData));
        setAutoSaveStatus('Draft saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      }
    };

    const timeoutId = setTimeout(autoSave, 2000);
    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('whisper_survey_draft');
    if (savedDraft) {
      try {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, []);

  const handlePulseChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      pulse: { ...prev.pulse, [questionId]: value }
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const handleTextChange = (questionId, value) => {
    setFormData(prev => ({
      ...prev,
      text: { ...prev.text, [questionId]: value }
    }));
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    if (currentStep === 0) {
      // Validate pulse questions
      SURVEY_QUESTIONS.pulse.forEach(({ id, required }) => {
        if (required && (!formData.pulse[id] || !validatePulseScore(formData.pulse[id]))) {
          newErrors[id] = 'Please select a rating from 1 to 5';
        }
      });
    } else if (currentStep === 1) {
      // Validate text questions
      SURVEY_QUESTIONS.text.forEach(({ id, required }) => {
        if (required && (!formData.text[id] || !validateTextResponse(formData.text[id]))) {
          newErrors[id] = 'Please provide at least 10 characters of feedback';
        } else if (id === 'full_review' && formData.text[id] && !validateFullReview(formData.text[id])) {
          newErrors[id] = 'Full review must be between 10 and 2000 characters';
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    
    try {
      // Add random delay for security
      await addRandomDelay();

      // Sanitize all text responses
      const sanitizedData = {
        ...formData,
        text: Object.fromEntries(
          Object.entries(formData.text).map(([key, value]) => [
            key, 
            value ? sanitizeInput(value) : ''
          ])
        )
      };

      // Prepare submission data
      const submissionData = {
        ...sanitizedData,
        timestamp: new Date().toISOString(),
        anonymousId: generateAnonymousId(),
        version: '1.0'
      };

      // Submit to Firebase
      const submissionsRef = ref(database, 'submissions');
      await push(submissionsRef, submissionData);

      // Clear draft and navigate to thank you page
      localStorage.removeItem('whisper_survey_draft');
      navigate('/thank-you');
      
    } catch (error) {
      console.error('Error submitting survey:', error);
      setErrors({ submit: 'Failed to submit survey. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomRecommendationSubmit = async () => {
    if (!customRecommendation.trim()) return;

    setIsSubmittingCustom(true);
    
    try {
      // Add random delay for security
      await addRandomDelay();

      // Prepare custom recommendation data
      const customData = {
        type: 'custom_recommendation',
        recommendation: sanitizeInput(customRecommendation, 2000),
        timestamp: new Date().toISOString(),
        anonymousId: generateAnonymousId(),
        version: '1.0'
      };

      // Submit to Firebase
      const submissionsRef = ref(database, 'submissions');
      await push(submissionsRef, customData);

      // Reset form and close modal
      setCustomRecommendation('');
      setShowCustomRecommendation(false);
      
      // Show success message
      setAutoSaveStatus('Custom recommendation submitted successfully!');
      setTimeout(() => setAutoSaveStatus(''), 3000);
      
    } catch (error) {
      console.error('Error submitting custom recommendation:', error);
      setAutoSaveStatus('Failed to submit recommendation. Please try again.');
      setTimeout(() => setAutoSaveStatus(''), 3000);
    } finally {
      setIsSubmittingCustom(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.stepContent}>
            <h2>
              <Flame size={24} className={styles.headerIcon} />
              Check the Pulse of Socialsect
            </h2>
            <p className={styles.stepDescription}>
              These quick ratings give us the signal of how strong or weak our system is right now. Answer instinctively — there are no wrong answers.
            </p>
            <div className={styles.questions}>
              {SURVEY_QUESTIONS.pulse.map((question) => (
                <PulseQuestion
                  key={question.id}
                  question={question}
                  value={formData.pulse[question.id] || ''}
                  onChange={(value) => handlePulseChange(question.id, value)}
                  error={errors[question.id]}
                />
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>Your Honest Take</h2>
            <p className={styles.stepDescription}>
              This is where we get real. Share what's working, what's not, and what needs to change. Your perspective drives our evolution.
            </p>
            <div className={styles.questions}>
              {SURVEY_QUESTIONS.text.map((question) => (
                <TextQuestion
                  key={question.id}
                  question={question}
                  value={formData.text[question.id] || ''}
                  onChange={(value) => handleTextChange(question.id, value)}
                  error={errors[question.id]}
                />
              ))}
            </div>
            
            <div className={styles.trustMicrocopy}>
              <p>This is anonymous. Be honest — whether it's about me as founder, another teammate, or how we run Socialsect. We want the truth, not filtered answers.</p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>Review Your Feedback</h2>
            <p className={styles.stepDescription}>
              Please review your responses before submitting. Remember, your feedback is completely anonymous.
            </p>
            <div className={styles.reviewSection}>
              <div className={styles.reviewGroup}>
                <h3>Pulse Ratings</h3>
                {SURVEY_QUESTIONS.pulse.map((question) => (
                  <div key={question.id} className={styles.reviewItem}>
                    <span className={styles.reviewQuestion}>{question.question}</span>
                    <span className={styles.reviewAnswer}>
                      {formData.pulse[question.id] ? `${formData.pulse[question.id]}/5` : 'Not answered'}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className={styles.reviewGroup}>
                <h3>Text Feedback</h3>
                {SURVEY_QUESTIONS.text.map((question) => (
                  formData.text[question.id] && (
                    <div key={question.id} className={styles.reviewItem}>
                      <span className={styles.reviewQuestion}>{question.question}</span>
                      <p className={styles.reviewTextAnswer}>{formData.text[question.id]}</p>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.surveyPage}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1>Employee Feedback Survey</h1>
          <p className={styles.subtitle}>
            Your anonymous feedback helps us create a better workplace for everyone.
          </p>
        </div>

        <div className={styles.surveyCard}>
          <ProgressIndicator 
            currentStep={currentStepNumber} 
            totalSteps={totalSteps}
            className={styles.progress}
          />

          {autoSaveStatus && (
            <div className={styles.autoSaveStatus}>
              {autoSaveStatus}
            </div>
          )}

          {renderStep()}

          {errors.submit && (
            <div className={styles.errorMessage}>
              {errors.submit}
            </div>
          )}

          <div className={styles.navigation}>
            {currentStep > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}
            
            <div className={styles.navigationRight}>
              {currentStep < totalSteps - 1 ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleNext}
                  disabled={isSubmitting}
                >
                  Next
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Custom Recommendation Button */}
      <button 
        className={styles.floatingButton}
        onClick={() => setShowCustomRecommendation(true)}
        title="Add Custom Recommendation"
      >
        <MessageSquare size={20} />
        <span>Custom Recommendation</span>
      </button>

      {/* Custom Recommendation Modal */}
      {showCustomRecommendation && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Add Custom Recommendation</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowCustomRecommendation(false)}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className={styles.modalContent}>
              <p className={styles.modalDescription}>
                Share any specific recommendations, suggestions, or feedback you'd like to provide.
              </p>
              
              <textarea
                value={customRecommendation}
                onChange={(e) => setCustomRecommendation(e.target.value)}
                className={styles.modalTextarea}
                placeholder="Enter your custom recommendation or feedback..."
                maxLength={2000}
                rows={6}
              />
              
              <div className={styles.modalFooter}>
                <div className={styles.characterCount}>
                  {customRecommendation.length}/2000 characters
                </div>
                
                <div className={styles.modalActions}>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowCustomRecommendation(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleCustomRecommendationSubmit}
                    disabled={!customRecommendation.trim() || isSubmittingCustom}
                  >
                    {isSubmittingCustom ? (
                      <>
                        <span className="loading"></span>
                        Submitting...
                      </>
                    ) : (
                      'Submit Recommendation'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyPage;
