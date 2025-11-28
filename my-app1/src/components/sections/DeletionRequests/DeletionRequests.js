import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './DeletionRequests.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const DeletionRequests = ({ userData, onPatientDeleted }) => {
  const { addNotification } = useNotifications();
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userData?.indexNo) {
      fetchDeletionRequests();
    }
  }, [userData?.indexNo]);

  const fetchDeletionRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:8000/api/deletionRequest/patient/${userData.indexNo}`);
      setDeletionRequests(response.data);
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
      setError('Failed to load deletion requests');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId, response, patientResponse = '') => {
    try {
      const result = await axios.put(`http://localhost:8000/api/deletionRequest/respond/${requestId}`, {
        response,
        patientResponse
      });

      // Refresh the requests list
      await fetchDeletionRequests();
      
      if (response === 'approved') {
        // User approved - now awaiting admin confirmation
        addNotification({
          type: 'info',
          icon: '⏳',
          title: 'Approval Sent to Admin',
          description: 'Your approval has been sent to the admin for final confirmation.',
          category: 'patient'
        });
        
        alert('Your approval has been sent to the admin for final confirmation. The record will be deleted once the admin confirms.');
      } else {
        // User rejected
        addNotification({
          type: 'warning',
          icon: '❌',
          title: 'Deletion Request Rejected',
          description: 'You have rejected the deletion request. Your medical record remains intact.',
          category: 'patient'
        });
        
        alert('Deletion request rejected successfully!');
      }
    } catch (error) {
      console.error('Error responding to deletion request:', error);
      alert('Failed to respond to deletion request. Please try again.');
    }
  };

  const handleDismissRequest = async (requestId) => {
    try {
      // Call the backend API to dismiss the request with patient validation
      await axios.put(`http://localhost:8000/api/deletionRequest/dismiss/${requestId}`, {
        patientIndexNo: userData?.indexNo
      });

      // Remove the request from local state
      setDeletionRequests(prev => 
        prev.filter(req => req._id !== requestId)
      );

      addNotification({
        type: 'success',
        icon: '✅',
        title: 'Request Dismissed',
        description: 'Deletion request has been dismissed and will not appear again.',
        category: 'patient'
      });
    } catch (error) {
      console.error('Error dismissing deletion request:', error);
      
      let errorMessage = 'Failed to dismiss deletion request. Please try again.';
      if (error.response?.status === 403) {
        errorMessage = 'You can only dismiss your own deletion requests.';
      } else if (error.response?.status === 400) {
        errorMessage = 'This request has already been dismissed.';
      }

      addNotification({
        type: 'error',
        icon: '❌',
        title: 'Dismiss Failed',
        description: errorMessage,
        category: 'patient'
      });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending Your Response', class: styles.badgePending },
      user_approved: { text: 'Awaiting Admin Confirmation', class: styles.badgeWarning },
      user_rejected: { text: 'You Rejected', class: styles.badgeRejected },
      admin_confirmed: { text: 'Deleted', class: styles.badgeApproved },
      admin_rejected: { text: 'Cancelled by Admin', class: styles.badgeRejected }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`${styles.badge} ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className={styles.deletionRequests}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading deletion requests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.deletionRequests}>
        <div className={styles.error}>
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchDeletionRequests} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.deletionRequests}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <i className="fas fa-exclamation-triangle"></i>
          Medical Record Deletion Requests
        </h1>
        <p className={styles.pageDescription}>
          Review and respond to requests for deleting your medical records
        </p>
      </div>

      {deletionRequests.length === 0 ? (
        <div className={styles.emptyState}>
          <i className="fas fa-check-circle"></i>
          <h3>No deletion requests</h3>
          <p>You have no pending deletion requests for your medical records.</p>
        </div>
      ) : (
        <div className={styles.requestsList}>
          {deletionRequests.map((request) => (
            <div key={request._id} className={styles.requestCard}>
              <div className={styles.cardHeader}>
                <div className={styles.requestInfo}>
                  <h3 className={styles.requestTitle}>
                    Medical Record Deletion Request
                  </h3>
                  <div className={styles.requestMeta}>
                    <span className={styles.requestedBy}>
                      Requested by: <strong>{request.adminName}</strong>
                    </span>
                    <span className={styles.requestedAt}>
                      {formatDate(request.requestedAt)}
                    </span>
                  </div>
                </div>
                <div className={styles.statusSection}>
                  {getStatusBadge(request.status)}
                  <button 
                    className={styles.dismissButton}
                    onClick={() => handleDismissRequest(request._id)}
                    title="Dismiss this request"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.reasonSection}>
                  <h4>Reason for Deletion:</h4>
                  <p className={styles.reasonText}>{request.reason}</p>
                </div>

                {request.medicalRecordId && (
                  <div className={styles.recordInfo}>
                    <h4>Medical Record Details:</h4>
                    <div className={styles.recordDetails}>
                      <span><strong>Condition:</strong> {request.medicalRecordId.Diagnosis || 'N/A'}</span>
                      <span><strong>Date:</strong> {request.medicalRecordId.consultedTime || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {request.status === 'pending' && (
                  <div className={styles.actionSection}>
                    <h4>Your Response:</h4>
                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to approve the deletion of this medical record? This action cannot be undone.')) {
                            handleRespondToRequest(request._id, 'approved');
                          }
                        }}
                      >
                        <i className="fas fa-check"></i>
                        Approve Deletion
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.rejectButton}`}
                        onClick={() => {
                          if (window.confirm('Are you sure you want to reject this deletion request?')) {
                            handleRespondToRequest(request._id, 'rejected');
                          }
                        }}
                      >
                        <i className="fas fa-times"></i>
                        Reject Request
                      </button>
                    </div>
                  </div>
                )}

                {request.status === 'user_approved' && (
                  <div className={styles.responseSection}>
                    <h4>Status:</h4>
                    <p className={styles.responseText}>
                      <i className="fas fa-clock"></i> You approved this request on {formatDate(request.userRespondedAt || request.respondedAt)}. 
                      <br/><strong>Awaiting admin's final confirmation to delete the record.</strong>
                    </p>
                  </div>
                )}

                {request.status === 'user_rejected' && (
                  <div className={styles.responseSection}>
                    <h4>Your Response:</h4>
                    <p className={styles.responseText}>
                      You rejected this deletion request on {formatDate(request.userRespondedAt || request.respondedAt)}.
                    </p>
                    {request.patientResponse && (
                      <p className={styles.patientResponse}>
                        <strong>Your comment:</strong> {request.patientResponse}
                      </p>
                    )}
                  </div>
                )}

                {request.status === 'admin_confirmed' && (
                  <div className={styles.responseSection}>
                    <h4>Completed:</h4>
                    <p className={styles.responseText}>
                      <i className="fas fa-check-circle" style={{color: '#10b981'}}></i> Your medical record has been permanently deleted on {formatDate(request.adminConfirmedAt)}.
                    </p>
                  </div>
                )}

                {request.status === 'admin_rejected' && (
                  <div className={styles.responseSection}>
                    <h4>Cancelled:</h4>
                    <p className={styles.responseText}>
                      <i className="fas fa-times-circle" style={{color: '#ef4444'}}></i> The admin cancelled this deletion request on {formatDate(request.adminConfirmedAt)}. Your medical record remains intact.
                    </p>
                    {request.adminFinalResponse && (
                      <p className={styles.patientResponse}>
                        <strong>Admin's reason:</strong> {request.adminFinalResponse}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeletionRequests;
