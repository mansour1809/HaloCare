using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace halocare.BL.Services
{
    public class TSHAService
    {
        private readonly TSHARepository _tshaRepository;
        private readonly KidRepository _kidRepository;
        private readonly TreatmentRepository _treatmentRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<TSHAService> _logger;
        private readonly HttpClient _httpClient;

        public TSHAService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
            _tshaRepository = new TSHARepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _treatmentRepository = new TreatmentRepository(configuration);
        }
        public List<TSHA> GetAllTSHAs()
        {
            return _tshaRepository.GetAllTSHAs();
        }

        public TSHA GetTSHAById(int id)
        {
            return _tshaRepository.GetTSHAById(id);
        }

        public List<TSHA> GetTSHAsByKidId(int kidId)
        {
            return _tshaRepository.GetTSHAsByKidId(kidId);
        }

        public int AddTSHA(TSHA tsha)
        {
            // וידוא שהילד קיים ופעיל
            Kid kid = _kidRepository.GetKidById(tsha.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }
            if (!kid.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור תש\"ה לילד שאינו פעיל");
            }

            // וידוא שהסטטוס תקין
            if (tsha.Status != "טיוטה" && tsha.Status != "פעיל" && tsha.Status != "הושלם")
            {
                throw new ArgumentException("סטטוס התש\"ה אינו תקין");
            }

            // הגדרת תאריך יצירת התש"ה
            if (tsha.CreationDate == DateTime.MinValue)
            {
                tsha.CreationDate = DateTime.Now;
            }

            return _tshaRepository.AddTSHA(tsha);
        }

        public bool UpdateTSHA(TSHA tsha)
        {
            // וידוא שהתש"ה קיים
            TSHA existingTSHA = _tshaRepository.GetTSHAById(tsha.TshaId);
            if (existingTSHA == null)
            {
                throw new ArgumentException("התש\"ה לא נמצא במערכת");
            }

            // וידוא שהסטטוס תקין
            if (tsha.Status != "טיוטה" && tsha.Status != "פעיל" && tsha.Status != "הושלם")
            {
                throw new ArgumentException("סטטוס התש\"ה אינו תקין");
            }

            return _tshaRepository.UpdateTSHA(tsha);
        }

        public async Task<TSHA> GenerateTSHAReportWithAIAsync(int kidId)
        {
            // וידוא שהילד קיים
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // קבלת הטיפולים של הילד
            List<Treatment> treatments = _treatmentRepository.GetTreatmentsByKidId(kidId);

            // איסוף נתונים על הילד
            var kidData = new StringBuilder();
            kidData.AppendLine($"שם הילד: {kid.FirstName} {kid.LastName}");
            kidData.AppendLine($"גיל: {CalculateAge(kid.BirthDate)} חודשים");

            // איסוף היסטוריית הטיפולים
            var treatmentHistory = new StringBuilder();
            treatmentHistory.AppendLine("היסטוריית טיפולים:");

            if (treatments.Count > 0)
            {
                // מיון הטיפולים לפי תאריך, מהחדש לישן
                treatments.Sort((a, b) => b.TreatmentDate.CompareTo(a.TreatmentDate));

                foreach (var treatment in treatments.GetRange(0, Math.Min(10, treatments.Count)))
                {
                    treatmentHistory.AppendLine($"- {treatment.TreatmentDate.ToShortDateString()}: {treatment.TreatmentType}");
                    treatmentHistory.AppendLine($"  {treatment.Description}");
                    if (!string.IsNullOrEmpty(treatment.Highlight))
                    {
                        treatmentHistory.AppendLine($"  נקודה חשובה: {treatment.Highlight}");
                    }
                }
            }
            else
            {
                treatmentHistory.AppendLine("אין היסטוריית טיפולים זמינה.");
            }

            // יצירת תש"ה בסיסי
            TSHA tsha = new TSHA
            {
                KidId = kidId,
                CreationDate = DateTime.Now,
                Period = $"{DateTime.Now.Month}/{DateTime.Now.Year}",
                Status = "טיוטה",
                Goals = ""
            };

            try
            {
                // שימוש ב-AI לניתוח התיקיה והמלצה על יעדים
                string aiPrompt = $"אתה מומחה בהתפתחות ילדים וטיפול בילדים בגיל הרך עם צרכים מיוחדים. " +
                                 $"תפקידך ליצור תוכנית שיקום התפתחותית (תש\"ה) לילד בהתבסס על המידע הבא:\n\n" +
                                 $"{kidData}\n\n{treatmentHistory}\n\n" +
                                 $"יש ליצור תוכנית שיקום התפתחותית הכוללת:\n" +
                                 $"1. סיכום קצר של מצב הילד הנוכחי\n" +
                                 $"2. 3-5 יעדים התפתחותיים מותאמים לגיל ולמצב\n" +
                                 $"3. המלצות ספציפיות לכל תחום (מוטורי, רגשי, קוגניטיבי, תקשורתי)\n" +
                                 $"כתוב את התשובה בעברית בלבד, בפורמט מובנה ובשפה מקצועית.";

                string aiGeneratedGoals = await GenerateContentWithAI(aiPrompt);
                tsha.Goals = aiGeneratedGoals;
            }
            catch (Exception ex)
            {
                _logger.LogError($"AI generation error: {ex.Message}");

                // אם יש תקלה עם ה-AI, ניצור תוכנית בסיסית
                var fallbackGoals = new StringBuilder();
                fallbackGoals.AppendLine("סיכום מצב נוכחי:");
                fallbackGoals.AppendLine("יש להשלים על ידי הצוות המקצועי.");
                fallbackGoals.AppendLine("\nיעדים לתקופה הקרובה:");

                if (treatments.Count > 0)
                {
                    // איסוף נקודות חשובות מהטיפולים האחרונים
                    fallbackGoals.AppendLine("בהתבסס על הטיפולים האחרונים:");
                    foreach (Treatment treatment in treatments.GetRange(0, Math.Min(5, treatments.Count)))
                    {
                        if (!string.IsNullOrEmpty(treatment.Highlight))
                        {
                            fallbackGoals.AppendLine($"- {treatment.Highlight}");
                        }
                    }
                }

                fallbackGoals.AppendLine("\nהמלצות לתחומי התפתחות:");
                fallbackGoals.AppendLine("- תחום מוטורי: [להשלמה]");
                fallbackGoals.AppendLine("- תחום רגשי: [להשלמה]");
                fallbackGoals.AppendLine("- תחום קוגניטיבי: [להשלמה]");
                fallbackGoals.AppendLine("- תחום תקשורתי: [להשלמה]");

                tsha.Goals = fallbackGoals.ToString();
            }

            return tsha;
        }

        private async Task<string> GenerateContentWithAI(string prompt)
        {
            try
            {
                // בדוגמה זו נשתמש בשירות OpenAI, אך ניתן להשתמש בכל שירות AI חיצוני
                // אנא החלף את הקוד הזה בהתאם לספק ה-AI שבחרת
                string apiKey = _configuration["OpenAI:ApiKey"];
                string apiUrl = "https://api.openai.com/v1/chat/completions";

                var requestBody = new
                {
                    model = "gpt-3.5-turbo",
                    messages = new[]
                    {
                        new { role = "system", content = "You are a child development expert specializing in children with special needs." },
                        new { role = "user", content = prompt }
                    },
                    temperature = 0.7,
                    max_tokens = 1000
                };

                var httpContent = new StringContent(
                    JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");

                _httpClient.DefaultRequestHeaders.Clear();
                _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

                var response = await _httpClient.PostAsync(apiUrl, httpContent);
                if (response.IsSuccessStatusCode)
                {
                    var jsonResponse = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<OpenAIResponse>(jsonResponse);
                    return result?.Choices?[0]?.Message?.Content ?? "לא התקבלה תשובה מה-AI.";
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"AI API error: {response.StatusCode}, Content: {errorContent}");
                    throw new Exception($"תקלה בפנייה לשירות ה-AI: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"AI generation exception: {ex.Message}");
                throw new Exception($"תקלה בהפקת תוכן עם AI: {ex.Message}");
            }
        }

        private int CalculateAge(DateTime birthDate)
        {
            DateTime now = DateTime.Today;
            int months = (now.Year - birthDate.Year) * 12 + now.Month - birthDate.Month;
            return months;
        }
    }

    // מחלקות עזר
    public class OpenAIResponse
    {
        public Choice[] Choices { get; set; }
    }

    public class Choice
    {
        public Message Message { get; set; }
    }

    public class Message
    {
        public string Content { get; set; }
    }
}
