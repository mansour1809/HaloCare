// KidsController - Updated to support folder structure creation and integration with DocumentService

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
        private readonly DocumentService _documentService;

        public KidsController(IConfiguration configuration)
        {
            _kidService = new KidService(configuration);
            _documentService = new DocumentService(configuration);
        }

        // Retrieve all kids
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

        // Retrieve a specific kid by ID
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

        // Retrieve file information for a kid
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

        // Retrieve treatments associated with a kid
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

        // Retrieve alerts for a kid
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

        // Retrieve attendance records for a kid
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

        // Add a new kid
        [HttpPost]
        public ActionResult<Kid> PostKid([FromBody] Kid kid)
        {
            try
            {
                // Create the kid in the database
                int kidId = _kidService.AddKid(kid);
                kid.Id = kidId;

                // Create folder structure for the new kid
                try
                {
                    string folderPath = _documentService.CreateKidFolderStructure(
                        kidId,
                        kid.FirstName,
                        kid.LastName
                    );

                    // Update folder path in the kid record
                    kid.PathToFolder = folderPath;
                    _kidService.UpdateKid(kid);
                }
                catch (Exception folderEx)
                {
                    // Log the error but do not fail the creation
                    Console.WriteLine($"שגיאה ביצירת תיקיית ילד: {folderEx.Message}");
                }

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

        // Manually create folder structure for a kid
        [HttpPost("create-folder-structure")]
        public ActionResult CreateKidFolderStructure([FromBody] CreateFolderRequest request)
        {
            try
            {
                // Create the folder structure
                string folderPath = _documentService.CreateKidFolderStructure(
                    request.KidId,
                    request.FirstName,
                    request.LastName
                );

                // Update the kid with the new folder path
                var kid = _kidService.GetKidById(request.KidId);
                if (kid != null)
                {
                    kid.PathToFolder = folderPath;
                    _kidService.UpdateKid(kid);
                }

                return Ok(new
                {
                    kidId = request.KidId,
                    folderPath = folderPath,
                    message = "מבנה תיקיות נוצר בהצלחה"
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה ביצירת מבנה תיקיות: {ex.Message}");
            }
        }

        // Update kid information
        [HttpPut("{id}")]
        public IActionResult PutKid(int id, Kid kid)
        {
            if (id != kid.Id)
            {
                return BadRequest("מזהה הילד בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                // Create folder structure if missing
                if (string.IsNullOrEmpty(kid.PathToFolder))
                {
                    try
                    {
                        string folderPath = _documentService.CreateKidFolderStructure(
                            kid.Id,
                            kid.FirstName,
                            kid.LastName
                        );
                        kid.PathToFolder = folderPath;
                    }
                    catch (Exception folderEx)
                    {
                        Console.WriteLine($"שגיאה ביצירת תיקיית ילד בעדכון: {folderEx.Message}");
                    }
                }

                bool updated = _kidService.UpdateKid(kid);

                if (updated)
                {
                    return Ok(kid); // Return the updated kid
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

        // Deactivate a kid
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

        // Update profile photo path for a kid
        [HttpPatch("{id}/photo")]
        public IActionResult UpdateKidPhoto(int id, [FromBody] UpdatePhotoRequest request)
        {
            try
            {
                var kid = _kidService.GetKidById(id);
                if (kid == null)
                {
                    return NotFound($"kid with id {id} not found");
                }

                // Update photo path
                kid.PhotoPath = request.PhotoPath;
                bool updated = _kidService.UpdateKid(kid);

                if (updated)
                {
                    return Ok(kid);
                }
                else
                {
                    return StatusCode(500, "שגיאה בעדכון תמונת הפרופיל");
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

    // Helper classes for request models
    public class CreateFolderRequest
    {
        public int KidId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class UpdatePhotoRequest
    {
        public string PhotoPath { get; set; }
    }
}
