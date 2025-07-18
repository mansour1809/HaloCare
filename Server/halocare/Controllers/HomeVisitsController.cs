﻿using System;
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
    public class HomeVisitsController : ControllerBase
    {
        private readonly HomeVisitService _homeVisitService;

        public HomeVisitsController(IConfiguration configuration)
        {
            _homeVisitService = new HomeVisitService(configuration);
        }

        // Retrieve all home visits
        [HttpGet]
        public ActionResult<IEnumerable<HomeVisit>> GetHomeVisits()
        {
            try
            {
                return Ok(_homeVisitService.GetAllHomeVisits());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Retrieve a specific home visit by ID
        [HttpGet("{id}")]
        public ActionResult<HomeVisit> GetHomeVisit(int id)
        {
            try
            {
                var homeVisit = _homeVisitService.GetHomeVisitById(id);

                if (homeVisit == null)
                {
                    return NotFound($"ביקור בית עם מזהה {id} לא נמצא");
                }

                return Ok(homeVisit);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Retrieve all home visits associated with a specific child
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<HomeVisit>> GetHomeVisitsByKidId(int kidId)
        {
            try
            {
                return Ok(_homeVisitService.GetHomeVisitsByKidId(kidId));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Retrieve upcoming home visits within a specified number of days
        [HttpGet("upcoming")]
        public ActionResult<IEnumerable<HomeVisit>> GetUpcomingHomeVisits([FromQuery] int daysAhead = 7)
        {
            try
            {
                return Ok(_homeVisitService.GetUpcomingHomeVisits(daysAhead));
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // Add a new home visit
        [HttpPost]
        public ActionResult<HomeVisit> PostHomeVisit(HomeVisit homeVisit)
        {
            try
            {
                int visitId = _homeVisitService.AddHomeVisit(homeVisit);
                homeVisit.VisitId = visitId;

                return CreatedAtAction(nameof(GetHomeVisit), new { id = visitId }, homeVisit);
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

        // Update an existing home visit
        [HttpPut("{id}")]
        public IActionResult PutHomeVisit(int id, HomeVisit homeVisit)
        {
            if (id != homeVisit.VisitId)
            {
                return BadRequest("מזהה ביקור הבית בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _homeVisitService.UpdateHomeVisit(homeVisit);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"ביקור בית עם מזהה {id} לא נמצא");
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

        // Delete a home visit by ID
        [HttpDelete("{id}")]
        public IActionResult DeleteHomeVisit(int id)
        {
            try
            {
                bool deleted = _homeVisitService.DeleteHomeVisit(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"ביקור בית עם מזהה {id} לא נמצא");
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
