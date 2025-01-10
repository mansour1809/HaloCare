using halocare.Models;

namespace halocare.Models
{
    public class Parent
    {
        public int ParentId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string MobilePhone { get; set; }
        public string Address { get; set; }
        public string CityName { get; set; }
        public string HomePhone { get; set; }
        public string Email { get; set; }
        public string PreferredLanguage { get; set; }

        // Navigation properties
        public virtual City City { get; set; }
        public virtual ICollection<Kid> Kids1 { get; set; } // ילדים בהם ההורה הוא parent1
        public virtual ICollection<Kid> Kids2 { get; set; } // ילדים בהם ההורה הוא parent2
    }
}