using halocare.Models;

namespace halocare.Models
{
    public class HealthInsurance
    {
        public string HName { get; set; }

        // Navigation property
        public virtual ICollection<Kid> Kids { get; set; }
    }
}