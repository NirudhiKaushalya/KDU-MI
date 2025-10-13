import React, { useState, useRef, useEffect } from 'react';
import styles from './UserHeader.module.scss';

const UserHeader = ({ userName = 'User', notificationCount = 0, onNavigateToNotifications, onNavigateToProfile, onLogout }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleAvatarClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setShowDropdown(false);
  };

  const handleProfileClick = () => {
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.userHeader}>
      <div className={styles.headerContent}>
        <div className={styles.headerActions}>
          <button 
            className={styles.notificationButton}
            onClick={onNavigateToNotifications}
            title="View notifications"
          >
            <i className="fas fa-bell"></i>
            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>{notificationCount}</span>
            )}
          </button>
          
          <div className={styles.userProfile} ref={dropdownRef}>
            <div 
              className={styles.userAvatar}
              onClick={handleAvatarClick}
              title="User menu"
            >
              <span className={styles.avatarText}>{userName.charAt(0).toUpperCase()}</span>
            </div>
            <span className={styles.userName}>{userName}</span>
            
            {showDropdown && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownItem} onClick={handleProfileClick}>
                  <i className="fas fa-user"></i>
                  <span>Profile</span>
                </div>
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

export default UserHeader;
