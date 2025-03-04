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
    public class TSHAController : ControllerBase
    {
        private readonly TSHAService _tshaService;

        public TSHAController(IConfiguration configuration)
        {
            _tshaService = new TSHAService(configuration);
        }

        // GET: api/TSHA
        [HttpGet]
        public ActionResult<IEnumerable<TSHA>> GetAllTSHAs()
        {
            try
            {
                return Ok(_tshaService.GetAllTSHAs());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TSHA/5
        [HttpGet("{id}")]
        public ActionResult<TSHA> GetTSHA(int id)
        {
            try
            {
                var tsha = _tshaService.GetTSHAById(id);

                if (tsha == null)
                {
                    return NotFound($"תש\"ה עם מזהה {id} לא נמצא");
                }

                return Ok(tsha);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TSHA/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<TSHA>> GetTSHAsByKidId(int kidId)
        {
            try
            {
                return Ok(_tshaService.GetTSHAsByKidId(kidId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/TSHA/generate/5
        [HttpGet("generate/{kidId}")]
        public ActionResult<TSHA> GenerateTSHAReport(int kidId)
        {
            try
            {
                var tsha = _tshaService.GenerateTSHAReport(kidId);
                return Ok(tsha);
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

        // POST: api/TSHA
        [HttpPost]
        public ActionResult<TSHA> PostTSHA(TSHA tsha)
        {
            try
            {
                int tshaId = _tshaService.AddTSHA(tsha);
                tsha.TshaId = tshaId;

                return CreatedAtAction(nameof(GetTSHA), new { id = tshaId }, tsha);
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

        // PUT: api/TSHA/5
        [HttpPut("{id}")]
        public IActionResult PutTSHA(int id, TSHA tsha)
        {
            if (id != tsha.TshaId)
            {
                return BadRequest("מזהה התש\"ה בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _tshaService.UpdateTSHA(tsha);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"תש\"ה עם מזהה {id} לא נמצא");
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