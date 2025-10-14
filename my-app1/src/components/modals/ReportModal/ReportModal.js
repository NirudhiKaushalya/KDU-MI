import React, { useState } from 'react';
import styles from './ReportModal.module.scss';

const ReportModal = ({ isOpen, onClose, reportType, medicines = [], patients = [], medicalRecords = [], onAddReport, report = null }) => {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    patientId: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('Date')) {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };


  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // Simulate report generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get the report data
    const reportData = getReportData();
    
    // Create report object with all necessary data
    const generatedReport = {
      id: Date.now(), // Generate unique ID
      name: `${reportData.title} - ${new Date().toLocaleDateString()}`,
      generatedDate: new Date().toISOString().split('T')[0],
      type: reportType.toLowerCase().replace(/\s+/g, '-'),
      title: reportData.title,
      description: reportData.description,
      data: reportData.data,
      columns: reportData.columns,
      filters: {
        dateRange,
        ...filters
      },
      generatedAt: new Date().toISOString()
    };
    
    
    // Add report to recent reports
    if (onAddReport) {
      onAddReport(generatedReport);
    }
    
    setIsGenerating(false);
    alert(`${reportType} report generated successfully!`);
    onClose();
  };

  const getReportData = () => {
    
    switch (reportType) {
      case 'Patient Report':
        // Apply filters to patient data (not medical records)
        let filteredRecords = [...patients];
        
        // Filter by date range
        if (dateRange.startDate || dateRange.endDate) {
          filteredRecords = filteredRecords.filter(record => {
            const recordDate = new Date(record.admittedDate || record.consultedDate);
            const startDate = dateRange.startDate ? new Date(dateRange.startDate) : null;
            const endDate = dateRange.endDate ? new Date(dateRange.endDate) : null;
            
            if (startDate && recordDate < startDate) return false;
            if (endDate && recordDate > endDate) return false;
            return true;
          });
        }
        
        // Filter by status (if needed)
        if (filters.status) {
          filteredRecords = filteredRecords.filter(record => {
            // Filter by role or condition if needed
            return true;
          });
        }
        
        const patientReport = {
          title: 'Patient Medical Records Report',
          description: 'Comprehensive report of patient medical history and records',
          data: filteredRecords,
          columns: ['ID', 'Index No', 'Condition', 'Consulted Date', 'Consulted Time', 'Reason', 'Role']
        };
        return patientReport;
      case 'Inventory Report':
        return {
          title: 'Medicine Inventory Report',
          description: 'Current stock levels and inventory status of all medicines',
          data: medicines,
          columns: ['ID', 'Medicine Name', 'Category', 'Brand', 'Quantity', 'Stock Level', 'Low Stock Threshold']
        };
      case 'Low Stock Report':
        return {
          title: 'Low Stock Alert Report',
          description: 'Medicines that are running low on stock and need reordering',
          data: medicines.filter(med => {
            // Check if medicine has low stock based on quantity vs threshold
            const hasLowStock = med.lowStockThreshold && 
                               med.quantity && 
                               parseInt(med.quantity) <= parseInt(med.lowStockThreshold);
            
            // Also check stock level if available
            const isLowStockLevel = med.stockLevel === 'Low Stock' || med.stockLevel === 'Out of Stock';
            
            return hasLowStock || isLowStockLevel;
          }),
          columns: ['ID', 'Medicine Name', 'Category', 'Brand', 'Current Quantity', 'Low Stock Threshold', 'Stock Level']
        };
      case 'Expiry Report':
        return {
          title: 'Medicine Expiry Report',
          description: 'Medicines approaching their expiry dates for timely management',
          data: medicines.filter(med => {
            const expiryDate = new Date(med.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 90; // Within 90 days
          }),
          columns: ['ID', 'Name', 'Category', 'Quantity', 'Expiry Date', 'Days Until Expiry']
        };
      default:
        return { title: 'Report', description: '', data: [], columns: [] };
    }
  };

  const reportInfo = report ? report : getReportData();

  const downloadCSV = () => {
    if (!reportInfo || !reportInfo.data) return;
    const rows = [reportInfo.columns, ...reportInfo.data.map(item => reportInfo.columns.map(col => {
      // Handle special cases first
      if (col === 'Days Until Expiry' && item.expiryDate) {
        return Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
      }
      
      // Map column names to actual object properties
      const columnMapping = {
        'ID': item.id,
        'Medicine Name': item.medicineName,
        'Name': item.medicineName || item.name,
        'Category': item.category,
        'Brand': item.brand,
        'Quantity': item.quantity,
        'Stock Level': item.stockLevel,
        'Low Stock Threshold': item.lowStockThreshold,
        'Expiry Date': item.expiryDate,
        'Index No': item.indexNo,
        'Condition': item.condition,
        'Consulted Date': item.consultedDate || item.admittedDate,
        'Consulted Time': item.consultedTime || item.admittedTime,
        'Reason': item.reason || item.reasonForConsultation,
        'Role': item.role,
        'Current Quantity': item.quantity,
        'Threshold': item.lowStockThreshold
      };
      
      return columnMapping[col] || '';
    }))];

    const csvContent = rows.map(r => r.map(cell => `"${String(cell === undefined || cell === null ? '' : cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(reportInfo.title || 'report').replace(/\s+/g, '_').toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    // Open a new window and write a minimal report for printing
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `table{width:100%;border-collapse:collapse}th,td{padding:8px;border:1px solid #ddd;text-align:left}thead th{background:#f1f5f9}`;
    printWindow.document.write('<html><head><title>' + (reportInfo.title || 'Report') + '</title>');
    printWindow.document.head.appendChild(styleEl);
    printWindow.document.write('</head><body>');
    printWindow.document.write('<h2>' + (reportInfo.title || '') + '</h2>');
    printWindow.document.write('<p>' + (reportInfo.description || '') + '</p>');
    printWindow.document.write('<table>');
    printWindow.document.write('<thead><tr>' + reportInfo.columns.map(c => `<th>${c}</th>`).join('') + '</tr></thead>');
    printWindow.document.write('<tbody>');
    reportInfo.data.forEach(item => {
      printWindow.document.write('<tr>');
      reportInfo.columns.forEach(col => {
        // Handle special cases first
        let val = '';
        if (col === 'Days Until Expiry' && item.expiryDate) {
          val = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
        } else {
          // Map column names to actual object properties
          const columnMapping = {
            'ID': item.id,
            'Medicine Name': item.medicineName,
            'Name': item.medicineName || item.name,
            'Category': item.category,
            'Brand': item.brand,
            'Quantity': item.quantity,
            'Stock Level': item.stockLevel,
            'Low Stock Threshold': item.lowStockThreshold,
            'Expiry Date': item.expiryDate,
            'Index No': item.indexNo,
            'Condition': item.condition,
            'Consulted Date': item.consultedDate || item.admittedDate,
            'Consulted Time': item.consultedTime || item.admittedTime,
            'Reason': item.reason || item.reasonForConsultation,
            'Role': item.role,
            'Current Quantity': item.quantity,
            'Threshold': item.lowStockThreshold
          };
          val = columnMapping[col] || '';
        }
        printWindow.document.write(`<td>${val}</td>`);
      });
      printWindow.document.write('</tr>');
    });
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getFilterFields = () => {
    switch (reportType) {
      case 'Patient Report':
        return null;
      case 'Inventory Report':
        return (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Category</label>
            <select 
              name="category" 
              value={filters.category} 
              onChange={handleInputChange}
              className={styles.filterInput}
            >
              <option value="">All Categories</option>
              <option value="Analgesics">Analgesics</option>
              <option value="Antibiotics">Antibiotics</option>
              <option value="Antihistamines">Antihistamines</option>
            </select>
          </div>
        );
      case 'Low Stock Report':
        return (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Stock Level</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleInputChange}
              className={styles.filterInput}
            >
              <option value="">All Levels</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        );
      case 'Expiry Report':
        return (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Days Until Expiry</label>
            <select 
              name="status" 
              value={filters.status} 
              onChange={handleInputChange}
              className={styles.filterInput}
            >
              <option value="">All</option>
              <option value="30">Within 30 days</option>
              <option value="60">Within 60 days</option>
              <option value="90">Within 90 days</option>
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{reportInfo.title}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.reportDescription}>
            <p>{reportInfo.description}</p>
          </div>

          <div className={styles.reportFilters}>
            <h3>Report Filters</h3>
            
            <div className={styles.dateRange}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleInputChange}
                  className={styles.filterInput}
                />
              </div>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleInputChange}
                  className={styles.filterInput}
                />
              </div>
            </div>

            {getFilterFields()}
          </div>

          <div className={styles.reportPreview}>
            <h3>Report Preview</h3>
            <div className={styles.previewStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Records:</span>
                <span className={styles.statValue}>{reportInfo.data.length}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Generated:</span>
                <span className={styles.statValue}>{new Date().toLocaleDateString()}</span>
              </div>
            </div>

            {reportInfo.data.length > 0 ? (
              <div className={styles.previewTable}>
                <table>
                  <thead>
                    <tr>
                      {reportInfo.columns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportInfo.data.slice(0, 5).map((item, index) => (
                      <tr key={index}>
                        {reportInfo.columns.map((column, colIndex) => (
                          <td key={colIndex}>
                            {(() => {
                              // Handle special cases first
                              if (column === 'Days Until Expiry' && item.expiryDate) {
                                return Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                              }
                              
                              // Map column names to actual object properties
                              const columnMapping = {
                                'ID': item.id,
                                'Medicine Name': item.medicineName,
                                'Name': item.medicineName || item.name,
                                'Category': item.category,
                                'Brand': item.brand,
                                'Quantity': item.quantity,
                                'Stock Level': item.stockLevel,
                                'Low Stock Threshold': item.lowStockThreshold,
                                'Expiry Date': item.expiryDate,
                                'Index No': item.indexNo,
                                'Condition': item.condition,
                                'Consulted Date': item.consultedDate || item.admittedDate,
                                'Consulted Time': item.consultedTime || item.admittedTime,
                                'Reason': item.reason || item.reasonForConsultation,
                                'Role': item.role,
                                'Current Quantity': item.quantity,
                                'Threshold': item.lowStockThreshold
                              };
                              
                              return columnMapping[column] || '-';
                            })()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportInfo.data.length > 5 && (
                  <p className={styles.moreRecords}>
                    ... and {reportInfo.data.length - 5} more records
                  </p>
                )}
              </div>
            ) : (
              <div className={styles.noData}>
                <i className="fas fa-info-circle"></i>
                <p>No data available for the selected criteria</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          {/* If viewing an existing report show Close / Download CSV / Print */}
          {report ? (
            <>
              <button className={styles.cancelButton} onClick={onClose}>Close</button>
              <button className={styles.csvButton} onClick={downloadCSV}>
                <i className="fas fa-download"></i>
                Download CSV
              </button>
              <button className={styles.printButton} onClick={handlePrint}>
                <i className="fas fa-print"></i>
                Print Report
              </button>
            </>
          ) : (
            <>
              <button className={styles.cancelButton} onClick={onClose}>
                Cancel
              </button>
              <button 
                className={styles.generateButton} 
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-export"></i>
                    Generate Report
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
