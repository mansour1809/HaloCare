using halocare.Controllers;
using System;

namespace halocare.DAL.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string MobilePhone { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Photo { get; set; }
        public string LicenseNum { get; set; }
        public DateTime? StartDate { get; set; }
        public bool IsActive { get; set; }
        public int? ClassId { get; set; }
        public string RoleName { get; set; }
        public string CityName { get; set; }




    }
}