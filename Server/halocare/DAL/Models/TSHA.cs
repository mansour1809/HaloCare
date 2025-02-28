using System;

namespace halocare.DAL.Models
{
    public class TSHA
    {
        public int TshaId { get; set; }
        public int KidId { get; set; }
        public DateTime CreationDate { get; set; }
        public string Period { get; set; }
        public string Goals { get; set; }
        public string Status { get; set; }
    }
}