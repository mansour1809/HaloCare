using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using halocare.DAL.Models;
using halocare.BL.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using halocare.DAL.Repositories;

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
        public bool ResetPassword(string email)
        {
            // 1. בדיקה אם האימייל קיים במערכת
            var employee = _employeeRepository.GetEmployeeByEmail(email);
            if (employee == null)
                return false;

            // 2. יצירת סיסמה אקראית חדשה
            string newPassword = GenerateRandomPassword();

            // 3. עדכון הסיסמה במסד הנתונים
            _employeeRepository.UpdatePassword(employee.EmployeeId, HashPassword(newPassword));

            // 4. שליחת אימייל עם הסיסמה החדשה
            SendPasswordResetEmail(email, newPassword, employee.FirstName);

            return true;
        }

        public bool ChangePassword(int employeeId, string currentPassword, string newPassword)
        {
            // 1. בדיקה אם המשתמש קיים
            var employee = _employeeRepository.GetEmployeeById(employeeId);
            if (employee == null)
                return false;

            // 2. אימות הסיסמה הנוכחית
            if (!VerifyPassword(currentPassword, employee.Password))
                return false;

            // 3. עדכון הסיסמה החדשה
            _employeeRepository.UpdatePassword(employeeId, HashPassword(newPassword));

            return true;
        }

        // פונקציות עזר
        private string GenerateRandomPassword(int length = 8)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private void SendPasswordResetEmail(string email, string newPassword, string firstName)
        {
            // כאן יש להוסיף קוד לשליחת אימייל עם הסיסמה החדשה
            // לדוגמה, אפשר להשתמש ב-MailKit או בספריית SMTP אחרת
        }
    }
}