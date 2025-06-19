using System;

namespace halocare.DAL.Models
{
    public class Treatment
    {
        public int TreatmentId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime TreatmentDate { get; set; }
        public int TreatmentTypeId { get; set; }
        public string Description { get; set; }
        public int CooperationLevel { get; set; }
        public string Highlight { get; set; }
    }
}