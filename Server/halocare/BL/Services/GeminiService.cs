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

                if (!response.IsSuccessStatusCode)
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    throw new Exception($"שגיאה ב-Gemini API: {response.StatusCode} - {errorContent}");
                }

                string responseJson = await response.Content.ReadAsStringAsync();
                var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

                return geminiResponse?.candidates?.Length > 0
                       ? geminiResponse.candidates[0].content.parts[0].text
                       : "שגיאה ביצירת הדוח";
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בקריאה לשירות הבינה המלאכותית: {ex.Message}");
            }
        }

        private string BuildTashePrompt(List<TreatmentForTashe> treatments, string kidName, DateTime startDate, DateTime endDate)
        {
            StringBuilder prompt = new StringBuilder();

            prompt.AppendLine("אתה מומחה בטיפול התפתחותי לילדים עם צרכים מיוחדים.");
            prompt.AppendLine("עליך ליצור דוח תש\"ה (תוכנית שיקומית התפתחותית) מקצועי ומפורט.");
            prompt.AppendLine();
            prompt.AppendLine($"פרטי הילד: {kidName}");
            prompt.AppendLine($"תקופת הדוח: {startDate:dd/MM/yyyy} עד {endDate:dd/MM/yyyy}");
            prompt.AppendLine();
            prompt.AppendLine("הטיפולים שבוצעו בתקופה זו:");
            prompt.AppendLine();

            // קיבוץ טיפולים לפי סוג
            Dictionary<string, List<TreatmentForTashe>> groupedTreatments = new Dictionary<string, List<TreatmentForTashe>>();

            foreach (var treatment in treatments)
            {
                if (!groupedTreatments.ContainsKey(treatment.TreatmentTypeName))
                {
                    groupedTreatments[treatment.TreatmentTypeName] = new List<TreatmentForTashe>();
                }
                groupedTreatments[treatment.TreatmentTypeName].Add(treatment);
            }

            foreach (var group in groupedTreatments)
            {
                prompt.AppendLine($"=== {group.Key} ===");
                foreach (var treatment in group.Value)
                {
                    prompt.AppendLine($"תאריך: {treatment.TreatmentDate:dd/MM/yyyy}");
                    prompt.AppendLine($"מטפל: {treatment.EmployeeName} ({treatment.RoleName})");
                    prompt.AppendLine($"תיאור: {treatment.Description}");
                    if (treatment.CooperationLevel.HasValue)
                    {
                        prompt.AppendLine($"רמת שיתוף פעולה: {treatment.CooperationLevel}/5");
                    }
                    if (!string.IsNullOrEmpty(treatment.Highlight))
                    {
                        prompt.AppendLine($"נקודות חשובות: {treatment.Highlight}");
                    }
                    prompt.AppendLine("---");
                }
                prompt.AppendLine();
            }

            prompt.AppendLine("צור דוח תש\"ה מקצועי הכולל:");
            prompt.AppendLine("1. רקע כללי על הילד");
            prompt.AppendLine("2. מטרות הורים (על בסיס הטיפולים שביצענו)");
            prompt.AppendLine("3. מטרות טיפוליות מפורטות לפי תחומים:");
            prompt.AppendLine("   - לכל תחום טיפולי: נושא, המטרה, תאריך השגת המטרה, תיאור מצב נוכחי");
            prompt.AppendLine("   - שלב אחד לפני השגת המטרה");
            prompt.AppendLine("   - שלב אחד נוסף להתקדמות לאחר השגת המטרה");
            prompt.AppendLine("4. כרטיס משימות לכיתה עם הנחיות מעשיות");
            prompt.AppendLine();
            prompt.AppendLine("השתמש בעברית מקצועית ברמה גבוהה.");
            prompt.AppendLine("התבסס על הטיפולים הקיימים ויצור מטרות ריאליסטיות להמשך.");
            prompt.AppendLine("הדוח צריך להיות דומה בפורמט לדוחות תש\"ה סטנדרטיים במוסדות טיפוליים.");

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
