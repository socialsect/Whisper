import { Link } from 'react-router-dom';
import { CheckCircle, Shield, BarChart3, Clock, Lock, TrendingUp, FileText, Check } from 'lucide-react';
import styles from './ThankYouPage.module.css';

const ThankYouPage = () => {
  return (
    <div className={styles.thankYouPage}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.icon}>
            <CheckCircle size={40} />
          </div>
          
          <h1 className={styles.title}>
            <Check size={32} className={styles.titleIcon} />
            Thank you for being real.
          </h1>
          
          <p className={styles.message}>
            Your feedback has been submitted anonymously. Nothing here is tracked back to you. What you just shared will directly shape how we improve Socialsect — as a system, as a team, and as leadership.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Shield size={32} />
              </div>
              <h3>100% Anonymous</h3>
              <p>Your words are never traced. We strip out all signals and only keep the raw feedback.</p>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <BarChart3 size={32} />
              </div>
              <h3>We Act, Not Archive</h3>
              <p>Every theme is reviewed and turned into clear actions — not just notes on a page.</p>
            </div>
            
            <div className={styles.feature}>
              <div className={styles.featureIcon}>
                <Clock size={32} />
              </div>
              <h3>Shared Back With You</h3>
              <p>We'll publish what we change (and what we don't) so you know this loop is real.</p>
            </div>
          </div>
          
          <div className={styles.nextSteps}>
            <h2>What happens next?</h2>
            <ul className={styles.stepsList}>
              <li><FileText className={styles.stepIcon} size={16} />Your feedback is added to our anonymous feedback vault.</li>
              <li><TrendingUp className={styles.stepIcon} size={16} />Leadership reviews patterns — not individuals.</li>
              <li><BarChart3 className={styles.stepIcon} size={16} />Action steps are created and assigned.</li>
              <li><Clock className={styles.stepIcon} size={16} />Progress is shared back with the team in a "You Said → We Did" update.</li>
            </ul>
          </div>
          
          <div className={styles.actions}>
            <Link to="/" className="btn btn-primary">
              Return Home
            </Link>
            <p className={styles.closingLine}>
              This is not HR. This is us building a stronger Socialsect together. Thank you for trusting the system enough to be honest.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThankYouPage;
