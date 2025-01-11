using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class ParentDataServices : DBService
    {
        public ParentDataServices(IConfiguration configuration) : base(configuration) { }

        private Parent MapParent(SqlDataReader dr)
        {
            return new Parent
            {
                ParentId = (int)dr["parentId"],
                FirstName = dr["firstName"].ToString(),
                LastName = dr["lastName"].ToString(),
                MobilePhone = dr["mobilePhone"]?.ToString(),
                Address = dr["address"]?.ToString(),
                CityName = dr["cityName"]?.ToString(),
                HomePhone = dr["homePhone"]?.ToString(),
                Email = dr["email"]?.ToString(),
                PreferredLanguage = dr["preferredLanguage"]?.ToString()
            };
        }

        public Parent GetParentById(int parentId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@parentId", parentId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetParentById", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapParent(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetParentById", ex);
            }
        }

        public List<Parent> GetAllParents()
        {
            List<Parent> parents = new List<Parent>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllParents", con);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            parents.Add(MapParent(dr));
                        }
                    }
                }
                return parents;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAllParents", ex);
            }
        }

        public int InsertParent(Parent parent)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@firstName", parent.FirstName },
                    { "@lastName", parent.LastName },
                    { "@mobilePhone", parent.MobilePhone },
                    { "@address", parent.Address },
                    { "@cityName", parent.CityName },
                    { "@homePhone", parent.HomePhone },
                    { "@email", parent.Email },
                    { "@preferredLanguage", parent.PreferredLanguage }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertParent", con, parameters);
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
                throw new Exception("Error in InsertParent", ex);
            }
        }

        public bool UpdateParent(Parent parent)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@parentId", parent.ParentId },
                    { "@firstName", parent.FirstName },
                    { "@lastName", parent.LastName },
                    { "@mobilePhone", parent.MobilePhone },
                    { "@address", parent.Address },
                    { "@cityName", parent.CityName },
                    { "@homePhone", parent.HomePhone },
                    { "@email", parent.Email },
                    { "@preferredLanguage", parent.PreferredLanguage }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_UpdateParent", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateParent", ex);
            }
        }

        public List<Parent> GetParentsByCity(string cityName)
        {
            List<Parent> parents = new List<Parent>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@cityName", cityName }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetParentsByCity", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            parents.Add(MapParent(dr));
                        }
                    }
                }
                return parents;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetParentsByCity", ex);
            }
        }
    }
}