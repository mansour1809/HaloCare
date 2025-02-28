using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class TreatmentRepository : DBService
    {
        public TreatmentRepository(IConfiguration configuration) : base(configuration) { }

        public List<Treatment> GetAllTreatments()
        {
            List<Treatment> treatments = new List<Treatment>();
            DataTable dataTable = ExecuteQuery("GetAllTreatments");

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    TreatmentType = row["TreatmentType"].ToString(),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
                    Status = row["Status"].ToString(),
                    Highlight = row["Highlight"].ToString()
                };

                treatments.Add(treatment);
            }

            return treatments;
        }

        public List<Treatment> GetTreatmentsByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<Treatment> treatments = new List<Treatment>();
            DataTable dataTable = ExecuteQuery("GetTreatmentsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    TreatmentType = row["TreatmentType"].ToString(),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
                    Status = row["Status"].ToString(),
                    Highlight = row["Highlight"].ToString()
                };

                treatments.Add(treatment);
            }

            return treatments;
        }

        public Treatment GetTreatmentById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentId", id }
            };

            DataTable dataTable = ExecuteQuery("GetTreatmentById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Treatment treatment = new Treatment
            {
                TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                TreatmentType = row["TreatmentType"].ToString(),
                Description = row["Description"].ToString(),
                CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
                Status = row["Status"].ToString(),
                Highlight = row["Highlight"].ToString()
            };

            return treatment;
        }

        public int AddTreatment(Treatment treatment)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", treatment.KidId },
                { "@EmployeeId", treatment.EmployeeId },
                { "@TreatmentDate", treatment.TreatmentDate },
                { "@TreatmentType", treatment.TreatmentType },
                { "@Description", treatment.Description },
                { "@CooperationLevel", treatment.CooperationLevel },
                { "@Status", treatment.Status },
                { "@Highlight", treatment.Highlight }
            };

            return Convert.ToInt32(ExecuteScalar("AddTreatment", parameters));
        }

        public bool UpdateTreatment(Treatment treatment)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentId", treatment.TreatmentId },
                { "@KidId", treatment.KidId },
                { "@EmployeeId", treatment.EmployeeId },
                { "@TreatmentDate", treatment.TreatmentDate },
                { "@TreatmentType", treatment.TreatmentType },
                { "@Description", treatment.Description },
                { "@CooperationLevel", treatment.CooperationLevel },
                { "@Status", treatment.Status },
                { "@Highlight", treatment.Highlight }
            };

            int rowsAffected = ExecuteNonQuery("UpdateTreatment", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteTreatment(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentId", id }
            };

            int rowsAffected = ExecuteNonQuery("DeleteTreatment", parameters);
            return rowsAffected > 0;
        }
    }
}