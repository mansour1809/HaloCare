public interface IKidOnboardingService
{
    bool InitializeKidOnboarding(int kidId);
    KidOnboardingStatusDto GetKidOnboardingStatus(int kidId);
    bool UpdateFormStatus(int kidId, int formId, string newStatus, int? completedBy = null, string notes = null);
    void CheckFormCompletion(int kidId, int formId);
}

public class KidOnboardingService : IKidOnboardingService
{
    private readonly IKidOnboardingRepository _onboardingRepository;

    public KidOnboardingService(IKidOnboardingRepository onboardingRepository)
    {
        _onboardingRepository = onboardingRepository;
    }

    public bool InitializeKidOnboarding(int kidId)
    {
        return _onboardingRepository.InitializeKidOnboarding(kidId);
    }

    public KidOnboardingStatusDto GetKidOnboardingStatus(int kidId)
    {
        return _onboardingRepository.GetKidOnboardingStatus(kidId);
    }

    public bool UpdateFormStatus(int kidId, int formId, string newStatus, int? completedBy = null, string notes = null)
    {
        return _onboardingRepository.UpdateFormStatus(kidId, formId, newStatus, completedBy, notes);
    }

    public void CheckFormCompletion(int kidId, int formId)
    {
        _onboardingRepository.CheckFormCompletion(kidId, formId);
    }
}