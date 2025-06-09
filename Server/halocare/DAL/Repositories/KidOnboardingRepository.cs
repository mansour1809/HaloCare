// DAL/Repositories/KidOnboardingRepository.cs
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

        #region Onboarding Process Management

        // יצירת תהליך קליטה חדש
        public int CreateOnboardingProcess(int kidId, int? createdBy = null)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@CreatedBy", createdBy ?? (object)DBNull.Value }
            };

            return Convert.ToInt32(ExecuteScalar("SP_CreateOnboardingProcess", parameters));
        }

        // קבלת תהליך קליטה לפי kidId
        public KidOnboardingProcess GetOnboardingProcess(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetOnboardingProcess", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];
            return MapToOnboardingProcess(row);
        }

        // עדכון סטטוס תהליך
        public bool UpdateProcessStatus(int kidId, string status, int? completionPercentage = null)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@ProcessStatus", status },
                { "@CompletionPercentage", completionPercentage ?? (object)DBNull.Value },
                { "@CompletionDate", status == "Completed" ? DateTime.Now : (object)DBNull.Value }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateOnboardingProcessStatus", parameters);
            return rowsAffected > 0;
        }

        // קבלת כל התהליכים הפעילים
        public List<KidOnboardingProcess> GetActiveProcesses()
        {
            DataTable dataTable = ExecuteQuery("SP_GetActiveOnboardingProcesses");
            List<KidOnboardingProcess> processes = new List<KidOnboardingProcess>();

            foreach (DataRow row in dataTable.Rows)
            {
                processes.Add(MapToOnboardingProcess(row));
            }

            return processes;
        }

        #endregion

        #region Form Status Management

        // אתחול סטטוסי טפסים לילד חדש
        public bool InitializeFormStatuses(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            int rowsAffected = ExecuteNonQuery("SP_InitializeKidFormStatuses", parameters);
            return rowsAffected > 0;
        }

        // קבלת סטטוס טופס ספציפי
        public KidFormStatus GetFormStatus(int kidId, int formId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetKidFormStatus", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            return MapToFormStatus(dataTable.Rows[0]);
        }

        // קבלת כל סטטוסי הטפסים של ילד
        public List<KidFormStatus> GetAllFormStatuses(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetAllKidFormStatuses", parameters);
            List<KidFormStatus> statuses = new List<KidFormStatus>();

            foreach (DataRow row in dataTable.Rows)
            {
                statuses.Add(MapToFormStatus(row));
            }

            return statuses;
        }

        // עדכון סטטוס טופס
        public bool UpdateFormStatus(int kidId, int formId, string status,
            int? answeredQuestions = null, int? totalQuestions = null, int? assignedTo = null)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@FormId", formId },
                { "@FormStatus", status },
                { "@AnsweredQuestions", answeredQuestions ?? (object)DBNull.Value },
                { "@TotalQuestions", totalQuestions ?? (object)DBNull.Value },
                { "@AssignedTo", assignedTo ?? (object)DBNull.Value }
            };

            // הגדרת תאריכים לפי הסטטוס
            switch (status.ToLower())
            {
                case "in_progress":
                    parameters.Add("@StartedAt", DateTime.Now);
                    break;
                case "completed":
                case "completed_by_parent":
                    parameters.Add("@CompletedAt", DateTime.Now);
                    break;
                case "sent_to_parent":
                    parameters.Add("@SentToParentAt", DateTime.Now);
                    break;
            }

            int rowsAffected = ExecuteNonQuery("SP_UpdateKidFormStatus", parameters);
            return rowsAffected > 0;
        }

        #endregion

        #region Reminders Management

        // הוספת תזכורת
        public int AddReminder(OnboardingReminder reminder)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", reminder.KidId },
                { "@FormId", reminder.FormId ?? (object)DBNull.Value },
                { "@ReminderType", reminder.ReminderType },
                { "@Title", reminder.Title },
                { "@Description", reminder.Description ?? (object)DBNull.Value },
                { "@DueDate", reminder.DueDate ?? (object)DBNull.Value },
                { "@AssignedTo", reminder.AssignedTo ?? (object)DBNull.Value },
                { "@CreatedBy", reminder.CreatedBy }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddOnboardingReminder", parameters));
        }

        // קבלת תזכורות לילד
        public List<OnboardingReminder> GetReminders(int kidId, bool includeCompleted = false)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId },
                { "@IncludeCompleted", includeCompleted }
            };

            DataTable dataTable = ExecuteQuery("SP_GetOnboardingReminders", parameters);
            List<OnboardingReminder> reminders = new List<OnboardingReminder>();

            foreach (DataRow row in dataTable.Rows)
            {
                reminders.Add(MapToReminder(row));
            }

            return reminders;
        }

        // סימון תזכורת כהושלמה
        public bool CompleteReminder(int reminderId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@ReminderId", reminderId }
            };

            int rowsAffected = ExecuteNonQuery("SP_CompleteOnboardingReminder", parameters);
            return rowsAffected > 0;
        }

        #endregion

        #region Statistics and Analytics

        // סטטיסטיקות תהליך קליטה
        public DataTable GetOnboardingStatistics(int? kidId = null)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId ?? (object)DBNull.Value }
            };

            return ExecuteQuery("SP_GetOnboardingStatistics", parameters);
        }

        // דוח תהליכי קליטה פעילים
        public DataTable GetActiveOnboardingReport()
        {
            return ExecuteQuery("SP_GetActiveOnboardingReport");
        }

        #endregion

        #region Helper Methods

        private KidOnboardingProcess MapToOnboardingProcess(DataRow row)
        {
            return new KidOnboardingProcess
            {
                ProcessId = Convert.ToInt32(row["ProcessId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                StartDate = Convert.ToDateTime(row["StartDate"]),
                CompletionDate = row["CompletionDate"] != DBNull.Value ? Convert.ToDateTime(row["CompletionDate"]) : null,
                LastUpdated = Convert.ToDateTime(row["LastUpdated"]),
                ProcessStatus = row["ProcessStatus"].ToString(),
                CompletionPercentage = Convert.ToInt32(row["CompletionPercentage"]),
                CreatedBy = row["CreatedBy"] != DBNull.Value ? Convert.ToInt32(row["CreatedBy"]) : null,
                Notes = row["Notes"]?.ToString()
            };
        }

        private KidFormStatus MapToFormStatus(DataRow row)
        {
            return new KidFormStatus
            {
                StatusId = Convert.ToInt32(row["StatusId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                FormId = Convert.ToInt32(row["FormId"]),
                FormStatus = row["FormStatus"].ToString(),
                StartedAt = row["StartedAt"] != DBNull.Value ? Convert.ToDateTime(row["StartedAt"]) : null,
                CompletedAt = row["CompletedAt"] != DBNull.Value ? Convert.ToDateTime(row["CompletedAt"]) : null,
                SentToParentAt = row["SentToParentAt"] != DBNull.Value ? Convert.ToDateTime(row["SentToParentAt"]) : null,
                LastUpdated = Convert.ToDateTime(row["LastUpdated"]),
                AnsweredQuestions = Convert.ToInt32(row["AnsweredQuestions"]),
                TotalQuestions = Convert.ToInt32(row["TotalQuestions"]),
                CompletionPercentage = Convert.ToInt32(row["CompletionPercentage"]),
                AssignedTo = row["AssignedTo"] != DBNull.Value ? Convert.ToInt32(row["AssignedTo"]) : null,
                Priority = Convert.ToInt32(row["Priority"]),
                Notes = row["Notes"]?.ToString()
            };
        }

        private OnboardingReminder MapToReminder(DataRow row)
        {
            return new OnboardingReminder
            {
                ReminderId = Convert.ToInt32(row["ReminderId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                FormId = row["FormId"] != DBNull.Value ? Convert.ToInt32(row["FormId"]) : null,
                ReminderType = row["ReminderType"].ToString(),
                Title = row["Title"].ToString(),
                Description = row["Description"]?.ToString(),
                DueDate = row["DueDate"] != DBNull.Value ? Convert.ToDateTime(row["DueDate"]) : null,
                IsCompleted = Convert.ToBoolean(row["IsCompleted"]),
                CompletedAt = row["CompletedAt"] != DBNull.Value ? Convert.ToDateTime(row["CompletedAt"]) : null,
                AssignedTo = row["AssignedTo"] != DBNull.Value ? Convert.ToInt32(row["AssignedTo"]) : null,
                CreatedBy = Convert.ToInt32(row["CreatedBy"]),
                CreatedAt = Convert.ToDateTime(row["CreatedAt"])
            };
        }

        #endregion
    }
}