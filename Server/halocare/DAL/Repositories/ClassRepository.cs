using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class ClassRepository : DBService
    {
        public ClassRepository(IConfiguration configuration) : base(configuration) { }

        public List<Class> GetAllClasses()
        {
            List<Class> classes = new List<Class>();
            DataTable dataTable = ExecuteQuery("SP_GetAllClasses");

            foreach (DataRow row in dataTable.Rows)
            {
                Class classItem = new Class
                {
                    ClassId = Convert.ToInt32(row["ClassId"]),
                    ClassName = row["ClassName"].ToString(),
                    TeacherId = Convert.ToInt32(row["TeacherId"])
                };

                classes.Add(classItem);
            }

            return classes;
        }

        public Class GetClassById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ClassId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetClassById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Class classItem = new Class
            {
                ClassId = Convert.ToInt32(row["ClassId"]),
                ClassName = row["ClassName"].ToString(),
                TeacherId = Convert.ToInt32(row["TeacherId"])
            };

            return classItem;
        }

        public int AddClass(Class classItem)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ClassName", classItem.ClassName },
                { "@TeacherId", classItem.TeacherId }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddClass", parameters));
        }

        public bool UpdateClass(Class classItem)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ClassId", classItem.ClassId },
                { "@ClassName", classItem.ClassName },
                { "@TeacherId", classItem.TeacherId }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateClass", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteClass(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ClassId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteClass", parameters);
            return rowsAffected > 0;
        }
    }
}