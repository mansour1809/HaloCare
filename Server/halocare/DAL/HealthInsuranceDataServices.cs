using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{
    public class HealthInsuranceDataServices : DBService
    {
        public HealthInsuranceDataServices(IConfiguration configuration) : base(configuration) { }

        private HealthInsurance MapHealthInsurance(SqlDataReader dr)
        {
            return new HealthInsurance
            {
                HName = dr["hName"].ToString()
            };
        }

        public List<HealthInsurance> GetAllHealthInsurances()
        {
            List<HealthInsurance> insurances = new List<HealthInsurance>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllHealthInsurances", con);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            insurances.Add(MapHealthInsurance(dr));
                        }
                    }
                }
                return insurances.OrderBy(h => h.HName).ToList(); // ממוין לפי א"ב
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAllHealthInsurances", ex);
            }
        }
    }
}