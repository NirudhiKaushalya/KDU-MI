import React, { useState } from 'react';
import styles from './Dashboard.module.scss';
import { useSettings } from '../../../contexts/SettingsContext';
import { useActivities } from '../../../contexts/ActivityContext';

const Dashboard = ({ patients = [], medicines = [], onSectionChange }) => {
  const { settings } = useSettings();
  const { activities, clearActivities } = useActivities();
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Calculate statistics
  const totalPatients = patients.length;
  const totalMedicines = medicines.length;
  
  // Calculate low stock items
  const lowStockItems = medicines.filter(medicine => {
    const currentStock = parseInt(medicine.quantity) || 0;
    const threshold = parseInt(medicine.lowStockThreshold) || 0;
    return currentStock <= threshold;
  }).length;
  
  // Calculate expiring soon items
  const expiringSoonItems = medicines.filter(medicine => {
    const expiryDate = new Date(medicine.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= (settings?.expiryAlertDays || 30) && daysUntilExpiry >= 0;
  }).length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      icon: '👤',
      iconClass: styles.iconLightBlue,
      description: totalPatients === 0 ? 'No patients registered' : `${totalPatients} patient${totalPatients !== 1 ? 's' : ''} registered`
    },
    {
      title: 'Total Medicines',
      value: totalMedicines.toString(),
      icon: '💊',
      iconClass: styles.iconBlue,
      description: totalMedicines === 0 ? 'No medicines in inventory' : `${totalMedicines} medicine${totalMedicines !== 1 ? 's' : ''} in inventory`
    },
    {
      title: 'Low Stock Items',
      value: lowStockItems.toString(),
      icon: '⚠️',
      iconClass: styles.iconOrange,
      description: lowStockItems === 0 ? 'All medicines well stocked' : `${lowStockItems} medicine${lowStockItems !== 1 ? 's' : ''} need restocking`
    },
    {
      title: 'Expiring Soon',
      value: expiringSoonItems.toString(),
      icon: '📅',
      iconClass: styles.iconRed,
      description: expiringSoonItems === 0 ? 'No medicines expiring soon' : `${expiringSoonItems} medicine${expiringSoonItems !== 1 ? 's' : ''} expiring within ${settings?.expiryAlertDays || 30} days`
    }
  ];

  // Filter and get recent activities
  const filteredActivities = activities.filter(activity => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'medicine') return activity.type === 'medicine';
    if (activityFilter === 'patient') return activity.type === 'patient';
    if (activityFilter === 'settings') return activity.type === 'settings';
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
        <h1>Welcome back to KDU Medical Inspection Room management system</h1>
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