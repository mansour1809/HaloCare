using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class TasheReportRepository : DBService
    {
        public TasheReportRepository(IConfiguration configuration) : base(configuration) { }

        // שליפת טיפולים לדוח תש"ה
        public List<TreatmentForTashe> GetTreatmentsForTashe(int kidId, DateTime startDate, DateTime endDate)
        {
            List<TreatmentForTashe> treatments = new List<TreatmentForTashe>();

            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@StartDate", startDate },
                { "@EndDate", endDate }
            };

            DataTable dataTable = ExecuteQuery("sp_GetTreatmentsForTashe", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                TreatmentForTashe treatment = new TreatmentForTashe
                {
                    TreatmentId = Convert.ToInt32(row["treatmentId"]),
                    KidId = Convert.ToInt32(row["kidId"]),
                    EmployeeId = Convert.ToInt32(row["employeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["treatmentDate"]),
                    Description = row["description"].ToString(),
                    CooperationLevel = row["cooperationLevel"] == DBNull.Value ? null : Convert.ToInt32(row["cooperationLevel"]),
                    Highlight = row["highlight"] == DBNull.Value ? null : row["highlight"].ToString(),
                    TreatmentTypeId = Convert.ToInt32(row["treatmentTypeId"]),
                    TreatmentTypeName = row["treatmentTypeName"].ToString(),
                    TreatmentColor = row["treatmentColor"] == DBNull.Value ? "" : row["treatmentColor"].ToString(),
                    EmployeeName = row["employeeName"].ToString(),
                    RoleName = row["roleName"].ToString(),
                    KidName = row["kidName"].ToString()
                };

                treatments.Add(treatment);
            }

            return treatments;
        }

        // הוספת דוח תש"ה חדש
        public int AddTasheReport(TasheReport report)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", report.KidId },
                { "@PeriodStartDate", report.PeriodStartDate },
                { "@PeriodEndDate", report.PeriodEndDate },
                { "@ReportContent", report.ReportContent },
                { "@GeneratedByEmployeeId", report.GeneratedByEmployeeId },
                { "@ReportTitle", report.ReportTitle ?? (object)DBNull.Value },
                { "@Notes", report.Notes ?? (object)DBNull.Value }
            };

            // הוספת פרמטר OUTPUT
            parameters.Add("@ReportId", 0);  // ערך ראשוני

            
            DataTable result = ExecuteQuery("sp_InsertTasheReport", parameters);

            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["reportId"]);
            }

            throw new Exception("שגיאה ביצירת הדוח - לא הוחזר ID");
        }
        // שליפת דוחות לפי ילד
        public List<TasheReport> GetTasheReportsByKid(int kidId)
        {
            List<TasheReport> reports = new List<TasheReport>();

            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("sp_GetTasheReportsByKid", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                TasheReport report = new TasheReport
                {
                    ReportId = Convert.ToInt32(row["reportId"]),
                    KidId = Convert.ToInt32(row["kidId"]),
                    GeneratedDate = Convert.ToDateTime(row["generatedDate"]),
                    PeriodStartDate = Convert.ToDateTime(row["periodStartDate"]),
                    PeriodEndDate = Convert.ToDateTime(row["periodEndDate"]),
                    ReportContent = row["reportContent"].ToString(),
                    GeneratedByEmployeeId = Convert.ToInt32(row["generatedByEmployeeId"]),
                    IsApproved = Convert.ToBoolean(row["isApproved"]),
                    ApprovedByEmployeeId = row["approvedByEmployeeId"] == DBNull.Value ? null : Convert.ToInt32(row["approvedByEmployeeId"]),
                    ApprovedDate = row["approvedDate"] == DBNull.Value ? null : Convert.ToDateTime(row["approvedDate"]),
                    ReportTitle = row["reportTitle"] == DBNull.Value ? null : row["reportTitle"].ToString(),
                    Notes = row["notes"] == DBNull.Value ? null : row["notes"].ToString()
                };

                reports.Add(report);
            }

            return reports;
        }

        // אישור דוח
        public bool ApproveTasheReport(int reportId, int approvedByEmployeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ReportId", reportId },
                { "@ApprovedByEmployeeId", approvedByEmployeeId }
            };

            DataTable result = ExecuteQuery("sp_ApproveTasheReport", parameters);
            return result.Rows.Count > 0;
        }

        // מחיקת דוח
        public bool DeleteTasheReport(int reportId, int deletedByEmployeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
    {
        { "@ReportId", reportId },
        { "@DeletedByEmployeeId", deletedByEmployeeId }
    };

            try
            {
                DataTable result = ExecuteQuery("sp_DeleteTasheReport", parameters);
                return result.Rows.Count > 0;
            }
            catch (Exception ex)
            {
                // השגיאה כבר מטופלת ב-SP, פשוט נעביר אותה הלאה
                throw new Exception(ex.Message);
            }

        }
        public TasheReport GetTasheReportById(int reportId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
    {
        { "@ReportId", reportId }
    };

            DataTable dataTable = ExecuteQuery("SP_GetTasheReportById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            return new TasheReport
            {
                ReportId = Convert.ToInt32(row["reportId"]),
                KidId = Convert.ToInt32(row["kidId"]),
                GeneratedDate = Convert.ToDateTime(row["generatedDate"]),
                PeriodStartDate = Convert.ToDateTime(row["periodStartDate"]),
                PeriodEndDate = Convert.ToDateTime(row["periodEndDate"]),
                ReportContent = row["reportContent"].ToString(),
                GeneratedByEmployeeId = Convert.ToInt32(row["generatedByEmployeeId"]),
                IsApproved = Convert.ToBoolean(row["isApproved"]),
                ApprovedByEmployeeId = row["approvedByEmployeeId"] == DBNull.Value ? null : Convert.ToInt32(row["approvedByEmployeeId"]),
                ApprovedDate = row["approvedDate"] == DBNull.Value ? null : Convert.ToDateTime(row["approvedDate"]),
                ReportTitle = row["reportTitle"] == DBNull.Value ? null : row["reportTitle"].ToString(),
                Notes = row["notes"] == DBNull.Value ? null : row["notes"].ToString()
            };
        }
        public TasheReport UpdateTasheReport(int reportId, string reportTitle, string reportContent, string notes, int updatedByEmployeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@ReportId", reportId },
            { "@ReportTitle", reportTitle ?? (object)DBNull.Value },
            { "@ReportContent", reportContent ?? (object)DBNull.Value },
            { "@Notes", notes ?? (object)DBNull.Value },
            { "@UpdatedByEmployeeId", updatedByEmployeeId }
        };

            DataTable dataTable = ExecuteQuery("sp_UpdateTasheReport", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            return new TasheReport
            {
                ReportId = Convert.ToInt32(row["reportId"]),
                KidId = Convert.ToInt32(row["kidId"]),
                GeneratedDate = Convert.ToDateTime(row["generatedDate"]),
                PeriodStartDate = Convert.ToDateTime(row["periodStartDate"]),
                PeriodEndDate = Convert.ToDateTime(row["periodEndDate"]),
                ReportContent = row["reportContent"].ToString(),
                GeneratedByEmployeeId = Convert.ToInt32(row["generatedByEmployeeId"]),
                IsApproved = Convert.ToBoolean(row["isApproved"]),
                ApprovedByEmployeeId = row["approvedByEmployeeId"] == DBNull.Value ? null : Convert.ToInt32(row["approvedByEmployeeId"]),
                ApprovedDate = row["approvedDate"] == DBNull.Value ? null : Convert.ToDateTime(row["approvedDate"]),
                ReportTitle = row["reportTitle"] == DBNull.Value ? null : row["reportTitle"].ToString(),
                Notes = row["notes"] == DBNull.Value ? null : row["notes"].ToString(),
                KidName = row["kidName"].ToString(),
                GeneratedByEmployeeName = row["generatedByEmployeeName"].ToString(),
                ApprovedByEmployeeName = row["approvedByEmployeeName"] == DBNull.Value ? null : row["approvedByEmployeeName"].ToString()
            };
        }

        // מתודה לבדיקת הרשאות עריכה
        public bool CanEditReport(int reportId, int employeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
        {
            { "@ReportId", reportId },
            { "@EmployeeId", employeeId }
        };

            string query = @"
            SELECT COUNT(*) as CanEdit
            FROM [dbo].[tblTasheReports] tr
            INNER JOIN [dbo].[tblEmployee] e ON e.employeeId = @EmployeeId
            WHERE tr.reportId = @ReportId 
            AND tr.isApproved = 0  -- לא אושר
            AND (tr.generatedByEmployeeId = @EmployeeId OR e.roleName IN ('מנהל', 'מנהל/ת'))  -- יוצר הדוח או מנהל
            AND e.isActive = 1";

            DataTable result = ExecuteQuery(query, parameters);

            if (result.Rows.Count > 0)
            {
                return Convert.ToInt32(result.Rows[0]["CanEdit"]) > 0;
            }

            return false;
        }

    }
}