﻿using halocare.Models;

namespace halocare.Models
{
    public class HomeVisit
    {
        public int VisitId { get; set; }
        public DateTime VisitDate { get; set; }
        public int KidId { get; set; }

        // Navigation property
        public virtual Kid Kid { get; set; }
    }
}