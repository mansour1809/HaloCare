namespace halocare.DAL.Models
{
    public class Form
    {
        public int FormId { get; set; }
        public string FormName { get; set; }
        public string FormDescription { get; set; }
        public int? FormOrder { get; set; }
        public bool IsFirstStep { get; set; }
    }
}