using System;

namespace halocare.DAL.Models
{
    public class Attendance
    {
        public int AttendanceId { get; set; }
        public int KidId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public bool IsPresent { get; set; }
        public string? AbsenceReason { get; set; }
        public int ReportedBy { get; set; }
    }
}