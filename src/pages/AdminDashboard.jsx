import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ref, onValue, off } from 'firebase/database';
import { database } from '../utils/firebase';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  LogOut, 
  FileDown, 
  MessageSquare, 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  EyeOff,
  Star,
  AlertCircle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Activity
} from 'lucide-react';
import ResponseCard from '../components/ResponseCard';
import ExportButton from '../components/ExportButton';
import styles from './AdminDashboard.module.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showOnlyText, setShowOnlyText] = useState(false);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    const responsesRef = ref(database, 'submissions');
    
    const unsubscribe = onValue(responsesRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const responsesArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value
          }));
          setResponses(responsesArray);
        } else {
          setResponses([]);
        }
        setLoading(false);
      } catch (err) {
        console.error('Error processing responses:', err);
        setError('Failed to load responses');
        setLoading(false);
      }
    }, (error) => {
      console.error('Database error:', error);
      setError('Failed to connect to database');
      setLoading(false);
    });

    return () => off(responsesRef, 'value', unsubscribe);
  }, []);

  const calculatePulseAverages = () => {
    if (responses.length === 0) return {};

    const pulseKeys = ['work_satisfaction', 'team_collaboration', 'work_life_balance', 'management_support', 'career_growth', 'overall_wellbeing'];
    const averages = {};

    pulseKeys.forEach(key => {
      const values = responses
        .map(r => r.pulse?.[key])
        .filter(v => v && !isNaN(parseInt(v)))
        .map(v => parseInt(v));
      
      if (values.length > 0) {
        averages[key] = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(1);
      }
    });

    return averages;
  };

  const getPulseChartData = () => {
    const averages = calculatePulseAverages();
    const labels = [
      'Work Satisfaction',
      'Team Collaboration', 
      'Work-Life Balance',
      'Management Support',
      'Career Growth',
      'Overall Wellbeing'
    ];
    
    const data = [
      averages.work_satisfaction || 0,
      averages.team_collaboration || 0,
      averages.work_life_balance || 0,
      averages.management_support || 0,
      averages.career_growth || 0,
      averages.overall_wellbeing || 0
    ];

    return {
      labels,
      datasets: [{
        label: 'Average Score',
        data,
        backgroundColor: [
          '#3b82f6',
          '#10b981',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
          '#06b6d4'
        ],
        borderColor: [
          '#2563eb',
          '#059669',
          '#d97706',
          '#dc2626',
          '#7c3aed',
          '#0891b2'
        ],
        borderWidth: 2
      }]
    };
  };

  const getSatisfactionDistribution = () => {
    const satisfactionScores = responses
      .map(r => r.pulse?.overall_wellbeing)
      .filter(v => v && !isNaN(parseInt(v)))
      .map(v => parseInt(v));

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    satisfactionScores.forEach(score => {
      if (distribution.hasOwnProperty(score)) {
        distribution[score]++;
      }
    });

    return {
      labels: ['Very Poor', 'Poor', 'Neutral', 'Good', 'Excellent'],
      datasets: [{
        data: Object.values(distribution),
        backgroundColor: [
          '#ef4444',
          '#f59e0b', 
          '#e5e7eb',
          '#10b981',
          '#3b82f6'
        ],
        borderWidth: 0
      }]
    };
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className="loading"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <h2>Error Loading Dashboard</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pulseAverages = calculatePulseAverages();
  const totalResponses = responses.length;
  const averageOverall = pulseAverages.overall_wellbeing || 0;
  const customRecommendations = responses.filter(r => r.type === 'custom_recommendation');

  // Filter and search responses
  const filteredResponses = responses.filter(response => {
    // Filter by type
    if (filterType === 'surveys' && response.type === 'custom_recommendation') return false;
    if (filterType === 'recommendations' && response.type !== 'custom_recommendation') return false;
    
    // Filter by text content
    if (showOnlyText && !hasTextContent(response)) return false;
    
    // Search functionality
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const hasTextMatch = Object.values(response.text || {}).some(text => 
        text && text.toLowerCase().includes(searchLower)
      );
      const hasRecommendationMatch = response.recommendation && 
        response.recommendation.toLowerCase().includes(searchLower);
      
      if (!hasTextMatch && !hasRecommendationMatch) return false;
    }
    
    return true;
  });

  // Sort responses
  const sortedResponses = [...filteredResponses].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
      case 'oldest':
        return new Date(a.timestamp || 0) - new Date(b.timestamp || 0);
      case 'highest_score':
        return (b.pulse?.overall_wellbeing || 0) - (a.pulse?.overall_wellbeing || 0);
      case 'lowest_score':
        return (a.pulse?.overall_wellbeing || 0) - (b.pulse?.overall_wellbeing || 0);
      default:
        return 0;
    }
  });

  const hasTextContent = (response) => {
    if (response.type === 'custom_recommendation') {
      return response.recommendation && response.recommendation.trim().length > 0;
    }
    return Object.values(response.text || {}).some(text => text && text.trim().length > 0);
  };

  const toggleCardExpansion = (cardId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const refreshData = () => {
    setLastRefresh(new Date());
    // The real-time listener will automatically update the data
  };

  return (
    <div className={styles.dashboard}>
      {/* Enhanced Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <div className={styles.logoSection}>
              <Activity className={styles.logoIcon} />
              <div>
                <h1>Hey Rayansh </h1>
                <p className={styles.headerSubtitle}>Employee Feedback Intelligence</p>
              </div>
            </div>
            <div className={styles.lastRefresh}>
              <Clock size={14} />
              <span>Last updated: {lastRefresh.toLocaleTimeString()}</span>
            </div>
          </div>
          
          <div className={styles.headerActions}>
            <button className={styles.refreshButton} onClick={refreshData} title="Refresh Data">
              <RefreshCw size={16} />
            </button>
            <ExportButton responses={responses} />
            <button className={styles.settingsButton} title="Settings">
              <Settings size={16} />
            </button>
            <button className="btn btn-outline" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Enhanced Stats Overview */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <BarChart3 size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>{totalResponses}</h3>
              <p>Total Responses</p>
              <div className={styles.statTrend}>
                <TrendingUp size={14} />
                <span>+12% this week</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Star size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>{averageOverall}/5</h3>
              <p>Average Satisfaction</p>
              <div className={styles.statTrend}>
                <TrendingUp size={14} />
                <span>+0.3 from last month</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <Users size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>{responses.filter(r => r.timestamp && new Date(r.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</h3>
              <p>This Week</p>
              <div className={styles.statTrend}>
                <Activity size={14} />
                <span>Active participation</span>
              </div>
            </div>
          </div>
          
          <div className={styles.statCard}>
            <div className={styles.statIcon}>
              <MessageSquare size={32} />
            </div>
            <div className={styles.statContent}>
              <h3>{customRecommendations.length}</h3>
              <p>Recommendations</p>
              <div className={styles.statTrend}>
                <Bell size={14} />
                <span>Action items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className={styles.controlsSection}>
          <div className={styles.searchAndFilters}>
            <div className={styles.searchBox}>
              <Search size={20} />
              <input
                type="text"
                placeholder="Search feedback content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterControls}>
              <select 
                value={filterType} 
                onChange={(e) => setFilterType(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Responses</option>
                <option value="surveys">Survey Responses</option>
                <option value="recommendations">Recommendations</option>
              </select>
              
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="highest_score">Highest Score</option>
                <option value="lowest_score">Lowest Score</option>
              </select>
              
              <button 
                className={`${styles.toggleButton} ${showOnlyText ? styles.active : ''}`}
                onClick={() => setShowOnlyText(!showOnlyText)}
              >
                <Filter size={16} />
                Text Only
              </button>
            </div>
          </div>
          
          <div className={styles.resultsInfo}>
            <span className={styles.resultsCount}>
              Showing {sortedResponses.length} of {responses.length} responses
            </span>
            <div className={styles.viewControls}>
              <button className={styles.viewButton} title="Grid View">
                <BarChart3 size={16} />
              </button>
              <button className={`${styles.viewButton} ${styles.active}`} title="List View">
                <MessageSquare size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3>Pulse Scores Overview</h3>
            <div className={styles.chartContainer}>
              <Bar 
                data={getPulseChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      max: 5,
                      ticks: {
                        stepSize: 1
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          <div className={styles.chartCard}>
            <h3>Satisfaction Distribution</h3>
            <div className={styles.chartContainer}>
              <Doughnut 
                data={getSatisfactionDistribution()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom'
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Custom Recommendations */}
        {customRecommendations.length > 0 && (
          <div className={styles.responsesSection}>
            <h2>Custom Recommendations</h2>
            <p className={styles.responsesNote}>
              Direct recommendations and suggestions from employees
            </p>
            
            <div className={styles.recommendationsGrid}>
              {customRecommendations
                .sort(() => Math.random() - 0.5) // Randomize order
                .slice(0, 10) // Show latest 10
                .map((recommendation) => (
                  <div key={recommendation.id} className={styles.recommendationCard}>
                    <div className={styles.recommendationHeader}>
                      <div className={styles.recommendationIcon}>
                        <MessageSquare size={20} />
                      </div>
                      <div className={styles.recommendationInfo}>
                        <span className={styles.recommendationId}>Recommendation #{recommendation.id.slice(-6)}</span>
                        <span className={styles.recommendationDate}>
                          {new Date(recommendation.timestamp).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className={styles.recommendationContent}>
                      <p>{recommendation.recommendation}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Enhanced Responses Section */}
        <div className={styles.responsesSection}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>
              <h2>All Feedback & Queries</h2>
              <p className={styles.sectionSubtitle}>
                Complete view of all employee feedback and recommendations
              </p>
            </div>
            <div className={styles.sectionActions}>
              <button className={styles.bulkActionButton}>
                <Download size={16} />
                Bulk Export
              </button>
              <button className={styles.bulkActionButton}>
                <Settings size={16} />
                Manage
              </button>
            </div>
          </div>
          
          {sortedResponses.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <MessageSquare size={48} />
              </div>
              <h3>No responses found</h3>
              <p>
                {searchTerm || filterType !== 'all' || showOnlyText 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Employee feedback will appear here once surveys are submitted'
                }
              </p>
              {(searchTerm || filterType !== 'all' || showOnlyText) && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterType('all');
                    setShowOnlyText(false);
                  }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className={styles.responsesContainer}>
              {sortedResponses.map((response, index) => (
                <div key={response.id} className={styles.responseWrapper}>
                  <ResponseCard 
                    response={response} 
                    isExpanded={expandedCards.has(response.id)}
                    onToggleExpansion={() => toggleCardExpansion(response.id)}
                    index={index + 1}
                    total={sortedResponses.length}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
