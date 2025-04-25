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

    public class AlertsController : ControllerBase
    {
        private readonly AlertService _alertService;

        public AlertsController(IConfiguration configuration)
        {
            _alertService = new AlertService(configuration);
        }

        // GET: api/Alerts
        [HttpGet]
        public ActionResult<IEnumerable<Alert>> GetAlerts()
        {
            try
            {
                return Ok(_alertService.GetAllAlerts());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Alerts/5
        [HttpGet("{id}")]
        public ActionResult<Alert> GetAlert(int id)
        {
            try
            {
                var alert = _alertService.GetAlertById(id);

                if (alert == null)
                {
                    return NotFound($"התראה עם מזהה {id} לא נמצאה");
                }

                return Ok(alert);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Alerts/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<Alert>> GetAlertsByKidId(int kidId)
        {
            try
            {
                return Ok(_alertService.GetAlertsByKidId(kidId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Alerts/active
        [HttpGet("active")]
        public ActionResult<IEnumerable<Alert>> GetActiveAlerts()
        {
            try
            {
                return Ok(_alertService.GetActiveAlerts());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Alerts/overdue
        [HttpGet("overdue")]
        public ActionResult<IEnumerable<Alert>> GetOverdueAlerts()
        {
            try
            {
                return Ok(_alertService.GetOverdueAlerts());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Alerts
        [HttpPost]
        public ActionResult<Alert> PostAlert(Alert alert)
        {
            try
            {
                int alertId = _alertService.AddAlert(alert);
                alert.AlertId = alertId;

                return CreatedAtAction(nameof(GetAlert), new { id = alertId }, alert);
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

        // PUT: api/Alerts/5
        [HttpPut("{id}")]
        public IActionResult PutAlert(int id, Alert alert)
        {
            if (id != alert.AlertId)
            {
                return BadRequest("מזהה ההתראה בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _alertService.UpdateAlert(alert);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"התראה עם מזהה {id} לא נמצאה");
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

        // DELETE: api/Alerts/5
        [HttpDelete("{id}")]
        public IActionResult DeleteAlert(int id)
        {
            try
            {
                bool deleted = _alertService.DeleteAlert(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"התראה עם מזהה {id} לא נמצאה");
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
    }
}