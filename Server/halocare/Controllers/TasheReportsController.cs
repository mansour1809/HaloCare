using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using System.Text;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class TasheReportsController : ControllerBase
    {
        private readonly TasheReportService _tasheReportService;
        private readonly WordExportService _wordExportService;

        public TasheReportsController(IConfiguration configuration)
        {
            _tasheReportService = new TasheReportService(configuration);
            _wordExportService = new WordExportService(configuration);
        }

        // POST: api/TasheReports/generate
        [HttpPost("generate")]
        public async Task<ActionResult<TasheReport>> GenerateReport([FromBody] GenerateReportRequest request)
        {
            try
            {
                // בדיקות תקינות
                if (request.PeriodStartDate >= request.PeriodEndDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                // בדיקה שהתקופה לא עולה על 6 חודשים
                if ((request.PeriodEndDate - request.PeriodStartDate).TotalDays > 180)
                {
                    return BadRequest("תקופת הדוח לא יכולה לעלות על 6 חודשים");
                }

                // בדיקה שהתאריכים לא בעתיד
                if (request.PeriodEndDate > DateTime.Now.Date)
                {
                    return BadRequest("לא ניתן ליצור דוח לתקופה עתידית");
                }

                var report = await _tasheReportService.GenerateReport(
                    request.KidId,
                    request.PeriodStartDate,
                    request.PeriodEndDate,
                    request.GeneratedByEmployeeId,
                    request.ReportTitle,
                    request.Notes
                );

                return Ok(report);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה ביצירת הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/kid/{kidId}
        [HttpGet("kid/{kidId}")]
        public ActionResult<List<TasheReport>> GetReportsByKid(int kidId)
        {
            try
            {
                var reports = _tasheReportService.GetReportsByKid(kidId);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת הדוחות: {ex.Message}");
            }
        }

        // GET: api/TasheReports/{reportId}
        [HttpGet("{reportId}")]
        public ActionResult<TasheReport> GetReport(int reportId)
        {
            try
            {
                var report = _tasheReportService.GetReportById(reportId);
                if (report == null)
                {
                    return NotFound("הדוח לא נמצא");
                }

                return Ok(report);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/treatments-preview
        [HttpGet("treatments-preview")]
        public ActionResult<List<TreatmentForTashe>> GetTreatmentsPreview(
            [FromQuery] int kidId,
            [FromQuery] DateTime startDate,
            [FromQuery] DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                var treatments = _tasheReportService.GetTreatmentsForTashe(kidId, startDate, endDate);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת הטיפולים: {ex.Message}");
            }
        }

        // PUT: api/TasheReports/approve
        [HttpPut("approve")]
        public ActionResult ApproveReport([FromBody] ApproveReportRequest request)
        {
            try
            {
                bool success = _tasheReportService.ApproveReport(request.ReportId, request.ApprovedByEmployeeId);

                if (success)
                {
                    return Ok(new { message = "הדוח אושר בהצלחה" });
                }
                else
                {
                    return BadRequest("שגיאה באישור הדוח");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה באישור הדוח: {ex.Message}");
            }
        }

        // DELETE: api/TasheReports/{reportId}
        [HttpDelete("{reportId}")]
        public ActionResult DeleteReport(int reportId, [FromQuery] int deletedByEmployeeId)
        {
            try
            {
                bool success = _tasheReportService.DeleteReport(reportId, deletedByEmployeeId);

                if (success)
                {
                    return Ok(new { message = "הדוח נמחק בהצלחה" });
                }
                else
                {
                    return BadRequest("שגיאה במחיקת הדוח");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה במחיקת הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/{reportId}/view - תצוגה מעוצבת בדפדפן
        [HttpGet("{reportId}/view")]
        public ActionResult ViewReport(int reportId)
        {
            try
            {
                var report = _tasheReportService.GetReportById(reportId);
                if (report == null)
                {
                    return NotFound("הדוח לא נמצא");
                }

                // יצירת HTML מעוצב לתצוגה
                string htmlContent = GenerateHtmlView(report);

                return Content(htmlContent, "text/html; charset=utf-8");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהצגת הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/{reportId}/download-word - הורדה כ-Word
        [HttpGet("{reportId}/download-word")]
        public ActionResult DownloadWordReport(int reportId)
        {
            try
            {
                var report = _tasheReportService.GetReportById(reportId);
                if (report == null)
                {
                    return NotFound("הדוח לא נמצא");
                }

                // יצירת קובץ Word
                byte[] wordBytes = _wordExportService.GenerateWordDocument(report);

                string fileName = $"דוח_תשה_{report.KidName?.Replace(" ", "_")}_{report.PeriodStartDate:yyyy-MM}.docx";

                return File(wordBytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהורדת הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/{reportId}/download-text - הורדה כטקסט
        [HttpGet("{reportId}/download-text")]
        public ActionResult DownloadTextReport(int reportId)
        {
            try
            {
                var report = _tasheReportService.GetReportById(reportId);
                if (report == null)
                {
                    return NotFound("הדוח לא נמצא");
                }

                // יצירת תוכן טקסט מעוצב
                string textContent = GenerateTextContent(report);
                byte[] textBytes = Encoding.UTF8.GetBytes(textContent);

                string fileName = $"דוח_תשה_{report.KidName?.Replace(" ", "_")}_{report.PeriodStartDate:yyyy-MM}.txt";

                return File(textBytes, "text/plain; charset=utf-8", fileName);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהורדת הדוח: {ex.Message}");
            }
        }
        [HttpPut("{reportId}")]
        public ActionResult<TasheReport> UpdateReport(int reportId, [FromBody] UpdateReportRequest request)
        {
            try
            {
                // בדיקות תקינות
                if (request.UpdatedByEmployeeId <= 0)
                {
                    return BadRequest("נדרש מזהה עובד תקין");
                }

                var updatedReport = _tasheReportService.UpdateReport(
                    reportId,
                    request.ReportTitle,
                    request.ReportContent,
                    request.Notes,
                    request.UpdatedByEmployeeId
                );

                return Ok(updatedReport);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בעדכון הדוח: {ex.Message}");
            }
        }

        // GET: api/TasheReports/{reportId}/can-edit - בדיקת הרשאות עריכה
        [HttpGet("{reportId}/can-edit")]
        public ActionResult<bool> CanEditReport(int reportId, [FromQuery] int employeeId)
        {
            try
            {
                bool canEdit = _tasheReportService.CanEditReport(reportId, employeeId);
                return Ok(canEdit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בבדיקת הרשאות: {ex.Message}");
            }
        }

        // GET: api/TasheReports/statistics/{kidId} 
        [HttpGet("statistics/{kidId}")]
        public ActionResult GetReportStatistics(int kidId)
        {
            try
            {
                var reports = _tasheReportService.GetReportsByKid(kidId);

                var statistics = new
                {
                    TotalReports = reports.Count,
                    ApprovedReports = reports.Count(r => r.IsApproved),
                    PendingReports = reports.Count(r => !r.IsApproved),
                    LastReportDate = reports.Any() ? reports.Max(r => r.GeneratedDate) : (DateTime?)null,
                    ReportsByMonth = reports.GroupBy(r => new { r.GeneratedDate.Year, r.GeneratedDate.Month })
                                           .Select(g => new {
                                               Month = $"{g.Key.Year}-{g.Key.Month:D2}",
                                               Count = g.Count()
                                           })
                                           .OrderBy(x => x.Month)
                                           .ToList()
                };

                return Ok(statistics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת הסטטיסטיקות: {ex.Message}");
            }
        }

        private string GenerateHtmlView(TasheReport report)
        {
            var html = new StringBuilder();

            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html dir='rtl' lang='he'>");
            html.AppendLine("<head>");
            html.AppendLine("<meta charset='utf-8'>");
            html.AppendLine("<meta name='viewport' content='width=device-width, initial-scale=1.0'>");
            html.AppendLine($"<title>{report.ReportTitle}</title>");
            html.AppendLine("<style>");
            html.AppendLine(@"
                body { 
                    font-family: 'Segoe UI', Arial, sans-serif; 
                    margin: 40px; 
                    line-height: 1.6; 
                    background-color: #f5f5f5;
                }
                .container { 
                    max-width: 800px; 
                    margin: 0 auto; 
                    background: white; 
                    padding: 40px; 
                    border-radius: 10px; 
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                }
                .header { 
                    text-align: center; 
                    border-bottom: 3px solid #2196F3; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px;
                }
                .header h1 { 
                    color: #2196F3; 
                    margin: 0; 
                    font-size: 2.5em;
                }
                .header h2 { 
                    color: #666; 
                    margin: 10px 0 0 0; 
                    font-weight: normal;
                }
                .report-info { 
                    background: #f8f9fa; 
                    padding: 20px; 
                    border-right: 4px solid #2196F3; 
                    margin-bottom: 30px;
                }
                .report-info p { 
                    margin: 5px 0; 
                    font-weight: bold;
                }
                .content { 
                    text-align: right;
                }
                .content h1 { 
                    color: #2196F3; 
                    border-bottom: 2px solid #e0e0e0; 
                    padding-bottom: 10px;
                }
                .content h2 { 
                    color: #1976D2; 
                    margin-top: 30px;
                }
                .content h3 { 
                    color: #1565C0;
                }
                .status { 
                    display: inline-block; 
                    padding: 5px 15px; 
                    border-radius: 20px; 
                    font-weight: bold; 
                    font-size: 0.9em;
                }
                .status.approved { 
                    background: #4CAF50; 
                    color: white;
                }
                .status.pending { 
                    background: #FF9800; 
                    color: white;
                }
                @media print {
                    body { margin: 0; background: white; }
                    .container { box-shadow: none; margin: 0; }
                }
            ");
            html.AppendLine("</style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");
            html.AppendLine("<div class='container'>");

            // כותרת
            html.AppendLine("<div class='header'>");
            html.AppendLine($"<h1>{report.ReportTitle}</h1>");
            html.AppendLine("<h2>גן הילד - חיפה</h2>");
            html.AppendLine("</div>");

            // פרטי הדוח
            html.AppendLine("<div class='report-info'>");
            html.AppendLine($"<p><strong>שם הילד:</strong> {report.KidName ?? "לא צוין"}</p>");
            html.AppendLine($"<p><strong>תקופת הדוח:</strong> {report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}</p>");
            html.AppendLine($"<p><strong>תאריך יצירה:</strong> {report.GeneratedDate:dd/MM/yyyy HH:mm}</p>");
            html.AppendLine($"<p><strong>נוצר על ידי:</strong> {report.GeneratedByEmployeeName ?? "לא צוין"}</p>");

            string statusClass = report.IsApproved ? "approved" : "pending";
            string statusText = report.IsApproved ? "מאושר" : "ממתין לאישור";
            html.AppendLine($"<p><strong>סטטוס:</strong> <span class='status {statusClass}'>{statusText}</span></p>");

            if (report.IsApproved && report.ApprovedDate.HasValue)
            {
                html.AppendLine($"<p><strong>תאריך אישור:</strong> {report.ApprovedDate.Value:dd/MM/yyyy}</p>");
                if (!string.IsNullOrEmpty(report.ApprovedByEmployeeName))
                {
                    html.AppendLine($"<p><strong>אושר על ידי:</strong> {report.ApprovedByEmployeeName}</p>");
                }
            }

            if (!string.IsNullOrEmpty(report.Notes))
            {
                html.AppendLine($"<p><strong>הערות:</strong> {report.Notes}</p>");
            }
            html.AppendLine("</div>");

            // תוכן הדוח
            html.AppendLine("<div class='content'>");

            // המרת הMarkdown ל-HTML בסיסי
            string htmlContent = ConvertMarkdownToHtml(report.ReportContent);
            html.AppendLine(htmlContent);

            html.AppendLine("</div>");
            html.AppendLine("</div>");
            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private string ConvertMarkdownToHtml(string markdown)
        {
            if (string.IsNullOrEmpty(markdown))
                return "<p>תוכן הדוח לא זמין.</p>";

            var html = new StringBuilder();
            string[] lines = markdown.Split(new[] { '\n', '\r' }, StringSplitOptions.None);

            foreach (string line in lines)
            {
                string trimmedLine = line.Trim();

                if (string.IsNullOrEmpty(trimmedLine))
                {
                    html.AppendLine("<br>");
                    continue;
                }

                if (trimmedLine.StartsWith("# "))
                {
                    html.AppendLine($"<h1>{trimmedLine.Substring(2)}</h1>");
                }
                else if (trimmedLine.StartsWith("## "))
                {
                    html.AppendLine($"<h2>{trimmedLine.Substring(3)}</h2>");
                }
                else if (trimmedLine.StartsWith("### "))
                {
                    html.AppendLine($"<h3>{trimmedLine.Substring(4)}</h3>");
                }
                else if (trimmedLine.StartsWith("**") && trimmedLine.EndsWith("**") && trimmedLine.Length > 4)
                {
                    string boldText = trimmedLine.Substring(2, trimmedLine.Length - 4);
                    html.AppendLine($"<p><strong>{boldText}</strong></p>");
                }
                else if (trimmedLine.StartsWith("• ") || trimmedLine.StartsWith("- "))
                {
                    string bulletText = trimmedLine.Substring(2);
                    html.AppendLine($"<li>{bulletText}</li>");
                }
                else
                {
                    html.AppendLine($"<p>{trimmedLine}</p>");
                }
            }

            return html.ToString();
        }

        private string GenerateTextContent(TasheReport report)
        {
            var content = new StringBuilder();

            content.AppendLine("==================================================");
            content.AppendLine("              גן הילד - חיפה");
            content.AppendLine($"              {report.ReportTitle}");
            content.AppendLine("==================================================");
            content.AppendLine();
            content.AppendLine($"שם הילד: {report.KidName ?? "לא צוין"}");
            content.AppendLine($"תקופת הדוח: {report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}");
            content.AppendLine($"תאריך יצירה: {report.GeneratedDate:dd/MM/yyyy HH:mm}");
            content.AppendLine($"נוצר על ידי: {report.GeneratedByEmployeeName ?? "לא צוין"}");
            content.AppendLine($"סטטוס: {(report.IsApproved ? "מאושר" : "ממתין לאישור")}");

            if (report.IsApproved && report.ApprovedDate.HasValue)
            {
                content.AppendLine($"תאריך אישור: {report.ApprovedDate.Value:dd/MM/yyyy}");
                if (!string.IsNullOrEmpty(report.ApprovedByEmployeeName))
                {
                    content.AppendLine($"אושר על ידי: {report.ApprovedByEmployeeName}");
                }
            }

            if (!string.IsNullOrEmpty(report.Notes))
            {
                content.AppendLine($"הערות: {report.Notes}");
            }

            content.AppendLine();
            content.AppendLine("==================================================");
            content.AppendLine("                    תוכן הדוח");
            content.AppendLine("==================================================");
            content.AppendLine();
            content.AppendLine(report.ReportContent);

            return content.ToString();
        }
    }

    // מודלים לבקשות
    public class GenerateReportRequest
    {
        public int KidId { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public int GeneratedByEmployeeId { get; set; }
        public string ReportTitle { get; set; }
        public string Notes { get; set; }
    }

    public class ApproveReportRequest
    {
        public int ReportId { get; set; }
        public int ApprovedByEmployeeId { get; set; }
    }
    public class UpdateReportRequest
    {
        public string ReportTitle { get; set; }
        public string ReportContent { get; set; }
        public string Notes { get; set; }
        public int UpdatedByEmployeeId { get; set; }
    }
}