import React, { useState, useEffect } from 'react';
import styles from './Footer.module.scss';

const Footer = ({ onSectionChange, userRole = 'user' }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Show footer when user scrolls near the bottom
      if (scrollPosition + windowHeight >= documentHeight - 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Admin navigation links
  const adminNavigationLinks = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Patient Management', key: 'patient-management' }, 
    { name: 'Medicine Stocks', key: 'medicine-stocks' },
    { name: 'Reports', key: 'reports' },
    { name: 'Notifications', key: 'notifications' },
    { name: 'Settings', key: 'settings' }
  ];

  // User navigation links
  const userNavigationLinks = [
    { name: 'Dashboard', key: 'dashboard' },
    { name: 'Notifications', key: 'notifications' },
    { name: 'Deletion Requests', key: 'deletion-requests' },
    { name: 'Personal Info', key: 'personal-info' },
    { name: 'Medical History', key: 'medical-history' }
  ];

  // Select navigation links based on user role
  const navigationLinks = userRole === 'admin' ? adminNavigationLinks : userNavigationLinks;

  const handleNavigationClick = (sectionKey) => {
    if (onSectionChange) {
      onSectionChange(sectionKey);
    }
  };

  return (
    <footer className={`${styles.footer} ${isVisible ? styles.visible : ''}`}>
      <div className={styles.footerContent}>
        <div className={styles.footerColumn}>
          <div className={styles.brandSection}>
            <div className={styles.brandIcon}>🏥</div>
            <div className={styles.brandInfo}>
              <h3 className={styles.brandTitle}>KDU Medical Inspection Unit</h3>
              <p className={styles.brandDescription}>
                Providing reliable health oversight and services with clarity, accessibility, and scale.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Navigate</h4>
          <ul className={styles.navLinks}>
            {navigationLinks.map((link, index) => (
              <li key={index}>
                <button 
                  className={styles.navLink}
                  onClick={() => handleNavigationClick(link.key)}
                >
                  {link.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.footerColumn}>
          <h4 className={styles.columnTitle}>Contact</h4>
          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>✉️</span>
              <span className={styles.contactText}>kdumedical@gmail.com</span>
            </div>
            <div className={styles.contactItem}>
              <span className={styles.contactIcon}>📞</span>
              <span className={styles.contactText}>+94 11 234 5678</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className={styles.separator}></div>
        <p className={styles.copyright}>
          © 2025 KDU Medical Inspection Unit. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
