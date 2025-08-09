using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;
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
                    // בניית הפרומפט המשופר
                    string prompt = BuildProfessionalTashePrompt(treatments, kidName, startDate, endDate);

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
                            temperature = 0.3, // הפחתה לעקביות טובה יותר
                            topK = 40,
                            topP = 0.8, // הפחתה לעקביות
                            maxOutputTokens = 8192,
                        },
                        safetySettings = new[]
                        {
                            new { category = "HARM_CATEGORY_HARASSMENT", threshold = "BLOCK_NONE" },
                            new { category = "HARM_CATEGORY_HATE_SPEECH", threshold = "BLOCK_NONE" },
                            new { category = "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold = "BLOCK_NONE" },
                            new { category = "HARM_CATEGORY_DANGEROUS_CONTENT", threshold = "BLOCK_NONE" }
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

        private string BuildProfessionalTashePrompt(List<TreatmentForTashe> treatments, string kidName, DateTime startDate, DateTime endDate)
        {
            StringBuilder prompt = new StringBuilder();

            // הגדרת התפקיד והמטרה
            prompt.AppendLine("אתה מומחה בכתיבת דוחות תש\"ה (תוכניות שיקומיות התפתחותיות) למעונות יום טיפוליים.");
            prompt.AppendLine("תפקידך ליצור דוח מקצועי בפורמט אחיד שתואם למבנה הסטנדרטי של גן הילד בחיפה.");
            prompt.AppendLine();

            // הוראות כלליות
            prompt.AppendLine("== הוראות כלליות ==");
            prompt.AppendLine("• השתמש בשפה מקצועית אך נגישה");
            prompt.AppendLine("• התבסס רק על הנתונים שסופקו");
            prompt.AppendLine("• שמור על פורמט אחיד בכל הסעיפים");
            prompt.AppendLine("• השתמש בטרמינולוגיה רפואית מדויקת");
            prompt.AppendLine("• הקפד על אובייקטיביות ומקצועיות");
            prompt.AppendLine("• אל תוסיף כפילויות או חזרות על אותו מידע");
            prompt.AppendLine();

            // פרטי הדוח
            prompt.AppendLine($"== פרטי הדוח ==");
            prompt.AppendLine($"שם הילד: {kidName}");
            prompt.AppendLine($"תקופת הדוח: {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}");
            prompt.AppendLine($"תאריך יצירת הדוח: {DateTime.Now:dd/MM/yyyy}");
            prompt.AppendLine();

            // המבנה הנדרש - בהתאם למבנה של נאדר
            prompt.AppendLine("== מבנה הדוח הנדרש ==");
            prompt.AppendLine("יש ליצור דוח עם המבנה הבא בדיוק (ללא כפילויות!):");
            prompt.AppendLine();

            prompt.AppendLine("# דוח תש\"ה (תוכנית שיקומית התפתחותית)");
            prompt.AppendLine();
            prompt.AppendLine($"**שם הילד:** {kidName}");
            prompt.AppendLine($"**תקופת הדוח:** {startDate:dd/MM/yyyy} - {endDate:dd/MM/yyyy}");
            prompt.AppendLine($"**תאריך הדוח:** {DateTime.Now:dd/MM/yyyy}");
            prompt.AppendLine();

            prompt.AppendLine("## 1. רקע כללי");
            prompt.AppendLine("כתוב פסקה קצרה (2-3 שורות) על מטרת הדוח ותקופת הטיפול.");
            prompt.AppendLine();

            prompt.AppendLine("## 2. מטרות הורים");
            prompt.AppendLine("כתוב על המטרות והציפיות של ההורים (על בסיס הטיפולים שבוצעו).");
            prompt.AppendLine();

            prompt.AppendLine("## 3. מטרות טיפוליות על פי תחומים");
            prompt.AppendLine();

            // בנייה דינמית של תחומי הטיפול
            var treatmentGroups = treatments.GroupBy(t => t.TreatmentTypeName).ToList();

            foreach (var group in treatmentGroups.OrderBy(g => GetTreatmentTypeOrder(g.Key)))
            {
                prompt.AppendLine($"### {group.Key}");
                prompt.AppendLine();
                prompt.AppendLine("| מטרות ראשוניות | המצב כיום | עדכון מטרות אמצע |");
                prompt.AppendLine("|---|---|---|");
                prompt.AppendLine("| כתוב 2-3 מטרות ספציפיות | תאר את המצב הנוכחי | כתוב המלצות להמשך |");
                prompt.AppendLine();
            }

            prompt.AppendLine("## 4. כרטיס משימות");
            prompt.AppendLine();
            prompt.AppendLine("**מטפלים:** (הוסף את שמות המטפלים הרלוונטיים)");
            prompt.AppendLine();
            prompt.AppendLine("**משימות:**");
            prompt.AppendLine();

            foreach (var group in treatmentGroups.OrderBy(g => GetTreatmentTypeOrder(g.Key)))
            {
                prompt.AppendLine($"• **{group.Key}:**");
                prompt.AppendLine("  - משימה 1 (תדירות ומשך)");
                prompt.AppendLine("  - משימה 2 (תדירות ומשך)");
                prompt.AppendLine("  - משימה 3 (תדירות ומשך)");
                prompt.AppendLine();
            }

            prompt.AppendLine("**הערות:**");
            prompt.AppendLine("• יש להתאים את משך הזמן ותדירות המשימות ליכולותיו של הילד");
            prompt.AppendLine("• חשוב לשלב את המשימות באופן טבעי בתוך שגרת היום-יום");
            prompt.AppendLine("• יש לעודד את הילד ולהתאים את המשימות לרמת הקושי שלו");
            prompt.AppendLine("• יש לתעד את ההתקדמות ולעדכן את תוכנית הטיפול בהתאם");
            prompt.AppendLine();

            prompt.AppendLine("## 5. המלצות");
            prompt.AppendLine("• המשך טיפולים רב-תחומיים לפי התוכנית המפורטת");
            prompt.AppendLine("• מעקב רפואי צמוד");
            prompt.AppendLine("• שיתוף פעולה מלא בין ההורים, הצוות הטיפולי והגננת");
            prompt.AppendLine("• הערכה מחודשת של התקדמותו של הילד בתוך 3 חודשים");
            prompt.AppendLine();

            // נתוני הטיפולים לעיבוד
            prompt.AppendLine("== נתוני הטיפולים לעיבוד ==");
            prompt.AppendLine("השתמש בנתונים הבאים ליצירת הדוח:");
            prompt.AppendLine();

            foreach (var group in treatmentGroups.OrderBy(g => GetTreatmentTypeOrder(g.Key)))
            {
                prompt.AppendLine($"### טיפולים - {group.Key}");
                prompt.AppendLine($"מספר טיפולים: {group.Count()}");
                prompt.AppendLine();

                foreach (var treatment in group.OrderBy(t => t.TreatmentDate))
                {
                    prompt.AppendLine($"**תאריך:** {treatment.TreatmentDate:dd/MM/yyyy}");
                    prompt.AppendLine($"**מטפל:** {treatment.EmployeeName}");
                    prompt.AppendLine($"**תיאור:** {treatment.Description}");

                    if (treatment.CooperationLevel.HasValue)
                    {
                        prompt.AppendLine($"**רמת שיתוף פעולה:** {treatment.CooperationLevel}/5 ({GetCooperationDescription(treatment.CooperationLevel.Value)})");
                    }

                    if (!string.IsNullOrEmpty(treatment.Highlight))
                    {
                        prompt.AppendLine($"**נקודות חשובות:** {treatment.Highlight}");
                    }

                    prompt.AppendLine("---");
                }
                prompt.AppendLine();
            }

            // סטטיסטיקות
            prompt.AppendLine("== סטטיסטיקות ==");
            prompt.AppendLine($"סה\"כ טיפולים בתקופה: {treatments.Count}");

            if (treatments.Any(t => t.CooperationLevel.HasValue))
            {
                var avgCooperation = treatments.Where(t => t.CooperationLevel.HasValue)
                                            .Average(t => t.CooperationLevel.Value);
                prompt.AppendLine($"ממוצע שיתוף פעולה: {avgCooperation:F1}/5");
            }

            foreach (var group in treatmentGroups)
            {
                prompt.AppendLine($"• {group.Key}: {group.Count()} טיפולים");
            }
            prompt.AppendLine();

            // הוראות סיום
            prompt.AppendLine("== הוראות חשובות ==");
            prompt.AppendLine("• שמור על המבנה והכותרות בדיוק כפי שהוגדרו");
            prompt.AppendLine("• השתמש בעברית תקנית וברורה");
            prompt.AppendLine("• היה ספציפי ומבוסס נתונים");
            prompt.AppendLine("• הקפד על אורך מתאים לכל סעיף");
            prompt.AppendLine("• הימנע מהכללות או מידע שלא מופיע בנתונים");
            prompt.AppendLine("• אל תכפיל מידע או תחזור על אותו תוכן");
            prompt.AppendLine("• אל תוסיף פרטי דוח נוספים מעבר למה שכבר נכתב");
            prompt.AppendLine();

            prompt.AppendLine("צור את הדוח כעת בהתאם להוראות (ללא כפילויות!):");

            return prompt.ToString();
        }

        private int GetTreatmentTypeOrder(string treatmentType)
        {
            // סדר מועדף לתצוגה
            return treatmentType switch
            {
                "טיפול רגשי" => 1,
                "פיזיותרפיה" => 2,
                "ריפוי בעיסוק" => 3,
                "תזונה" => 4,
                "רפואי" => 5,
                _ => 6
            };
        }

        private string GetCooperationDescription(int level)
        {
            return level switch
            {
                1 => "שיתוף פעולה מינימלי",
                2 => "שיתוף פעולה חלקי",
                3 => "שיתוף פעולה בינוני",
                4 => "שיתוף פעולה טוב",
                5 => "שיתוף פעולה מצוין",
                _ => "לא הוגדר"
            };
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