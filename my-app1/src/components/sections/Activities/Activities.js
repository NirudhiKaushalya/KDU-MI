import React, { useState } from 'react';
import styles from './Activities.module.scss';
import { useActivities } from '../../../contexts/ActivityContext';

const Activities = () => {
  const { activities, clearActivities, getActivitiesByType } = useActivities();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

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
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Filter activities based on selected filter and search term
  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activityTypes = [
    { value: 'all', label: 'All Activities', icon: '📋' },
    { value: 'medicine', label: 'Medicine', icon: '💊' },
    { value: 'patient', label: 'Patient', icon: '👤' },
    { value: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  const handleClearActivities = () => {
    if (window.confirm('Are you sure you want to clear all activities? This action cannot be undone.')) {
      clearActivities();
    }
  };

  return (
    <div className={styles.activities}>
      <div className={styles.activitiesHeader}>
        <h1 className={styles.activitiesTitle}>Activity Log</h1>
        <p className={styles.activitiesDescription}>
          Track all system activities and changes made by administrators.
        </p>
      </div>

      <div className={styles.activitiesFilters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        <div className={styles.filterButtons}>
          {activityTypes.map(type => (
            <button
              key={type.value}
              className={`${styles.filterButton} ${filter === type.value ? styles.active : ''}`}
              onClick={() => setFilter(type.value)}
            >
              <span className={styles.filterIcon}>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {activities.length > 0 && (
          <button
            className={styles.clearButton}
            onClick={handleClearActivities}
          >
            🗑️ Clear All
          </button>
        )}
      </div>

      <div className={styles.activitiesContent}>
        {filteredActivities.length > 0 ? (
          <div className={styles.activitiesList}>
            {filteredActivities.map((activity) => (
              <div key={activity.id} className={styles.activityCard}>
                <div className={styles.activityHeader}>
                  <div className={styles.activityIcon}>
                    <span>{activity.icon}</span>
                  </div>
                  <div className={styles.activityInfo}>
                    <h3 className={styles.activityTitle}>{activity.title}</h3>
                    <p className={styles.activityDescription}>{activity.description}</p>
                  </div>
                  <div className={styles.activityTime}>
                    {formatActivityTime(activity.timestamp)}
                  </div>
                </div>
                
                {activity.details && (
                  <div className={styles.activityDetails}>
                    {activity.details.medicineName && (
                      <div className={styles.detailItem}>
                        <strong>Medicine:</strong> {activity.details.medicineName}
                      </div>
                    )}
                    {activity.details.indexNo && (
                      <div className={styles.detailItem}>
                        <strong>Patient ID:</strong> {activity.details.indexNo}
                      </div>
                    )}
                    {activity.details.condition && (
                      <div className={styles.detailItem}>
                        <strong>Condition:</strong> {activity.details.condition}
                      </div>
                    )}
                    {activity.details.changes && (
                      <div className={styles.detailItem}>
                        <strong>Changes:</strong> {activity.details.changes.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📋</span>
            <h3>No activities found</h3>
            <p>
              {searchTerm || filter !== 'all' 
                ? 'No activities match your current filters.' 
                : 'No activities have been recorded yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Activities;






