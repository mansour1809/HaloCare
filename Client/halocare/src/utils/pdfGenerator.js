//src/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function generateAttendanceReport({ child, attendanceRecords, startDate, endDate }) {
  try {
    // Calculate statistics
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => record.isPresent).length;
    const absentDays = totalDays - presentDays;
    const attendancePercentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
    
    // Sort records by date
    const sortedRecords = [...attendanceRecords].sort(
      (a, b) => new Date(a.attendanceDate) - new Date(b.attendanceDate)
    );
    
    // Create temporary HTML element
    const tempElement = document.createElement('div');
    tempElement.style.width = '800px';
    tempElement.style.padding = '20px';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.direction = 'rtl';
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    
    // Create report HTML content
    tempElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="font-size: 24px;">דוח נוכחות</h1>
        <p>תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>שם הילד:</strong> ${child.firstName} ${child.lastName}</p>
        <p><strong>מזהה:</strong> ${child.id}</p>
        <p><strong>תקופה:</strong> ${new Date(startDate).toLocaleDateString('he-IL')} - ${new Date(endDate).toLocaleDateString('he-IL')}</p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 18px;">סיכום נוכחות</h2>
        <div style="background-color: #f0f0f0; padding: 15px; border-radius: 5px;">
          <table style="width: 100%;">
            <tr>
              <td style="padding: 5px;"><strong>סה"כ ימים:</strong> ${totalDays}</td>
              <td style="padding: 5px;"><strong>ימי נוכחות:</strong> ${presentDays}</td>
              <td style="padding: 5px;"><strong>ימי היעדרות:</strong> ${absentDays}</td>
              <td style="padding: 5px;"><strong>אחוז נוכחות:</strong> ${attendancePercentage}%</td>
            </tr>
          </table>
        </div>
      </div>
      
      <div>
        <h2 style="font-size: 18px; text-align: center;">פירוט נוכחות</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #dddddd;">
              <th style="border: 1px solid #999; padding: 8px;">תאריך</th>
              <th style="border: 1px solid #999; padding: 8px;">סטטוס</th>
              <th style="border: 1px solid #999; padding: 8px;">סיבת היעדרות</th>
            </tr>
          </thead>
          <tbody>
            ${sortedRecords.map((record, index) => `
              <tr style="background-color: ${index % 2 === 0 ? '#f5f5f5' : 'white'};">
                <td style="border: 1px solid #999; padding: 8px;">${new Date(record.attendanceDate).toLocaleDateString('he-IL')}</td>
                <td style="border: 1px solid #999; padding: 8px;">${record.isPresent ? 'נוכח' : 'נעדר'}</td>
                <td style="border: 1px solid #999; padding: 8px;">${record.absenceReason || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
    
    // Add the element to DOM temporarily
    document.body.appendChild(tempElement);
    
    // Generate PDF from HTML
    return html2canvas(tempElement, { 
      scale: 1,
      useCORS: true,
      logging: false
    }).then(canvas => {
      // Remove the temp element
      document.body.removeChild(tempElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`דוח_נוכחות_${child.firstName}.pdf`);
      
      return true;
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}

// New function for treatment reports
export function generateTreatmentPDF({ treatment, child, employeeName, treatmentTypeName }) {
  try {
    // Create temporary HTML element
    const tempElement = document.createElement('div');
    tempElement.style.width = '800px';
    tempElement.style.padding = '40px';
    tempElement.style.fontFamily = 'Arial, sans-serif';
    tempElement.style.direction = 'rtl';
    tempElement.style.position = 'absolute';
    tempElement.style.left = '-9999px';
    tempElement.style.backgroundColor = 'white';
    
    // Format date properly
    const treatmentDate = new Date(treatment.treatmentDate);
    const formattedDate = treatmentDate.toLocaleDateString('he-IL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
    
    // Create star rating HTML
    const createStars = (level) => {
      let stars = '';
      for (let i = 1; i <= 5; i++) {
        stars += i <= level ? '★' : '☆';
      }
      return stars;
    };
    
    // Create report HTML content with enhanced styling
    tempElement.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #4cb5c3;">
        <h1 style="font-size: 28px; color: #2a8a95; margin-bottom: 10px;">סיכום טיפול</h1>
        <p style="font-size: 14px; color: #666;">תאריך הפקה: ${new Date().toLocaleDateString('he-IL')}</p>
      </div>
      
      <!-- Child Information -->
      <div style="background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #4cb5c3;">
        <h2 style="font-size: 20px; color: #2a8a95; margin-bottom: 15px;">פרטי הילד</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 8px; width: 50%;"><strong>שם:</strong> ${child?.firstName || ''} ${child?.lastName || ''}</td>
            <td style="padding: 8px; width: 50%;"><strong>מזהה:</strong> ${child?.id || ''}</td>
          </tr>
        </table>
      </div>
      
      <!-- Treatment Details -->
      <div style="background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ff7043;">
        <h2 style="font-size: 20px; color: #ff7043; margin-bottom: 15px;">פרטי הטיפול</h2>
        <table style="width: 100%;">
          <tr>
            <td style="padding: 10px; width: 50%;">
              <strong>תאריך טיפול:</strong><br/>
              <span style="font-size: 16px; color: #333;">${formattedDate}</span>
            </td>
            <td style="padding: 10px; width: 50%;">
              <strong>סוג טיפול:</strong><br/>
              <span style="font-size: 16px; color: #333;">${treatmentTypeName || 'לא צוין'}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; width: 50%;">
              <strong>מטפל:</strong><br/>
              <span style="font-size: 16px; color: #333;">${employeeName || 'לא צוין'}</span>
            </td>
            <td style="padding: 10px; width: 50%;">
              <strong>רמת שיתוף פעולה:</strong><br/>
              <span style="font-size: 20px; color: #ffc107;">${createStars(treatment.cooperationLevel || 0)}</span>
              <span style="font-size: 14px; color: #666;"> (${treatment.cooperationLevel || 0}/5)</span>
            </td>
          </tr>
        </table>
      </div>
      
      <!-- Treatment Description -->
      <div style="background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #10b981;">
        <h2 style="font-size: 20px; color: #10b981; margin-bottom: 15px;">תיאור הטיפול</h2>
        <div style="padding: 15px; background-color: white; border-radius: 8px; line-height: 1.8; min-height: 100px;">
          ${treatment.description ? `<p style="margin: 0; white-space: pre-wrap;">${treatment.description}</p>` : '<p style="margin: 0; color: #999;">לא צוין תיאור</p>'}
        </div>
      </div>
      
      <!-- Treatment Goals -->
      ${treatment.goals ? `
      <div style="background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #9c27b0;">
        <h2 style="font-size: 20px; color: #9c27b0; margin-bottom: 15px;">🎯 מטרות הטיפול</h2>
        <div style="padding: 15px; background-color: white; border-radius: 8px; line-height: 1.8;">
          <p style="margin: 0; white-space: pre-wrap;">${treatment.goals}</p>
        </div>
      </div>
      ` : ''}
      
      <!-- Notes -->
      ${treatment.notes ? `
      <div style="background: linear-gradient(135deg, #f8fafb 0%, #ffffff 100%); padding: 20px; border-radius: 10px; margin-bottom: 25px; border-left: 4px solid #ff9800;">
        <h2 style="font-size: 20px; color: #ff9800; margin-bottom: 15px;">📝 הערות</h2>
        <div style="padding: 15px; background-color: white; border-radius: 8px; line-height: 1.8;">
          <p style="margin: 0; white-space: pre-wrap;">${treatment.notes}</p>
        </div>
      </div>
      ` : ''}
      
      <!-- Footer -->
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
        <p style="font-size: 12px; color: #999;">
          מסמך זה הופק באופן אוטומטי ממערכת ניהול הטיפולים<br/>
          ${new Date().toLocaleString('he-IL')}
        </p>
      </div>
    `;
    
    // Add the element to DOM temporarily
    document.body.appendChild(tempElement);
    
    // Generate PDF from HTML with better settings for Hebrew
    return html2canvas(tempElement, { 
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true
    }).then(canvas => {
      // Remove the temp element
      document.body.removeChild(tempElement);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10; // Small margin from top
      
      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      
      // Generate filename with date
      const dateStr = new Date(treatment.treatmentDate).toLocaleDateString('he-IL').replace(/\//g, '-');
      const fileName = `סיכום_טיפול_${child?.firstName || 'ילד'}_${dateStr}.pdf`;
      
      pdf.save(fileName);
      
      return true;
    }).catch(error => {
      // Clean up on error
      if (tempElement.parentNode) {
        document.body.removeChild(tempElement);
      }
      throw error;
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}