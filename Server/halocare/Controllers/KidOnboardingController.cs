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

        // POST: api/KidOnboarding/start/{kidId}
        [HttpPost("start/{kidId}")]
        public IActionResult StartOnboardingProcess(int kidId)
        {
            try
            {
                int processId = _onboardingService.StartOnboardingProcess(kidId);
                return Ok(new { ProcessId = processId, Message = "תהליך הקליטה התחיל בהצלחה" });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }

        // GET: api/KidOnboarding/status/{kidId}
        [HttpGet("status/{kidId}")]
        public ActionResult<KidOnboardingStatus> GetOnboardingStatus(int kidId)
        {
            try
            {
                var status = _onboardingService.GetOnboardingStatus(kidId);
                return Ok(status);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }

        // PUT: api/KidOnboarding/complete-step
        [HttpPut("complete-step")]
        public IActionResult CompleteFormStep([FromBody] CompleteStepRequest request)
        {
            try
            {
                if (request == null || request.KidId <= 0 || request.FormId <= 0)
                {
                    return BadRequest("נתונים שגויים");
                }

                bool success = _onboardingService.CompleteFormStep(request.KidId, request.FormId);

                if (success)
                {
                    return Ok(new { Message = "השלב הושלם בהצלחה" });
                }
                else
                {
                    return BadRequest("לא ניתן היה לעדכן את השלב");
                }
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }

        // GET: api/KidOnboarding/incomplete-kids
        [HttpGet("incomplete-kids")]
        public ActionResult<IEnumerable<Kid>> GetKidsWithIncompleteOnboarding()
        {
            try
            {
                var kids = _onboardingService.GetKidsWithIncompleteOnboarding();
                return Ok(kids);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }

        // GET: api/KidOnboarding/forms
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
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }

        // GET: api/KidOnboarding/current-step/{kidId}
        [HttpGet("current-step/{kidId}")]
        public IActionResult GetCurrentStep(int kidId)
        {
            try
            {
                var status = _onboardingService.GetOnboardingStatus(kidId);
                var currentForm = status.Forms.FirstOrDefault(f => f.Status == "current");

                if (currentForm == null)
                {
                    return Ok(new { Message = "התהליך הושלם", IsCompleted = true });
                }

                return Ok(new
                {
                    CurrentForm = currentForm.Form,
                    CompletionPercentage = status.CompletionPercentage,
                    IsCompleted = false
                });
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה: {ex.Message}");
            }
        }
    }

    // DTO for request
    public class CompleteStepRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
    }
}