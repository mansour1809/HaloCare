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
        private readonly EmployeeService _employeeService;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
            _employeeService = new EmployeeService(configuration);

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

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordModel model)
        {
            try
            {
                // בדיקה אם האימייל קיים במערכת ושליחת אימייל עם סיסמה חדשה
                bool isSuccess = _authService.ResetPassword(model.Email);

                if (!isSuccess)
                {
                    return NotFound("כתובת האימייל לא נמצאה במערכת או שאירעה שגיאה בשליחת האימייל");
                }

                return Ok(new { message = "נשלח אימייל עם סיסמה חדשה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאת שרת: {ex.Message}");
            }
        }

        [HttpPost("change-password")]
        public IActionResult ChangePassword([FromBody] ChangePasswordModel model)
        {
            try
            {
                bool isSuccess = _authService.ChangePassword(model.EmployeeId, model.CurrentPassword, model.NewPassword);

                if (!isSuccess)
                {
                    return BadRequest("הסיסמה הנוכחית אינה נכונה או שאירעה שגיאה בעדכון הסיסמה");
                }

                return Ok(new { message = "הסיסמה עודכנה בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאת שרת: {ex.Message}");
            }
        }

        [HttpPost("send-welcome-email")]
        public IActionResult SendWelcomeEmail([FromBody] WelcomeEmailModel model)
        {
            try
            {
                bool isSuccess = _employeeService.SendWelcomeEmail(
                    model.Email,
                    model.Password,
                    model.FirstName,
                    model.LastName,
                    model.LoginUrl
                );

                if (!isSuccess)
                {
                    return StatusCode(500, "אירעה שגיאה בשליחת האימייל");
                }

                return Ok(new { message = "אימייל ברוכים הבאים נשלח בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאת שרת: {ex.Message}");
            }
        }
    }

    // מודלים
    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }


}

// מודל הכניסה למערכת
public class LoginModel
{
    public string Email { get; set; }
    public string Password { get; set; }
}
public class ResetPasswordModel
{
    public string Email { get; set; }
}

public class ChangePasswordModel
{
    public int EmployeeId { get; set; }
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}

public class WelcomeEmailModel
{
    public string Email { get; set; }
    public string Password { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string LoginUrl { get; set; }
}
