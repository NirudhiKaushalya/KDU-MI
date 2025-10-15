import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNotifications } from '../../../contexts/NotificationContext';
import styles from './PersonalInfo.module.scss';

const PersonalInfo = ({ userName, userData: propUserData, onUpdateUserData }) => {
  const { addNotification } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const setupUserData = async () => {
      try {
        console.log("PersonalInfo useEffect - userName:", userName, "propUserData:", propUserData);
        console.log("propUserData email:", propUserData?.email);
        
        // If we have user data from props (from registration or login), use it
        if (propUserData) {
          console.log("Using user data from props:", propUserData);
          setUserData(propUserData);
          setEditData(propUserData);
          setLoading(false);
          return;
        }

        // Otherwise, try to fetch from API using email from userData if available
        const emailToFetch = propUserData?.email || userName;
        console.log("Fetching user data for email:", emailToFetch);
        try {
          const response = await axios.get(`http://localhost:8000/api/user/getByEmail/${emailToFetch}`);
          console.log("API Response:", response.data);
          const fetchedUserData = response.data;
          setUserData(fetchedUserData);
          setEditData(fetchedUserData);
          
          // Update parent component with fresh data from API
          if (onUpdateUserData) {
            onUpdateUserData(fetchedUserData);
          }
        } catch (apiError) {
          console.log("API call failed:", apiError);
          console.log("Using fallback data");
          // If we have propUserData, use it; otherwise use mock data
          if (propUserData) {
            setUserData(propUserData);
            setEditData(propUserData);
          } else {
            // Mock data for demo purposes when API is not available
            const mockData = {
              userName: userName || 'Demo User',
              indexNo: 'P12345678',
              gender: 'male',
              dob: '1995-01-01',
              email: userName || 'demo@example.com',
              contactNo: '+1 234 567 890',
              role: 'Dayscholar',
              department: 'Department of IT',
              intake: 'Fall 2023',
              additionalNotes: 'Allergic to penicillin.',
              photoPreview: null // No photo in mock data
            };
            setUserData(mockData);
            setEditData(mockData);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error("Error setting up user data:", err);
        setError('Failed to load user data.');
        setLoading(false);
      }
    };

    if (userName) {
      setupUserData();
    } else {
      setLoading(false);
    }
  }, [userName, propUserData, onUpdateUserData]);


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
        const updatedUserData = response.data;
        setUserData(updatedUserData);
        setIsEditing(false);
        console.log('Profile updated:', updatedUserData);
        
        // Update the parent component's userData state
        if (onUpdateUserData) {
          onUpdateUserData(updatedUserData);
        }
        
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
        
        // Update the parent component's userData state even for mock data
        if (onUpdateUserData) {
          onUpdateUserData(editData);
        }
        
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
      
      // Add error notification
      addNotification({
        type: 'error',
        icon: '❌',
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        category: 'profile'
      });
    }
  };

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!userData) return <p>No user data available. Please log in again.</p>;

  return (
    <div className={styles.personalInfo}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Welcome {userData.userName || 'User'}!</h1>
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
              {(userData?.photoPreview || userData?.photoData?.data) ? (
                <img 
                  src={userData.photoPreview || userData.photoData.data} 
                  alt="Profile" 
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.profilePlaceholder}>
                  <i className="fas fa-user"></i>
                </div>
              )}
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
                  <select
                    value={editData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    className={styles.editSelect}
                  >
                    <option value="">Select Department</option>
                    <option value="Department of Architecture">Department of Architecture</option>
                    <option value="Department of Spatial Science">Department of Spatial Science</option>
                    <option value="Department of Quantity Survey">Department of Quantity Survey</option>
                    <option value="Department of IQM">Department of IQM</option>
                    <option value="Department of IT">Department of IT</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <span className={styles.detailValue}>{userData.department || 'N/A'}</span>
                )}
              </div>

              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Role:</span>
                {isEditing ? (
                  <select
                    value={editData.role || ''}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={styles.editSelect}
                  >
                    <option value="Dayscholar">Dayscholar</option>
                    <option value="Officer Cadet">Officer Cadet</option>
                    <option value="Other">Other</option>
                  </select>
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
