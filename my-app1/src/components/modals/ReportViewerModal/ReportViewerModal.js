import React from 'react';
import styles from './ReportViewerModal.module.scss';
import jsPDF from 'jspdf';

const ReportViewerModal = ({ isOpen, onClose, report, medicines = [], patients = [], medicalRecords = [] }) => {
  if (!isOpen || !report) return null;


  const getReportData = () => {
    // Use the actual report data that was generated
    if (report.data && report.title) {
      return {
        title: report.title,
        description: report.description || getReportDescription(report.type),
        data: report.data.length > 0 ? report.data : getSampleData(report.type),
        columns: getReportColumns(report.type)
      };
    }
    
    // Fallback to old logic if report data is not available
    switch (report.type) {
      case 'inventory':
        return {
          title: 'Inventory Report',
          description: 'Current medicine stock levels and inventory status',
          data: medicines.length > 0 ? medicines : getSampleData('Inventory Report'),
          columns: ['ID', 'Name', 'Category', 'Brand', 'Quantity', 'Stock Level', 'Expiry Date']
        };
      case 'patient':
        return {
          title: 'Patient Report',
          description: 'Patient medical records and history',
          data: medicalRecords.length > 0 ? medicalRecords : getSampleData('Patient Report'),
          columns: ['ID', 'Index No', 'Condition', 'Consulted Date', 'Consulted Time']
        };
      case 'low-stock':
        return {
          title: 'Low Stock Report',
          description: 'Medicines that are running low on stock',
          data: medicines.length > 0 ? medicines.filter(med => med.stockLevel === 'Low Stock' || med.quantity < med.lowStockThreshold) : getSampleData('Low Stock Report'),
          columns: ['ID', 'Name', 'Category', 'Current Quantity', 'Threshold', 'Stock Level']
        };
      case 'expiry':
        return {
          title: 'Expiry Report',
          description: 'Medicines approaching their expiry dates',
          data: medicines.length > 0 ? medicines.filter(med => {
            const expiryDate = new Date(med.expiryDate);
            const today = new Date();
            const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry <= 90;
          }) : getSampleData('Expiry Report'),
          columns: ['ID', 'Name', 'Category', 'Quantity', 'Expiry Date', 'Days Until Expiry']
        };
      default:
        return { title: 'Report', description: '', data: [], columns: [] };
    }
  };

  const getReportDescription = (type) => {
    switch (type) {
      case 'Patient Report':
        return 'Comprehensive report of patient medical history and records';
      case 'Inventory Report':
        return 'Current stock levels and inventory status of all medicines';
      case 'Low Stock Report':
        return 'Medicines that are running low on stock and need reordering';
      case 'Expiry Report':
        return 'Medicines approaching their expiry dates for timely management';
      default:
        return 'Generated report data';
    }
  };

  const getReportColumns = (type) => {
    switch (type) {
      case 'Patient Report':
        return ['ID', 'Index No', 'Condition', 'Consulted Date'];
      case 'Inventory Report':
        return ['ID', 'Name', 'Category', 'Brand', 'Quantity', 'Stock Level', 'Expiry Date'];
      case 'Low Stock Report':
        return ['ID', 'Name', 'Category', 'Current Quantity', 'Threshold', 'Stock Level'];
      case 'Expiry Report':
        return ['ID', 'Name', 'Category', 'Quantity', 'Expiry Date', 'Days Until Expiry'];
      default:
        return ['ID', 'Name', 'Details'];
    }
  };

  const getSampleData = (type) => {
    switch (type) {
      case 'Inventory Report':
        return [
          {
            id: 'M54321',
            name: 'Paracetamol 500mg',
            category: 'Analgesics',
            brand: 'PharmaCorp',
            quantity: 150,
            stockLevel: 'In Stock',
            expiryDate: '2024-12-31'
          },
          {
            id: 'M54322',
            name: 'Amoxicillin 250mg',
            category: 'Antibiotics',
            brand: 'MediLife',
            quantity: 15,
            stockLevel: 'Low Stock',
            expiryDate: '2024-08-15'
          },
          {
            id: 'M54323',
            name: 'Ibuprofen 200mg',
            category: 'Analgesics',
            brand: 'HealthPlus',
            quantity: 80,
            stockLevel: 'In Stock',
            expiryDate: '2025-02-28'
          },
          {
            id: 'M54324',
            name: 'Cetirizine 10mg',
            category: 'Antihistamines',
            brand: 'AllergyFree',
            quantity: 0,
            stockLevel: 'Out of Stock',
            expiryDate: '2023-10-01'
          }
        ];
      case 'Patient Report':
        return [
          {
            id: 'P001',
            indexNo: '123456',
            condition: 'Hypertension',
            consultedDate: '2023-10-01'
          },
          {
            id: 'P002',
            indexNo: '123457',
            condition: 'Diabetes',
            consultedDate: '2023-10-02'
          }
        ];
      case 'Low Stock Report':
        return [
          {
            id: 'M54322',
            name: 'Amoxicillin 250mg',
            category: 'Antibiotics',
            quantity: 15,
            lowStockThreshold: 20,
            stockLevel: 'Low Stock'
          },
          {
            id: 'M54324',
            name: 'Cetirizine 10mg',
            category: 'Antihistamines',
            quantity: 0,
            lowStockThreshold: 10,
            stockLevel: 'Out of Stock'
          }
        ];
      case 'Expiry Report':
        return [
          {
            id: 'M54322',
            name: 'Amoxicillin 250mg',
            category: 'Antibiotics',
            quantity: 15,
            expiryDate: '2024-08-15'
          },
          {
            id: 'M54324',
            name: 'Cetirizine 10mg',
            category: 'Antihistamines',
            quantity: 0,
            expiryDate: '2023-10-01'
          }
        ];
      default:
        return [];
    }
  };

  const reportData = getReportData();

  const handleDownload = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Set document properties
    doc.setProperties({
      title: reportData.title,
      subject: reportData.description,
      author: 'KDU Medical Inventory Management System',
      creator: 'KDU Medical System'
    });

    // Add header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('KDU Medical Inventory Management System', 20, 20);
    
    doc.setFontSize(16);
    doc.text(reportData.title, 20, 30);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 40);
    
    if (reportData.description) {
      doc.text(reportData.description, 20, 50);
    }

    // Calculate table dimensions
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    const tableWidth = pageWidth - (margin * 2);
    const colCount = reportData.columns.length;
    const colWidth = tableWidth / colCount;
    
    // Table header
    let xPos = margin;
    let yPos = 70;
    
    doc.setFontSize(8);
    doc.setFont(undefined, 'bold');
    
    reportData.columns.forEach((column, index) => {
      // Wrap long text
      const text = column.length > 12 ? column.substring(0, 12) + '...' : column;
      doc.text(text, xPos, yPos);
      xPos += colWidth;
    });

    // Table data
    doc.setFont(undefined, 'normal');
    yPos += 10;
    
    reportData.data.forEach((item, rowIndex) => {
      // Check if we need a new page
      if (yPos > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yPos = 20;
      }
      
      xPos = margin;
      
      reportData.columns.forEach((column, colIndex) => {
        let cellValue = '-';
        
        // Use the same logic as the table rendering
        switch (column) {
          case 'ID':
            cellValue = item.id || '-';
            break;
          case 'Index No':
            cellValue = item.indexNo || '-';
            break;
          case 'Name':
            cellValue = item.medicineName || item.name || item.patientName || '-';
            break;
          case 'Category':
            cellValue = item.category || '-';
            break;
          case 'Brand':
            cellValue = item.brand || '-';
            break;
          case 'Quantity':
            cellValue = item.quantity || '-';
            break;
          case 'Unit':
            cellValue = item.stockLevel || '-';
            break;
          case 'Supplier':
            cellValue = item.supplier || '-';
            break;
          case 'Batch Number':
            cellValue = item.expiryDate || '-';
            break;
          case 'Cost Per Unit':
            cellValue = item.description || '-';
            break;
          case 'Threshold':
            cellValue = item.threshold || '-';
            break;
          case 'Total Value':
            cellValue = item.totalValue ? `$${item.totalValue}` : '-';
            break;
          case 'Location':
            cellValue = item.location || '-';
            break;
          case 'Reorder Level':
            cellValue = item.reorderLevel || '-';
            break;
          case 'Stock Level':
            cellValue = item.stockLevel || '-';
            break;
          case 'Expiry Date':
            cellValue = item.expiryDate || '-';
            break;
          case 'Condition':
            cellValue = item.condition || '-';
            break;
          case 'Consulted Date':
            cellValue = item.consultedDate || item.admittedDate || '-';
            break;
          case 'Consulted Time':
            cellValue = item.consultedTime || item.admittedTime || '-';
            break;
          default:
            cellValue = item[column.toLowerCase().replace(/\s+/g, '')] || '-';
        }
        
        // Wrap long text and ensure it fits in cell
        const text = String(cellValue).length > 15 ? String(cellValue).substring(0, 15) + '...' : String(cellValue);
        doc.text(text, xPos, yPos);
        xPos += colWidth;
      });
      
      yPos += 8;
    });

    // Add footer
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.text('KDU Medical Inventory Management System - Generated Report', 20, pageHeight - 10);

    // Download the PDF
    const fileName = `${reportData.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.headerInfo}>
            <h2 className={styles.modalTitle}>Report</h2>
            <p className={styles.reportName}>{reportData.title} - {new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' })}</p>
            <p className={styles.generatedDate}>Generated on {new Date().toISOString().split('T')[0]}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.reportDescription}>
            <p>{reportData.description}</p>
          </div>

          <div className={styles.reportStats}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-file-alt"></i>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{reportData.data.length}</span>
                <span className={styles.statLabel}>TOTAL RECORDS</span>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <i className="fas fa-calendar"></i>
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{new Date().toISOString().split('T')[0]}</span>
                <span className={styles.statLabel}>GENERATED DATE</span>
              </div>
            </div>
          </div>

          <div className={styles.reportTable}>
            {reportData.data.length > 0 ? (
              <div className={styles.tableContainer}>
                <table>
                  <thead>
                    <tr>
                      {reportData.columns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.data.map((item, index) => (
                      <tr key={index}>
                        {reportData.columns.map((column, colIndex) => {
                          let cellValue = '-';
                          
                          
                          switch (column) {
                            case 'ID':
                              cellValue = item.id || '-';
                              break;
                            case 'Index No':
                              cellValue = item.indexNo || '-';
                              break;
                            case 'Name':
                              cellValue = item.medicineName || item.name || item.patientName || '-';
                              break;
                            case 'Condition':
                              cellValue = item.condition || '-';
                              break;
                            case 'Consulted Date':
                              cellValue = item.consultedDate || item.admittedDate || '-';
                              break;
                            case 'Consulted Time':
                              cellValue = item.consultedTime || item.admittedTime || '-';
                              break;
                            case 'Diagnosis':
                              cellValue = item.diagnosis || '-';
                              break;
                            
                            case 'Role':
                              cellValue = item.role || '-';
                              break;
                            case 'Category':
                              cellValue = item.category || '-';
                              break;
                            case 'Brand':
                              cellValue = item.brand || '-';
                              break;
                            case 'Quantity':
                              cellValue = item.quantity || '-';
                              break;
                            case 'Current Quantity':
                              cellValue = item.quantity || '-';
                              break;
                            case 'Unit':
                              cellValue = item.stockLevel || '-';
                              break;
                            case 'Supplier':
                              cellValue = item.supplier || '-';
                              break;
                            case 'Batch Number':
                              cellValue = item.expiryDate || '-';
                              break;
                            case 'Cost Per Unit':
                              cellValue = item.description || '-';
                              break;
                            case 'Total Value':
                              cellValue = item.totalValue ? `$${item.totalValue}` : '-';
                              break;
                            case 'Location':
                              cellValue = item.location || '-';
                              break;
                            case 'Threshold':
                              cellValue = item.threshold || '-';
                              break;
                            case 'Reorder Level':
                              cellValue = item.reorderLevel || '-';
                              break;
                            case 'Stock Level':
                              cellValue = item.stockLevel || '-';
                              break;
                            case 'Expiry Date':
                              cellValue = item.expiryDate || '-';
                              break;
                            case 'Days Until Expiry':
                              if (item.expiryDate) {
                                const expiryDate = new Date(item.expiryDate);
                                const today = new Date();
                                const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
                                cellValue = daysUntilExpiry > 0 ? daysUntilExpiry : 'Expired';
                              } else {
                                cellValue = '-';
                              }
                              break;
                            default:
                              cellValue = item[column.toLowerCase().replace(/\s+/g, '')] || '-';
                          }
                          
                          return <td key={colIndex}>{cellValue}</td>;
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.noData}>
                <i className="fas fa-info-circle"></i>
                <h3>No data available</h3>
                <p>This report contains no records matching the criteria.</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            Close
          </button>
          <div className={styles.actionButtons}>
            <button className={styles.downloadButton} onClick={handleDownload}>
              <i className="fas fa-download"></i>
              Download PDF
            </button>
            <button className={styles.printButton} onClick={handlePrint}>
              <i className="fas fa-print"></i>
              Print Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportViewerModal;
