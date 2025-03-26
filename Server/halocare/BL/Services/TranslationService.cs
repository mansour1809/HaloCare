using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class TranslationService
    {
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private readonly Dictionary<string, Dictionary<string, string>> _specialTerms;

        public TranslationService(IConfiguration configuration)
        {
            _configuration = configuration;
            _httpClient = new HttpClient();
            _apiKey = _configuration.GetValue<string>("GoogleTranslateApiKey");

            // מילון מונחים מיוחדים לתרגום - מורחב עם מושגים מתחום הטיפול בילדים
            _specialTerms = new Dictionary<string, Dictionary<string, string>>
        {
            // מעברית לערבית
            {"he-ar", new Dictionary<string, string>
                {
                    {"תש\"ה", "خطة تنمية إعادة التأهيل"},
                    {"גן הילד", "روضة الطفل"},
                    {"טיפול רגשי", "العلاج العاطفي"},
                    {"פיזיותרפיה", "العلاج الطبيعي"},
                    {"ריפוי בעיסוק", "العلاج المهني"},
                    {"קלינאית תקשורת", "معالج النطق واللغة"},
                    {"טיפול התפתחותי", "العلاج التنموي"},
                    {"פגישת אינטייק", "لقاء استقبال أولي"},
                    {"מעקב נוכחות", "تتبع الحضور"},
                    {"דוח טיפול", "تقرير العلاج"},
                    {"ביקור בית", "زيارة منزلية"}
                }
            },
            
            // מעברית לרוסית
            {"he-ru", new Dictionary<string, string>
                {
                    {"תש\"ה", "План реабилитационного развития"},
                    {"גן הילד", "Детский сад"},
                    {"טיפול רגשי", "Эмоциональная терапия"},
                    {"פיזיותרפיה", "Физиотерапия"},
                    {"ריפוי בעיסוק", "Трудотерапия"},
                    {"קלינאית תקשורת", "Логопед"},
                    {"טיפול התפתחותי", "Терапия развития"},
                    {"פגישת אינטייק", "Первичная встреча"},
                    {"מעקב נוכחות", "Учет посещаемости"},
                    {"דוח טיפול", "Отчет о лечении"},
                    {"ביקור בית", "Домашний визит"}
                }
            },
            
            // מעברית לאמהרית
            {"he-am", new Dictionary<string, string>
                {
                    {"תש\"ה", "የመልሶ ማቋቋም ልማት እቅድ"},
                    {"גן הילד", "የህጻናት መዋያ"},
                    {"טיפול רגשי", "የስሜት ሕክምና"},
                    {"פיזיותרפיה", "ፊዚዮቴራፒ"},
                    {"ריפוי בעיסוק", "የሙያ ሕክምና"},
                    {"קלינאית תקשורת", "የንግግር ሕክምና"},
                    {"טיפול התפתחותי", "የእድገት ሕክምና"},
                    {"פגישת אינטייק", "የመጀመሪያ ግንኙነት"},
                    {"מעקב נוכחות", "የመገኘት መቆጣጠሪያ"},
                    {"דוח טיפול", "የህክምና ሪፖርት"},
                    {"ביקור בית", "የቤት ጉብኝት"}
                }
            }
        };
        }

        public async Task<string> TranslateTextAsync(string text, string sourceLanguage, string targetLanguage)
        {
            try
            {
                // החלפת מונחים מיוחדים לפני התרגום
                string textToTranslate = text;
                string langPair = $"{sourceLanguage}-{targetLanguage}";
                Dictionary<string, string> specialTermReplacements = new Dictionary<string, string>();

                if (_specialTerms.ContainsKey(langPair))
                {
                    int i = 0;
                    foreach (var term in _specialTerms[langPair])
                    {
                        string placeholder = $"___SPECIAL_TERM_{i}___";
                        textToTranslate = textToTranslate.Replace(term.Key, placeholder);
                        specialTermReplacements[placeholder] = term.Value;
                        i++;
                    }
                }

                // בניית הבקשה ל-Google Cloud Translation API
                string url = $"https://translation.googleapis.com/language/translate/v2?key={_apiKey}";

                var requestBody = new
                {
                    q = textToTranslate,
                    source = sourceLanguage,
                    target = targetLanguage,
                    format = "text"
                };

                var content = new StringContent(
                    System.Text.Json.JsonSerializer.Serialize(requestBody),
                    Encoding.UTF8,
                    "application/json");

                // שליחת הבקשה
                HttpResponseMessage response = await _httpClient.PostAsync(url, content);

                if (response.IsSuccessStatusCode)
                {
                    // קריאת התגובה
                    string responseBody = await response.Content.ReadAsStringAsync();
                    var translationResponse = System.Text.Json.JsonSerializer.Deserialize<TranslationResponse>(responseBody);

                    if (translationResponse?.Data?.Translations != null && translationResponse.Data.Translations.Count > 0)
                    {
                        string translatedText = translationResponse.Data.Translations[0].TranslatedText;

                        // החזרת המונחים המיוחדים
                        foreach (var replacement in specialTermReplacements)
                        {
                            translatedText = translatedText.Replace(replacement.Key, replacement.Value);
                        }

                        return translatedText;
                    }
                }

                throw new Exception($"שגיאה בתרגום: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בתרגום: {ex.Message}");
            }
        }

        public async Task<string> DetectLanguageAsync(string text)
        {
            // בניית הבקשה ל-Google Cloud Translation API לזיהוי שפה
            string url = $"https://translation.googleapis.com/language/translate/v2/detect?key={_apiKey}";

            var requestBody = new
            {
                q = text
            };

            var content = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            // שליחת הבקשה
            HttpResponseMessage response = await _httpClient.PostAsync(url, content);

            if (response.IsSuccessStatusCode)
            {
                // קריאת התגובה
                string responseBody = await response.Content.ReadAsStringAsync();
                var detectionResponse = JsonSerializer.Deserialize<DetectionResponse>(responseBody);

                if (detectionResponse?.Data?.Detections != null &&
                    detectionResponse.Data.Detections.Count > 0 &&
                    detectionResponse.Data.Detections[0].Count > 0)
                {
                    return detectionResponse.Data.Detections[0][0].Language;
                }
            }

            throw new Exception($"שגיאה בזיהוי שפה: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
        }
    }

    // מחלקות עזר לפענוח תשובת ה-API
    public class TranslationResponse
    {
        public TranslationData Data { get; set; }
    }

    public class TranslationData
    {
        public List<Translation> Translations { get; set; }
    }

    public class Translation
    {
        public string TranslatedText { get; set; }
    }

    public class DetectionResponse
    {
        public DetectionData Data { get; set; }
    }

    public class DetectionData
    {
        public List<List<Detection>> Detections { get; set; }
    }

    public class Detection
    {
        public string Language { get; set; }
        public bool IsReliable { get; set; }
        public float Confidence { get; set; }
    }
}