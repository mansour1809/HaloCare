using System;

namespace halocare.DAL.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public string EventType { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public int CreatedBy { get; set; }
    }
}