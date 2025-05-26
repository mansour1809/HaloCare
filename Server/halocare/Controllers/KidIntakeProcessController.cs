// Controllers/KidIntakeProcessController.cs
using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class KidIntakeProcessController : ControllerBase
    {
        private readonly KidIntakeProcessService _processService;

        public KidIntakeProcessController(IConfiguration configuration)
        {
            _processService = new KidIntakeProcessService(configuration);
        }

        // GET: api/KidIntakeProcess
        [HttpGet]
        public ActionResult<IEnumerable<KidIntakeProcess>> GetAllProcesses()
        {
            try
            {
                return Ok(_processService.GetAllKidIntakeProcesses());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET: api/KidIntakeProcess/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<KidIntakeProcess> GetKidProcess(int kidId)
        {
            try
            {
                var process = _processService.GetKidIntakeProcess(kidId);
                if (process == null)
                {
                    return NotFound($"תהליך קליטה לא נמצא עבור ילד {kidId}");
                }
                return Ok(process);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // POST: api/KidIntakeProcess/start/5
        [HttpPost("start/{kidId}")]
        public ActionResult StartProcess(int kidId)
        {
            try
            {
                int processId = _processService.StartIntakeProcess(kidId);
                return Ok(new { ProcessId = processId, Message = "תהליך קליטה החל בהצלחה" });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // PUT: api/KidIntakeProcess/complete-form
        [HttpPut("complete-form")]
        public ActionResult CompleteForm([FromBody] CompleteFormRequest request)
        {
            try
            {
                bool success = _processService.CompleteFormStep(request.KidId, request.FormId);
                if (success)
                {
                    return Ok(new { Message = "טופס הושלם בהצלחה" });
                }
                return BadRequest("שגיאה בעדכון הטופס");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // PUT: api/KidIntakeProcess/send-to-parents
        [HttpPut("send-to-parents")]
        public ActionResult SendToParents([FromBody] SendToParentsRequest request)
        {
            try
            {
                bool success = _processService.SendFormToParents(request.KidId, request.FormId);
                if (success)
                {
                    return Ok(new { Message = "טופס נשלח להורים בהצלחה" });
                }
                return BadRequest("שגיאה בשליחת הטופס");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // PUT: api/KidIntakeProcess/status
        [HttpPut("status")]
        public ActionResult UpdateStatus([FromBody] UpdateStatusRequest request)
        {
            try
            {
                bool success = _processService.UpdateProcessStatus(request.KidId, request.Status);
                if (success)
                {
                    return Ok(new { Message = "סטטוס עודכן בהצלחה" });
                }
                return BadRequest("שגיאה בעדכון הסטטוס");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // DELETE: api/KidIntakeProcess/kid/5
        [HttpDelete("kid/{kidId}")]
        public ActionResult DeleteProcess(int kidId)
        {
            try
            {
                bool success = _processService.DeleteIntakeProcess(kidId);
                if (success)
                {
                    return Ok(new { Message = "תהליך קליטה נמחק בהצלחה" });
                }
                return NotFound("תהליך קליטה לא נמצא");
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }

    // Request models
    public class CompleteFormRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
    }

    public class SendToParentsRequest
    {
        public int KidId { get; set; }
        public int FormId { get; set; }
    }

    public class UpdateStatusRequest
    {
        public int KidId { get; set; }
        public string Status { get; set; }
    }
}