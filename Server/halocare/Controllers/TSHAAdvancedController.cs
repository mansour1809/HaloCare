// Controllers/TSHAAdvancedController.cs
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using halocare.DAL.Repositories;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TSHAAdvancedController : ControllerBase
    {
        private readonly TreatmentService _treatmentService;
        private readonly KidRepository _kidRepository;
        private readonly TreatmentInsightService _insightService;
        //private readonly TSHAFormatterService _formatterService;
        //private readonly AITSHAService _aiTshaService;

        public TSHAAdvancedController(IConfiguration configuration)
        {
            _treatmentService = new TreatmentService(configuration);
            _kidRepository = new KidRepository(configuration);
            _insightService = new TreatmentInsightService(configuration);
            //_formatterService = new TSHAFormatterService();
            //_aiTshaService = new AITSHAService(configuration);
        }

        // GET: api/TSHAAdvanced/analyze-treatments/{kidId}
        [HttpGet("analyze-treatments/{kidId}")]
        public async Task<ActionResult<TreatmentInsights>> AnalyzeTreatments(int kidId,int treatmentId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            try
            {
                // treatments by rangw
                List<Treatment> treatments = _treatmentService.GetTreatmentsByKidIdAndTypeAndDateRange(kidId,treatmentId, startDate, endDate); 

                if (treatments.Count == 0)
                {
                    return NotFound($"לא נמצאו טיפולים לילד {kidId} בטווח התאריכים המבוקש");
                }

                // treatments analyzing
                  TreatmentInsights insights = await _insightService.AnalyzeTreatments(treatments);

                return Ok(insights);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בניתוח הטיפולים: {ex.Message}");
            }
        }

        //        // POST: api/TSHAAdvanced/generate-tsha
        //        //[HttpPost("generate-tsha")]
        //        //public async Task<ActionResult<TSHA>> GenerateTSHA(TSHAGenerationRequest request)
        //        //{
        //        //    try
        //        //    {
        //        //        var tsha = await _aiTshaService.GenerateTSHA(request.KidId, request.StartDate, request.EndDate);
        //        //        return Ok(tsha);
        //        //    }
        //        //    catch (ArgumentException ex)
        //        //    {
        //        //        return BadRequest(ex.Message);
        //        //    }
        //        //    catch (Exception ex)
        //        //    {
        //        //        return StatusCode(500, $"שגיאה ביצירת תש\"ה: {ex.Message}");
        //        //    }
        //        //}

        //        // GET: api/TSHAAdvanced/{id}/html
        //        [HttpGet("{id}/html")]
        //        public ActionResult<string> GetTSHAAsHTML(int id)
        //        {
        //            try
        //            {
        //                // אחזור התש"ה
        //                var tshaRepository = new TSHARepository(_kidRepository.Configuration);
        //                var tsha = tshaRepository.GetTSHAById(id);

        //                if (tsha == null)
        //                {
        //                    return NotFound($"תש\"ה עם מזהה {id} לא נמצא");
        //                }

        //                // אחזור פרטי הילד
        //                var kid = _kidRepository.GetKidById(tsha.KidId);

        //                if (kid == null)
        //                {
        //                    return NotFound($"ילד עם מזהה {tsha.KidId} לא נמצא");
        //                }

        //                // המרה לפורמט HTML
        //                string html = _formatterService.FormatTSHAAsHTML(tsha, kid);

        //                return Ok(html);
        //            }
        //            catch (Exception ex)
        //            {
        //                return StatusCode(500, $"שגיאה בהמרת תש\"ה לפורמט HTML: {ex.Message}");
        //            }
        //        }

        //        // GET: api/TSHAAdvanced/kid/{kidId}/recommendations
        //        [HttpGet("kid/{kidId}/recommendations")]
        //        public async Task<ActionResult<List<GoalRecommendation>>> GetRecommendationsForKid(int kidId)
        //        {
        //            try
        //            {
        //                // אחזור טיפולים מהחודשים האחרונים
        //                DateTime endDate = DateTime.Now;
        //                DateTime startDate = endDate.AddMonths(-3);

        //                var treatments = _treatmentRepository.GetTreatmentsByKidIdAndDateRange(kidId, startDate, endDate);

        //                if (treatments.Count == 0)
        //                {
        //                    return NotFound($"לא נמצאו טיפולים לילד {kidId} בשלושת החודשים האחרונים");
        //                }

        //                // ניתוח הטיפולים
        //                var insights = await _insightService.AnalyzeTreatments(treatments);

        //                return Ok(insights.RecommendedGoals);
        //            }
        //            catch (Exception ex)
        //            {
        //                return StatusCode(500, $"שגיאה בייצור המלצות: {ex.Message}");
        //            }
        //        }
        //    }

        //    //public class TSHAGenerationRequest
        //    //{
        //    //    public int KidId { get; set; }
        //    //    public DateTime StartDate { get; set; }
        //    //    public DateTime EndDate { get; set; }
        //    //}
    }
    }
    