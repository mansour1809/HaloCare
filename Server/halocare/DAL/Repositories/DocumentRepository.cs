using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class DocumentRepository : DBService
    {
        public DocumentRepository(IConfiguration configuration) : base(configuration) { }

        public List<Documentt> GetAllDocuments()
        {
            List<Documentt> documents = new List<Documentt>();
            DataTable dataTable = ExecuteQuery("SP_GetAllDocuments");

            foreach (DataRow row in dataTable.Rows)
            {
                documents.Add(MapRowToDocument(row));
            }

            return documents;
        }

        public List<Documentt> GetDocumentsByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<Documentt> documents = new List<Documentt>();
            DataTable dataTable = ExecuteQuery("SP_GetDocumentsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                documents.Add(MapRowToDocument(row));
            }

            return documents;
        }

        public List<Documentt> GetDocumentsByEmployeeId(int employeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", employeeId }
            };

            List<Documentt> documents = new List<Documentt>();
            DataTable dataTable = ExecuteQuery("SP_GetDocumentsByEmployeeId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                documents.Add(MapRowToDocument(row));
            }

            return documents;
        }

        public Documentt GetDocumentById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@DocId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetDocumentById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            return MapRowToDocument(dataTable.Rows[0]);
        }

        public int AddDocument(Documentt document)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", document.KidId },
                { "@EmployeeId", document.EmployeeId },
                { "@DocType", document.DocType },
                { "@DocName", document.DocName },
                { "@DocPath", document.DocPath },
                { "@UploadDate", document.UploadDate },
                { "@ContentType", document.ContentType },
                { "@FileSize", document.FileSize }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddDocument", parameters));
        }

        public bool UpdateDocument(Documentt document)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@DocId", document.DocId },
                { "@KidId", document.KidId },
                { "@EmployeeId", document.EmployeeId },
                { "@DocType", document.DocType },
                { "@DocName", document.DocName },
                { "@DocPath", document.DocPath },
                { "@ContentType", document.ContentType },
                { "@FileSize", document.FileSize }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateDocument", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteDocument(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@DocId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteDocument", parameters);
            return rowsAffected > 0;
        }

        private Documentt MapRowToDocument(DataRow row)
        {
            return new Documentt
            {
                DocId = Convert.ToInt32(row["DocId"]),
                KidId = row["KidId"] != DBNull.Value ? Convert.ToInt32(row["KidId"]) : (int?)null,
                EmployeeId = row["EmployeeId"] != DBNull.Value ? Convert.ToInt32(row["EmployeeId"]) : (int?)null,
                DocType = row["DocType"] != DBNull.Value ? row["DocType"].ToString() : "other", // ערך ברירת מחדל
                DocName = row["DocName"] != DBNull.Value ? row["DocName"].ToString() : null,
                DocPath = row["DocPath"].ToString(),
                UploadDate = Convert.ToDateTime(row["UploadDate"]),
                ContentType = row["ContentType"] != DBNull.Value ? row["ContentType"].ToString() : "application/octet-stream", // ערך ברירת מחדל
                FileSize = row["FileSize"] != DBNull.Value ? Convert.ToInt64(row["FileSize"]) : 0
            };
        }
    }
}