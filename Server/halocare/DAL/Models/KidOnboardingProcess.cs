namespace halocare.DAL.Models
{
    public class KidOnboardingProcess
    {
        public int ProcessId { get; set; }
        public int KidId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? CompletionDate { get; set; }
        public string ProcessStatus { get; set; } // NotStarted, InProgress, Completed
        public int CompletionPercentage { get; set; }
        public DateTime LastUpdated { get; set; }

        // נוסיף רשימה של סטטוסי טפסים
        public List<FormStatus> Forms { get; set; } = new List<FormStatus>();
    }

    public class FormStatus
    {
        public int FormId { get; set; }
        public string FormName { get; set; }
        public string FormDescription { get; set; }
        public int FormOrder { get; set; }
        public bool IsFirstStep { get; set; }
        public string Status { get; set; } // not_started, in_progress, completed, sent_to_parent, returned_from_parent
        public DateTime? StartedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime? SentToParentAt { get; set; }
        public int AnsweredQuestions { get; set; }
        public int TotalQuestions { get; set; }
        public bool ByParent { get; set; } // האם מולא על ידי הורה
    }
}