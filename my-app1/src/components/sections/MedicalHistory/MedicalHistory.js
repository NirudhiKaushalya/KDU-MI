import React, { useState } from 'react';
import styles from './MedicalHistory.module.scss';
import MedicalRecordModal from '../../modals/MedicalRecordModal/MedicalRecordModal';

const MedicalHistory = ({ userName = 'User', patients = [], userData = null }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Helper function to format date for HTML date input (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and format the date
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Get current user's index number for filtering
  const currentUserIndexNo = userData?.indexNo;
  
  // If userData is not available, try to extract from userName or show message
  if (!currentUserIndexNo) {
    console.log('MedicalHistory - No userData available, cannot filter records');
  }
  
  // Debug logging
  console.log('MedicalHistory - Current user index:', currentUserIndexNo);
  console.log('MedicalHistory - All patients:', patients);
  console.log('MedicalHistory - Patient index numbers:', patients.map(p => p.indexNo));
  
  // Filter patients to show only records for the current user
  const userPatients = currentUserIndexNo 
    ? patients.filter(patient => patient.indexNo === currentUserIndexNo)
    : [];
    
  console.log('MedicalHistory - Filtered user patients:', userPatients);
  
  // Convert filtered patients to medical records format
  const medicalRecords = userPatients.map((patient, index) => {
    console.log('MedicalHistory - Processing patient:', patient);
    
    const rawDate = patient.admittedDate || patient.consultedDate || '';
    const formattedDate = formatDateForInput(rawDate);
    
    return {
      id: patient.id,
      recordNo: patient.indexNo,
      indexNo: patient.indexNo, // For the modal
      date: rawDate, // Keep original for display
      consultedDate: formattedDate, // Formatted for the modal input
      consultedTime: patient.admittedTime || patient.consultedTime || '',
      diagnosis: patient.medicalCondition || patient.condition || '',
      medicalCondition: patient.medicalCondition || patient.condition || '', // For the modal
      role: 'Doctor',
      patientName: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
      labReports: patient.labReports || null,
      prescribedMedicines: patient.prescribedMedicines || [],
      additionalNotes: patient.additionalNotes || '',
      reasonForConsultation: patient.reason || patient.reasonForConsultation || ''
    };
  });
  
  console.log('MedicalHistory - Final medical records:', medicalRecords);

  const handleRecordClick = (record) => {
    console.log('MedicalHistory - Record clicked:', record);
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecord(null);
  };


  return (
    <div className={styles.medicalHistory}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Welcome {userName}!</h1>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Medical History</h2>
        </div>
        
        <div className={styles.tableContainer}>
          {!currentUserIndexNo ? (
            <div className={styles.noRecordsMessage}>
              <div className={styles.noRecordsIcon}>⚠️</div>
              <h3 className={styles.noRecordsTitle}>User Data Not Available</h3>
              <p className={styles.noRecordsDescription}>
                Unable to load your medical records. Please refresh the page or contact support if the issue persists.
              </p>
            </div>
          ) : medicalRecords.length > 0 ? (
            <table className={styles.medicalRecordsTable}>
              <thead>
                <tr>
                  <th>Index No</th>
                  <th>Consulted Date</th>
                  <th>Condition</th>
                  <th>Lab Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicalRecords.map((record) => (
                  <tr key={record.id} className={styles.tableRow}>
                    <td className={styles.recordNo}>#{record.recordNo}</td>
                    <td className={styles.date}>{record.date}</td>
                    <td className={styles.condition}>{record.diagnosis}</td>
                    <td className={styles.labReports}>
                      {record.labReports && record.labReports.length > 0 ? (
                        <span className={styles.labReportsIndicator}>
                          📄 {record.labReports.length} file(s)
                        </span>
                      ) : (
                        <span className={styles.noReports}>No reports</span>
                      )}
                    </td>
                    <td className={styles.actions}>
                      <button 
                        className={styles.viewButton}
                        onClick={() => handleRecordClick(record)}
                      >
                        👁 View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={styles.noRecordsMessage}>
              <div className={styles.noRecordsIcon}>📋</div>
              <h3 className={styles.noRecordsTitle}>No Medical Records Found</h3>
              <p className={styles.noRecordsDescription}>
                You don't have any medical records yet. Your medical history will appear here once you have been admitted or consulted.
              </p>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <MedicalRecordModal
          record={selectedRecord}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default MedicalHistory;
