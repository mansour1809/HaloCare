using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Net.Mail;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class EmployeeService
    {
        private readonly EmployeeRepository _employeeRepository;
        private readonly RoleRepository _roleRepository;
        private readonly IConfiguration _configuration;

        public EmployeeService(IConfiguration configuration)
        {
            _configuration = configuration;
            _employeeRepository = new EmployeeRepository(configuration);
            _roleRepository = new RoleRepository(configuration);
        }

        public List<Employee> GetAllEmployees()
        {
            return _employeeRepository.GetAllEmployees();
        }

        public Employee GetEmployeeById(int id)
        {
            return _employeeRepository.GetEmployeeById(id);
        }

        public Employee GetEmployeeByEmail(string email)
        {
            return _employeeRepository.GetEmployeeByEmail(email);
        }

        public int AddEmployee(Employee employee)
        {
            // וידוא שהתפקיד קיים
            Role role = _roleRepository.GetRoleByName(employee.RoleName);
            if (role == null)
            {
                throw new ArgumentException("התפקיד שצוין אינו קיים במערכת");
            }

            // הצפנת הסיסמה
            employee.Password = HashPassword(employee.Password);

            // הגדרת העובד כפעיל כברירת מחדל
            employee.IsActive = true;

            // הגדרת תאריך תחילת עבודה
            if (employee.StartDate == DateTime.MinValue)
            {
                employee.StartDate = DateTime.Now;
            }

            int employeeId = _employeeRepository.AddEmployee(employee);

            //// אם העובד נוצר בהצלחה והוגדרה סיסמה, שלח מייל ברוכים הבאים
            //if (employeeId > 0 && !string.IsNullOrEmpty(employee.Password))
            //{
            //    // שליחת אימייל ברוכים הבאים עם פרטי התחברות
            //    SendWelcomeEmail(employee.Email, employee.Password, employee.FirstName, employee.LastName);
            //}

            return employeeId;
        }

        public bool UpdateEmployee(Employee employee)
        {
            // וידוא שהעובד קיים
            Employee existingEmployee = _employeeRepository.GetEmployeeById(employee.EmployeeId);
            if (existingEmployee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }

            // אם הסיסמה שונתה, הצפן אותה
            if (employee.Password != existingEmployee.Password)
            {
                employee.Password = HashPassword(employee.Password);
            }

            return _employeeRepository.UpdateEmployee(employee);
        }

        public bool DeactivateEmployee(int id)
        {
            // וידוא שהעובד קיים
            Employee existingEmployee = _employeeRepository.GetEmployeeById(id);
            if (existingEmployee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }

            return _employeeRepository.DeactivateEmployee(id);
        }

        //public bool UpdatePassword(int employeeId, string hashedPassword)
        //{
        //    return _employeeRepository.UpdatePassword(employeeId, hashedPassword);
        //}

        public Employee Login(string email, string password)
        {
            // קבלת העובד לפי אימייל
            Employee employee = _employeeRepository.GetEmployeeByEmail(email);
            if (employee == null)
            {
                throw new ArgumentException("שם המשתמש או הסיסמה אינם נכונים");
            }

            // בדיקת סיסמה
            string hashedPassword = HashPassword(password);
            if (!employee.Password.Equals(hashedPassword))
            {
                throw new ArgumentException("שם המשתמש או הסיסמה אינם נכונים");
            }

            // וידוא שהעובד פעיל
            if (!employee.IsActive)
            {
                throw new ArgumentException("המשתמש אינו פעיל במערכת");
            }

            return employee;
        }

        // פונקציית שליחת אימייל ברוכים הבאים
        //public bool SendWelcomeEmail(string email, string password, string firstName, string lastName, string loginUrl = null)
        //{
        //    try
        //    {
        //        // קבלת הגדרות SMTP מה-configuration
        //        string smtpServer = _configuration["EmailSettings:SmtpServer"];
        //        int smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"]);
        //        string smtpUsername = _configuration["EmailSettings:Username"];
        //        string smtpPassword = _configuration["EmailSettings:Password"];
        //        string senderEmail = _configuration["EmailSettings:SenderEmail"];
        //        string senderName = _configuration["EmailSettings:SenderName"];

        //        // אם לא הועבר URL התחברות, השתמש בכתובת ברירת מחדל
        //        if (string.IsNullOrEmpty(loginUrl))
        //        {
        //            loginUrl = _configuration["AppSettings:DefaultLoginUrl"];
        //        }

        //        using (var client = new SmtpClient(smtpServer, smtpPort))
        //        {
        //            client.UseDefaultCredentials = false;
        //            client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
        //            client.EnableSsl = true;

        //            MailMessage message = new MailMessage();
        //            message.From = new MailAddress(senderEmail, senderName);
        //            message.To.Add(email);
        //            message.Subject = "ברוכים הבאים למערכת Halo Care";
        //            message.Body = $@"
        //                <html>
        //                <body dir='rtl'>
        //                    <h2>שלום {firstName} {lastName},</h2>
        //                    <p>ברוכים הבאים למערכת Halo Care!</p>
        //                    <p>להלן פרטי ההתחברות שלך למערכת:</p>
        //                    <ul>
        //                        <li><strong>שם משתמש:</strong> {email}</li>
        //                        <li><strong>סיסמה:</strong> {password}</li>
        //                    </ul>
        //                    <p>לכניסה למערכת <a href='{loginUrl}'>לחץ כאן</a>.</p>
        //                    <p>בברכה,<br>צוות Halo Care</p>
        //                </body>
        //                </html>";
        //            message.IsBodyHtml = true;

        //            client.Send(message);
        //        }

        //        return true;
        //    }
        //    catch (Exception ex)
        //    {
        //        Console.WriteLine($"שגיאה בשליחת אימייל: {ex.Message}");
        //        return false;
        //    }
        //}

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