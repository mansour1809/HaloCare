namespace halocare.DAL.Models
{
    public class KidOnboardingProcess
    {
        public int Id { get; set; }
        public int KidId { get; set; }
        public int? CurrentStepFormId { get; set; }
        public string ProcessStatus { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime LastUpdatedDate { get; set; }
        public string CompletedStepsJson { get; set; }
        public bool IsCompleted { get; set; }
        public string Notes { get; set; }

        // Navigation properties (אופציונלי - לנוחות)
        public string KidName { get; set; }
    }
}