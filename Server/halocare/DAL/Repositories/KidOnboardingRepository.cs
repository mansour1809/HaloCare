// Interface
using halocare.DAL;
using System.Data;

public interface IKidOnboardingRepository
{
    bool InitializeKidOnboarding(int kidId);
    KidOnboardingStatusDto GetKidOnboardingStatus(int kidId);
    bool UpdateFormStatus(int kidId, int formId, string newStatus, int? completedBy = null, string notes = null);
    void CheckFormCompletion(int kidId, int formId);
}

// Implementation
public class KidOnboardingRepository : DBService, IKidOnboardingRepository
{
    public KidOnboardingRepository(IConfiguration configuration) : base(configuration) { }

    public bool InitializeKidOnboarding(int kidId)
    {
        try
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            ExecuteNonQuery("SP_InitializeKidOnboarding", parameters);
            return true;
        }
        catch (Exception ex)
        {
            // Log error
            return false;
        }
    }

    public KidOnboardingStatusDto GetKidOnboardingStatus(int kidId)
    {
        try
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidOnboardingStatus", parameters);
            var forms = new List<FormStatusDto>();

            foreach (DataRow row in dataTable.Rows)
            {
                forms.Add(new FormStatusDto
                {
                    FormId = Convert.ToInt32(row["formId"]),
                    FormName = row["formName"].ToString(),
                    FormDescription = row["formDescription"].ToString(),
                    FormOrder = Convert.ToInt32(row["FormOrder"]),
                    Status = row["FormStatus"].ToString(),
                    StartDate = row["StartDate"] == DBNull.Value ? null : Convert.ToDateTime(row["StartDate"]),
                    CompletedDate = row["CompletedDate"] == DBNull.Value ? null : Convert.ToDateTime(row["CompletedDate"]),
                    TotalQuestions = Convert.ToInt32(row["TotalQuestions"]),
                    AnsweredQuestions = Convert.ToInt32(row["AnsweredQuestions"])
                });
            }

            return new KidOnboardingStatusDto
            {
                KidId = kidId,
                Forms = forms,
                OverallStatus = CalculateOverallStatus(forms),
                CompletedForms = forms.Count(f => f.Status == "Completed" || f.Status == "CompletedByParent"),
                TotalForms = forms.Count
            };
        }
        catch (Exception ex)
        {
            throw new Exception($"שגיאה בטעינת סטטוס קליטה: {ex.Message}");
        }
    }

    public bool UpdateFormStatus(int kidId, int formId, string newStatus, int? completedBy = null, string notes = null)
    {
        try
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId },
                { "@NewStatus", newStatus },
                { "@CompletedBy", completedBy },
                { "@Notes", notes }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateFormStatus", parameters);
            return rowsAffected > 0;
        }
        catch (Exception ex)
        {
            return false;
        }
    }

    public void CheckFormCompletion(int kidId, int formId)
    {
        try
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId }
            };

            ExecuteNonQuery("SP_CheckFormCompletion", parameters);
        }
        catch (Exception ex)
        {
            // Log error
        }
    }

    private string CalculateOverallStatus(List<FormStatusDto> forms)
    {
        if (!forms.Any()) return "NotStarted";

        var completedCount = forms.Count(f => f.Status == "Completed" || f.Status == "CompletedByParent");
        var inProgressCount = forms.Count(f => f.Status == "InProgress");

        if (completedCount == forms.Count) return "Completed";
        if (inProgressCount > 0 || completedCount > 0) return "InProgress";
        return "NotStarted";
    }
}