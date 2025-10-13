import React, { useState } from 'react';
import styles from './AddPatientModal.module.scss';

const AddPatientModal = ({ onClose, onAddPatient }) => {
  const [formData, setFormData] = useState({
    indexNo: '',
    name: '',
    age: '',
    gender: '',
    condition: '',
    additionalNotes: '',
    role: ''
  });

  const conditions = [
    'Select a condition',
    'Surgical',
    'Medical',
    'Orthopedic',
    'Other'
  ];

  const genders = ['Select gender', 'Male', 'Female', 'Other'];
  const roles = ['Select role', 'Dayscholar', 'Boarder', 'Staff', 'Faculty', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.condition === 'Select a condition') {
      alert('Please select a medical condition');
      return;
    }
    if (formData.gender === 'Select gender') {
      alert('Please select a gender');
      return;
    }
    if (formData.role === 'Select role') {
      alert('Please select a role');
      return;
    }
    if (!formData.name.trim()) {
      alert('Please enter patient name');
      return;
    }
    if (!formData.age || formData.age <= 0) {
      alert('Please enter a valid age');
      return;
    }

    // Generate a random ID for demo purposes
    const newPatient = {
      id: `P${Math.floor(1000 + Math.random() * 9000)}`,
      indexNo: formData.indexNo,
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      condition: formData.condition,
      additionalNotes: formData.additionalNotes,
      role: formData.role
    };
    
    if (onAddPatient) {
      onAddPatient(newPatient);
    }
    
    onClose();
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <h3 className={styles.modalTitle}>Admit Patient</h3>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="indexNo" className={styles.boldLabel}>Index No:</label>
            <input
              type="text"
              id="indexNo"
              name="indexNo"
              className={styles.formControl}
              placeholder="Enter index number"
              value={formData.indexNo}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.boldLabel}>Patient Name:</label>
            <input
              type="text"
              id="name"
              name="name"
              className={styles.formControl}
              placeholder="Enter patient name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="age" className={styles.boldLabel}>Age:</label>
            <input
              type="number"
              id="age"
              name="age"
              className={styles.formControl}
              placeholder="Enter age"
              value={formData.age}
              onChange={handleChange}
              min="1"
              max="120"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="gender" className={styles.boldLabel}>Gender:</label>
            <select
              name="gender"
              className={styles.formControl}
              value={formData.gender}
              onChange={handleChange}
              required
            >
              {genders.map(gender => (
                <option key={gender} value={gender}>{gender}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <div className={styles.checkboxLabel}>
              <span className={styles.boldLabel}>Medical Condition:</span>
            </div>
            <select
              name="condition"
              className={styles.formControl}
              value={formData.condition}
              onChange={handleChange}
              required
            >
              {conditions.map(condition => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role" className={styles.boldLabel}>Role:</label>
            <select
              name="role"
              className={styles.formControl}
              value={formData.role}
              onChange={handleChange}
              required
            >
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <div className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={true}
                readOnly
                className={styles.checkbox}
              />
              <span className={styles.boldLabel}>Additional Notes:</span>
            </div>
            <textarea
              name="additionalNotes"
              className={styles.formControl}
              rows="4"
              placeholder="Enter any additional notes about the patient"
              value={formData.additionalNotes}
              onChange={handleChange}
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnCancel}`} 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnAdmit}`}
            >
              Admit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPatientModal;