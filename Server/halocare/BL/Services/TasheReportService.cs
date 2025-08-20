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

        
        public async Task<TasheReport> GenerateReport(
            int kidId,
            DateTime periodStartDate,
            DateTime periodEndDate,
            int generatedByEmployeeId,
            string reportTitle = null,
            string notes = null)
        {
            // Check if the kid exists and is active
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור דוח לילד שאינו פעיל");
            }

            // Check if the employee exists and is active
            Employee employee = _employeeRepository.GetEmployeeById(generatedByEmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור דוח על ידי עובד שאינו פעיל");
            }

            // Fetching treatments for the period
            List<TreatmentForTashe> treatments = _tasheReportRepository.GetTreatmentsForTashe(kidId, periodStartDate, periodEndDate);

            if (treatments.Count == 0)
            {
                throw new ArgumentException("לא נמצאו טיפולים לתקופה המבוקשת");
            }

            // Creating the report using AI
            string kidName = $"{kid.FirstName} {kid.LastName}";
            string reportContent = await _geminiService.GenerateTasheReportAsync(treatments, kidName, periodStartDate, periodEndDate);

            // Creating a default title if not provided
            if (string.IsNullOrEmpty(reportTitle))
            {
                reportTitle = $"דוח תש\"ה - {kidName} - {periodStartDate:MM/yyyy}";
            }

            // Saving the report to the database
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

            // Adding names for display
            newReport.KidName = kidName;
            newReport.GeneratedByEmployeeName = $"{employee.FirstName} {employee.LastName}";

            return newReport;
        }

        public List<TasheReport> GetReportsByKid(int kidId)
        {
            var reports = _tasheReportRepository.GetTasheReportsByKid(kidId);

            // Adding names for display
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
            // Checking if the approving employee exists and is active
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
                // Adding names for display
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
            // Checking if the updating employee exists and is active
            Employee employee = _employeeRepository.GetEmployeeById(updatedByEmployeeId);
            if (employee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }
            if (!employee.IsActive)
            {
                throw new ArgumentException("לא ניתן לעדכן דוח על ידי עובד שאינו פעיל");
            }

            // Updating the report - checks will be performed in the SP
            var updatedReport = _tasheReportRepository.UpdateTasheReport(reportId, reportTitle, reportContent, notes, updatedByEmployeeId);

            if (updatedReport == null)
            {
                throw new ArgumentException("שגיאה בעדכון הדוח");
            }

            return updatedReport;
        }

    }
}