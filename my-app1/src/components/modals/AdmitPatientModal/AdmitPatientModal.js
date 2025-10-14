import React, { useState } from 'react';
import styles from './AdmitPatientModal.module.scss';

const AdmitPatientModal = ({ isOpen, onClose, onAdmitPatient, medicines = [] }) => {
  const [formData, setFormData] = useState({
    indexNo: '',
    consultedDate: '',
    medicalCondition: '',
    reasonForConsultation: '',
    consultedTime: '',
    labReports: null,
    prescribedMedicines: [],
    additionalNotes: ''
  });

  const [medicineSearch, setMedicineSearch] = useState('');

  const medicalConditions = [
    'Select a condition',
    'Surgical',
    'Medical',
    'Orthopedic',
    'Other'
  ];

  const consultationReasons = [
    'Select a reason',
    'Routine Checkup',
    'Emergency',
    'Follow-up',
    'Prescription Refill',
    'Vaccination',
    'Screening',
    'Treatment'
  ];

  // Get available medicines from inventory
  const availableMedicines = medicines.map(medicine => medicine.medicineName);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMedicineQuantityChange = (index, quantity) => {
    const updatedMedicines = [...formData.prescribedMedicines];
    updatedMedicines[index].quantity = parseInt(quantity) || 0;
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: updatedMedicines
    }));
  };

  const handleAddMedicine = (medicineName) => {
    if (medicineName && !formData.prescribedMedicines.find(m => m.name === medicineName)) {
      setFormData(prev => ({
        ...prev,
        prescribedMedicines: [...prev.prescribedMedicines, { name: medicineName, quantity: 1 }]
      }));
    }
    setMedicineSearch('');
  };

  const handleRemoveMedicine = (index) => {
    const updatedMedicines = formData.prescribedMedicines.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: updatedMedicines
    }));
  };

  const handleFileUpload = (event) => {
    const files = event.target.files;
    const pdfFiles = Array.from(files).filter(file => file.type === 'application/pdf');
    
    if (files.length > 0 && pdfFiles.length !== files.length) {
      alert('Please upload only PDF files for lab reports.');
      // Clear the input if non-PDF files were selected
      event.target.value = '';
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      labReports: pdfFiles.length > 0 ? pdfFiles : null
    }));
  };

  const handleRemoveFile = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      labReports: prev.labReports.filter((_, index) => index !== indexToRemove)
    }));
    
    // Clear the file input to allow re-uploading the same file
    const fileInput = document.getElementById('labReports');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.indexNo || !formData.consultedDate || !formData.medicalCondition || formData.medicalCondition === 'Select a condition') {
      alert('Please fill in all required fields (Index No, Consulted Date, and Medical Condition)');
      return;
    }
    
    if (onAdmitPatient) {
      console.log('Admitting patient with formData:', formData);
      console.log('Lab reports in formData:', formData.labReports);
      onAdmitPatient(formData);
    }
    
    // Reset form
    setFormData({
      indexNo: '',
      consultedDate: '',
      medicalCondition: '',
      reasonForConsultation: '',
      consultedTime: '',
      labReports: null,
      prescribedMedicines: [],
      additionalNotes: ''
    });
    
    // Clear file input
    const fileInput = document.getElementById('labReports');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Close modal
    onClose();
  };

  const filteredMedicines = availableMedicines.filter(medicine =>
    medicine.toLowerCase().includes(medicineSearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>New Record</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            {/* Left Column */}
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="indexNo">Index No:</label>
                <input
                  type="text"
                  id="indexNo"
                  value={formData.indexNo}
                  onChange={(e) => handleInputChange('indexNo', e.target.value)}
                  placeholder="Enter index number"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="consultedDate">Consulted Date:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="date"
                    id="consultedDate"
                    value={formData.consultedDate}
                    onChange={(e) => handleInputChange('consultedDate', e.target.value)}
                  />
                  <i className="fas fa-calendar-alt"></i>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="medicalCondition">Medical Condition:</label>
                <select
                  id="medicalCondition"
                  value={formData.medicalCondition}
                  onChange={(e) => handleInputChange('medicalCondition', e.target.value)}
                >
                  {medicalConditions.map(condition => (
                    <option key={condition} value={condition}>
                      {condition}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.formColumn}>
              <div className={styles.formGroup}>
                <label htmlFor="reasonForConsultation">Reason for Consultation:</label>
                <select
                  id="reasonForConsultation"
                  value={formData.reasonForConsultation}
                  onChange={(e) => handleInputChange('reasonForConsultation', e.target.value)}
                >
                  {consultationReasons.map(reason => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="consultedTime">Consulted Time:</label>
                <div className={styles.inputWithIcon}>
                  <input
                    type="time"
                    id="consultedTime"
                    value={formData.consultedTime}
                    onChange={(e) => handleInputChange('consultedTime', e.target.value)}
                  />
                  <i className="fas fa-clock"></i>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="labReports">Lab Reports:</label>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    id="labReports"
                    multiple
                    accept=".pdf,application/pdf"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="labReports" className={styles.fileUploadLabel}>
                    <i className="fas fa-upload"></i>
                    Upload PDF Files
                  </label>
                </div>
                {formData.labReports && formData.labReports.length > 0 && (
                  <div className={styles.fileList}>
                    <p className={styles.fileCount}>
                      {formData.labReports.length} PDF file(s) selected:
                    </p>
                    <ul className={styles.fileNames}>
                      {formData.labReports.map((file, index) => (
                        <li key={index} className={styles.fileName}>
                          <i className="fas fa-file-pdf" style={{ color: '#dc2626', marginRight: '8px' }}></i>
                          <span className={styles.fileNameText}>{file.name}</span>
                          <button
                            type="button"
                            className={styles.removeFileButton}
                            onClick={() => handleRemoveFile(index)}
                            title="Remove file"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Prescribed Medicines Section */}
          <div className={styles.medicinesSection}>
            <div className={styles.medicineSearch}>
              <div className={styles.searchInput}>
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search Medicines..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                />
              </div>
              {medicineSearch && (
                <div className={styles.medicineDropdown}>
                  {filteredMedicines.map(medicine => (
                    <button
                      key={medicine}
                      type="button"
                      className={styles.medicineOption}
                      onClick={() => handleAddMedicine(medicine)}
                    >
                      {medicine}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {formData.prescribedMedicines.length > 0 && (
              <div className={styles.medicinesTable}>
                <table>
                  <thead>
                    <tr>
                      <th>MEDICINE NAME</th>
                      <th>ISSUED QUANTITY</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.prescribedMedicines.map((medicine, index) => (
                      <tr key={index}>
                        <td>{medicine.name}</td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            value={medicine.quantity}
                            onChange={(e) => handleMedicineQuantityChange(index, e.target.value)}
                            className={styles.quantityInput}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => handleRemoveMedicine(index)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Additional Notes Section */}
          <div className={styles.formGroup}>
            <label htmlFor="additionalNotes">Additional Notes:</label>
            <textarea
              id="additionalNotes"
              value={formData.additionalNotes}
              onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
              placeholder="Enter any additional notes, observations, or comments about the patient..."
              rows="4"
              className={styles.textareaField}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdmitPatientModal;
