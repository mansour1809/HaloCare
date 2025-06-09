namespace halocare.DAL.Models
{
    public class KidFormStatus
    {
        public int StatusId { get; set; }
        public int KidId { get; set; }
        public int FormId { get; set; }
        public string FormStatus { get; set; } // not_started, in_progress, completed, sent_to_parent, completed_by_parent, skipped, not_applicable
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SentToParentAt { get; set; }
        public DateTime LastUpdated { get; set; }
        public int AnsweredQuestions { get; set; }
        public int TotalQuestions { get; set; }
        public int CompletionPercentage { get; set; }
        public int? AssignedTo { get; set; }
        public int Priority { get; set; } = 1;
        public string Notes { get; set; }

        // Navigation properties
        public Kid Kid { get; set; }
        public Form Form { get; set; }
        public Employee AssignedEmployee { get; set; }
    }
}