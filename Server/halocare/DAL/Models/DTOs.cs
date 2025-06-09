// DTOs for API responses
namespace halocare.DAL.Models
{
    public class OnboardingStatusDto
    {
        public ProcessInfoDto Process { get; set; }
        public List<FormStatusDto> Forms { get; set; }
        public OnboardingStatsDto Stats { get; set; }
        public List<OnboardingReminderDto> Reminders { get; set; }
    }

    public class ProcessInfoDto
    {
        public int ProcessId { get; set; }
        public int KidId { get; set; }
        public string KidName { get; set; }
        public string ProcessStatus { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public DateTime LastUpdated { get; set; }
        public int CompletionPercentage { get; set; }
        public string Notes { get; set; }
        public string CreatedByName { get; set; }
    }

    public class FormStatusDto
    {
        public int FormId { get; set; }
        public string FormName { get; set; }
        public string FormDescription { get; set; }
        public int FormOrder { get; set; }
        public bool IsFirstStep { get; set; }
        public string Status { get; set; }
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SentToParentAt { get; set; }
        public int AnsweredQuestions { get; set; }
        public int TotalQuestions { get; set; }
        public int CompletionPercentage { get; set; }
        public int Priority { get; set; }
        public string AssignedToName { get; set; }
        public string Notes { get; set; }
        public bool CanStart { get; set; } // האם ניתן להתחיל טופס זה כעת
        public bool IsRequired { get; set; } // האם טופס חובה
    }

    public class OnboardingStatsDto
    {
        public int TotalForms { get; set; }
        public int CompletedForms { get; set; }
        public int InProgressForms { get; set; }
        public int NotStartedForms { get; set; }
        public int SentToParentForms { get; set; }
        public int OverdueForms { get; set; }
        public int CompletionPercentage { get; set; }
        public FormStatusDto NextRecommendedForm { get; set; }
        public int DaysInProcess { get; set; }
    }

    public class OnboardingReminderDto
    {
        public int ReminderId { get; set; }
        public string ReminderType { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsOverdue { get; set; }
        public int Priority { get; set; }
        public string AssignedToName { get; set; }
        public int? FormId { get; set; }
        public string FormName { get; set; }
    }
}