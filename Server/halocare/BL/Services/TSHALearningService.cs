//// BL/Services/TSHALearningService.cs
//using System;
//using System.Collections.Generic;
//using System.IO;
//using System.Text.Json;
//using System.Threading.Tasks;
//using halocare.DAL.Models;
//using Microsoft.Extensions.Configuration;

//namespace halocare.BL.Services
//{
//    public class TSHALearningService
//    {
//        private readonly IConfiguration _configuration;
//        private readonly string _learningDataPath;
//        private Dictionary<string, double> _keywordWeights;

//        public TSHALearningService(IConfiguration configuration)
//        {
//            _configuration = configuration;
//            _learningDataPath = Path.Combine(
//                AppDomain.CurrentDomain.BaseDirectory,
//                "Data",
//                "tsha_learning_data.json"
//            );

//            LoadOrInitializeWeights();
//        }

//        private void LoadOrInitializeWeights()
//        {
//            try
//            {
//                if (File.Exists(_learningDataPath))
//                {
//                    string json = File.ReadAllText(_learningDataPath);
//                    _keywordWeights = JsonSerializer.Deserialize<Dictionary<string, double>>(json);
//                }
//                else
//                {
//                    InitializeDefaultWeights();
//                    SaveWeights();
//                }
//            }
//            catch (Exception)
//            {
//                InitializeDefaultWeights();
//            }
//        }

//        private void InitializeDefaultWeights()
//        {
//            _keywordWeights = new Dictionary<string, double>
//            {
//                // תקשורת
//                { "קשר עין", 0.8 },
//                { "תקשורת", 0.7 },
//                { "הבנה", 0.6 },
//                { "הבעה", 0.7 },
//                { "שפה", 0.7 },
                
//                // מוטוריקה
//                { "מוטוריקה עדינה", 0.7 },
//                { "מוטוריקה גסה", 0.7 },
//                { "קואורדינציה", 0.6 },
//                { "שיווי משקל", 0.6 },
                
//                // רגשי-חברתי
//                { "שיתוף פעולה", 0.8 },
//                { "משחק", 0.6 },
//                { "אינטראקציה", 0.7 },
//                { "ויסות", 0.7 },
//                { "חברתי", 0.6 },
                
//                // קוגניטיבי
//                { "קשב", 0.8 },
//                { "ריכוז", 0.8 },
//                { "סדר", 0.5 },
//                { "רצף", 0.5 },
//                { "חשיבה", 0.6 },
                
//                // עצמאות
//                { "עצמאות", 0.7 },
//                { "יוזמה", 0.6 },
//                { "התארגנות", 0.5 }
//            };
//        }

//        private void SaveWeights()
//        {
//            try
//            {
//                // ודא שהתיקיה קיימת
//                Directory.CreateDirectory(Path.GetDirectoryName(_learningDataPath));

//                // שמור את המשקלים
//                string json = JsonSerializer.Serialize(_keywordWeights, new JsonSerializerOptions
//                {
//                    WriteIndented = true
//                });

//                File.WriteAllText(_learningDataPath, json);
//            }
//            catch (Exception)
//            {
//                // רשום לוג במקרה של שגיאה
//            }
//        }

//        public Dictionary<string, double> GetKeywordWeights()
//        {
//            return new Dictionary<string, double>(_keywordWeights);
//        }

//        public void UpdateWeights(Dictionary<string, double> feedbackAdjustments)
//        {
//            // עדכון המשקלים בהתאם למשוב שהתקבל
//            foreach (var adjustment in feedbackAdjustments)
//            {
//                if (_keywordWeights.ContainsKey(adjustment.Key))
//                {
//                    // התאמה הדרגתית (למידה איטית)
//                    double learningRate = 0.1;
//                    _keywordWeights[adjustment.Key] += learningRate * adjustment.Value;

//                    // הגבל את הערכים לטווח סביר
//                    _keywordWeights[adjustment.Key] = Math.Max(0.1, Math.Min(1.0, _keywordWeights[adjustment.Key]));
//                }
//                else
//                {
//                    // הוסף מילת מפתח חדשה
//                    _keywordWeights[adjustment.Key] = Math.Max(0.1, Math.Min(1.0, 0.5 + adjustment.Value));
//                }
//            }

//            // שמור את המשקלים המעודכנים
//            SaveWeights();
//        }

//        public async Task<List<string>> ImproveGoals(List<string> generatedGoals, int kidId, string area)
//        {
//            List<string> improvedGoals = new List<string>();

//            foreach (var goal in generatedGoals)
//            {
//                // חישוב רלוונטיות המטרה בהתבסס על מילות המפתח והמשקלים שלהן
//                double relevanceScore = CalculateGoalRelevance(goal);

//                if (relevanceScore >= 0.6)
//                {
//                    // מטרות עם ציון רלוונטיות גבוה נשארות כפי שהן
//                    improvedGoals.Add(goal);
//                }
//                else
//                {
//                    // מטרות עם ציון נמוך מותאמות
//                    string improvedGoal = await AdaptGoalForRelevance(goal, kidId, area);
//                    improvedGoals.Add(improvedGoal);
//                }
//            }

//            return improvedGoals;
//        }

//        private double CalculateGoalRelevance(string goal)
//        {
//            double relevanceScore = 0;
//            int matchCount = 0;

//            foreach (var keyword in _keywordWeights.Keys)
//            {
//                if (goal.Contains(keyword, StringComparison.OrdinalIgnoreCase))
//                {
//                    relevanceScore += _keywordWeights[keyword];
//                    matchCount++;
//                }
//            }

//            // חישוב ממוצע משוקלל אם יש התאמות
//            return matchCount > 0 ? relevanceScore / matchCount : 0;
//        }

//        private async Task<string> AdaptGoalForRelevance(string goal, int kidId, string area)
//        {
//            // התאמת המטרה בהתבסס על תחום ומילות מפתח רלוונטיות
//            string adaptedGoal = goal;

//            // הוסף מילות מפתח רלוונטיות בעלות משקל גבוה שאינן כלולות במטרה
//            List<KeyValuePair<string, double>> relevantKeywords = _keywordWeights
//                .Where(kw => !goal.Contains(kw.Key, StringComparison.OrdinalIgnoreCase) && kw.Value >= 0.7)
//                .OrderByDescending(kw => kw.Value)
//                .Take(2)
//                .ToList();

//            if (relevantKeywords.Any())
//            {
//                // הוסף פרטים ספציפיים למטרה
//                string keywordPhrase = String.Join(" ו", relevantKeywords.Select(kw => kw.Key));
//                adaptedGoal = $"{goal} תוך שימת דגש על {keywordPhrase}";
//            }

//            return adaptedGoal;
//        }

//        public void ProcessTSHAFeedback(int tshaId, Dictionary<string, int> goalRatings)
//        {
//            // עיבוד משוב על מטרות התש"ה
//            Dictionary<string, double> adjustments = new Dictionary<string, double>();

//            foreach (var rating in goalRatings)
//            {
//                string goal = rating.Key;
//                int score = rating.Value; // ציון בין 1 ל-5

//                // חישוב התאמות למשקלים
//                foreach (var keyword in _keywordWeights.Keys)
//                {
//                    if (goal.Contains(keyword, StringComparison.OrdinalIgnoreCase))
//                    {
//                        // המרה לטווח -0.2 עד 0.2
//                        double adjustment = (score - 3) / 10.0;

//                        if (adjustments.ContainsKey(keyword))
//                        {
//                            adjustments[keyword] += adjustment;
//                        }
//                        else
//                        {
//                            adjustments[keyword] = adjustment;
//                        }
//                    }
//                }
//            }

//            // עדכון המשקלים
//            UpdateWeights(adjustments);
//        }
//    }
//}