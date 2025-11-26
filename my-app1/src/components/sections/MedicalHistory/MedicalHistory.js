import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './MedicalHistory.module.scss';
import MedicalRecordModal from '../../modals/MedicalRecordModal/MedicalRecordModal';

const MedicalHistory = ({ userName = 'User', patients = [], userData = null }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
  
  // Get current user's index number
  const currentUserIndexNo = userData?.indexNo;

  // Fetch medical records from database
  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!currentUserIndexNo) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Search for all patient records with this index number
        const response = await axios.get(`http://localhost:8000/api/patient/search?query=${encodeURIComponent(currentUserIndexNo)}`);
        const patientsData = response.data.patients || [];
        
        console.log('MedicalHistory - Fetched records from DB:', patientsData);
        
        // Filter to ensure exact match on indexNo
        const userRecords = patientsData.filter(patient => patient.indexNo === currentUserIndexNo);
        
        // Convert to medical records format
        const records = userRecords.map((patient) => {
          const rawDate = patient.admittedDate || patient.consultedDate || '';
          const formattedDate = formatDateForInput(rawDate);
          
          return {
            id: patient._id || patient.id,
            recordNo: patient.indexNo,
            indexNo: patient.indexNo,
            date: rawDate,
            consultedDate: formattedDate,
            consultedTime: patient.admittedTime || patient.consultedTime || '',
            diagnosis: patient.medicalCondition || patient.condition || '',
            medicalCondition: patient.medicalCondition || patient.condition || '',
            role: 'Doctor',
            patientName: patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim(),
            labReports: patient.labReports || null,
            prescribedMedicines: patient.prescribedMedicines || [],
            additionalNotes: patient.additionalNotes || '',
            reasonForConsultation: patient.reason || patient.reasonForConsultation || ''
          };
        });
        
        // Sort by date (newest first)
        records.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        setMedicalRecords(records);
        console.log('MedicalHistory - Final medical records:', records);
      } catch (err) {
        console.error('Error fetching medical records:', err);
        setError('Failed to load medical records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicalRecords();
  }, [currentUserIndexNo]);

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
          {loading ? (
            <div className={styles.noRecordsMessage}>
              <div className={styles.noRecordsIcon}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#8b5cf6' }}></i>
              </div>
              <h3 className={styles.noRecordsTitle}>Loading Medical Records...</h3>
              <p className={styles.noRecordsDescription}>
                Please wait while we fetch your medical history.
              </p>
            </div>
          ) : error ? (
            <div className={styles.noRecordsMessage}>
              <div className={styles.noRecordsIcon}>⚠️</div>
              <h3 className={styles.noRecordsTitle}>Error Loading Records</h3>
              <p className={styles.noRecordsDescription}>{error}</p>
            </div>
          ) : !currentUserIndexNo ? (
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
                  <th>Consulted Time</th>
                  <th>Condition</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {medicalRecords.map((record) => (
                  <tr key={record.id} className={styles.tableRow}>
                    <td className={styles.recordNo}>#{record.recordNo}</td>
                    <td className={styles.date}>{record.date}</td>
                    <td className={styles.time}>{record.consultedTime || 'N/A'}</td>
                    <td className={styles.condition}>{record.diagnosis}</td>
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
