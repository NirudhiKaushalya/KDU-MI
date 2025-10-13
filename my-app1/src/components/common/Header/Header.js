import React, { useState, useRef, useEffect } from 'react';
import styles from './Header.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const Header = ({ activeSection, onSectionChange, onLogout, patients = [], medicines = [], onSearch }) => {
  const { getNewNotificationsCount } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
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

  // Search functionality
  const handleSearch = (term) => {
    setSearchTerm(term);
    
    if (term.trim() === '') {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = [];
    const searchLower = term.toLowerCase();

    // Search patients
    if (patients && Array.isArray(patients)) {
      patients.forEach(patient => {
        if (
          (patient.name && patient.name.toLowerCase().includes(searchLower)) ||
          (patient.id && patient.id.toLowerCase().includes(searchLower)) ||
          (patient.indexNo && patient.indexNo.toLowerCase().includes(searchLower)) ||
          (patient.condition && patient.condition.toLowerCase().includes(searchLower)) ||
          (patient.role && patient.role.toLowerCase().includes(searchLower))
        ) {
        results.push({
          type: 'patient',
          id: patient.id,
          title: patient.name || 'Unknown Patient',
          subtitle: `Patient ID: ${patient.id || 'N/A'} | ${patient.condition || 'N/A'}`,
          data: patient
        });
      }
    });
  }

    // Search medicines
    if (medicines && Array.isArray(medicines)) {
      medicines.forEach(medicine => {
        if (
          (medicine.medicineName && medicine.medicineName.toLowerCase().includes(searchLower)) ||
          (medicine.id && medicine.id.toLowerCase().includes(searchLower)) ||
          (medicine.category && medicine.category.toLowerCase().includes(searchLower)) ||
          (medicine.brand && medicine.brand.toLowerCase().includes(searchLower))
        ) {
        results.push({
          type: 'medicine',
          id: medicine.id,
          title: medicine.medicineName || 'Unknown Medicine',
          subtitle: `${medicine.category || 'N/A'} | Stock: ${medicine.stockLevel || 'N/A'}`,
          data: medicine
        });
      }
    });
  }

    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  
  const handleSearchItemClick = (item) => {
    if (item.type === 'patient') {
      onSectionChange('patient-management');
    } else if (item.type === 'medicine') {
      onSectionChange('medicine-stocks');
    }
    
    if (onSearch) {
      onSearch(item);
    }
    
    setSearchTerm('');
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
              <i className="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search patients, medicines..." 
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => searchTerm && setShowSearchResults(true)}
              />
              {searchTerm && (
                <button 
                  className={styles.clearSearch}
                  onClick={() => {
                    setSearchTerm('');
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
            
            {showSearchResults && searchResults.length === 0 && searchTerm && (
              <div className={styles.searchResults}>
                <div className={styles.noResults}>
                  <i className="fas fa-search"></i>
                  <span>No results found for "{searchTerm}"</span>
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