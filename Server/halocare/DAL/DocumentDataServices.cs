using halocare.Models;
using System.Data.SqlClient;

namespace halocare.DAL
{
    public class DocumentDataServices : DBService
    {
        public DocumentDataServices(IConfiguration configuration) : base(configuration) { }

        private Document MapDocument(SqlDataReader dr)
        {
            return new Document
            {
                DocId = (int)dr["docId"],
                KidId = (int)dr["kidId"],
                EmployeeId = (int)dr["employeeId"],
                DocType = dr["docType"].ToString(),
                DocPath = dr["docPath"].ToString(),
                UploadDate = (DateTime)dr["uploadDate"],
                Version = (int)dr["version"],
                IsLatest = (bool)dr["isLatest"]
            };
        }

        public Document GetDocumentById(int docId)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@docId", docId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetDocumentById", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        if (dr.Read())
                        {
                            return MapDocument(dr);
                        }
                    }
                }
                return null;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetDocumentById", ex);
            }
        }

        public List<Document> GetDocumentsByKid(int kidId)
        {
            List<Document> documents = new List<Document>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kidId }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetDocumentsByKid", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            documents.Add(MapDocument(dr));
                        }
                    }
                }
                return documents;
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetDocumentsByKid", ex);
            }
        }

        public int InsertDocument(Document doc)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", doc.KidId },
                    { "@employeeId", doc.EmployeeId },
                    { "@docType", doc.DocType },
                    { "@docPath", doc.DocPath },
                    { "@version", 1 },        // גרסה ראשונה
                    { "@isLatest", true }     // מסמך חדש תמיד אחרון
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_InsertDocument", con, parameters);
                    SqlParameter outputParam = new SqlParameter("@newId", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    cmd.Parameters.Add(outputParam);

                    cmd.ExecuteNonQuery();
                    return (int)outputParam.Value;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in InsertDocument", ex);
            }
        }

        public int UpdateDocument(int oldDocId, Document newDoc)
        {
            try
            {
                using (SqlConnection con = Connect())
                {
                    // סימון המסמך הישן כלא אחרון
                    Dictionary<string, object> updateParams = new Dictionary<string, object>
                {
                    { "@docId", oldDocId },
                    { "@isLatest", false }
                };
                    SqlCommand updateCmd = CreateStoredProcCommand("sp_MarkDocumentNotLatest", con, updateParams);
                    updateCmd.ExecuteNonQuery();

                    // קבלת הגרסה הנוכחית
                    Document oldDoc = GetDocumentById(oldDocId);

                    // הוספת גרסה חדשה של המסמך
                    Dictionary<string, object> insertParams = new Dictionary<string, object>
                {
                    { "@kidId", newDoc.KidId },
                    { "@employeeId", newDoc.EmployeeId },
                    { "@docType", newDoc.DocType },
                    { "@docPath", newDoc.DocPath },
                    { "@version", oldDoc.Version + 1 },  // הגרסה הבאה
                    { "@isLatest", true }                // מסמך חדש הוא האחרון
                };

                    SqlCommand insertCmd = CreateStoredProcCommand("sp_InsertDocument", con, insertParams);
                    SqlParameter outputParam = new SqlParameter("@newId", System.Data.SqlDbType.Int)
                    {
                        Direction = System.Data.ParameterDirection.Output
                    };
                    insertCmd.Parameters.Add(outputParam);

                    insertCmd.ExecuteNonQuery();
                    return (int)outputParam.Value;
                }
            }
            catch (Exception ex)
            {
                throw new Exception("Error in UpdateDocument", ex);
            }
        }

        public List<Document> GetDocumentVersions(int kidId, string docType)
        {
            List<Document> documents = new List<Document>();
            try
            {
                using (SqlConnection con = Connect())
                {
                    Dictionary<string, object> parameters = new Dictionary<string, object>
                {
                    { "@kidId", kidId },
                    { "@docType", docType }
                };

                    SqlCommand cmd = CreateStoredProcCommand("sp_GetDocumentVersions", con, parameters);
                    using (SqlDataReader dr = cmd.ExecuteReader())
                    {
                        while (dr.Read())
                        {
                            documents.Add(MapDocument(dr));
                        }
                    }
                }
                return documents.OrderByDescending(d => d.Version).ToList();
            }
            catch (Exception ex)
            {
                throw new Exception("Error in GetDocumentVersions", ex);
            }
        }
    }
}