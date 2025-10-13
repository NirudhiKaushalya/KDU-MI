import React, { createContext, useContext, useState, useEffect } from 'react';

export const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  
  // Initialize with default settings first
  const [settings, setSettings] = useState(() => {
    const savedSettings = localStorage.getItem('settings');
    console.log('Initializing settings from localStorage:', savedSettings);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        console.log('Parsed settings from localStorage:', parsedSettings);
        return {
          expiryAlertDays: 7,
          lowStockAlertEnabled: true,
          expiryAlertEnabled: true,
          ...parsedSettings
        };
      } catch (error) {
        console.error('Error loading settings from localStorage:', error);
      }
    }
    console.log('No saved settings found, using defaults');
    return {
      expiryAlertDays: 7,
      lowStockAlertEnabled: true,
      expiryAlertEnabled: true
    };
  });

  // Listen for localStorage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'settings' && e.newValue) {
        try {
          const newSettings = JSON.parse(e.newValue);
          console.log('Settings changed in another tab:', newSettings);
          setSettings(newSettings);
        } catch (error) {
          console.error('Error parsing settings from storage event:', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateSettings = (newSettings) => {
    const updatedSettings = { ...settings, ...newSettings };
    console.log('Updating settings from', settings, 'to', updatedSettings);
    setSettings(updatedSettings);
    
    // Save to localStorage
    localStorage.setItem('settings', JSON.stringify(updatedSettings));
    console.log('Settings saved to localStorage:', updatedSettings);
  };

  const resetSettings = () => {
    const defaultSettings = {
      expiryAlertDays: 7,
      lowStockAlertEnabled: true,
      expiryAlertEnabled: true
    };
    setSettings(defaultSettings);
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  };

  const value = {
    settings,
    updateSettings,
    resetSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};
