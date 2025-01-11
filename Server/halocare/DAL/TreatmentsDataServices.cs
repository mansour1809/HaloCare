using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{
    public class TreatmentsDataServices : DBService
    {
        public TreatmentsDataServices(IConfiguration configuration) : base(configuration) { }

        private Treatment MapTreatment(SqlDataReader dr)
        {
            return new Treatment
            {
                TreatmentId = (int)dr["treatmentId"],
                KidId = (int)dr["kidId"],
                EmployeeId = (int)dr["employeeId"],
                TreatmentDate = (DateTime)dr["treatmentDate"],
                TreatmentType = dr["treatmentType"].ToString(),
                Description = dr["description"]?.ToString(),
                CooperationLevel = (int)dr["cooperationLevel"],
                Status = dr["status"].ToString()
            };
        }

        public Treatment GetTreatmentById(int treatmentId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@treatmentId", treatmentId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetTreatmentById", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapTreatment(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetTreatmentById", ex);
            }
        }

        public List<Treatment> GetTreatmentsByKid(int kidId)
        {
            List<Treatment> treatments = new List<Treatment>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kidId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetTreatmentsByKid", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            treatments.Add(MapTreatment(dr));
                        }
                    }
                }
                return treatments.OrderByDescending(t => t.TreatmentDate).ToList(); // מסודר מהחדש לישן
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetTreatmentsByKid", ex);
            }
        }

        public List<Treatment> GetTreatmentsByEmployee(int employeeId)
        {
            List<Treatment> treatments = new List<Treatment>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeId", employeeId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetTreatmentsByEmployee", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            treatments.Add(MapTreatment(dr));
                        }
                    }
                }
                return treatments.OrderByDescending(t => t.TreatmentDate).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetTreatmentsByEmployee", ex);
            }
        }

        public int InsertTreatment(Treatment treatment)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", treatment.KidId },
                    { "@employeeId", treatment.EmployeeId },
                    { "@treatmentDate", treatment.TreatmentDate },
                    { "@treatmentType", treatment.TreatmentType },
                    { "@description", treatment.Description },
                    { "@cooperationLevel", treatment.CooperationLevel },
                    { "@status", treatment.Status }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertTreatment", con, parameters);
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
                throw new Exception("Error in InsertTreatment", ex);
            }
        }

        public bool UpdateTreatment(Treatment treatment)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@treatmentId", treatment.TreatmentId },
                    { "@description", treatment.Description },
                    { "@cooperationLevel", treatment.CooperationLevel },
                    { "@status", treatment.Status }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateTreatment", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateTreatment", ex);
            }
        }

        public List<Treatment> GetTreatmentsByDateRange(DateTime startDate, DateTime endDate, int? kidId = null)
        {
            List<Treatment> treatments = new List<Treatment>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@startDate", startDate },
                    { "@endDate", endDate }
                };

                    if (kidId.HasValue)
                    {
                        parameters.Add("@kidId", kidId.Value);
                    }

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetTreatmentsByDateRange", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            treatments.Add(MapTreatment(dr));
                        }
                    }
                }
                return treatments.OrderByDescending(t => t.TreatmentDate).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetTreatmentsByDateRange", ex);
            }
        }
    }
}