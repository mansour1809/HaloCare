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
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _employeeService;

        public EmployeesController(IConfiguration configuration)
        {
            _employeeService = new EmployeeService(configuration);
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
                var employee = _employeeService.GetEmployeeById(id);

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
        public ActionResult<Employee> PostEmployee(Employee employee)
        {
            try
            {
                int employeeId = _employeeService.AddEmployee(employee);
                employee.EmployeeId = employeeId;
                return CreatedAtAction(nameof(GetEmployee), new { id = employeeId }, employee);
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
                    return NoContent();
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
        public IActionResult DeactivateEmployee(int id)
        {
            try
            {
                bool deactivated = _employeeService.DeactivateEmployee(id);

                if (deactivated)
                {
                    return NoContent();
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

        // POST: api/Employees/login
        [HttpPost("login")]
        public ActionResult<Employee> Login([FromBody] LoginModel loginModel)
        {
            try
            {
                var employee = _employeeService.Login(loginModel.Email, loginModel.Password);
                return Ok(employee);
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

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}