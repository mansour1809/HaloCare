using halocare.Models;

namespace halocare.Models
{

    public class Treatment
    {
        public int TreatmentId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime TreatmentDate { get; set; }
        public string TreatmentType { get; set; }
        public string Description { get; set; }
        public int CooperationLevel { get; set; }
        public string Status { get; set; }

        // Navigation properties
        public virtual Kid Kid { get; set; }
        public virtual Employee Employee { get; set; }
    }
}