// DAL/Repositories/KidIntakeProcessRepository.cs
using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class KidIntakeProcessRepository : DBService
    {
        public KidIntakeProcessRepository(IConfiguration configuration) : base(configuration) { }

        public List<KidIntakeProcess> GetAllKidIntakeProcesses()
        {
            List<KidIntakeProcess> processes = new List<KidIntakeProcess>();
            DataTable dataTable = ExecuteQuery("SP_GetAllKidIntakeProcesses");

            foreach (DataRow row in dataTable.Rows)
            {
                KidIntakeProcess process = MapDataRowToKidIntakeProcess(row);
                processes.Add(process);
            }

            return processes;
        }

        public KidIntakeProcess GetKidIntakeProcessByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidIntakeProcess", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            return MapDataRowToKidIntakeProcess(dataTable.Rows[0]);
        }

        public int AddKidIntakeProcess(KidIntakeProcess process)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", process.KidId },
                { "@Status", process.Status },
                { "@CurrentFormId", process.CurrentFormId },
                { "@CompletedForms", process.CompletedForms },
                { "@PendingForms", process.PendingForms },
                { "@ParentPendingForms", process.ParentPendingForms },
                { "@CompletionPercentage", process.CompletionPercentage },
                { "@Notes", process.Notes }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddKidIntakeProcess", parameters));
        }

        public bool UpdateKidIntakeProcess(KidIntakeProcess process)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Id", process.Id },
                { "@KidId", process.KidId },
                { "@Status", process.Status },
                { "@CurrentFormId", process.CurrentFormId },
                { "@CompletedForms", process.CompletedForms },
                { "@PendingForms", process.PendingForms },
                { "@ParentPendingForms", process.ParentPendingForms },
                { "@CompletionPercentage", process.CompletionPercentage },
                { "@Notes", process.Notes }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateKidIntakeProcess", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteKidIntakeProcess(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@Id", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteKidIntakeProcess", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateIntakeProcessStatus(int kidId, string status)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@Status", status }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateIntakeProcessStatus", parameters);
            return rowsAffected > 0;
        }

        private KidIntakeProcess MapDataRowToKidIntakeProcess(DataRow row)
        {
            return new KidIntakeProcess
            {
                Id = Convert.ToInt32(row["Id"]),
                KidId = Convert.ToInt32(row["KidId"]),
                Status = row["Status"].ToString(),
                CurrentFormId = row["CurrentFormId"] != DBNull.Value ? Convert.ToInt32(row["CurrentFormId"]) : null,
                CompletedForms = row["CompletedForms"].ToString(),
                PendingForms = row["PendingForms"].ToString(),
                ParentPendingForms = row["ParentPendingForms"].ToString(),
                CompletionPercentage = Convert.ToInt32(row["CompletionPercentage"]),
                Notes = row["Notes"].ToString(),
                CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                LastUpdated = Convert.ToDateTime(row["LastUpdated"]),

                // Navigation properties (רק אם קיימים בתוצאה)
                FirstName = row.Table.Columns.Contains("FirstName") ? row["FirstName"].ToString() : null,
                LastName = row.Table.Columns.Contains("LastName") ? row["LastName"].ToString() : null,
                BirthDate = row.Table.Columns.Contains("BirthDate") && row["BirthDate"] != DBNull.Value ?
                           Convert.ToDateTime(row["BirthDate"]) : null,
                ClassName = row.Table.Columns.Contains("ClassName") ? row["ClassName"].ToString() : null,
                CurrentFormName = row.Table.Columns.Contains("CurrentFormName") ? row["CurrentFormName"].ToString() : null
            };
        }
    }
}