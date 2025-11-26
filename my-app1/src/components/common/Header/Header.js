import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Header.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const Header = ({ activeSection, onSectionChange, onLogout, patients = [], medicines = [], onSearch }) => {
  const { getNewNotificationsCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const getSectionTitle = () => {
    const titles = {
      'dashboard': 'Dashboard',
      'patient-management': 'Patient Management',
      'medicine-stocks': 'Medicine Stocks',
      'reports': 'Reports',
      'notifications': 'Notifications',
      'settings': 'Settings'
    };
    return titles[activeSection] || 'Dashboard';
  };

  const getSectionIcon = () => {
    const icons = {
      'dashboard': 'fas fa-tachometer-alt',
      'patient-management': 'fas fa-user-injured',
      'medicine-stocks': 'fas fa-pills',
      'reports': 'fas fa-chart-bar',
      'notifications': 'fas fa-bell',
      'settings': 'fas fa-cog'
    };
    return icons[activeSection] || 'fas fa-tachometer-alt';
  };

  // Show search bar only on dashboard
  const showSearchBarPages = ['dashboard'];
  const showSearchBar = showSearchBarPages.includes(activeSection);

  const handleNotificationClick = () => {
    if (onSectionChange) {
      onSectionChange('notifications');
    }
  };

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowDropdown(false);
  };

  // Search functionality - searches from database
  const searchFromDatabase = useCallback(async (term) => {
    if (term.trim().length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    const results = [];

    try {
      // Search patients from database
      const patientResponse = await axios.get(`http://localhost:8000/api/patient/search?query=${encodeURIComponent(term)}`);
      const patientsData = patientResponse.data.patients || [];
      
      patientsData.forEach(patient => {
        results.push({
          type: 'patient',
          id: patient._id || patient.id,
          title: patient.indexNo || 'Unknown Patient',
          subtitle: `${patient.medicalCondition || patient.condition || 'N/A'} | ${patient.consultedDate || 'N/A'}`,
          data: patient
        });
      });
    } catch (error) {
      console.error('Error searching patients:', error);
    }

    try {
      // Search medicines from database
      const medicineResponse = await axios.get(`http://localhost:8000/api/medicines/search?query=${encodeURIComponent(term)}`);
      const medicinesData = medicineResponse.data.medicines || [];
      
      medicinesData.forEach(medicine => {
        results.push({
          type: 'medicine',
          id: medicine._id || medicine.id,
          title: medicine.medicineName || 'Unknown Medicine',
          subtitle: `${medicine.category || 'N/A'} | Stock: ${medicine.quantity || 0} units`,
          data: medicine
        });
      });
    } catch (error) {
      console.error('Error searching medicines:', error);
    }

    setSearchResults(results);
    setShowSearchResults(true);
    setIsSearching(false);
  }, []);

  // Debounce search
  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        searchFromDatabase(searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchTerm, searchFromDatabase]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  
  const handleSearchItemClick = async (item) => {
    // First, call onSearch to populate the data
    if (onSearch) {
      await onSearch(item);
    }
    
    // Then navigate to the appropriate section
    if (item.type === 'patient') {
      onSectionChange('patient-management');
    } else if (item.type === 'medicine') {
      onSectionChange('medicine-stocks');
    }
    
    setSearchTerm('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Close dropdown and search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.header}>
      <h1 className={styles.pageTitle}>
        <i className={getSectionIcon()}></i>
        <span>{getSectionTitle().toUpperCase()}</span>
      </h1>
      
      <div className={styles.userInfo}>
        {showSearchBar && (
          <div className={styles.searchContainer} ref={searchRef}>
            <div className={styles.searchBar}>
              <i className={isSearching ? "fas fa-spinner fa-spin" : "fas fa-search"}></i>
              <input 
                type="text" 
                placeholder="Search patients, medicines..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm.length >= 2 && searchResults.length > 0 && setShowSearchResults(true)}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => {
                    setSearchTerm('');
                    setSearchResults([]);
                    setShowSearchResults(false);
                  }}
                  title="Clear search"
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            {showSearchResults && searchResults.length > 0 && (
              <div className={styles.searchResults}>
                <div className={styles.searchResultsHeader}>
                  <span>Search Results ({searchResults.length})</span>
                </div>
                {searchResults.map((result, index) => (
                  <div 
                    key={`${result.type}-${result.id}-${index}`}
                    className={styles.searchResultItem}
                    onClick={() => handleSearchItemClick(result)}
                  >
                    <div className={styles.searchResultIcon}>
                      <i className={result.type === 'patient' ? 'fas fa-user' : 'fas fa-pills'}></i>
                    </div>
                    <div className={styles.searchResultContent}>
                      <div className={styles.searchResultTitle}>{result.title}</div>
                      <div className={styles.searchResultSubtitle}>{result.subtitle}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {showSearchResults && searchResults.length === 0 && searchTerm.length >= 2 && !isSearching && (
              <div className={styles.searchResults}>
                <div className={styles.noResults}>
                  <i className="fas fa-search"></i>
                  <span>No results found for "{searchTerm}"</span>
                </div>
              </div>
            )}

            {isSearching && searchTerm.length >= 2 && (
              <div className={styles.searchResults}>
                <div className={styles.noResults}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Searching...</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className={styles.flexBetween}>
          <div className={styles.notificationBell} onClick={handleNotificationClick}>
            <i className="fas fa-bell"></i>
            {getNewNotificationsCount() > 0 && (
              <span className={styles.notificationBadge}>
                {getNewNotificationsCount()}
              </span>
            )}
          </div>
          <div className={styles.userSection} ref={dropdownRef}>
            <div className={styles.userAvatar} onClick={handleAvatarClick}>
              AD
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>System Administrator</div>
            </div>
            
            {showDropdown && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownItem} onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;