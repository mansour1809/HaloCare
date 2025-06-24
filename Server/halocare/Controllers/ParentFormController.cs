using Microsoft.AspNetCore.Mvc;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ParentFormController : ControllerBase
    {
        private readonly ParentFormService _parentFormService;

        public ParentFormController(ParentFormService parentFormService)
        {
            _parentFormService = parentFormService;
        }

        // Send a form to the parent's email
        [HttpPost("send")]
        [Authorize]
        public async Task<IActionResult> SendFormToParent([FromBody] SendFormToParentRequest request)
        {
            var result = await _parentFormService.SendFormToParent(
                request.KidId, request.FormId, request.ParentEmail);

            return result ? Ok(new { success = true, message = "הטופס נשלח בהצלחה להורה" })
                          : BadRequest(new { success = false, message = "שגיאה בשליחת הטופס" });
        }

        // Validate parent access via token and child ID number
        [HttpPost("validate")]
        [AllowAnonymous]
        public async Task<IActionResult> ValidateAccess([FromBody] ValidateAccessRequest request)
        {
            var isValid = await _parentFormService.ValidateParentAccess(request.Token, request.KidIdNumber);

            return isValid ? Ok(new { success = true })
                           : BadRequest(new { success = false, message = "פרטי הגישה שגויים" });
        }

        // Retrieve form data using token
        [HttpGet("form/{token}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFormData(string token)
        {
            var formData = await _parentFormService.GetParentFormData(token);

            return formData != null ? Ok(formData)
                                    : BadRequest(new { success = false, message = "טוקן לא תקין או פג תוקף" });
        }

        // Submit form answers from parent
        [HttpPost("submit")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitForm([FromBody] SubmitParentFormRequest request)
        {
            // 🔥 This now works since we're using the same ParentAnswerDto
            var result = await _parentFormService.SaveParentFormAnswers(request.Token, request.Answers);

            return result ? Ok(new { success = true, message = "הטופס נשמר בהצלחה" })
                          : BadRequest(new { success = false, message = "שגיאה בשמירת הטופס" });
        }
    }

    // Request model for sending a form to a parent
    public class SendFormToParentRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
        public string ParentEmail { get; set; }
    }

    // Request model for validating access
    public class ValidateAccessRequest
    {
        public string Token { get; set; }
        public string KidIdNumber { get; set; }
    }

    // Request model for submitting a filled parent form
    public class SubmitParentFormRequest
    {
        public string Token { get; set; }
        public List<halocare.BL.Services.ParentAnswerDto> Answers { get; set; }  // 🔥 Explicit usage
    }
}
