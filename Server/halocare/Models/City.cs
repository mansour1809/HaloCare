using halocare.Models;

namespace halocare.Models
{

    public class City
    {
        public string CityName { get; set; }

        // Navigation properties
        public virtual ICollection<Kid> Kids { get; set; }
        public virtual ICollection<Parent> Parents { get; set; }
    }
}
