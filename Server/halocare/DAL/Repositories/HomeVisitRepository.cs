using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class HomeVisitRepository : DBService
    {
        public HomeVisitRepository(IConfiguration configuration) : base(configuration) { }

        public List<HomeVisit> GetAllHomeVisits()
        {
            List<HomeVisit> homeVisits = new List<HomeVisit>();
            DataTable dataTable = ExecuteQuery("SP_GetAllHomeVisits");

            foreach (DataRow row in dataTable.Rows)
            {
                HomeVisit homeVisit = new HomeVisit
                {
                    VisitId = Convert.ToInt32(row["VisitId"]),
                    VisitDate = Convert.ToDateTime(row["VisitDate"]),
                    KidId = Convert.ToInt32(row["KidId"])
                };

                homeVisits.Add(homeVisit);
            }

            return homeVisits;
        }

        public List<HomeVisit> GetHomeVisitsByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<HomeVisit> homeVisits = new List<HomeVisit>();
            DataTable dataTable = ExecuteQuery("SP_GetHomeVisitsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                HomeVisit homeVisit = new HomeVisit
                {
                    VisitId = Convert.ToInt32(row["VisitId"]),
                    VisitDate = Convert.ToDateTime(row["VisitDate"]),
                    KidId = Convert.ToInt32(row["KidId"])
                };

                homeVisits.Add(homeVisit);
            }

            return homeVisits;
        }

        public HomeVisit GetHomeVisitById(int visitId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@VisitId", visitId }
            };

            DataTable dataTable = ExecuteQuery("SP_GetHomeVisitById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            HomeVisit homeVisit = new HomeVisit
            {
                VisitId = Convert.ToInt32(row["VisitId"]),
                VisitDate = Convert.ToDateTime(row["VisitDate"]),
                KidId = Convert.ToInt32(row["KidId"])
            };

            return homeVisit;
        }

        public int AddHomeVisit(HomeVisit homeVisit)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@VisitDate", homeVisit.VisitDate },
                { "@KidId", homeVisit.KidId }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddHomeVisit", parameters));
        }

        public bool UpdateHomeVisit(HomeVisit homeVisit)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@VisitId", homeVisit.VisitId },
                { "@VisitDate", homeVisit.VisitDate },
                { "@KidId", homeVisit.KidId }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateHomeVisit", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteHomeVisit(int visitId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@VisitId", visitId }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteHomeVisit", parameters);
            return rowsAffected > 0;
        }
    }
}