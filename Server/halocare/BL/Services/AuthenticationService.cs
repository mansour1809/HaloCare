using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace halocare.BL.Services
{
    public class AuthenticationService
    {
        private readonly IConfiguration _configuration;
        private readonly EmployeeService _employeeService;

        public AuthenticationService(IConfiguration configuration, EmployeeService employeeService)
        {
            _configuration = configuration;
            _employeeService = employeeService;
        }

        public AuthenticationResponse Authenticate(string email, string password)
        {
            try
            {
                // אימות המשתמש עם EmployeeService
                var user = _employeeService.Login(email, password);

                // אם האימות הצליח, מחזירים פרטי אימות עם חתימת JWT
                string token = GenerateJwtToken(user);

                return new AuthenticationResponse
                {
                    Id = user.EmployeeId,
                    Email = user.Email,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Role = user.RoleName,
                    Token = token
                };
            }
            catch (Exception)
            {
                // אם האימות נכשל, מחזירים שגיאה
                return null;
            }
        }

        private string GenerateJwtToken(Employee user)
        {
            // קבלת הגדרות JWT מה-configuration
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.EmployeeId.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.GivenName, user.FirstName),
                    new Claim(ClaimTypes.Surname, user.LastName),
                    new Claim(ClaimTypes.Role, user.RoleName)
                }),
                Expires = DateTime.UtcNow.AddMinutes(Convert.ToDouble(_configuration["Jwt:DurationInMinutes"])),
                Issuer = _configuration["Jwt:Issuer"],
                Audience = _configuration["Jwt:Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }

    public class AuthenticationResponse
    {
        public int Id { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }
        public string Token { get; set; }
    }
}