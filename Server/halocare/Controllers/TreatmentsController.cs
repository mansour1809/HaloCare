using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;
using System.Data;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]

    public class TreatmentsController : ControllerBase
    {
        private readonly TreatmentService _treatmentService;

        public TreatmentsController(IConfiguration configuration)
        {
            _treatmentService = new TreatmentService(configuration);
        }

        // GET: api/Treatments
        [HttpGet]
        public ActionResult<IEnumerable<Treatment>> GetTreatments()
        {
            try
            {
                return Ok(_treatmentService.GetAllTreatments());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Treatments/5
        [HttpGet("{id}")]
        public ActionResult<Treatment> GetTreatment(int id)
        {
            try
            {
                Treatment treatment = _treatmentService.GetTreatmentById(id);

                if (treatment == null)
                {
                    return NotFound($"טיפול עם מזהה {id} לא נמצא");
                }

                return Ok(treatment);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Treatments/kid/5
        [HttpGet("kid/{kidId}")]
        public ActionResult<IEnumerable<Treatment>> GetTreatmentsByKidId(int kidId)
        {
            try
            {
                List<Treatment> treatments = _treatmentService.GetTreatmentsByKidId(kidId);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Treatments/kid/5/1
        [HttpGet("kid/{kidId}/{treatmentTypeId}")]
        public ActionResult<IEnumerable<Treatment>> GetTreatmentsByKidIdAndTreatmentId(int kidId,int treatmentTypeId)
        {
            try
            {
                List<Treatment> treatments = _treatmentService.GetTreatmentsByKidIdAndTreatmentId(kidId, treatmentTypeId);
                return Ok(treatments);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Treatments
        [HttpPost]
        public ActionResult<Treatment> PostTreatment( [FromBody] Treatment treatment)
        {
            try
            {
                int treatmentId = _treatmentService.AddTreatment(treatment);

                treatment.TreatmentId = treatmentId;

                return CreatedAtAction(nameof(GetTreatment), new { id = treatmentId }, treatment);
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

        // PUT: api/Treatments/5
        [HttpPut("{id}")]
        public IActionResult PutTreatment(int id, Treatment treatment)
        {
            if (id != treatment.TreatmentId)
            {
                return BadRequest("מזהה הטיפול בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _treatmentService.UpdateTreatment(treatment);

                if (updated)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"טיפול עם מזהה {id} לא נמצא");
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

        // DELETE: api/Treatments/5
        [HttpDelete("{id}")]
        public IActionResult DeleteTreatment(int id)
        {
            try
            {
                bool deleted = _treatmentService.DeleteTreatment(id);

                if (deleted)
                {
                    return NoContent();
                }
                else
                {
                    return NotFound($"טיפול עם מזהה {id} לא נמצא");
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



        //#################################for the tsha y3ne#######################################

        // GET: api/Treatments/summary/{kidId}
        //[HttpGet("summary/{kidId}")]
        //public ActionResult GetTreatmentSummary(int kidId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        //{
        //    try
        //    {
        //        Dictionary<string, object> parameters = new Dictionary<string, object>
        //{
        //    { "@KidId", kidId },
        //    { "@StartDate", startDate },
        //    { "@EndDate", endDate }
        //};

        //        DataSet result = _treatmentService.ExecuteDataSet("GetTreatmentSummaryForTSHA", parameters);

        //        return Ok(new
        //        {
        //            Types = ConvertDataTableToJson(result.Tables[0]),
        //            Trends = ConvertDataTableToJson(result.Tables[1])
        //        });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, $"שגיאה בהפקת סיכום הטיפולים: {ex.Message}");
        //    }
        //}

        //private List<Dictionary<string, object>> ConvertDataTableToJson(DataTable dt)
        //{
        //    List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
        //    foreach (DataRow dr in dt.Rows)
        //    {
        //        Dictionary<string, object> row = new Dictionary<string, object>();
        //        foreach (DataColumn col in dt.Columns)
        //        {
        //            row[col.ColumnName] = dr[col] != DBNull.Value ? dr[col] : null;
        //        }
        //        rows.Add(row);
        //    }
        //    return rows;
        //}


    }
}