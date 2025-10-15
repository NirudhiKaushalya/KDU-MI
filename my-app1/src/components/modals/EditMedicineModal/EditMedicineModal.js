import React, { useState, useEffect } from 'react';
import styles from './EditMedicineModal.module.scss';

const EditMedicineModal = ({ isOpen, onClose, medicine, onUpdateMedicine }) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    brand: '',
    quantity: '',
    lowStockThreshold: '',
    expiryDate: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (medicine) {
      setFormData({
        id: medicine.id || '',
        name: medicine.medicineName || medicine.name || '',
        category: medicine.category || '',
        brand: medicine.brand || '',
        quantity: medicine.quantity || '',
        lowStockThreshold: medicine.lowStockThreshold || '',
        expiryDate: medicine.expiryDate || ''
      });
    }
  }, [medicine]);

  const categories = ['Analgesics', 'Antibiotics', 'Antihistamines', 'Antiseptics', 'Vitamins', 'Other'];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Medicine name is required';
    }
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.lowStockThreshold || formData.lowStockThreshold < 0) {
      newErrors.lowStockThreshold = 'Low stock threshold must be 0 or greater';
    }
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const expiryDate = new Date(formData.expiryDate);
      const today = new Date();
      if (expiryDate <= today) {
        newErrors.expiryDate = 'Expiry date must be in the future';
      }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Determine stock level based on quantity and threshold
      let stockLevel = 'In Stock';
      if (formData.quantity === 0) {
        stockLevel = 'Out of Stock';
      } else if (formData.quantity <= formData.lowStockThreshold) {
        stockLevel = 'Low Stock';
      }

      const updatedMedicine = {
        ...formData,
        _id: medicine._id, // Preserve the database ID
        id: medicine.id, // Preserve the frontend ID
        medicineName: formData.name, // Map name to medicineName for consistency
        quantity: parseInt(formData.quantity),
        lowStockThreshold: parseInt(formData.lowStockThreshold),
        stockLevel: stockLevel
      };

      onUpdateMedicine(updatedMedicine);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      id: '',
      name: '',
      category: '',
      brand: '',
      quantity: '',
      lowStockThreshold: '',
      expiryDate: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Edit Medicine</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalBody}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Medicine ID</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.id ? styles.inputError : ''}`}
                placeholder="Enter medicine ID"
                disabled
              />
              {errors.id && <span className={styles.errorMessage}>{errors.id}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Medicine Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.name ? styles.inputError : ''}`}
                placeholder="Enter medicine name"
                required
              />
              {errors.name && <span className={styles.errorMessage}>{errors.name}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.category ? styles.inputError : ''}`}
                required
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.category && <span className={styles.errorMessage}>{errors.category}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Brand *</label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.brand ? styles.inputError : ''}`}
                placeholder="Enter brand name"
                required
              />
              {errors.brand && <span className={styles.errorMessage}>{errors.brand}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.quantity ? styles.inputError : ''}`}
                placeholder="Enter quantity"
                min="0"
                required
              />
              {errors.quantity && <span className={styles.errorMessage}>{errors.quantity}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Low Stock Threshold *</label>
              <input
                type="number"
                name="lowStockThreshold"
                value={formData.lowStockThreshold}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.lowStockThreshold ? styles.inputError : ''}`}
                placeholder="Enter threshold"
                min="0"
                required
              />
              {errors.lowStockThreshold && <span className={styles.errorMessage}>{errors.lowStockThreshold}</span>}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Expiry Date *</label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className={`${styles.formInput} ${errors.expiryDate ? styles.inputError : ''}`}
                required
              />
              {errors.expiryDate && <span className={styles.errorMessage}>{errors.expiryDate}</span>}
            </div>
          </div>

          <div className={styles.formFooter}>
            <button type="button" className={styles.cancelButton} onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className={styles.updateButton}>
              <i className="fas fa-save"></i>
              Update Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditMedicineModal;
