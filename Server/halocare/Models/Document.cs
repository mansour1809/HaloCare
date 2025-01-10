using halocare.Models;

namespace halocare.Models
{

    public class Document
    {
        public int DocId { get; set; }
        public int KidId { get; set; }
        public int EmployeeId { get; set; }
        public string DocType { get; set; }
        public string DocPath { get; set; }
        public DateTime UploadDate { get; set; }

        // Navigation properties
        public virtual Kid Kid { get; set; }
        public virtual Employee Employee { get; set; }
    }
}
