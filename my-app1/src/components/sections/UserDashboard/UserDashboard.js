import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './UserDashboard.module.scss';

const UserDashboard = ({ userName = 'User' }) => {
  const { notifications } = useNotifications();
  const [height, setHeight] = useState(() => {
    return localStorage.getItem(`bmi-height-${userName}`) || '';
  });
  const [weight, setWeight] = useState(() => {
    return localStorage.getItem(`bmi-weight-${userName}`) || '';
  });
  const [bmi, setBmi] = useState(() => {
    return localStorage.getItem(`bmi-value-${userName}`) || null;
  });
  const [bmiCategory, setBmiCategory] = useState(() => {
    return localStorage.getItem(`bmi-category-${userName}`) || '';
  });
  const [userActivities, setUserActivities] = useState([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

  const calculateBMI = () => {
    if (height && weight) {
      const heightInMeters = parseFloat(height) / 100; // Convert cm to meters
      const weightInKg = parseFloat(weight);
      const calculatedBMI = weightInKg / (heightInMeters * heightInMeters);
      const bmiValue = calculatedBMI.toFixed(1);
      
      setBmi(bmiValue);
      
      // Determine BMI category
      let category;
      if (calculatedBMI < 18.5) {
        category = 'Underweight';
      } else if (calculatedBMI >= 18.5 && calculatedBMI < 25) {
        category = 'Normal weight';
      } else if (calculatedBMI >= 25 && calculatedBMI < 30) {
        category = 'Overweight';
      } else {
        category = 'Obese';
      }
      setBmiCategory(category);

      // Save to localStorage
      localStorage.setItem(`bmi-height-${userName}`, height);
      localStorage.setItem(`bmi-weight-${userName}`, weight);
      localStorage.setItem(`bmi-value-${userName}`, bmiValue);
      localStorage.setItem(`bmi-category-${userName}`, category);

      // Add BMI calculation to activities
      const bmiActivity = {
        id: `bmi-${Date.now()}`,
        type: 'bmi',
        action: 'BMI Calculated',
        description: `Calculated BMI: ${bmiValue} (${category})`,
        timestamp: new Date().toLocaleString(),
        icon: '⚖️',
        color: '#f59e0b'
      };
      
      setUserActivities(prev => [bmiActivity, ...prev.slice(0, 4)]);
    }
  };

  const resetCalculator = () => {
    setHeight('');
    setWeight('');
    setBmi(null);
    setBmiCategory('');
    
    // Clear from localStorage
    localStorage.removeItem(`bmi-height-${userName}`);
    localStorage.removeItem(`bmi-weight-${userName}`);
    localStorage.removeItem(`bmi-value-${userName}`);
    localStorage.removeItem(`bmi-category-${userName}`);
  };

  const clearAllActivities = () => {
    if (window.confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
      setUserActivities([]);
      localStorage.removeItem(`user-activities-${userName}`);
      setShowAllActivities(false); // Reset to default view
    }
  };

  // Clean up duplicate activities from localStorage
  const cleanupDuplicateActivities = () => {
    const savedActivities = JSON.parse(localStorage.getItem(`user-activities-${userName}`) || '[]');
    const uniqueActivities = [];
    const seenIds = new Set();
    
    savedActivities.forEach(activity => {
      if (!seenIds.has(activity.id)) {
        uniqueActivities.push(activity);
        seenIds.add(activity.id);
      }
    });
    
    if (uniqueActivities.length !== savedActivities.length) {
      localStorage.setItem(`user-activities-${userName}`, JSON.stringify(uniqueActivities));
    }
  };

  const getBMIColor = () => {
    if (!bmi) return '#6b7280';
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return '#3b82f6'; // Blue for underweight
    if (bmiValue < 25) return '#10b981'; // Green for normal
    if (bmiValue < 30) return '#f59e0b'; // Yellow for overweight
    return '#ef4444'; // Red for obese
  };

  const getHealthTips = (bmiValue, category) => {
    // Return an array of objects with text and icons based on BMI category
    if (!bmiValue) return [];
    switch (category) {
      case 'Underweight':
        return [
          { text: 'Increase calorie intake with nutrient-dense foods (nuts, avocados, dairy).', icon: '🥜', color: '#f59e0b' },
          { text: 'Eat small, frequent meals and include protein with each meal.', icon: '🍽️', color: '#10b981' },
          { text: 'Consider resistance training to build healthy muscle mass.', icon: '💪', color: '#3b82f6' },
          { text: 'Consult a healthcare provider or dietitian if unexplained weight loss occurs.', icon: '👩‍⚕️', color: '#ef4444' }
        ];
      case 'Normal weight':
        return [
          { text: 'Maintain a balanced diet rich in vegetables, lean protein and whole grains.', icon: '🥗', color: '#10b981' },
          { text: 'Aim for at least 150 minutes of moderate exercise per week.', icon: '🏃‍♀️', color: '#3b82f6' },
          { text: 'Keep hydrated and prioritise sleep for recovery and metabolism.', icon: '💧', color: '#06b6d4' },
          { text: 'Continue regular health check-ups and maintain current habits.', icon: '✅', color: '#10b981' }
        ];
      case 'Overweight':
        return [
          { text: 'Reduce portion sizes and limit processed/high-sugar foods.', icon: '🍎', color: '#10b981' },
          { text: 'Increase daily physical activity (brisk walking, cycling, swimming).', icon: '🚴‍♀️', color: '#3b82f6' },
          { text: 'Incorporate strength training twice a week to improve body composition.', icon: '🏋️‍♀️', color: '#8b5cf6' },
          { text: 'Set gradual goals (0.5-1 kg/month) and track progress.', icon: '📊', color: '#f59e0b' }
        ];
      case 'Obese':
        return [
          { text: 'Consult a healthcare professional for personalised advice and screening.', icon: '👨‍⚕️', color: '#ef4444' },
          { text: 'Adopt a structured weight-loss plan with diet and exercise supervision.', icon: '📋', color: '#3b82f6' },
          { text: 'Address other risk factors (blood pressure, blood sugar, lipids) with your doctor.', icon: '🩺', color: '#f59e0b' },
          { text: 'Seek support from a dietitian or a supervised program for sustainable change.', icon: '🤝', color: '#10b981' }
        ];
      default:
        return [];
    }
  };

  // Generate user activities based on notifications and persisted data
  useEffect(() => {
    const generateUserActivities = () => {
      const activities = [];
      const seenActivities = new Set(); // Track seen activities to prevent duplicates
      
      // Add activities from notifications (with deduplication)
      notifications.forEach(notification => {
        if (notification.category === 'profile') {
          const activityId = `profile-${notification.id}`;
          if (!seenActivities.has(activityId)) {
            activities.push({
              id: activityId,
              type: 'profile',
              action: 'Profile Updated',
              description: 'Your personal information has been updated',
              timestamp: notification.timestamp,
              icon: '👤',
              color: '#10b981'
            });
            seenActivities.add(activityId);
          }
        } else if (notification.category === 'medical-record') {
          const activityId = `medical-${notification.id}`;
          if (!seenActivities.has(activityId)) {
            activities.push({
              id: activityId,
              type: 'medical',
              action: 'Medical Record Created',
              description: 'A new medical record has been added to your history',
              timestamp: notification.timestamp,
              icon: '📋',
              color: '#3b82f6'
            });
            seenActivities.add(activityId);
          }
        } else if (notification.category === 'patient' && notification.type === 'deletion_request_received') {
          const activityId = `deletion-${notification.id}`;
          if (!seenActivities.has(activityId)) {
            activities.push({
              id: activityId,
              type: 'deletion',
              action: 'Deletion Request Received',
              description: 'You have received a deletion request for your medical record',
              timestamp: notification.timestamp,
              icon: '⚠️',
              color: '#f59e0b'
            });
            seenActivities.add(activityId);
          }
        } else if (notification.category === 'patient' && (notification.type === 'deletion_request_approved' || notification.type === 'deletion_request_rejected')) {
          const activityId = `deletion-response-${notification.id}`;
          if (!seenActivities.has(activityId)) {
            const isApproved = notification.type === 'deletion_request_approved';
            activities.push({
              id: activityId,
              type: 'deletion',
              action: `Deletion Request ${isApproved ? 'Approved' : 'Rejected'}`,
              description: `Your medical record deletion request has been ${isApproved ? 'approved' : 'rejected'}`,
              timestamp: notification.timestamp,
              icon: isApproved ? '✅' : '❌',
              color: isApproved ? '#10b981' : '#ef4444'
            });
            seenActivities.add(activityId);
          }
        }
      });

      // Add persisted BMI activities from localStorage (with deduplication)
      const savedActivities = JSON.parse(localStorage.getItem(`user-activities-${userName}`) || '[]');
      savedActivities.forEach(activity => {
        if (!seenActivities.has(activity.id)) {
          activities.push(activity);
          seenActivities.add(activity.id);
        }
      });

      // Sort activities by timestamp and limit to 3 for display
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      setUserActivities(sortedActivities);
    };

    // Clean up any existing duplicates first
    cleanupDuplicateActivities();
    generateUserActivities();
  }, [notifications, userName]);

  // Save activities to localStorage when they change
  useEffect(() => {
    if (userActivities.length > 0) {
      localStorage.setItem(`user-activities-${userName}`, JSON.stringify(userActivities));
    }
  }, [userActivities, userName]);

  return (
    <div className={styles.userDashboard}>
      <div className={styles.welcomeMessage}>
        <h1>Welcome {userName}!</h1>
      </div>
      
      <div className={styles.dashboardLayout}>
        {/* Top Row: BMI Calculator and Health Tips */}
        <div className={styles.topRow}>
          {/* BMI Calculator Card */}
          <div className={styles.bmiCalculatorCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>BMI Calculator</h3>
              <p className={styles.cardSubtitle}>Calculate your Body Mass Index</p>
            </div>
            
            <div className={styles.bmiForm}>
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Height (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="Enter height in cm"
                  className={styles.bmiInput}
                  min="100"
                  max="250"
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.inputLabel}>Weight (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight in kg"
                  className={styles.bmiInput}
                  min="30"
                  max="300"
                />
              </div>
              
              <div className={styles.buttonGroup}>
                <button 
                  onClick={calculateBMI}
                  className={styles.calculateButton}
                  disabled={!height || !weight}
                >
                  Calculate BMI
                </button>
                <button 
                  onClick={resetCalculator}
                  className={styles.resetButton}
                >
                  Reset
                </button>
              </div>
              
              {bmi && (
                <div className={styles.bmiResult}>
                  <div className={styles.bmiValue} style={{ color: getBMIColor() }}>
                    {bmi}
                  </div>
                  <div className={styles.bmiCategory} style={{ color: getBMIColor() }}>
                    {bmiCategory}
                  </div>
                  <div className={styles.bmiDescription}>
                    {bmiCategory === 'Underweight' && 'Consider consulting a healthcare provider for nutritional guidance.'}
                    {bmiCategory === 'Normal weight' && 'Great! You are in a healthy weight range.'}
                    {bmiCategory === 'Overweight' && 'Consider maintaining a balanced diet and regular exercise.'}
                    {bmiCategory === 'Obese' && 'Please consult a healthcare provider for personalized guidance.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Health Tips Card */}
          <div className={styles.healthTipsCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Health Tips</h3>
              <p className={styles.cardSubtitle}>Personalised tips based on your BMI</p>
            </div>
            <div className={styles.tipsBody}>
              {!bmi ? (
                <div className={styles.noData}>
                  <p>Calculate your BMI to see personalised health tips.</p>
                </div>
              ) : (
                <div>
                  <p className={styles.tipsCategory}><strong>Category:</strong> {bmiCategory} <span style={{color: getBMIColor()}}>({bmi})</span></p>
                  <ul className={styles.tipsList}>
                    {getHealthTips(parseFloat(bmi), bmiCategory).map((tip, idx) => (
                      <li key={idx} className={styles.tipItem}>
                        <div className={styles.tipIcon} style={{ backgroundColor: `${tip.color}20`, color: tip.color }}>
                          <span>{tip.icon}</span>
                        </div>
                        <span className={styles.tipText}>{tip.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Recent Activities */}
        <div className={styles.bottomRow}>
          <div className={styles.recentActivitiesCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.cardTitle}>Recent Activities</h3>
              <p className={styles.cardSubtitle}>Your recent actions and activities</p>
              <div className={styles.cardHeaderActions}>
                {userActivities.length > 3 && (
                  <button 
                    className={styles.viewAllButton}
                    onClick={() => setShowAllActivities(!showAllActivities)}
                  >
                    {showAllActivities ? 'Show Less' : 'View All'}
                  </button>
                )}
                {showAllActivities && userActivities.length > 0 && (
                  <button 
                    className={styles.clearAllButton}
                    onClick={clearAllActivities}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>
            <div className={styles.activitiesContent}>
              {userActivities.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>📋</span>
                  <h3>No recent activities</h3>
                  <p>Your recent medical activities will appear here.</p>
                </div>
              ) : (
                <div className={styles.activitiesList}>
                  {(showAllActivities ? userActivities : userActivities.slice(0, 3)).map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon} style={{ backgroundColor: `${activity.color}20`, color: activity.color }}>
                        <span>{activity.icon}</span>
                      </div>
                      <div className={styles.activityContent}>
                        <h4 className={styles.activityTitle}>{activity.action}</h4>
                        <p className={styles.activityDescription}>{activity.description}</p>
                        <span className={styles.activityTime}>{activity.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

