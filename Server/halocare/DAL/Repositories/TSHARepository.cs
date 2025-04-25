//using System;
//using System.Collections.Generic;
//using System.Data;
//using halocare.DAL.Models;
//using Microsoft.Extensions.Configuration;

//namespace halocare.DAL.Repositories
//{
//    public class TSHARepository : DBService
//    {
//        public TSHARepository(IConfiguration configuration) : base(configuration) { }

//        public List<TSHA> GetAllTSHAs()
//        {
//            List<TSHA> tshas = new List<TSHA>();
//            DataTable dataTable = ExecuteQuery("SP_GetAllTSHAs");

//            foreach (DataRow row in dataTable.Rows)
//            {
//                TSHA tsha = new TSHA
//                {
//                    TshaId = Convert.ToInt32(row["TshaId"]),
//                    KidId = Convert.ToInt32(row["KidId"]),
//                    CreationDate = Convert.ToDateTime(row["CreationDate"]),
//                    Period = row["Period"].ToString(),
//                    Goals = row["Goals"].ToString(),
//                    Status = row["Status"].ToString()
//                };

//                tshas.Add(tsha);
//            }

//            return tshas;
//        }

//        public List<TSHA> GetTSHAsByKidId(int kidId)
//        {
//            Dictionary<string, object> parameters = new Dictionary<string, object>
//            {
//                { "@KidId", kidId }
//            };

//            List<TSHA> tshas = new List<TSHA>();
//            DataTable dataTable = ExecuteQuery("SP_GetTSHAsByKidId", parameters);

//            foreach (DataRow row in dataTable.Rows)
//            {
//                TSHA tsha = new TSHA
//                {
//                    TshaId = Convert.ToInt32(row["TshaId"]),
//                    KidId = Convert.ToInt32(row["KidId"]),
//                    CreationDate = Convert.ToDateTime(row["CreationDate"]),
//                    Period = row["Period"].ToString(),
//                    Goals = row["Goals"].ToString(),
//                    Status = row["Status"].ToString()
//                };

//                tshas.Add(tsha);
//            }

//            return tshas;
//        }

//        public TSHA GetTSHAById(int id)
//        {
//            Dictionary<string, object> parameters = new Dictionary<string, object>
//            {
//                { "@TshaId", id }
//            };

//            DataTable dataTable = ExecuteQuery("SP_GetTSHAById", parameters);

//            if (dataTable.Rows.Count == 0)
//                return null;

//            DataRow row = dataTable.Rows[0];

//            TSHA tsha = new TSHA
//            {
//                TshaId = Convert.ToInt32(row["TshaId"]),
//                KidId = Convert.ToInt32(row["KidId"]),
//                CreationDate = Convert.ToDateTime(row["CreationDate"]),
//                Period = row["Period"].ToString(),
//                Goals = row["Goals"].ToString(),
//                Status = row["Status"].ToString()
//            };

//            return tsha;
//        }

//        public int AddTSHA(TSHA tsha)
//        {
//            Dictionary<string, object> parameters = new Dictionary<string, object>
//            {
//                { "@KidId", tsha.KidId },
//                { "@CreationDate", tsha.CreationDate },
//                { "@Period", tsha.Period },
//                { "@Goals", tsha.Goals },
//                { "@Status", tsha.Status }
//            };

//            return Convert.ToInt32(ExecuteScalar("SP_AddTSHA", parameters));
//        }

//        public bool UpdateTSHA(TSHA tsha)
//        {
//            Dictionary<string, object> parameters = new Dictionary<string, object>
//            {
//                { "@TshaId", tsha.TshaId },
//                { "@KidId", tsha.KidId },
//                { "@CreationDate", tsha.CreationDate },
//                { "@Period", tsha.Period },
//                { "@Goals", tsha.Goals },
//                { "@Status", tsha.Status }
//            };

//            int rowsAffected = ExecuteNonQuery("SP_UpdateTSHA", parameters);
//            return rowsAffected > 0;
//        }
//    }
//}