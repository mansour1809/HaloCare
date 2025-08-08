using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class GeminiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly string _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";
        public GeminiService(IConfiguration configuration)
        {
            _httpClient = new HttpClient();
            _apiKey = configuration["Gemini:ApiKey"];

            if (string.IsNullOrEmpty(_apiKey))
            {
                throw new ArgumentException("Gemini API Key חסר בהגדרות");
            }
        }

        public async Task<string> GenerateTasheReportAsync(List<TreatmentForTashe> treatments, string kidName, DateTime startDate, DateTime endDate)
        {
            int maxRetries = 3;
            int delaySeconds = 5;

            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    // בניית הפרומפט
                    string prompt = BuildTashePrompt(treatments, kidName, startDate, endDate);

                    // יצירת הבקשה ל-Gemini
                    var requestBody = new
                    {
                        contents = new[]
                        {
                            new
                            {
                                parts = new[]
                                {
                                    new { text = prompt }
                                }
                            }
                        },
                        generationConfig = new
                        {
                            temperature = 0.7,
                            topK = 40,
                            topP = 0.95,
                            maxOutputTokens = 8192,
                        }
                    };

                    string json = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    // שליחת הבקשה
                    var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                    if (response.IsSuccessStatusCode)
                    {
                        string responseJson = await response.Content.ReadAsStringAsync();
                        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

                        return geminiResponse?.candidates?.Length > 0
                               ? geminiResponse.candidates[0].content.parts[0].text
                               : "שגיאה ביצירת הדוח";
                    }

                    // אם זה שגיאת 503 (עומס), ננסה שוב
                    string errorContent = await response.Content.ReadAsStringAsync();
                    if (response.StatusCode == System.Net.HttpStatusCode.ServiceUnavailable ||
                        response.StatusCode == System.Net.HttpStatusCode.TooManyRequests)
                    {
                        if (attempt < maxRetries)
                        {
                            await Task.Delay(delaySeconds * 1000 * attempt); // עיכוב מתרחב
                            continue;
                        }
                    }

                    throw new Exception($"שגיאה ב-Gemini API: {response.StatusCode} - {errorContent}");
                }
                catch (Exception ex) when (attempt < maxRetries && (ex.Message.Contains("503") || ex.Message.Contains("429")))
                {
                    // אם זה שגיאת עומס ויש לנו עוד ניסיונות
                    await Task.Delay(delaySeconds * 1000 * attempt);
                    continue;
                }
                catch (Exception ex)
                {
                    throw new Exception($"שגיאה בקריאה לשירות הבינה המלאכותית: {ex.Message}");
                }
            }

            throw new Exception("שירות הבינה המלאכותית לא זמין כרגע, נסו שוב בעוד כמה דקות");
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
        
        // מודלים לתגובת Gemini
        private class GeminiResponse
        {
            public Candidate[] candidates { get; set; }
        }

        private class Candidate
        {
            public Content content { get; set; }
        }

        private class Content
        {
            public Part[] parts { get; set; }
        }

        private class Part
        {
            public string text { get; set; }
        }
    }
}
