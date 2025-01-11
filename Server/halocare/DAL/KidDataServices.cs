using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{
    public class KidsDataServices : DBService
    {
        public KidsDataServices(IConfiguration configuration) : base(configuration) { }

        private Kid MapKid(SqlDataReader dr)
        {
            return new Kid
            {
                Id = (int)dr["id"],
                FirstName = dr["firstName"].ToString(),
                LastName = dr["lastName"].ToString(),
                DateOfBirth = (DateTime)dr["dateOfBirth"],
                HName = dr["hName"].ToString(),
                Gender = dr["gender"].ToString(),
                CityName = dr["cityName"].ToString(),
                Address = dr["address"].ToString(),
                ParentId1 = (int)dr["parentId1"],
                ParentId2 = dr["parentId2"] == DBNull.Value ? null : (int?)dr["parentId2"],
                Status = dr["status"].ToString(),
                EntryDate = (DateTime)dr["entryDate"],
                ExitDate = dr["exitDate"] == DBNull.Value ? null : (DateTime?)dr["exitDate"]
            };
        }

        public Kid GetKidById(int kidId)
        {
            Kid kid = null;
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                    {
                        { "@kidId", kidId }
                    };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetKidById", con, parameters);

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            kid = MapKid(dr);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // TODO: Add proper logging
                throw new Exception("Error in GetKidById", ex);
            }

            return kid;
        }

        public List<Kid> GetAllKids()
        {
            List<Kid> kids = new List<Kid>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllKids", con);

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            kids.Add(MapKid(dr));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                // TODO: Add proper logging
                throw new Exception("Error in GetAllKids", ex);
            }

            return kids;
        }

        public int InsertKid(Kid kid)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                    {
                        { "@firstName", kid.FirstName },
                        { "@lastName", kid.LastName },
                        { "@dateOfBirth", kid.DateOfBirth },
                        { "@hName", kid.HName },
                        { "@gender", kid.Gender },
                        { "@cityName", kid.CityName },
                        { "@address", kid.Address },
                        { "@parentId1", kid.ParentId1 },
                        { "@parentId2", kid.ParentId2 },
                        { "@status", kid.Status },
                        { "@entryDate", kid.EntryDate },
                        { "@exitDate", kid.ExitDate }
                    };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertKid", con, parameters);
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
                // TODO: Add proper logging
                throw new Exception("Error in InsertKid", ex);
            }
        }

        public bool UpdateKid(Kid kid)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kid.Id },
                    { "@firstName", kid.FirstName },
                    { "@lastName", kid.LastName },
                    { "@dateOfBirth", kid.DateOfBirth },
                    { "@hName", kid.HName },
                    { "@gender", kid.Gender },
                    { "@cityName", kid.CityName },
                    { "@address", kid.Address },
                    { "@parentId1", kid.ParentId1 },
                    { "@parentId2", kid.ParentId2 },
                    { "@status", kid.Status },
                    { "@entryDate", kid.EntryDate },
                    { "@exitDate", kid.ExitDate }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateKid", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateKid", ex);
            }
        }

        public bool DeactivateKid(int kidId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@kidId", kidId },
                { "@status", "Inactive" } 
            };

                    SqlCommand cmd = CreateStoredProcCommand("sp_DeactivateKid", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in DeactivateKid", ex);
            }
        }

        public List<Kid> GetKidsByParent(int parentId)
        {
            List<Kid> kids = new List<Kid>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@parentId", parentId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetKidsByParent", con, parameters);

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            kids.Add(MapKid(dr));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetKidsByParent", ex);
            }

            return kids;
        }

        public List<Kid> GetActiveKids()
        {
            List<Kid> kids = new List<Kid>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetActiveKids", con);

                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            kids.Add(MapKid(dr));
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetActiveKids", ex);
            }

            return kids;
        }


    }
}
