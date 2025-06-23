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

    public class ReferenceDataController : ControllerBase
    {
        private readonly ReferenceDataService _referenceDataService;

        public ReferenceDataController(IConfiguration configuration)
        {
            _referenceDataService = new ReferenceDataService(configuration);
        }


        [HttpGet("test-error")]
        public IActionResult TestError()
        {
            // throw an exception to test middleware
            throw new Exception("This is a test exception to verify middleware is working");
        }

        // GET: api/ReferenceData/cities
        [HttpGet("cities")]
        public ActionResult<IEnumerable<City>> GetCities()
        {
            try
            {
                return Ok(_referenceDataService.GetAllCities());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/cities/{name}
        [HttpGet("cities/{name}")]
        public ActionResult<City> GetCityByName(string name)
        {
            try
            {
                var city = _referenceDataService.GetCityByName(name);

                if (city == null)
                {
                    return NotFound($"עיר בשם {name} לא נמצאה");
                }

                return Ok(city);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/ReferenceData/cities
        [HttpPost("cities")]
        public ActionResult<City> PostCity(City city)
        {
            try
            {
                bool added = _referenceDataService.AddCity(city);

                if (added)
                {
                    return CreatedAtAction(nameof(GetCityByName), new { name = city.CityName }, city);
                }
                else
                {
                    return BadRequest("לא ניתן להוסיף את העיר");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/healthinsurances
        [HttpGet("healthinsurances")]
        public ActionResult<IEnumerable<HealthInsurance>> GetHealthInsurances()
        {
            try
            {
                return Ok(_referenceDataService.GetAllHealthInsurances());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/healthinsurances/{name}
        [HttpGet("healthinsurances/{name}")]
        public ActionResult<HealthInsurance> GetHealthInsuranceByName(string name)
        {
            try
            {
                var healthInsurance = _referenceDataService.GetHealthInsuranceByName(name);

                if (healthInsurance == null)
                {
                    return NotFound($"קופת חולים בשם {name} לא נמצאה");
                }

                return Ok(healthInsurance);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/ReferenceData/healthinsurances
        [HttpPost("healthinsurances")]
        public ActionResult<HealthInsurance> PostHealthInsurance(HealthInsurance healthInsurance)
        {
            try
            {
                bool added = _referenceDataService.AddHealthInsurance(healthInsurance);

                if (added)
                {
                    return CreatedAtAction(nameof(GetHealthInsuranceByName), new { name = healthInsurance.HName }, healthInsurance);
                }
                else
                {
                    return BadRequest("לא ניתן להוסיף את קופת החולים");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/treatmenttypes
        [HttpGet("treatmenttypes")]
        public ActionResult<IEnumerable<TreatmentType>> GetTreatmentTypes()
        {
            try
            {
                return Ok(_referenceDataService.GetAllTreatmentTypes());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/treatmenttypes/{name}
        [HttpGet("treatmenttypes/{typeId}")]
        public ActionResult<TreatmentType> GetTreatmentTypeById(int typeId)
        {
            try
            {
                var treatmentType = _referenceDataService.GetTreatmentTypeById(typeId);

                if (treatmentType == null)
                {
                    return NotFound($"סוג טיפול בשם {typeId} לא נמצא");
                }

                return Ok(treatmentType);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/ReferenceData/treatmenttypes
        [HttpPost("treatmenttypes")]
        public ActionResult<TreatmentType> PostTreatmentType(TreatmentType treatmentType)
        {
            try
            {
                bool added = _referenceDataService.AddTreatmentType(treatmentType);

                if (added)
                {
                    return CreatedAtAction(nameof(GetTreatmentTypeById), new { name = treatmentType.TreatmentTypeName }, treatmentType);
                }
                else
                {
                    return BadRequest("לא ניתן להוסיף את סוג הטיפול");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/roles
        [HttpGet("roles")]
        public ActionResult<IEnumerable<Role>> GetRoles()
        {
            try
            {
                return Ok(_referenceDataService.GetAllRoles());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/ReferenceData/roles/{name}
        [HttpGet("roles/{name}")]
        public ActionResult<Role> GetRoleByName(string name)
        {
            try
            {
                var role = _referenceDataService.GetRoleByName(name);

                if (role == null)
                {
                    return NotFound($"תפקיד בשם {name} לא נמצא");
                }

                return Ok(role);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/ReferenceData/roles
        [HttpPost("roles")]
        public ActionResult<Role> PostRole(Role role)
        {
            try
            {
                bool added = _referenceDataService.AddRole(role);

                if (added)
                {
                    return CreatedAtAction(nameof(GetRoleByName), new { name = role.RoleName }, role);
                }
                else
                {
                    return BadRequest("לא ניתן להוסיף את התפקיד");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }




        // PUT: api/ReferenceData/cities/{oldName}
        [HttpPut("cities/{oldName}")]
        public ActionResult<City> UpdateCity(string oldName, [FromBody] UpdateCityRequest request)
        {
            try
            {
                bool updated = _referenceDataService.UpdateCity(oldName, request.NewCityName);

                if (updated)
                {
                    var updatedCity = new City { CityName = request.NewCityName };
                    return Ok(updatedCity);
                }
                else
                {
                    return NotFound($"עיר בשם {oldName} לא נמצאה");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // PUT: api/ReferenceData/healthinsurances/{oldName}
        [HttpPut("healthinsurances/{oldName}")]
        public ActionResult<HealthInsurance> UpdateHealthInsurance(string oldName, [FromBody] UpdateHealthInsuranceRequest request)
        {
            try
            {
                bool updated = _referenceDataService.UpdateHealthInsurance(oldName, request.NewHName);

                if (updated)
                {
                    var updatedHealthInsurance = new HealthInsurance { HName = request.NewHName };
                    return Ok(updatedHealthInsurance);
                }
                else
                {
                    return NotFound($"קופת חולים בשם {oldName} לא נמצאה");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // PUT: api/ReferenceData/treatmenttypes/{id}
        [HttpPut("treatmenttypes/{id}")]
        public ActionResult<TreatmentType> UpdateTreatmentType(int id, [FromBody] UpdateTreatmentTypeRequest request)
        {
            try
            {
                bool updated = _referenceDataService.UpdateTreatmentType(id, request.NewTreatmentTypeName);

                if (updated)
                {
                    var updatedTreatmentType = _referenceDataService.GetTreatmentTypeById(id);
                    return Ok(updatedTreatmentType);
                }
                else
                {
                    return NotFound($"סוג טיפול עם מזהה {id} לא נמצא");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        
        public class UpdateCityRequest
        {
            public string NewCityName { get; set; }
        }

        public class UpdateHealthInsuranceRequest
        {
            public string NewHName { get; set; }
        }

        public class UpdateTreatmentTypeRequest
        {
            public string NewTreatmentTypeName { get; set; }
        }

        public class UpdateRoleRequest
        {
            public string NewRoleName { get; set; }
        }
    }
}