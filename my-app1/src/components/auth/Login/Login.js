import React, { useState } from 'react';
import axios from 'axios';
import styles from './Login.module.scss';

const Login = ({ onLogin, onShowRegistration, onShowForgotPassword }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Call backend login API
      const response = await axios.post('http://localhost:8000/api/user/login', formData);
      
      const { token, user } = response.data;
      
      // Save token to localStorage (optional)
      localStorage.setItem('token', token);

      // Determine user type based on role
      const userType = user.role === 'admin' ? 'admin' : 'user';
      
      // Call parent onLogin function with correct user type and complete user data
      onLogin(true, userType, user.userName, user);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Login failed. Try again.');
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2 className={styles.welcomeText}>Welcome to</h2>
          <h1 className={styles.brandTitle}>KDU Medical Inspection Unit</h1>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.loginForm}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.inputLabel}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={styles.inputField}
              placeholder="Enter your email"
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.inputLabel}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={styles.inputField}
              placeholder="Enter your password"
              required
            />
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
          
          <button type="submit" className={styles.loginButton}>Login</button>
        </form>
        
        <div className={styles.loginFooter}>
          <a href="#" className={styles.forgotPassword} onClick={(e) => { e.preventDefault(); onShowForgotPassword(); }}>Forgot Password?</a>
          <p className={styles.signupText}>
            Don't have an account? <a href="#" className={styles.signupLink} onClick={(e) => { e.preventDefault(); onShowRegistration(); }}>Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
