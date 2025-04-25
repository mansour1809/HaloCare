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

    public class ClassesController : ControllerBase
    {
        private readonly ClassService _classService;

        public ClassesController(IConfiguration configuration)
        {
            _classService = new ClassService(configuration);
        }

        // GET: api/Classes
        [HttpGet]
        public ActionResult<IEnumerable<Class>> GetClasses()
        {
            try
            {
                return Ok(_classService.GetAllClasses());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Classes/5
        [HttpGet("{id}")]
        public ActionResult<Class> GetClass(int id)
        {
            try
            {
                var classItem = _classService.GetClassById(id);

                if (classItem == null)
                {
                    return NotFound($"כיתה עם מזהה {id} לא נמצאה");
                }

                return Ok(classItem);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Classes/5/kids
        [HttpGet("{id}/kids")]
        public ActionResult<IEnumerable<Kid>> GetKidsInClass(int id)
        {
            try
            {
                var kids = _classService.GetKidsInClass(id);
                return Ok(kids);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Classes
        [HttpPost]
        public ActionResult<Class> PostClass(Class classItem)
        {
            try
            {
                int classId = _classService.AddClass(classItem);
                classItem.ClassId = classId;

                return CreatedAtAction(nameof(GetClass), new { id = classId }, classItem);
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

        // PUT: api/Classes/5
        [HttpPut("{id}")]
        public IActionResult PutClass(int id, Class classItem)
        {
            if (id != classItem.ClassId)
            {
                return BadRequest("מזהה הכיתה בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _classService.UpdateClass(classItem);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"כיתה עם מזהה {id} לא נמצאה");
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

        // DELETE: api/Classes/5
        [HttpDelete("{id}")]
        public IActionResult DeleteClass(int id)
        {
            try
            {
                bool deleted = _classService.DeleteClass(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"כיתה עם מזהה {id} לא נמצאה");
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