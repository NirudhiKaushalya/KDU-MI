import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
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
  const [userValidation, setUserValidation] = useState({ status: null, message: '' });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Search medicines from database
  const searchMedicinesFromDB = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/medicines/search?query=${encodeURIComponent(query)}`);
      const medicinesData = response.data.medicines || [];
      
      // Filter out medicines that are already prescribed and have stock > 0
      const filteredMedicines = medicinesData
        .filter(med => {
          const alreadyPrescribed = formData.prescribedMedicines.some(p => p.name === med.medicineName);
          const hasStock = parseInt(med.quantity) > 0;
          return !alreadyPrescribed && hasStock;
        })
        .map(med => ({
          id: med._id || med.id,
          name: med.medicineName,
          brand: med.brand,
          category: med.category,
          quantity: med.quantity,
          stockLevel: med.stockLevel
        }));
      
      setSearchResults(filteredMedicines);
      setShowDropdown(filteredMedicines.length > 0);
    } catch (error) {
      console.error('Error searching medicines:', error);
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setIsSearching(false);
    }
  }, [formData.prescribedMedicines]);

  // Debounce medicine search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (medicineSearch.trim()) {
        searchMedicinesFromDB(medicineSearch);
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [medicineSearch, searchMedicinesFromDB]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Validate user when index number is entered
    if (field === 'indexNo' && value.trim()) {
      validateUser(value.trim());
    } else if (field === 'indexNo' && !value.trim()) {
      setUserValidation({ status: null, message: '' });
    }
  };

  const validateUser = async (indexNo) => {
    try {
      setUserValidation({ status: 'validating', message: 'Validating user...' });
      const response = await axios.get(`http://localhost:8000/api/user/getByIndexNo/${indexNo}`);
      setUserValidation({ 
        status: 'valid', 
        message: `✓ User found: ${response.data.userName}` 
      });
    } catch (error) {
      setUserValidation({ 
        status: 'invalid', 
        message: '✗ User not registered in the system' 
      });
    }
  };

  const handleMedicineQuantityChange = (index, quantity) => {
    const updatedMedicines = [...formData.prescribedMedicines];
    let newQuantity = parseInt(quantity) || 0;
    
    // Validate against max quantity (available stock)
    const maxQty = updatedMedicines[index].maxQuantity || 999;
    if (newQuantity > maxQty) {
      newQuantity = maxQty;
      alert(`Maximum available stock is ${maxQty} units.`);
    }
    if (newQuantity < 1) {
      newQuantity = 1;
    }
    
    updatedMedicines[index].quantity = newQuantity;
    setFormData(prev => ({
      ...prev,
      prescribedMedicines: updatedMedicines
    }));
  };

  const handleAddMedicine = (medicine) => {
    const medicineName = typeof medicine === 'string' ? medicine : medicine.name;
    const maxQuantity = typeof medicine === 'object' ? parseInt(medicine.quantity) : 999;
    
    if (medicineName && !formData.prescribedMedicines.find(m => m.name === medicineName)) {
      setFormData(prev => ({
        ...prev,
        prescribedMedicines: [...prev.prescribedMedicines, { 
          name: medicineName, 
          quantity: 1,
          maxQuantity: maxQuantity,
          brand: medicine.brand || '',
          category: medicine.category || ''
        }]
      }));
    }
    setMedicineSearch('');
    setSearchResults([]);
    setShowDropdown(false);
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

    // Check if user validation is invalid
    if (userValidation.status === 'invalid') {
      alert('Cannot proceed: User is not registered in the system. Please register the user first.');
      return;
    }

    // Check if user validation is still in progress
    if (userValidation.status === 'validating') {
      alert('Please wait for user validation to complete.');
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
    
    // Reset validation state
    setUserValidation({ status: null, message: '' });
    
    // Clear file input
    const fileInput = document.getElementById('labReports');
    if (fileInput) {
      fileInput.value = '';
    }
    
    // Close modal
    onClose();
  };

  // Reset form and validation when modal is closed
  useEffect(() => {
    if (!isOpen) {
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
      setUserValidation({ status: null, message: '' });
      setMedicineSearch('');
      setSearchResults([]);
      setShowDropdown(false);
    }
  }, [isOpen]);

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
                  className={userValidation.status === 'invalid' ? styles.errorInput : ''}
                />
                {userValidation.message && (
                  <div className={`${styles.validationMessage} ${styles[userValidation.status]}`}>
                    {userValidation.message}
                  </div>
                )}
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
                  onFocus={() => medicineSearch.length >= 2 && searchResults.length > 0 && setShowDropdown(true)}
                />
                {isSearching && <i className="fas fa-spinner fa-spin" style={{ marginLeft: '8px', color: '#6b7280' }}></i>}
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className={styles.medicineDropdown}>
                  {searchResults.map(medicine => (
                    <button
                      key={medicine.id}
                      type="button"
                      className={styles.medicineOption}
                      onClick={() => handleAddMedicine(medicine)}
                    >
                      <div className={styles.medicineOptionMain}>
                        <span className={styles.medicineName}>{medicine.name}</span>
                        <span className={styles.medicineBrand}>{medicine.brand}</span>
                      </div>
                      <div className={styles.medicineOptionMeta}>
                        <span className={styles.medicineCategory}>{medicine.category}</span>
                        <span className={`${styles.medicineStock} ${parseInt(medicine.quantity) <= 10 ? styles.lowStock : ''}`}>
                          Stock: {medicine.quantity}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {medicineSearch.length >= 2 && !isSearching && searchResults.length === 0 && (
                <div className={styles.medicineDropdown}>
                  <div className={styles.noResults}>No medicines found</div>
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
                        <td>
                          <div className={styles.medicineNameCell}>
                            <span className={styles.medicineCellName}>{medicine.name}</span>
                            {medicine.brand && <span className={styles.medicineCellBrand}>{medicine.brand}</span>}
                          </div>
                        </td>
                        <td>
                          <div className={styles.quantityWrapper}>
                            <input
                              type="number"
                              min="1"
                              max={medicine.maxQuantity || 999}
                              value={medicine.quantity}
                              onChange={(e) => handleMedicineQuantityChange(index, e.target.value)}
                              className={styles.quantityInput}
                            />
                            {medicine.maxQuantity && (
                              <span className={styles.maxQuantity}>/ {medicine.maxQuantity}</span>
                            )}
                          </div>
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
