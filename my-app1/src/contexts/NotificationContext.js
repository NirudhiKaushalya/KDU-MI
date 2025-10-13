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

  const addNotification = useCallback((notification) => {
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
        if (newNotification.category === 'success' || newNotification.category === 'patient') {
          return false;
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
  }, []);

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
    // Early return if both stock and expiry alerts are disabled
    if (!settings.lowStockAlertEnabled && !settings.expiryAlertEnabled) {
      console.log('All stock alerts are disabled in settings');
      return;
    }

    medicines.forEach(medicine => {
      const currentStock = parseInt(medicine.quantity) || 0;
      const lowStockThreshold = parseInt(medicine.lowStockThreshold) || 0;
      const expiryDate = new Date(medicine.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

      // Check for low stock (only if enabled in settings and stock is below threshold)
      if (settings.lowStockAlertEnabled && currentStock <= lowStockThreshold && lowStockThreshold > 0) {
        addNotification({
          type: 'warning',
          icon: '⚠️',
          title: `Low Stock Alert: ${medicine.medicineName}`,
          description: `Stock for ${medicine.medicineName} is running low. Current quantity: ${currentStock} units (Threshold: ${lowStockThreshold}).`,
          category: 'stock',
          medicineId: medicine.id,
          medicineName: medicine.medicineName
        });
      }

      // Check for expiry (using settings for alert days, only if enabled)
      if (settings.expiryAlertEnabled && daysUntilExpiry <= settings.expiryAlertDays && daysUntilExpiry > 0) {
        addNotification({
          type: 'expiry',
          icon: '📅',
          title: `Expiry Alert: ${medicine.medicineName}`,
          description: `${medicine.medicineName} is expiring in ${daysUntilExpiry} days (${medicine.expiryDate}).`,
          category: 'expiry',
          medicineId: medicine.id,
          medicineName: medicine.medicineName
        });
      }

      // Check for expired medicines (always show regardless of settings)
      if (daysUntilExpiry < 0) {
        addNotification({
          type: 'danger',
          icon: '❌',
          title: `Expired Medicine: ${medicine.medicineName}`,
          description: `${medicine.medicineName} has expired on ${medicine.expiryDate}. Please remove from inventory.`,
          category: 'expiry',
          medicineId: medicine.id,
          medicineName: medicine.medicineName
        });
      }
    });
  }, [addNotification, settings.lowStockAlertEnabled, settings.expiryAlertEnabled, settings.expiryAlertDays]);

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
    isExpiryAlertEnabled
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
