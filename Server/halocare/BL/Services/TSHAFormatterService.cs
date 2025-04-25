//// BL/Services/TSHAFormatterService.cs
//using System;
//using System.Text;
//using System.Text.Json;
//using halocare.DAL.Models;

//namespace halocare.BL.Services
//{
//    public class TSHAFormatterService
//    {
//        public string FormatTSHAAsHTML(TSHA tsha, Kid kid)
//        {
//            var insights = JsonSerializer.Deserialize<TSHAInsights>(tsha.Content);

//            StringBuilder html = new StringBuilder();

//            // כותרת המסמך
//            html.AppendLine("<div class='tsha-document'>");
//            html.AppendLine("<h1>טופס תוכנית טיפול אישית</h1>");

//            // פרטי הילד
//            html.AppendLine("<div class='kid-details'>");
//            html.AppendLine($"<p><strong>שם הפעוט/ה:</strong> {kid.FirstName} {kid.LastName}</p>");
//            html.AppendLine($"<p><strong>תאריך לידה:</strong> {kid.BirthDate.ToString("dd/MM/yyyy")}</p>");
//            html.AppendLine($"<p><strong>תאריך קליטה במעון:</strong> [יש להשלים]</p>");
//            html.AppendLine($"<p><strong>תאריך הישיבה:</strong> {DateTime.Now.ToString("dd/MM/yyyy")}</p>");
//            html.AppendLine($"<p><strong>נוכחים בישיבה:</strong> [יש להשלים]</p>");
//            html.AppendLine("</div>");

//            // רקע כללי
//            html.AppendLine("<h2>רקע כללי על הפעוט</h2>");

//            // מטרות הורים
//            html.AppendLine("<h3>מטרות הורים</h3>");
//            html.AppendLine("<p>[יש להשלים על בסיס פגישת בניית מטרות משותפת]</p>");

//            // מטרות טיפוליות על פי תחומים
//            html.AppendLine("<h2>מטרות טיפוליות על פי תחומים</h2>");

//            foreach (var area in insights.Areas)
//            {
//                html.AppendLine($"<div class='treatment-area'>");
//                html.AppendLine($"<h3>תחום: {area.Key}</h3>");

//                html.AppendLine("<table border='1'>");
//                html.AppendLine("<tr><th>מטרות ראשוניות</th><th>המצב כיום</th><th>עדכון מטרות אמצע (במידה ונדרש)</th></tr>");

//                html.AppendLine("<tr>");
//                html.AppendLine("<td>");
//                foreach (var goal in area.Value.RecommendedGoals)
//                {
//                    html.AppendLine($"<p>{goal}</p>");
//                }
//                html.AppendLine("</td>");

//                html.AppendLine($"<td>{area.Value.CurrentStatus}</td>");
//                html.AppendLine("<td></td>"); // יושלם בישיבת אמצע
//                html.AppendLine("</tr>");

//                html.AppendLine("</table>");
//                html.AppendLine("</div>");
//            }

//            // מטרות על משתפות
//            html.AppendLine("<h2>מטרות על משתפות</h2>");
//            html.AppendLine("<table border='1'>");
//            html.AppendLine("<tr><th>תחום</th><th>נושא</th><th>המטרה</th><th>תאריך השגת המטרה</th><th>תיאור מצב נוכחי</th></tr>");

//            // דוגמה למטרת על
//            html.AppendLine("<tr>");
//            html.AppendLine("<td>תקשורת</td>");
//            html.AppendLine("<td>אוצר מילים</td>");
//            html.AppendLine("<td>הרחבת אוצר מילים פונקציונלי</td>");
//            html.AppendLine($"<td>{DateTime.Now.AddMonths(3).ToString("MM/yyyy")}</td>");
//            html.AppendLine("<td>[יש להשלים]</td>");
//            html.AppendLine("</tr>");

//            html.AppendLine("</table>");

//            // כרטיס משימות לכיתה
//            html.AppendLine("<h2>כרטיס משימות לכיתה</h2>");
//            html.AppendLine("<p>מטרות על משותפות:</p>");
//            html.AppendLine("<ol>");
//            html.AppendLine("<li>הרחבת אוצר מילים פונקציונליות</li>");
//            html.AppendLine("<li>התמדה בפעילות, הבנת התחלה, אמצע, סוף</li>");
//            html.AppendLine("<li>הרחבת מעגלים חברתיים</li>");
//            html.AppendLine("<li>סיום פעילות מהנה-הכרה וקבלת הסיום</li>");
//            html.AppendLine("</ol>");

//            html.AppendLine("</div>");

//            return html.ToString();
//        }
//    }
//}