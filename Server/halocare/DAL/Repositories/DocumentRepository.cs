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
                Documentt document = new Documentt
                {
                    DocId = Convert.ToInt32(row["DocId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    DocType = row["DocType"].ToString(),
                    DocPath = row["DocPath"].ToString(),
                    UploadDate = Convert.ToDateTime(row["UploadDate"])
                };

                documents.Add(document);
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
                Documentt document = new Documentt
                {
                    DocId = Convert.ToInt32(row["DocId"]),
                    KidId = Convert.ToInt32(row["KidId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                    DocType = row["DocType"].ToString(),
                    DocPath = row["DocPath"].ToString(),
                    UploadDate = Convert.ToDateTime(row["UploadDate"])
                };

                documents.Add(document);
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

            DataRow row = dataTable.Rows[0];

            Documentt document = new Documentt
            {
                DocId = Convert.ToInt32(row["DocId"]),
                KidId = Convert.ToInt32(row["KidId"]),
                EmployeeId = Convert.ToInt32(row["EmployeeId"]),
                DocType = row["DocType"].ToString(),
                DocPath = row["DocPath"].ToString(),
                UploadDate = Convert.ToDateTime(row["UploadDate"])
            };

            return document;
        }

        public int AddDocument(Documentt document)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", document.KidId },
                { "@EmployeeId", document.EmployeeId },
                { "@DocType", document.DocType },
                { "@DocPath", document.DocPath },
                { "@UploadDate", document.UploadDate }
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
                { "@DocPath", document.DocPath },
                { "@UploadDate", document.UploadDate }
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
    }
}