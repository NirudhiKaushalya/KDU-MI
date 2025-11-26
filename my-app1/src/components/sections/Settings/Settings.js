import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Settings.module.scss';
import { useSettings } from '../../../contexts/SettingsContext';
import { useActivities } from '../../../contexts/ActivityContext';
import { useNotifications } from '../../../contexts/NotificationContext';

const Settings = () => {
  const { settings, updateSettings } = useSettings();
  const { addActivity } = useActivities();
  const { addNotification } = useNotifications();
  const [localSettings, setLocalSettings] = useState(() => settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Sync localSettings with context settings when settings change
  useEffect(() => {
    console.log('Settings changed in context:', settings);
    setLocalSettings(settings);
    setHasChanges(false);
  }, [settings]);

  const handleExpiryDaysChange = (e) => {
    const parsed = parseInt(e.target.value, 10);
    const clamped = isNaN(parsed) ? '' : Math.max(1, Math.min(30, parsed));
    setLocalSettings(prev => ({ ...prev, expiryAlertDays: clamped }));
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

  // Helper function to convert array to CSV
  const arrayToCSV = (data, columns) => {
    if (!data || data.length === 0) return '';
    
    // Create header row
    const header = columns.map(col => `"${col.label}"`).join(',');
    
    // Create data rows
    const rows = data.map(item => {
      return columns.map(col => {
        let value = item[col.key];
        
        // Handle nested objects or arrays
        if (Array.isArray(value)) {
          value = value.map(v => typeof v === 'object' ? (v.name || v.medicineName || JSON.stringify(v)) : v).join('; ');
        } else if (typeof value === 'object' && value !== null) {
          value = JSON.stringify(value);
        }
        
        // Escape quotes and wrap in quotes
        value = value === undefined || value === null ? '' : String(value);
        value = value.replace(/"/g, '""');
        return `"${value}"`;
      }).join(',');
    });
    
    return [header, ...rows].join('\n');
  };

  const handleBackupData = async () => {
    if (!window.confirm('This will create a backup of all system data as CSV files. Continue?')) {
      return;
    }

    setIsBackingUp(true);
    
    try {
      // Fetch all data from the database
      const [patientsRes, medicinesRes, usersRes] = await Promise.all([
        axios.get('http://localhost:8000/api/patient/').catch(() => ({ data: [] })),
        axios.get('http://localhost:8000/api/medicines/all').catch(() => ({ data: { medicines: [] } })),
        axios.get('http://localhost:8000/api/user/').catch(() => ({ data: [] }))
      ]);

      const patients = patientsRes.data || [];
      const medicines = medicinesRes.data.medicines || medicinesRes.data || [];
      const users = usersRes.data || [];

      // Define columns for each CSV
      const medicineColumns = [
        { key: 'medicineName', label: 'Medicine Name' },
        { key: 'category', label: 'Category' },
        { key: 'brand', label: 'Brand' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'lowStockThreshold', label: 'Low Stock Threshold' },
        { key: 'expiryDate', label: 'Expiry Date' },
        { key: 'stockLevel', label: 'Stock Level' },
        { key: 'createdAt', label: 'Created At' }
      ];

      const patientColumns = [
        { key: 'indexNo', label: 'Index Number' },
        { key: 'name', label: 'Name' },
        { key: 'consultedDate', label: 'Consulted Date' },
        { key: 'consultedTime', label: 'Consulted Time' },
        { key: 'medicalCondition', label: 'Medical Condition' },
        { key: 'reasonForConsultation', label: 'Reason' },
        { key: 'prescribedMedicines', label: 'Prescribed Medicines' },
        { key: 'additionalNotes', label: 'Additional Notes' },
        { key: 'createdAt', label: 'Created At' }
      ];

      const userColumns = [
        { key: 'userName', label: 'User Name' },
        { key: 'email', label: 'Email' },
        { key: 'indexNo', label: 'Index Number' },
        { key: 'gender', label: 'Gender' },
        { key: 'department', label: 'Department' },
        { key: 'role', label: 'Role' },
        { key: 'contactNo', label: 'Contact Number' },
        { key: 'intake', label: 'Intake' },
        { key: 'createdAt', label: 'Created At' }
      ];

      // Generate CSVs
      const medicinesCSV = arrayToCSV(medicines, medicineColumns);
      const patientsCSV = arrayToCSV(patients, patientColumns);
      const usersCSV = arrayToCSV(users, userColumns);

      // Create settings CSV
      const settingsCSV = `"Setting","Value"\n"Expiry Alert Days","${localSettings.expiryAlertDays}"\n"Low Stock Alert Enabled","${localSettings.lowStockAlertEnabled}"\n"Expiry Alert Enabled","${localSettings.expiryAlertEnabled}"`;

      // Create a combined CSV with all data separated by sections
      const dateStr = new Date().toISOString().split('T')[0];
      const backupContent = `KDU MEDICAL INSPECTION UNIT - DATA BACKUP
Generated: ${new Date().toLocaleString()}
================================================

=== MEDICINES (${medicines.length} records) ===
${medicinesCSV}

=== PATIENT RECORDS (${patients.length} records) ===
${patientsCSV}

=== USERS (${users.length} records) ===
${usersCSV}

=== SETTINGS ===
${settingsCSV}
`;

      // Download as CSV file
      const dataBlob = new Blob([backupContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kdu-medical-backup-${dateStr}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      // Add activity log
      addActivity({
        type: 'backup',
        action: 'created',
        title: 'Data Backup Created',
        description: `CSV backup created with ${patients.length} patients, ${medicines.length} medicines, ${users.length} users`,
        icon: '☁️'
      });

      addNotification({
        type: 'success',
        icon: '☁️',
        title: 'Backup Complete',
        description: `Successfully backed up ${patients.length} patients, ${medicines.length} medicines, ${users.length} users to CSV.`,
        category: 'system'
      });

      alert(`Backup completed successfully!\n\nCSV file includes:\n- ${medicines.length} medicines\n- ${patients.length} patient records\n- ${users.length} users\n- System settings`);
    } catch (error) {
      console.error('Backup error:', error);
      alert('Error creating backup. Please try again.');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Helper function to parse CSV string to array of objects
  const parseCSV = (csvText, startMarker, endMarker) => {
    try {
      // Find the section
      const startIdx = csvText.indexOf(startMarker);
      if (startIdx === -1) return [];
      
      let endIdx = endMarker ? csvText.indexOf(endMarker, startIdx) : csvText.length;
      if (endIdx === -1) endIdx = csvText.length;
      
      const section = csvText.substring(startIdx + startMarker.length, endIdx).trim();
      const lines = section.split('\n').filter(line => line.trim() && !line.startsWith('==='));
      
      if (lines.length < 2) return [];
      
      // Parse header
      const headerLine = lines[0];
      const headers = headerLine.match(/("(?:[^"]*(?:"")*)*"|[^,]+)/g)?.map(h => 
        h.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
      ) || [];
      
      // Parse data rows
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;
        
        const values = line.match(/("(?:[^"]*(?:"")*)*"|[^,]+)/g)?.map(v => 
          v.replace(/^"|"$/g, '').replace(/""/g, '"').trim()
        ) || [];
        
        const obj = {};
        headers.forEach((header, idx) => {
          // Map header labels back to keys
          const keyMap = {
            'Medicine Name': 'medicineName',
            'Category': 'category',
            'Brand': 'brand',
            'Quantity': 'quantity',
            'Low Stock Threshold': 'lowStockThreshold',
            'Expiry Date': 'expiryDate',
            'Stock Level': 'stockLevel',
            'Index Number': 'indexNo',
            'Name': 'name',
            'Consulted Date': 'consultedDate',
            'Consulted Time': 'consultedTime',
            'Medical Condition': 'medicalCondition',
            'Reason': 'reasonForConsultation',
            'Prescribed Medicines': 'prescribedMedicines',
            'Additional Notes': 'additionalNotes'
          };
          const key = keyMap[header] || header.toLowerCase().replace(/\s+/g, '');
          obj[key] = values[idx] || '';
        });
        
        if (Object.keys(obj).length > 0) {
          data.push(obj);
        }
      }
      
      return data;
    } catch (error) {
      console.error('CSV parse error:', error);
      return [];
    }
  };

  const handleRestoreData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const csvContent = e.target.result;
          
          // Validate it's a KDU backup file
          if (!csvContent.includes('KDU MEDICAL INSPECTION UNIT')) {
            alert('Invalid backup file. Please use a CSV file created by KDU Medical backup.');
            return;
          }

          // Parse each section
          const medicines = parseCSV(csvContent, '=== MEDICINES', '=== PATIENT');
          const patients = parseCSV(csvContent, '=== PATIENT RECORDS', '=== USERS');

          // Show confirmation
          const confirmMessage = `This will restore data from the CSV backup.\n\nData found:\n- ${medicines.length} medicines\n- ${patients.length} patient records\n\n⚠️ This may add duplicate entries. Continue?`;

          if (!window.confirm(confirmMessage)) {
            return;
          }

          setIsRestoring(true);

          let restoredCount = { patients: 0, medicines: 0 };

          // Restore medicines
          for (const medicine of medicines) {
            try {
              if (medicine.medicineName) {
                await axios.post('http://localhost:8000/api/medicines/', {
                  medicineName: medicine.medicineName,
                  category: medicine.category || 'Other',
                  brand: medicine.brand || '',
                  quantity: parseInt(medicine.quantity) || 0,
                  lowStockThreshold: parseInt(medicine.lowStockThreshold) || 10,
                  expiryDate: medicine.expiryDate || '',
                  stockLevel: medicine.stockLevel || 'In Stock'
                });
                restoredCount.medicines++;
              }
            } catch (err) {
              console.log('Medicine restore error:', err.message);
            }
          }

          // Restore patients
          for (const patient of patients) {
            try {
              if (patient.indexNo) {
                await axios.post('http://localhost:8000/api/patient/', {
                  indexNo: patient.indexNo,
                  name: patient.name || `Patient ${patient.indexNo}`,
                  consultedDate: patient.consultedDate || '',
                  consultedTime: patient.consultedTime || '',
                  medicalCondition: patient.medicalCondition || 'Medical',
                  reasonForConsultation: patient.reasonForConsultation || '',
                  additionalNotes: patient.additionalNotes || ''
                });
                restoredCount.patients++;
              }
            } catch (err) {
              console.log('Patient restore error:', err.message);
            }
          }

          // Add activity log
          addActivity({
            type: 'restore',
            action: 'completed',
            title: 'CSV Data Restored',
            description: `Restored ${restoredCount.medicines} medicines and ${restoredCount.patients} patients from CSV`,
            icon: '🔄'
          });

          addNotification({
            type: 'success',
            icon: '🔄',
            title: 'Restore Complete',
            description: `Successfully restored ${restoredCount.medicines} medicines and ${restoredCount.patients} patients from CSV.`,
            category: 'system'
          });

          setIsRestoring(false);
          alert(`Data restored successfully!\n\nRestored:\n- ${restoredCount.medicines} medicines\n- ${restoredCount.patients} patient records`);
          
        } catch (error) {
          console.error('Restore error:', error);
          setIsRestoring(false);
          alert('Error reading backup file. Please ensure it\'s a valid CSV file from KDU Medical backup.');
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
                onWheel={(e) => e.currentTarget.blur()}
                min="1"
                max="30"
                step="1"
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
          <p className={styles.sectionDescription}>
            Create a backup of all system data or restore from a previous backup file.
          </p>
          <div className={styles.settingsGroup}>
            <div className={styles.backupActions}>
              <button 
                className={styles.backupButton}
                onClick={handleBackupData}
                disabled={isBackingUp || isRestoring}
              >
                {isBackingUp ? (
                  <>
                    <span className={styles.buttonIcon}><i className="fas fa-spinner fa-spin"></i></span>
                    Backing up...
                  </>
                ) : (
                  <>
                    <span className={styles.buttonIcon}>☁️</span>
                    Backup Data
                  </>
                )}
              </button>
              <button 
                className={styles.restoreButton}
                onClick={handleRestoreData}
                disabled={isBackingUp || isRestoring}
              >
                {isRestoring ? (
                  <>
                    <span className={styles.buttonIcon}><i className="fas fa-spinner fa-spin"></i></span>
                    Restoring...
                  </>
                ) : (
                  <>
                    <span className={styles.buttonIcon}>🔄</span>
                    Restore Data
                  </>
                )}
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