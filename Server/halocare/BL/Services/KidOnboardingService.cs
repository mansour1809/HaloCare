// KidOnboardingService.cs - גרסה מלאה
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using halocare.DAL.Models;
using halocare.DAL.Repositories;


namespace halocare.BL.Services
{
    public class KidOnboardingService
    {
        private readonly KidOnboardingRepository _onboardingRepository;
        private readonly FormRepository _formRepository;
        private readonly QuestionRepository _questionRepository;
        private readonly AnswerToQuestionRepository _answerRepository;

        public KidOnboardingService(IConfiguration configuration)
        {
            _onboardingRepository = new KidOnboardingRepository(configuration);
            _formRepository = new FormRepository(configuration);
            _questionRepository = new QuestionRepository(configuration);
            _answerRepository = new AnswerToQuestionRepository(configuration);
        }

        public async Task<KidOnboardingProcess> GetOnboardingStatus(int kidId)
        {
            // בדיקה אם קיים תהליך, אם לא - יצירה
            var process = _onboardingRepository.GetProcessByKidId(kidId);
            if (process == null)
            {
                // יצירת תהליך חדש
                var processId = _onboardingRepository.CreateProcess(kidId);
                process = _onboardingRepository.GetProcessByKidId(kidId);
            }

            // קבלת כל הטפסים הזמינים
            var allForms = GetAvailableForms()
                .OrderBy(f => f.FormOrder)
                .ToList();

            // בניית סטטוס לכל טופס
            var formStatuses = new List<FormStatus>();
            
            foreach (var form in allForms)
            {
                var questions = _questionRepository.GetQuestionsByFormId(form.FormId);
                var answers = _answerRepository.GetAnswersByKidAndForm(kidId, form.FormId);
                
                var formStatus = new FormStatus
                {
                    FormId = form.FormId,
                    FormName = form.FormName,
                    FormDescription = form.FormDescription,
                    FormOrder = form.FormOrder ?? 0,
                    IsFirstStep = form.IsFirstStep,
                    TotalQuestions = questions.Count,
                    AnsweredQuestions = answers.Count,
                };

                // קביעת סטטוס הטופס
                if (answers.Count == 0)
                {
                    formStatus.Status = "not_started";
                }
                else if (answers.Count < questions.Count)
                {
                    formStatus.Status = "in_progress";
                    formStatus.StartedAt = answers.Min(a => a.AnsDate);
                }
                else
                {
                    formStatus.Status = "completed";
                    formStatus.StartedAt = answers.Min(a => a.AnsDate);
                    formStatus.CompletedAt = answers.Max(a => a.AnsDate);
                    
                    // בדיקה אם נשלח להורים
                    if (answers.Any(a => a.ByParent))
                    {
                        formStatus.Status = "returned_from_parent";
                        formStatus.ByParent = true;
                    }
                }

                formStatuses.Add(formStatus);
            }

            // עדכון הנתונים הכלליים
            process.Forms = formStatuses;
            
            var totalForms = formStatuses.Count;
            var completedForms = formStatuses.Count(f => 
                f.Status == "completed" || f.Status == "returned_from_parent");
            
            process.CompletionPercentage = totalForms > 0 ? 
                (int)Math.Round((double)completedForms / totalForms * 100) : 0;
            
            // עדכון סטטוס התהליך הכללי
            var oldStatus = process.ProcessStatus;
            
            if (completedForms == 0)
            {
                process.ProcessStatus = "NotStarted";
            }
            else if (completedForms == totalForms)
            {
                process.ProcessStatus = "Completed";
                if (!process.CompletionDate.HasValue)
                {
                    process.CompletionDate = DateTime.Now;
                }
            }
            else
            {
                process.ProcessStatus = "InProgress";
            }

            // שמירת עדכונים אם השתנה משהו
            if (oldStatus != process.ProcessStatus || 
                !_onboardingRepository.ProcessExists(kidId))
            {
                _onboardingRepository.UpdateProcess(process);
            }

            return process;
        }

        public async Task<bool> MarkFormAsCompleted(int kidId, int formId)
        {
            // בדיקה שהטופס באמת הושלם (יש תשובות לכל השאלות החובה)
            var questions = _questionRepository.GetQuestionsByFormId(formId);
            var mandatoryQuestions = questions.Where(q => q.IsMandatory).ToList();
            var answers = _answerRepository.GetAnswersByKidAndForm(kidId, formId);
            
            var answeredMandatory = answers.Where(a => 
                mandatoryQuestions.Any(q => q.QuestionNo == a.QuestionNo) && 
                !string.IsNullOrEmpty(a.Answer)
            ).ToList();

            if (answeredMandatory.Count < mandatoryQuestions.Count)
            {
                throw new ArgumentException("לא ניתן להשלים טופס ללא מענה לכל השאלות החובה");
            }

            // רענון סטטוס התהליך
            await GetOnboardingStatus(kidId);
            
            return true;
        }

        public async Task<bool> SendFormToParent(int kidId, int formId)
        {
            // כאן תהיה הלוגיקה לשליחת הטופס להורים
            // לעת עתה נחזיר true
            
            // TODO: הוספת לוגיקה לשליחת מייל/SMS להורים
            // TODO: יצירת קישור מיוחד לטופס
            // TODO: עדכון סטטוס הטופס ל-"sent_to_parent"
            
            return true;
        }

        public List<Form> GetAvailableForms()
        {
            return _formRepository.GetAllForms();
        }

        public async Task<KidOnboardingProcess> StartOnboardingProcess(int kidId)
        {
            // בדיקה אם כבר קיים תהליך
            var existingProcess = _onboardingRepository.GetProcessByKidId(kidId);
            if (existingProcess != null)
            {
                return await GetOnboardingStatus(kidId);
            }

            // יצירת תהליך חדש
            var processId = _onboardingRepository.CreateProcess(kidId);
            return await GetOnboardingStatus(kidId);
        }
    }
}