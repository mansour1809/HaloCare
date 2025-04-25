//// Controllers/AITSHAController.cs
//using System;
//using System.Threading.Tasks;
//using Microsoft.AspNetCore.Mvc;
//using Microsoft.Extensions.Configuration;
//using halocare.BL.Services;
//using halocare.DAL.Models;

//namespace halocare.Controllers
//{
//    [Route("api/[controller]")]
//    [ApiController]
//    public class AITSHAController : ControllerBase
//    {
//        private readonly AITSHAService _aiTshaService;

//        public AITSHAController(IConfiguration configuration)
//        {
//            _aiTshaService = new AITSHAService(configuration);
//        }

//        // POST: api/AITSHA/generate
//        [HttpPost("generate")]
//        public async Task<ActionResult<TSHA>> GenerateTSHA([FromBody] TSHAGenerationRequest request)
//        {
//            try
//            {
//                var tsha = await _aiTshaService.GenerateTSHA(request.KidId, request.StartDate, request.EndDate);
//                return Ok(tsha);
//            }
//            catch (ArgumentException ex)
//            {
//                return BadRequest(ex.Message);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"שגיאה ביצירת תש\"ה: {ex.Message}");
//            }
//        }

//        // POST: api/AITSHA/approve/{id}
//        [HttpPost("approve/{id}")]
//        public ActionResult ApproveTSHA(int id)
//        {
//            try
//            {
//                // אישור התש"ה והפיכתו מטיוטה למאושר
//                // יש להשלים את הלוגיקה
//                return Ok($"תש\"ה מספר {id} אושר בהצלחה");
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"שגיאה באישור תש\"ה: {ex.Message}");
//            }
//        }

//        // GET: api/AITSHA/kid/{kidId}
//        [HttpGet("kid/{kidId}")]
//        public ActionResult GetTSHAsByKidId(int kidId)
//        {
//            try
//            {
//                // אחזור כל התש"ה עבור ילד מסוים
//                // יש להשלים את הלוגיקה
//                return Ok();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"שגיאה באחזור תש\"ה: {ex.Message}");
//            }
//        }
//    }

//    public class TSHAGenerationRequest
//    {
//        public int KidId { get; set; }
//        public DateTime StartDate { get; set; }
//        public DateTime EndDate { get; set; }
//    }
//}