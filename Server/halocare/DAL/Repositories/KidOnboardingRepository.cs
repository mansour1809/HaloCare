using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace halocare.DAL.Repositories
{
    public class KidOnboardingRepository : DBService
    {
        public KidOnboardingRepository(IConfiguration configuration) : base(configuration) { }

        public int CreateOnboardingProcess(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            return Convert.ToInt32(ExecuteScalar("SP_CreateKidOnboardingProcess", parameters));
        }

        public KidOnboardingProcess GetOnboardingProcess(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidOnboardingProcessWithForms", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];
            return new KidOnboardingProcess
            {
                Id = Convert.ToInt32(row["Id"]),
                KidId = Convert.ToInt32(row["KidId"]),
                CurrentStepFormId = row["CurrentStepFormId"] != DBNull.Value ? Convert.ToInt32(row["CurrentStepFormId"]) : null,
                ProcessStatus = row["ProcessStatus"].ToString(),
                StartDate = Convert.ToDateTime(row["StartDate"]),
                LastUpdatedDate = Convert.ToDateTime(row["LastUpdatedDate"]),
                CompletedStepsJson = row["CompletedStepsJson"].ToString(),
                IsCompleted = Convert.ToBoolean(row["IsCompleted"]),
                Notes = row["Notes"].ToString(),
                KidName = row["KidName"].ToString()
            };
        }

        public List<Form> GetOnboardingForms()
        {
            DataTable dataTable = ExecuteQuery("SP_GetOnboardingFormsList");
            List<Form> forms = new List<Form>();

            foreach (DataRow row in dataTable.Rows)
            {
                forms.Add(new Form
                {
                    FormId = Convert.ToInt32(row["FormId"]),
                    FormName = row["FormName"].ToString(),
                    FormDescription = row["FormDescription"].ToString(),
                    FormOrder = row["FormOrder"] != DBNull.Value ? Convert.ToInt32(row["FormOrder"]) : null,
                    IsFirstStep = Convert.ToBoolean(row["IsFirstStep"])
                });
            }

            return forms;
        }

        public bool UpdateOnboardingProgress(int kidId, int completedFormId, int? nextStepFormId = null)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@CompletedFormId", completedFormId },
                { "@NextStepFormId", nextStepFormId }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateKidOnboardingProgress", parameters);
            return rowsAffected > 0;
        }

        public bool IsFormCompleted(int kidId, int formId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId }
            };

            // נשתמש בפונקציה פשוטה עד שנשפר את ה-JSON handling
            var process = GetOnboardingProcess(kidId);
            if (process?.CompletedStepsJson == null) return false;

            return process.CompletedStepsJson.Contains($"\"{formId}\": \"completed\"");
        }

        public List<KidWithOnboardingInfo> GetKidsWithIncompleteOnboarding()
        {
            DataTable dataTable = ExecuteQuery("SP_GetKidsWithIncompleteOnboarding");
            List<KidWithOnboardingInfo> kids = new List<KidWithOnboardingInfo>();

            foreach (DataRow row in dataTable.Rows)
            {
                kids.Add(new KidWithOnboardingInfo
                {
                    Id = Convert.ToInt32(row["Id"]),
                    FirstName = row["FirstName"].ToString(),
                    LastName = row["LastName"].ToString(),
                    BirthDate = Convert.ToDateTime(row["BirthDate"]),
                    Gender = row["Gender"].ToString(),
                    IsActive = Convert.ToBoolean(row["IsActive"]),
                    ProcessStatus = row["ProcessStatus"].ToString(),
                    LastUpdatedDate = Convert.ToDateTime(row["LastUpdatedDate"]),
                    CurrentStepFormId = row["CurrentStepFormId"] != DBNull.Value ? Convert.ToInt32(row["CurrentStepFormId"]) : null,
                    CurrentStepName = row["CurrentStepName"].ToString(),
                    DaysSinceLastUpdate = Convert.ToInt32(row["DaysSinceLastUpdate"])
                });
            }

            return kids;
        }

        public class KidWithOnboardingInfo : Kid
        {
            public string ProcessStatus { get; set; }
            public DateTime LastUpdatedDate { get; set; }
            public int? CurrentStepFormId { get; set; }
            public string CurrentStepName { get; set; }
            public int DaysSinceLastUpdate { get; set; }
        }
    }
}