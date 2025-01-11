using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class HomeVisitDataServices : DBService
    {
        public HomeVisitDataServices(IConfiguration configuration) : base(configuration) { }

        private HomeVisit MapHomeVisit(SqlDataReader dr)
        {
            return new HomeVisit
            {
                VisitId = (int)dr["visitId"],
                VisitDate = (DateTime)dr["visitDate"],
                KidId = (int)dr["kidId"]
            };
        }

        public HomeVisit GetHomeVisitById(int visitId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@visitId", visitId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetHomeVisitById", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapHomeVisit(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetHomeVisitById", ex);
            }
        }

        public List<HomeVisit> GetHomeVisitsByKid(int kidId)
        {
            List<HomeVisit> visits = new List<HomeVisit>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kidId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetHomeVisitsByKid", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            visits.Add(MapHomeVisit(dr));
                        }
                    }
                }
                return visits.OrderByDescending(v => v.VisitDate).ToList();  // מהביקור האחרון לראשון
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetHomeVisitsByKid", ex);
            }
        }

        public int InsertHomeVisit(HomeVisit visit)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", visit.KidId },
                    { "@visitDate", visit.VisitDate }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertHomeVisit", con, parameters);
                    SqlParameter outputParam = new SqlParameter("@newId", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    cmd.Parameters.Add(outputParam);

                    cmd.ExecuteNonQuery();
                    return (int)outputParam.Value;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in InsertHomeVisit", ex);
            }
        }

        public bool UpdateHomeVisit(HomeVisit visit)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@visitId", visit.VisitId },
                    { "@visitDate", visit.VisitDate }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateHomeVisit", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateHomeVisit", ex);
            }
        }

        public List<HomeVisit> GetHomeVisitsByDateRange(DateTime startDate, DateTime endDate)
        {
            List<HomeVisit> visits = new List<HomeVisit>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@startDate", startDate },
                    { "@endDate", endDate }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetHomeVisitsByDateRange", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            visits.Add(MapHomeVisit(dr));
                        }
                    }
                }
                return visits.OrderByDescending(v => v.VisitDate).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetHomeVisitsByDateRange", ex);
            }
        }
    }
}