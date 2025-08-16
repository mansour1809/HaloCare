using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using System.Linq;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;
using halocare.Controllers;

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
        public async Task<List<QuestionTranslationDto>> TranslateFormAsync(
    List<QuestionTranslationDto> questions,
    string targetLanguage,
    string sourceLanguage = "he")
        {
            try
            {
                Console.WriteLine($"=== התחלת תרגום ===");
                Console.WriteLine($"שפת מקור: {sourceLanguage}, שפת יעד: {targetLanguage}");
                Console.WriteLine($"מספר שאלות: {questions.Count}");

                // אם השפות זהות - מחזירים כמו שזה
                if (sourceLanguage == targetLanguage)
                {
                    Console.WriteLine("שפת מקור ויעד זהות - מחזירים ללא תרגום");
                    return questions;
                }

                // בניית הפרומפט לתרגום
                var prompt = BuildTranslationPrompt(questions, targetLanguage, sourceLanguage);
                Console.WriteLine($"Prompt length: {prompt.Length}");
                Console.WriteLine($"First 500 chars of prompt: {prompt.Substring(0, Math.Min(500, prompt.Length))}");

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
                        temperature = 0.1,
                        topK = 1,
                        topP = 0.95,
                        maxOutputTokens = 4096,
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

                Console.WriteLine($"שולח בקשה ל-Gemini API...");

                // שליחת הבקשה
                var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                Console.WriteLine($"Status Code: {response.StatusCode}");

                if (response.IsSuccessStatusCode)
                {
                    string responseJson = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Response length: {responseJson.Length}");

                    var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

                    if (geminiResponse?.candidates?.Length > 0)
                    {
                        string translatedJson = geminiResponse.candidates[0].content.parts[0].text;
                        Console.WriteLine($"Translated JSON (first 500 chars): {translatedJson.Substring(0, Math.Min(500, translatedJson.Length))}");

                        // נסיון לנקות את ה-JSON אם יש טקסט נוסף
                        translatedJson = CleanJsonResponse(translatedJson);

                        var translated = JsonSerializer.Deserialize<List<QuestionTranslationDto>>(translatedJson);
                        Console.WriteLine($"תורגמו בהצלחה {translated.Count} שאלות");

                        return translated;
                    }
                    else
                    {
                        Console.WriteLine("אין candidates בתשובה מ-Gemini");
                    }
                }
                else
                {
                    string errorContent = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Error from Gemini: {errorContent}");
                }

                throw new Exception($"שגיאה בתרגום הטופס - Status: {response.StatusCode}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Translation error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                // במקרה של שגיאה, מחזירים את השאלות המקוריות
                return questions;
            }
        }

        public async Task<List<AnswerTranslationDto>> TranslateAnswersAsync(
     List<AnswerTranslationDto> answers,
     string sourceLanguage,
     string targetLanguage = "he")
        {
            try
            {
                Console.WriteLine($"=== תרגום תשובות ===");
                Console.WriteLine($"מ-{sourceLanguage} ל-{targetLanguage}");

                if (sourceLanguage == targetLanguage)
                {
                    return answers;
                }

                // מילון תרגומים קבועים - לא צריך Gemini
                var fixedTranslations = GetFixedTranslations(sourceLanguage, targetLanguage);

                // הפרדה בין תשובות שצריך לתרגם לאלו שלא
                var answersToTranslate = new List<AnswerTranslationDto>();
                var translatedAnswers = new List<AnswerTranslationDto>();

                foreach (var answer in answers)
                {
                    // בדיקה אם זו תשובה קבועה
                    if (fixedTranslations.ContainsKey(answer.Answer))
                    {
                        Console.WriteLine($"תרגום קבוע: '{answer.Answer}' → '{fixedTranslations[answer.Answer]}'");
                        translatedAnswers.Add(new AnswerTranslationDto
                        {
                            QuestionNo = answer.QuestionNo,
                            Answer = fixedTranslations[answer.Answer],
                            Other = answer.Other
                        });
                    }
                    // בדיקה אם זו חתימה דיגיטלית
                    else if (answer.Answer.StartsWith("data:image/"))
                    {
                        Console.WriteLine($"חתימה דיגיטלית - לא מתרגמים");
                        translatedAnswers.Add(answer);
                    }
                    // בדיקה אם זה מספר או תאריך
                    else if (IsNumericOrDate(answer.Answer))
                    {
                        Console.WriteLine($"מספר/תאריך - לא מתרגמים: {answer.Answer}");
                        translatedAnswers.Add(answer);
                    }
                    else
                    {
                        // צריך תרגום עם Gemini
                        answersToTranslate.Add(answer);
                    }
                }

                // אם יש תשובות שצריך לתרגם עם Gemini
                if (answersToTranslate.Count > 0)
                {
                    Console.WriteLine($"שולח {answersToTranslate.Count} תשובות ל-Gemini");

                    var prompt = BuildAnswerTranslationPrompt(answersToTranslate, sourceLanguage, targetLanguage);

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
                            temperature = 0.1,
                            topK = 1,
                            topP = 0.95,
                            maxOutputTokens = 4096,
                        }
                    };

                    string json = JsonSerializer.Serialize(requestBody);
                    var content = new StringContent(json, Encoding.UTF8, "application/json");

                    var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                    if (response.IsSuccessStatusCode)
                    {
                        string responseJson = await response.Content.ReadAsStringAsync();
                        var geminiResponse = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

                        if (geminiResponse?.candidates?.Length > 0)
                        {
                            string translatedJson = geminiResponse.candidates[0].content.parts[0].text;
                            translatedJson = CleanJsonResponse(translatedJson);

                            try
                            {
                                var geminiTranslated = JsonSerializer.Deserialize<List<AnswerTranslationDto>>(translatedJson);
                                translatedAnswers.AddRange(geminiTranslated);
                            }
                            catch (JsonException)
                            {
                                Console.WriteLine("שגיאה בפענוח JSON - מחזירים ללא תרגום");
                                translatedAnswers.AddRange(answersToTranslate);
                            }
                        }
                    }
                    else
                    {
                        Console.WriteLine("Gemini נכשל - מחזירים ללא תרגום");
                        translatedAnswers.AddRange(answersToTranslate);
                    }
                }

                // מיון לפי מספר שאלה
                return translatedAnswers.OrderBy(a => a.QuestionNo).ToList();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error: {ex.Message}");
                return answers;
            }
        }

        private Dictionary<string, string> GetFixedTranslations(string sourceLang, string targetLang)
        {
            var translations = new Dictionary<string, Dictionary<string, string>>
            {
                ["ar_he"] = new Dictionary<string, string>
                {
                    ["نعم"] = "כן",
                    ["لا"] = "לא",
                    ["أوافق"] = "מאשר/ת",
                    ["أوافق/أوافق"] = "מאשר/ת",
                    ["لا أوافق"] = "לא מאשר/ת"
                },
                ["en_he"] = new Dictionary<string, string>
                {
                    ["Yes"] = "כן",
                    ["No"] = "לא",
                    ["Authorize"] = "מאשר/ת",
                    ["I authorize"] = "מאשר/ת",
                    ["Do not authorize"] = "לא מאשר/ת",
                    ["I do not authorize"] = "לא מאשר/ת"
                },
                ["ru_he"] = new Dictionary<string, string>
                {
                    ["Да"] = "כן",
                    ["Нет"] = "לא",
                    ["Разрешаю"] = "מאשר/ת",
                    ["Разрешаю/ю"] = "מאשר/ת",
                    ["Не разрешаю"] = "לא מאשר/ת",
                    ["Не разрешаю/ю"] = "לא מאשר/ת"
                }
            };

            var key = $"{sourceLang}_{targetLang}";
            return translations.ContainsKey(key) ? translations[key] : new Dictionary<string, string>();
        }

        private bool IsNumericOrDate(string value)
        {
            if (string.IsNullOrWhiteSpace(value)) return false;

            // בדיקה אם זה מספר
            if (double.TryParse(value, out _)) return true;

            // בדיקה אם זה תאריך
            if (DateTime.TryParse(value, out _)) return true;

            // בדיקה אם זה נראה כמו תאריך בפורמטים נפוצים
            var datePatterns = new[] { @"\d{1,2}/\d{1,2}/\d{4}", @"\d{1,2}-\d{1,2}-\d{4}" };
            foreach (var pattern in datePatterns)
            {
                if (System.Text.RegularExpressions.Regex.IsMatch(value, pattern))
                    return true;
            }

            return false;
        }

        private string GetLanguageName(string code)
        {
            return code switch
            {
                "he" => "Hebrew",
                "ar" => "Arabic",
                "en" => "English",
                "ru" => "Russian",
                "am" => "Amharic",
                "fr" => "French",
                "es" => "Spanish",
                _ => code
            };
        }
        private string BuildTranslationPrompt(List<QuestionTranslationDto> questions, string targetLanguage, string sourceLanguage)
        {
            var languageNames = new Dictionary<string, string>
            {
                ["he"] = "Hebrew",
                ["ar"] = "Arabic",
                ["ru"] = "Russian",
                ["en"] = "English",
                ["am"] = "Amharic",
                ["fr"] = "French",
                ["es"] = "Spanish"
            };

            var prompt = new StringBuilder();

            // הוראות ברורות וחד משמעיות
            prompt.AppendLine("You are a professional translator for a daycare center's parent forms.");
            prompt.AppendLine($"Translate these daycare/childcare form questions from {languageNames[sourceLanguage]} to {languageNames[targetLanguage]}.");
            prompt.AppendLine();
            prompt.AppendLine("CONTEXT: These are questions from forms about:");
            prompt.AppendLine("- Child development and health");
            prompt.AppendLine("- Pregnancy and birth history");
            prompt.AppendLine("- Family background");
            prompt.AppendLine("- Child behavior and habits");
            prompt.AppendLine("- Medical history");
            prompt.AppendLine();
            prompt.AppendLine("CRITICAL TRANSLATION RULES:");
            prompt.AppendLine("1. Translate ACCURATELY - maintain the exact medical/developmental meaning");
            prompt.AppendLine("2. For 'possibleValues' field: translate each comma-separated option");
            prompt.AppendLine("3. Keep numbers, 'questionNo' and 'questionType' UNCHANGED");
            prompt.AppendLine("4. Return ONLY a valid JSON array, no additional text");
            prompt.AppendLine("5. Common Hebrew terms in this context:");
            prompt.AppendLine("   - היריון = pregnancy");
            prompt.AppendLine("   - לידה = birth/delivery");
            prompt.AppendLine("   - התפתחות = development");
            prompt.AppendLine("   - רצוי = desired/wanted");
            prompt.AppendLine("   - מתוכנן = planned");
            prompt.AppendLine("   - כן = yes");
            prompt.AppendLine("   - לא = no");
            prompt.AppendLine();

            // דוגמאות ספציפיות
            if (targetLanguage == "en")
            {
                prompt.AppendLine("Translation examples:");
                prompt.AppendLine("'האם ההיריון היה מתוכנן?' -> 'Was the pregnancy planned?'");
                prompt.AppendLine("'האם ההיריון היה רצוי?' -> 'Was the pregnancy wanted/desired?'");
                prompt.AppendLine("'מהלך ההיריון' -> 'Course of pregnancy' or 'Pregnancy progression'");
                prompt.AppendLine("'כן,לא' -> 'Yes,No'");
            }
            else if (targetLanguage == "ar")
            {
                prompt.AppendLine("Translation examples:");
                prompt.AppendLine("'האם ההיריון היה מתוכנן?' -> 'هل كان الحمل مخططًا؟'");
                prompt.AppendLine("'האם ההיריון היה רצוי?' -> 'هل كان الحمل مرغوبًا؟'");
                prompt.AppendLine("'מהלך ההיריון' -> 'سير الحمل'");
                prompt.AppendLine("'כן,לא' -> 'نعم,لا'");
            }
            else if (targetLanguage == "ru")
            {
                prompt.AppendLine("Translation examples:");
                prompt.AppendLine("'האם ההיריון היה מתוכנן?' -> 'Была ли беременность запланированной?'");
                prompt.AppendLine("'האם ההיריון היה רצוי?' -> 'Была ли беременность желанной?'");
                prompt.AppendLine("'מהלך ההיריון' -> 'Течение беременности'");
                prompt.AppendLine("'כן,לא' -> 'Да,Нет'");
            }

            prompt.AppendLine();
            prompt.AppendLine("JSON to translate:");
            prompt.AppendLine(JsonSerializer.Serialize(questions, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            }));

            prompt.AppendLine();
            prompt.AppendLine("Remember: Return ONLY the translated JSON array, nothing else!");

            return prompt.ToString();
        }
        private string BuildAnswerTranslationPrompt(List<AnswerTranslationDto> answers, string sourceLanguage, string targetLanguage)
        {
            var languageNames = new Dictionary<string, string>
            {
                ["he"] = "Hebrew",
                ["ar"] = "Arabic",
                ["ru"] = "Russian",
                ["en"] = "English",
                ["am"] = "Amharic"
            };

            var prompt = new StringBuilder();
            prompt.AppendLine($"Translate parent form answers from {languageNames[sourceLanguage]} to {languageNames[targetLanguage]}.");
            prompt.AppendLine();
            prompt.AppendLine("IMPORTANT:");
            prompt.AppendLine("1. Translate the 'answer' and 'other' fields");
            prompt.AppendLine("2. Keep 'questionNo' unchanged");
            prompt.AppendLine("3. If answer contains base64 image data (starts with 'data:image'), keep it unchanged");
            prompt.AppendLine("4. Return ONLY valid JSON array");
            prompt.AppendLine();
            prompt.AppendLine("JSON to translate:");
            prompt.AppendLine(JsonSerializer.Serialize(answers, new JsonSerializerOptions
            {
                WriteIndented = true,
                Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
            }));

            return prompt.ToString();
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
        private string CleanJsonResponse(string response)
        {
            if (string.IsNullOrWhiteSpace(response))
            {
                Console.WriteLine("Response is empty");
                return "[]";
            }

            Console.WriteLine($"Raw response (first 200 chars): {response.Substring(0, Math.Min(200, response.Length))}");

            // הסרת markdown code blocks
            if (response.Contains("```json"))
            {
                response = response.Replace("```json", "").Replace("```", "");
            }

            // הסרת backticks בודדים
            response = response.Replace("`", "");

            // חיפוש תחילת וסוף ה-JSON
            int startIndex = response.IndexOf('[');
            int endIndex = response.LastIndexOf(']');

            if (startIndex == -1)
            {
                // אם אין מערך, נחפש אובייקט
                startIndex = response.IndexOf('{');
                endIndex = response.LastIndexOf('}');
            }

            if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
            {
                string jsonPart = response.Substring(startIndex, endIndex - startIndex + 1);
                Console.WriteLine($"Extracted JSON (first 200 chars): {jsonPart.Substring(0, Math.Min(200, jsonPart.Length))}");
                return jsonPart.Trim();
            }

            // ניסיון אחרון - ניקוי כללי
            response = response.Trim();

            // הסרת תווים לא חוקיים מההתחלה
            while (response.Length > 0 && !response.StartsWith("[") && !response.StartsWith("{"))
            {
                response = response.Substring(1);
            }

            // הסרת תווים לא חוקיים מהסוף
            while (response.Length > 0 && !response.EndsWith("]") && !response.EndsWith("}"))
            {
                response = response.Substring(0, response.Length - 1);
            }

            Console.WriteLine($"Final cleaned JSON (first 200 chars): {response.Substring(0, Math.Min(200, response.Length))}");

            return response;
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