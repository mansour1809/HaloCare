using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class EventTypeRepository : DBService
    {
        public EventTypeRepository(IConfiguration configuration) : base(configuration) { }

        public List<EventTypes> GetAllEventTypes()
        {
            List<EventTypes> eventTypes = new List<EventTypes>();
            DataTable dataTable = ExecuteQuery("SP_GetAllEventTypes");

            foreach (DataRow row in dataTable.Rows)
            {
                EventTypes eventType = new EventTypes
                {
                    EventTypeId = Convert.ToInt32(row["EventTypeId"]),
                    EventType = row["EventType"].ToString(),
                    Color = row["Color"].ToString()
                };

                eventTypes.Add(eventType);
            }

            return eventTypes;
        }

        public EventTypes GetEventTypeById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventTypeId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetEventTypeById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            EventTypes eventType = new EventTypes
            {
                EventTypeId = Convert.ToInt32(row["EventTypeId"]),
                EventType = row["EventType"].ToString(),
                Color = row["Color"].ToString()
            };

            return eventType;
        }

        public int AddEventType(EventTypes eventType)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventType", eventType.EventType },
                { "@Color", eventType.Color }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddEventType", parameters));
        }

        public bool UpdateEventType(EventTypes eventType)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventTypeId", eventType.EventTypeId },
                { "@EventType", eventType.EventType },
                { "@Color", eventType.Color }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEventType", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteEventType(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventTypeId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteEventType", parameters);
            return rowsAffected > 0;
        }
    }
}