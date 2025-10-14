import React, { useState, useEffect } from 'react';
import Sidebar from './components/common/Sidebar/Sidebar';
import Header from './components/common/Header/Header';
import Footer from './components/common/Footer/Footer';
import UserSidebar from './components/common/UserSidebar/UserSidebar';
import UserHeader from './components/common/UserHeader/UserHeader';
import Login from './components/auth/Login/Login';
import Registration from './components/auth/Registration/Registration';
import ForgotPassword from './components/auth/ForgotPassword/ForgotPassword';
import Dashboard from './components/sections/Dashboard/Dashboard';
import UserDashboard from './components/sections/UserDashboard/UserDashboard';
import UserNotifications from './components/sections/UserNotifications/UserNotifications';
import PersonalInfo from './components/sections/PersonalInfo/PersonalInfo';
import MedicalHistory from './components/sections/MedicalHistory/MedicalHistory';
import PatientManagement from './components/sections/PatientManagement/PatientManagement';
import MedicineStocks from './components/sections/MedicineStocks/MedicineStocks';
import Reports from './components/sections/Reports/Reports';
import Notifications from './components/sections/Notifications/Notifications';
import Settings from './components/sections/Settings/Settings';
import AdmitPatientModal from './components/modals/AdmitPatientModal/AdmitPatientModal';
import AddMedicineModal from './components/modals/AddMedicineModal/AddMedicineModal';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { ActivityProvider, useActivities } from './contexts/ActivityContext';
import './styles/App.scss';

const AppContent = () => {
  const { addNotification, checkStockAlerts, markAllNewAsRead, clearStockAlertsForMedicine, clearExpiryAlertsForMedicine, clearAllNotifications, getNewNotificationsCount } = useNotifications();
  const { settings } = useSettings();
  const { addActivity } = useActivities();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null); // 'admin' or 'user'
  const [userName, setUserName] = useState('');
  const [userData, setUserData] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [previousSection, setPreviousSection] = useState('dashboard');
  const [showAdmitPatientModal, setShowAdmitPatientModal] = useState(false);
  const [showAddMedicineModal, setShowAddMedicineModal] = useState(false);
  
  // Patient data - starts with sample data for testing
  const [patients, setPatients] = useState([]);

  // Medical records data - separate from patients, contains detailed medical information
  const [medicalRecords, setMedicalRecords] = useState([]);

  // Medicine data - starts empty
  const [medicines, setMedicines] = useState([]);

  // Reports data - stores generated reports
  const [recentReports, setRecentReports] = useState([]);

  // Clear any existing dummy notifications on app start
  useEffect(() => {
    // Clear all notifications to remove any dummy data
    clearAllNotifications();
    
    // Also clear any localStorage data that might contain dummy activities
    if (typeof window !== 'undefined') {
      // Clear user activities for all users that might have dummy data
      Object.keys(localStorage).forEach(key => {
        if (key.includes('user-activities-') || key.includes('bmi-')) {
          localStorage.removeItem(key);
        }
      });
    }
  }, [clearAllNotifications]);

  // Check for stock alerts whenever medicines change
  useEffect(() => {
    if (medicines.length > 0) {
      // Only check for stock alerts, don't clear all notifications
      checkStockAlerts(medicines);
    }
  }, [medicines, checkStockAlerts]);


  const handleLogin = (success, type = null, name = '', loginUserData = null) => {
    setIsAuthenticated(success);
    setUserType(type);
    // Format the username properly
    const formattedName = name ? name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ') : '';
    setUserName(formattedName);
    // Store user data if provided from login
    if (loginUserData) {
      setUserData(loginUserData);
    }
    if (success) {
      setPreviousSection('dashboard');
      setActiveSection('dashboard');
    }
  };

  const handleShowRegistration = () => {
    setShowRegistration(true);
    setShowForgotPassword(false);
  };

  const handleBackToLogin = () => {
    setShowRegistration(false);
    setShowForgotPassword(false);
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setShowRegistration(false);
  };

  // Helper function to format username properly
  const formatUserName = (userName, email) => {
    if (userName && userName.trim()) {
      // Capitalize first letter of each word
      return userName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    // Fallback: extract name from email and format it
    const emailName = email.split('@')[0];
    return emailName.charAt(0).toUpperCase() + emailName.slice(1).toLowerCase();
  };

  const handleRegistration = (registrationData) => {
    // Here you would typically handle the registration
    console.log('New user registered:', registrationData);
    // Use the userName field from registration data for display
    const userName = formatUserName(registrationData.userName, registrationData.email);
    // Store the complete user data for use in PersonalInfo component
    setUserData(registrationData);
    // After successful registration, automatically log them in as a user
    setIsAuthenticated(true);
    setUserType('user');
    setUserName(userName);
    setPreviousSection('dashboard');
    setActiveSection('dashboard');
    setShowRegistration(false);
  };

  const handleSectionChange = (section) => {
    // If user is navigating away from notifications tab, mark all new notifications as read
    if (activeSection === 'notifications' && section !== 'notifications') {
      markAllNewAsRead();
    }
    
    setPreviousSection(activeSection);
    setActiveSection(section);
  };

  const handleAddMedicine = (newMedicine) => {
    setMedicines(prev => {
      const updatedMedicines = [...prev, newMedicine];
      
      // Add activity tracking
      addActivity({
        type: 'medicine',
        action: 'added',
        title: 'Medicine Added',
        description: `${newMedicine.medicineName} (${newMedicine.quantity} units) added to inventory`,
        icon: '💊',
        details: {
          medicineName: newMedicine.medicineName,
          quantity: newMedicine.quantity,
          category: newMedicine.category,
          expiryDate: newMedicine.expiryDate
        }
      });
      
      // Notification is already handled in AddMedicineModal, no need to duplicate here
      
      // Don't call checkStockAlerts here - it's already handled in AddMedicineModal
      // This prevents duplicate alerts for new low stock medicines
      
      return updatedMedicines;
    });
  };

  const handleUpdateMedicine = (updatedMedicine) => {
    setMedicines(prev => {
      const oldMedicine = prev.find(med => med.id === updatedMedicine.id);
      const updatedMedicines = prev.map(medicine => 
        medicine.id === updatedMedicine.id ? updatedMedicine : medicine
      );
      
      // Detect what fields were changed
      const changes = [];
      if (oldMedicine?.medicineName !== updatedMedicine.medicineName) {
        changes.push(`name: "${oldMedicine?.medicineName}" → "${updatedMedicine.medicineName}"`);
      }
      if (oldMedicine?.category !== updatedMedicine.category) {
        changes.push(`category: "${oldMedicine?.category}" → "${updatedMedicine.category}"`);
      }
      if (oldMedicine?.brand !== updatedMedicine.brand) {
        changes.push(`brand: "${oldMedicine?.brand}" → "${updatedMedicine.brand}"`);
      }
      if (oldMedicine?.quantity !== updatedMedicine.quantity) {
        changes.push(`quantity: ${oldMedicine?.quantity} → ${updatedMedicine.quantity}`);
      }
      if (oldMedicine?.lowStockThreshold !== updatedMedicine.lowStockThreshold) {
        changes.push(`threshold: ${oldMedicine?.lowStockThreshold} → ${updatedMedicine.lowStockThreshold}`);
      }
      if (oldMedicine?.expiryDate !== updatedMedicine.expiryDate) {
        changes.push(`expiry date: ${oldMedicine?.expiryDate} → ${updatedMedicine.expiryDate}`);
      }

      // Add notification for medicine update
      const changeDescription = changes.length > 0 
        ? `Updated: ${changes.join(', ')}`
        : 'Medicine information updated successfully';
        
      addNotification({
        type: 'success',
        icon: '✏️',
        title: 'Medicine Updated',
        description: `${updatedMedicine.medicineName} - ${changeDescription}`,
        category: 'medicine'
      });
      
      // Add activity tracking
      addActivity({
        type: 'medicine',
        action: 'updated',
        title: 'Medicine Updated',
        description: `${updatedMedicine.medicineName} information updated`,
        icon: '✏️',
        details: {
          medicineName: updatedMedicine.medicineName,
          oldQuantity: oldMedicine?.quantity,
          newQuantity: updatedMedicine.quantity,
          changes: {
            quantity: oldMedicine?.quantity !== updatedMedicine.quantity,
            expiryDate: oldMedicine?.expiryDate !== updatedMedicine.expiryDate,
            threshold: oldMedicine?.lowStockThreshold !== updatedMedicine.lowStockThreshold
          }
        }
      });
      
      // If stock was replenished above threshold, clear existing stock alerts
      const oldStock = parseInt(oldMedicine?.quantity) || 0;
      const newStock = parseInt(updatedMedicine.quantity) || 0;
      const threshold = parseInt(updatedMedicine.lowStockThreshold) || 0;
      
      if (oldStock <= threshold && newStock > threshold) {
        clearStockAlertsForMedicine(updatedMedicine.id);
      }
      
      // Clear expiry alerts for this medicine when it's updated
      clearExpiryAlertsForMedicine(updatedMedicine.id);
      
      // Check for stock alerts after updating medicine
      checkStockAlerts(updatedMedicines);
      
      return updatedMedicines;
    });
  };

  const handleDeleteMedicine = (medicineId) => {
    setMedicines(prev => {
      const medicineToDelete = prev.find(med => med.id === medicineId);
      const updatedMedicines = prev.filter(medicine => medicine.id !== medicineId);
      
      // Add activity tracking
      if (medicineToDelete) {
        addActivity({
          type: 'medicine',
          action: 'deleted',
          title: 'Medicine Deleted',
          description: `${medicineToDelete.medicineName} removed from inventory`,
          icon: '🗑️',
          details: {
            medicineName: medicineToDelete.medicineName,
            quantity: medicineToDelete.quantity,
            category: medicineToDelete.category
          }
        });
        
        // Add notification for medicine deletion
        addNotification({
          type: 'warning',
          icon: '🗑️',
          title: 'Medicine Removed',
          description: `${medicineToDelete.medicineName} has been removed from the medicine stock.`,
          category: 'medicine'
        });
      }
      
      // Clear all notifications for this medicine when it's deleted
      clearStockAlertsForMedicine(medicineId);
      clearExpiryAlertsForMedicine(medicineId);
      
      // Check for stock alerts after deleting medicine
      checkStockAlerts(updatedMedicines);
      
      return updatedMedicines;
    });
  };

  const handleAddPatient = (patientData) => {
    // Validate and deduct prescribed medicine quantities from stock
    const prescribedMedicines = patientData.prescribedMedicines || [];
    
    if (prescribedMedicines.length > 0) {
      // Check if sufficient stock is available for all prescribed medicines
      const stockValidation = prescribedMedicines.every(prescribed => {
        const medicine = medicines.find(med => med.medicineName === prescribed.name);
        if (!medicine) {
          alert(`Medicine "${prescribed.name}" not found in inventory.`);
          return false;
        }
        const availableStock = parseInt(medicine.quantity) || 0;
        const requestedQuantity = parseInt(prescribed.quantity) || 0;
        
        if (availableStock < requestedQuantity) {
          alert(`Insufficient stock for "${prescribed.name}". Available: ${availableStock}, Requested: ${requestedQuantity}`);
          return false;
        }
        return true;
      });

      if (!stockValidation) {
        return; // Stop processing if stock validation fails
      }

      // Deduct quantities from medicine stock
      setMedicines(prev => {
        const updatedMedicines = prev.map(medicine => {
          const prescribed = prescribedMedicines.find(p => p.name === medicine.medicineName);
          if (prescribed) {
            const currentStock = parseInt(medicine.quantity) || 0;
            const issuedQuantity = parseInt(prescribed.quantity) || 0;
            const newStock = currentStock - issuedQuantity;
            
            return {
              ...medicine,
              quantity: newStock.toString(),
              stockLevel: newStock <= parseInt(medicine.lowStockThreshold) ? 'Low Stock' : 'In Stock'
            };
          }
          return medicine;
        });
        
        // Check for stock alerts after updating quantities
        checkStockAlerts(updatedMedicines);
        
        return updatedMedicines;
      });

      // Trigger notification for medicine issued
      prescribedMedicines.forEach(prescribed => {
        addNotification({
          type: 'info',
          icon: '💊',
          title: 'Medicine Issued',
          description: `${prescribed.quantity} units of ${prescribed.name} issued to patient ${patientData.indexNo}.`,
          category: 'inventory'
        });
      });
    }

    // Create a new patient record from the admission form data
    console.log('Received patient data in handleAdmitPatient:', patientData);
    console.log('Lab reports in patient data:', patientData.labReports);
    
    const newPatient = {
      id: patientData.id || `P${Date.now()}`, // Use provided ID or generate one
      indexNo: patientData.indexNo,
      condition: patientData.condition || patientData.medicalCondition,
      role: patientData.role || 'Student', // Default role for admitted patients
      name: patientData.name || `Patient ${patientData.indexNo}`, // Generate name if not provided
      age: patientData.age || null, // No default age
      gender: patientData.gender || null, // No default gender
      // Additional medical record data
      admittedDate: patientData.admittedDate || patientData.consultedDate,
      admittedTime: patientData.admittedTime || patientData.consultedTime,
      reason: patientData.reason || patientData.reasonForConsultation,
      prescribedMedicines: prescribedMedicines,
      labReports: patientData.labReports || null,
      additionalNotes: patientData.additionalNotes || ''
    };
    
    console.log('Created new patient:', newPatient);
    console.log('New patient lab reports:', newPatient.labReports);
    
    setPatients(prev => [...prev, newPatient]);
    
    // Add activity tracking
    addActivity({
      type: 'patient',
      action: 'admitted',
      title: 'Patient Admitted',
      description: `Patient ${patientData.indexNo} admitted with ${patientData.condition} condition`,
      icon: '👤',
      details: {
        indexNo: patientData.indexNo,
        condition: patientData.condition,
        prescribedMedicines: prescribedMedicines.length,
        medicines: prescribedMedicines.map(m => m.name).join(', ')
      }
    });
    
    // Trigger notification for new patient admitted
    addNotification({
      type: 'success',
      icon: '👤',
      title: 'New Patient Admitted',
      description: `Patient with index number ${patientData.indexNo} has been successfully admitted.`,
      category: 'patient'
    });
    
    // Navigate to patient management screen to show the new record
    setPreviousSection(activeSection);
    setActiveSection('patient-management');
    
    // Show success message
    alert('Patient admitted successfully!');
  };

  const handleUpdatePatient = (updatedPatient) => {
    setPatients(prev => prev.map(patient => 
      patient.id === updatedPatient.id ? updatedPatient : patient
    ));
  };

  const handleDeletePatient = (patientId) => {
    setPatients(prev => {
      const patientToDelete = prev.find(p => p.id === patientId);
      const updatedPatients = prev.filter(patient => patient.id !== patientId);
      
      // Add notification for patient deletion
      if (patientToDelete) {
        addNotification({
          type: 'warning',
          icon: '👤',
          title: 'Patient Removed',
          description: `Patient record removed - Index: ${patientToDelete.indexNo}, Consulted: ${patientToDelete.consultedDate || patientToDelete.admittedDate || 'N/A'}`,
          category: 'patient'
        });
        
        // Add activity tracking
        addActivity({
          type: 'patient',
          action: 'deleted',
          title: 'Patient Deleted',
          description: `Patient ${patientToDelete.indexNo} - ${patientToDelete.firstName} ${patientToDelete.lastName} removed from system`,
          icon: '🗑️',
          details: {
            patientName: `${patientToDelete.firstName} ${patientToDelete.lastName}`,
            indexNo: patientToDelete.indexNo,
            condition: patientToDelete.condition
          }
        });
      }
      
      return updatedPatients;
    });
  };

  const handleAddReport = (report) => {
    setRecentReports(prev => [report, ...prev.slice(0, 9)]); // Keep only last 10 reports
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUserName('');
    setPreviousSection('dashboard');
    setActiveSection('dashboard');
  };

  const renderSection = () => {
    const sectionProps = {
      onAddPatient: () => setShowAdmitPatientModal(true),
      onAddMedicine: () => setShowAddMedicineModal(true)
    };

    const sections = {
      'dashboard': <Dashboard medicines={medicines} patients={patients} />,
      'patient-management': <PatientManagement 
        {...sectionProps} 
        patients={patients}
        onUpdatePatient={handleUpdatePatient}
        onDeletePatient={handleDeletePatient}
      />,
      'medicine-stocks': <MedicineStocks 
        {...sectionProps} 
        medicines={medicines} 
        onUpdateMedicine={handleUpdateMedicine}
        onDeleteMedicine={handleDeleteMedicine}
      />,
      'reports': <Reports medicines={medicines} patients={patients} medicalRecords={medicalRecords} recentReports={recentReports} onAddReport={handleAddReport} />,
      'notifications': <Notifications />,
      'settings': <Settings key={JSON.stringify(settings)} />
    };

    return sections[activeSection] || <Dashboard medicines={medicines} patients={patients} />;
  };

  return (
    <div className="app">
      {!isAuthenticated ? (
        showRegistration ? (
          <Registration 
            onBackToLogin={handleBackToLogin}
            onRegister={handleRegistration}
          />
        ) : showForgotPassword ? (
          <ForgotPassword 
            onBackToLogin={handleBackToLogin}
          />
        ) : (
          <Login 
            onLogin={handleLogin}
            onShowRegistration={handleShowRegistration}
            onShowForgotPassword={handleShowForgotPassword}
          />
        )
      ) : userType === 'admin' ? (
        // Admin Dashboard
        <>
          <Sidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
          />
          
          <div className="main-content">
            <div className="content-wrapper">
              <Header 
                activeSection={activeSection} 
                onSectionChange={handleSectionChange}
                onLogout={handleLogout}
                patients={patients}
                medicines={medicines}
                onSearch={(searchResult) => {
                  // Handle search result selection if needed
                  console.log('Search result selected:', searchResult);
                }}
              />
              
              <div className="section active">
                {renderSection()}
              </div>
            </div>
            
            <Footer onSectionChange={handleSectionChange} userRole="admin" />
          </div>

          {showAdmitPatientModal && (
            <AdmitPatientModal 
              isOpen={showAdmitPatientModal}
              onClose={() => setShowAdmitPatientModal(false)} 
              onAdmitPatient={(patientData) => {
                handleAddPatient(patientData);
                setShowAdmitPatientModal(false); // Close modal after adding patient
              }}
              medicines={medicines}
            />
          )}
          
          {showAddMedicineModal && (
            <AddMedicineModal 
              onClose={() => setShowAddMedicineModal(false)} 
              onAddMedicine={handleAddMedicine}
            />
          )}
        </>
      ) : (
        // User Dashboard
        <>
          <UserSidebar 
            activeSection={activeSection} 
            onSectionChange={handleSectionChange}
            userName={userName}
          />
          
          <div className="main-content">
            <div className="content-wrapper">
              <UserHeader 
                userName={userName}
                userData={userData}
                notificationCount={getNewNotificationsCount()}
                onNavigateToNotifications={() => handleSectionChange('notifications')}
                onNavigateToProfile={() => handleSectionChange('personal-info')}
                onLogout={handleLogout}
              />
              
              <div className="section active">
                {activeSection === 'dashboard' && <UserDashboard userName={userName} />}
                {activeSection === 'notifications' && <UserNotifications />}
                {activeSection === 'personal-info' && <PersonalInfo userName={userName} userData={userData} />}
                {activeSection === 'medical-history' && <MedicalHistory userName={userName} patients={patients} />}
              </div>
            </div>
            
            <Footer onSectionChange={handleSectionChange} userRole="user" />
          </div>
        </>
      )}
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <ActivityProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </ActivityProvider>
    </SettingsProvider>
  );
}

export default App;