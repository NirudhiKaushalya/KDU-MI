import React from 'react';
import styles from './UserSidebar.module.scss';

const UserSidebar = ({ 
  activeSection, 
  onSectionChange, 
  userName = 'User'
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'deletion-requests', label: 'Deletion Requests', icon: '⚠️' },
    { id: 'medical-history', label: 'Medical History', icon: '📋' },
    { id: 'personal-info', label: 'Personal Info', icon: '👤' }
  ];

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
                } ${item.id === 'personal-info' ? styles.personalInfoHighlight : ''}`}
                onClick={() => onSectionChange(item.id)}
              >
                <span className={styles.menuIcon}>{item.icon}</span>
                <span className={styles.menuLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
    </div>
  );
};

export default UserSidebar;
