using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class AlertRepository : DBService
    {
        public AlertRepository(IConfiguration configuration) : base(configuration) { }

        public List<Alert> GetAllAlerts()
        {
            List<Alert> alerts = new List<Alert>();
            DataTable dataTable = ExecuteQuery("SP_GetAllAlerts");

            foreach (DataRow row in dataTable.Rows)
            {
                Alert alert = new Alert
                {
                    AlertId = Convert.ToInt32(row["AlertId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    AlertType = row["AlertType"].ToString(),
                    DueDate = Convert.ToDateTime(row["DueDate"]),
                    Status = row["Status"].ToString(),
                    CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                    Description = row["Description"].ToString()
                };

                alerts.Add(alert);
            }

            return alerts;
        }

        public List<Alert> GetAlertsByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<Alert> alerts = new List<Alert>();
            DataTable dataTable = ExecuteQuery("SP_GetAlertsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                Alert alert = new Alert
                {
                    AlertId = Convert.ToInt32(row["AlertId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    AlertType = row["AlertType"].ToString(),
                    DueDate = Convert.ToDateTime(row["DueDate"]),
                    Status = row["Status"].ToString(),
                    CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                    Description = row["Description"].ToString()
                };

                alerts.Add(alert);
            }

            return alerts;
        }

        public Alert GetAlertById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AlertId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetAlertById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Alert alert = new Alert
            {
                AlertId = Convert.ToInt32(row["AlertId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                AlertType = row["AlertType"].ToString(),
                DueDate = Convert.ToDateTime(row["DueDate"]),
                Status = row["Status"].ToString(),
                CreatedDate = Convert.ToDateTime(row["CreatedDate"]),
                Description = row["Description"].ToString()
            };

            return alert;
        }

        public int AddAlert(Alert alert)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", alert.KidId },
                { "@AlertType", alert.AlertType },
                { "@DueDate", alert.DueDate },
                { "@Status", alert.Status },
                { "@CreatedDate", alert.CreatedDate },
                { "@Description", alert.Description }
            };

            return Convert.ToInt32(ExecuteScalar("SP_SP_AddAlert", parameters));
        }

        public bool UpdateAlert(Alert alert)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AlertId", alert.AlertId },
                { "@KidId", alert.KidId },
                { "@AlertType", alert.AlertType },
                { "@DueDate", alert.DueDate },
                { "@Status", alert.Status },
                { "@CreatedDate", alert.CreatedDate },
                { "@Description", alert.Description }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateAlert", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteAlert(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@AlertId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteAlert", parameters);
            return rowsAffected > 0;
        }
    }
}