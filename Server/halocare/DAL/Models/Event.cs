namespace halocare.DAL.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public int EventTypeId { get; set; }      
        public string EventType { get; set; }     
        public string Color { get; set; }        
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public string EventTitle { get; set; }    
        public int CreatedBy { get; set; }

        public List<int> KidIds { get; set; } = new List<int>();
        public List<int> EmployeeIds { get; set; } = new List<int>();

    }
}