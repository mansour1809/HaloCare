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
                    TreatmentTypeId = Convert.ToInt32(row["treatmentTypeId"]),
                    TreatmentTypeName = row["treatmentTypeName"].ToString(),
                    TreatmentColor = row["treatmentColor"].ToString()
                };

                treatmentTypes.Add(treatmentType);
            }

            return treatmentTypes;
        }

        public TreatmentType GetTreatmentTypeById(int typeId) 
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeId", typeId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetTreatmentTypeById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            TreatmentType treatmentType = new TreatmentType
            {
                TreatmentTypeId = Convert.ToInt32(row["TreatmentTypeId"]),
                TreatmentTypeName = row["TreatmentTypeName"].ToString(),
                TreatmentColor = row["TreatmentColor"].ToString()
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

        public bool UpdateTreatmentType(int treatmentTypeId, string newTreatmentTypeName)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeId", treatmentTypeId },
                { "@NewTreatmentTypeName", newTreatmentTypeName }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateTreatmentType", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteTreatmentType(int treatmentTypeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@TreatmentTypeId", treatmentTypeId }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteTreatmentType", parameters);
            return rowsAffected > 0;
        }
    }
}