// BL/Services/KidOnboardingService.cs
using System;
using System.Collections.Generic;
using System.Linq;
using halocare.DAL.Models;
//using halocare.DAL.Models.DTOs;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class KidOnboardingService
    {
        private readonly KidOnboardingRepository _onboardingRepository;
        private readonly FormRepository _formRepository;
        private readonly QuestionRepository _questionRepository;
        private readonly AnswerToQuestionRepository _answerRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;

        public KidOnboardingService(IConfiguration configuration)
        {
            _onboardingRepository = new KidOnboardingRepository(configuration);
            _formRepository = new FormRepository(configuration);
            _questionRepository = new QuestionRepository(configuration);
            _answerRepository = new AnswerToQuestionRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
        }

        #region Main Onboarding Flow

        /// <summary>
        /// התחלת תהליך קליטה חדש לילד
        /// </summary>
        public int StartOnboardingProcess(int kidId, int? createdBy = null)
        {
            try
            {
                // בדיקה שהילד קיים
                var kid = _kidRepository.GetKidById(kidId);
                if (kid == null)
                    throw new ArgumentException($"ילד עם מזהה {kidId} לא נמצא במערכת");

                // בדיקה שלא קיים כבר תהליך קליטה
                var existingProcess = _onboardingRepository.GetOnboardingProcess(kidId);
                if (existingProcess != null)
                    throw new InvalidOperationException($"כבר קיים תהליך קליטה עבור ילד {kidId}");

                // יצירת תהליך קליטה חדש
                int processId = _onboardingRepository.CreateOnboardingProcess(kidId, createdBy);

                // אתחול סטטוסי הטפסים
                _onboardingRepository.InitializeFormStatuses(kidId);

                // סימון הטופס הראשון כהושלם (פרטים אישיים)
                var firstForm = _formRepository.GetAllForms().FirstOrDefault(f => f.IsFirstStep);
                if (firstForm != null)
                {
                    _onboardingRepository.UpdateFormStatus(kidId, firstForm.FormId, "completed");
                }

                // יצירת תזכורות ראשוניות
                CreateInitialReminders(kidId, createdBy);

                // עדכון אחוז התקדמות
                UpdateProcessCompletion(kidId);

                return processId;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בהתחלת תהליך קליטה: {ex.Message}");
            }
        }

        /// <summary>
        /// קבלת סטטוס מפורט של תהליך הקליטה
        /// </summary>
        public OnboardingStatusDto GetOnboardingStatus(int kidId)
        {
            try
            {
                var process = _onboardingRepository.GetOnboardingProcess(kidId);
                if (process == null)
                    return null;

                var kid = _kidRepository.GetKidById(kidId);
                var creator = process.CreatedBy.HasValue ? _employeeRepository.GetEmployeeById(process.CreatedBy.Value) : null;

                // קבלת כל הטפסים וסטטוסיהם
                var allForms = _formRepository.GetAllForms().OrderBy(f => f.FormOrder ?? 999).ToList();
                var formStatuses = _onboardingRepository.GetAllFormStatuses(kidId);
                var reminders = _onboardingRepository.GetReminders(kidId);

                // בניית DTOs
                var processDto = new ProcessInfoDto
                {
                    ProcessId = process.ProcessId,
                    KidId = kidId,
                    KidName = $"{kid?.FirstName} {kid?.LastName}",
                    ProcessStatus = process.ProcessStatus,
                    StartDate = process.StartDate,
                    CompletionDate = process.CompletionDate,
                    LastUpdated = process.LastUpdated,
                    CompletionPercentage = process.CompletionPercentage,
                    Notes = process.Notes,
                    CreatedByName = creator != null ? $"{creator.FirstName} {creator.LastName}" : null
                };

                var formDtos = BuildFormStatusDtos(allForms, formStatuses);
                var statsDto = CalculateStats(formDtos, process.StartDate);
                var reminderDtos = BuildReminderDtos(reminders);

                return new OnboardingStatusDto
                {
                    Process = processDto,
                    Forms = formDtos,
                    Stats = statsDto,
                    Reminders = reminderDtos
                };
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בקבלת סטטוס תהליך קליטה: {ex.Message}");
            }
        }

        /// <summary>
        /// התחלת מילוי טופס
        /// </summary>
        public bool StartForm(int kidId, int formId, int? assignedTo = null)
        {
            try
            {
                // בדיקות תקינות
                var form = _formRepository.GetFormById(formId);
                if (form == null)
                    throw new ArgumentException($"טופס עם מזהה {formId} לא נמצא");

                var formStatus = _onboardingRepository.GetFormStatus(kidId, formId);
                if (formStatus?.FormStatus == "completed")
                    throw new InvalidOperationException("הטופס כבר הושלם");

                // עדכון סטטוס לבתהליך
                var questions = _questionRepository.GetQuestionsByFormId(formId);
                bool success = _onboardingRepository.UpdateFormStatus(
                    kidId, formId, "in_progress",
                    totalQuestions: questions.Count,
                    assignedTo: assignedTo
                );

                if (success)
                {
                    UpdateProcessCompletion(kidId);
                }

                return success;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בהתחלת טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// עדכון התקדמות במילוי טופס
        /// </summary>
        public bool UpdateFormProgress(int kidId, int formId)
        {
            try
            {
                // ספירת תשובות קיימות
                var answers = _answerRepository.GetAnswersByKidAndForm(kidId, formId);
                var validAnswers = answers.Where(a => !string.IsNullOrEmpty(a.Answer)).Count();

                var questions = _questionRepository.GetQuestionsByFormId(formId);
                var totalQuestions = questions.Count;

                // חישוב אחוז השלמה
                var completionPercentage = totalQuestions > 0 ? (validAnswers * 100) / totalQuestions : 0;

                // קביעת סטטוס
                string status = "in_progress";
                if (validAnswers == totalQuestions)
                {
                    status = "completed";
                }
                else if (validAnswers == 0)
                {
                    status = "not_started";
                }

                bool success = _onboardingRepository.UpdateFormStatus(
                    kidId, formId, status,
                    answeredQuestions: validAnswers,
                    totalQuestions: totalQuestions
                );

                if (success)
                {
                    UpdateProcessCompletion(kidId);
                }

                return success;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בעדכון התקדמות טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// השלמת טופס
        /// </summary>
        public bool CompleteForm(int kidId, int formId)
        {
            try
            {
                // בדיקה שכל השאלות החובה נענו
                var questions = _questionRepository.GetQuestionsByFormId(formId);
                var mandatoryQuestions = questions.Where(q => q.IsMandatory).ToList();

                if (mandatoryQuestions.Any())
                {
                    var answers = _answerRepository.GetAnswersByKidAndForm(kidId, formId);
                    var answeredMandatory = mandatoryQuestions.Where(q =>
                        answers.Any(a => a.QuestionNo == q.QuestionNo && !string.IsNullOrEmpty(a.Answer))
                    ).Count();

                    if (answeredMandatory < mandatoryQuestions.Count)
                    {
                        throw new InvalidOperationException("לא ניתן להשלים את הטופס - יש שאלות חובה שלא נענו");
                    }
                }

                // עדכון לסטטוס הושלם
                bool success = _onboardingRepository.UpdateFormStatus(
                    kidId, formId, "completed",
                    answeredQuestions: questions.Count,
                    totalQuestions: questions.Count
                );

                if (success)
                {
                    UpdateProcessCompletion(kidId);

                    // סימון תזכורות קשורות כהושלמו
                    MarkFormRemindersCompleted(kidId, formId);
                }

                return success;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בהשלמת טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// שליחת טופס להורים
        /// </summary>
        public bool SendFormToParent(int kidId, int formId)
        {
            try
            {
                bool success = _onboardingRepository.UpdateFormStatus(kidId, formId, "sent_to_parent");

                if (success)
                {
                    // יצירת תזכורת למעקב אחר החזרת הטופס
                    var reminder = new OnboardingReminder
                    {
                        KidId = kidId,
                        FormId = formId,
                        ReminderType = "parent_followup",
                        Title = "מעקב אחר טופס שנשלח להורים",
                        Description = $"לבדוק שההורים מילאו את הטופס",
                        DueDate = DateTime.Now.AddDays(7), // תזכורת לאחר שבוע
                        CreatedBy = 1 // TODO: להחליף למשתמש הנוכחי
                    };

                    _onboardingRepository.AddReminder(reminder);
                    UpdateProcessCompletion(kidId);
                }

                return success;
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בשליחת טופס להורים: {ex.Message}");
            }
        }

        #endregion

        #region Helper Methods

        private void CreateInitialReminders(int kidId, int? createdBy)
        {
            var reminders = new List<OnboardingReminder>
            {
                new OnboardingReminder
                {
                    KidId = kidId,
                    ReminderType = "form_deadline",
                    Title = "השלמת טפסי קליטה",
                    Description = "יש להשלים את כל טפסי הקליטה תוך 30 יום",
                    DueDate = DateTime.Now.AddDays(30),
                    CreatedBy = createdBy ?? 1
                }
            };

            foreach (var reminder in reminders)
            {
                _onboardingRepository.AddReminder(reminder);
            }
        }

        private void UpdateProcessCompletion(int kidId)
        {
            // השתמש ב-Stored Procedure לעדכון אוטומטי
            try
            {
                var result = _onboardingRepository.ExecuteQuery("SP_UpdateProcessCompletionPercentage",
                    new Dictionary<string, object> { { "@KidId", kidId } });

                // לוג התוצאה למעקב
                if (result.Rows.Count > 0)
                {
                    var row = result.Rows[0];
                    var completionPercentage = row["CompletionPercentage"];
                    var processStatus = row["ProcessStatus"];
                    // יכול להוסיף לוגינג כאן
                }
            }
            catch (Exception ex)
            {
                // לוג שגיאה אבל אל תכשיל את התהליך
                Console.WriteLine($"Error updating process completion: {ex.Message}");
            }
        }

        private void MarkFormRemindersCompleted(int kidId, int formId)
        {
            var reminders = _onboardingRepository.GetReminders(kidId, false)
                .Where(r => r.FormId == formId && !r.IsCompleted)
                .ToList();

            foreach (var reminder in reminders)
            {
                _onboardingRepository.CompleteReminder(reminder.ReminderId);
            }
        }

        private List<FormStatusDto> BuildFormStatusDtos(List<Form> allForms, List<KidFormStatus> formStatuses)
        {
            var formDtos = new List<FormStatusDto>();

            foreach (var form in allForms)
            {
                var status = formStatuses.FirstOrDefault(fs => fs.FormId == form.FormId);

                var dto = new FormStatusDto
                {
                    FormId = form.FormId,
                    FormName = form.FormName,
                    FormDescription = form.FormDescription,
                    FormOrder = form.FormOrder ?? 999,
                    IsFirstStep = form.IsFirstStep,
                    Status = status?.FormStatus ?? "not_started",
                    StartedAt = status?.StartedAt,
                    CompletedAt = status?.CompletedAt,
                    SentToParentAt = status?.SentToParentAt,
                    AnsweredQuestions = status?.AnsweredQuestions ?? 0,
                    TotalQuestions = status?.TotalQuestions ?? 0,
                    CompletionPercentage = status?.CompletionPercentage ?? 0,
                    Priority = status?.Priority ?? 1,
                    Notes = status?.Notes,
                    CanStart = CanStartForm(form, formStatuses),
                    IsRequired = !form.IsFirstStep // כל הטפסים חובה חוץ מהראשון
                };

                // הוספת שם האחראי
                if (status?.AssignedTo.HasValue == true)
                {
                    var employee = _employeeRepository.GetEmployeeById(status.AssignedTo.Value);
                    dto.AssignedToName = employee != null ? $"{employee.FirstName} {employee.LastName}" : null;
                }

                formDtos.Add(dto);
            }

            return formDtos;
        }

        private bool CanStartForm(Form form, List<KidFormStatus> formStatuses)
        {
            // הטופס הראשון תמיד ניתן להתחיל (אבל הוא כבר הושלם)
            if (form.IsFirstStep)
                return false; // כבר הושלם

            // טפסים אחרים ניתן להתחיל רק אחרי שהטופס הראשון הושלם
            var firstFormStatus = formStatuses.FirstOrDefault(fs =>
                _formRepository.GetFormById(fs.FormId)?.IsFirstStep == true);

            return firstFormStatus?.FormStatus == "completed";
        }

        private OnboardingStatsDto CalculateStats(List<FormStatusDto> forms, DateTime startDate)
        {
            var completedForms = forms.Count(f => f.Status == "completed" || f.Status == "completed_by_parent");
            var inProgressForms = forms.Count(f => f.Status == "in_progress");
            var notStartedForms = forms.Count(f => f.Status == "not_started");
            var sentToParentForms = forms.Count(f => f.Status == "sent_to_parent");
            var overdueForms = 0; // TODO: חישוב לפי תאריכי יעד

            var nextForm = forms
                .Where(f => f.Status == "not_started" || f.Status == "in_progress")
                .OrderBy(f => f.FormOrder)
                .FirstOrDefault();

            return new OnboardingStatsDto
            {
                TotalForms = forms.Count,
                CompletedForms = completedForms,
                InProgressForms = inProgressForms,
                NotStartedForms = notStartedForms,
                SentToParentForms = sentToParentForms,
                OverdueForms = overdueForms,
                CompletionPercentage = forms.Count > 0 ? (completedForms * 100) / forms.Count : 0,
                NextRecommendedForm = nextForm,
                DaysInProcess = (DateTime.Now - startDate).Days
            };
        }

        private List<OnboardingReminderDto> BuildReminderDtos(List<OnboardingReminder> reminders)
        {
            var reminderDtos = new List<OnboardingReminderDto>();

            foreach (var reminder in reminders.Where(r => !r.IsCompleted))
            {
                var dto = new OnboardingReminderDto
                {
                    ReminderId = reminder.ReminderId,
                    ReminderType = reminder.ReminderType,
                    Title = reminder.Title,
                    Description = reminder.Description,
                    DueDate = reminder.DueDate,
                    IsOverdue = reminder.DueDate.HasValue && reminder.DueDate.Value < DateTime.Now,
                    Priority = 1, // TODO: להוסיף עדיפות לתזכורות
                    FormId = reminder.FormId
                };

                // הוספת שם אחראי
                if (reminder.AssignedTo.HasValue)
                {
                    var employee = _employeeRepository.GetEmployeeById(reminder.AssignedTo.Value);
                    dto.AssignedToName = employee != null ? $"{employee.FirstName} {employee.LastName}" : null;
                }

                // הוספת שם טופס
                if (reminder.FormId.HasValue)
                {
                    var form = _formRepository.GetFormById(reminder.FormId.Value);
                    dto.FormName = form?.FormName;
                }

                reminderDtos.Add(dto);
            }

            return reminderDtos.OrderBy(r => r.DueDate).ToList();
        }

        #endregion
    }
}