using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
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

            // מילון מונחים מיוחדים לתרגום
            _specialTerms = new Dictionary<string, Dictionary<string, string>>
            {
                // מעברית לערבית
                {"he-ar", new Dictionary<string, string>
                    {
                        {"תש\"ה", "خطة تنمية إعادة التأهيل"},
                        {"גן הילד", "روضة الطفل"},
                        {"טיפול רגשי", "علاج عاطفي"},
                        {"פיזיותרפיה", "العلاج الطبيعي"},
                        {"ריפוי בעיסוק", "العلاج المهني"},
                        {"קלינאית תקשורת", "معالجة النطق واللغة"}
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
                        {"קלינאית תקשורת", "Логопед"}
                    }
                },
                
                // מעברית לאמהרית
                {"he-am", new Dictionary<string, string>
                    {
                        {"תש\"ה", "የመልሶ ማቋቋም ልማት እቅድ"},
                        {"גן הילד", "የህጻናት መዋያ"},
                        {"טיפול רגשי", "የስሜት ሕክምና"},
                        {"פיזיותרפיה", "ፊዚዮቴራፒ"},
                        {"ריפוי בעיסוק", "ሙያዊ ሕክምና"},
                        {"קלינאית תקשורת", "የንግግር ሕክምና"}
                    }
                }
            };
        }

        public async Task<string> TranslateTextAsync(string text, string sourceLanguage, string targetLanguage)
        {
            // החלפת מונחים מיוחדים לפני התרגום
            string textToTranslate = text;
            string langPair = $"{sourceLanguage}-{targetLanguage}";

            if (_specialTerms.ContainsKey(langPair))
            {
                foreach (var term in _specialTerms[langPair])
                {
                    textToTranslate = textToTranslate.Replace(term.Key, $"___SPECIAL_TERM_{term.Key}___");
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
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json");

            // שליחת הבקשה
            HttpResponseMessage response = await _httpClient.PostAsync(url, content);

            if (response.IsSuccessStatusCode)
            {
                // קריאת התגובה
                string responseBody = await response.Content.ReadAsStringAsync();
                var translationResponse = JsonSerializer.Deserialize<TranslationResponse>(responseBody);

                if (translationResponse?.Data?.Translations != null && translationResponse.Data.Translations.Count > 0)
                {
                    string translatedText = translationResponse.Data.Translations[0].TranslatedText;

                    // החזרת המונחים המיוחדים
                    if (_specialTerms.ContainsKey(langPair))
                    {
                        foreach (var term in _specialTerms[langPair])
                        {
                            translatedText = translatedText.Replace($"___SPECIAL_TERM_{term.Key}___", term.Value);
                        }
                    }

                    return translatedText;
                }
            }

            throw new Exception($"שגיאה בתרגום: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
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