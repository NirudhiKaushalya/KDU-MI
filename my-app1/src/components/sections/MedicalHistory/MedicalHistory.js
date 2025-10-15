import React, { useState } from 'react';
import styles from './MedicalHistory.module.scss';
import MedicalRecordModal from '../../modals/MedicalRecordModal/MedicalRecordModal';

const MedicalHistory = ({ userName = 'User', patients = [] }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  // Convert patients to medical records format
  const medicalRecords = patients.map((patient, index) => ({
    id: patient.id,
    recordNo: patient.indexNo,
    date: patient.admittedDate || patient.consultedDate || '',
    consultedTime: patient.admittedTime || patient.consultedTime || '',
    diagnosis: patient.medicalCondition || patient.condition || '',
    role: 'Doctor',
    patientName: `${patient.firstName} ${patient.lastName}`,
    labReports: patient.labReports || null,
    prescribedMedicines: patient.prescribedMedicines || [],
    additionalNotes: patient.additionalNotes || '',
    reasonForConsultation: patient.reason || patient.reasonForConsultation || ''
  }));

  const handleRecordClick = (record) => {
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
