using halocare.Models;

namespace halocare.Models
{

    public class Permission
    {
        public int PermissionId { get; set; }
        public int EmployeeId { get; set; }
        public string PermissionName { get; set; }

        // Navigation property
        public virtual Employee Employee { get; set; }
    }
}

