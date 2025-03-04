using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using halocare.DAL.Models;
using halocare.BL.Services;
using Microsoft.Extensions.Configuration;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParentsController : ControllerBase
    {
        private readonly ParentService _parentService;

        public ParentsController(IConfiguration configuration)
        {
            _parentService = new ParentService(configuration);
        }

        // GET: api/Parents
        [HttpGet]
        public ActionResult<IEnumerable<Parent>> GetParents()
        {
            try
            {
                return Ok(_parentService.GetAllParents());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Parents/5
        [HttpGet("{id}")]
        public ActionResult<Parent> GetParent(int id)
        {
            try
            {
                var parent = _parentService.GetParentById(id);

                if (parent == null)
                {
                    return NotFound($"הורה עם מזהה {id} לא נמצא");
                }

                return Ok(parent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Parents/5/kids
        [HttpGet("{id}/kids")]
        public ActionResult<IEnumerable<Kid>> GetParentKids(int id)
        {
            try
            {
                var kids = _parentService.GetParentKids(id);
                return Ok(kids);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Parents
        [HttpPost]
        public ActionResult<Parent> PostParent(Parent parent)
        {
            try
            {
                int parentId = _parentService.AddParent(parent);
                parent.ParentId = parentId;

                return CreatedAtAction(nameof(GetParent), new { id = parentId }, parent);
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

        // PUT: api/Parents/5
        [HttpPut("{id}")]
        public IActionResult PutParent(int id, Parent parent)
        {
            if (id != parent.ParentId)
            {
                return BadRequest("מזהה ההורה בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _parentService.UpdateParent(parent);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"הורה עם מזהה {id} לא נמצא");
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