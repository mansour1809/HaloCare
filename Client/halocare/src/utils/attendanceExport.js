// attendanceExport.js - ייצוא נוכחות ל-PDF
import jsPDF from 'jspdf';

// הגדרת פונט עברי (נדרש להוריד ולהוסיף לפרויקט)
// import './fonts/NotoSansHebrew-normal.js';

export const exportAttendanceToPDF = (classesData, selectedDate, totalStats) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // הגדרת פונט עברי (אם זמין)
  try {
    doc.setFont('NotoSansHebrew', 'normal');
  } catch (e) {
    doc.setFont('helvetica', 'normal');
  }

  // כותרת ראשית
  doc.setFontSize(24);
  doc.setTextColor(67, 126, 234); // כחול
  doc.text('דוח נוכחות יומי - גן הילד', 105, 20, { align: 'center' });

  // תאריך
  doc.setFontSize(16);
  doc.setTextColor(100, 100, 100);
  doc.text(`תאריך: ${new Date(selectedDate).toLocaleDateString('he-IL')}`, 105, 30, { align: 'center' });

  // קו מפריד
  doc.setDrawColor(67, 126, 234);
  doc.setLineWidth(0.5);
  doc.line(20, 35, 190, 35);

  // סיכום כללי
  let yPos = 50;
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text('סיכום כללי:', 20, yPos);
  
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(76, 175, 80); // ירוק
  doc.text(`נוכחים: ${totalStats.present}`, 20, yPos);
  
  doc.setTextColor(244, 67, 54); // אדום
  doc.text(`נעדרים: ${totalStats.absent}`, 60, yPos);
  
  doc.setTextColor(255, 152, 0); // כתום
  doc.text(`לא סומן: ${totalStats.unknown}`, 100, yPos);
  
  doc.setTextColor(33, 150, 243); // כחול
  doc.text(`סה"כ: ${totalStats.total}`, 140, yPos);

  yPos += 20;

  // פירוט לפי כיתות
  classesData.forEach((classData, classIndex) => {
    // בדיקה אם נגמר המקום בעמוד
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    // כותרת כיתה
    doc.setFontSize(16);
    doc.setTextColor(67, 126, 234);
    doc.text(`${classData.className} (${classData.teacherName})`, 20, yPos);
    
    yPos += 5;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`נוכחים: ${classData.stats.present} | נעדרים: ${classData.stats.absent} | לא סומן: ${classData.stats.unknown}`, 20, yPos);
    
    yPos += 10;

    // רשימת ילדים
    classData.allKids.forEach((kid, kidIndex) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
      }

      // סטטוס נוכחות
      let statusText = '';
      let statusColor = [0, 0, 0];
      
      if (kid.isPresent === true) {
        statusText = '✓ נוכח';
        statusColor = [76, 175, 80]; // ירוק
      } else if (kid.isPresent === false) {
        statusText = '✗ נעדר';
        statusColor = [244, 67, 54]; // אדום
      } else {
        statusText = '? לא סומן';
        statusColor = [255, 152, 0]; // כתום
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text(`${kidIndex + 1}. ${kid.firstName} ${kid.lastName}`, 25, yPos);
      
      doc.setTextColor(...statusColor);
      doc.text(statusText, 120, yPos);
      
      yPos += 6;
    });

    yPos += 10;
  });

  // כותרת תחתונה
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`נוצר ב: ${new Date().toLocaleString('he-IL')} | מערכת ניהול גן הילד`, 105, 290, { align: 'center' });

  // שמירת הקובץ
  const fileName = `נוכחות_${selectedDate}.pdf`;
  doc.save(fileName);

  return fileName;
};

// ייצוא מהיר של סיכום נוכחות
export const exportQuickSummary = (totalStats, selectedDate) => {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [100, 150] // מסמך קטן
  });

  try {
    doc.setFont('NotoSansHebrew', 'normal');
  } catch (e) {
    doc.setFont('helvetica', 'normal');
  }

  // רקע צבעוני
  doc.setFillColor(67, 126, 234);
  doc.rect(0, 0, 150, 100, 'F');

  // כותרת
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('סיכום נוכחות', 75, 20, { align: 'center' });

  // תאריך
  doc.setFontSize(12);
  doc.text(new Date(selectedDate).toLocaleDateString('he-IL'), 75, 30, { align: 'center' });

  // נתונים
  doc.setFontSize(24);
  doc.text(`${totalStats.present}`, 30, 50, { align: 'center' });
  doc.text(`${totalStats.absent}`, 75, 50, { align: 'center' });
  doc.text(`${totalStats.total}`, 120, 50, { align: 'center' });

  doc.setFontSize(10);
  doc.text('נוכחים', 30, 60, { align: 'center' });
  doc.text('נעדרים', 75, 60, { align: 'center' });
  doc.text('סה"כ', 120, 60, { align: 'center' });

  const fileName = `סיכום_נוכחות_${selectedDate}.pdf`;
  doc.save(fileName);

  return fileName;
};