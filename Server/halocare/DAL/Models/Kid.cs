using System.Reflection.Metadata;

namespace halocare.DAL.Models
{
    public class Kid
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime BirthDate { get; set; }
        public string Gender { get; set; }
        public string CityName { get; set; }
        public string Address { get; set; }
        public bool IsActive { get; set; }
        public string HName { get; set; }
        public string PathToFolder { get; set; }
        public string Photo { get; set; }
        public int? ClassId { get; set; }
        public int? ParentId1 { get; set; }
        public int? ParentId2 { get; set; }
    }
}