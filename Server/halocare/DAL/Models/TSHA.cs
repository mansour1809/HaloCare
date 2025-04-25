// DAL/Models/TSHA.cs
public class TSHA
{
    public int Id { get; set; }
    public int KidId { get; set; }
    public DateTime CreationDate { get; set; }
    public string Period { get; set; } // לדוגמה: "ינואר-מרץ 2025"
    public string Goals { get; set; } // מטרות מרכזיות בפורמט JSON
    public string CurrentStatus { get; set; } // המצב כיום
    //public string ParentGoals { get; set; } // מטרות שהוגדרו על ידי ההורים
    public string Content { get; set; } // תוכן הדוח המלא בפורמט JSON
    public string Status { get; set; } // טיוטה, פעיל, הושלם
}