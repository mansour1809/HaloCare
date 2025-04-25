using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]

    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _employeeService;
        private readonly EmailService _emailService;

        public EmployeesController(IConfiguration configuration)
        {
            _employeeService = new EmployeeService(configuration);
            _emailService = new EmailService(configuration);
        }

        // GET: api/Employees
        [HttpGet]
        public ActionResult<IEnumerable<Employee>> GetEmployees()
        {
            try
            {
                return Ok(_employeeService.GetAllEmployees());
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // GET: api/Employees/5
        [HttpGet("{id}")]
        public ActionResult<Employee> GetEmployee(int id)
        {
            try
            {
                Employee employee = _employeeService.GetEmployeeById(id);

                if (employee == null)
                {
                    return NotFound($"עובד עם מזהה {id} לא נמצא");
                }

                return Ok(employee);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה פנימית: {ex.Message}");
            }
        }

        // POST: api/Employees
        [HttpPost]
        public ActionResult<Employee> PostEmployee([FromBody] Employee employee)
        {
            try
            {
                int employeeId = _employeeService.AddEmployee(employee);

                employee.EmployeeId = employeeId;

                //return Ok(employee);

                return CreatedAtAction(nameof(GetEmployee), new { id = employeeId }, employee); //status 201
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאה : {ex.Message}");
            }
        }

        // PUT: api/Employees/5
        [HttpPut("{id}")]
        public IActionResult PutEmployee(int id, Employee employee)
        {
            if (id != employee.EmployeeId)
            {
                return BadRequest("מזהה העובד בנתיב אינו תואם למזהה בגוף הבקשה");
            }

            try
            {
                bool updated = _employeeService.UpdateEmployee(employee);

                if (updated)
                {
                    return Ok();
                }
                else
                {
                    return NotFound($"עובד עם מזהה {id} לא נמצא");
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

        // PATCH: api/Employees/5/deactivate
        [HttpPatch("{id}/deactivate")]
        public IActionResult DeactivateEmployee(int id, [FromBody] UpdateEmployeeStatusRequest status)
        {
            try
            {
                bool deactivated = _employeeService.DeactivateEmployee(id,status.IsActive);

                if (deactivated)
                {
                    return Ok();
                }
                else
                {
                    return NotFound($"עובד עם מזהה {id} לא נמצא");
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

        [HttpPost("sendWelcomeEmail")]
        public async Task<IActionResult> SendWelcomeEmail([FromBody] WelcomeEmailDto emailData)
        {
            try
            {
                // Await the async email service
                bool result = await _emailService.SendWelcomeEmail(
                    emailData.Email,
                    emailData.Password,
                    emailData.FirstName,
                    emailData.LastName,
                    emailData.LoginUrl
                );
                if (result)
                {
                    return Ok(new { success = true });
                }
                else
                {
                    return BadRequest(new { success = false, message = "שגיאה בשליחת המייל" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = $"שגיאה: {ex.Message}" });
            }
        }


        // class to send employee data
        public class WelcomeEmailDto
        {
            public string Email { get; set; }
            public string Password { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string LoginUrl { get; set; }
        }
        public class UpdateEmployeeStatusRequest
        {
            public bool IsActive { get; set; }
        }
    }

    
}