using halocare.DAL;
using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{

    public class RoleDataServices : DBService
    {
        public RoleDataServices(IConfiguration configuration) : base(configuration) { }

        private Role MapRole(SqlDataReader dr)
        {
            return new Role
            {
                RoleName = dr["roleName"].ToString(),
                Description = dr["description"]?.ToString()
            };
        }

        private Permission MapPermission(SqlDataReader dr)
        {
            return new Permission
            {
                PermissionId = (int)dr["permissionId"],
                EmployeeId = (int)dr["employeeId"],
                PermissionName = dr["permission"].ToString()
            };
        }

        public List<Role> GetAllRoles()
        {
            List<Role> roles = new List<Role>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    SqlCommand cmd = CreateStoredProcCommand("sp_GetAllRoles", con);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            roles.Add(MapRole(dr));
                        }
                    }
                }
                return roles;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetAllRoles", ex);
            }
        }

        public Role GetRoleByName(string roleName)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@roleName", roleName }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetRoleByName", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapRole(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetRoleByName", ex);
            }
        }

        public List<Permission> GetPermissionsByEmployee(int employeeId)
        {
            List<Permission> permissions = new List<Permission>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeId", employeeId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetPermissionsByEmployee", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            permissions.Add(MapPermission(dr));
                        }
                    }
                }
                return permissions;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetPermissionsByEmployee", ex);
            }
        }

        public int AddPermissionToEmployee(Permission permission)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeId", permission.EmployeeId },
                    { "@permission", permission.PermissionName }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_AddPermission", con, parameters);
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
                throw new Exception("Error in AddPermissionToEmployee", ex);
            }
        }

        public bool RemovePermissionFromEmployee(int permissionId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@permissionId", permissionId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_RemovePermission", con, parameters);
                    int rowsAffected = cmd.ExecuteNonQuery();
                    return rowsAffected > 0;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in RemovePermissionFromEmployee", ex);
            }
        }

        public bool HasPermission(int employeeId, string permissionName)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@employeeId", employeeId },
                    { "@permission", permissionName }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_CheckPermission", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return (int)dr["HasPermission"] > 0;
                        }
                    }
                }
                return false;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in HasPermission", ex);
            }
        }
    }
}