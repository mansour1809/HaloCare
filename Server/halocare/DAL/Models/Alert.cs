using System;

namespace halocare.DAL.Models
{
    public class Alert
    {
        public int AlertId { get; set; }
        public int KidId { get; set; }
        public string AlertType { get; set; }
        public DateTime DueDate { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Description { get; set; }
    }
}