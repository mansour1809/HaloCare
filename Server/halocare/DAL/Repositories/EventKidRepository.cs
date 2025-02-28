using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class EventKidRepository : DBService
    {
        public EventKidRepository(IConfiguration configuration) : base(configuration) { }

        public List<EventKid> GetEventKidsByEventId(int eventId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId }
            };

            List<EventKid> eventKids = new List<EventKid>();
            DataTable dataTable = ExecuteQuery("GetEventKidsByEventId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                EventKid eventKid = new EventKid
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    KidId = Convert.ToInt32(row["KidId"])
                };

                eventKids.Add(eventKid);
            }

            return eventKids;
        }

        public List<EventKid> GetEventKidsByKidId(int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@KidId", kidId }
            };

            List<EventKid> eventKids = new List<EventKid>();
            DataTable dataTable = ExecuteQuery("GetEventKidsByKidId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                EventKid eventKid = new EventKid
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    KidId = Convert.ToInt32(row["KidId"])
                };

                eventKids.Add(eventKid);
            }

            return eventKids;
        }

        public bool AddEventKid(int eventId, int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId },
                { "@KidId", kidId }
            };

            int rowsAffected = ExecuteNonQuery("AddEventKid", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteEventKid(int eventId, int kidId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId },
                { "@KidId", kidId }
            };

            int rowsAffected = ExecuteNonQuery("DeleteEventKid", parameters);
            return rowsAffected > 0;
        }
    }
}