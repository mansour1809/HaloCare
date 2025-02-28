using System;

namespace halocare.DAL.Models
{
    public class Documentt
    {
        public int DocId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public string DocType { get; set; }
        public string DocPath { get; set; }
        public DateTime UploadDate { get; set; }
    }
}