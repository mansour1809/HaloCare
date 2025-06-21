using halocare.DAL.Models;

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

//SENDING FORMS TO PARENTS

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
}

// Request DTOs
public class SendFormToParentRequest
{
    public int KidId { get; set; }
    public int FormId { get; set; }
    public string ParentEmail { get; set; }
}

public class ValidateAccessRequest
{
    public string Token { get; set; }
    public string KidIdNumber { get; set; }
}

public class SubmitParentFormRequest
{
    public string Token { get; set; }
    public List<ParentAnswerDto> Answers { get; set; }
}


public class MedicationEntry
{
    public string MedicationName { get; set; }
    public string Dosage { get; set; }
    public string Times { get; set; }
    public string Notes { get; set; }
}

    public class AllergyEntry
    {
        public string Allergen { get; set; }
        public string Reaction { get; set; }
        public string Severity { get; set; }
        public string Notes { get; set; }
    }

    public class SeizureEntry
    {
        public string SeizureType { get; set; }
        public string Frequency { get; set; }
        public string Triggers { get; set; }
        public string Medications { get; set; }
        public string Notes { get; set; }
    }


    public class MultipleEntryData
    {
        public string Type { get; set; } // "medications", "allergies", "seizures"
        public List<object> Entries { get; set; }
    }

public class CriticalInfoData
{
    public int AnswerId { get; set; }
    public int KidId { get; set; }
    public int FormId { get; set; }
    public int QuestionNo { get; set; }
    public DateTime AnsDate { get; set; }
    public string Answer { get; set; }
    public string? Other { get; set; }
    public int? EmployeeId { get; set; }
    public bool ByParent { get; set; }
    public string? MultipleEntries { get; set; } // JSON string
    public string Category { get; set; }
    public string MultipleEntryType { get; set; }

}