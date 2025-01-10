using System.Data;
using System.Reflection.Metadata;
using System.Security;

namespace halocare.Models
{
    public class Employee
    {
        public int EmployeeNum { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string RoleName { get; set; }
        public string Specialty { get; set; }
        public bool Status { get; set; }
        public string Email { get; set; }

        // Navigation properties
        public virtual Role Role { get; set; }
        public virtual ICollection<Treatment> Treatments { get; set; }
        public virtual ICollection<Document> Documents { get; set; }
        public virtual ICollection<Permission> Permissions { get; set; }
    }
}