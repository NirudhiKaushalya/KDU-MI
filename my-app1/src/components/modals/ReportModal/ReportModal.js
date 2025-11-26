import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ReportModal.module.scss';
import { useSettings } from '../../..//contexts/SettingsContext';

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
  const [allPatients, setAllPatients] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [isLoadingPatients, setIsLoadingPatients] = useState(false);
  const [isLoadingMedicines, setIsLoadingMedicines] = useState(false);

  const { settings } = useSettings();

  // Fetch all patients from database when modal opens for Patient Report
  useEffect(() => {
    const fetchAllPatients = async () => {
      if (isOpen && reportType === 'Patient Report') {
        setIsLoadingPatients(true);
        try {
          const response = await axios.get('http://localhost:8000/api/patient/');
          console.log('Fetched all patients for report:', response.data);
          setAllPatients(response.data);
        } catch (error) {
          console.error('Error fetching patients for report:', error);
          setAllPatients([]);
        } finally {
          setIsLoadingPatients(false);
        }
      }
    };

    fetchAllPatients();
  }, [isOpen, reportType]);

  // Fetch all medicines from database when modal opens for medicine-related reports
  useEffect(() => {
    const fetchAllMedicines = async () => {
      if (isOpen && (reportType === 'Inventory Report' || reportType === 'Low Stock Report' || reportType === 'Expiry Report')) {
        setIsLoadingMedicines(true);
        try {
          // Use /all endpoint to get ALL medicines, not just recent ones
          const response = await axios.get('http://localhost:8000/api/medicines/all');
          console.log('Fetched all medicines for report:', response.data);
          // Handle both array response and object with medicines property
          const medicinesData = Array.isArray(response.data) ? response.data : (response.data.medicines || []);
          setAllMedicines(medicinesData);
        } catch (error) {
          console.error('Error fetching medicines for report:', error);
          setAllMedicines([]);
        } finally {
          setIsLoadingMedicines(false);
        }
      }
    };

    fetchAllMedicines();
  }, [isOpen, reportType]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('Date')) {
      setDateRange(prev => ({
        ...prev,
        [name]: value
      }));
    } else {
      console.log('Filter changed:', name, '=', value);
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Reset all filters and close modal
  const handleCancel = () => {
    // Reset date range
    setDateRange({
      startDate: '',
      endDate: ''
    });
    // Reset filters
    setFilters({
      category: '',
      status: '',
      patientId: ''
    });
    // Close the modal
    onClose();
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
        // Use allPatients from database (fetched via API) instead of session patients
        let filteredRecords = [...allPatients];
        
        // Filter by date range (using string comparison for YYYY-MM-DD format)
        if (dateRange.startDate || dateRange.endDate) {
          filteredRecords = filteredRecords.filter(record => {
            const recordDate = record.consultedDate || record.admittedDate || '';
            
            if (dateRange.startDate && recordDate < dateRange.startDate) return false;
            if (dateRange.endDate && recordDate > dateRange.endDate) return false;
            return true;
          });
        }
        
        // Filter by Index No
        if (filters.patientId) {
          filteredRecords = filteredRecords.filter(record => {
            return record.indexNo && record.indexNo.toLowerCase().includes(filters.patientId.toLowerCase());
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
          columns: ['Index No', 'Condition', 'Consulted Date', 'Consulted Time', 'Reason', 'Role']
        };
        return patientReport;
      case 'Inventory Report':
        // Use allMedicines from database instead of session medicines
        let filteredMedicines = [...allMedicines];
        
        console.log('Inventory Report - Original medicines count:', allMedicines.length);
        console.log('Inventory Report - Selected category filter:', filters.category);
        console.log('Inventory Report - Date range:', dateRange);
        
        // Filter by date range (using createdAt - when medicine was added)
        if (dateRange.startDate || dateRange.endDate) {
          filteredMedicines = filteredMedicines.filter(medicine => {
            // Use createdAt timestamp for filtering
            const createdDate = medicine.createdAt ? new Date(medicine.createdAt).toISOString().split('T')[0] : '';
            
            if (dateRange.startDate && createdDate < dateRange.startDate) return false;
            if (dateRange.endDate && createdDate > dateRange.endDate) return false;
            return true;
          });
          console.log('Inventory Report - After date filter:', filteredMedicines.length);
        }
        
        // Filter by category
        if (filters.category) {
          filteredMedicines = filteredMedicines.filter(medicine => 
            medicine.category === filters.category
          );
          console.log('Inventory Report - Filtered medicines count:', filteredMedicines.length);
        }
        
        return {
          title: 'Medicine Inventory Report',
          description: 'Current stock levels and inventory status of all medicines',
          data: filteredMedicines,
          columns: ['Medicine Name', 'Category', 'Brand', 'Quantity', 'Stock Level', 'Low Stock Threshold']
        };
      case 'Low Stock Report':
        // Use allMedicines from database
        let lowStockMedicines = allMedicines.filter(med => {
          // Check if medicine has low stock based on quantity vs threshold
          const hasLowStock = med.lowStockThreshold && 
                             med.quantity && 
                             parseInt(med.quantity) <= parseInt(med.lowStockThreshold);
          
          // Also check stock level if available
          const isLowStockLevel = med.stockLevel === 'Low Stock' || med.stockLevel === 'Out of Stock';
          
          return hasLowStock || isLowStockLevel;
        });

        // Filter by date range (using createdAt - when medicine was added)
        if (dateRange.startDate || dateRange.endDate) {
          lowStockMedicines = lowStockMedicines.filter(medicine => {
            const createdDate = medicine.createdAt ? new Date(medicine.createdAt).toISOString().split('T')[0] : '';
            
            if (dateRange.startDate && createdDate < dateRange.startDate) return false;
            if (dateRange.endDate && createdDate > dateRange.endDate) return false;
            return true;
          });
        }

        // Apply stock level filter if selected
        if (filters.status) {
          lowStockMedicines = lowStockMedicines.filter(med => med.stockLevel === filters.status);
        }

        return {
          title: 'Low Stock Alert Report',
          description: 'Medicines that are running low on stock and need reordering',
          data: lowStockMedicines,
          columns: ['Medicine Name', 'Category', 'Brand', 'Current Quantity', 'Low Stock Threshold', 'Stock Level']
        };
      case 'Expiry Report':
        // Use allMedicines from database
        return {
          title: 'Medicine Expiry Report',
          description: 'Medicines approaching their expiry dates for timely management',
          data: allMedicines.filter(med => {
            const expiryDate = new Date(med.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

            // Use the dropdown filter value if selected, otherwise show all future expiry dates
            // filters.status contains: "" (All), "30", "60", or "90"
            let alertWindowDays;
            if (filters.status) {
              // User selected a specific filter (30, 60, or 90 days)
              alertWindowDays = parseInt(filters.status);
            } else {
              // "All" selected - show all medicines with future expiry dates (within 365 days)
              alertWindowDays = 365;
            }

            // Optionally apply date range if provided
            const startOk = !dateRange.startDate || expiryDate >= new Date(dateRange.startDate);
            const endOk = !dateRange.endDate || expiryDate <= new Date(dateRange.endDate);

            // Show medicines expiring within the selected window (and not already expired)
            return daysUntilExpiry >= 0 && daysUntilExpiry <= alertWindowDays && startOk && endOk;
          }),
          columns: ['Name', 'Category', 'Quantity', 'Expiry Date', 'Days Until Expiry']
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
        return (
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Index No</label>
            <input
              type="text"
              name="patientId"
              value={filters.patientId}
              onChange={handleInputChange}
              placeholder="Enter patient index number"
              className={styles.filterInput}
            />
          </div>
        );
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
              <option value="Antiseptics">Antiseptics</option>
              <option value="Vitamins">Vitamins</option>
              <option value="Other">Other</option>
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
              <option value="Out of Stock">Out of Stock</option>
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
    <div className={styles.modalOverlay} onClick={handleCancel}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{reportInfo.title}</h2>
          <button className={styles.closeButton} onClick={handleCancel}>
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

            {(isLoadingPatients && reportType === 'Patient Report') || 
             (isLoadingMedicines && (reportType === 'Inventory Report' || reportType === 'Low Stock Report' || reportType === 'Expiry Report')) ? (
              <div className={styles.noData}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>Loading {reportType === 'Patient Report' ? 'patient records' : 'medicines'} from database...</p>
              </div>
            ) : reportInfo.data.length > 0 ? (
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
                    {(reportType === 'Inventory Report' ? reportInfo.data : reportInfo.data.slice(0, 5)).map((item, index) => (
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
                {reportType !== 'Inventory Report' && reportInfo.data.length > 5 && (
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
              <button className={styles.cancelButton} onClick={handleCancel}>Close</button>
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
              <button className={styles.cancelButton} onClick={handleCancel}>
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
