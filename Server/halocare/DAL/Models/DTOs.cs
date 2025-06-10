public class KidOnboardingStatusDto
{
    public int KidId { get; set; }
    public List<FormStatusDto> Forms { get; set; }
    public string OverallStatus { get; set; }
    public int CompletedForms { get; set; }
    public int TotalForms { get; set; }
}

public class FormStatusDto
{
    public int FormId { get; set; }
    public string FormName { get; set; }
    public string FormDescription { get; set; }
    public int FormOrder { get; set; }
    public string Status { get; set; } // NotStarted, InProgress, Completed, SentToParent, CompletedByParent
    public DateTime? StartDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public int TotalQuestions { get; set; }
    public int AnsweredQuestions { get; set; }
}