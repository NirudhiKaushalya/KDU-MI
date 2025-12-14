import React, { useState } from 'react';
import axios from 'axios';
import styles from './Registration.module.scss';

const Registration = ({ onBackToLogin, onRegister }) => {
  const [formData, setFormData] = useState({
    userName: '',
    indexNo: '',
    gender: 'male',
    dob: '',
    email: '',
    contactNo: '',
    role: 'Dayscholar',
    department: '',
    intake: '',
    password: '',
    reTypePassword: ''
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Clear intake field if role changes away from Dayscholar
      if (name === 'role' && value !== 'Dayscholar') {
        newData.intake = '';
      }
      
      return newData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear intake error if role changes away from Dayscholar
    if (name === 'role' && value !== 'Dayscholar' && errors.intake) {
      setErrors(prev => ({
        ...prev,
        intake: ''
      }));
    }

    // Validate DOB to prevent future dates
    if (name === 'dob' && value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        setErrors(prev => ({
          ...prev,
          dob: 'Date of birth cannot be in the future'
        }));
      }
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type - accepts image files
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }
      
      // Validate file size (max 5MB for images)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file size should be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      
      // Create preview URL for image
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    // Reset the file input
    const fileInput = document.getElementById('photo-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.userName.trim()) {
      newErrors.userName = 'User name is required';
    }

    if (!formData.indexNo.trim()) {
      newErrors.indexNo = 'Index number is required';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      // Check if DOB is in the future
      const selectedDate = new Date(formData.dob);
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Set to end of today
      
      if (selectedDate > today) {
        newErrors.dob = 'Date of birth cannot be in the future';
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.contactNo.trim()) {
      newErrors.contactNo = 'Contact number is required';
    } else if (!/^\d{10}$/.test(formData.contactNo.trim())) {
      newErrors.contactNo = 'Contact number must be exactly 10 digits';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (formData.role === 'Dayscholar' && !formData.intake.trim()) {
      newErrors.intake = 'Intake is required for Dayscholar';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.reTypePassword) {
      newErrors.reTypePassword = 'Please re-type your password';
    } else if (formData.password !== formData.reTypePassword) {
      newErrors.reTypePassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        // Create FormData for file upload
        const formDataToSend = new FormData();
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
          if (key !== 'reTypePassword') { // Exclude reTypePassword from backend
            formDataToSend.append(key, formData[key]);
          }
        });
        
        // Add photo file if exists (only send the file, not base64 preview)
        if (photoFile) {
          formDataToSend.append('photo', photoFile);
        }
        
        console.log('Registration data:', formData);
        
        // Send data to backend API with proper headers for FormData
        const response = await axios.post('http://localhost:8000/api/user/register', formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log('Registration successful:', response.data);
        
        alert('Registration successful! You can now login with your credentials.');
        
        // Navigate back to login or auto-login with backend response data
        if (onRegister) {
          // Pass the backend response data which includes photo information
          onRegister(response.data.user);
        } else {
          onBackToLogin();
        }
      } catch (error) {
        console.error('Registration error:', error);
        alert(error.response?.data?.message || 'Registration failed. Please try again.');
      }
    }
  };

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.registrationCard}>
        <div className={styles.registrationHeader}>
          <button className={styles.closeButton} onClick={onBackToLogin}>
            <i className="fas fa-times"></i>
          </button>
          <h2 className={styles.welcomeText}>Welcome to</h2>
          <h1 className={styles.brandTitle}>KDU Medical Inspection Unit</h1>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.registrationForm}>
          {/* Document Upload Section */}
          <div className={styles.photoUploadSection}>
            <div className={styles.photoContainer}>
              <div className={styles.photoPlaceholder}>
                {photoPreview ? (
                  <img 
                    src={photoPreview} 
                    alt="Profile preview" 
                    className={styles.photoPreview}
                  />
                ) : (
                  <div className={styles.photoIcon}>
                    <i className="fas fa-camera" style={{ fontSize: '32px', color: '#9ca3af' }}></i>
                  </div>
                )}
                {photoFile && (
                  <button 
                    type="button"
                    className={styles.removePhotoButton}
                    onClick={handleRemovePhoto}
                    title="Remove photo"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
            <div className={styles.uploadControls}>
              <label htmlFor="photo-upload" className={styles.uploadButton}>
                <i className="fas fa-camera"></i>
                {photoFile ? 'Change Photo' : 'Upload Photo'}
              </label>
              <input
                id="photo-upload"
                name="photo-upload"
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ display: 'none' }}
              />
              {photoFile && (
                <div className={styles.photoInfo}>
                  <p className={styles.photoName}>
                    <i className="fas fa-check-circle"></i>
                    {photoFile.name}
                  </p>
                  <p className={styles.photoSize}>
                    {(photoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* User Details Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>User Details</h3>
            
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="userName" className={styles.inputLabel}>User Name:</label>
                <input
                  type="text"
                  id="userName"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.userName ? styles.errorField : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.userName && <span className={styles.errorText}>{errors.userName}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="indexNo" className={styles.inputLabel}>Index No:</label>
                <input
                  type="text"
                  id="indexNo"
                  name="indexNo"
                  value={formData.indexNo}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.indexNo ? styles.errorField : ''}`}
                  placeholder="Enter your index number"
                />
                {errors.indexNo && <span className={styles.errorText}>{errors.indexNo}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="gender" className={styles.inputLabel}>Gender:</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={styles.selectField}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Prefer not to say</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="dob" className={styles.inputLabel}>DOB:</label>
                <input
                  type="date"
                  id="dob"
                  name="dob"
                  value={formData.dob}
                  onChange={handleInputChange}
                  max={new Date().toISOString().split('T')[0]}
                  className={`${styles.inputField} ${errors.dob ? styles.errorField : ''}`}
                />
                {errors.dob && <span className={styles.errorText}>{errors.dob}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.inputLabel}>Email:</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.email ? styles.errorField : ''}`}
                  placeholder="@gmail.com"
                />
                {errors.email && <span className={styles.errorText}>{errors.email}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="contactNo" className={styles.inputLabel}>Contact No:</label>
                <input
                  type="tel"
                  id="contactNo"
                  name="contactNo"
                  value={formData.contactNo}
                  onChange={(e) => {
                    // Only allow digits and max 10 characters
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    handleInputChange({ target: { name: 'contactNo', value } });
                  }}
                  className={`${styles.inputField} ${errors.contactNo ? styles.errorField : ''}`}
                  placeholder="Enter 10 digit phone number"
                  maxLength={10}
                />
                {errors.contactNo && <span className={styles.errorText}>{errors.contactNo}</span>}
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="role" className={styles.inputLabel}>Role:</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={styles.selectField}
                >
                  <option value="Dayscholar">Dayscholar</option>
                  <option value="Officer Cadet">Officer Cadet</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="department" className={styles.inputLabel}>Department:</label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className={`${styles.selectField} ${errors.department ? styles.errorField : ''}`}
                >
                  <option value="">Select Department</option>
                  <option value="Department of Architecture">Department of Architecture</option>
                  <option value="Department of Spatial Science">Department of Spatial Science</option>
                  <option value="Department of Quantity Survey">Department of Quantity Survey</option>
                  <option value="Department of IQM">Department of IQM</option>
                  <option value="Department of IT">Department of IT</option>
                  <option value="Other">Other</option>
                </select>
                {errors.department && <span className={styles.errorText}>{errors.department}</span>}
              </div>
            </div>

            {formData.role === 'Dayscholar' && (
              <div className={styles.formRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="intake" className={styles.inputLabel}>Intake:</label>
                  <input
                    type="text"
                    id="intake"
                    name="intake"
                    value={formData.intake}
                    onChange={handleInputChange}
                    className={`${styles.inputField} ${errors.intake ? styles.errorField : ''}`}
                    placeholder="intake 42"
                  />
                  {errors.intake && <span className={styles.errorText}>{errors.intake}</span>}
                </div>
              </div>
            )}
          </div>

          {/* Password Section */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Password</h3>
            
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.inputLabel}>Password:</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.password ? styles.errorField : ''}`}
                  placeholder="Enter your password"
                />
                {errors.password && <span className={styles.errorText}>{errors.password}</span>}
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="reTypePassword" className={styles.inputLabel}>Confirm Password:</label>
                <input
                  type="password"
                  id="reTypePassword"
                  name="reTypePassword"
                  value={formData.reTypePassword}
                  onChange={handleInputChange}
                  className={`${styles.inputField} ${errors.reTypePassword ? styles.errorField : ''}`}
                  placeholder="Re-enter your password"
                />
                {errors.reTypePassword && <span className={styles.errorText}>{errors.reTypePassword}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button 
              type="button" 
              className={styles.cancelButton}
              onClick={onBackToLogin}
            >
              Cancel
            </button>
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;
