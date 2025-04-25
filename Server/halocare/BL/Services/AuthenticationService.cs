using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using halocare.DAL.Models;
using halocare.BL.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using halocare.DAL.Repositories;
using System.Net.Mail;
using System.Net;

namespace halocare.BL.Services
{
    public class AuthenticationService
    {
        private readonly EmployeeService _employeeService;
        private readonly IConfiguration _configuration;
        private readonly EmployeeRepository _employeeRepository;

        public AuthenticationService(IConfiguration configuration)
        {
            _employeeService = new EmployeeService(configuration);
            _configuration = configuration;
            _employeeRepository = new EmployeeRepository(configuration);

        }

        public Employee Authenticate(string email, string password)
        {
            try
            {
                
                //validate employee 
                Employee employee = _employeeService.Login(email, password);
                return employee;
            }
            catch (ArgumentException)
            {

                //return null (not throwing exeption) to handle it in controller
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
                expires: DateTime.Now.AddHours(12), // תוקף הטוקן - 12 שעות
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }




        public string GeneratePasswordResetToken(string email)
        {
            var jwtKey = _configuration["Jwt:Key"];
            var jwtIssuer = _configuration["Jwt:Issuer"];
            var jwtAudience = _configuration["Jwt:Audience"];

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, email),
                new Claim("purpose", "password-reset") // מציין שזה טוקן לאיפוס סיסמה
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.Now.AddHours(1), // תוקף קצר יחסית - שעה אחת
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public bool ValidatePasswordResetToken(string token, out string email)
        {
            email = null; // ערך ברירת מחדל
            try
            {
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];

                var tokenHandler = new JwtSecurityTokenHandler();

                // בדיקה בסיסית אם זה בכלל טוקן תקין
                if (!tokenHandler.CanReadToken(token))
                {
                    return false;
                }

                // קריאת הטוקן ישירות לפני הוולידציה כדי לחלץ את הקלייימים
                var jwtToken = tokenHandler.ReadJwtToken(token);

                // בדיקה אם ה-claim של המייל קיים
                var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == JwtRegisteredClaimNames.Email);
                if (emailClaim == null)
                {
                    return false; // אין טענת אימייל בטוקן
                }

                // חילוץ האימייל מהטוקן
                email = emailClaim.Value;

                // בדיקה אם המטרה של הטוקן היא איפוס סיסמה
                var purposeClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "purpose");
                if (purposeClaim == null || purposeClaim.Value != "password-reset")
                {
                    return false; // זה לא טוקן לאיפוס סיסמה
                }

                // וולידציה מלאה של הטוקן
                var key = Encoding.ASCII.GetBytes(jwtKey);
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = jwtIssuer,
                    ValidateAudience = true,
                    ValidAudience = jwtAudience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };

                // בדיקת תקינות הטוקן
                tokenHandler.ValidateToken(token, validationParameters, out _);

                return true;
            }
            catch (Exception ex)
            {
                // הוספת לוג של השגיאה לצורכי דיבוג
                Console.WriteLine($"Token validation error: {ex.Message}");
                return false;
            }
        }
    }
}