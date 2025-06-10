using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
//[Authorize]
public class KidOnboardingController : ControllerBase
{
    private readonly IKidOnboardingService _onboardingService;

    public KidOnboardingController(IKidOnboardingService onboardingService)
    {
        _onboardingService = onboardingService;
    }

    [HttpPost("initialize/{kidId}")]
    public IActionResult InitializeOnboarding(int kidId)
    {
        var result = _onboardingService.InitializeKidOnboarding(kidId);
        return result ? Ok(new { success = true, message = "תהליך קליטה הוקם בהצלחה" })
                      : BadRequest(new { success = false, message = "שגיאה ביצירת תהליך קליטה" });
    }

    [HttpGet("status/{kidId}")]
    public IActionResult GetOnboardingStatus(int kidId)
    {
        try
        {
            var status = _onboardingService.GetKidOnboardingStatus(kidId);
            return Ok(status);
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }

    [HttpPut("form-status")]
    public IActionResult UpdateFormStatus([FromBody] UpdateFormStatusRequest request)
    {
        var result = _onboardingService.UpdateFormStatus(
            request.KidId,
            request.FormId,
            request.NewStatus,
            request.CompletedBy,
            request.Notes
        );
        return result ? Ok(new { success = true, message = "סטטוס עודכן בהצלחה" })
                      : BadRequest(new { success = false, message = "שגיאה בעדכון סטטוס" });
    }

    [HttpPost("check-completion")]
    public IActionResult CheckFormCompletion([FromBody] CheckCompletionRequest request)
    {
        try
        {
            _onboardingService.CheckFormCompletion(request.KidId, request.FormId);
            return Ok(new { success = true, message = "בדיקת השלמה בוצעה" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { success = false, message = ex.Message });
        }
    }
}

public class UpdateFormStatusRequest
{
    public int KidId { get; set; }
    public int FormId { get; set; }
    public string NewStatus { get; set; }
    public int? CompletedBy { get; set; }
    public string Notes { get; set; }
}

public class CheckCompletionRequest
{
    public int KidId { get; set; }
    public int FormId { get; set; }
}