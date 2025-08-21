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
        private readonly IConfiguration _configuration;

        public AuthController(IConfiguration configuration)
        {
            _authService = new AuthenticationService(configuration);
            _employeeService = new EmployeeService(configuration);
            _emailService = new EmailService(configuration);
            _configuration = configuration;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel model)
        {
            try
            {
                // authinticate
                Employee employee = _authService.Authenticate(model.Email, model.Password);

                if (employee == null)
                {
                    return Unauthorized("אימייל או סיסמה לא נכונים");
                }


                // generate jwt
                var token = _authService.GenerateJwtToken(employee);

                // returning token beside some details
                return Ok(new
                {
                    token,
                    id = employee.EmployeeId,
                    firstName = $"{employee.FirstName} ",
                    lastName = $"{employee.LastName}",
                    role = employee.RoleName,
                    photo = employee.Photo,
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
            var baseUrl = _configuration["AppSettings:ClientUrl"];
            try
            {
                // check if employee exist
                Employee employee =  _employeeService.GetEmployeeByEmail(request.Email);
                if (employee == null)
                {
                    return Ok(new { success = true, message = "אם המייל קיים במערכת, נשלח קישור לאיפוס סיסמה" });
                }

                // generate jwt for reseting pass
                string resetToken = _authService.GeneratePasswordResetToken(request.Email);

                bool emailSent = await _emailService.SendPasswordResetEmail(
                    request.Email,
                    resetToken,
                    $"{baseUrl}/#/reset-password"
                    // "https://proj.ruppin.ac.il/bgroup3/prod/#/reset-password" 
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
        public ActionResult ResetPassword([FromBody] PasswordResetDto reset)
        {
            try
            {
                // validate the token and take the email from it
                if (!_authService.ValidatePasswordResetToken(reset.Token, out string email))
                {
                    return BadRequest(new { success = false, message = "קישור לא תקין או שפג תוקפו" });
                }

                // validate that emails are equal
                if (email != reset.Email)
                {
                    return BadRequest(new { success = false, message = "נתונים לא תקינים" });
                }

                // update pass
                Employee employee = _employeeService.GetEmployeeByEmail(email);

                if (employee == null)
                {
                    return BadRequest(new { success = false, message = "משתמש לא נמצא" });
                }
               
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

