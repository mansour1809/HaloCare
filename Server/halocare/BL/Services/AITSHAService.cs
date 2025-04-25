//// BL/Services/AITSHAService.cs
//using System;
//using System.Collections.Generic;
//using System.Threading.Tasks;
//using System.Text;
//using System.Text.Json;
//using Google.Cloud.Language.V1;
//using Google.Protobuf.Collections;
//using halocare.DAL.Models;
//using halocare.DAL.Repositories;
//using Microsoft.Extensions.Configuration;
//using System.Reflection.Metadata;

//namespace halocare.BL.Services
//{
//    public class AITSHAService
//    {
//        private readonly TreatmentRepository _treatmentRepository;
//        private readonly TSHARepository _tshaRepository;
//        private readonly KidRepository _kidRepository;
//        private readonly EmployeeRepository _employeeRepository;
//        private readonly IConfiguration _configuration;
//        private readonly TreatmentInsightService _insightService;
//        private readonly TSHALearningService _learningService;

//        public AITSHAService(IConfiguration configuration)
//        {
//            _configuration = configuration;
//            _treatmentRepository = new TreatmentRepository(configuration);
//            _tshaRepository = new TSHARepository(configuration);
//            _kidRepository = new KidRepository(configuration);
//            _employeeRepository = new EmployeeRepository(configuration);
//            _insightService = new TreatmentInsightService(configuration);
//            _learningService = new TSHALearningService(configuration);
//        }

//        public async Task<TSHA> GenerateTSHA(int kidId, DateTime startDate, DateTime endDate)
//        {
//            // 1. אחזור כל הטיפולים של הילד בתקופה הרלוונטית
//            var treatments = _treatmentRepository.GetTreatmentsByKidIdAndDateRange(kidId, startDate, endDate);

//            if (treatments.Count == 0)
//            {
//                throw new ArgumentException("לא נמצאו טיפולים לילד בתקופה המבוקשת");
//            }

//            // 2. ניתוח התובנות מהטיפולים
//            var insights = await _insightService.AnalyzeTreatments(treatments);

//            // 3. יצירת מבנה תש"ה ראשוני
//            var tshaContent = BuildInitialTSHAContent(kidId, treatments, insights);

//            // 4. שיפור המטרות באמצעות מערכת הלמידה
//            Dictionary<string, List<string>> improvedGoals = new Dictionary<string, List<string>>();

//            foreach (var area in tshaContent.Goals.Keys)
//            {
//                improvedGoals[area] = await _learningService.ImproveGoals(
//                    tshaContent.Goals[area],
//                    kidId,
//                    area
//                );
//            }

//            tshaContent.Goals = improvedGoals;

//            // 5. שמירת התש"ה במסד הנתונים
//            TSHA newTSHA = new TSHA
//            {
//                KidId = kidId,
//                CreationDate = DateTime.Now,
//                Period = $"{startDate.ToString("MM/yyyy")} - {endDate.ToString("MM/yyyy")}",
//                Goals = JsonSerializer.Serialize(improvedGoals),
//                CurrentStatus = JsonSerializer.Serialize(tshaContent.CurrentStatus),
//                ParentGoals = "",  // ניתן להוסיף מנגנון לשילוב מטרות הורים
//                Content = JsonSerializer.Serialize(tshaContent),
//                Status = "טיוטה"
//            };

//            int tshaId = _tshaRepository.AddTSHA(newTSHA);
//            newTSHA.Id = tshaId;

//            return newTSHA;
//        }
//        private Dictionary<string, List<Treatment>> GroupTreatmentsByType(List<Treatment> treatments)
//        {
//            Dictionary<string, List<Treatment>> groups = new Dictionary<string, List<Treatment>>();

//            foreach (var treatment in treatments)
//            {
//                string treatmentType = GetTreatmentTypeName(treatment.TreatmentTypeId);

//                if (!groups.ContainsKey(treatmentType))
//                {
//                    groups[treatmentType] = new List<Treatment>();
//                }

//                groups[treatmentType].Add(treatment);
//            }

//            return groups;
//        }

//        private string GetTreatmentTypeName(int typeId)
//        {
//            // במציאות יש לאחזר את השם מטבלת סוגי טיפולים
//            // זו רק דוגמה פשוטה
//            switch (typeId)
//            {
//                case 1: return "פיזיותרפיה";
//                case 2: return "ריפוי בעיסוק";
//                case 3: return "טיפול רגשי";
//                case 4: return "גננת";
//                case 5: return "טיפול במוזיקה";
//                default: return "אחר";
//            }
//        }

//        private string PrepareTextForAnalysis(Kid kid, Dictionary<string, List<Treatment>> treatmentsByType)
//        {
//            StringBuilder sb = new StringBuilder();

//            // מידע על הילד
//            sb.AppendLine($"דוח ניתוח טיפולים עבור {kid.FirstName} {kid.LastName}");
//            sb.AppendLine($"גיל: {CalculateAge(kid.BirthDate)}");
//            sb.AppendLine();

//            // סיכום הטיפולים לפי סוג
//            foreach (var typeGroup in treatmentsByType)
//            {
//                sb.AppendLine($"== סיכום טיפולי {typeGroup.Key} ==");

//                foreach (var treatment in typeGroup.Value)
//                {
//                    sb.AppendLine($"תאריך: {treatment.TreatmentDate.ToString("dd/MM/yyyy")}");
//                    sb.AppendLine($"רמת שיתוף פעולה: {treatment.CooperationLevel}/5");
//                    sb.AppendLine($"תיאור: {treatment.Description}");
//                    if (!string.IsNullOrEmpty(treatment.Highlight))
//                    {
//                        sb.AppendLine($"נקודות חשובות: {treatment.Highlight}");
//                    }
//                    sb.AppendLine();
//                }

//                sb.AppendLine();
//            }

//            return sb.ToString();
//        }

//        private int CalculateAge(DateTime birthDate)
//        {
//            var today = DateTime.Today;
//            var age = today.Year - birthDate.Year;
//            if (birthDate.Date > today.AddYears(-age)) age--;
//            return age;
//        }

//        private async Task<AnalyzeEntitiesResponse> AnalyzeTextWithGoogleNL(string text)
//        {
//            try
//            {
//                // קביעת אישורי Google Cloud
//                string credentialPath = _configuration["GoogleCloud:CredentialFile"];
//                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

//                // יצירת לקוח Google NL
//                LanguageServiceClient client = LanguageServiceClient.Create();

//                // הכנת הבקשה
//                Document document = new Document
//                {
//                    Content = text,
//                    Type = Document.Types.Type.PlainText,
//                    Language = "he"  // עברית
//                };

//                // ניתוח הטקסט
//                AnalyzeEntitiesResponse response = await client.AnalyzeEntitiesAsync(document);

//                return response;
//            }
//            catch (Exception ex)
//            {
//                throw new Exception($"שגיאה בעת ניתוח הטקסט עם Google NL API: {ex.Message}", ex);
//            }
//        }

//        private TSHAInsights ExtractInsightsFromAnalysis(AnalyzeEntitiesResponse analysis, Dictionary<string, List<Treatment>> treatmentsByType)
//        {
//            TSHAInsights insights = new TSHAInsights
//            {
//                Goals = new Dictionary<string, List<string>>(),
//                CurrentStatus = new Dictionary<string, string>(),
//                Areas = new Dictionary<string, AreaAnalysis>()
//            };

//            // עיבוד הטיפולים לפי סוג ויצירת תובנות
//            foreach (var typeGroup in treatmentsByType)
//            {
//                string treatmentType = typeGroup.Key;
//                List<Treatment> treatments = typeGroup.Value;

//                // ניתוח ההתקדמות על פי תיאורי הטיפולים
//                string progressAnalysis = AnalyzeProgressForType(treatments, analysis);

//                // יצירת רשימת מטרות מומלצות
//                List<string> recommendedGoals = GenerateGoalsForType(treatmentType, treatments, analysis);

//                // שמירת התובנות
//                insights.CurrentStatus[treatmentType] = progressAnalysis;
//                insights.Goals[treatmentType] = recommendedGoals;

//                insights.Areas[treatmentType] = new AreaAnalysis
//                {
//                    CurrentStatus = progressAnalysis,
//                    RecommendedGoals = recommendedGoals,
//                    TreatmentsCount = treatments.Count,
//                    AverageCooperation = treatments.Average(t => t.CooperationLevel)
//                };
//            }

//            return insights;
//        }

//        private string AnalyzeProgressForType(List<Treatment> treatments, AnalyzeEntitiesResponse analysis)
//        {
//            // ניתוח התקדמות בהתבסס על כלל הטיפולים ותוצאות הניתוח של Google NL API
//            // זו גישה בסיסית - ניתן לשפר בהתאם לצרכים

//            if (treatments.Count == 0) return "אין מספיק מידע להערכה";

//            // בדיקת שיתוף פעולה - אם הוא עולה או יורד לאורך הטיפולים
//            var orderedTreatments = treatments.OrderBy(t => t.TreatmentDate).ToList();
//            double firstHalfAvg = orderedTreatments.Take(orderedTreatments.Count / 2).Average(t => t.CooperationLevel);
//            double secondHalfAvg = orderedTreatments.Skip(orderedTreatments.Count / 2).Average(t => t.CooperationLevel);

//            string cooperationTrend = "";
//            if (secondHalfAvg - firstHalfAvg >= 0.5)
//                cooperationTrend = "ניכר שיפור בשיתוף הפעולה לאורך הטיפולים. ";
//            else if (firstHalfAvg - secondHalfAvg >= 0.5)
//                cooperationTrend = "נצפתה ירידה בשיתוף הפעולה לאורך הטיפולים. ";
//            else
//                cooperationTrend = "שיתוף הפעולה נשאר יציב יחסית לאורך הטיפולים. ";

//            // איסוף נקודות חשובות
//            var highlights = treatments.Where(t => !string.IsNullOrEmpty(t.Highlight))
//                .Select(t => t.Highlight)
//                .Distinct()
//                .ToList();

//            string highlightsSummary = "";
//            if (highlights.Count > 0)
//            {
//                highlightsSummary = "נקודות בולטות: " + string.Join("; ", highlights);
//            }

//            return cooperationTrend + highlightsSummary;
//        }

//        private List<string> GenerateGoalsForType(string treatmentType, List<Treatment> treatments, AnalyzeEntitiesResponse analysis)
//        {
//            List<string> goals = new List<string>();

//            // יצירת מטרות המותאמות לסוג הטיפול
//            switch (treatmentType)
//            {
//                case "פיזיותרפיה":
//                    goals.Add("חיזוק חגורת כתפיים לשיפור תכנון תנועה");
//                    goals.Add("שיפור קואורדינציה ושיווי משקל");
//                    goals.Add("פיתוח מיומנויות מוטוריקה גסה");
//                    break;

//                case "ריפוי בעיסוק":
//                    goals.Add("שיפור מיומנויות מוטוריקה עדינה");
//                    goals.Add("הארכת משך זמן הישיבה והתמדה בפעילות");
//                    goals.Add("פיתוח מיומנויות משחק ויזמות");
//                    break;

//                case "טיפול רגשי":
//                    goals.Add("פיתוח כישורי תקשורת מילולית ולא מילולית");
//                    goals.Add("הגברת היכולת ליצור אינטראקציה עם מבוגר והשתתפות ומעורבות הדדית");
//                    goals.Add("הארכת משך קשב במשחקים הדורשים שיתוף פעולה והמתנה לתור");
//                    break;

//                case "גננת":
//                    goals.Add("יצירת קשר עין רציף במפגש ובפעילות ליד שולחן");
//                    goals.Add("פיתוח אינטראקציה במשחק משותף");
//                    goals.Add("הרחבת אוצר מילים פונקציונלי");
//                    break;

//                case "טיפול במוזיקה":
//                    goals.Add("יצירת קשר עין עם המטפל באמצעות גירוי מוזיקלי");
//                    goals.Add("פיתוח יכולת הקשבה למוזיקה");
//                    goals.Add("עידוד התעניינות והתנסות בכלי נגינה");
//                    break;

//                default:
//                    goals.Add("פיתוח מיומנויות תקשורת ושיתוף פעולה");
//                    goals.Add("הארכת טווח קשב והתמדה בפעילויות");
//                    break;
//            }

//            // התאמה של המטרות בהתבסס על הניתוח
//            CustomizeGoalsByAnalysis(treatmentType, goals, treatments, analysis);

//            return goals;
//        }

//        private void CustomizeGoalsByAnalysis(string treatmentType, List<string> goals, List<Treatment> treatments, AnalyzeEntitiesResponse analysis)
//        {
//            // בחינת הטקסט שהוזן בטיפולים ושינוי המטרות בהתאם

//            // לדוגמה: אם מוזכר "קושי בישיבה" בתיאורי הטיפולים
//            bool hasSittingDifficulty = treatments.Any(t =>
//                t.Description.Contains("ישיבה") &&
//                (t.Description.Contains("קושי") || t.Description.Contains("מתקשה")));

//            if (hasSittingDifficulty && treatmentType == "ריפוי בעיסוק")
//            {
//                goals.Insert(0, "שיפור יכולת ישיבה יציבה למשך 10 דקות רצופות");
//            }

//            // אם יש שיפור בולט בהתקדמות, אפשר להציב מטרות מאתגרות יותר
//            double lastCooperation = treatments.OrderByDescending(t => t.TreatmentDate).First().CooperationLevel;
//            if (lastCooperation >= 4)
//            {
//                // במקרה של שיתוף פעולה גבוה, ניתן להגדיר מטרות מאתגרות יותר
//                goals.Add("העלאת רמת הקושי בפעילויות תוך שמירה על שיתוף פעולה גבוה");
//            }
//        }
//    }

//    public class TSHAInsights
//    {
//        public Dictionary<string, List<string>> Goals { get; set; }
//        public Dictionary<string, string> CurrentStatus { get; set; }
//        public Dictionary<string, AreaAnalysis> Areas { get; set; }
//    }

//    public class AreaAnalysis
//    {
//        public string CurrentStatus { get; set; }
//        public List<string> RecommendedGoals { get; set; }
//        public int TreatmentsCount { get; set; }
//        public double AverageCooperation { get; set; }
//    }
//}