import React, { useState, useEffect } from 'react';
import styles from './UserSidebar.module.scss';

const UserSidebar = ({ 
  activeSection, 
  onSectionChange, 
  userName = 'User'
}) => {
  const [isProfileExpanded, setIsProfileExpanded] = useState(
    activeSection === 'personal-info' || activeSection === 'medical-history'
  );

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' }
  ];

  const profileSubItems = [
    { id: 'personal-info', label: 'Personal Info', icon: '👤' },
    { id: 'medical-history', label: 'Medical History', icon: '📋' }
  ];

  const handleProfileClick = () => {
    if (isProfileExpanded) {
      setIsProfileExpanded(false);
    } else {
      setIsProfileExpanded(true);
      // Set the first sub-item as active when expanding
      onSectionChange('personal-info');
    }
  };

  // Auto-expand profile section when navigating to profile sub-items
  useEffect(() => {
    if (activeSection === 'personal-info' || activeSection === 'medical-history') {
      setIsProfileExpanded(true);
    }
  }, [activeSection]);

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h1 className={styles.sidebarTitle}>KDU MEDICAL INSPECTION UNIT</h1>
      </div>
      
      <nav className={styles.navigation}>
        <ul className={styles.menuList}>
          {menuItems.map((item) => (
            <li key={item.id} className={styles.menuItem}>
              <button
                className={`${styles.menuButton} ${
                  activeSection === item.id ? styles.active : ''
                }`}
                onClick={() => onSectionChange(item.id)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            </li>
          ))}
          
          {/* Profile Section with Sub-menu */}
          <li className={styles.menuItem}>
            <button
              className={`${styles.menuButton} ${styles.profileButton} ${
                (activeSection === 'personal-info' || activeSection === 'medical-history') ? styles.active : ''
              }`}
              onClick={handleProfileClick}
            >
              <span className={styles.menuIcon}>👤</span>
              <span className={styles.menuLabel}>Profile</span>
              <span className={`${styles.chevron} ${isProfileExpanded ? styles.expanded : ''}`}>▼</span>
            </button>
            
            {isProfileExpanded && (
              <ul className={styles.subMenu}>
                {profileSubItems.map((subItem) => (
                  <li key={subItem.id} className={styles.subMenuItem}>
                    <button
                      className={`${styles.subMenuButton} ${
                        activeSection === subItem.id ? styles.active : ''
                      }`}
                      onClick={() => onSectionChange(subItem.id)}
                    >
                      <span className={styles.subMenuIcon}>{subItem.icon}</span>
                      <span className={styles.subMenuLabel}>{subItem.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </li>
        </ul>
      </nav>
      
    </div>
  );
};

export default UserSidebar;
