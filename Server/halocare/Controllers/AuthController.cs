using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authService;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            try
            {
                // אימות המשתמש
                var employee = _authService.Authenticate(model.Email, model.Password);

                if (employee == null)
                {
                    return Unauthorized("אימייל או סיסמה לא נכונים");
                }

                // יצירת טוקן JWT
                var token = _authService.GenerateJwtToken(employee);

                // החזרת הטוקן למשתמש יחד עם מידע בסיסי על העובד
                return Ok(new
                {
                    token,
                    id = employee.EmployeeId,
                    name = $"{employee.FirstName} {employee.LastName}",
                    role = employee.RoleName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאת שרת: {ex.Message}");
            }
        }
    }

    // מודל הכניסה למערכת
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}