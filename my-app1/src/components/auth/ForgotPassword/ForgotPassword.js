import React, { useState } from 'react';
import styles from './ForgotPassword.module.scss';

const ForgotPassword = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always show success
      setIsSubmitted(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendEmail = () => {
    setIsSubmitted(false);
    setEmail('');
  };

  return (
    <div className={styles.forgotPasswordContainer}>
      <div className={styles.forgotPasswordCard}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={onBackToLogin}>
            <i className="fas fa-arrow-left"></i>
          </button>
          <h2 className={styles.title}>Forgot Password?</h2>
          <p className={styles.subtitle}>
            {isSubmitted 
              ? 'Check your email for reset instructions' 
              : 'Enter your email address and we\'ll send you a link to reset your password'
            }
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.inputLabel}>Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={handleInputChange}
                className={`${styles.inputField} ${error ? styles.errorField : ''}`}
                placeholder="Enter your email address"
                required
              />
              {error && (
                <span className={styles.errorText}>{error}</span>
              )}
            </div>

            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        ) : (
          <div className={styles.successMessage}>
            <div className={styles.successIcon}>
              <i className="fas fa-check-circle"></i>
            </div>
            <h3>Email Sent!</h3>
            <p>We've sent a password reset link to <strong>{email}</strong></p>
            <p className={styles.checkEmail}>Please check your email and follow the instructions to reset your password.</p>
            
            <div className={styles.actionButtons}>
              <button 
                className={styles.resendButton}
                onClick={handleResendEmail}
              >
                Send to Different Email
              </button>
              <button 
                className={styles.backToLoginButton}
                onClick={onBackToLogin}
              >
                Back to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
