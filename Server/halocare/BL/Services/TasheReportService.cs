using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class TasheReportService
    {
        private readonly TasheReportRepository _tasheReportRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly GeminiService _geminiService;

        public TasheReportService(IConfiguration configuration)
        {
            _tasheReportRepository = new TasheReportRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
            _geminiService = new GeminiService(configuration);
        }

        // המתודה החדשה - זו שחסרה!
        public async Task<TasheReport> GenerateReport(
            int kidId,
            DateTime periodStartDate,
            DateTime periodEndDate,
            int generatedByEmployeeId,
            string reportTitle = null,
            string notes = null)
        {
            // בדיקה שהילד קיים ופעיל
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור דוח לילד שאינו פעיל");
            }

            // בדיקה שהעובד קיים ופעיל
            Employee employee = _employeeRepository.GetEmployeeById(generatedByEmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור דוח על ידי עובד שאינו פעיל");
            }

            // שליפת טיפולים לתקופה
            List<TreatmentForTashe> treatments = _tasheReportRepository.GetTreatmentsForTashe(kidId, periodStartDate, periodEndDate);

            if (treatments.Count == 0)
            {
                throw new ArgumentException("לא נמצאו טיפולים לתקופה המבוקשת");
            }

            // יצירת הדוח באמצעות AI
            string kidName = $"{kid.FirstName} {kid.LastName}";
            string reportContent = await _geminiService.GenerateTasheReportAsync(treatments, kidName, periodStartDate, periodEndDate);

            // יצירת כותרת ברירת מחדל אם לא סופקה
            if (string.IsNullOrEmpty(reportTitle))
            {
                reportTitle = $"דוח תש\"ה - {kidName} - {periodStartDate:MM/yyyy}";
            }

            // שמירת הדוח במסד הנתונים
            TasheReport newReport = new TasheReport
            {
                KidId = kidId,
                PeriodStartDate = periodStartDate,
                PeriodEndDate = periodEndDate,
                ReportContent = reportContent,
                GeneratedByEmployeeId = generatedByEmployeeId,
                ReportTitle = reportTitle,
                Notes = notes,
                GeneratedDate = DateTime.Now,
                IsApproved = false
            };

            int reportId = _tasheReportRepository.AddTasheReport(newReport);
            newReport.ReportId = reportId;

            // הוספת שמות לתצוגה
            newReport.KidName = kidName;
            newReport.GeneratedByEmployeeName = $"{employee.FirstName} {employee.LastName}";

            return newReport;
        }

        public List<TasheReport> GetReportsByKid(int kidId)
        {
            var reports = _tasheReportRepository.GetTasheReportsByKid(kidId);

            // הוספת שמות עובדים ובילדים לכל דוח
            foreach (var report in reports)
            {
                var kid = _kidRepository.GetKidById(report.KidId);
                if (kid != null)
                {
                    report.KidName = $"{kid.FirstName} {kid.LastName}";
                }

                var generatedBy = _employeeRepository.GetEmployeeById(report.GeneratedByEmployeeId);
                if (generatedBy != null)
                {
                    report.GeneratedByEmployeeName = $"{generatedBy.FirstName} {generatedBy.LastName}";
                }

                if (report.ApprovedByEmployeeId.HasValue)
                {
                    var approvedBy = _employeeRepository.GetEmployeeById(report.ApprovedByEmployeeId.Value);
                    if (approvedBy != null)
                    {
                        report.ApprovedByEmployeeName = $"{approvedBy.FirstName} {approvedBy.LastName}";
                    }
                }
            }

            return reports;
        }

        public List<TreatmentForTashe> GetTreatmentsForTashe(int kidId, DateTime startDate, DateTime endDate)
        {
            return _tasheReportRepository.GetTreatmentsForTashe(kidId, startDate, endDate);
        }

        public bool ApproveReport(int reportId, int approvedByEmployeeId)
        {
            // בדיקה שהעובד המאשר קיים ופעיל
            Employee employee = _employeeRepository.GetEmployeeById(approvedByEmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד המאשר לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן לאשר דוח על ידי עובד שאינו פעיל");
            }

            return _tasheReportRepository.ApproveTasheReport(reportId, approvedByEmployeeId);
        }

        public bool DeleteReport(int reportId, int deletedByEmployeeId)
        {
            return _tasheReportRepository.DeleteTasheReport(reportId, deletedByEmployeeId);
        }

        public TasheReport GetReportById(int reportId)
        {
            var report = _tasheReportRepository.GetTasheReportById(reportId);

            if (report != null)
            {
                // הוספת שמות לתצוגה
                var kid = _kidRepository.GetKidById(report.KidId);
                if (kid != null)
                {
                    report.KidName = $"{kid.FirstName} {kid.LastName}";
                }

                var generatedBy = _employeeRepository.GetEmployeeById(report.GeneratedByEmployeeId);
                if (generatedBy != null)
                {
                    report.GeneratedByEmployeeName = $"{generatedBy.FirstName} {generatedBy.LastName}";
                }

                if (report.ApprovedByEmployeeId.HasValue)
                {
                    var approvedBy = _employeeRepository.GetEmployeeById(report.ApprovedByEmployeeId.Value);
                    if (approvedBy != null)
                    {
                        report.ApprovedByEmployeeName = $"{approvedBy.FirstName} {approvedBy.LastName}";
                    }
                }
            }

            return report;
        }

        public TasheReport UpdateReport(int reportId, string reportTitle, string reportContent, string notes, int updatedByEmployeeId)
        {
            // בדיקת הרשאות
            if (!_tasheReportRepository.CanEditReport(reportId, updatedByEmployeeId))
            {
                throw new UnauthorizedAccessException("אין הרשאה לערוך דוח זה");
            }

            // בדיקה שהעובד המעדכן קיים ופעיל
            Employee employee = _employeeRepository.GetEmployeeById(updatedByEmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן לעדכן דוח על ידי עובד שאינו פעיל");
            }

            // עדכון הדוח
            var updatedReport = _tasheReportRepository.UpdateTasheReport(reportId, reportTitle, reportContent, notes, updatedByEmployeeId);

            if (updatedReport == null)
            {
                throw new ArgumentException("שגיאה בעדכון הדוח");
            }

            return updatedReport;
        }

        // מתודה לבדיקת הרשאות עריכה
        public bool CanEditReport(int reportId, int employeeId)
        {
            return _tasheReportRepository.CanEditReport(reportId, employeeId);
        }
    }
}