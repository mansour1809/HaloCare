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
            DataTable dataTable = ExecuteQuery("SP_GetAllTreatments");

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"]),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),

                    Highlight = row["Highlight"].ToString()
                };

                treatments.Add(treatment);
            }

            return treatments;
        }


             public List<Treatment> GetTreatmentsByKidIdAndTreatmentId(int kidId,int treatmentTypeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@TreatmentTypeId", treatmentTypeId}
            };

            List<Treatment> treatments = new List<Treatment>();

            DataTable dataTable = ExecuteQuery("SP_GetTreatmentsByKidIdAndTreatmentId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"]),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),

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
            DataTable dataTable = ExecuteQuery("SP_GetTreatmentsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"]),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
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

            DataTable dataTable = ExecuteQuery("SP_GetTreatmentById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Treatment treatment = new Treatment
            {
                TreatmentId = Convert.ToInt32(row["TreatmentId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"]),
                Description = row["Description"].ToString(),
                CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
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
                { "@TreatmentTypeId", treatment.TreatmentTypeId },
                { "@Description", treatment.Description },
                { "@CooperationLevel", treatment.CooperationLevel },
                { "@Highlight", treatment.Highlight }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddTreatment", parameters));
        }

        public bool UpdateTreatment(Treatment treatment)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentId", treatment.TreatmentId },
                { "@KidId", treatment.KidId },
                { "@EmployeeId", treatment.EmployeeId },
                { "@TreatmentDate", treatment.TreatmentDate },
                { "@TreatmentType", treatment.TreatmentTypeId },
                { "@Description", treatment.Description },
                { "@CooperationLevel", treatment.CooperationLevel },
                { "@Highlight", treatment.Highlight }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateTreatment", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteTreatment(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteTreatment", parameters);
            return rowsAffected > 0;
        }

        
        public List<Treatment> GetTreatmentsByKidIdAndTypeAndDateRange(int kidId, int treatmentId ,DateTime startDate, DateTime endDate)
        {
            List<Treatment> treatments = new List<Treatment>();

            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                {"@KidId", kidId},
                {"@StartDate", startDate },
                {"@EndDate", endDate },
                {"@treatmentId" , treatmentId}
            };

            DataTable dataTable = ExecuteQuery("SP_GetTreatmentsByKidIdAndTypeAndDateRange", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Treatment treatment = new Treatment
                {
                    TreatmentId = Convert.ToInt32(row["treatmentId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    TreatmentDate = Convert.ToDateTime(row["TreatmentDate"]),
                    Description = row["Description"].ToString(),
                    CooperationLevel = Convert.ToInt32(row["CooperationLevel"]),
                    Highlight = row["Highlight"] != DBNull.Value ? row["Highlight"].ToString() : "",
                    TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"])
                };

                treatments.Add(treatment);
            }

            return treatments;
        }
    }
}