import React from 'react';
import styles from './Sidebar.module.scss';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const menuItems = [
    {
      section: 'dashboard',
      icon: '📊',
      label: 'Dashboard'
    },
    {
      section: 'patient-management',
      icon: '👤',
      label: 'Patient Management'
    },
    {
      section: 'medicine-stocks',
      icon: '💊',
      label: 'Medicine Stocks'
    },
    {
      section: 'reports',
      icon: '📄',
      label: 'Reports'
    },
    {
      section: 'settings',
      icon: '⚙️',
      label: 'Settings'
    }
  ];

  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>
  <h1>KDU Medical Inspection Unit</h1>
        <p>Management System</p>
      </div>

      <div className={styles.menuSection}>
        <div className={styles.menuSectionTitle}>OPERATIONS</div>
        <ul className={styles.menu}>
          {menuItems.map(item => (
            <li
              key={item.section}
              className={`${styles.menuItem} ${activeSection === item.section ? styles.active : ''} ${item.section === 'patient-management' ? styles.patientManagementHighlight : ''}`}
              onClick={() => onSectionChange(item.section)}
            >
              <span className={styles.menuIcon}>{item.icon}</span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
};

export default Sidebar;