import React, { useState } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './MedicalRecordModal.module.scss';
import jsPDF from 'jspdf';

const MedicalRecordModal = ({ record, onClose, onSave }) => {
  const { addNotification } = useNotifications();
  const [formData, setFormData] = useState({
    indexNo: record?.indexNo || '',
    consultedDate: record?.consultedDate || '',
    medicalCondition: record?.medicalCondition || '',
    additionalNotes: record?.additionalNotes || '',
    reasonForConsultation: record?.reasonForConsultation || '',
    consultedTime: record?.consultedTime || '',
    labReports: record?.labReports || null
  });

  const isEditMode = !!record;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    
    // Add notification for new medical record
    if (!isEditMode) {
      addNotification({
        type: 'info',
        icon: '📋',
        title: 'New Medical Record Created',
        description: `Medical record created for patient ${formData.indexNo} - ${formData.medicalCondition}`,
        category: 'medical-record'
      });
    }
    
    onClose();
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `Medical Record - ${formData.indexNo}`,
      subject: 'Medical Record',
      author: 'KDU Medical Inventory Management System',
      creator: 'KDU Medical System'
    });

    // Add header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('KDU Medical Inventory Management System', 20, 20);
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Medical Record', 20, 35);

    // Add patient information
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    
    let yPosition = 50;
    
    // Patient details
    doc.setFont(undefined, 'bold');
    doc.text('Patient Information:', 20, yPosition);
    yPosition += 10;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Index Number: ${formData.indexNo}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Consultation Date: ${formData.consultedDate}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Consultation Time: ${formData.consultedTime}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Medical Condition: ${formData.medicalCondition}`, 20, yPosition);
    yPosition += 8;
    
    doc.text(`Reason for Consultation: ${formData.reasonForConsultation}`, 20, yPosition);
    yPosition += 15;

    // Prescribed medicines section
    if (record?.prescribedMedicines && record.prescribedMedicines.length > 0) {
      doc.setFont(undefined, 'bold');
      doc.text('Prescribed Medicines:', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      record.prescribedMedicines.forEach((medicine, index) => {
        doc.text(`${index + 1}. ${medicine.name} - Quantity: ${medicine.quantity}`, 30, yPosition);
        yPosition += 8;
      });
      yPosition += 10;
    }

    // Additional notes section
    if (formData.additionalNotes) {
      doc.setFont(undefined, 'bold');
      doc.text('Additional Notes:', 20, yPosition);
      yPosition += 10;
      
      doc.setFont(undefined, 'normal');
      const splitNotes = doc.splitTextToSize(formData.additionalNotes, 170);
      doc.text(splitNotes, 20, yPosition);
      yPosition += splitNotes.length * 5 + 10;
    }

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('Generated on: ' + new Date().toLocaleString(), 20, pageHeight - 20);
    doc.text('KDU Medical Inventory Management System', 20, pageHeight - 10);

    // Download the PDF
    doc.save(`Medical_Record_${formData.indexNo}_${formData.consultedDate}.pdf`);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isEditMode ? 'Medical Record' : 'New Record'}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formContainer}>
            <div className={styles.leftColumn}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Index No:</label>
                <input
                  type="text"
                  value={formData.indexNo}
                  onChange={(e) => handleInputChange('indexNo', e.target.value)}
                  placeholder="Enter index number"
                  className={styles.formInput}
                  readOnly={isEditMode}
                  required
                />
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Consulted Date:</label>
                <div className={styles.dateInputWrapper}>
                  <input
                    type="date"
                    value={formData.consultedDate}
                    onChange={(e) => handleInputChange('consultedDate', e.target.value)}
                    className={styles.formInput}
                    readOnly={isEditMode}
                    required
                  />
                  <span className={styles.calendarIcon}>📅</span>
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Medical Condition:</label>
                <select
                  value={formData.medicalCondition}
                  onChange={(e) => handleInputChange('medicalCondition', e.target.value)}
                  className={styles.formSelect}
                  disabled={isEditMode}
                  required
                >
                  <option value="">Select a condition</option>
                  <option value="Surgical">Surgical</option>
                  <option value="Medical">Medical</option>
                  <option value="Orthopedic">Orthopedic</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Additional Notes:</label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Enter any additional notes or observations..."
                  className={styles.formTextarea}
                  rows={4}
                  readOnly={isEditMode}
                />
              </div>

              <div className={styles.formField}>
                <div className={styles.searchWrapper}>
                  <input
                    type="text"
                    placeholder="Search Medicines..."
                    className={styles.searchInput}
                  />
                  <span className={styles.searchIcon}>🔍</span>
                </div>
              </div>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Reason for Consultation:</label>
                <select
                  value={formData.reasonForConsultation}
                  onChange={(e) => handleInputChange('reasonForConsultation', e.target.value)}
                  className={styles.formSelect}
                  disabled={isEditMode}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="Routine Check-up">Routine Check-up</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Prescription Refill">Prescription Refill</option>
                  <option value="New Symptoms">New Symptoms</option>
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Consulted Time:</label>
                <div className={styles.timeInputWrapper}>
                  <input
                    type="time"
                    value={formData.consultedTime}
                    onChange={(e) => handleInputChange('consultedTime', e.target.value)}
                    className={styles.formInput}
                    readOnly={isEditMode}
                    required
                  />
                  <span className={styles.clockIcon}>🕐</span>
                </div>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Lab Reports:</label>
                <div className={styles.fileUploadWrapper}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleInputChange('labReports', e.target.files[0])}
                    className={styles.fileInput}
                    id="labReports"
                  />
                  <label htmlFor="labReports" className={styles.fileUploadLabel}>
                    <span className={styles.uploadIcon}>📄</span>
                    Upload PDFs
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              {isEditMode ? 'Close' : 'Cancel'}
            </button>
            {isEditMode && (
              <button type="button" className={styles.downloadButton} onClick={handleDownloadPDF}>
                📄 Download Record
              </button>
            )}
            {!isEditMode && (
              <button type="submit" className={styles.saveButton}>
                Save Record
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default MedicalRecordModal;
