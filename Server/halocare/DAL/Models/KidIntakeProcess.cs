// DAL/Models/KidIntakeProcess.cs
using System;

namespace halocare.DAL.Models
{
    public class KidIntakeProcess
    {
        public int Id { get; set; }
        public int KidId { get; set; }
        public string Status { get; set; }
        public int? CurrentFormId { get; set; }
        public string CompletedForms { get; set; }
        public string PendingForms { get; set; }
        public string ParentPendingForms { get; set; }
        public int CompletionPercentage { get; set; }
        public string Notes { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime LastUpdated { get; set; }

        // Navigation properties for joined data
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime? BirthDate { get; set; }
        public string ClassName { get; set; }
        public string CurrentFormName { get; set; }
    }
}