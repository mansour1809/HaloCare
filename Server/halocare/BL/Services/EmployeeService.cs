using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Net;
using System.Net.Mail;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

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

        public Employee GetEmployeeByEmail(string email)
        {
            return _employeeRepository.GetEmployeeByEmail(email);
        }

        public int AddEmployee(Employee employee)
        {
            // check if the role exist
            Role role = _roleRepository.GetRoleByName(employee.RoleName);
            if (role == null)
            {
                throw new ArgumentException("התפקיד שצוין אינו קיים במערכת");
            }

            Employee alreadyExist = _employeeRepository.GetEmployeeByEmail(employee.Email);
            if (alreadyExist != null)
            {
                throw new ArgumentException("הדואר האלקטרוני כבר קיים במערכת");
            }

            // hashing password
            employee.Password = HashPassword(employee.Password);

            // default
            employee.IsActive = true;


            return _employeeRepository.AddEmployee(employee);
        }

        public bool UpdateEmployee(Employee employee)
        {
            // check if employee exist
            Employee existingEmployee = _employeeRepository.GetEmployeeById(employee.EmployeeId);

            if (existingEmployee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }

            // if password - hash it
            if (employee.Password != existingEmployee.Password)
            {
                employee.Password = HashPassword(employee.Password);
            }

            return _employeeRepository.UpdateEmployee(employee);
        }

        public bool DeactivateEmployee(int id, bool status)
        {
            // check if exist
            Employee existingEmployee = _employeeRepository.GetEmployeeById(id);
            if (existingEmployee == null)
            {
                throw new ArgumentException("העובד לא נמצא במערכת");
            }

            return _employeeRepository.DeactivateEmployee(id, status);
        }



        public Employee Login(string email, string password)
        {
            // Retrieve employee by email
            Employee employee = _employeeRepository.GetEmployeeByEmail(email);
            if (employee == null)
            {
                throw new ArgumentException("שם המשתמש או הסיסמה אינם נכונים");
            }

            // Check password
            string hashedPassword = HashPassword(password);

            if (!employee.Password.Equals(hashedPassword))
            {
                throw new ArgumentException("שם המשתמש או הסיסמה אינם נכונים");
            }

            // Verify employee is active
            if (!employee.IsActive)
            {
                throw new ArgumentException("המשתמש אינו פעיל במערכת");
            }

            return employee;
        }




        public bool UpdatePassword(int employeeId, string hashedPassword)
        {
            hashedPassword = HashPassword(hashedPassword);
            return _employeeRepository.UpdatePassword(employeeId, hashedPassword);
        } 
        
        //public bool UpdatePasswordProvidedCurrent(int employeeId, string hashedPassword)
        //{
        //    return _employeeRepository.UpdatePassword(employeeId, hashedPassword);
        //}
        public bool UpdateEmail(int employeeId, string newEmail)
        {
            return _employeeRepository.UpdateEmail(employeeId, newEmail);
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