namespace halocare.DAL.Models
{
    public class Event
    {
        public int EventId { get; set; }
        public int EventTypeId { get; set; }      // שינוי מ-string ל-int
        public string EventType { get; set; }     // מאפיין לנוחות - לא חלק מהטבלה
        public string Color { get; set; }         // מאפיין חדש לנוחות
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public string EventTitle { get; set; }    // מאפיין חדש שנוסף לפי ה-SP
        public int CreatedBy { get; set; }


        public List<int> KidIds { get; set; } = new List<int>();
        public List<int> EmployeeIds { get; set; } = new List<int>();

    }
}