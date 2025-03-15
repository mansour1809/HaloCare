using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class TreatmentTypeRepository : DBService
    {
        public TreatmentTypeRepository(IConfiguration configuration) : base(configuration) { }

        public List<TreatmentType> GetAllTreatmentTypes()
        {
            List<TreatmentType> treatmentTypes = new List<TreatmentType>();
            DataTable dataTable = ExecuteQuery("SP_GetAllTreatmentTypes");

            foreach (DataRow row in dataTable.Rows)
            {
                TreatmentType treatmentType = new TreatmentType
                {
                    TreatmentTypeName = row["SP_TreatmentTypeName"].ToString()
                };

                treatmentTypes.Add(treatmentType);
            }

            return treatmentTypes;
        }

        public TreatmentType GetTreatmentTypeByName(string treatmentTypeName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeName", treatmentTypeName }
            };

            DataTable dataTable = ExecuteQuery("SP_GetTreatmentTypeByName", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            TreatmentType treatmentType = new TreatmentType
            {
                TreatmentTypeName = row["TreatmentTypeName"].ToString()
            };

            return treatmentType;
        }

        public bool AddTreatmentType(TreatmentType treatmentType)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeName", treatmentType.TreatmentTypeName }
            };

            int rowsAffected = ExecuteNonQuery("SP_AddTreatmentType", parameters);
            return rowsAffected > 0;
        }

        public bool UpdateTreatmentType(string oldTreatmentTypeName, string newTreatmentTypeName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@OldTreatmentTypeName", oldTreatmentTypeName },
                { "@NewTreatmentTypeName", newTreatmentTypeName }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateTreatmentType", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteTreatmentType(string treatmentTypeName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeName", treatmentTypeName }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteTreatmentType", parameters);
            return rowsAffected > 0;
        }
    }
}