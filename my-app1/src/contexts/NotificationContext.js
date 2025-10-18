import React, { createContext, useContext, useState, useCallback } from 'react';
import { SettingsContext } from './SettingsContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const settingsContext = useContext(SettingsContext);
  const settings = settingsContext?.settings || {
    expiryAlertDays: 7,
    lowStockAlertEnabled: true,
    expiryAlertEnabled: true
  };
  const [notifications, setNotifications] = useState([]);
  const [userType, setUserType] = useState(null); // Track user type for filtering

  // Function to set user type for notification filtering
  const setUserTypeForNotifications = useCallback((type) => {
    setUserType(type);
    
    // If user is not admin, clear all admin notifications
    if (type !== 'admin') {
      setNotifications(prev => prev.filter(notification => 
        !(notification.category === 'stock' || 
          notification.category === 'expiry' || 
          notification.category === 'medicine' || 
          notification.category === 'inventory')
      ));
    }
  }, []);

  // Function to check if notification should be shown to current user
  const shouldShowNotification = useCallback((notification) => {
    // Admin users see all notifications
    if (userType === 'admin') {
      return true;
    }
    
    // Regular users only see user-relevant notifications
    const userRelevantCategories = ['patient', 'profile', 'success', 'medical-record'];
    return userRelevantCategories.includes(notification.category);
  }, [userType]);

  const addNotification = useCallback((notification) => {
    console.log('addNotification called with:', {
      notification,
      userType,
      shouldShow: shouldShowNotification(notification)
    });
    
    // Check if notification should be shown to current user
    if (!shouldShowNotification(notification)) {
      console.log('Notification filtered out for user type:', userType, notification);
      return;
    }

    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleString(),
      status: 'new',
      ...notification
    };
    
    console.log('Adding notification:', newNotification);
    
    setNotifications(prev => {
      // Check if a similar notification already exists (prevent duplicates)
      const isDuplicate = prev.some(existing => {
        // For stock alerts, check by medicineId and category
        if (newNotification.category === 'stock' && existing.category === 'stock' && 
            newNotification.medicineId && existing.medicineId) {
          return newNotification.medicineId === existing.medicineId && 
                 existing.status !== 'dismissed';
        }
        
        // For expiry alerts, check by medicineId and category
        if (newNotification.category === 'expiry' && existing.category === 'expiry' && 
            newNotification.medicineId && existing.medicineId) {
          return newNotification.medicineId === existing.medicineId && 
                 existing.status !== 'dismissed';
        }
        
        // For success notifications, allow them to show (no deduplication)
        if (newNotification.category === 'success') {
          return false;
        }
        
        // For patient notifications, check for duplicates based on title and timing
        if (newNotification.category === 'patient') {
          return existing.title === newNotification.title && 
                 Math.abs(new Date(existing.timestamp) - new Date(newNotification.timestamp)) < 5000; // Within 5 seconds
        }
        
        // For other notifications, check title, description and timing
        return existing.title === newNotification.title && 
               existing.description === newNotification.description &&
               Math.abs(new Date(existing.timestamp) - new Date(newNotification.timestamp)) < 5000; // Within 5 seconds
      });
      
      if (isDuplicate) {
        console.log('Duplicate notification prevented:', newNotification.title);
        return prev;
      }
      
      return [newNotification, ...prev];
    });
  }, [shouldShowNotification]);

  const dismissNotification = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'dismissed' }
          : notification
      ).filter(notification => notification.status !== 'dismissed')
    );
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, status: 'read' }
          : notification
      )
    );
  }, []);

  const markAllNewAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.status === 'new' 
          ? { ...notification, status: 'read' }
          : notification
      )
    );
  }, []);

  const checkStockAlerts = useCallback((medicines) => {
    console.log('checkStockAlerts called with medicines:', medicines.length, 'settings:', settings);
    
    // Check if we have medicines to process
    if (!medicines || medicines.length === 0) {
      console.log('No medicines to check for alerts');
      return;
    }

    // Check if settings are available
    if (!settings) {
      console.log('Settings not available, using default values');
    }

    const lowStockEnabled = settings?.lowStockAlertEnabled !== false; // Default to true if not set
    const expiryEnabled = settings?.expiryAlertEnabled !== false; // Default to true if not set
    const expiryDays = settings?.expiryAlertDays || 7; // Default to 7 days


    medicines.forEach(medicine => {
      const currentStock = parseInt(medicine.quantity) || 0;
      const lowStockThreshold = parseInt(medicine.lowStockThreshold) || 10; // Default threshold
      const expiryDate = new Date(medicine.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Check for low stock (only if enabled in settings and stock is below threshold)
      if (lowStockEnabled && currentStock <= lowStockThreshold && lowStockThreshold > 0) {
        addNotification({
          type: 'warning',
          icon: '⚠️',
          title: `Low Stock Alert: ${medicine.medicineName}`,
          description: `Stock for ${medicine.medicineName} is running low. Current quantity: ${currentStock} units (Threshold: ${lowStockThreshold}).`,
          category: 'stock',
          medicineId: medicine._id || medicine.id,
          medicineName: medicine.medicineName
        });
      }

      // Check for expiry (using settings for alert days, only if enabled)
      if (expiryEnabled && daysUntilExpiry <= expiryDays && daysUntilExpiry > 0) {
        addNotification({
          type: 'expiry',
          icon: '📅',
          title: `Expiry Alert: ${medicine.medicineName}`,
          description: `${medicine.medicineName} is expiring in ${daysUntilExpiry} days (${new Date(medicine.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}).`,
          category: 'expiry',
          medicineId: medicine._id || medicine.id,
          medicineName: medicine.medicineName
        });
      }

      // Check for expired medicines (always show regardless of settings)
      if (daysUntilExpiry < 0) {
        addNotification({
          type: 'danger',
          icon: '❌',
          title: `Expired Medicine: ${medicine.medicineName}`,
          description: `${medicine.medicineName} has expired on ${new Date(medicine.expiryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}. Please remove from inventory.`,
          category: 'expiry',
          medicineId: medicine._id || medicine.id,
          medicineName: medicine.medicineName
        });
      }
    });
  }, [addNotification, settings]);

  const getNewNotificationsCount = useCallback(() => {
    return notifications.filter(notification => notification.status === 'new').length;
  }, [notifications]);

  const getNotificationsByCategory = useCallback((category) => {
    return notifications.filter(notification => notification.category === category);
  }, [notifications]);

  const clearStockAlertsForMedicine = useCallback((medicineId) => {
    setNotifications(prev => 
      prev.filter(notification => 
        !(notification.category === 'stock' && notification.medicineId === medicineId)
      )
    );
  }, []);

  const clearExpiryAlertsForMedicine = useCallback((medicineId) => {
    setNotifications(prev => 
      prev.filter(notification => 
        !(notification.category === 'expiry' && notification.medicineId === medicineId)
      )
    );
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Helper function to check if low stock alerts are enabled
  const isLowStockAlertEnabled = useCallback(() => {
    return settings.lowStockAlertEnabled;
  }, [settings.lowStockAlertEnabled]);

  // Helper function to check if expiry alerts are enabled
  const isExpiryAlertEnabled = useCallback(() => {
    return settings.expiryAlertEnabled;
  }, [settings.expiryAlertEnabled]);

  const value = {
    notifications,
    setNotifications,
    addNotification,
    dismissNotification,
    markAsRead,
    markAllNewAsRead,
    checkStockAlerts,
    getNewNotificationsCount,
    getNotificationsByCategory,
    clearStockAlertsForMedicine,
    clearExpiryAlertsForMedicine,
    clearAllNotifications,
    isLowStockAlertEnabled,
    isExpiryAlertEnabled,
    setUserTypeForNotifications,
    shouldShowNotification
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
