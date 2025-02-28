﻿namespace halocare.DAL.Models
{
    public class Question
    {
        public int FormId { get; set; }
        public int QuestionNo { get; set; }
        public string QuestionText { get; set; }
        public bool IsMandatory { get; set; }
        public bool IsOpen { get; set; }
        public int HowManyVal { get; set; }
        public string PossibleValues { get; set; }
        public bool HasOther { get; set; }
    }
}