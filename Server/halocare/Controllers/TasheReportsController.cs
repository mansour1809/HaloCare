using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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

        public TasheReportsController(IConfiguration configuration)
        {
            _tasheReportService = new TasheReportService(configuration);
        }

        // POST: api/TasheReports/generate
        [HttpPost("generate")]
        public async Task<ActionResult<TasheReport>> GenerateReport([FromBody] GenerateReportRequest request)
        {
            try
            {
                if (request.PeriodStartDate >= request.PeriodEndDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                // בדיקה שהתקופה לא עולה על 6 חודשים
                if ((request.PeriodEndDate - request.PeriodStartDate).TotalDays > 180)
                {
                    return BadRequest("תקופת הדוח לא יכולה לעלות על 6 חודשים");
                }

                TasheReport report = await _tasheReportService.GenerateReportAsync(
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
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TasheReports/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<List<TasheReport>> GetReportsByKid(int kidId)
        {
            try
            {
                List<TasheReport> reports = _tasheReportService.GetReportsByKid(kidId);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TasheReports/treatments-preview
        [HttpGet("treatments-preview")]
        public ActionResult<List<TreatmentForTashe>> GetTreatmentsPreview(int kidId, DateTime startDate, DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                List<TreatmentForTashe> treatments = _tasheReportService.GetTreatmentsForTashe(kidId, startDate, endDate);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // PUT: api/TasheReports/approve
        [HttpPut("approve")]
        public ActionResult ApproveReport([FromBody] ApproveReportRequest request)
        {
            try
            {
                bool result = _tasheReportService.ApproveReport(request.ReportId, request.ApprovedByEmployeeId);

                if (result)
                {
                    return Ok("הדוח אושר בהצלחה");
                }
                else
                {
                    return NotFound("הדוח לא נמצא או לא ניתן לאשר");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // DELETE: api/TasheReports/5
        [HttpDelete("{reportId}")]
        public ActionResult DeleteReport(int reportId, [FromQuery] int deletedByEmployeeId)
        {
            try
            {
                bool result = _tasheReportService.DeleteReport(reportId, deletedByEmployeeId);

                if (result)
                {
                    return Ok("הדוח נמחק בהצלחה");
                }
                else
                {
                    return NotFound("הדוח לא נמצא או לא ניתן למחוק");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
        [HttpGet("{reportId}/view")]
        public ActionResult ViewReport(int reportId)
        {
            try
            {
                var reports = _tasheReportService.GetReportsByKid(203918376); // נקבל הכל ונסנן
                var report = reports.FirstOrDefault(r => r.ReportId == reportId);

                if (report == null)
                {
                    return NotFound("הדוח לא נמצא");
                }

                // יצירת HTML לתצוגה
                var htmlContent = $@"
<!DOCTYPE html>
<html dir='rtl' lang='he'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{report.ReportTitle}</title>
    <style>
        body {{ 
            font-family: Arial, sans-serif; 
            line-height: 1.6; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f5f5f5;
        }}
        .container {{
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1, h2 {{ color: #2c3e50; }}
        table {{ 
            width: 100%; 
            border-collapse: collapse; 
            margin: 15px 0; 
        }}
        th, td {{ 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: right; 
        }}
        th {{ 
            background-color: #4CAF50; 
            color: white; 
            font-weight: bold;
        }}
        .header {{
            text-align: center;
            border-bottom: 2px solid #4CAF50;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }}
        .metadata {{
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }}
        @media print {{
            body {{ background: white; }}
            .container {{ box-shadow: none; }}
        }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🏥 גן הילד - חיפה</h1>
            <h2>📋 {report.ReportTitle}</h2>
        </div>
        
        <div class='metadata'>
            <p><strong>📅 תאריך יצירה:</strong> {report.GeneratedDate:dd/MM/yyyy HH:mm}</p>
            <p><strong>📊 תקופת הדוח:</strong> {report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}</p>
            <p><strong>👨‍⚕️ נוצר על ידי:</strong> {report.GeneratedByEmployeeName}</p>
            {(report.IsApproved ? $"<p><strong>✅ סטטוס:</strong> מאושר</p>" : "<p><strong>⏳ סטטוס:</strong> ממתין לאישור</p>")}
        </div>
        
        <div class='content'>
            {report.ReportContent.Replace("\n", "<br>")}
        </div>
        
        <div style='margin-top: 40px; text-align: center; color: #666; font-size: 12px;'>
            <p>דוח זה נוצר במערכת הדיגיטלית של גן הילד</p>
            <p>מודפס ב: {DateTime.Now:dd/MM/yyyy HH:mm}</p>
        </div>
    </div>
    
    <script>
        // הדפסה אוטומטית כשלוחצים Ctrl+P
        document.addEventListener('keydown', function(e) {{
            if (e.ctrlKey && e.key === 'p') {{
                window.print();
            }}
        }});
    </script>
</body>
</html>";

                return Content(htmlContent, "text/html", System.Text.Encoding.UTF8);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        private string BuildTashePrompt(List<TreatmentForTashe> treatments, string kidName, DateTime startDate, DateTime endDate)
        {
            StringBuilder prompt = new StringBuilder();

            prompt.AppendLine("אתה מומחה בטיפול התפתחותי לילדים עם צרכים מיוחדים.");
            prompt.AppendLine("עליך ליצור דוח תש\"ה (תוכנית שיקומית התפתחותית) בפורמט מדויק וקבוע.");
            prompt.AppendLine();
            prompt.AppendLine("חשוב מאוד: השתמש בפורמט הבא בדיוק, ללא שינויים:");
            prompt.AppendLine();

            // בניית סיכום הטיפולים
            Dictionary<string, List<TreatmentForTashe>> groupedTreatments = new Dictionary<string, List<TreatmentForTashe>>();
            foreach (var treatment in treatments)
            {
                if (!groupedTreatments.ContainsKey(treatment.TreatmentTypeName))
                {
                    groupedTreatments[treatment.TreatmentTypeName] = new List<TreatmentForTashe>();
                }
                groupedTreatments[treatment.TreatmentTypeName].Add(treatment);
            }

            // חישוב סטטיסטיקות
            double avgCooperation = treatments.Where(t => t.CooperationLevel.HasValue)
                .Select(t => t.CooperationLevel.Value)
                .DefaultIfEmpty(0)
                .Average();

            prompt.AppendLine("## דוח תש\"ה (תוכנית שיקומית התפתחותית)");
            prompt.AppendLine();
            prompt.AppendLine($"**שם הילד:** {kidName}");
            prompt.AppendLine($"**תקופת הדוח:** {startDate:dd/MM/yyyy} – {endDate:dd/MM/yyyy}");
            prompt.AppendLine();

            prompt.AppendLine("**1. רקע כללי:**");
            prompt.AppendLine();
            prompt.AppendLine($"{kidName} הגיע לטיפול רב-תחומי במסגרת תוכנית שיקומית התפתחותית. ");
            prompt.AppendLine($"הדוח הנוכחי מסכם את ההתקדמות שנרשמה בתקופה שבין {startDate:dd/MM/yyyy} ל-{endDate:dd/MM/yyyy} ");
            prompt.AppendLine($"ומציג מטרות טיפוליות להמשך. בתקופה זו בוצעו {treatments.Count} טיפולים ");
            prompt.AppendLine($"עם ממוצע שיתוף פעולה של {avgCooperation:F1}/5.");
            prompt.AppendLine();

            prompt.AppendLine("**2. מטרות הורים:**");
            prompt.AppendLine();
            prompt.AppendLine("על בסיס הטיפולים שבוצעו, מטרות ההורים כוללות:");
            prompt.AppendLine();

            // מטרות בהתבסס על סוגי הטיפולים שבוצעו
            if (groupedTreatments.ContainsKey("פיזיותרפיה"))
                prompt.AppendLine("* שיפור המיומנויות המוטוריות והניידות העצמאית.");
            if (groupedTreatments.ContainsKey("ריפוי בעיסוק"))
                prompt.AppendLine("* פיתוח מיומנויות מוטוריות עדינות ותיאום עין-יד.");
            if (groupedTreatments.ContainsKey("טיפול רגשי"))
                prompt.AppendLine("* קידום ההתפתחות הרגשית והחברתית.");
            if (groupedTreatments.ContainsKey("תזונה"))
                prompt.AppendLine("* שיפור הרגלי אכילה ותזונה מאוזנת.");
            if (groupedTreatments.ContainsKey("טיפול במוזיקה"))
                prompt.AppendLine("* פיתוח כישורי תקשורת והבעה דרך מוזיקה.");
            prompt.AppendLine();

            prompt.AppendLine("**3. מטרות טיפוליות מפורטות:**");
            prompt.AppendLine();

            // יצירת טבלאות לכל תחום טיפולי
            foreach (var group in groupedTreatments)
            {
                prompt.AppendLine($"**{group.Key}:**");
                prompt.AppendLine();
                prompt.AppendLine("| נושא | מטרה | תאריך יעד | מצב נוכחי | שלב לפני השגת המטרה | שלב נוסף לאחר השגת המטרה |");
                prompt.AppendLine("|---|---|---|---|---|---|");

                // ניתוח הטיפולים וייצור מטרות
                var latestTreatment = group.Value.OrderByDescending(t => t.TreatmentDate).First();
                var progressDescription = !string.IsNullOrEmpty(latestTreatment.Highlight) ?
                    latestTreatment.Highlight :
                    latestTreatment.Description.Length > 50 ?
                        latestTreatment.Description.Substring(0, 50) + "..." :
                        latestTreatment.Description;

                // תאריך יעד - 3 חודשים מהיום
                var targetDate = endDate.AddMonths(3);

                prompt.AppendLine($"| מיומנות מרכזית | שיפור ביכולות ה{group.Key.ToLower()} | {targetDate:dd/MM/yyyy} | {progressDescription} ({latestTreatment.TreatmentDate:dd/MM/yyyy}) | התקדמות חלקית ביעד | השגת יעד מלא והרחבה למיומנויות נוספות |");
                prompt.AppendLine();
            }

            prompt.AppendLine("**4. כרטיס משימות לכיתה:**");
            prompt.AppendLine();
            prompt.AppendLine("**הנחיות מעשיות לצוות החינוכי:**");
            prompt.AppendLine();

            foreach (var group in groupedTreatments)
            {
                prompt.AppendLine($"* **{group.Key}:**");

                switch (group.Key.ToLower())
                {
                    case "פיזיותרפיה":
                        prompt.AppendLine("  - עידוד פעילות גופנית במהלך היום");
                        prompt.AppendLine("  - תרגילי חיזוק ושיווי משקל");
                        prompt.AppendLine("  - זמן מנוחה בין פעילויות מאומצות");
                        break;
                    case "ריפוי בעיסוק":
                        prompt.AppendLine("  - פעילויות יצירה ומיומנויות עדינות");
                        prompt.AppendLine("  - תרגול שימוש בכלי עבודה");
                        prompt.AppendLine("  - משחקים המפתחים תיאום עין-יד");
                        break;
                    case "טיפול רגשי":
                        prompt.AppendLine("  - מתן סביבה תומכת ומכילה");
                        prompt.AppendLine("  - עידוד ביטוי רגשות במילים");
                        prompt.AppendLine("  - יצירת הזדמנויות לאינטראקציה חברתית");
                        break;
                    case "תזונה":
                        prompt.AppendLine("  - הצגת מזונות חדשים בצורה משחקית");
                        prompt.AppendLine("  - עידוד שתיית מים במהלך היום");
                        prompt.AppendLine("  - שמירה על שגרת אכילה קבועה");
                        break;
                    case "טיפול במוזיקה":
                        prompt.AppendLine("  - שילוב מוזיקה בפעילויות יומיומיות");
                        prompt.AppendLine("  - עידוד השתתפות בפעילויות קבוצתיות");
                        prompt.AppendLine("  - שימוש במוזיקה להרגעה ורגוש");
                        break;
                    default:
                        prompt.AppendLine("  - המשך יישום התוכנית הטיפולית");
                        prompt.AppendLine("  - מעקב והתאמה לפי הצורך");
                        break;
                }
                prompt.AppendLine();
            }

            prompt.AppendLine("**5. סיכום והמלצות:**");
            prompt.AppendLine();
            prompt.AppendLine($"{kidName} הראה התקדמות בתקופת הדוח. המשך הטיפול הרב-תחומי ");
            prompt.AppendLine("הוא חיוני להמשך התפתחותו התקינה. מומלץ המשך מעקב צמוד, ");
            prompt.AppendLine("עבודה משותפת עם ההורים, והערכה מחודשת בעוד שלושה חודשים.");
            prompt.AppendLine();

            prompt.AppendLine("---");
            prompt.AppendLine();
            prompt.AppendLine("**הערה:** דוח זה נוצר באמצעות מערכת דיגיטלית על בסיס נתוני הטיפולים במערכת.");

            // הוספת נתוני הטיפולים לבסיס הפרומפט
            prompt.AppendLine();
            prompt.AppendLine("== נתוני הטיפולים לעיבוד ==");
            foreach (var group in groupedTreatments)
            {
                prompt.AppendLine($"=== {group.Key} ===");
                foreach (var treatment in group.Value.OrderBy(t => t.TreatmentDate))
                {
                    prompt.AppendLine($"תאריך: {treatment.TreatmentDate:dd/MM/yyyy}");
                    prompt.AppendLine($"מטפל: {treatment.EmployeeName}");
                    prompt.AppendLine($"תיאור: {treatment.Description}");
                    if (treatment.CooperationLevel.HasValue)
                        prompt.AppendLine($"שיתוף פעולה: {treatment.CooperationLevel}/5");
                    if (!string.IsNullOrEmpty(treatment.Highlight))
                        prompt.AppendLine($"נקודות חשובות: {treatment.Highlight}");
                    prompt.AppendLine("---");
                }
            }

            prompt.AppendLine();
            prompt.AppendLine("השתמש במידע זה ליצירת דוח בפורמט המדויק שהוגדר למעלה.");
            prompt.AppendLine("שמור על המבנה, הכותרות והפורמט בדיוק.");

            return prompt.ToString();
        }


       [HttpGet("{reportId}/download")]
public ActionResult DownloadReport(int reportId)
{
    try
    {
        var reports = _tasheReportService.GetReportsByKid(0); // נקבל הכל ונסנן
        var report = reports.FirstOrDefault(r => r.ReportId == reportId);
        
        if (report == null)
        {
            return NotFound("הדוח לא נמצא");
        }

        // יצירת תוכן הקובץ
        var content = $@"
==================================================
              גן הילד - חיפה
              {report.ReportTitle}
==================================================

תאריך יצירה: {report.GeneratedDate:dd/MM/yyyy HH:mm}
תקופת הדוח: {report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}
נוצר על ידי: {report.GeneratedByEmployeeName}
סטטוס: {(report.IsApproved ? "מאושר" : "ממתין לאישור")}

{(report.Notes != null ? $"הערות: {report.Notes}\n" : "")}

==================================================
                תוכן הדוח
==================================================

{report.ReportContent}

==================================================
דוח זה נוצר במערכת הדיגיטלית של גן הילד
הורד בתאריך: {DateTime.Now:dd/MM/yyyy HH:mm}
==================================================
";

        var bytes = System.Text.Encoding.UTF8.GetBytes(content);
        var fileName = $"דוח_תשה_{report.KidName}_{report.GeneratedDate:yyyy-MM-dd}.txt";
        
        return File(bytes, "text/plain", fileName);
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
    }
}

        // פונקציות עזר להמרה
        private string ConvertReportToHtml(TasheReport report)
        {
            var html = new StringBuilder();
            html.AppendLine("<!DOCTYPE html>");
            html.AppendLine("<html dir='rtl' lang='he'>");
            html.AppendLine("<head>");
            html.AppendLine("<meta charset='UTF-8'>");
            html.AppendLine("<title>" + report.ReportTitle + "</title>");
            html.AppendLine("<style>");
            html.AppendLine(@"
        body { 
            font-family: Arial, sans-serif; 
            direction: rtl; 
            text-align: right;
            margin: 40px;
            line-height: 1.6;
        }
        h1, h2, h3 { color: #2c3e50; }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
            direction: rtl;
        }
        table, th, td { 
            border: 1px solid #ddd; 
        }
        th, td { 
            padding: 12px; 
            text-align: right;
        }
        th { 
            background-color: #f2f2f2; 
            font-weight: bold;
        }
        .header-info {
            background-color: #e8f4f8;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #3498db;
            font-size: 0.9em;
            color: #666;
        }
    ");
            html.AppendLine("</style>");
            html.AppendLine("</head>");
            html.AppendLine("<body>");

            // כותרת
            html.AppendLine("<div class='header-info'>");
            html.AppendLine($"<h1>{report.ReportTitle}</h1>");
            html.AppendLine($"<p><strong>תקופה:</strong> {report.PeriodStartDate:dd/MM/yyyy} - {report.PeriodEndDate:dd/MM/yyyy}</p>");
            html.AppendLine($"<p><strong>נוצר בתאריך:</strong> {report.GeneratedDate:dd/MM/yyyy}</p>");
            html.AppendLine("</div>");

            // תוכן הדוח (המרה מ-Markdown ל-HTML)
            var htmlContent = ConvertMarkdownToHtml(report.ReportContent);
            html.AppendLine(htmlContent);

            html.AppendLine("<div class='footer'>");
            html.AppendLine("<p><em>דוח זה נוצר במערכת ניהול גן הילד באמצעות בינה מלאכותית</em></p>");
            html.AppendLine("</div>");

            html.AppendLine("</body>");
            html.AppendLine("</html>");

            return html.ToString();
        }

        private string ConvertMarkdownToHtml(string markdown)
        {
            // המרה פשוטה מ-Markdown ל-HTML
            var html = markdown
                .Replace("\n# ", "\n<h1>")
                .Replace("\n## ", "\n<h2>")
                .Replace("\n### ", "\n<h3>")
                .Replace("**", "<strong>", StringComparison.OrdinalIgnoreCase)
                .Replace("**", "</strong>", StringComparison.OrdinalIgnoreCase)
                .Replace("\n\n", "</p><p>")
                .Replace("\n", "<br>");

            // טיפול בטבלאות
            if (html.Contains("|"))
            {
                html = ConvertMarkdownTablesToHtml(html);
            }

            return "<p>" + html + "</p>";
        }

        private string ConvertMarkdownTablesToHtml(string markdown)
        {
            var lines = markdown.Split('\n');
            var result = new StringBuilder();
            bool inTable = false;

            foreach (var line in lines)
            {
                if (line.Contains("|") && !line.StartsWith("|----"))
                {
                    if (!inTable)
                    {
                        result.AppendLine("<table>");
                        inTable = true;
                    }

                    var cells = line.Split('|').Where(c => !string.IsNullOrWhiteSpace(c)).ToArray();

                    if (cells.Any(c => c.Contains("נושא") || c.Contains("מטרה"))) // כותרת
                    {
                        result.AppendLine("<tr>");
                        foreach (var cell in cells)
                        {
                            result.AppendLine($"<th>{cell.Trim()}</th>");
                        }
                        result.AppendLine("</tr>");
                    }
                    else // תוכן
                    {
                        result.AppendLine("<tr>");
                        foreach (var cell in cells)
                        {
                            result.AppendLine($"<td>{cell.Trim()}</td>");
                        }
                        result.AppendLine("</tr>");
                    }
                }
                else
                {
                    if (inTable)
                    {
                        result.AppendLine("</table>");
                        inTable = false;
                    }
                    result.AppendLine(line);
                }
            }

            if (inTable)
            {
                result.AppendLine("</table>");
            }

            return result.ToString();
        }

        private byte[] ConvertReportToPdf(TasheReport report)
        {
            // כאן תוכלו להוסיף ספרייה להמרת PDF כמו iTextSharp או PuppeteerSharp
            // לעת עתה, נחזיר את ה-HTML כ-bytes
            var htmlContent = ConvertReportToHtml(report);
            return Encoding.UTF8.GetBytes(htmlContent);
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
}