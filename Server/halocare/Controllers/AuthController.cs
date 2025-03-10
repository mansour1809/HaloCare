using Microsoft.AspNetCore.Mvc;
using halocare.BL.Services;
using Microsoft.AspNetCore.Authentication;

namespace halocare.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthenticationService _authenticationService;

        public AuthController(AuthenticationService authenticationService)
        {
            _authenticationService = authenticationService;
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest model)
        {
            var response = _authenticationService.Authenticate(model.Email, model.Password);

            if (response == null)
                return Unauthorized(new { message = "שם משתמש או סיסמה שגויים" });

            return Ok(response);
        }
    }

    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}