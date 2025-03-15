using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class HealthInsuranceRepository : DBService
    {
        public HealthInsuranceRepository(IConfiguration configuration) : base(configuration) { }

        public List<HealthInsurance> GetAllHealthInsurances()
        {
            List<HealthInsurance> healthInsurances = new List<HealthInsurance>();
            DataTable dataTable = ExecuteQuery("SP_GetAllHealthInsurances");

            foreach (DataRow row in dataTable.Rows)
            {
                HealthInsurance healthInsurance = new HealthInsurance
                {
                    HName = row["HName"].ToString()
                };

                healthInsurances.Add(healthInsurance);
            }

            return healthInsurances;
        }

        public HealthInsurance GetHealthInsuranceByName(string hName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@HName", hName }
            };

            DataTable dataTable = ExecuteQuery("SP_GetHealthInsuranceByName", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            HealthInsurance healthInsurance = new HealthInsurance
            {
                HName = row["HName"].ToString()
            };

            return healthInsurance;
        }

        public bool AddHealthInsurance(HealthInsurance healthInsurance)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@HName", healthInsurance.HName }
            };

            int rowsAffected = ExecuteNonQuery("SP_AddHealthInsurance", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateHealthInsurance(string oldHName, string newHName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@OldHName", oldHName },
                { "@NewHName", newHName }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateHealthInsurance", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteHealthInsurance(string hName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@HName", hName }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteHealthInsurance", parameters);
            return rowsAffected > 0;
        }
    }
}