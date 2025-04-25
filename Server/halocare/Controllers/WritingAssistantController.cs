//using System;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using halocare.BL.Services;
//using halocare.DAL.Repositories;

//namespace halocare.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class WritingAssistantController : ControllerBase
//    {
//        private readonly AIWritingAssistantService _aiService;

//        public WritingAssistantController(IConfiguration configuration)
//        {
//            _aiService = new AIWritingAssistantService(configuration);
//        }

//        // קבלת הצעות השלמה בזמן הקלדה
//        [HttpPost("suggest")]
//        public async Task<ActionResult<string>> GetSuggestions([FromBody] SuggestionRequest request)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(request.CurrentText))
//                {
//                    return Ok(""); // אם אין טקסט, לא מחזירים הצעות
//                }

//                var suggestion = await _aiService.GetCompletionSuggestions(
//                    request.CurrentText,
//                    request.TreatmentTypeId);

//                return Ok(new { suggestion });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"שגיאה בקבלת הצעות: {ex.Message}");
//            }
//        }

//        // שיפור ניסוח מקצועי של טקסט שלם
//        [HttpPost("improve")]
//        public async Task<ActionResult<string>> ImproveText([FromBody] ImproveRequest request)
//        {
//            try
//            {
//                if (string.IsNullOrWhiteSpace(request.Text))
//                {
//                    return BadRequest("טקסט ריק");
//                }

//                var improvedText = await _aiService.ImproveProfessionalWriting(
//                    request.Text,
//                    request.TreatmentTypeId);

//                return Ok(new { improvedText });
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"שגיאה בשיפור הטקסט: {ex.Message}");
//            }
//        }
//    }

//    public class SuggestionRequest
//    {
//        public string CurrentText { get; set; }
//        public int TreatmentTypeId { get; set; }
//    }

//    public class ImproveRequest
//    {
//        public string Text { get; set; }
//        public int TreatmentTypeId { get; set; }
//    }
//}