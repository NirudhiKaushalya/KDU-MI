import React, { useState, useEffect } from 'react';
import styles from './Settings.module.scss';
import { useSettings } from '../../../contexts/SettingsContext';
import { useActivities } from '../../../contexts/ActivityContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { addActivity } = useActivities();
  const [localSettings, setLocalSettings] = useState(() => settings);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync localSettings with context settings when settings change
  useEffect(() => {
    console.log('Settings changed in context:', settings);
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleExpiryDaysChange = (e) => {
    const newValue = parseInt(e.target.value);
    setLocalSettings(prev => ({ ...prev, expiryAlertDays: newValue }));
    setHasChanges(true);
  };

  const toggleLowStockAlert = () => {
    setLocalSettings(prev => {
      const newValue = !prev.lowStockAlertEnabled;
      console.log('Toggling low stock alert from', prev.lowStockAlertEnabled, 'to', newValue);
      return { ...prev, lowStockAlertEnabled: newValue };
    });
    setHasChanges(true);
  };

  const toggleExpiryAlert = () => {
    setLocalSettings(prev => {
      const newValue = !prev.expiryAlertEnabled;
      console.log('Toggling expiry alert from', prev.expiryAlertEnabled, 'to', newValue);
      return { ...prev, expiryAlertEnabled: newValue };
    });
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    try {
      console.log('Saving settings:', localSettings);
      console.log('Current context settings:', settings);
      
      // Track settings changes in activities
      const changes = [];
      if (settings.lowStockAlertEnabled !== localSettings.lowStockAlertEnabled) {
        changes.push(`Low stock alerts ${localSettings.lowStockAlertEnabled ? 'enabled' : 'disabled'}`);
      }
      if (settings.expiryAlertEnabled !== localSettings.expiryAlertEnabled) {
        changes.push(`Expiry alerts ${localSettings.expiryAlertEnabled ? 'enabled' : 'disabled'}`);
      }
      if (settings.expiryAlertDays !== localSettings.expiryAlertDays) {
        changes.push(`Expiry alert days changed to ${localSettings.expiryAlertDays}`);
      }
      
      if (changes.length > 0) {
        addActivity({
          type: 'settings',
          action: 'updated',
          title: 'Settings Updated',
          description: changes.join(', '),
          icon: '⚙️',
          details: {
            changes: changes,
            oldSettings: settings,
            newSettings: localSettings
          }
        });
      }
      
      updateSettings(localSettings);
      setHasChanges(false);
      alert('Settings saved successfully!');
      console.log('Settings saved:', localSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error saving settings. Please try again.');
    }
  };

  const handleCancel = () => {
    // Reset to current saved settings
    setLocalSettings(settings);
    setHasChanges(false);
  };

  const handleBackupData = () => {
    // Create a backup data object
    const backupData = {
      timestamp: new Date().toISOString(),
      settings: localSettings,
      // You would include other data here like patients, medicines, etc.
    };

    // Download as JSON file
    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kdu-medical-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Data backup completed successfully!');
  };

  const handleRestoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          // Validate backup data structure
          if (backupData.settings) {
            setLocalSettings({
              expiryAlertDays: backupData.settings.expiryAlertDays || 7,
              lowStockAlertEnabled: backupData.settings.lowStockAlertEnabled !== undefined ? backupData.settings.lowStockAlertEnabled : true,
              expiryAlertEnabled: backupData.settings.expiryAlertEnabled !== undefined ? backupData.settings.expiryAlertEnabled : true
            });
            setHasChanges(true);
            
            alert('Data restored successfully! Don\'t forget to save changes.');
          } else {
            alert('Invalid backup file format.');
          }
        } catch (error) {
          alert('Error reading backup file. Please ensure it\'s a valid JSON file.');
        }
      };
      
      reader.readAsText(file);
    };
    
    input.click();
  };

  return (
    <div className={styles.settingsContainer}>
      <div className={styles.settingsContent}>
        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Inventory Settings</h2>
          <div className={styles.settingsGroup}>
            <div className={styles.inputGroup}>
              <label className={styles.inputLabel}>Expiry Alert Days</label>
              <input
                type="number"
                className={styles.numberInput}
                value={localSettings.expiryAlertDays}
                onChange={handleExpiryDaysChange}
                min="1"
                max="30"
              />
              <p className={styles.inputDescription}>
                Set the number of days before a medicine's expiry date to receive an alert.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
          <div className={styles.settingsGroup}>
            <div className={styles.settingsItem}>
              <div className={styles.settingsInfo}>
                <h3 className={styles.settingsItemTitle}>Low Stock Alerts</h3>
                <p className={styles.settingsDescription}>
                  Receive notifications when medicine stock is running low.
                </p>
              </div>
              <button 
                className={`${styles.toggleButton} ${localSettings.lowStockAlertEnabled ? styles.enabled : styles.disabled}`}
                onClick={toggleLowStockAlert}
              >
                {localSettings.lowStockAlertEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className={styles.settingsItem}>
              <div className={styles.settingsInfo}>
                <h3 className={styles.settingsItemTitle}>Expiry Alerts</h3>
                <p className={styles.settingsDescription}>
                  Receive notifications for expiring medicines.
                </p>
              </div>
              <button 
                className={`${styles.toggleButton} ${localSettings.expiryAlertEnabled ? styles.enabled : styles.disabled}`}
                onClick={toggleExpiryAlert}
              >
                {localSettings.expiryAlertEnabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.settingsSection}>
          <h2 className={styles.sectionTitle}>Backup & Restore Data</h2>
          <div className={styles.settingsGroup}>
            <div className={styles.backupActions}>
              <button 
                className={styles.backupButton}
                onClick={handleBackupData}
              >
                <span className={styles.buttonIcon}>☁️</span>
                Backup Data
              </button>
              <button 
                className={styles.restoreButton}
                onClick={handleRestoreData}
              >
                <span className={styles.buttonIcon}>🔄</span>
                Restore Data
              </button>
            </div>
          </div>
        </div>

        {/* Action buttons placed at the bottom right */}
        <div className={styles.actionButtons}>
          <button 
            className={styles.cancelButton}
            onClick={handleCancel}
            disabled={!hasChanges}
          >
            Cancel
          </button>
          <button 
            className={styles.saveButton}
            onClick={handleSaveChanges}
            disabled={!hasChanges}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;