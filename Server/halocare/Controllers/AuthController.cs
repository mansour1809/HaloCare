using System;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using halocare.BL.Services;
using halocare.DAL.Models;
using Microsoft.AspNetCore.Authorization;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize]

    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authService;
        private readonly EmployeeService _employeeService;
        private readonly EmailService _emailService;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
            _employeeService = new EmployeeService(configuration);
            _emailService = new EmailService(configuration);


        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            try
            {
                // אימות המשתמש
                Employee employee = _authService.Authenticate(model.Email, model.Password);

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
                    firstName = $"{employee.FirstName} ",
                    lastName = $"{employee.LastName}",
                    role = employee.RoleName
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"שגיאת שרת: {ex.Message}");
            }
        }

        [HttpPost("request-password-reset")]
        public async Task<ActionResult> RequestPasswordReset([FromBody] PasswordResetRequest request)
        {
            try
            {
                // בדוק אם המשתמש קיים במערכת
                var employee =  _employeeService.GetEmployeeByEmail(request.Email);
                if (employee == null)
                {
                    // לא מגלים אם המשתמש קיים או לא מסיבות אבטחה
                    return Ok(new { success = true, message = "אם המייל קיים במערכת, נשלח קישור לאיפוס סיסמה" });
                }

                // יצירת טוקן JWT לאיפוס סיסמה
                string resetToken = _authService.GeneratePasswordResetToken(request.Email);

                // שליחת המייל
                bool emailSent = await _emailService.SendPasswordResetEmail(
                    request.Email,
                    resetToken,
                    "http://localhost:5173/reset-password" // כתובת הפרונטאנד
                );

                if (emailSent)
                {
                    return Ok(new { success = true, message = "קישור לאיפוס סיסמה נשלח למייל" });
                }
                else
                {
                    return StatusCode(500, new { success = false, message = "שגיאה בשליחת המייל" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }

        [HttpPost("reset-password")]
        public async Task<ActionResult> ResetPassword([FromBody] PasswordResetDto reset)
        {
            try
            {
                // בדיקת תקינות הטוקן וקבלת האימייל ממנו
                if (!_authService.ValidatePasswordResetToken(reset.Token, out string email))
                {
                    return BadRequest(new { success = false, message = "קישור לא תקין או שפג תוקפו" });
                }

                // וידוא שהאימייל בטוקן תואם את האימייל שנשלח
                if (email != reset.Email)
                {
                    return BadRequest(new { success = false, message = "נתונים לא תקינים" });
                }

                // עדכון הסיסמה
                var employee =  _employeeService.GetEmployeeByEmail(email);
                if (employee == null)
                {
                    return BadRequest(new { success = false, message = "משתמש לא נמצא" });
                }

                // שמירת הסיסמה החדשה (יש לממש זאת בשירות העובדים)
                 _employeeService.UpdatePassword(employee.EmployeeId, reset.NewPassword);

                return Ok(new { success = true, message = "הסיסמה עודכנה בהצלחה" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, message = ex.Message });
            }
        }


        public class LoginModel
        {
            public string Email { get; set; }
            public string Password { get; set; }
        }
        public class PasswordResetDto
        {
            public string Email { get; set; }
            public string Token { get; set; }
            public string NewPassword { get; set; }
        }
        public class PasswordResetRequest
        {
            public string Email { get; set; }
        }
    }
}

