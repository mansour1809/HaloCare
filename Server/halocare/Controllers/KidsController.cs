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

    public class KidsController : ControllerBase
    {
        private readonly KidService _kidService;

        public KidsController(IConfiguration configuration)
        {
            _kidService = new KidService(configuration);
        }

        // GET: api/Kids
        [HttpGet]
        public ActionResult<IEnumerable<Kid>> GetKids()
        {
            try
            {
                return Ok(_kidService.GetAllKids());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET: api/Kids/5
        [HttpGet("{id}")]
        public ActionResult<Kid> GetKid(int id)
        {
            try
            {
                var kid = _kidService.GetKidById(id);

                if (kid == null)
                {
                    return NotFound($"kid with id {id} not found");
                }

                return Ok(kid);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"error: {ex.Message}");
            }
        }

        // GET: api/Kids/5/file
        [HttpGet("{id}/file")]
        public ActionResult<Kid> GetKidFile(int id)
        {
            try
            {
                var kid = _kidService.GetKidFile(id);
                return Ok(kid);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET: api/Kids/5/treatments
        [HttpGet("{id}/treatments")]
        public ActionResult<IEnumerable<Treatment>> GetKidTreatments(int id)
        {
            try
            {
                var treatments = _kidService.GetKidTreatments(id);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET: api/Kids/5/alerts
        [HttpGet("{id}/alerts")]
        public ActionResult<IEnumerable<Alert>> GetKidAlerts(int id)
        {
            try
            {
                var alerts = _kidService.GetKidAlerts(id);
                return Ok(alerts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // GET: api/Kids/5/attendance
        [HttpGet("{id}/attendance")]
        public ActionResult<IEnumerable<Attendance>> GetKidAttendance(int id)
        {
            try
            {
                var attendance = _kidService.GetKidAttendance(id);
                return Ok(attendance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // POST: api/Kids
        [HttpPost]
        public ActionResult<Kid> PostKid([FromBody] Kid kid)
        {
            Console.WriteLine(kid);
            try
            {
                int kidId = _kidService.AddKid(kid);
                kid.Id = kidId;

                return CreatedAtAction(nameof(GetKid), new { id = kidId }, kid);
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

        // PUT: api/Kids/5
        [HttpPut("{id}")]
        public IActionResult PutKid(int id, Kid kid)
        {
            if (id != kid.Id)
            {
                return BadRequest("מזהה הילד בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _kidService.UpdateKid(kid);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"kid with id {id} not found");
                }
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

        // PATCH: api/Kids/5/deactivate
        [HttpPatch("{id}/deactivate")]
        public IActionResult DeactivateKid(int id)
        {
            try
            {
                bool deactivated = _kidService.DeactivateKid(id);

                if (deactivated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"kid with id {id} not found");
                }
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
}