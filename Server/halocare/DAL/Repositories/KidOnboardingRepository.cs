// KidOnboardingRepository.cs - מלא ומעודכן
using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class KidOnboardingRepository : DBService
    {
        public KidOnboardingRepository(IConfiguration configuration) : base(configuration) { }

        public KidOnboardingProcess GetProcessByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidOnboardingProcess", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            return new KidOnboardingProcess
            {
                ProcessId = Convert.ToInt32(row["ProcessId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                ProcessStatus = row["ProcessStatus"].ToString(),
                StartDate = Convert.ToDateTime(row["StartDate"]),
                LastUpdated = Convert.ToDateTime(row["LastUpdatedDate"]),
                CompletionDate = row["CompletionDate"] != DBNull.Value ?
                    Convert.ToDateTime(row["CompletionDate"]) : (DateTime?)null,
                CompletionPercentage = Convert.ToInt32(row["CompletionPercentage"]),
                //Notes = row["Notes"]?.ToString()
            };
        }

        public int CreateProcess(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            return Convert.ToInt32(ExecuteScalar("SP_CreateKidOnboardingProcess", parameters));
        }

        public bool UpdateProcess(KidOnboardingProcess process)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ProcessId", process.ProcessId },
                { "@ProcessStatus", process.ProcessStatus },
                { "@CompletionPercentage", process.CompletionPercentage },
                { "@CompletionDate", process.CompletionDate },
                //{ "@Notes", process.Notes }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateKidOnboardingProcess", parameters);
            return rowsAffected > 0;
        }

        public bool ProcessExists(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidOnboardingProcess", parameters);
            return dataTable.Rows.Count > 0;
        }
    }
}