
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