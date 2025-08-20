using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

namespace halocare.BL.Services
{
    public class ParentFormService
    {
        private readonly KidRepository _kidRepository;
        private readonly FormService _formService;
        private readonly AnswerToQuestionRepository _answerRepository;
        private readonly KidOnboardingService _onboardingService;
        private readonly EmailService _emailService;
        private readonly ParentService _parentService;
        private readonly IConfiguration _configuration;

        public ParentFormService(
            KidRepository kidRepository,
            FormService formService,
            AnswerToQuestionRepository answerRepository,
            KidOnboardingService onboardingService,
            EmailService emailService,
            ParentService parentService,
            IConfiguration configuration)
        {
            _kidRepository = kidRepository;
            _formService = formService;
            _answerRepository = answerRepository;
            _onboardingService = onboardingService;
            _emailService = emailService;
            _parentService = parentService;
            _configuration = configuration;
        }

        public async Task<bool> SendFormToParent(int kidId, int formId, string parentEmail)
        {
            try
            {
                // Get kid and form details
                Kid kid = _kidRepository.GetKidById(kidId);
                Form form = _formService.GetFormById(formId);
                Parent parent = _parentService.GetParentById(kid.ParentId1!.Value);

                if (kid == null || form == null) return false;

                // Generate secure token
                var token = GenerateSecureToken(kidId, formId);

                // Create link
                var baseUrl = _configuration["AppSettings:ClientUrl"];
                var parentFormUrl = $"{baseUrl}/#/parent-form/{token}";

                // Get parent's name
                var parentName = parent?.FirstName ?? "הורה יקר";

                // Send email
                var emailSent = await _emailService.SendFormToParent(
                    parentEmail,
                    parentName,
                    $"{kid.FirstName} {kid.LastName}",
                    form.FormName,
                    parentFormUrl,
                    kid.Id.ToString()
                );

                if (emailSent)
                {
                    // Update form status to "SentToParent"
                    _onboardingService.UpdateFormStatus(kidId, formId, "SentToParent",
                        notes: $"נשלח להורה בתאריך {DateTime.Now:dd/MM/yyyy} למייל: {parentEmail}");
                }

                return emailSent;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"שגיאה בשליחת טופס להורה: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> ValidateParentAccess(string token, string kidIdNumber)
        {
            try
            {
                // Decode token
                var tokenData = DecryptToken(token);
                if (tokenData == null || tokenData.ExpiresAt < DateTime.Now)
                    return false;

                // Get kid details
                var kid = _kidRepository.GetKidById(tokenData.KidId);
                if (kid == null) return false;

                // Validate ID number
                return kid.Id.ToString() == kidIdNumber.Trim();
            }
            catch
            {
                return false;
            }
        }

        public async Task<ParentFormData> GetParentFormData(string token)
        {
            var tokenData = DecryptToken(token);
            if (tokenData == null) return null;

            // Get kid, form, and existing answers data
            var kid = _kidRepository.GetKidById(tokenData.KidId);
            var form = _formService.GetFormById(tokenData.FormId);
            var questions = _formService.GetFormQuestions(tokenData.FormId);
            var existingAnswers = _answerRepository.GetAnswersByKidAndForm(tokenData.KidId, tokenData.FormId);

            return new ParentFormData
            {
                Kid = kid,
                Form = form,
                Questions = questions,
                ExistingAnswers = existingAnswers,
                Token = token
            };
        }

        public async Task<bool> SaveParentFormAnswers(string token, List<ParentAnswerDto> answers)
        {
            try
            {
                var tokenData = DecryptToken(token);
                if (tokenData == null || tokenData.ExpiresAt < DateTime.Now)
                    return false;

                // Save answers
                foreach (var answer in answers)
                {
                    // Convert complex data to JSON
                    string multipleEntriesJson = null;
                    if (answer.MultipleEntries != null && answer.MultipleEntries.Count > 0)
                    {
                        multipleEntriesJson = System.Text.Json.JsonSerializer.Serialize(answer.MultipleEntries);
                    }

                    var answerData = new AnswerToQuestion
                    {
                        KidId = tokenData.KidId,
                        FormId = tokenData.FormId,
                        QuestionNo = answer.QuestionNo,
                        Answer = answer.Answer,
                        Other = answer.Other,
                        AnsDate = DateTime.Now,
                        ByParent = true,
                        EmployeeId = null,
                        MultipleEntries = multipleEntriesJson // added
                    };

                    // Check if answer exists - update or add
                    var existingAnswer = _answerRepository.GetAnswerByKidFormQuestion(
                        tokenData.KidId, tokenData.FormId, answer.QuestionNo);

                    if (existingAnswer != null)
                    {
                        answerData.AnswerId = existingAnswer.AnswerId;
                        _answerRepository.UpdateAnswer(answerData);
                    }
                    else
                    {
                        _answerRepository.AddAnswer(answerData);
                    }
                }

                _onboardingService.CheckFormCompletion(tokenData.KidId, tokenData.FormId);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"שגיאה בשמירת תשובות הורה: {ex.Message}");
                return false;
            }
        }

        // Helper functions for token
        private string GenerateSecureToken(int kidId, int formId)
        {
            var data = new TokenData
            {
                KidId = kidId,
                FormId = formId,
                CreatedAt = DateTime.Now,
                ExpiresAt = DateTime.Now.AddDays(7)
            };

            var json = Newtonsoft.Json.JsonConvert.SerializeObject(data);
            var key = _configuration["AppSettings:TokenEncryptionKey"];
            return Convert.ToBase64String(System.Text.Encoding.UTF8.GetBytes(json + "|" + key));
        }

        private TokenData DecryptToken(string token)
        {
            try
            {
                var decoded = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
                var parts = decoded.Split('|');
                var json = parts[0];
                var key = parts[1];

                if (key != _configuration["AppSettings:TokenEncryptionKey"])
                    return null;

                return Newtonsoft.Json.JsonConvert.DeserializeObject<TokenData>(json);
            }
            catch
            {
                return null;
            }
        }
    }

    // DTOs 
    public class TokenData
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class ParentFormData
    {
        public Kid Kid { get; set; }
        public Form Form { get; set; }
        public List<Question> Questions { get; set; }
        public List<AnswerToQuestion> ExistingAnswers { get; set; }
        public string Token { get; set; }
    }

    public class ParentAnswerDto
    {
        public int QuestionNo { get; set; }
        public string Answer { get; set; }
        public string Other { get; set; }
        public List<Dictionary<string, object>>? MultipleEntries { get; set; } // added
    }
}
