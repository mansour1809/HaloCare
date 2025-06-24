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
            // Verify that the form has a name
            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.AddForm(form);
        }

        public bool UpdateForm(Form form)
        {
            // Verify that the form exists
            Form existingForm = _formRepository.GetFormById(form.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // Verify that the form has a name
            if (string.IsNullOrEmpty(form.FormName))
            {
                throw new ArgumentException("חובה לציין שם לטופס");
            }

            return _formRepository.UpdateForm(form);
        }

        public bool DeleteForm(int id)
        {
            // Verify that the form exists
            Form existingForm = _formRepository.GetFormById(id);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // Check if the form contains questions
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
            // Verify that the form exists
            Form existingForm = _formRepository.GetFormById(question.FormId);
            if (existingForm == null)
            {
                throw new ArgumentException("הטופס לא נמצא במערכת");
            }

            // Verify that the question number is not already used
            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion != null)
            {
                throw new ArgumentException("כבר קיימת שאלה עם המספר הזה בטופס");
            }

            // Verify that there is question text
            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            // If the question is not open, verify that possible values are set
            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.AddQuestion(question);
        }

        public bool UpdateQuestion(Question question)
        {
            // Verify that the question exists
            Question existingQuestion = _questionRepository.GetQuestion(question.FormId, question.QuestionNo);
            if (existingQuestion == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // Verify that there is question text
            if (string.IsNullOrEmpty(question.QuestionText))
            {
                throw new ArgumentException("חובה לציין טקסט לשאלה");
            }

            // If the question is not open, verify that possible values are set
            if (!question.IsOpen && string.IsNullOrEmpty(question.PossibleValues))
            {
                throw new ArgumentException("חובה לציין ערכים אפשריים לשאלה שאינה פתוחה");
            }

            return _questionRepository.UpdateQuestion(question);
        }

        public bool DeleteQuestion(int formId, int questionNo)
        {
            // Verify that the question exists
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
            // Verify that the kid exists
            Kid kid = _kidRepository.GetKidById(answer.KidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // Verify that the question exists
            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // If employee is specified, verify that the employee exists
            if (answer.EmployeeId.HasValue)
            {
                Employee employee = _employeeRepository.GetEmployeeById(answer.EmployeeId.Value);
                if (employee == null)
                {
                    throw new ArgumentException("העובד המדווח לא נמצא במערכת");
                }
            }

            // Verify that an answer was entered
            if (string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה");
            }

            // If the question is mandatory, verify that the answer is not empty
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            // If the question is not open, verify the answer is among possible values
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

                // If "Other" option exists, the answer is valid if it equals "Other"
                if (question.HasOther && answer.Answer.Trim().Equals("אחר", StringComparison.OrdinalIgnoreCase))
                {
                    validAnswer = true;

                    // Verify that a value was entered for the "Other" answer
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

            // Set the answer date if not set
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
            // Verify that the answer exists
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answer.AnswerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            // Verify that the question exists
            Question question = _questionRepository.GetQuestion(answer.FormId, answer.QuestionNo);
            if (question == null)
            {
                throw new ArgumentException("השאלה לא נמצאה במערכת");
            }

            // If the question is mandatory, verify that the answer is not empty
            if (question.IsMandatory && string.IsNullOrEmpty(answer.Answer))
            {
                throw new ArgumentException("חובה להזין תשובה לשאלת חובה");
            }

            // If the question is not open, verify the answer is among possible values
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

                // If "Other" option exists, the answer is valid if it equals "Other"
                if (question.HasOther && answer.Answer.Trim().Equals("אחר", StringComparison.OrdinalIgnoreCase))
                {
                    validAnswer = true;

                    // Verify that a value was entered for the "Other" answer
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

            // Update the answer
            bool result = _answerRepository.UpdateAnswer(answer);

            if (result)
            {
                _onboardingService.CheckFormCompletion(answer.KidId, answer.FormId);
            }

            return result;
        }

        public bool DeleteAnswer(int answerId)
        {
            // Verify that the answer exists
            AnswerToQuestion existingAnswer = _answerRepository.GetAnswerById(answerId);
            if (existingAnswer == null)
            {
                throw new ArgumentException("התשובה לא נמצאה במערכת");
            }

            return _answerRepository.DeleteAnswer(answerId);
        }

        public List<CriticalInfoData> GetCriticalMedicalInfo(int kidId)
        {
            return _answerRepository.GetCriticalMedicalInfo(kidId);
        }

    }
}
