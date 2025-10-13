import React, { useState } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './UserNotifications.module.scss';

const UserNotifications = () => {
  const { notifications, dismissNotification, markAsRead } = useNotifications();
  
  // Separate notifications into new and earlier based on status
  const newNotifications = notifications.filter(notification => notification.status === 'new');
  const earlierNotifications = notifications.filter(notification => notification.status === 'read');

  const handleCloseNotification = (notificationId) => {
    dismissNotification(notificationId);
  };

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const NotificationCard = ({ notification, isNew, onClose }) => (
    <div className={styles.notificationCard}>
      <div className={styles.cardContent}>
        <div className={styles.notificationIcon}>
          <span className={styles.icon}>{notification.icon}</span>
        </div>
        <div className={styles.notificationDetails}>
          <h3 className={styles.notificationTitle}>{notification.title}</h3>
          <p className={styles.notificationDescription}>{notification.description}</p>
          <span className={styles.notificationTimestamp}>{notification.timestamp}</span>
        </div>
        <div className={styles.notificationActions}>
          {isNew && (
            <button 
              className={styles.markReadButton}
              onClick={() => handleMarkAsRead(notification.id)}
              title="Mark as read"
            >
              <i className="fas fa-check"></i>
            </button>
          )}
          <button 
            className={styles.closeButton}
            onClick={() => onClose(notification.id)}
            title="Close notification"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.userNotifications}>
      <div className={styles.notificationsHeader}>
        <h1 className={styles.pageTitle}>Notifications</h1>
      </div>

      <div className={styles.notificationsContent}>
        {/* New Notifications Section */}
        <div className={styles.notificationSection}>
          <h2 className={styles.sectionTitle}>New</h2>
          <div className={styles.notificationList}>
            {newNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                isNew={true}
                onClose={handleCloseNotification}
              />
            ))}
          </div>
        </div>

        {/* Earlier Notifications Section */}
        <div className={styles.notificationSection}>
          <h2 className={styles.sectionTitle}>Earlier</h2>
          <div className={styles.notificationList}>
            {earlierNotifications.map((notification) => (
              <NotificationCard 
                key={notification.id} 
                notification={notification} 
                isNew={false}
                onClose={handleCloseNotification}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserNotifications;

