import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './DeletionApprovals.module.scss';
import { useNotifications } from '../../../contexts/NotificationContext';

const DeletionApprovals = ({ onPatientDeleted }) => {
  const { addNotification } = useNotifications();
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch pending admin confirmations
      const pendingResponse = await axios.get('http://localhost:8000/api/deletionRequest/pending-admin-confirmation');
      setPendingApprovals(pendingResponse.data);

      // Fetch all requests for history
      const allResponse = await axios.get('http://localhost:8000/api/deletionRequest/all');
      setAllRequests(allResponse.data);
    } catch (error) {
      console.error('Error fetching deletion requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminConfirm = async (requestId, response, adminResponse = '') => {
    try {
      const result = await axios.put(`http://localhost:8000/api/deletionRequest/admin-confirm/${requestId}`, {
        response,
        adminResponse
      });

      // Refresh data
      await fetchData();

      if (response === 'confirm') {
        addNotification({
          type: 'success',
          icon: '✅',
          title: 'Record Deleted',
          description: `Medical record has been permanently deleted.`,
          category: 'admin'
        });
        alert('Medical record deleted successfully!');
        
        // Notify parent component
        if (onPatientDeleted) {
          onPatientDeleted();
        }
      } else {
        addNotification({
          type: 'info',
          icon: '❌',
          title: 'Deletion Cancelled',
          description: `Deletion request has been cancelled. The record remains intact.`,
          category: 'admin'
        });
        alert('Deletion request cancelled. The record remains intact.');
      }
    } catch (error) {
      console.error('Error confirming deletion:', error);
      alert('Failed to process the request. Please try again.');
    }
  };

  const handleRemoveRequest = async (requestId) => {
    try {
      await axios.delete(`http://localhost:8000/api/deletionRequest/remove/${requestId}`);
      
      // Refresh data
      await fetchData();
      
      addNotification({
        type: 'info',
        icon: '🗑️',
        title: 'Request Removed',
        description: `Deletion request has been removed from the list.`,
        category: 'admin'
      });
    } catch (error) {
      console.error('Error removing deletion request:', error);
      alert('Failed to remove the request. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { text: 'Pending User Response', class: styles.badgePending },
      user_approved: { text: 'Awaiting Your Confirmation', class: styles.badgeWarning },
      user_rejected: { text: 'Rejected by User', class: styles.badgeRejected },
      admin_confirmed: { text: 'Deleted', class: styles.badgeSuccess },
      admin_rejected: { text: 'Cancelled by Admin', class: styles.badgeRejected }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`${styles.badge} ${config.class}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <div className={styles.deletionApprovals}>
        <div className={styles.loading}>
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading deletion requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.deletionApprovals}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <i className="fas fa-trash-alt"></i>
          Deletion Approvals
        </h1>
        <p className={styles.pageDescription}>
          Review and confirm deletion requests approved by users
        </p>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'pending' ? styles.active : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Confirmation ({pendingApprovals.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Requests ({allRequests.length})
        </button>
      </div>

      {activeTab === 'pending' && (
        <>
          {pendingApprovals.length === 0 ? (
            <div className={styles.emptyState}>
              <i className="fas fa-check-circle"></i>
              <h3>No pending approvals</h3>
              <p>There are no deletion requests awaiting your confirmation.</p>
            </div>
          ) : (
            <div className={styles.requestsList}>
              {pendingApprovals.map((request) => (
                <div key={request._id} className={styles.requestCard}>
                  <div className={styles.cardHeader}>
                    <div className={styles.requestInfo}>
                      <h3 className={styles.requestTitle}>
                        Deletion Request - {request.patientIndexNo}
                      </h3>
                      <div className={styles.requestMeta}>
                        <span className={styles.info}>
                          <strong>Patient approved on:</strong> {formatDate(request.userRespondedAt)}
                        </span>
                        <span className={styles.info}>
                          <strong>Original request:</strong> {formatDate(request.requestedAt)}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.section}>
                      <h4>Reason for Deletion:</h4>
                      <p className={styles.reasonText}>{request.reason}</p>
                    </div>

                    {request.patientResponse && (
                      <div className={styles.section}>
                        <h4>Patient's Comment:</h4>
                        <p className={styles.commentText}>{request.patientResponse}</p>
                      </div>
                    )}

                    <div className={styles.warningBox}>
                      <i className="fas fa-exclamation-triangle"></i>
                      <p>
                        <strong>Warning:</strong> The patient has approved this deletion request. 
                        Confirming will permanently delete their medical record. This action cannot be undone.
                      </p>
                    </div>

                    <div className={styles.actionSection}>
                      <h4>Your Decision:</h4>
                      <div className={styles.actionButtons}>
                        <button
                          className={`${styles.actionButton} ${styles.confirmButton}`}
                          onClick={() => {
                            if (window.confirm('Do you want to delete this record? This action cannot be undone.')) {
                              handleAdminConfirm(request._id, 'confirm', '');
                            }
                          }}
                        >
                          <i className="fas fa-check"></i>
                          Confirm Deletion
                        </button>
                        <button
                          className={`${styles.actionButton} ${styles.rejectButton}`}
                          onClick={() => {
                            if (window.confirm('Do you want to cancel this deletion request?')) {
                              handleAdminConfirm(request._id, 'reject', '');
                            }
                          }}
                        >
                          <i className="fas fa-times"></i>
                          Cancel Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'all' && (
        <div className={styles.historyTable}>
          <table>
            <thead>
              <tr>
                <th>Patient Index</th>
                <th>Requested</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Completed</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {allRequests.map((request) => (
                <tr key={request._id}>
                  <td>{request.patientIndexNo}</td>
                  <td>{formatDate(request.requestedAt)}</td>
                  <td className={styles.reasonCell}>{request.reason}</td>
                  <td>{getStatusBadge(request.status)}</td>
                  <td>{request.adminConfirmedAt ? formatDate(request.adminConfirmedAt) : '-'}</td>
                  <td>
                    <button
                      className={styles.removeIconButton}
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this request from the list?')) {
                          handleRemoveRequest(request._id);
                        }
                      }}
                      title="Remove from list"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DeletionApprovals;

