using System;
using System.Collections.Generic;
using halocare.DAL.Repositories;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;
using System.Data;

namespace halocare.BL.Services
{
    public class FormService
    {
        private readonly FormRepository _formRepository;
        private readonly QuestionRepository _questionRepository;
        private readonly AnswerToQuestionRepository _answerRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;
        private readonly KidOnboardingService _onboardingService;

        public FormService(IConfiguration configuration)
        {
            _formRepository = new FormRepository(configuration);
            _questionRepository = new QuestionRepository(configuration);
            _answerRepository = new AnswerToQuestionRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
            var onboardingRepository = new KidOnboardingRepository(configuration);
            _onboardingService = new KidOnboardingService(onboardingRepository);
        }

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
            // וידוא שיש שם טופס
            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.AddForm(form);
        }

        public bool UpdateForm(Form form)
        {
            // וידוא שהטופס קיים
            Form existingForm = _formRepository.GetFormById(form.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // וידוא שיש שם טופס
            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.UpdateForm(form);
        }

        public bool DeleteForm(int id)
        {
            // וידוא שהטופס קיים
            Form existingForm = _formRepository.GetFormById(id);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // בדיקה אם יש שאלות בטופס
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
            // וידוא שהטופס קיים
            Form existingForm = _formRepository.GetFormById(question.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // וידוא שהשאלה אינה כבר קיימת
            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion != null)
            {
                throw new ArgumentException("כבר קיימת שאלה עם המספר הזה בטופס");
            }

            // וידוא שיש טקסט שאלה
            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            // אם השאלה אינה פתוחה, וידוא שיש ערכים אפשריים
            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.AddQuestion(question);
        }

        public bool UpdateQuestion(Question question)
        {
            // וידוא שהשאלה קיימת
            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // וידוא שיש טקסט שאלה
            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            // אם השאלה אינה פתוחה, וידוא שיש ערכים אפשריים
            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.UpdateQuestion(question);
        }

        public bool DeleteQuestion(int formId, int questionNo)
        {
            // וידוא שהשאלה קיימת
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

        public int AddAnswer(AnswerToQuestion answer)
        {
            // וידוא שהילד קיים
            Kid kid = _kidRepository.GetKidById(answer.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // וידוא שהשאלה קיימת
            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // אם העובד צוין, וידוא שהוא קיים
            if (answer.EmployeeId.HasValue)
            {
                Employee employee = _employeeRepository.GetEmployeeById(answer.EmployeeId.Value);
                if (employee == null)
                {
                    throw new ArgumentException("העובד המדווח לא נמצא במערכת");
                }
            }

            // וידוא שהתשובה הוזנה
            if (string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה");
            }

            // אם השאלה חובה, וידוא שהתשובה אינה ריקה
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            // אם השאלה אינה פתוחה, וידוא שהתשובה היא מהערכים האפשריים
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

                // אם יש אפשרות "אחר", התשובה תקינה גם אם היא "אחר"
                if (question.HasOther && answer.Answer.Trim().Equals("אחר", StringComparison.OrdinalIgnoreCase))
                {
                    validAnswer = true;

                    // וידוא שיש ערך לתשובה "אחר"
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

            // הגדרת תאריך התשובה
            if (answer.AnsDate == DateTime.MinValue)
            {
                answer.AnsDate = DateTime.Now;
            }

            int answerId = _answerRepository.AddAnswer(answer);

            _onboardingService.CheckFormCompletion(answer.KidId, answer.FormId);

            return answerId;
        }

        public bool UpdateAnswer(AnswerToQuestion answer)
        {
            // וידוא שהתשובה קיימת
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answer.AnswerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            // וידוא שהשאלה קיימת
            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // אם השאלה חובה, וידוא שהתשובה אינה ריקה
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            // אם השאלה אינה פתוחה, וידוא שהתשובה היא מהערכים האפשריים
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

                // אם יש אפשרות "אחר", התשובה תקינה גם אם היא "אחר"
                if (question.HasOther && answer.Answer.Trim().Equals("אחר", StringComparison.OrdinalIgnoreCase))
                {
                    validAnswer = true;

                    // וידוא שיש ערך לתשובה "אחר"
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

            // עדכון התשובה
            bool result = _answerRepository.UpdateAnswer(answer);

            if (result)
            {
                _onboardingService.CheckFormCompletion(answer.KidId, answer.FormId);
            }

            return result;
        }

        public bool DeleteAnswer(int answerId)
        {
            // וידוא שהתשובה קיימת
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            return _answerRepository.DeleteAnswer(answerId);
        }

        public List<AnswerToQuestion> GetCriticalMedicalInfo(int kidId)
        {
            return _answerRepository.GetCriticalMedicalInfo(kidId);
        }
       
    }
}