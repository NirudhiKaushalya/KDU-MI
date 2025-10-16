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
      await axios.put(`http://localhost:8000/api/deletionRequest/respond/${requestId}`, {
        response,
        patientResponse
      });

      // Refresh the requests list
      await fetchDeletionRequests();
      
      const actionText = response === 'approved' ? 'approved' : 'rejected';
      
      // Add notification for deletion request response
      addNotification({
        type: response === 'approved' ? 'success' : 'warning',
        icon: response === 'approved' ? '✅' : '❌',
        title: `Deletion Request ${actionText.charAt(0).toUpperCase() + actionText.slice(1)}`,
        description: `Your medical record deletion request has been ${actionText}.`,
        category: 'patient'
      });
      
      alert(`Deletion request ${actionText} successfully!`);
      
      // If approved, notify parent component that a patient was deleted
      if (response === 'approved' && onPatientDeleted) {
        onPatientDeleted();
      }
    } catch (error) {
      console.error('Error responding to deletion request:', error);
      alert('Failed to respond to deletion request. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending', class: styles.badgePending },
      approved: { text: 'Approved', class: styles.badgeApproved },
      rejected: { text: 'Rejected', class: styles.badgeRejected }
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
                      <span><strong>Condition:</strong> {request.medicalRecordId.medicalCondition || 'N/A'}</span>
                      <span><strong>Date:</strong> {request.medicalRecordId.consultedDate || 'N/A'}</span>
                      <span><strong>Time:</strong> {request.medicalRecordId.consultedTime || 'N/A'}</span>
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

                {request.status !== 'pending' && request.respondedAt && (
                  <div className={styles.responseSection}>
                    <h4>Your Response:</h4>
                    <p className={styles.responseText}>
                      You {request.status} this deletion request on {formatDate(request.respondedAt)}.
                    </p>
                    {request.patientResponse && (
                      <p className={styles.patientResponse}>
                        <strong>Your comment:</strong> {request.patientResponse}
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
