import React, { useState } from 'react';
import styles from './PatientFilterModal.module.scss';

const PatientFilterModal = ({ onClose, onApplyFilters }) => {
  const [filters, setFilters] = useState({
    condition: 'Any',
    startDate: '',
    endDate: '',
    minAge: '',
    maxAge: '',
    indexNumber: ''
  });

  const conditions = ['Any', 'Surgical', 'Medical', 'Orthopedic', 'Other'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleClear = () => {
    setFilters({
      condition: 'Any',
      startDate: '',
      endDate: '',
      minAge: '',
      maxAge: '',
      indexNumber: ''
    });
  };

  const getAppliedFiltersText = () => {
    const applied = [];
    if (filters.condition !== 'Any') applied.push(filters.condition);
    return applied.length > 0 ? applied.join(', ') : 'No filters applied';
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Filter Patients</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <span className={styles.closeIcon}>×</span>
          </button>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="indexNumber">Index Number</label>
          <input
            type="text"
            id="indexNumber"
            name="indexNumber"
            className={styles.formControl}
            placeholder="Enter index number"
            value={filters.indexNumber}
            onChange={handleChange}
          />
        </div>


        <div className={styles.formGroup}>
          <label htmlFor="condition">Condition</label>
          <select
            id="condition"
            name="condition"
            className={styles.formControl}
            value={filters.condition}
            onChange={handleChange}
          >
            {conditions.map(condition => (
              <option key={condition} value={condition}>{condition}</option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dateRange">Date Range</label>
          <div className={styles.dateRange}>
            <input
              type="date"
              name="startDate"
              className={styles.formControl}
              placeholder="mm/dd/yyyy"
              value={filters.startDate}
              onChange={handleChange}
            />
            <span className={styles.dateSeparator}>to</span>
            <input
              type="date"
              name="endDate"
              className={styles.formControl}
              placeholder="mm/dd/yyyy"
              value={filters.endDate}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="ageRange">Age Range</label>
          <div className={styles.ageRange}>
            <div className={styles.ageInput}>
              <input
                type="number"
                name="minAge"
                className={styles.formControl}
                placeholder="Min"
                value={filters.minAge}
                onChange={handleChange}
                min="0"
                max="150"
              />
            </div>
            <div className={styles.ageInput}>
              <input
                type="number"
                name="maxAge"
                className={styles.formControl}
                placeholder="Max"
                value={filters.maxAge}
                onChange={handleChange}
                min="0"
                max="150"
              />
            </div>
          </div>
        </div>

        <div className={styles.appliedFilters}>
          <strong>Applied:</strong> {getAppliedFiltersText()}
        </div>

        <div className={styles.formActions}>
          <button 
            type="button" 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={handleClear}
          >
            Clear
          </button>
          <button 
            type="button" 
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleApply}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientFilterModal;