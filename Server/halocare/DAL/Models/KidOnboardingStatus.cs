namespace halocare.DAL.Models
{
    public class KidOnboardingStatus
    {
        public KidOnboardingProcess Process { get; set; }
        public List<OnboardingFormStatus> Forms { get; set; }
        public int CompletionPercentage { get; set; }
    }

    public class OnboardingFormStatus
    {
        public Form Form { get; set; }
        public string Status { get; set; } // "completed", "current", "not_started"
        public bool CanAccess { get; set; } // האם יכול לגשת לטופס הזה
    }
}