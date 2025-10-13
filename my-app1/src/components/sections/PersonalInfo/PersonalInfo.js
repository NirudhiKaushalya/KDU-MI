import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './PersonalInfo.module.scss';

const PersonalInfo = ({ userName }) => {
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("Fetching user data for:", userName);
        // Try to fetch user data - if API fails, use mock data for demo
        try {
          const response = await axios.get(`http://localhost:8000/api/user/getByEmail/${userName}`);
          console.log("API Response:", response.data);
          setUserData(response.data);
          setEditData(response.data);
        } catch (apiError) {
          console.log("API not available, using mock data");
          // Mock data for demo purposes when API is not available
          const mockData = {
            userName: userName || 'Demo User',
            indexNo: 'P12345678',
            gender: 'male',
            dob: '1995-01-01',
            email: userName || 'demo@example.com',
            contactNo: '+1 234 567 890',
            role: 'Dayscholar',
            intake: 'Fall 2023',
            additionalNotes: 'Allergic to penicillin.'
          };
          setUserData(mockData);
          setEditData(mockData);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error setting up user data:", err);
        setError('Failed to load user data.');
        setLoading(false);
      }
    };

    if (userName) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, [userName]);


  const handleEditClick = () => setIsEditing(true);
  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({ ...userData });
  };

  const handleSaveEdit = async () => {
    try {
      // If we have real API data, try to save it
      if (userData._id) {
        const response = await axios.put(`http://localhost:8000/api/user/update/${userData._id}`, editData);
        setUserData(response.data);
        setIsEditing(false);
        console.log('Profile updated:', response.data);
        
        // Add notification for profile update
        addNotification({
          type: 'success',
          icon: '👤',
          title: 'Profile Updated',
          description: `${userName}'s profile has been successfully updated.`,
          category: 'profile'
        });
      } else {
        // For mock data, just update locally
        setUserData(editData);
        setIsEditing(false);
        console.log('Profile updated locally:', editData);
        
        // Add notification for profile update
        addNotification({
          type: 'success',
          icon: '👤',
          title: 'Profile Updated',
          description: `${userName}'s profile has been successfully updated.`,
          category: 'profile'
        });
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update profile.');
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.personalInfo}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Welcome {userData.userName}!</h1>
      </div>

      <div className={styles.contentCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Personal Info</h2>
          {!isEditing ? (
            <button className={styles.editButton} onClick={handleEditClick}>
              Edit Profile
            </button>
          ) : (
            <div className={styles.editButtons}>
              <button className={styles.cancelButton} onClick={handleCancelEdit}>
                Cancel
              </button>
              <button className={styles.saveButton} onClick={handleSaveEdit}>
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className={styles.profileContent}>
          <div className={styles.profileSection}>
            <div className={styles.profilePicture}>
              <div className={styles.profilePlaceholder}>
                <i className="fas fa-user"></i>
              </div>
            </div>
            
            <div className={styles.userDetails}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Name:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.userName || ''}
                    onChange={(e) => handleInputChange('userName', e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.userName || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Index No:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.indexNo || ''}
                    onChange={(e) => handleInputChange('indexNo', e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.indexNo || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Gender:</span>
                {isEditing ? (
                  <select
                    value={editData.gender || ''}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={styles.editSelect}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <span className={styles.detailValue}>{userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Intake:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.intake || ''}
                    onChange={(e) => handleInputChange('intake', e.target.value)}
                    className={styles.editInput}
                    placeholder="Enter intake (e.g., Fall 2023)"
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.intake || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Department:</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.role || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>E-mail:</span>
                {isEditing ? (
                  <input
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.email || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Phone No:</span>
                {isEditing ? (
                  <input
                    type="tel"
                    value={editData.contactNo || ''}
                    onChange={(e) => handleInputChange('contactNo', e.target.value)}
                    className={styles.editInput}
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.contactNo || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Additional Notes:</span>
                {isEditing ? (
                  <textarea
                    value={editData.additionalNotes || ''}
                    onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                    className={styles.editTextarea}
                    placeholder="Enter any additional notes..."
                  />
                ) : (
                  <span className={styles.detailValue}>{userData.additionalNotes || 'None'}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;
