using System;

namespace halocare.DAL.Models
{
    public class HomeVisit
    {
        public int VisitId { get; set; }
        public DateTime VisitDate { get; set; }
        public int KidId { get; set; }
    }
}