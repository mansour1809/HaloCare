using System;
using System.ComponentModel.DataAnnotations;

namespace halocare.DAL.Models
{
    public class TasheReport
    {
        public int ReportId { get; set; }

        [Required]
        public int KidId { get; set; }

        public DateTime GeneratedDate { get; set; }

        [Required]
        public DateTime PeriodStartDate { get; set; }

        [Required]
        public DateTime PeriodEndDate { get; set; }

        [Required]
        [MinLength(50, ErrorMessage = "תוכן הדוח חייב להכיל לפחות 50 תווים")]
        public string ReportContent { get; set; }

        [Required]
        public int GeneratedByEmployeeId { get; set; }

        public bool IsApproved { get; set; } = false;

        public int? ApprovedByEmployeeId { get; set; }

        public DateTime? ApprovedDate { get; set; }

        [MaxLength(200)]
        public string ReportTitle { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        // Navigation properties - לא נשמרים במסד הנתונים
        public string KidName { get; set; }
        public string GeneratedByEmployeeName { get; set; }
        public string ApprovedByEmployeeName { get; set; }

        // Computed properties
        public int PeriodDays => (PeriodEndDate - PeriodStartDate).Days;
        public bool IsPendingApproval => !IsApproved;
        public string StatusText => IsApproved ? "מאושר" : "ממתין לאישור";
        public string FormattedPeriod => $"{PeriodStartDate:dd/MM/yyyy} - {PeriodEndDate:dd/MM/yyyy}";

        // Methods for validation
        public bool IsValidPeriod()
        {
            return PeriodStartDate < PeriodEndDate &&
                   PeriodEndDate <= DateTime.Now.Date &&
                   (PeriodEndDate - PeriodStartDate).TotalDays <= 180;
        }

        public bool CanBeApproved()
        {
            return !IsApproved && !string.IsNullOrEmpty(ReportContent);
        }

        public bool CanBeDeleted()
        {
            return !IsApproved;
        }
    }

    public class TreatmentForTashe
    {
        public int TreatmentId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime TreatmentDate { get; set; }
        public string Description { get; set; }
        public int? CooperationLevel { get; set; }
        public string Highlight { get; set; }
        public int TreatmentTypeId { get; set; }
        public string TreatmentTypeName { get; set; }
        public string TreatmentColor { get; set; }
        public string EmployeeName { get; set; }
        public string RoleName { get; set; }
        public string KidName { get; set; }

        // Computed properties
        public string FormattedDate => TreatmentDate.ToString("dd/MM/yyyy");
        public string CooperationDescription => CooperationLevel switch
        {
            1 => "שיתוף פעולה מינימלי",
            2 => "שיתוף פעולה חלקי",
            3 => "שיתוף פעולה בינוני",
            4 => "שיתוף פעולה טוב",
            5 => "שיתוף פעולה מצוין",
            _ => "לא הוגדר"
        };

        public bool HasHighlight => !string.IsNullOrEmpty(Highlight);
        public string ShortDescription => Description?.Length > 100 ?
            Description.Substring(0, 97) + "..." : Description;
    }

    // DTO לבקשת יצירת דוח
    public class CreateTasheReportRequest
    {
        [Required]
        public int KidId { get; set; }

        [Required]
        public DateTime PeriodStartDate { get; set; }

        [Required]
        public DateTime PeriodEndDate { get; set; }

        [Required]
        public int GeneratedByEmployeeId { get; set; }

        [MaxLength(200)]
        public string ReportTitle { get; set; }

        [MaxLength(500)]
        public string Notes { get; set; }

        // Validation method
        public bool IsValid(out string errorMessage)
        {
            errorMessage = "";

            if (PeriodStartDate >= PeriodEndDate)
            {
                errorMessage = "תאריך התחלה חייב להיות לפני תאריך הסיום";
                return false;
            }

            if (PeriodEndDate > DateTime.Now.Date)
            {
                errorMessage = "לא ניתן ליצור דוח לתקופה עתידית";
                return false;
            }

            if ((PeriodEndDate - PeriodStartDate).TotalDays > 180)
            {
                errorMessage = "תקופת הדוח לא יכולה לעלות על 6 חודשים";
                return false;
            }

            if ((PeriodEndDate - PeriodStartDate).TotalDays < 7)
            {
                errorMessage = "תקופת הדוח חייבת להיות לפחות שבוע";
                return false;
            }

            return true;
        }
    }

    // DTO לאישור דוח
    public class ApproveTasheReportRequest
    {
        [Required]
        public int ReportId { get; set; }

        [Required]
        public int ApprovedByEmployeeId { get; set; }
    }

    // DTO לסטטיסטיקות דוחות
    public class TasheReportStatistics
    {
        public int TotalReports { get; set; }
        public int ApprovedReports { get; set; }
        public int PendingReports { get; set; }
        public DateTime? LastReportDate { get; set; }
        public List<MonthlyReportCount> ReportsByMonth { get; set; } = new List<MonthlyReportCount>();
        public List<TreatmentTypeSummary> TreatmentTypesSummary { get; set; } = new List<TreatmentTypeSummary>();
    }

    public class MonthlyReportCount
    {
        public string Month { get; set; }
        public int Count { get; set; }
    }

    public class TreatmentTypeSummary
    {
        public string TreatmentType { get; set; }
        public int Count { get; set; }
        public string Color { get; set; }
    }

    // Enum לסטטוס דוח
    public enum ReportStatus
    {
        Draft = 0,
        PendingApproval = 1,
        Approved = 2,
        Rejected = 3
    }

    // Enum לסוגי טיפול (למיפוי עם מסד הנתונים)
    public enum TreatmentType
    {
        Emotional = 1,      // טיפול רגשי
        Physiotherapy = 2,  // פיזיותרפיה  
        Occupational = 3,   // ריפוי בעיסוק
        Nutrition = 4,      // תזונה
        Medical = 5         // רפואי
    }
}