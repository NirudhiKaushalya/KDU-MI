import React, { useState } from 'react';
import PatientFilterModal from '../../modals/PatientFilterModal/PatientFilterModal';
import EditPatientModal from '../../modals/EditPatientModal/EditPatientModal';
import DeletionRequestModal from '../../modals/DeletionRequestModal/DeletionRequestModal';
import styles from './PatientManagement.module.scss';

const PatientManagement = ({ onAddPatient, onUpdatePatient, onDeletePatient, patients = [], onRefreshPatients, onSearchPatients, onFilterPatients }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeletionRequestModal, setShowDeletionRequestModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({
    condition: 'Any',
    startDate: '',
    endDate: '',
    minAge: '',
    maxAge: '',
    indexNumber: ''
  });

  const handleApplyFilters = async (filters) => {
    setAppliedFilters(filters);
    
    // Check if any filter criteria is provided
    const hasFilters = filters.indexNumber || 
                       (filters.condition && filters.condition !== 'Any') || 
                       filters.startDate || 
                       filters.endDate || 
                       filters.minAge || 
                       filters.maxAge;
    
    // If filters are provided, search the database for past records
    if (hasFilters && onFilterPatients) {
      setIsFiltering(true);
      try {
        await onFilterPatients(filters);
      } finally {
        setIsFiltering(false);
      }
    }
  };

  const handleClearFilters = () => {
    setAppliedFilters({
      condition: 'Any',
      startDate: '',
      endDate: '',
      minAge: '',
      maxAge: '',
      indexNumber: ''
    });
    // Clear the results and go back to session view
    if (onRefreshPatients) {
      onRefreshPatients();
    }
  };

  const handleUpdate = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setShowEditModal(true);
    }
  };

  const handleDelete = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setSelectedPatient(patient);
      setShowDeletionRequestModal(true);
    }
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedPatient(null);
  };

  const handleCloseDeletionRequestModal = () => {
    setShowDeletionRequestModal(false);
    setSelectedPatient(null);
  };

  const handleDeletionRequestSent = () => {
    // Optionally refresh the patient list or show a success message
    console.log('Deletion request sent successfully');
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      return;
    }
    
    setIsSearching(true);
    try {
      await onSearchPatients(searchTerm.trim());
    } catch (error) {
      console.error('Search error:', error);
      alert('Error searching patients. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    onRefreshPatients(); // Clear search results and go back to session-based view
  };

  const handleUpdatePatient = (updatedPatient) => {
    onUpdatePatient(updatedPatient);
    alert('Patient record updated successfully!');
  };



  const filteredPatients = patients.filter(patient => {
    // Enhanced search filter - search by name, index number, role, condition, and reason
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
                         (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
                         (patient.indexNo && patient.indexNo.toLowerCase().includes(searchLower)) ||
                         (patient.role && patient.role.toLowerCase().includes(searchLower)) ||
                         (patient.condition && patient.condition.toLowerCase().includes(searchLower)) ||
                         (patient.reason && patient.reason.toLowerCase().includes(searchLower)) ||
                         (patient.reasonForConsultation && patient.reasonForConsultation.toLowerCase().includes(searchLower));
    
    // Index Number filter - when index number is entered, show ALL records for that patient
    let matchesIndexNumber = true;
    if (appliedFilters.indexNumber) {
      // First find all patients with matching index number
      const matchingPatients = patients.filter(p => 
        p.indexNo && p.indexNo.toLowerCase().includes(appliedFilters.indexNumber.toLowerCase())
      );
      
      // Get all index numbers from matching patients
      const matchingIndexNumbers = [...new Set(matchingPatients.map(p => p.indexNo))];
      
      // Show ALL records for patients with matching index numbers
      matchesIndexNumber = patient.indexNo && matchingIndexNumbers.includes(patient.indexNo);
    }
    
    // Condition filter
    const matchesCondition = appliedFilters.condition === 'Any' || 
                            patient.condition === appliedFilters.condition;
    
    // Age filter
    const matchesMinAge = !appliedFilters.minAge || patient.age >= parseInt(appliedFilters.minAge);
    const matchesMaxAge = !appliedFilters.maxAge || patient.age <= parseInt(appliedFilters.maxAge);
    
    // Date filter: support filtering by admittedDate or consultedDate
    let matchesDate = true;
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const rawDate = patient.admittedDate || patient.consultedDate || '';
      // Normalize patient date to comparable Date object; if invalid, exclude when a range is applied
      const recordDate = rawDate ? new Date(rawDate) : null;
      const startDate = appliedFilters.startDate ? new Date(appliedFilters.startDate) : null;
      const endDate = appliedFilters.endDate ? new Date(appliedFilters.endDate) : null;

      if (!recordDate || isNaN(recordDate.getTime())) {
        matchesDate = false;
      } else {
        if (startDate && recordDate < startDate) matchesDate = false;
        if (endDate) {
          // include entire end day
          const endOfDay = new Date(endDate);
          endOfDay.setHours(23, 59, 59, 999);
          if (recordDate > endOfDay) matchesDate = false;
        }
      }
    }

    return matchesSearch && matchesIndexNumber && matchesCondition && matchesMinAge && matchesMaxAge && matchesDate;
  });

  const getFilterButtonText = () => {
    const activeFilters = [];
    
    if (appliedFilters.condition !== 'Any') {
      activeFilters.push(appliedFilters.condition);
    }
    if (appliedFilters.indexNumber) {
      activeFilters.push(`All records for Index: ${appliedFilters.indexNumber}`);
    }
    if (appliedFilters.startDate || appliedFilters.endDate) {
      const start = appliedFilters.startDate || 'Any';
      const end = appliedFilters.endDate || 'Any';
      activeFilters.push(`Date: ${start} to ${end}`);
    }
    if (appliedFilters.minAge || appliedFilters.maxAge) {
      const ageFilter = `${appliedFilters.minAge || '0'}-${appliedFilters.maxAge || '∞'}`;
      activeFilters.push(`Age: ${ageFilter}`);
    }
    
    return activeFilters.length > 0 ? `Filter: ${activeFilters.join(', ')}` : 'Filter';
  };

  // Helper function for condition badge classes
  const getConditionClass = (condition) => {
    const conditionClasses = {
      'Hypertension': styles.badgeOrange,
      'Diabetes': styles.badgeWarning,
      'Respiratory': styles.badgeLightBlue,
      'Other': styles.badgeSecondary
    };
    return conditionClasses[condition] || styles.badgeSecondary;
  };

  return (
    <div className={styles.patientManagement}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Patient Records</h3>
          <div className={styles.headerButtons}>
            {onRefreshPatients && (
              <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={onRefreshPatients} title="Clear search results">
                <i className="fas fa-sync-alt"></i> Refresh
              </button>
            )}
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={onAddPatient}>
              <i className="fas fa-plus"></i> Admit Patient
            </button>
          </div>
        </div>
        
        <div className={`${styles.flexBetween} ${styles.mb20}`}>
          <form className={styles.searchBar} onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="Search past records by index number..." 
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
              title="Search patient records"
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : (
                <span className={styles.searchBtnContent}>
                  <i className="fas fa-search"></i>
                  <span className={styles.searchBtnText}>Search</span>
                </span>
              )}
            </button>
          </form>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => setShowFilterModal(true)}
            disabled={isFiltering}
            style={{ width: '200px' }}
          >
            {isFiltering ? (
              <><i className="fas fa-spinner fa-spin"></i> Filtering...</>
            ) : (
              <><i className="fas fa-filter"></i> {getFilterButtonText()}</>
            )}
          </button>
        </div>

        {filteredPatients.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.patientTable}>
              <thead>
                <tr>
                  <th>INDEX NO</th>
                  <th>CONDITION</th>
                  <th>CONSULTED DATE</th>
                  <th>CONSULTED TIME</th>
                  <th>REASON</th>
                  <th>ROLE</th>
                  <th>ACTION PANEL</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map(patient => (
                  <tr key={patient.id}>
                    <td className={styles.indexNo}>{patient.indexNo || 'N/A'}</td>
                    <td>
                      <span className={`${styles.badge} ${getConditionClass(patient.condition)}`}>
                        {patient.condition || 'N/A'}
                      </span>
                    </td>
                    <td className={styles.consultedDate}>
                      {patient.admittedDate || patient.consultedDate || 'N/A'}
                    </td>
                    <td className={styles.consultedTime}>
                      {patient.consultedTime || 'N/A'}
                    </td>
                    <td className={styles.reason}>
                      {patient.reason || patient.reasonForConsultation || 'N/A'}
                    </td>
                    <td className={styles.role}>{patient.role || 'Not specified'}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnUpdate}`}
                          onClick={() => handleUpdate(patient.id)}
                          title="View Patient"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnDelete}`}
                          onClick={() => handleDelete(patient.id)}
                          title="Request Deletion"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-user-injured"></i>
            <h3>No patient records</h3>
            <p>Patients admitted during this session will appear here.<br/>
            Search by index number to retrieve past patient records.</p>
            <button className={`${styles.btn} ${styles.btnPrimary} mt-20`} onClick={onAddPatient}>
              <i className="fas fa-plus"></i> Admit Patient
            </button>
          </div>
        )}
      </div>

      {showFilterModal && (
        <PatientFilterModal 
          onClose={() => setShowFilterModal(false)}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      <EditPatientModal
        isOpen={showEditModal}
        onClose={handleCloseEditModal}
        patient={selectedPatient}
        onUpdatePatient={handleUpdatePatient}
        readOnly={true}
      />

      <DeletionRequestModal
        isOpen={showDeletionRequestModal}
        onClose={handleCloseDeletionRequestModal}
        patient={selectedPatient}
        onRequestSent={handleDeletionRequestSent}
      />
    </div>
  );
};

export default PatientManagement;