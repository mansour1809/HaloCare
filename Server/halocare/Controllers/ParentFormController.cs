using Microsoft.AspNetCore.Mvc;
using halocare.BL.Services;
using halocare.DAL.Models;



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

        [HttpPost("send")]
        public async Task<IActionResult> SendFormToParent([FromBody] SendFormToParentRequest request)
        {
            var result = await _parentFormService.SendFormToParent(
                request.KidId, request.FormId, request.ParentEmail);

            return result ? Ok(new { success = true, message = "הטופס נשלח בהצלחה להורה" })
                          : BadRequest(new { success = false, message = "שגיאה בשליחת הטופס" });
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateAccess([FromBody] ValidateAccessRequest request)
        {
            var isValid = await _parentFormService.ValidateParentAccess(request.Token, request.KidIdNumber);

            return isValid ? Ok(new { success = true })
                           : BadRequest(new { success = false, message = "פרטי הגישה שגויים" });
        }

        [HttpGet("form/{token}")]
        public async Task<IActionResult> GetFormData(string token)
        {
            var formData = await _parentFormService.GetParentFormData(token);

            return formData != null ? Ok(formData)
                                    : BadRequest(new { success = false, message = "טוקן לא תקין או פג תוקף" });
        }

        [HttpPost("submit")]
        public async Task<IActionResult> SubmitForm([FromBody] SubmitParentFormRequest request)
        {
            Console.WriteLine(request);
            // 🔥 עכשיו זה יעבוד כי אנחנו משתמשים באותו ParentAnswerDto
            var result = await _parentFormService.SaveParentFormAnswers(request.Token, request.Answers);

            return result ? Ok(new { success = true, message = "הטופס נשמר בהצלחה" })
                          : BadRequest(new { success = false, message = "שגיאה בשמירת הטופס" });
        }
    }

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
        public List<halocare.BL.Services.ParentAnswerDto> Answers { get; set; }  // 🔥 שימוש מפורש
    }
}
