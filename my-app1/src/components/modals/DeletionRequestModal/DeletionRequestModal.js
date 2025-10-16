import React, { useState } from 'react';
import axios from 'axios';
import styles from './DeletionRequestModal.module.scss';

const DeletionRequestModal = ({ isOpen, onClose, patient, onRequestSent }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      setError('Please provide a reason for the deletion request');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Send patient details to help backend find the correct medical record
      const response = await axios.post('http://localhost:8000/api/deletionRequest/create', {
        medicalRecordId: patient._id || patient.id, // Try _id first, fallback to id
        patientIndexNo: patient.indexNo,
        consultedDate: patient.consultedDate || patient.admittedDate,
        condition: patient.condition,
        reason: reason.trim()
      });

      console.log('Deletion request sent:', response.data);
      alert('Deletion request sent successfully! The patient will be notified and can approve or reject the request.');
      
      if (onRequestSent) {
        onRequestSent();
      }
      
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error sending deletion request:', error);
      setError(error.response?.data?.message || 'Failed to send deletion request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            <i className="fas fa-exclamation-triangle"></i>
            Request Medical Record Deletion
          </h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.warningBox}>
            <i className="fas fa-info-circle"></i>
            <p>
              You are requesting to delete a medical record. This action will send a request to the patient 
              (<strong>{patient?.indexNo}</strong>) who must approve the deletion before the record is removed.
            </p>
          </div>

          <div className={styles.patientInfo}>
            <h3>Patient Information:</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.label}>Index Number:</span>
                <span className={styles.value}>{patient?.indexNo || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Condition:</span>
                <span className={styles.value}>{patient?.condition || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Consulted Date:</span>
                <span className={styles.value}>{patient?.consultedDate || patient?.admittedDate || 'N/A'}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.label}>Reason:</span>
                <span className={styles.value}>{patient?.reason || patient?.reasonForConsultation || 'N/A'}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="reason" className={styles.formLabel}>
                Reason for Deletion Request *
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className={styles.textarea}
                placeholder="Please provide a detailed reason for requesting the deletion of this medical record..."
                rows={4}
                required
              />
              {error && <span className={styles.errorText}>{error}</span>}
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting || !reason.trim()}
              >
                {isSubmitting ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending Request...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i>
                    Send Deletion Request
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeletionRequestModal;
