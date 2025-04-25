using System;
using System.Collections.Generic;
using System.Data;
using System.Net.NetworkInformation;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class EmployeeRepository : DBService
    {
        public EmployeeRepository(IConfiguration configuration) : base(configuration) { }

        public List<Employee> GetAllEmployees()
        {
            List<Employee> employees = new List<Employee>();

            DataTable dataTable = ExecuteQuery("SP_GetAllEmployees");

            foreach (DataRow row in dataTable.Rows)
            {
                Employee employee = MapToEmployee(row);

                employees.Add(employee);
            }

            return employees;
        }

        public Employee GetEmployeeById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetEmployeeById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Employee employee = MapToEmployee(row);


            return employee;
        }

        public int AddEmployee(Employee employee)
        {

            Dictionary<string, object> parameters = new Dictionary<string, object>
    {
        { "@FirstName", employee.FirstName },
        { "@LastName", employee.LastName },
        { "@BirthDate", employee.BirthDate ??(object) DBNull.Value },
        { "@MobilePhone", employee.MobilePhone },
        { "@Email", employee.Email },
        { "@Password", employee.Password },
        { "@Photo", employee.Photo },
        { "@LicenseNum", employee.LicenseNum },
        { "@StartDate", employee.StartDate ?? (object)DBNull.Value},
        { "@IsActive", employee.IsActive },
        { "@ClassId", employee.ClassId ?? (object)DBNull.Value },
        { "@RoleName", employee.RoleName },
        { "@CityName", employee.CityName }
    };

            return Convert.ToInt32(ExecuteScalar("SP_AddEmployee", parameters));
        }

        public bool UpdateEmployee(Employee employee)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", employee.EmployeeId },
                { "@FirstName", employee.FirstName },
                { "@LastName", employee.LastName },
                { "@BirthDate", employee.BirthDate },
                { "@MobilePhone", employee.MobilePhone },
                { "@Email", employee.Email },
                //{ "@Password", employee.Password },
                { "@PhotoPath", employee.Photo },
                { "@LicenseNum", employee.LicenseNum },
                { "@StartDate", employee.StartDate },
                { "@IsActive", employee.IsActive },
                { "@ClassId", employee.ClassId },
                { "@RoleName", employee.RoleName },
                { "@CityName", employee.CityName }

            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEmployee", parameters);
            return rowsAffected > 0;
        }

        
        public bool DeactivateEmployee(int id, bool status)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", id },
                { "@IsActive", status }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEmployeeStatus", parameters);
            return rowsAffected > 0;
        }
     
        public Employee Login(string email, string password)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Email", email },
                { "@Password", password }
            };

            DataTable dataTable = ExecuteQuery("SP_Login", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Employee employee = MapToEmployee(row);

            return employee;
        }
        public Employee GetEmployeeByEmail(string email)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Email", email }
            };

            DataTable dataTable = ExecuteQuery("SP_GetEmployeeByEmail", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            return MapToEmployee(dataTable.Rows[0]);
        }


        //// הוספנו מתודה לעדכון סיסמה
        public bool UpdatePassword(int employeeId, string hashedPassword)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", employeeId },
                { "@Password", hashedPassword }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEmployeePassword", parameters);
            return rowsAffected > 0;
        }

        // פונקציית עזר למיפוי תוצאות שאילתה לאובייקט Employee
        private Employee MapToEmployee(DataRow row)
        {
            return new Employee
            {
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                FirstName = row["FirstName"].ToString(),
                LastName = row["LastName"].ToString(),
                BirthDate = row["BirthDate"] != DBNull.Value ?  Convert.ToDateTime(row["BirthDate"]) : null,
                MobilePhone = row["MobilePhone"] != DBNull.Value ? row["MobilePhone"].ToString() : "",
                Email = row["Email"].ToString(),
                Password = row["Password"].ToString(),
                Photo = row["photoPath"].ToString(),
                LicenseNum = row["LicenseNum"] != DBNull.Value ? row["LicenseNum"].ToString() : "",
                StartDate = row["StartDate"] != DBNull.Value ? Convert.ToDateTime(row["StartDate"]): null,
                IsActive = Convert.ToBoolean(row["IsActive"]),
                ClassId = row["ClassId"] != DBNull.Value ? Convert.ToInt32(row["ClassId"]) : null,
                RoleName = row["RoleName"].ToString(),
                CityName = row["city"].ToString()
            };
        }
    }
}