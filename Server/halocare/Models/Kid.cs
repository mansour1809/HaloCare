using System.Reflection.Metadata;

namespace halocare.Models
{
    public class Kid
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string HName { get; set; }  // קופת חולים
        public string Gender { get; set; }
        public string CityName { get; set; }
        public string Address { get; set; }
        public int ParentId1 { get; set; }
        public int? ParentId2 { get; set; }  // nullable כי לא חובה
        public string Status { get; set; }
        public DateTime EntryDate { get; set; }
        public DateTime? ExitDate { get; set; }  // nullable כי לא חובה

        // Navigation properties - קשרים לטבלאות אחרות
        public virtual Parent Parent1 { get; set; }
        public virtual Parent Parent2 { get; set; }
        public virtual City City { get; set; }
        public virtual HealthInsurance HealthInsurance { get; set; }
        public virtual ICollection<Treatment> Treatments { get; set; }
        public virtual ICollection<Document> Documents { get; set; }
        public virtual ICollection<Attendance> Attendances { get; set; }
        public virtual ICollection<HomeVisit> HomeVisits { get; set; }
    }
}