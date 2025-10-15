import React, { useState } from 'react';
import styles from './Reports.module.scss';
import ReportModal from '../../modals/ReportModal/ReportModal';
import ReportViewerModal from '../../modals/ReportViewerModal/ReportViewerModal';

const Reports = ({ medicines = [], patients = [], medicalRecords = [], recentReports = [], onAddReport, onDeleteReport }) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [showViewerModal, setShowViewerModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const reportCards = [
    {
      title: 'Patient Report',
      description: 'Generate detailed reports of patient medical records and history.',
      icon: '📄',
      iconClass: styles.iconLightBlue
    },
    {
      title: 'Inventory Report',
      description: 'View current medicine stock levels and inventory status.',
      icon: '📦',
      iconClass: styles.iconGreen
    },
    {
      title: 'Low Stock Report',
      description: 'Identify medicines that are running low on stock and need reordering.',
      icon: '⚠️',
      iconClass: styles.iconYellow
    },
    {
      title: 'Expiry Report',
      description: 'Track medicines approaching their expiry dates for timely management.',
      icon: '📅',
      iconClass: styles.iconRed
    }
  ];


  const handleCardClick = (reportType) => {
    setSelectedReportType(reportType);
    setShowReportModal(true);
  };

  const handleCloseModal = () => {
    setShowReportModal(false);
    setSelectedReportType('');
  };

  const handleCloseViewerModal = () => {
    setShowViewerModal(false);
    setSelectedReport(null);
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewerModal(true);
  };

  const handleDeleteReport = (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      onDeleteReport(reportId);
      alert('Report deleted successfully!');
    }
  };


  return (
    <div className={styles.reports}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Reports</h3>
        </div>
        
        <div className={styles.reportCards}>
          {reportCards.map((report, index) => (
            <div 
              key={index} 
              className={styles.reportCard}
              onClick={() => handleCardClick(report.title)}
            >
              <div className={styles.reportCardContent}>
                <div className={`${styles.reportIcon} ${report.iconClass}`}>
                  <span className={styles.iconEmoji}>{report.icon}</span>
                </div>
                <div className={styles.reportInfo}>
                  <h4>{report.title}</h4>
                  <p>{report.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Recently Generated Reports</h3>
        </div>
        
        {recentReports.length > 0 ? (
          <div className={styles.tableContainer}>
            <table className={styles.reportsTable}>
              <thead>
                <tr>
                  <th>REPORT NAME</th>
                  <th>GENERATED DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={report.id}>
                    <td className={styles.reportName}>{report.name}</td>
                    <td className={styles.generatedDate}>{report.generatedDate}</td>
                    <td>
                      <div className={styles.actionButtons}>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnView}`}
                          onClick={() => handleViewReport(report)}
                          title="View Report"
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                        <button 
                          className={`${styles.btnIcon} ${styles.btnDelete}`}
                          onClick={() => handleDeleteReport(report.id)}
                          title="Delete Report"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <i className="fas fa-file-alt"></i>
            <h3>No reports generated</h3>
            <p>Generate your first report to see it here</p>
          </div>
        )}
      </div>

      <ReportModal
        isOpen={showReportModal}
        onClose={handleCloseModal}
        reportType={selectedReportType}
        medicines={medicines}
        patients={patients}
        medicalRecords={medicalRecords}
        onAddReport={onAddReport}
      />

      <ReportViewerModal
        isOpen={showViewerModal}
        onClose={handleCloseViewerModal}
        report={selectedReport}
        medicines={medicines}
        patients={patients}
        medicalRecords={medicalRecords}
      />
    </div>
  );
};

export default Reports;