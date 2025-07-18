﻿using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class ParentRepository : DBService
    {
        public ParentRepository(IConfiguration configuration) : base(configuration) { }

        public List<Parent> GetAllParents()
        {
            List<Parent> parents = new List<Parent>();
            DataTable dataTable = ExecuteQuery("SP_GetAllParents");

            foreach (DataRow row in dataTable.Rows)
            {
                Parent parent = new Parent
                {
                    ParentId = Convert.ToInt32(row["ParentId"]),
                    FirstName = row["FirstName"].ToString(),
                    LastName = row["LastName"].ToString(),
                    MobilePhone = row["MobilePhone"].ToString(),
                    Address = row["Address"].ToString(),
                    CityName = row["CityName"].ToString(),
                    HomePhone = row["HomePhone"].ToString(),
                    Email = row["Email"].ToString()
                };

                parents.Add(parent);
            }

            return parents;
        }
        public bool IsParentEmailExists(string email)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
    {
        { "@Email", email }
    };

            object result = ExecuteScalar("SP_CheckIfEmailExists", parameters);

            // result might be DBNull, so handle carefully
            return result != null && Convert.ToInt32(result) == 1;
        }


        public Parent GetParentById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ParentId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetParentById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Parent parent = new Parent
            {
                ParentId = Convert.ToInt32(row["ParentId"]),
                FirstName = row["FirstName"].ToString(),
                LastName = row["LastName"].ToString(),
                MobilePhone = row["MobilePhone"].ToString(),
                Address = row["Address"].ToString(),
                CityName = row["CityName"].ToString(),
                HomePhone = row["HomePhone"].ToString(),
                Email = row["Email"].ToString()
            };

            return parent;
        }

        public int AddParent(Parent parent)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@FirstName", parent.FirstName },
                { "@LastName", parent.LastName },
                { "@MobilePhone", parent.MobilePhone },
                { "@Address", parent.Address },
                { "@CityName", parent.CityName },
                { "@HomePhone", parent.HomePhone },
                { "@Email", parent.Email }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddParent", parameters));
        }

        public bool UpdateParent(Parent parent)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ParentId", parent.ParentId },
                { "@FirstName", parent.FirstName },
                { "@LastName", parent.LastName },
                { "@MobilePhone", parent.MobilePhone },
                { "@Address", parent.Address },
                { "@CityName", parent.CityName },
                { "@HomePhone", parent.HomePhone },
                { "@Email", parent.Email }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateParent", parameters);
            return rowsAffected > 0;
        }
    }
}