import React from 'react';
import styles from './Notifications.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const Notifications = () => {
  const { notifications, dismissNotification, markAsRead } = useNotifications();
  
  // Debug: Log notifications to console
  console.log('Notifications component - Current notifications:', notifications);

  const getNotificationStyle = (type) => {
    switch (type) {
      case 'warning':
        return styles.notificationNewWarning;
      case 'expiry':
        return styles.notificationNewExpiry;
      case 'success':
        return styles.notificationNewSuccess;
      default:
        return styles.notificationEarlier;
    }
  };

  const getIconStyle = (type) => {
    switch (type) {
      case 'warning':
        return styles.iconWarning;
      case 'expiry':
        return styles.iconExpiry;
      case 'success':
        return styles.iconSuccess;
      default:
        return styles.iconInfo;
    }
  };
  
  // Handlers for dismissing and marking notifications as read, Triggered by ❌ button
  const handleDismissNotification = (id) => {
    dismissNotification(id);
  };
  //Marks a notification as read
  const handleMarkAsRead = (id) => {
    markAsRead(id);
  };

  const newNotifications = notifications.filter(notification => notification.status === 'new');
  const earlierNotifications = notifications.filter(notification => notification.status === 'read' || notification.status === 'earlier');

  return (
    <div className={styles.notificationsContainer}>

      <div className={styles.notificationsContent}>
        <div className={styles.notificationsSection}>
          <h2 className={styles.sectionTitle}>New</h2>
          {newNotifications.length > 0 ? (
            <div className={styles.notificationsList}>
              {newNotifications.map(notification => (
                <div key={notification.id} className={`${styles.notificationCard} ${getNotificationStyle(notification.type)}`}>
                  <div className={styles.notificationContent}>
                    <div className={`${styles.notificationIcon} ${getIconStyle(notification.type)}`}>
                      {notification.icon}
                    </div>
                    <div className={styles.notificationDetails}>
                      <h3 className={styles.notificationTitle}>{notification.title}</h3>
                      <p className={styles.notificationDescription}>{notification.description}</p>
                      <span className={styles.notificationTime}>{notification.timestamp}</span>
                    </div>
                  </div>
                  <button 
                    className={styles.dismissButton}
                    onClick={() => handleDismissNotification(notification.id)}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noNotifications}>No new notifications</p>
          )}
        </div>

        <div className={styles.notificationsSection}>
          <h2 className={styles.sectionTitle}>Earlier</h2>
          {earlierNotifications.length > 0 ? (
            <div className={styles.notificationsList}>
              {earlierNotifications.map(notification => (
                <div key={notification.id} className={`${styles.notificationCard} ${getNotificationStyle(notification.type)}`}>
                  <div className={styles.notificationContent}>
                    <div className={`${styles.notificationIcon} ${getIconStyle(notification.type)}`}>
                      {notification.icon}
                    </div>
                    <div className={styles.notificationDetails}>
                      <h3 className={styles.notificationTitle}>{notification.title}</h3>
                      <p className={styles.notificationDescription}>{notification.description}</p>
                      <span className={styles.notificationTime}>{notification.timestamp}</span>
                    </div>
                  </div>
                  <button 
                    className={styles.dismissButton}
                    onClick={() => handleDismissNotification(notification.id)}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.noNotifications}>No earlier notifications</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;