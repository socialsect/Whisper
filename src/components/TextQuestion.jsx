import { useState } from 'react';
import styles from './TextQuestion.module.css';

const TextQuestion = ({ question, value, onChange, error }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setIsExpanded(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!value || value.trim() === '') {
      setIsExpanded(false);
    }
  };

  const characterCount = value ? value.length : 0;
  const maxLength = question.id === 'full_review' ? 2000 : 1000;
  const isNearLimit = characterCount > maxLength * 0.8;

  return (
    <div className={styles.textQuestion}>
      <label className={styles.questionLabel}>
        {question.question}
        {question.required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.textareaContainer}>
        <textarea
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${styles.textarea} ${isExpanded ? styles.expanded : ''} ${error ? styles.error : ''} ${question.id === 'full_review' ? styles.fullReview : ''}`}
          placeholder={isExpanded ? (question.id === 'full_review' ? "Share your comprehensive review..." : "Share your thoughts...") : "Click to expand and share your feedback..."}
          maxLength={maxLength}
          rows={isExpanded ? (question.id === 'full_review' ? 6 : 4) : 1}
        />
        
        <div className={styles.textareaFooter}>
          <div className={styles.characterCount}>
            <span className={isNearLimit ? styles.nearLimit : ''}>
              {characterCount}/{maxLength}
            </span>
          </div>
          
          {!isExpanded && !isFocused && (
            <button
              type="button"
              className={styles.expandButton}
              onClick={() => setIsExpanded(true)}
            >
              Expand
            </button>
          )}
        </div>
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default TextQuestion;
