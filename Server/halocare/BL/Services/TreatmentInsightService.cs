// BL/Services/TreatmentInsightService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Google.Cloud.Language.V1;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;
using Google.Cloud.Translation.V2;


namespace halocare.BL.Services
{
    public class TreatmentInsightService
    {
        private readonly IConfiguration _configuration;

        public TreatmentInsightService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<TreatmentInsights> AnalyzeTreatments(List<Treatment> treatments)
        {
            TreatmentInsights insights = new TreatmentInsights();

            if (treatments.Count == 0)
            {
                insights.ErrorMessage = "אין טיפולים לניתוח";
                return insights;
            }

            // Analyze cooperation trend over time
            insights.CooperationTrend = AnalyzeCooperationTrend(treatments);

            // Sentiment analysis from treatment descriptions
            insights.SentimentAnalysis = await AnalyzeSentiment(treatments); // google service

            // Identify recurring concepts in treatment descriptions
            insights.RecurringConcepts = IdentifyRecurringConcepts(treatments);

            // Identify preferred activities based on treatment descriptions
            insights.PreferredActivities = IdentifyPreferredActivities(treatments);

            // Recommend goals for continuation
            insights.RecommendedGoals = GenerateGoalRecommendations(treatments, insights);

            return insights;
        }

        private CooperationTrendAnalysis AnalyzeCooperationTrend(List<Treatment> treatments)
        {
            var orderedTreatments = treatments.OrderBy(t => t.TreatmentDate).ToList();

            // Calculate a trend over time
            List<double> cooperationLevels = orderedTreatments.Select(t => (double)t.CooperationLevel).ToList();

            CooperationTrendAnalysis analysis = new CooperationTrendAnalysis
            {
                StartDate = orderedTreatments.First().TreatmentDate,
                EndDate = orderedTreatments.Last().TreatmentDate,
                AverageCooperation = cooperationLevels.Average(),
                MaxCooperation = cooperationLevels.Max(),
                MinCooperation = cooperationLevels.Min(),
                TreatmentsCount = treatments.Count
            };

            // Trend calculation - is there improvement or decline in collaboration?
            if (cooperationLevels.Count >= 4)
            {
                int midPoint = cooperationLevels.Count / 2;
                double firstHalfAvg = cooperationLevels.Take(midPoint).Average();
                double secondHalfAvg = cooperationLevels.Skip(midPoint).Average();

                analysis.TrendDirection = secondHalfAvg > firstHalfAvg ? "עולה" :
                                        secondHalfAvg < firstHalfAvg ? "יורדת" : "יציבה";
                analysis.TrendStrength = Math.Abs(secondHalfAvg - firstHalfAvg);

                if (analysis.TrendStrength >= 1.0)
                    analysis.TrendDescription = "שינוי משמעותי";
                else if (analysis.TrendStrength >= 0.5)
                    analysis.TrendDescription = "שינוי מתון";
                else
                    analysis.TrendDescription = "יציבות יחסית";
            }
            else
            {
                analysis.TrendDirection = "לא מספיק נתונים";
                analysis.TrendDescription = "אין מספיק טיפולים לניתוח מגמה";
            }

            return analysis;
        }

        private async Task<SentimentAnalysisResult> AnalyzeSentiment(List<Treatment> treatments)
        {
            SentimentAnalysisResult result = new SentimentAnalysisResult();

            try
            {
                // Set up Google Cloud credentials
                string credentialPath = _configuration["GoogleCloud:CredentialFile"];
                Console.WriteLine($"Using credential file: {credentialPath}");
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);

                // Create Google NL client
                LanguageServiceClient client = LanguageServiceClient.Create();

                // Prepare unified text from all descriptions and highlights
                StringBuilder sb = new StringBuilder();
                foreach (Treatment treatment in treatments)
                {
                    sb.AppendLine(treatment.Description);
                    if (!string.IsNullOrEmpty(treatment.Highlight))
                    {
                        sb.AppendLine(treatment.Highlight);
                    }
                }

                string originalText = sb.ToString();


                // Google Translation API - translate to English
                string translatedText = await TranslateText(originalText, "he", "en");

                Console.WriteLine("translatedText:", translatedText);

                // Prepare request
                Document document = new Document
                {
                    Content = translatedText,
                    Type = Document.Types.Type.PlainText,
                    Language = "en"
                };

                // Sentiment analysis
                AnalyzeSentimentResponse response = await client.AnalyzeSentimentAsync(document);

                // Convert analysis results to a custom structure
                result.OverallScore = response.DocumentSentiment.Score;
                result.OverallMagnitude = response.DocumentSentiment.Magnitude;

                // Interpretation of the results
                if (result.OverallScore > 0.25)
                {
                    result.OverallTone = "חיובי";
                    result.Interpretation = "תיאורי הטיפולים מצביעים על גישה חיובית ושיפור";
                }
                else if (result.OverallScore < -0.25)
                {
                    result.OverallTone = "שלילי";
                    result.Interpretation = "תיאורי הטיפולים מעידים על אתגרים וקשיים מתמשכים";
                }
                else
                {
                    result.OverallTone = "ניטרלי";
                    result.Interpretation = "תיאורי הטיפולים מאוזנים בין אתגרים להתקדמות";
                }

                // Analysis by sentences
                List<SentenceSentiment> sentenceAnalysis = new List<SentenceSentiment>();

                foreach (var sentence in response.Sentences)
                {
                    // Translate back to Hebrew
                    string translatedSentence = await TranslateText(sentence.Text.Content, "en", "he");

                    Console.WriteLine("translatedSentence:", translatedSentence);

                    sentenceAnalysis.Add(new SentenceSentiment
                    {
                        Text = translatedSentence,  // Hebrew
                        Score = sentence.Sentiment.Score,
                        Magnitude = sentence.Sentiment.Magnitude
                    });
                }
                result.SentenceAnalysis = sentenceAnalysis;

                return result;
            }
            catch (Exception ex)
            {
                result.Error = $"שגיאה בניתוח רגשות: {ex.Message}";
                return result;
            }
        }

        private List<RecurringConcept> IdentifyRecurringConcepts(List<Treatment> treatments)
        {
            // Simple approach for now - better to use a complex NLP tool - natural language processing
            Dictionary<string, int> conceptCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

            // Keywords
            string[] keywordsToSearch = new string[]
            {
                "קשר עין", "תקשורת", "שפה", "הבנה", "קשב", "ריכוז", "משחק", "שיתוף פעולה",
                "מוטוריקה", "תכנון", "ויסות", "רגשי", "חברתי", "התנהגות", "עצמאות", "יוזמה",
                "חיקוי", "הבעה", "אינטראקציה", "סנסורי", "גירוי", "תגובה", "תסכול", "הנאה",
                "הצלחה", "אתגר", "קושי", "התקדמות", "שיפור", "ישיבה", "עמידה", "הליכה"
            };

            // Counting keywords in the treatment description, with highlight if found
            foreach (Treatment treatment in treatments)
            {
                string fullText = treatment.Description;
                if (!string.IsNullOrEmpty(treatment.Highlight))
                {
                    fullText += " " + treatment.Highlight;
                }

                foreach (string keyword in keywordsToSearch)
                {
                    if (fullText.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                    {
                        if (conceptCounts.ContainsKey(keyword))
                            conceptCounts[keyword]++;
                        else
                            conceptCounts[keyword] = 1;
                    }
                }
            }

            // Sorting results by frequency
            return conceptCounts
                .Where(c => c.Value > 1)  // only words that appear twice or more
                .OrderByDescending(c => c.Value)
                .Select(c => new RecurringConcept
                {
                    Concept = c.Key,
                    Count = c.Value,
                    PercentageOfTreatments = (double)c.Value / treatments.Count * 100
                })
                .ToList();
        }

        private List<PreferredActivity> IdentifyPreferredActivities(List<Treatment> treatments)
        {
            // Activity categories
            Dictionary<string, List<string>> activityCategories = new Dictionary<string, List<string>>
            {
                { "משחקי שולחן", new List<string> { "פאזל", "משחק קופסה", "הרכבה", "לגו", "קוביות" } },
                { "משחק סימבולי", new List<string> { "בובות", "בית", "מטבח", "חיות", "מכוניות", "רופא" } },
                { "אומנות", new List<string> { "ציור", "צבעים", "גואש", "יצירה", "פלסטלינה", "בצק" } },
                { "מוזיקה", new List<string> { "שירים", "כלי נגינה", "מוזיקה", "שיר", "מנגינה", "תוף" } },
                { "מוטוריקה גסה", new List<string> { "כדור", "קפיצה", "מסלול", "טיפוס", "ריצה", "הליכה", "שיווי משקל" } },
                { "מוטוריקה עדינה", new List<string> { "חרוזים", "מספריים", "גזירה", "ציור", "הדבקה", "פינצטה" } },
                { "משחק חברתי", new List<string> { "תור", "משחק משותף", "מעגל", "תחרות", "קבוצה" } }
            };

            // Counting categories
            Dictionary<string, ActivityAnalysis> activityCounts = new Dictionary<string, ActivityAnalysis>();

            foreach (Treatment treatment in treatments)
            {
                string fullText = treatment.Description;
                if (!string.IsNullOrEmpty(treatment.Highlight))
                {
                    fullText += " " + treatment.Highlight;
                }

                foreach (var category in activityCategories)
                {
                    bool categoryFound = false;
                    List<string> foundKeywords = new List<string>();

                    foreach (string keyword in category.Value)
                    {
                        if (fullText.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                        {
                            categoryFound = true;
                            foundKeywords.Add(keyword);
                        }
                    }

                    if (categoryFound)
                    {
                        if (!activityCounts.ContainsKey(category.Key))
                        {
                            activityCounts[category.Key] = new ActivityAnalysis
                            {
                                Category = category.Key,
                                Count = 0,
                                TotalCooperation = 0,
                                Keywords = new HashSet<string>()
                            };
                        }

                        activityCounts[category.Key].Count++;
                        activityCounts[category.Key].TotalCooperation += treatment.CooperationLevel;
                        foreach (var kw in foundKeywords)
                        {
                            activityCounts[category.Key].Keywords.Add(kw);
                        }
                    }
                }
            }

            // Calculate average cooperation and convert to list of favorite activities 
            return activityCounts
                .Select(ac => new PreferredActivity
                {
                    Category = ac.Key,
                    Count = ac.Value.Count,
                    PercentageOfTreatments = (double)ac.Value.Count / treatments.Count * 100,
                    AverageCooperation = ac.Value.Count > 0 ? (double)ac.Value.TotalCooperation / ac.Value.Count : 0,
                    RelatedKeywords = ac.Value.Keywords.ToList()
                })
                .OrderByDescending(pa => pa.AverageCooperation)
                .ThenByDescending(pa => pa.Count)
                .ToList();
        }

        private List<GoalRecommendation> GenerateGoalRecommendations(List<Treatment> treatments, TreatmentInsights insights)
        {
            List<GoalRecommendation> recommendations = new List<GoalRecommendation>();

            // Recommendations based on recurring concepts
            foreach (var concept in insights.RecurringConcepts.Take(3))
            {
                switch (concept.Concept.ToLower())
                {
                    case "קשר עין":
                        recommendations.Add(new GoalRecommendation
                        {
                            Area = "תקשורת",
                            Goal = "פיתוח יכולת ליצור ולשמור על קשר עין במשך פעילות של 5 דקות",
                            Reason = $"המושג \"קשר עין\" חזר ב-{concept.Count} תיאורי טיפולים",
                            Priority = concept.Count > 3 ? "גבוהה" : "בינונית"
                        });
                        break;

                    case "שיתוף פעולה":
                        recommendations.Add(new GoalRecommendation
                        {
                            Area = "חברתי",
                            Goal = "הגברת שיתוף הפעולה במשחקים משותפים עם מבוגר וילד נוסף",
                            Reason = $"המושג \"שיתוף פעולה\" חזר ב-{concept.Count} תיאורי טיפולים",
                            Priority = concept.Count > 3 ? "גבוהה" : "בינונית"
                        });
                        break;

                    case "קשב":
                    case "ריכוז":
                        recommendations.Add(new GoalRecommendation
                        {
                            Area = "קוגניטיבי",
                            Goal = "הארכת משך הקשב לפעילות מובנית ל-10 דקות רצופות",
                            Reason = $"המושג \"{concept.Concept}\" חזר ב-{concept.Count} תיאורי טיפולים",
                            Priority = concept.Count > 3 ? "גבוהה" : "בינונית"
                        });
                        break;

                    case "מוטוריקה":
                        recommendations.Add(new GoalRecommendation
                        {
                            Area = "פיזי",
                            Goal = "שיפור מיומנויות מוטוריות בדגש על קואורדינציה ודיוק",
                            Reason = $"המושג \"מוטוריקה\" חזר ב-{concept.Count} תיאורי טיפולים",
                            Priority = concept.Count > 3 ? "גבוהה" : "בינונית"
                        });
                        break;

                        // we should add more in the future
                }
            }

            // Recommendations based on collaboration trend analysis
            if (insights.CooperationTrend.TrendDirection == "יורדת" && insights.CooperationTrend.TrendStrength >= 0.5)
            {
                recommendations.Add(new GoalRecommendation
                {
                    Area = "רגשי",
                    Goal = "שיפור שיתוף הפעולה באמצעות התאמת פעילויות לתחומי העניין של הילד",
                    Reason = $"נצפתה ירידה של {insights.CooperationTrend.TrendStrength:F1} נקודות בממוצע שיתוף הפעולה",
                    Priority = "גבוהה"
                });
            }

            // Recommendations based on sentiment analysis
            if (insights.SentimentAnalysis?.OverallTone == "שלילי")
            {
                recommendations.Add(new GoalRecommendation
                {
                    Area = "רגשי",
                    Goal = "יצירת חוויות הצלחה באמצעות פעילויות מותאמות ליכולות הילד",
                    Reason = "ניתוח הרגשות בתיאורי הטיפולים מצביע על חוויה מאתגרת",
                    Priority = "גבוהה"
                });
            }

            // Recommendations based on preferred activities
            if (insights.PreferredActivities.Count > 0)
            {
                var topActivity = insights.PreferredActivities[0];

                recommendations.Add(new GoalRecommendation
                {
                    Area = "התנסות",
                    Goal = $"הרחבת ההתנסות ב{topActivity.Category} תוך העלאת רמת המורכבות",
                    Reason = $"נצפה שיתוף פעולה גבוה ({topActivity.AverageCooperation:F1}/5) בפעילויות מסוג {topActivity.Category}",
                    Priority = "בינונית"
                });
            }

            // Check if there are at least 3 recommendations
            if (recommendations.Count < 3)
            {
                // Add general recommendations if needed
                recommendations.Add(new GoalRecommendation
                {
                    Area = "כללי",
                    Goal = "פיתוח מיומנויות תקשורת מילולית ולא מילולית",
                    Reason = "מטרה בסיסית להתפתחות",
                    Priority = "בינונית"
                });

                recommendations.Add(new GoalRecommendation
                {
                    Area = "כללי",
                    Goal = "עידוד עצמאות בפעילויות יומיומיות",
                    Reason = "מטרה בסיסית להתפתחות",
                    Priority = "בינונית"
                });
            }

            return recommendations.OrderByDescending(r => r.Priority == "גבוהה").ToList();
        }

        // Translate text method
        private async Task<string> TranslateText(string text, string sourceLanguage, string targetLanguage)
        {
            try
            {
                // Create Google Translate client
                TranslationClient client = TranslationClient.Create();

                // Translate the text
                TranslationResult response = await client.TranslateTextAsync(
                    text,
                    targetLanguage,
                    sourceLanguage: sourceLanguage);

                return response.TranslatedText;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בתרגום טקסט: {ex.Message}", ex);
            }
        }
    }


    public class TreatmentInsights
    {
        public string ErrorMessage { get; set; }
        public CooperationTrendAnalysis CooperationTrend { get; set; }
        public SentimentAnalysisResult SentimentAnalysis { get; set; }
        public List<RecurringConcept> RecurringConcepts { get; set; } = new List<RecurringConcept>();
        public List<PreferredActivity> PreferredActivities { get; set; } = new List<PreferredActivity>();
        public List<GoalRecommendation> RecommendedGoals { get; set; } = new List<GoalRecommendation>();
    }

    public class CooperationTrendAnalysis
    {
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public double AverageCooperation { get; set; }
        public double MaxCooperation { get; set; }
        public double MinCooperation { get; set; }
        public int TreatmentsCount { get; set; }
        public string TrendDirection { get; set; }
        public double TrendStrength { get; set; }
        public string TrendDescription { get; set; }
    }

    public class SentimentAnalysisResult
    {
        public string Error { get; set; }
        public double OverallScore { get; set; }
        public double OverallMagnitude { get; set; }
        public string OverallTone { get; set; }
        public string Interpretation { get; set; }
        public List<SentenceSentiment> SentenceAnalysis { get; set; } = new List<SentenceSentiment>();
    }

    public class SentenceSentiment
    {
        public string Text { get; set; }
        public double Score { get; set; }
        public double Magnitude { get; set; }
    }

    public class RecurringConcept
    {
        public string Concept { get; set; }
        public int Count { get; set; }
        public double PercentageOfTreatments { get; set; }
    }

    public class PreferredActivity
    {
        public string Category { get; set; }
        public int Count { get; set; }
        public double PercentageOfTreatments { get; set; }
        public double AverageCooperation { get; set; }
        public List<string> RelatedKeywords { get; set; } = new List<string>();
    }

    public class GoalRecommendation
    {
        public string Area { get; set; }
        public string Goal { get; set; }
        public string Reason { get; set; }
        public string Priority { get; set; }
    }

    public class ActivityAnalysis
    {
        public string Category { get; set; }
        public int Count { get; set; }
        public int TotalCooperation { get; set; }
        public HashSet<string> Keywords { get; set; } = new HashSet<string>();
    }
}
