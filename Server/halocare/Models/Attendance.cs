using halocare.Models;

namespace halocare.Models
{

    public class Attendance
    {
        public int AttendanceId { get; set; }
        public int KidId { get; set; }
        public DateTime AttendanceDate { get; set; }
        public string Status { get; set; }
        public string Notes { get; set; }

        // Navigation property
        public virtual Kid Kid { get; set; }
    }
}
