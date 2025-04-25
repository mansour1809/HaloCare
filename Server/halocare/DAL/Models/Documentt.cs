using System;
namespace halocare.DAL.Models
{
    public class Documentt
    {
        public int DocId { get; set; }
        public int? KidId { get; set; } // אפשרי null כאשר המסמך שייך לעובד בלבד
        public int? EmployeeId { get; set; } // אפשרי null כאשר המסמך שייך לילד בלבד
        public string DocType { get; set; } // "profile", "certificate", "medical", etc.
        public string DocName { get; set; } // שם המסמך המקורי
        public string? DocPath { get; set; } // הנתיב היחסי לקובץ
        public DateTime? UploadDate { get; set; }
        public string? ContentType { get; set; } // MIME type של הקובץ
        public long FileSize { get; set; } // גודל הקובץ בבייטים
    }
}