﻿using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TreatmentTypesController : ControllerBase
    {
        private readonly TreatmentTypeService _treatmentTypeService;

        public TreatmentTypesController(IConfiguration configuration)
        {
            _treatmentTypeService = new TreatmentTypeService(configuration);
        }

        // GET: api/TreatmentTypes
        [HttpGet]
        public ActionResult<IEnumerable<TreatmentType>> GetTreatmentTypes()
        {
            try
            {
                return Ok(_treatmentTypeService.GetAllTreatmentTypes());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת סוגי הטיפולים: {ex.Message}");
            }
        }

        // GET: api/TreatmentTypes/{name}
        [HttpGet("{name}")]
        public ActionResult<TreatmentType> GetTreatmentType(string name)
        {
            try
            {
                var treatmentType = _treatmentTypeService.GetTreatmentTypeByName(name);

                if (treatmentType == null)
                {
                    return NotFound($"סוג הטיפול '{name}' לא נמצא");
                }

                return Ok(treatmentType);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בשליפת סוג הטיפול: {ex.Message}");
            }
        }

        // POST: api/TreatmentTypes
        [HttpPost]
        public ActionResult<TreatmentType> PostTreatmentType(TreatmentType treatmentType)
        {
            try
            {
                bool success = _treatmentTypeService.AddTreatmentType(treatmentType);

                if (success)
                {
                    return CreatedAtAction(nameof(GetTreatmentType), new { name = treatmentType.TreatmentTypeName }, treatmentType);
                }
                else
                {
                    return StatusCode(500, "לא ניתן להוסיף את סוג הטיפול");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בהוספת סוג הטיפול: {ex.Message}");
            }
        }

        // PUT: api/TreatmentTypes/{oldName}
        [HttpPut("{oldName}")]
        public IActionResult PutTreatmentType(string oldName, [FromBody] string newName)
        {
            try
            {
                bool success = _treatmentTypeService.UpdateTreatmentType(oldName, newName);

                if (success)
                {
                    return NoContent();
                }
                else
                {
                    return StatusCode(500, "לא ניתן לעדכן את סוג הטיפול");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה בעדכון סוג הטיפול: {ex.Message}");
            }
        }

        // DELETE: api/TreatmentTypes/{name}
        [HttpDelete("{name}")]
        public IActionResult DeleteTreatmentType(string name)
        {
            try
            {
                bool success = _treatmentTypeService.DeleteTreatmentType(name);

                if (success)
                {
                    return NoContent();
                }
                else
                {
                    return StatusCode(500, "לא ניתן למחוק את סוג הטיפול");
                }
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה במחיקת סוג הטיפול: {ex.Message}");
            }
        }
    }
}