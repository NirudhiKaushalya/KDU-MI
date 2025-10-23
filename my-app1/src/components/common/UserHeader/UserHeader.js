import React, { useState, useRef, useEffect } from 'react';
import { getUserPhotoUrl, hasUserPhoto } from '../../../utils/photoUtils';
import styles from './UserHeader.module.scss';

const UserHeader = ({ userName = 'User', userData = null, notificationCount = 0, deletionRequestCount = 0, onNavigateToNotifications, onNavigateToDeletionRequests, onNavigateToProfile, onLogout, onClearDeletionRequestCount }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Debug logging for photo data
  useEffect(() => {
    console.log("UserHeader - userData:", userData);
    console.log("UserHeader - photoPreview:", userData?.photoPreview);
    console.log("UserHeader - photoData:", userData?.photoData);
  }, [userData]);

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

  const handleDeletionRequestClick = () => {
    if (onNavigateToDeletionRequests) {
      onNavigateToDeletionRequests();
    }
    // Clear the deletion request count when user views the page
    if (onClearDeletionRequestCount) {
      onClearDeletionRequestCount();
    }
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
          
          <button 
            className={styles.deletionRequestButton}
            onClick={handleDeletionRequestClick}
            title="View deletion requests"
          >
            <i className="fas fa-exclamation-triangle"></i>
            {deletionRequestCount > 0 && (
              <span className={styles.deletionRequestBadge}>{deletionRequestCount}</span>
            )}
          </button>
          
          <div className={styles.userProfile} ref={dropdownRef}>
            <div 
              className={styles.userAvatar}
              onClick={handleAvatarClick}
              title="User menu"
            >
              {hasUserPhoto(userData) ? (
                <img 
                  src={getUserPhotoUrl(userData)} 
                  alt="Profile" 
                  className={styles.avatarImage}
                  onError={(e) => {
                    console.log('Avatar image failed to load:', e.target.src);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <span 
                className={styles.avatarText}
                style={{ display: hasUserPhoto(userData) ? 'none' : 'flex' }}
              >
                {userName.charAt(0).toUpperCase()}
              </span>
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
