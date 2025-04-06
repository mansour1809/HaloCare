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
            string hashedPassword = HashPassword(newPassword);
            bool updated = _employeeRepository.UpdatePassword(employee.EmployeeId, hashedPassword);

            if (!updated)
                return false;

            // 4. שליחת אימייל עם הסיסמה החדשה
            bool emailSent = SendPasswordResetEmail(email, newPassword, employee.FirstName);

            return emailSent;
        }

        public bool ChangePassword(int employeeId, string currentPassword, string newPassword)
        {
            // 1. בדיקה אם המשתמש קיים
            var employee = _employeeRepository.GetEmployeeById(employeeId);
            if (employee == null)
                return false;

            // 2. אימות הסיסמה הנוכחית
            string hashedCurrentPassword = HashPassword(currentPassword);
            if (employee.Password != hashedCurrentPassword)
                return false;

            // 3. עדכון הסיסמה החדשה
            string hashedNewPassword = HashPassword(newPassword);
            return _employeeRepository.UpdatePassword(employeeId, hashedNewPassword);
        }

        // פונקציות עזר
        private string GenerateRandomPassword(int length = 8)
        {
            const string chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, length)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private bool SendPasswordResetEmail(string email, string newPassword, string firstName)
        {
            try
            {
                // קבלת הגדרות SMTP מה-configuration
                string smtpServer = _configuration["EmailSettings:SmtpServer"];
                int smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
                string smtpUsername = _configuration["EmailSettings:Username"];
                string smtpPassword = _configuration["EmailSettings:Password"];
                string senderEmail = _configuration["EmailSettings:SenderEmail"];
                string senderName = _configuration["EmailSettings:SenderName"];

                using (var client = new SmtpClient(smtpServer, smtpPort))
                {
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
                    client.EnableSsl = true;

                    MailMessage message = new MailMessage();
                    message.From = new MailAddress(senderEmail, senderName);
                    message.To.Add(email);
                    message.Subject = "איפוס סיסמה - Halo Care";
                    message.Body = $@"
                        <html>
                        <body dir='rtl'>
                            <h2>שלום {firstName},</h2>
                            <p>קיבלנו בקשה לאיפוס הסיסמה שלך במערכת.</p>
                            <p>הסיסמה החדשה שלך היא: <strong>{newPassword}</strong></p>
                            <p>מומלץ לשנות את הסיסמה מיד לאחר ההתחברות הראשונה.</p>
                            <p>בברכה,<br>צוות Halo Care</p>
                        </body>
                        </html>";
                    message.IsBodyHtml = true;

                    client.Send(message);
                }

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"שגיאה בשליחת אימייל: {ex.Message}");
                return false;
            }
        }

        private string HashPassword(string password)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                byte[] bytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < bytes.Length; i++)
                {
                    builder.Append(bytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
    }
}