import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Dashboard.module.scss';
import { useSettings } from '../../../contexts/SettingsContext';
import { useActivities } from '../../../contexts/ActivityContext';

const Dashboard = ({ patients = [], medicines = [], onSectionChange }) => {
  const { settings } = useSettings();
  const { activities, clearActivities } = useActivities();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  const [medicineStats, setMedicineStats] = useState({
    total: 0,
    lowStock: 0,
    expiringSoon: 0
  });
  const [patientStats, setPatientStats] = useState({
    total: 0,
    uniquePatients: 0
  });

  useEffect(() => {
    const fetchMedicineStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/medicines/stats');
        console.log('Medicine stats response:', response.data); // Debug log
        setMedicineStats({
          total: response.data.total || 0,
          lowStock: response.data.lowStock || 0,
          expiringSoon: response.data.expiringSoon || 0
        });
      } catch (error) {
        console.error('Error fetching medicine stats:', error);
        // Set default values on error
        setMedicineStats({
          total: 0,
          lowStock: 0,
          expiringSoon: 0
        });
      }
    };

    const fetchPatientStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/patient/stats');
        console.log('Patient stats response:', response.data); // Debug log
        setPatientStats({
          total: response.data.total || 0,
          uniquePatients: response.data.uniquePatients || 0
        });
      } catch (error) {
        console.error('Error fetching patient stats:', error);
        // Set default values on error
        setPatientStats({
          total: 0,
          uniquePatients: 0
        });
      }
    };
    
    // Initial fetch
    fetchMedicineStats();
    fetchPatientStats();
    
    // Set up polling to update stats every 30 seconds (more frequent for testing)
    const interval = setInterval(() => {
      fetchMedicineStats();
      fetchPatientStats();
    }, 30 * 1000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []); // Empty dependency array means this runs once when component mounts

  // Medicine stats are now handled by useEffect and medicineStats state
  // Patient stats are fetched from database (uniquePatients and total records)

  const stats = [
    {
      title: 'Total Patients',
      value: patientStats.uniquePatients.toString(),
      icon: '👤',
      iconClass: styles.iconLightBlue,
      description: patientStats.uniquePatients === 0 ? 'No patients registered' : `${patientStats.total} patient record${patientStats.total !== 1 ? 's' : ''} in system`
    },
    {
      title: 'Total Medicines',
      value: medicineStats.total.toString(),
      icon: '💊',
      iconClass: styles.iconBlue,
      description: medicineStats.total === 0 ? 'No medicines in inventory' : `${medicineStats.total} medicine${medicineStats.total !== 1 ? 's' : ''} in inventory`
    },
    {
      title: 'Low Stock Items',
      value: medicineStats.lowStock.toString(),
      icon: '⚠️',
      iconClass: styles.iconOrange,
      description: medicineStats.lowStock === 0 ? 'All medicines well stocked' : `${medicineStats.lowStock} medicine${medicineStats.lowStock !== 1 ? 's' : ''} need restocking`
    },
    {
      title: 'Expiring Soon',
      value: medicineStats.expiringSoon.toString(),
      icon: '📅',
      iconClass: styles.iconRed,
      description: medicineStats.expiringSoon === 0 ? 'No medicines expiring soon' : `${medicineStats.expiringSoon} medicine${medicineStats.expiringSoon !== 1 ? 's' : ''} expiring within ${settings?.expiryAlertDays || 30} days`
    }
  ];

  // Filter and get recent activities
  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'medicine') return activity.type === 'medicine';
    if (activityFilter === 'patient') return activity.type === 'patient';
    if (activityFilter === 'settings') return activity.type === 'settings';
    if (activityFilter === 'report') return activity.type === 'report';
    return true;
  });

  const recentActivities = showAllActivities ? filteredActivities : filteredActivities.slice(0, 3);

  const formatActivityTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleViewAllClick = () => {
    setShowAllActivities(!showAllActivities);
  };

  const handleClearActivities = () => {
    if (window.confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
      clearActivities();
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.welcomeMessage}>
        <h1>Welcome Back To KDU Medical Inspection Room Management System</h1>
      </div>
      
      <div className={styles.dashboardCards}>
        {stats.map((stat, index) => (
          <div key={index} className={styles.dashboardCard}>
            <div className={styles.dashboardCardHeader}>
              <h3>{stat.title}</h3>
              <div className={`${styles.dashboardCardIcon} ${stat.iconClass}`}>
                <span className={styles.iconEmoji}>{stat.icon}</span>
              </div>
            </div>
            <div className={styles.number}>{stat.value}</div>
            <div className={styles.description}>{stat.description}</div>
          </div>
        ))}
      </div>
      
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recent Activities</h3>
          <div className={styles.cardHeaderActions}>
            {activities.length > 3 && (
              <button 
                className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSm}`}
                onClick={handleViewAllClick}
              >
                {showAllActivities ? 'Show Less' : 'View All'}
              </button>
            )}
          </div>
        </div>
        {showAllActivities && (
          <div className={styles.filterSection}>
            <div className={styles.filterButtons}>
              <button
                className={`${styles.filterBtn} ${activityFilter === 'all' ? styles.filterBtnActive : ''}`}
                onClick={() => setActivityFilter('all')}
              >
                All
              </button>
              <button
                className={`${styles.filterBtn} ${activityFilter === 'medicine' ? styles.filterBtnActive : ''}`}
                onClick={() => setActivityFilter('medicine')}
              >
                Medicine
              </button>
              <button
                className={`${styles.filterBtn} ${activityFilter === 'patient' ? styles.filterBtnActive : ''}`}
                onClick={() => setActivityFilter('patient')}
              >
                Patient
              </button>
              <button
                className={`${styles.filterBtn} ${activityFilter === 'settings' ? styles.filterBtnActive : ''}`}
                onClick={() => setActivityFilter('settings')}
              >
                Settings
              </button>
              <button
                className={`${styles.filterBtn} ${activityFilter === 'report' ? styles.filterBtnActive : ''}`}
                onClick={() => setActivityFilter('report')}
              >
                Reports
              </button>
              {activities.length > 0 && (
                <button
                  className={`${styles.btn} ${styles.btnGray} ${styles.btnSm}`}
                  onClick={handleClearActivities}
                  title="Clear all activities"
                >
                  Clear All
                </button>
              )}
            </div>
          </div>
        )}
        {recentActivities.length > 0 ? (
          <div className={styles.activitiesList}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityIcon}>
                  <span>{activity.icon}</span>
                </div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{activity.title}</div>
                  <div className={styles.activityDescription}>{activity.description}</div>
                  <div className={styles.activityTime}>{formatActivityTime(activity.timestamp)}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <h3>No recent activities</h3>
            <p>Activities will appear here once you start using the system.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;