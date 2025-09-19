import { useState } from 'react';
import { FileDown } from 'lucide-react';
import styles from './ExportButton.module.css';

const ExportButton = ({ responses }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);
    
    try {
      // Prepare CSV data
      const csvData = responses.map(response => {
        if (response.type === 'custom_recommendation') {
          return {
            'Response ID': response.id,
            'Type': 'Custom Recommendation',
            'Timestamp': response.timestamp ? new Date(response.timestamp).toISOString() : '',
            'Recommendation': response.recommendation || '',
            'Work Satisfaction': '',
            'Team Collaboration': '',
            'Work-Life Balance': '',
            'Management Support': '',
            'Career Growth': '',
            'Overall Wellbeing': '',
            'What Works Well': '',
            'Improvement Areas': '',
            'Suggestions': '',
            'Full Review': '',
            'Additional Feedback': '',
            'Appreciation': ''
          };
        } else {
          return {
            'Response ID': response.id,
            'Type': 'Survey Response',
            'Timestamp': response.timestamp ? new Date(response.timestamp).toISOString() : '',
            'Recommendation': '',
            'Work Satisfaction': response.pulse?.work_satisfaction || '',
            'Team Collaboration': response.pulse?.team_collaboration || '',
            'Work-Life Balance': response.pulse?.work_life_balance || '',
            'Management Support': response.pulse?.management_support || '',
            'Career Growth': response.pulse?.career_growth || '',
            'Overall Wellbeing': response.pulse?.overall_wellbeing || '',
            'What Works Well': response.text?.what_works_well || '',
            'Improvement Areas': response.text?.improvement_areas || '',
            'Suggestions': response.text?.suggestions || '',
            'Full Review': response.text?.full_review || '',
            'Additional Feedback': response.text?.additional_feedback || '',
            'Appreciation': response.text?.appreciation || ''
          };
        }
      });

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header] || '';
            // Escape quotes and wrap in quotes if contains comma, quote, or newline
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `whisper-feedback-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  if (responses.length === 0) {
    return (
      <button className="btn btn-secondary" disabled>
        No Data to Export
      </button>
    );
  }

  return (
    <button 
      className={`btn btn-outline ${styles.exportButton}`}
      onClick={exportToCSV}
      disabled={isExporting}
    >
      {isExporting ? (
        <>
          <span className="loading"></span>
          Exporting...
        </>
      ) : (
        <>
          <FileDown className={styles.exportIcon} size={16} />
          Export CSV ({responses.length} responses)
        </>
      )}
    </button>
  );
};

export default ExportButton;
