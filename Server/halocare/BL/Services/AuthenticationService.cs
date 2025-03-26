using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using halocare.DAL.Models;
using halocare.BL.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace halocare.BL.Services
{
    public class AuthenticationService
    {
        private readonly EmployeeService _employeeService;
        private readonly IConfiguration _configuration;

        public AuthenticationService(IConfiguration configuration)
        {
            _employeeService = new EmployeeService(configuration);
            _configuration = configuration;
        }

        public Employee Authenticate(string email, string password)
        {
            try
            {
                
                // נשתמש במתודה הקיימת ב-EmployeeService לאימות
                Employee employee = _employeeService.Login(email, password);
                return employee;
            }
            catch (ArgumentException)
            {
                // המתודה Login זורקת חריגה אם האימות נכשל
                // נחזיר null במקום לזרוק חריגה כדי לאפשר טיפול מסודר ב-Controller
                return null;
            }
        }

        public string GenerateJwtToken(Employee employee)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, employee.EmployeeId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, employee.Email),
                new Claim(ClaimTypes.Name, $"{employee.FirstName} {employee.LastName}"),
                new Claim(ClaimTypes.Role, employee.RoleName)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(24), // תוקף הטוקן - 24 שעות
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}