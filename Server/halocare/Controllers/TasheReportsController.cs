using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]
    public class TasheReportsController : ControllerBase
    {
        private readonly TasheReportService _tasheReportService;

        public TasheReportsController(IConfiguration configuration)
        {
            _tasheReportService = new TasheReportService(configuration);
        }

        // POST: api/TasheReports/generate
        [HttpPost("generate")]
        public async Task<ActionResult<TasheReport>> GenerateReport([FromBody] GenerateReportRequest request)
        {
            try
            {
                if (request.PeriodStartDate >= request.PeriodEndDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                // בדיקה שהתקופה לא עולה על 6 חודשים
                if ((request.PeriodEndDate - request.PeriodStartDate).TotalDays > 180)
                {
                    return BadRequest("תקופת הדוח לא יכולה לעלות על 6 חודשים");
                }

                TasheReport report = await _tasheReportService.GenerateReportAsync(
                    request.KidId,
                    request.PeriodStartDate,
                    request.PeriodEndDate,
                    request.GeneratedByEmployeeId,
                    request.ReportTitle,
                    request.Notes
                );

                return Ok(report);
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

        // GET: api/TasheReports/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<List<TasheReport>> GetReportsByKid(int kidId)
        {
            try
            {
                List<TasheReport> reports = _tasheReportService.GetReportsByKid(kidId);
                return Ok(reports);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TasheReports/treatments-preview
        [HttpGet("treatments-preview")]
        public ActionResult<List<TreatmentForTashe>> GetTreatmentsPreview(int kidId, DateTime startDate, DateTime endDate)
        {
            try
            {
                if (startDate >= endDate)
                {
                    return BadRequest("תאריך התחלה חייב להיות לפני תאריך הסיום");
                }

                List<TreatmentForTashe> treatments = _tasheReportService.GetTreatmentsForTashe(kidId, startDate, endDate);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // PUT: api/TasheReports/approve
        [HttpPut("approve")]
        public ActionResult ApproveReport([FromBody] ApproveReportRequest request)
        {
            try
            {
                bool result = _tasheReportService.ApproveReport(request.ReportId, request.ApprovedByEmployeeId);

                if (result)
                {
                    return Ok("הדוח אושר בהצלחה");
                }
                else
                {
                    return NotFound("הדוח לא נמצא או לא ניתן לאשר");
                }
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

        // DELETE: api/TasheReports/5
        [HttpDelete("{reportId}")]
        public ActionResult DeleteReport(int reportId, [FromQuery] int deletedByEmployeeId)
        {
            try
            {
                bool result = _tasheReportService.DeleteReport(reportId, deletedByEmployeeId);

                if (result)
                {
                    return Ok("הדוח נמחק בהצלחה");
                }
                else
                {
                    return NotFound("הדוח לא נמצא או לא ניתן למחוק");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }
    }

    // מודלים לבקשות
    public class GenerateReportRequest
    {
        public int KidId { get; set; }
        public DateTime PeriodStartDate { get; set; }
        public DateTime PeriodEndDate { get; set; }
        public int GeneratedByEmployeeId { get; set; }
        public string ReportTitle { get; set; }
        public string Notes { get; set; }
    }

    public class ApproveReportRequest
    {
        public int ReportId { get; set; }
        public int ApprovedByEmployeeId { get; set; }
    }
}