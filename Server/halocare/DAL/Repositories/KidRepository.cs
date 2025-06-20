﻿using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class KidRepository : DBService
    {
        public KidRepository(IConfiguration configuration) : base(configuration) { }

        public List<Kid> GetAllKids()
        {
            List<Kid> kids = new List<Kid>();

            DataTable dataTable = ExecuteQuery("SP_GetAllKids");

            foreach (DataRow row in dataTable.Rows)
            {
                Kid kid = new Kid
                {
                    Id = Convert.ToInt32(row["Id"]),
                    FirstName = row["FirstName"].ToString(),
                    LastName = row["LastName"].ToString(),
                    BirthDate = Convert.ToDateTime(row["BirthDate"]),
                    Gender = row["Gender"].ToString(),
                    CityName = row["CityName"].ToString(),
                    Address = row["Address"].ToString(),
                    IsActive = Convert.ToBoolean(row["IsActive"]),
                    HName = row["HName"].ToString(),
                    PathToFolder = row["PathToFolder"].ToString(),
                    PhotoPath = row["photoPath"].ToString(),
                    ClassId = row["ClassId"] != DBNull.Value ? Convert.ToInt32(row["ClassId"]) : null,
                    ParentId1 = row["ParentId1"] != DBNull.Value ? Convert.ToInt32(row["ParentId1"]) : null,
                    ParentId2 = row["ParentId2"] != DBNull.Value ? Convert.ToInt32(row["ParentId2"]) : null
                };

                kids.Add(kid);
            }

            return kids;
        }

        public Kid GetKidById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Id", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Kid kid = new Kid
            {
                Id = Convert.ToInt32(row["Id"]),
                FirstName = row["FirstName"].ToString(),
                LastName = row["LastName"].ToString(),
                BirthDate = Convert.ToDateTime(row["BirthDate"]),
                Gender = row["Gender"].ToString(),
                CityName = row["CityName"].ToString(),
                Address = row["Address"].ToString(),
                IsActive = Convert.ToBoolean(row["IsActive"]),
                HName = row["HName"].ToString(),
                PathToFolder = row["PathToFolder"].ToString(),
                PhotoPath = row["photoPath"].ToString(),
                ClassId = row["ClassId"] != DBNull.Value ? Convert.ToInt32(row["ClassId"]) : null,
                ParentId1 = row["ParentId1"] != DBNull.Value ? Convert.ToInt32(row["ParentId1"]) : null,
                ParentId2 = row["ParentId2"] != DBNull.Value ? Convert.ToInt32(row["ParentId2"]) : null
            };

            return kid;
        }

        public int AddKid(Kid kid)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@id", kid.Id },
                { "@FirstName", kid.FirstName },
                { "@LastName", kid.LastName },
                { "@BirthDate", kid.BirthDate },
                { "@Gender", kid.Gender },
                { "@CityName", kid.CityName },
                { "@Address", kid.Address },
                { "@IsActive", kid.IsActive },
                { "@HName", kid.HName },
                { "@PathToFolder", kid.PathToFolder },
                { "@PhotoPath", kid.PhotoPath ?? (object)DBNull.Value },
                { "@ClassId", kid.ClassId },
                { "@ParentId1", kid.ParentId1 ?? (object)DBNull.Value },
                { "@ParentId2", kid.ParentId2 ?? (object)DBNull.Value }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddKid", parameters));
        }

        public bool UpdateKid(Kid kid)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Id", kid.Id },
                { "@FirstName", kid.FirstName },
                { "@LastName", kid.LastName },
                { "@BirthDate", kid.BirthDate },
                { "@Gender", kid.Gender },
                { "@CityName", kid.CityName },
                { "@Address", kid.Address },
                { "@IsActive", kid.IsActive },
                { "@HName", kid.HName },
                { "@PathToFolder", kid.PathToFolder },
                { "@Photo", kid.PhotoPath ?? (object)DBNull.Value },
                { "@ClassId", kid.ClassId },
                { "@ParentId1", kid.ParentId1 },
                { "@ParentId2", kid.ParentId2 ?? (object)DBNull.Value }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateKid", parameters);
            return rowsAffected > 0;
        }

        // not deleting the kid, just deactivate it
        public bool DeactivateKid(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Id", id },
                { "@IsActive", false }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateKidStatus", parameters);
            return rowsAffected > 0;
        }
    }
}