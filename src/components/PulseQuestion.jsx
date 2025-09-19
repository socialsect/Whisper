import styles from './PulseQuestion.module.css';

const PulseQuestion = ({ question, value, onChange, error }) => {
  const handleChange = (e) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.pulseQuestion}>
      <label className={styles.questionLabel}>
        {question.question}
        {question.required && <span className={styles.required}>*</span>}
      </label>
      
      <div className={styles.ratingContainer}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className={styles.ratingOption}>
            <input
              type="radio"
              name={question.id}
              value={rating}
              checked={value === rating.toString()}
              onChange={handleChange}
              className={styles.ratingInput}
            />
            <span className={styles.ratingLabel}>
              <span className={styles.ratingNumber}>{rating}</span>
              <span className={styles.ratingText}>
                {rating === 1 && 'Strongly Disagree'}
                {rating === 2 && 'Disagree'}
                {rating === 3 && 'Neutral'}
                {rating === 4 && 'Agree'}
                {rating === 5 && 'Strongly Agree'}
              </span>
            </span>
          </label>
        ))}
      </div>
      
      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}
    </div>
  );
};

export default PulseQuestion;
