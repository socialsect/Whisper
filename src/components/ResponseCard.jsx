import { useState } from 'react';
import { Clock, Eye, EyeOff, Star, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import styles from './ResponseCard.module.css';

const ResponseCard = ({ response, isExpanded, onToggleExpansion, index, total }) => {
  
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPulseScore = (key) => {
    return response.pulse?.[key] || 'N/A';
  };

  const getTextResponse = (key) => {
    return response.text?.[key] || '';
  };

  // Map old question IDs to new ones for backward compatibility
  const getMappedPulseScore = (oldKey, newKey) => {
    return response.pulse?.[newKey] || response.pulse?.[oldKey] || 'N/A';
  };

  const getMappedTextResponse = (oldKey, newKey) => {
    return response.text?.[newKey] || response.text?.[oldKey] || '';
  };

  const hasTextResponses = Object.values(response.text || {}).some(text => text && text.trim().length > 0);
  const isCustomRecommendation = response.type === 'custom_recommendation';
  const overallScore = response.pulse?.wellbeing_at_work || response.pulse?.overall_wellbeing || 0;
  
  const getScoreColor = (score) => {
    if (score >= 4) return '#10b981';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const getScoreLabel = (score) => {
    if (score >= 4) return 'Excellent';
    if (score >= 3) return 'Good';
    if (score >= 2) return 'Fair';
    return 'Poor';
  };

  return (
    <div className={`${styles.responseCard} ${isExpanded ? styles.expanded : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.responseInfo}>
          <div className={styles.responseMeta}>
            <span className={styles.responseId}>
              {isCustomRecommendation ? 'Recommendation' : 'Response'} #{response.id.slice(-6)}
            </span>
            <span className={styles.responseIndex}>{index} of {total}</span>
          </div>
          <div className={styles.responseDetails}>
            <span className={styles.responseDate}>
              <Clock size={12} />
              {formatDate(response.timestamp)}
            </span>
            {!isCustomRecommendation && overallScore > 0 && (
              <div className={styles.scoreBadge} style={{ backgroundColor: getScoreColor(overallScore) }}>
                {overallScore}/5 - {getScoreLabel(overallScore)}
              </div>
            )}
          </div>
        </div>
        <div className={styles.cardActions}>
          <button 
            className={styles.expandButton}
            onClick={onToggleExpansion}
          >
            {isExpanded ? <EyeOff size={16} /> : <Eye size={16} />}
            {isExpanded ? 'Collapse' : 'View Details'}
          </button>
        </div>
      </div>

      <div className={styles.pulseScores}>
        <div className={styles.scoreGrid}>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Clarity of Role</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('work_satisfaction', 'clarity_of_role')}/5</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Team Collaboration</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('team_collaboration', 'collaboration_team_flow')}/5</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Work-Life Balance</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('work_life_balance', 'balance_energy')}/5</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Leadership Support</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('management_support', 'leadership_support')}/5</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Career Growth</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('career_growth', 'growth_future')}/5</span>
          </div>
          <div className={styles.scoreItem}>
            <span className={styles.scoreLabel}>Overall Wellbeing</span>
            <span className={styles.scoreValue}>{getMappedPulseScore('overall_wellbeing', 'wellbeing_at_work')}/5</span>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.textResponses}>
          {isCustomRecommendation ? (
            <div className={styles.recommendationContent}>
              <h4>
                <MessageSquare size={20} />
                Custom Recommendation
              </h4>
              <div className={styles.recommendationText}>
                <p>{response.recommendation}</p>
              </div>
            </div>
          ) : (
            <>
              <h4>
                <Star size={20} />
                Detailed Feedback
              </h4>
              <div className={styles.textSections}>
                {getMappedTextResponse('what_works_well', 'what_works_well') && (
                  <div className={styles.textSection}>
                    <h5>
                      <CheckCircle size={16} />
                      What's Working Well
                    </h5>
                    <p>{getMappedTextResponse('what_works_well', 'what_works_well')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('what_slowing_down', 'what_slowing_down') && (
                  <div className={styles.textSection}>
                    <h5>
                      <AlertCircle size={16} />
                      What's Slowing Us Down
                    </h5>
                    <p>{getMappedTextResponse('what_slowing_down', 'what_slowing_down')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('leadership_perspective', 'leadership_perspective') && (
                  <div className={styles.textSection}>
                    <h5>
                      <Star size={16} />
                      Leadership Perspective
                    </h5>
                    <p>{getMappedTextResponse('leadership_perspective', 'leadership_perspective')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('team_perspective', 'team_perspective') && (
                  <div className={styles.textSection}>
                    <h5>
                      <MessageSquare size={16} />
                      Team Perspective
                    </h5>
                    <p>{getMappedTextResponse('team_perspective', 'team_perspective')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('one_change_tomorrow', 'one_change_tomorrow') && (
                  <div className={styles.textSection}>
                    <h5>
                      <AlertCircle size={16} />
                      One Change Tomorrow
                    </h5>
                    <p>{getMappedTextResponse('one_change_tomorrow', 'one_change_tomorrow')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('anything_else', 'anything_else') && (
                  <div className={styles.textSection}>
                    <h5>
                      <MessageSquare size={16} />
                      Additional Thoughts
                    </h5>
                    <p>{getMappedTextResponse('anything_else', 'anything_else')}</p>
                  </div>
                )}
                
                {getMappedTextResponse('recognition', 'recognition') && (
                  <div className={styles.textSection}>
                    <h5>
                      <Star size={16} />
                      Recognition & Appreciation
                    </h5>
                    <p>{getMappedTextResponse('recognition', 'recognition')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ResponseCard;
