import styles from './ProgressIndicator.module.css';

const ProgressIndicator = ({ currentStep, totalSteps, className = '' }) => {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={`${styles.progressIndicator} ${className}`}>
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <div className={styles.stepInfo}>
        <span className={styles.currentStep}>Step {currentStep}</span>
        <span className={styles.totalSteps}>of {totalSteps}</span>
      </div>
    </div>
  );
};

export default ProgressIndicator;
