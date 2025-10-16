import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './MedicalRecordModal.module.scss';
import jsPDF from 'jspdf';

const MedicalRecordModal = ({ record, onClose, onSave }) => {
  const { addNotification } = useNotifications();
  
  // Debug logging
  console.log('MedicalRecordModal - Received record:', record);
  
  const [formData, setFormData] = useState({
    indexNo: record?.indexNo || '',
    consultedDate: record?.consultedDate || '',
    medicalCondition: record?.medicalCondition || '',
    additionalNotes: record?.additionalNotes || '',
    reasonForConsultation: record?.reasonForConsultation || '',
    consultedTime: record?.consultedTime || '',
    labReports: record?.labReports || null
  });
  
  // Debug logging for form data
  console.log('MedicalRecordModal - Form data:', formData);
  console.log('MedicalRecordModal - Lab reports data:', formData.labReports);
  console.log('MedicalRecordModal - Lab reports type:', typeof formData.labReports);
  console.log('MedicalRecordModal - Lab reports length:', formData.labReports?.length);

  // Update form data when record prop changes
  useEffect(() => {
    if (record) {
      setFormData({
        indexNo: record.indexNo || '',
        consultedDate: record.consultedDate || '',
        medicalCondition: record.medicalCondition || '',
        additionalNotes: record.additionalNotes || '',
        reasonForConsultation: record.reasonForConsultation || '',
        consultedTime: record.consultedTime || '',
        labReports: record.labReports || null
      });
    }
  }, [record]);

  const isEditMode = !!record;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewLabReport = (file) => {
    console.log('=== LAB REPORT VIEW DEBUG ===');
    console.log('File object:', file);
    console.log('File type:', typeof file);
    console.log('File instanceof File:', file instanceof File);
    console.log('File properties:', Object.keys(file || {}));
    console.log('File stringified:', JSON.stringify(file, null, 2));
    console.log('================================');
    
    // Always create a PDF for now to test if the button works
    try {
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Lab Report Viewer', 20, 20);
      doc.setFontSize(12);
      
      if (file && file.name) {
        doc.text(`File Name: ${file.name}`, 20, 40);
      } else if (typeof file === 'string') {
        doc.text(`File Name: ${file}`, 20, 40);
      } else {
        doc.text('File Name: Unknown', 20, 40);
      }
      
      doc.text('File Type:', 20, 60);
      doc.text(`- Type: ${typeof file}`, 20, 70);
      doc.text(`- Is File: ${file instanceof File}`, 20, 80);
      doc.text(`- Has URL: ${file && file.url ? 'Yes' : 'No'}`, 20, 90);
      doc.text(`- Has Data: ${file && file.data ? 'Yes' : 'No'}`, 20, 100);
      
      doc.text('Debug Information:', 20, 120);
      doc.text('This PDF was generated to test the', 20, 130);
      doc.text('lab report viewing functionality.', 20, 140);
      doc.text('If you can see this, the button works!', 20, 150);
      
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('PDF generated and opened successfully');
    } catch (error) {
      console.error('Error creating PDF:', error);
      alert('Error creating lab report viewer. Please check console for details.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    
    // Medical record created successfully (notification handled by patient admission flow)
    
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
                {isEditMode ? (
                  // View mode - show uploaded lab reports
                  <div className={styles.labReportsView}>
                    {formData.labReports && formData.labReports.length > 0 ? (
                      <div className={styles.labReportsList}>
                        {formData.labReports.map((file, index) => (
                          <div key={index} className={styles.labReportItem}>
                            <span className={styles.fileIcon}>📄</span>
                            <div className={styles.fileInfo}>
                              <span className={styles.fileName}>
                                {file.name || (typeof file === 'string' ? file : `Lab Report ${index + 1}`)}
                              </span>
                              <span className={styles.fileSize}>
                                {file.size ? `(${(file.size / 1024).toFixed(1)} KB)` : ''}
                              </span>
                            </div>
                            <button 
                              type="button"
                              className={styles.viewFileButton}
                              onClick={() => {
                                console.log('View button clicked for file:', file);
                                handleViewLabReport(file);
                              }}
                              title="View lab report"
                            >
                              👁 View
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.noLabReports}>
                        <span>No lab reports uploaded</span>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit mode - file upload
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
                )}
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
