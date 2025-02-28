using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class RoleRepository : DBService
    {
        public RoleRepository(IConfiguration configuration) : base(configuration) { }

        public List<Role> GetAllRoles()
        {
            List<Role> roles = new List<Role>();
            DataTable dataTable = ExecuteQuery("GetAllRoles");

            foreach (DataRow row in dataTable.Rows)
            {
                Role role = new Role
                {
                    RoleName = row["RoleName"].ToString(),
                    Description = row["Description"].ToString(),
                    Permissions = row["Permissions"].ToString()
                };

                roles.Add(role);
            }

            return roles;
        }

        public Role GetRoleByName(string roleName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@RoleName", roleName }
            };

            DataTable dataTable = ExecuteQuery("GetRoleByName", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Role role = new Role
            {
                RoleName = row["RoleName"].ToString(),
                Description = row["Description"].ToString(),
                Permissions = row["Permissions"].ToString()
            };

            return role;
        }

        public bool AddRole(Role role)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@RoleName", role.RoleName },
                { "@Description", role.Description },
                { "@Permissions", role.Permissions }
            };

            int rowsAffected = ExecuteNonQuery("AddRole", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateRole(Role role)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@RoleName", role.RoleName },
                { "@Description", role.Description },
                { "@Permissions", role.Permissions }
            };

            int rowsAffected = ExecuteNonQuery("UpdateRole", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteRole(string roleName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@RoleName", roleName }
            };

            int rowsAffected = ExecuteNonQuery("DeleteRole", parameters);
            return rowsAffected > 0;
        }
    }
}