// BL/Services/FormService.cs - עדכון לאינטגרציה עם תהליך קליטה
using System;
using System.Collections.Generic;
using System.Linq;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class FormService
    {
        private readonly FormRepository _formRepository;
        private readonly QuestionRepository _questionRepository;
        private readonly AnswerToQuestionRepository _answerRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly KidOnboardingService _onboardingService; // הוספה חדשה

        public FormService(IConfiguration configuration)
        {
            _formRepository = new FormRepository(configuration);
            _questionRepository = new QuestionRepository(configuration);
            _answerRepository = new AnswerToQuestionRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
            _onboardingService = new KidOnboardingService(configuration); // הוספה חדשה
        }

        // מתודות קיימות
        public List<Form> GetAllForms()
        {
            return _formRepository.GetAllForms();
        }

        public Form GetFormById(int id)
        {
            return _formRepository.GetFormById(id);
        }

        public int AddForm(Form form)
        {
            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.AddForm(form);
        }

        public bool UpdateForm(Form form)
        {
            Form existingForm = _formRepository.GetFormById(form.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.UpdateForm(form);
        }

        public bool DeleteForm(int id)
        {
            Form existingForm = _formRepository.GetFormById(id);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            List<Question> questions = _questionRepository.GetQuestionsByFormId(id);
            if (questions.Count > 0)
            {
                throw new ArgumentException("לא ניתן למחוק טופס שיש בו שאלות");
            }

            return _formRepository.DeleteForm(id);
        }

        public List<Question> GetFormQuestions(int formId)
        {
            return _questionRepository.GetQuestionsByFormId(formId);
        }

        public bool AddQuestion(Question question)
        {
            Form existingForm = _formRepository.GetFormById(question.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion != null)
            {
                throw new ArgumentException("כבר קיימת שאלה עם המספר הזה בטופס");
            }

            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.AddQuestion(question);
        }

        public bool UpdateQuestion(Question question)
        {
            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.UpdateQuestion(question);
        }

        public bool DeleteQuestion(int formId, int questionNo)
        {
            Question existingQuestion = _questionRepository.GetQuestion(formId, questionNo);
            if (existingQuestion == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            return _questionRepository.DeleteQuestion(formId, questionNo);
        }

        public List<AnswerToQuestion> GetFormAnswers(int kidId, int formId)
        {
            return _answerRepository.GetAnswersByKidAndForm(kidId, formId);
        }

        // **מתודה מעודכנת - עם אינטגרציה לתהליך קליטה**
        public int AddAnswer(AnswerToQuestion answer)
        {
            // בדיקות קיימות
            Kid kid = _kidRepository.GetKidById(answer.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            if (answer.EmployeeId.HasValue)
            {
                Employee employee = _employeeRepository.GetEmployeeById(answer.EmployeeId.Value);
                if (employee == null)
                {
                    throw new ArgumentException("העובד המדווח לא נמצא במערכת");
                }
            }

            if (string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה");
            }

            // בדיקות נוספות כמו קודם...
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            if (!question.IsOpen && !string.IsNullOrEmpty(question.PossibleValues))
            {
                string[] possibleValues = question.PossibleValues.Split(',');
                bool validAnswer = false;

                foreach (string value in possibleValues)
                {
                    if (answer.Answer.Trim().Equals(value.Trim(), StringComparison.OrdinalIgnoreCase))
                    {
                        validAnswer = true;
                        break;
                    }
                }

                if (question.HasOther && answer.Answer.Trim().Equals("אחר", StringComparison.OrdinalIgnoreCase))
                {
                    validAnswer = true;
                    if (string.IsNullOrEmpty(answer.Other))
                    {
                        throw new ArgumentException("חובה להזין ערך לתשובה 'אחר'");
                    }
                }

                if (!validAnswer)
                {
                    throw new ArgumentException("התשובה אינה אחד מהערכים האפשריים");
                }
            }

            if (answer.AnsDate == DateTime.MinValue)
            {
                answer.AnsDate = DateTime.Now;
            }

            // שמירת התשובה
            int answerId = _answerRepository.AddAnswer(answer);

            // **עדכון חדש: עדכון תהליך קליטה**
            try
            {
                // עדכון התקדמות הטופס בתהליך הקליטה
                _onboardingService.UpdateFormProgress(answer.KidId, answer.FormId);

                // בדיקה האם הטופס הושלם
                var questions = _questionRepository.GetQuestionsByFormId(answer.FormId);
                var answers = _answerRepository.GetAnswersByKidAndForm(answer.KidId, answer.FormId);
                var answeredQuestions = answers.Where(a => !string.IsNullOrEmpty(a.Answer)).Count();

                // אם כל השאלות נענו, סמן כהושלם
                if (answeredQuestions == questions.Count)
                {
                    _onboardingService.CompleteForm(answer.KidId, answer.FormId);
                }
            }
            catch (Exception ex)
            {
                // לוג השגיאה אבל אל תכשיל את שמירת התשובה
                Console.WriteLine($"Warning: Failed to update onboarding progress: {ex.Message}");
            }

            return answerId;
        }

        // **מתודה מעודכנת - עם אינטגרציה לתהליך קליטה**
        public bool UpdateAnswer(AnswerToQuestion answer)
        {
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answer.AnswerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // בדיקות נוספות...
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            // עדכון התשובה
            bool success = _answerRepository.UpdateAnswer(answer);

            // **עדכון חדש: עדכון תהליך קליטה**
            if (success)
            {
                try
                {
                    _onboardingService.UpdateFormProgress(answer.KidId, answer.FormId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Failed to update onboarding progress: {ex.Message}");
                }
            }

            return success;
        }

        public bool DeleteAnswer(int answerId)
        {
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            bool success = _answerRepository.DeleteAnswer(answerId);

            // **עדכון חדש: עדכון תהליך קליטה אחרי מחיקה**
            if (success)
            {
                try
                {
                    _onboardingService.UpdateFormProgress(existingAnswer.KidId, existingAnswer.FormId);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Failed to update onboarding progress: {ex.Message}");
                }
            }

            return success;
        }

        // **מתודות חדשות לאינטגרציה עם תהליך קליטה**

        /// <summary>
        /// קבלת טופס עם סטטוס קליטה
        /// </summary>
        public object GetFormWithOnboardingStatus(int formId, int kidId)
        {
            var form = GetFormById(formId);
            if (form == null)
            {
                throw new ArgumentException("הטופס לא נמצא");
            }

            var questions = GetFormQuestions(formId);
            var answers = GetFormAnswers(kidId, formId);

            // קבלת סטטוס מתהליך הקליטה
            var onboardingStatus = _onboardingService.GetOnboardingStatus(kidId);
            var formStatus = onboardingStatus?.Forms.FirstOrDefault(f => f.FormId == formId);

            return new
            {
                Form = form,
                Questions = questions,
                Answers = answers,
                OnboardingStatus = formStatus,
                CanEdit = formStatus?.Status != "completed",
                IsRequired = !form.IsFirstStep,
                CompletionPercentage = formStatus?.CompletionPercentage ?? 0
            };
        }

        /// <summary>
        /// התחלת מילוי טופס (מעדכן גם את תהליך הקליטה)
        /// </summary>
        public bool StartFormFilling(int kidId, int formId, int? assignedTo = null)
        {
            try
            {
                return _onboardingService.StartForm(kidId, formId, assignedTo);
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בהתחלת מילוי טופס: {ex.Message}");
            }
        }

        /// <summary>
        /// שליחת טופס להורים
        /// </summary>
        public bool SendFormToParent(int kidId, int formId)
        {
            try
            {
                return _onboardingService.SendFormToParent(kidId, formId);
            }
            catch (Exception ex)
            {
                throw new Exception($"שגיאה בשליחת טופס להורים: {ex.Message}");
            }
        }
    }
}