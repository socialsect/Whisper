import { Link } from 'react-router-dom';
import { Shield, Zap, Target, CheckCircle } from 'lucide-react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
  return (
    <div className={styles.landingPage}>
      <div className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              <span className={styles.whisper}>Whisper</span>
              <span className={styles.subtitle}>Every Voice Shapes Socialsect</span>
            </h1>
            
            <p className={styles.description}>
              Your honest feedback drives a stronger, safer team. 100% anonymous, always.
            </p>

            <div className={styles.topCtaSection}>
              <Link to="/survey" className={`btn btn-primary ${styles.ctaButton}`}>
                Start Your Feedback
              </Link>
              <p className={styles.ctaNote}>
                We never track IP, email, or device info.
              </p>
            </div>

            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.icon}>
                  <Shield size={40} />
                </div>
                <h3>100% Anonymous</h3>
                <p>Your responses are completely anonymous. We don't track who you are.</p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.icon}>
                  <Zap size={40} />
                </div>
                <h3>Fast & Effortless</h3>
                <p>Complete the survey in just 5 minutes. Your time is valuable.</p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.icon}>
                  <Target size={40} />
                </div>
                <h3>Real Impact</h3>
                <p>Your feedback directly influences positive changes in our workplace.</p>
              </div>
            </div>

            <div className={styles.trustSection}>
              <h2>Your Privacy is Protected</h2>
              <div className={styles.privacyFeatures}>
                <div className={styles.privacyItem}>
                  <CheckCircle className={styles.checkmark} size={20} />
                  <span>No personal information collected</span>
                </div>
                <div className={styles.privacyItem}>
                  <CheckCircle className={styles.checkmark} size={20} />
                  <span>No tracking cookies or analytics</span>
                </div>
                <div className={styles.privacyItem}>
                  <CheckCircle className={styles.checkmark} size={20} />
                  <span>We mix responses so no one can be traced.</span>
                </div>
                <div className={styles.privacyItem}>
                  <CheckCircle className={styles.checkmark} size={20} />
                  <span>Data is securely encrypted</span>
                </div>
              </div>
            </div>

            <div className={styles.ctaSection}>
              <Link to="/survey" className={`btn btn-primary ${styles.ctaButton}`}>
                Start Your Feedback
              </Link>
              <p className={styles.ctaNote}>
                Takes about 5 minutes • Completely anonymous • Helps improve our workplace
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.container}>
          <p className={styles.footerText}>
            Have questions? Ask leadership directly — nothing is tracked here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
