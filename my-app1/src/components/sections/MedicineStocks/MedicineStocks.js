import React, { useState } from 'react';
import styles from './MedicineStocks.module.scss';
import EditMedicineModal from '../../modals/EditMedicineModal/EditMedicineModal';

const MedicineStocks = ({ onAddMedicine, onUpdateMedicine, onDeleteMedicine, medicines = [], onRefreshMedicines, onSearchMedicines }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All Categories');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Generate medicine ID based on category
  const generateMedicineId = (category, index) => {
    const categoryPrefixes = {
      'Antibiotics': 'Anti',
      'Analgesics': 'Anal',
      'Antipyretics': 'AntiP',
      'Antihistamines': 'AntiH',
      'Vitamins': 'Vit',
      'Antiemetics': 'AntiE',
      'Supplements': 'Sup',
      'Pain Relief': 'Pain',
      'Cold & Flu': 'Cold',
      'Digestive': 'Dig',
      'Respiratory': 'Resp'
    };
    
    const prefix = categoryPrefixes[category] || 'Med';
    const paddedIndex = (index + 1).toString().padStart(3, '0');
    return `${prefix}-${paddedIndex}`;
  };

  const filteredMedicines = medicines.filter(medicine => {
    // Enhanced search filter - search by medicineName, category, and brand
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         medicine.medicineName.toLowerCase().includes(searchLower) ||
                         medicine.category.toLowerCase().includes(searchLower) ||
                         medicine.brand.toLowerCase().includes(searchLower);
    
    const matchesCategory = filterCategory === 'All Categories' || medicine.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockLevelClass = (stockLevel) => {
    switch (stockLevel) {
      case 'In Stock':
        return styles.statusNormal;
      case 'Low Stock':
        return styles.statusWarning;
      case 'Out of Stock':
        return styles.statusDanger;
      default:
        return '';
    }
  };

  const handleUpdate = (medicineId) => {
    const medicine = medicines.find(med => (med.id === medicineId) || (med._id === medicineId));
    if (medicine) {
      setSelectedMedicine(medicine);
      setShowEditModal(true);
    }
  };

  const handleDelete = (medicineId) => {
    if (window.confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
      onDeleteMedicine(medicineId);
      alert('Medicine deleted successfully!');
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedMedicine(null);
  };

  const handleUpdateMedicine = (updatedMedicine) => {
    onUpdateMedicine(updatedMedicine);
    alert('Medicine updated successfully!');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsSearching(true);
    try {
      await onSearchMedicines(searchTerm.trim());
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching medicines. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onRefreshMedicines(); // Clear search results and go back to session-based view
  };

  const categories = ['All Categories', 'Analgesics', 'Antibiotics', 'Antiemetics', 'Antihistamines', 'Antiseptics', 'Vitamins'];

  // Format date to "Month Date Year" format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid Date';
    }
  };

  return (
    <div className={styles.medicineStocks}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recently Added</h3>
          <div className={styles.headerButtons}>
            {onRefreshMedicines && (
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onRefreshMedicines} title="Refresh Medicine List">
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAddMedicine}>
              <i className="fas fa-plus"></i> Add New Medicine
            </button>
          </div>
        </div>
        
        <div className={`${styles.flexBetween} ${styles.mb20}`}>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <i className="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search by name, brand, or category..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                type="button"
                className={styles.clearSearch}
                onClick={handleClearSearch}
                title="Clear search"
              >
                <i className="fas fa-times"></i>
              </button>
            )}
            <button 
              type="submit" 
              className={styles.searchButton}
              disabled={isSearching || !searchTerm.trim()}
              title="Search medicines"
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
            </button>
          </form>
          <select 
            className={styles.formControl} 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ width: '200px' }}
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {filteredMedicines.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.medicineTable}>
              <thead>
                <tr>
                  <th>MEDICINE ID</th>
                  <th>MEDICINE NAME</th>
                  <th>QUANTITY</th>
                  <th>STOCK LEVEL</th>
                  <th>EXPIRY DATE</th>
                  <th>ACTION PANEL</th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine, index) => {
                  // Get the index of this medicine within its category
                  const categoryMedicines = filteredMedicines.filter(m => m.category === medicine.category);
                  const categoryIndex = categoryMedicines.findIndex(m => m.id === medicine.id);
                  const medicineId = generateMedicineId(medicine.category, categoryIndex);
                  
                  return (
                  <tr key={medicine.id}>
                    <td className={styles.medicineId}>{medicineId}</td>
                    <td className={styles.medicineName}>
                      <div className={styles.medicineInfo}>
                        <div className={styles.name}>{medicine.medicineName}</div>
                        <div className={styles.brand}>{medicine.brand}</div>
                      </div>
                    </td>
                    <td className={styles.quantity}>
                      {medicine.quantity} units
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStockLevelClass(medicine.stockLevel)}`}>
                        {medicine.stockLevel}
                      </span>
                    </td>
                    <td className={styles.expiryDate}>
                      {formatDate(medicine.expiryDate)}
                      {new Date(medicine.expiryDate) < new Date() && (
                        <div className={styles.expiredBadge}>Expired</div>
                      )}
                    </td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnUpdate}`}
                          onClick={() => handleUpdate(medicine._id || medicine.id)}
                          title="Update Medicine"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnDelete}`}
                          onClick={() => handleDelete(medicine._id || medicine.id)}
                          title="Delete Medicine"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-pills"></i>
            <h3>No medicines added yet</h3>
            <p>Medicines added during this session will appear here</p>
            <button className={`${styles.btn} ${styles.btnPrimary} mt-20`} onClick={onAddMedicine}>
              <i className="fas fa-plus"></i> Add Medicine
            </button>
          </div>
        )}
      </div>

      <EditMedicineModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        medicine={selectedMedicine}
        onUpdateMedicine={handleUpdateMedicine}
      />
    </div>
  );
};

export default MedicineStocks;