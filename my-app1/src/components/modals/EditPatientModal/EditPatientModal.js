import React, { useState, useEffect } from 'react';
import styles from './EditPatientModal.module.scss';
import jsPDF from 'jspdf';

const EditPatientModal = ({ isOpen, onClose, patient, onUpdatePatient, readOnly = false }) => {
  const [formData, setFormData] = useState({
    id: '',
    indexNo: '',
    name: '',
    age: '',
    gender: '',
    condition: '',
    additionalNotes: '',
    role: '',
    reasonForConsultation: '',
    consultedDate: '',
    consultedTime: '',
    prescribedMedicines: [],
    labReports: null
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (patient) {
      console.log('Patient data:', patient);
      console.log('Patient labReports:', patient.labReports);
      setFormData({
        id: patient.id || '',
        indexNo: patient.indexNo || '',
        name: patient.name || '',
        age: patient.age || '',
        gender: patient.gender || '',
        condition: patient.condition || '',
        additionalNotes: patient.additionalNotes || '',
        role: patient.role || '',
        reasonForConsultation: patient.reasonForConsultation || patient.reason || '',
        consultedDate: patient.consultedDate || patient.admittedDate || '',
        consultedTime: patient.consultedTime || '10:30 AM',
        prescribedMedicines: Array.isArray(patient.prescribedMedicines) ? patient.prescribedMedicines : [
          { name: 'vitamin c', quantity: '10' }
        ],
        labReports: patient.labReports || null
      });
    }
  }, [patient]);

  const conditions = ['Hypertension', 'Diabetes', 'Respiratory', 'Cardiovascular', 'Neurological', 'Other'];
  const genders = ['Male', 'Female', 'Other'];
  const roles = ['Dayscholar', 'Boarder', 'Staff', 'Faculty', 'Other'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.indexNo.trim()) {
      newErrors.indexNo = 'Index number is required';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'Patient name is required';
    }
    if (!formData.age || formData.age <= 0) {
      newErrors.age = 'Age must be greater than 0';
    }
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    if (!formData.condition) {
      newErrors.condition = 'Condition is required';
    }
    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleViewLabReport = (file) => {
    console.log('=== LAB REPORT VIEW DEBUG (EditPatientModal) ===');
    console.log('File object:', file);
    console.log('File type:', typeof file);
    console.log('File instanceof File:', file instanceof File);
    console.log('File properties:', Object.keys(file || {}));
    console.log('File stringified:', JSON.stringify(file, null, 2));
    console.log('================================');
    
    try {
      // Handle different types of file data
      if (file instanceof File) {
        // If it's a File object, create object URL and open it
        const url = URL.createObjectURL(file);
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        console.log('Opened file using object URL');
        return;
      }
      
      if (file && typeof file === 'object') {
        // If it has a URL property, open it directly
        if (file.url) {
          window.open(file.url, '_blank');
          console.log('Opened file using URL property');
          return;
        }
        
        // If it has data property (base64), create blob and open
        if (file.data) {
          const byteCharacters = atob(file.data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          console.log('Opened file using base64 data');
          return;
        }
        
        // If it has a path or filename, try to construct URL
        if (file.path || file.filename || file.name) {
          const fileName = file.path || file.filename || file.name;
          // Try to open as a full backend URL
          const url = `http://localhost:8000/uploads/${fileName}`;
          window.open(url, '_blank');
          console.log('Opened file using constructed URL:', url);
          return;
        }
      }
      
      // If it's a string, treat it as a filename or URL
      if (typeof file === 'string') {
        if (file.startsWith('http') || file.startsWith('/')) {
          window.open(file, '_blank');
          console.log('Opened file using string URL:', file);
          return;
        } else {
          // Treat as filename - construct full backend URL
          const url = `http://localhost:8000/uploads/${file}`;
          window.open(url, '_blank');
          console.log('Opened file using filename:', file);
          return;
        }
      }
      
      // Special case: If file is an array (multiple files), handle the first one
      if (Array.isArray(file) && file.length > 0) {
        console.log('File is an array, handling first file:', file[0]);
        handleViewLabReport(file[0]);
        return;
      }
      
      // Fallback: Show detailed error information
      console.error('Unable to open lab report - unsupported format:', file);
      
      // Create a helpful PDF with instructions
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text('Lab Report Information', 20, 20);
      doc.setFontSize(12);
      
      if (file && file.name) {
        doc.text(`File Name: ${file.name}`, 20, 40);
      } else if (typeof file === 'string') {
        doc.text(`File Name: ${file}`, 20, 40);
      } else {
        doc.text('File Name: Unknown', 20, 40);
      }
      
      doc.text('File Information:', 20, 60);
      doc.text(`- Type: ${typeof file}`, 20, 70);
      doc.text(`- Is File: ${file instanceof File}`, 20, 80);
      doc.text(`- Properties: ${Object.keys(file || {}).join(', ')}`, 20, 90);
      
      doc.text('Status:', 20, 110);
      doc.text('This lab report was uploaded before the file', 20, 120);
      doc.text('storage system was implemented.', 20, 130);
      doc.text('', 20, 140);
      doc.text('To view lab reports properly:', 20, 150);
      doc.text('1. Re-upload the PDF file', 20, 160);
      doc.text('2. The new system will store files correctly', 20, 170);
      doc.text('3. You will be able to view them normally', 20, 180);
      
      const pdfBlob = doc.output('blob');
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, '_blank');
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('Fallback PDF generated with instructions');
      
    } catch (error) {
      console.error('Error viewing lab report:', error);
      alert('Error viewing lab report. Please check console for details.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const updatedPatient = {
        ...formData,
        _id: patient._id, // Preserve the database ID
        id: patient.id, // Preserve the frontend ID
        age: parseInt(formData.age)
      };

      onUpdatePatient(updatedPatient);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      id: '',
      indexNo: '',
      name: '',
      age: '',
      gender: '',
      condition: '',
      additionalNotes: '',
      role: '',
      reasonForConsultation: '',
      consultedDate: '',
      consultedTime: '',
      prescribedMedicines: [],
      labReports: null
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{readOnly ? 'Medical Record' : 'Edit Patient'}</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          {readOnly ? (
            // Medical Record View Layout
            <div className={styles.medicalRecordLayout}>
              {/* Patient Consultation Details */}
              <div className={styles.consultationDetails}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Index No:</label>
                  <input
                    type="text"
                    value={formData.indexNo || '123456'}
                    className={styles.formInput}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Reason for Consultation:</label>
                  <input
                    type="text"
                    value={formData.reasonForConsultation || 'Follow-up'}
                    className={styles.formInput}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Consulted Date:</label>
                  <div className={styles.dateInputWrapper}>
                    <input
                      type="text"
                      value={formData.consultedDate || '2023/10/27'}
                      className={styles.formInput}
                      disabled
                    />
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Consulted Time:</label>
                  <input
                    type="text"
                    value={formData.consultedTime || '10:30 AM'}
                    className={styles.formInput}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Medical Condition:</label>
                  <input
                    type="text"
                    value={formData.condition || 'Fever'}
                    className={styles.formInput}
                    disabled
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Prescribed Medicines:</label>
                  <div className={styles.medicinesInputWrapper}>
                    <input
                      type="text"
                      value={formData.prescribedMedicines && formData.prescribedMedicines.length > 0 ? formData.prescribedMedicines.map(med => med.name).join(', ') : 'Paracetamol, Amoxicillin'}
                      className={styles.formInput}
                      disabled
                    />
                    <i className="fas fa-plus"></i>
                  </div>
                </div>
              </div>

              {/* Prescribed Medicines Table */}
              <div className={styles.medicinesTable}>
                <table className={styles.medicinesTableContent}>
                  <thead>
                    <tr>
                      <th>MEDICINE NAME</th>
                      <th>ISSUED QUANTITY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prescribedMedicines && formData.prescribedMedicines.length > 0 ? (
                      formData.prescribedMedicines.map((medicine, index) => (
                        <tr key={index}>
                          <td>{medicine.name}</td>
                          <td>{medicine.quantity}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2">No prescribed medicines</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Lab Reports Section */}
              <div className={styles.labReportsSection}>
                <h3 className={styles.sectionTitle}>Lab Reports</h3>
                <div className={styles.labReportsContainer}>
                  {/* Debug info */}
                  {console.log('FormData labReports:', formData.labReports)}
                  {console.log('FormData labReports length:', formData.labReports?.length)}
                  {formData.labReports && formData.labReports.length > 0 ? (
                    <div className={styles.labReportsList}>
                      {formData.labReports.map((file, index) => (
                        <div key={index} className={styles.labReportItem}>
                          <span className={styles.fileIcon}>📄</span>
                          <span className={styles.fileName}>{file.name}</span>
                          <button 
                            type="button"
                            className={styles.viewFileButton}
                            onClick={() => handleViewLabReport(file)}
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
              </div>
            </div>
          ) : (
            // Original Edit Layout
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Patient ID</label>
                <input
                  type="text"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.id ? styles.inputError : ''}`}
                  placeholder="Enter patient ID"
                  disabled
                />
                {errors.id && <span className={styles.errorMessage}>{errors.id}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Index Number *</label>
                <input
                  type="text"
                  name="indexNo"
                  value={formData.indexNo}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.indexNo ? styles.inputError : ''}`}
                  placeholder="Enter index number"
                  required
                />
                {errors.indexNo && <span className={styles.errorMessage}>{errors.indexNo}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Patient Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Enter patient name"
                  required
                />
                {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Age *</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.age ? styles.inputError : ''}`}
                  placeholder="Enter age"
                  min="0"
                  max="120"
                  required
                />
                {errors.age && <span className={styles.errorMessage}>{errors.age}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.gender ? styles.inputError : ''}`}
                  required
                >
                  <option value="">Select gender</option>
                  {genders.map(gender => (
                    <option key={gender} value={gender}>{gender}</option>
                  ))}
                </select>
                {errors.gender && <span className={styles.errorMessage}>{errors.gender}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Condition *</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.condition ? styles.inputError : ''}`}
                  required
                >
                  <option value="">Select condition</option>
                  {conditions.map(condition => (
                    <option key={condition} value={condition}>{condition}</option>
                  ))}
                </select>
                {errors.condition && <span className={styles.errorMessage}>{errors.condition}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Role *</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`${styles.formInput} ${errors.role ? styles.inputError : ''}`}
                  required
                >
                  <option value="">Select role</option>
                  {roles.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                {errors.role && <span className={styles.errorMessage}>{errors.role}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Additional Notes</label>
                <textarea
                  name="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={handleInputChange}
                  className={styles.formTextarea}
                  placeholder="Enter additional notes (optional)"
                  rows="3"
                />
              </div>
            </div>
          )}

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              {readOnly ? 'Close' : 'Cancel'}
            </button>
            {!readOnly && (
              <button type="submit" className={styles.updateButton}>
                <i className="fas fa-save"></i>
                Update Patient
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPatientModal;
