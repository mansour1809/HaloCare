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
                // Validate employee credentials
                Employee employee = _employeeService.Login(email, password);
                return employee;
            }
            catch (ArgumentException)
            {
                // Return null (instead of throwing exception) to handle it in the controller
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
            email = null; // Default value
            try
            {
                var jwtKey = _configuration["Jwt:Key"];
                var jwtIssuer = _configuration["Jwt:Issuer"];
                var jwtAudience = _configuration["Jwt:Audience"];

                var tokenHandler = new JwtSecurityTokenHandler();

                // Basic check if the token can be read
                if (!tokenHandler.CanReadToken(token))
                {
                    return false;
                }

                // Read the token directly before validation to extract claims
                var jwtToken = tokenHandler.ReadJwtToken(token);

                // Check if the email claim exists
                var emailClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "email" || c.Type == JwtRegisteredClaimNames.Email);
                if (emailClaim == null)
                {
                    return false; // No email claim found
                }

                // Extract email from token
                email = emailClaim.Value;

                // Check if token's purpose is password reset
                var purposeClaim = jwtToken.Claims.FirstOrDefault(c => c.Type == "purpose");
                if (purposeClaim == null || purposeClaim.Value != "password-reset")
                {
                    return false; // Not a password reset token
                }

                // Full token validation
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

                // Perform the actual validation
                tokenHandler.ValidateToken(token, validationParameters, out _);

                return true;
            }
            catch (Exception ex)
            {
                // Log the error for debugging purposes
                Console.WriteLine($"Token validation error: {ex.Message}");
                return false;
            }
        }
    }
}
