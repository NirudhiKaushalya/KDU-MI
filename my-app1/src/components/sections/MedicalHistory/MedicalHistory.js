import React, { useState } from 'react';
import styles from './MedicalHistory.module.scss';
import MedicalRecordModal from '../../modals/MedicalRecordModal/MedicalRecordModal';

const MedicalHistory = ({ userName = 'User' }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const medicalRecords = [
    {
      id: 1,
      recordNo: 'REC001',
      date: '2023-10-27',
      consultedTime: '09:30',
      diagnosis: 'Hypertension',
      role: 'Doctor'
    },
    {
      id: 2,
      recordNo: 'REC002',
      date: '2023-09-15',
      consultedTime: '14:15',
      diagnosis: 'Diabetes',
      role: 'Nurse'
    },
    {
      id: 3,
      recordNo: 'REC003',
      date: '2023-08-01',
      consultedTime: '11:45',
      diagnosis: 'Common Cold',
      role: 'Doctor'
    },
    {
      id: 4,
      recordNo: 'REC004',
      date: '2023-06-20',
      consultedTime: '16:20',
      diagnosis: 'Fever',
      role: 'Nurse'
    }
  ];

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
                <th>Record No</th>
                <th>Consulted Date</th>
                <th>Consulted Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicalRecords.map((record) => (
                <tr key={record.id} className={styles.tableRow}>
                  <td className={styles.recordNo}>#{record.recordNo}</td>
                  <td className={styles.date}>{record.date}</td>
                  <td className={styles.consultedTime}>{record.consultedTime}</td>
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
