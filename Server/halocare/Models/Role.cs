using halocare.Models;

namespace halocare.Models
{

    public class Role
    {
        public string RoleName { get; set; }
        public string Description { get; set; }

        // Navigation property
        public virtual ICollection<Employee> Employees { get; set; }
    }
}