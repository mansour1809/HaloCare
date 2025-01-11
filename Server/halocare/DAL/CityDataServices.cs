using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class CityDataServices : DBService
    {
        public CityDataServices(IConfiguration configuration) : base(configuration) { }

        private City MapCity(SqlDataReader dr)
        {
            return new City
            {
                CityName = dr["cityName"].ToString()
            };
        }

        public List<City> GetAllCities()
        {
            List<City> cities = new List<City>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllCities", con);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            cities.Add(MapCity(dr));
                        }
                    }
                }
                return cities.OrderBy(c => c.CityName).ToList(); // ממוין לפי א"ב
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAllCities", ex);
            }
        }
    }
}