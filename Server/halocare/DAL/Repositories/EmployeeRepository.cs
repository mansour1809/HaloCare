using System;
using System.Collections.Generic;
using System.Data;
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
                Employee employee = new Employee
                {
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    FirstName = row["FirstName"].ToString(),
                    LastName = row["LastName"].ToString(),
                    BirthDate = Convert.ToDateTime(row["BirthDate"]),
                    MobilePhone = row["MobilePhone"].ToString(),
                    Email = row["Email"].ToString(),
                    Password = row["Password"].ToString(),
                    Photo = row["Photo"].ToString(),
                    LicenseNum = row["LicenseNum"].ToString(),
                    StartDate = Convert.ToDateTime(row["StartDate"]),
                    IsActive = Convert.ToBoolean(row["IsActive"]),
                    ClassId = row["ClassId"] != DBNull.Value ? Convert.ToInt32(row["ClassId"]) : null,
                    RoleName = row["RoleName"].ToString()
                };

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

            Employee employee = new Employee
            {
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                FirstName = row["FirstName"].ToString(),
                LastName = row["LastName"].ToString(),
                BirthDate = Convert.ToDateTime(row["BirthDate"]),
                MobilePhone = row["MobilePhone"].ToString(),
                Email = row["Email"].ToString(),
                Password = row["Password"].ToString(),
                Photo = row["Photo"].ToString(),
                LicenseNum = row["LicenseNum"].ToString(),
                StartDate = Convert.ToDateTime(row["StartDate"]),
                IsActive = Convert.ToBoolean(row["IsActive"]),
                ClassId = row["ClassId"] != DBNull.Value ? Convert.ToInt32(row["ClassId"]) : null,
                RoleName = row["RoleName"].ToString()
            };

            return employee;
        }

        public int AddEmployee(Employee employee)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FirstName", employee.FirstName },
                { "@LastName", employee.LastName },
                { "@BirthDate", employee.BirthDate },
                { "@MobilePhone", employee.MobilePhone },
                { "@Email", employee.Email },
                { "@Password", employee.Password },
                { "@Photo", employee.Photo },
                { "@LicenseNum", employee.LicenseNum },
                { "@StartDate", employee.StartDate },
                { "@IsActive", employee.IsActive },
                { "@ClassId", employee.ClassId },
                { "@RoleName", employee.RoleName }
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
                { "@Password", employee.Password },
                { "@Photo", employee.Photo },
                { "@LicenseNum", employee.LicenseNum },
                { "@StartDate", employee.StartDate },
                { "@IsActive", employee.IsActive },
                { "@ClassId", employee.ClassId },
                { "@RoleName", employee.RoleName }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEmployee", parameters);
            return rowsAffected > 0;
        }

        // במקום מחיקה פיזית, מעדכנים את IsActive ל-false
        public bool DeactivateEmployee(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", id },
                { "@IsActive", false }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEmployeeStatus", parameters);
            return rowsAffected > 0;
        }
    }
}