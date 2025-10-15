import React, { useState, useEffect } from 'react';
import styles from './EditPatientModal.module.scss';

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
    // Create a URL for the file and open it in a new tab
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
      // Clean up the URL after a delay to free memory
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else if (file.url) {
      // If file has a URL property (for stored files)
      window.open(file.url, '_blank');
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
