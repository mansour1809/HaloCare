namespace halocare.DAL.Models
{
    public class KidOnboardingProcess
    {
        public int ProcessId { get; set; }
        public int KidId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public DateTime LastUpdated { get; set; }
        public string ProcessStatus { get; set; } // NotStarted, InProgress, Completed, Paused
        public int CompletionPercentage { get; set; }
        public int? CreatedBy { get; set; }
        public string Notes { get; set; }

        // Navigation properties
        public Kid Kid { get; set; }
        public Employee Creator { get; set; }
        public List<KidFormStatus> FormStatuses { get; set; } = new List<KidFormStatus>();
    }
}