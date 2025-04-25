//// AIWritingAssistantService.cs
//using System;
//using System.Net.Http;
//using System.Text;
//using System.Text.Json;
//using System.Threading.Tasks;
//using Microsoft.Extensions.Configuration;
//using halocare.DAL.Models;
//using halocare.DAL.Repositories;

//namespace halocare.BL.Services
//{
//    public class AIWritingAssistantService
//    {
//        private readonly HttpClient _httpClient;
//        private readonly string _openAiApiKey;
//        private readonly string _openAiModel;
//        private readonly TreatmentTypeRepository _treatmentTypeRepository;

//        public AIWritingAssistantService(IConfiguration configuration)
//        {
//            _httpClient = new HttpClient();
//            _openAiApiKey = configuration["OpenAI:ApiKey"];
//            _openAiModel = configuration["OpenAI:Model"];
//            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_openAiApiKey}");
//            _treatmentTypeRepository = new TreatmentTypeRepository(configuration);
//        }

//        // קבלת הצעות להשלמת טקסט בזמן אמת
//        public async Task<string> GetCompletionSuggestions(string currentText, int treatmentTypeId)
//        {
//            // קבלת מידע על סוג הטיפול
//            TreatmentType treatmentType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId); 
//            if (treatmentType == null)
//            {
//                throw new ArgumentException("סוג טיפול לא קיים");
//            }

//            // בניית פרומפט מותאם לסוג הטיפול
//            string prompt = BuildCompletionPrompt(currentText, treatmentType.TreatmentTypeName);

//            // בניית בקשה ל-OpenAI API
//            var requestBody = new
//            {
//                model = _openAiModel,
//                messages = new[]
//                {
//                    new { role = "system", content = prompt },
//                    new { role = "user", content = currentText }
//                },
//                temperature = 0.3,
//                max_tokens = 100
//            };

//            // שליחת הבקשה לשירות
//            return await SendRequestToOpenAI(requestBody);
//        }

//        // שיפור ניסוח טקסט מקצועי
//        public async Task<string> ImproveProfessionalWriting(string text, int treatmentTypeId)
//        {
//            // קבלת מידע על סוג הטיפול
//            var treatmentType = _treatmentTypeRepository.GetTreatmentTypeById(treatmentTypeId);
//            if (treatmentType == null)
//            {
//                throw new ArgumentException("סוג טיפול לא קיים");
//            }

//            // בניית פרומפט לשיפור ניסוח מקצועי
//            string prompt = BuildImprovementPrompt(treatmentType.TreatmentTypeName);

//            // בניית בקשה ל-OpenAI API
//            var requestBody = new
//            {
//                model = _openAiModel,
//                messages = new[]
//                {
//                    new { role = "system", content = prompt },
//                    new { role = "user", content = text }
//                },
//                temperature = 0.3,
//                max_tokens = 800
//            };

//            // שליחת הבקשה לשירות
//            return await SendRequestToOpenAI(requestBody);
//        }

//        // בניית פרומפט להשלמת טקסט
//        private string BuildCompletionPrompt(string currentText, string treatmentTypeName)
//        {
//            StringBuilder promptBuilder = new StringBuilder();

//            promptBuilder.AppendLine("אתה עוזר מקצועי למטפלים בכתיבת סיכומי טיפול לילדים בגיל הרך עם צרכים מיוחדים.");

//            switch (treatmentTypeName.ToLower())
//            {
//                case "פיזיותרפיה":
//                    promptBuilder.AppendLine("התמחותך היא בניסוח מקצועי בתחום הפיזיותרפיה לילדים.");
//                    promptBuilder.AppendLine("השתמש במונחים כמו: תנועתיות, טונוס שרירים, יציבות, קואורדינציה, יכולות מוטוריות, תכנון תנועתי.");
//                    break;
//                case "ריפוי בעיסוק":
//                    promptBuilder.AppendLine("התמחותך היא בניסוח מקצועי בתחום ריפוי בעיסוק לילדים.");
//                    promptBuilder.AppendLine("השתמש במונחים כמו: מוטוריקה עדינה, תפקוד יומיומי, אינטגרציה סנסורית, דפוסי משחק, השתתפות, מיומנויות ניהוליות.");
//                    break;
//                case "טיפול רגשי":
//                    promptBuilder.AppendLine("התמחותך היא בניסוח מקצועי בתחום הטיפול הרגשי לילדים.");
//                    promptBuilder.AppendLine("השתמש במונחים כמו: ויסות רגשי, יחסים בינאישיים, ביטוי רגשי, תקשורת, שיתוף פעולה, יוזמה.");
//                    break;
//                case "קלינאות תקשורת":
//                    promptBuilder.AppendLine("התמחותך היא בניסוח מקצועי בתחום קלינאות תקשורת לילדים.");
//                    promptBuilder.AppendLine("השתמש במונחים כמו: הבנת שפה, הבעה מילולית, תקשורת לא מילולית, אוצר מילים, מודעות פונולוגית, מבנה משפט.");
//                    break;
//                default:
//                    promptBuilder.AppendLine("התמחותך היא בניסוח מקצועי בתחום הטיפולי לילדים.");
//                    break;
//            }

//            promptBuilder.AppendLine("עליך להציע השלמה מקצועית ורלוונטית למשפט שהמטפל מקליד.");
//            promptBuilder.AppendLine("ההשלמה צריכה להיות קצרה (עד 100 תווים), בעברית, ובהתאם להקשר הטקסט.");

//            return promptBuilder.ToString();
//        }

//        // בניית פרומפט לשיפור ניסוח
//        private string BuildImprovementPrompt(string treatmentTypeName)
//        {
//            StringBuilder promptBuilder = new StringBuilder();

//            promptBuilder.AppendLine("אתה עורך מקצועי המתמחה בשיפור ניסוח סיכומי טיפול בילדים עם צרכים מיוחדים.");

//            switch (treatmentTypeName.ToLower())
//            {
//                case "פיזיותרפיה":
//                    promptBuilder.AppendLine("התמחותך היא בעריכת סיכומי פיזיותרפיה לילדים.");
//                    promptBuilder.AppendLine("דאג לכלול התייחסות ל: יכולות מוטוריות, טונוס שרירים, תפקוד יציבתי, תבניות תנועה והתפתחות מוטורית.");
//                    break;
//                case "ריפוי בעיסוק":
//                    promptBuilder.AppendLine("התמחותך היא בעריכת סיכומי ריפוי בעיסוק לילדים.");
//                    promptBuilder.AppendLine("דאג לכלול התייחסות ל: מוטוריקה עדינה, תפקוד סנסורי, השתתפות בפעילויות יומיום, משחק ואינטראקציה.");
//                    break;
//                case "טיפול רגשי":
//                    promptBuilder.AppendLine("התמחותך היא בעריכת סיכומי טיפול רגשי לילדים.");
//                    promptBuilder.AppendLine("דאג לכלול התייחסות ל: התפתחות רגשית, ויסות עצמי, יחסים חברתיים, ביטוי רגשי והתמודדות.");
//                    break;
//                case "קלינאות תקשורת":
//                    promptBuilder.AppendLine("התמחותך היא בעריכת סיכומי קלינאות תקשורת לילדים.");
//                    promptBuilder.AppendLine("דאג לכלול התייחסות ל: התפתחות שפתית, יכולות תקשורתיות, הבנה והבעה, אוצר מילים ומיומנויות שיח.");
//                    break;
//                default:
//                    promptBuilder.AppendLine("התמחותך היא בעריכת סיכומי טיפול לילדים.");
//                    break;
//            }

//            promptBuilder.AppendLine("עליך לשפר את הניסוח המקצועי של הטקסט, אך לשמור על המידע והתוכן המקורי.");
//            promptBuilder.AppendLine("הקפד על מבנה מסודר, שימוש במינוח מקצועי, דיוק בתיאורים והימנעות מחזרות מיותרות.");
//            promptBuilder.AppendLine("אל תוסיף מידע או הערכות שלא הופיעו בטקסט המקורי, אבל שפר את אופן הניסוח.");

//            return promptBuilder.ToString();
//        }

//        // שליחת בקשה ל-OpenAI API
//        private async Task<string> SendRequestToOpenAI(object requestBody)
//        {
//            var content = new StringContent(
//                JsonSerializer.Serialize(requestBody),
//                Encoding.UTF8,
//                "application/json");

//            var response = await _httpClient.PostAsync("https://api.openai.com/v1/chat/completions", content);

//            if (!response.IsSuccessStatusCode)
//            {
//                var errorContent = await response.Content.ReadAsStringAsync();
//                throw new Exception($"OpenAI API error: {response.StatusCode}, {errorContent}");
//            }

//            var responseString = await response.Content.ReadAsStringAsync();
//            using (JsonDocument document = JsonDocument.Parse(responseString))
//            {
//                return document.RootElement
//                    .GetProperty("choices")[0]
//                    .GetProperty("message")
//                    .GetProperty("content")
//                    .GetString();
//            }
//        }
//    }
//}