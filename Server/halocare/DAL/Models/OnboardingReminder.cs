namespace halocare.DAL.Models
{
    public class OnboardingReminder
    {
        public int ReminderId { get; set; }
        public int KidId { get; set; }
        public int? FormId { get; set; }
        public string ReminderType { get; set; } // form_deadline, missing_document, parent_followup
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime? DueDate { get; set; }
        public bool IsCompleted { get; set; }
        public DateTime? CompletedAt { get; set; }
        public int? AssignedTo { get; set; }
        public int CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation properties
        public Kid Kid { get; set; }
        public Form Form { get; set; }
        public Employee AssignedEmployee { get; set; }
        public Employee Creator { get; set; }
    }
}
