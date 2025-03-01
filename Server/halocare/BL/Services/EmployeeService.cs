using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;

namespace halocare.BL.Services
{
    public class EmployeeService
    {
        private readonly EmployeeRepository _employeeRepository;
        private readonly RoleRepository _roleRepository;

        public EmployeeService(IConfiguration configuration)
        {
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

            return _employeeRepository.AddEmployee(employee);
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

        public Employee Login(string email, string password)
        {
            // קבלת כל העובדים
            List<Employee> employees = _employeeRepository.GetAllEmployees();

            // מציאת העובד לפי אימייל
            Employee employee = employees.Find(e => e.Email.Equals(email, StringComparison.OrdinalIgnoreCase));
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