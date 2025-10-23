import React, { useState } from 'react';
import styles from './AddMedicineModal.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const AddMedicineModal = ({ onClose, onAddMedicine }) => {
  const { addNotification, isLowStockAlertEnabled } = useNotifications();
  const [formData, setFormData] = useState({
    medicineName: '',
    category: '',
    brand: '',
    quantity: '',
    lowStockThreshold: '',
    expiryDate: ''
  });

  const categories = [
    'Analgesics',
    'Antibiotics',
    'Antihistamines',
    'Antiseptics',
    'Vitamins',
    'Antiemetics',
    'Other'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Check for low stock immediately after adding
    const isLowStock = parseInt(formData.quantity) <= parseInt(formData.lowStockThreshold);
    
    // Generate a random ID for demo purposes
    const newMedicine = {
      id: `M${Math.floor(10000 + Math.random() * 90000)}`,
      ...formData,
      stockLevel: isLowStock ? 'Low Stock' : 'In Stock'
    };
    
    // Always show a success notification when medicine is added
    console.log('AddMedicineModal: About to add notification for:', formData.medicineName);
    addNotification({
      type: 'success',
      icon: '✅',
      title: 'Medicine Added: ' + formData.medicineName,
      description: `${formData.medicineName} has been successfully added to inventory with ${formData.quantity} units.`,
      category: 'success',
      medicineId: newMedicine.id,
      medicineName: formData.medicineName
    });
    
    // If the medicine is already low stock, trigger an additional alert with medicineId (only if alerts are enabled)
    if (isLowStock && isLowStockAlertEnabled()) {
      addNotification({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Stock Alert: ' + formData.medicineName,
        description: `New medicine ${formData.medicineName} has been added with low stock (${formData.quantity} units). Consider ordering more.`,
        category: 'stock',
        medicineId: newMedicine.id,
        medicineName: formData.medicineName
      });
    }
    
    if (onAddMedicine) {
      onAddMedicine(newMedicine);
    }
    
    onClose();
  };

  return (
    <div className={styles.modal} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Add New Medicine</h3>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="medicineName">Medicine Name</label>
            <input
              type="text"
              id="medicineName"
              name="medicineName"
              className={styles.formControl}
              placeholder="Enter medicine name"
              value={formData.medicineName}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              className={styles.formControl}
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="brand">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              className={styles.formControl}
              placeholder="Enter brand name"
              value={formData.brand}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className={styles.formControl}
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="lowStockThreshold">Low Stock Threshold</label>
              <input
                type="number"
                id="lowStockThreshold"
                name="lowStockThreshold"
                className={styles.formControl}
                placeholder="Threshold quantity"
                value={formData.lowStockThreshold}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="date"
              id="expiryDate"
              name="expiryDate"
              className={styles.formControl}
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formActions}>
            <button 
              type="button" 
              className={`${styles.btn} ${styles.btnSecondary}`} 
              onClick={onClose}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className={`${styles.btn} ${styles.btnPrimary}`}
            >
              Add Medicine
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicineModal;