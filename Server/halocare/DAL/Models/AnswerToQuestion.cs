using System;

namespace halocare.DAL.Models
{
    public class AnswerToQuestion
    {
        public int AnswerId { get; set; }
        public int KidId { get; set; }
        public int FormId { get; set; }
        public int QuestionNo { get; set; }
        public DateTime AnsDate { get; set; }
        public string Answer { get; set; }
        public string? Other { get; set; }
        public int? EmployeeId { get; set; }
        public bool ByParent { get; set; }

        public string? MultipleEntries { get; set; } // JSON string

    }
}