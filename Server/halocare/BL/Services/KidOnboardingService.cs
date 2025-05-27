using System;
using System.Collections.Generic;
using System.Linq;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using static halocare.DAL.Repositories.KidOnboardingRepository;

namespace halocare.BL.Services
{
    public class KidOnboardingService
    {
        private readonly KidOnboardingRepository _onboardingRepository;
        private readonly FormRepository _formRepository; // אם יש לך אותו
        private readonly KidRepository _kidRepository;

        public KidOnboardingService(IConfiguration configuration)
        {
            _onboardingRepository = new KidOnboardingRepository(configuration);
            _formRepository = new FormRepository(configuration); // אם יש
            _kidRepository = new KidRepository(configuration);
        }

        public int StartOnboardingProcess(int kidId)
        {
            // בדיקה שהילד קיים
            Kid kid = _kidRepository.GetKidById(kidId);
            if (kid == null)
            {
                throw new ArgumentException("הילד לא נמצא במערכת");
            }

            // בדיקה שאין כבר תהליך פעיל
            var existingProcess = _onboardingRepository.GetOnboardingProcess(kidId);
            if (existingProcess != null)
            {
                throw new InvalidOperationException("כבר קיים תהליך קליטה לילד זה");
            }

            return _onboardingRepository.CreateOnboardingProcess(kidId);
        }

        public KidOnboardingStatus GetOnboardingStatus(int kidId)
        {
            var process = _onboardingRepository.GetOnboardingProcess(kidId);
            if (process == null)
            {
                throw new ArgumentException("לא נמצא תהליך קליטה לילד זה");
            }

            var allForms = _onboardingRepository.GetOnboardingForms();
            var completedForms = GetCompletedFormsFromJson(process.CompletedStepsJson);

            var formStatuses = allForms.Select(form => new OnboardingFormStatus
            {
                Form = form,
                Status = GetFormStatus(form.FormId, process.CurrentStepFormId, completedForms),
                CanAccess = CanAccessForm(form.FormId, completedForms, form.IsFirstStep)
            }).ToList();

            return new KidOnboardingStatus
            {
                Process = process,
                Forms = formStatuses,
                CompletionPercentage = CalculateCompletionPercentage(completedForms.Count, allForms.Count)
            };
        }

        public bool CompleteFormStep(int kidId, int formId)
        {
            var process = _onboardingRepository.GetOnboardingProcess(kidId);
            if (process == null)
            {
                throw new ArgumentException("לא נמצא תהליך קליטה לילד זה");
            }

            // עדכון התקדמות
            return _onboardingRepository.UpdateOnboardingProgress(kidId, formId);
        }

        public List<KidWithOnboardingInfo> GetKidsWithIncompleteOnboarding()
        {
            return _onboardingRepository.GetKidsWithIncompleteOnboarding();
        }

        public List<Form> GetAvailableForms()
        {
            return _onboardingRepository.GetOnboardingForms();
        }

        // Helper methods
        private List<int> GetCompletedFormsFromJson(string json)
        {
            if (string.IsNullOrEmpty(json)) return new List<int>();

            try
            {
                var completedForms = JsonConvert.DeserializeObject<Dictionary<string, string>>(json);
                return completedForms
                    .Where(kv => kv.Value == "completed")
                    .Select(kv => int.Parse(kv.Key))
                    .ToList();
            }
            catch
            {
                return new List<int>();
            }
        }

        private string GetFormStatus(int formId, int? currentStepFormId, List<int> completedForms)
        {
            if (completedForms.Contains(formId))
                return "completed";

            if (formId == currentStepFormId)
                return "current";

            return "not_started";
        }

        private bool CanAccessForm(int formId, List<int> completedForms, bool isFirstStep)
        {
            // הטופס הראשון תמיד נגיש
            if (isFirstStep) return true;

            // שאר הטפסים נגישים רק אחרי שהראשון הושלם
            var firstFormCompleted = completedForms.Any(); // אם יש טפסים שהושלמו, הראשון בוודאי הושלם
            return firstFormCompleted;
        }

        private int CalculateCompletionPercentage(int completedCount, int totalCount)
        {
            if (totalCount == 0) return 0;
            return (int)Math.Round((double)completedCount / totalCount * 100);
        }
    }
}