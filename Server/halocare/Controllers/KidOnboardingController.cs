using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KidOnboardingController : ControllerBase
    {
        private readonly KidOnboardingService _onboardingService;

        public KidOnboardingController(IConfiguration configuration)
        {
            _onboardingService = new KidOnboardingService(configuration);
        }

        // GET: api/KidOnboarding/status/5
        [HttpGet("status/{kidId}")]
        public async Task<ActionResult<KidOnboardingProcess>> GetOnboardingStatus(int kidId)
        {
            try
            {
                var status = await _onboardingService.GetOnboardingStatus(kidId);
                return Ok(status);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/KidOnboarding/start
        [HttpPost("start/{kidId}")]
        public async Task<ActionResult<KidOnboardingProcess>> StartOnboarding(int kidId)
        {
            try
            {
                var process = await _onboardingService.StartOnboardingProcess(kidId);
                return Ok(process);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/KidOnboarding/complete-form
        [HttpPost("complete-form")]
        public async Task<IActionResult> CompleteForm([FromBody] CompleteFormRequest request)
        {
            try
            {
                await _onboardingService.MarkFormAsCompleted(request.KidId, request.FormId);
                return Ok(new { message = "הטופס הושלם בהצלחה" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/KidOnboarding/send-to-parent
        [HttpPost("send-to-parent")]
        public async Task<IActionResult> SendFormToParent([FromBody] SendToParentRequest request)
        {
            try
            {
                await _onboardingService.SendFormToParent(request.KidId, request.FormId);
                return Ok(new { message = "הטופס נשלח להורים בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/KidOnboarding/forms - המתודה שחסרה!
        [HttpGet("forms")]
        public ActionResult<IEnumerable<Form>> GetAvailableForms()
        {
            try
            {
                var forms = _onboardingService.GetAvailableForms();
                return Ok(forms);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
    }
}
public class CompleteFormRequest
{
    public int KidId { get; set; }
    public int FormId { get; set; }
}

public class SendToParentRequest
{
    public int KidId { get; set; }
    public int FormId { get; set; }
}