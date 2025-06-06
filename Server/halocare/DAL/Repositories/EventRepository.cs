﻿using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class EventRepository : DBService
    {
        public EventRepository(IConfiguration configuration) : base(configuration) { }

        public List<Event> GetAllEvents()
        {
            List<Event> events = new List<Event>();
            DataTable dataTable = ExecuteQuery("SP_GetAllEvents");
            foreach (DataRow row in dataTable.Rows)
            {
                Event eventItem = new Event
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    EventTypeId = Convert.ToInt32(row["EventTypeId"]),
                    EventType = row["EventType"].ToString(),
                    Color = row["Color"].ToString(),
                    StartTime = Convert.ToDateTime(row["StartTime"]),
                    EndTime = Convert.ToDateTime(row["EndTime"]),
                    Location = row["Location"].ToString(),
                    Description = row["Description"].ToString(),
                    EventTitle = row["EventTitle"]?.ToString(),
                    CreatedBy = Convert.ToInt32(row["CreatedBy"])
                };

                events.Add(eventItem);
            }

            return events;
        }
        
        
        public List<Event> GetEventsByDate(DateTime date)
        {
            List<Event> events = new List<Event>();
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventsByDate", date }
            };

            DataTable dataTable = ExecuteQuery("SP_GetEventsByDate",parameters);
            foreach (DataRow row in dataTable.Rows)
            {
                Event eventItem = new Event
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    EventTypeId = Convert.ToInt32(row["EventTypeId"]),
                    EventType = row["EventType"].ToString(),
                    Color = row["Color"].ToString(),
                    StartTime = Convert.ToDateTime(row["StartTime"]),
                    EndTime = Convert.ToDateTime(row["EndTime"]),
                    Location = row["Location"].ToString(),
                    Description = row["Description"].ToString(),
                    EventTitle = row["EventTitle"]?.ToString(),
                    CreatedBy = Convert.ToInt32(row["CreatedBy"])
                };

                events.Add(eventItem);
            }

            return events;
        }

        public Event GetEventById(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", id }
            };

            DataTable dataTable = ExecuteQuery("SP_GetEventById", parameters);

            if (dataTable.Rows.Count == 0)
                return null;

            DataRow row = dataTable.Rows[0];

            Event eventItem = new Event
            {
                EventId = Convert.ToInt32(row["EventId"]),
                EventTypeId = Convert.ToInt32(row["EventTypeId"]),
                EventType = row["EventType"].ToString(),
                Color = row["Color"].ToString(),
                StartTime = Convert.ToDateTime(row["StartTime"]),
                EndTime = Convert.ToDateTime(row["EndTime"]),
                Location = row["Location"].ToString(),
                Description = row["Description"].ToString(),
                EventTitle = row["EventTitle"]?.ToString(),
                CreatedBy = Convert.ToInt32(row["CreatedBy"])
            };

            return eventItem;
        }


        public int AddEvent(Event eventItem)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventType", eventItem.EventType },
                { "@StartTime", eventItem.StartTime },
                { "@EndTime", eventItem.EndTime },
                { "@Location", eventItem.Location },
                { "@Description", eventItem.Description },
                { "@EventTitle", eventItem.EventTitle },
                { "@CreatedBy", eventItem.CreatedBy }
            };

            return Convert.ToInt32(ExecuteScalar("SP_AddEvent", parameters));
        }

        public bool UpdateEvent(Event eventItem)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventItem.EventId },
                { "@EventType", eventItem.EventType },
                { "@StartTime", eventItem.StartTime },
                { "@EndTime", eventItem.EndTime },
                { "@Location", eventItem.Location },
                { "@Description", eventItem.Description },
                { "@EventTitle", eventItem.EventTitle },
                { "@CreatedBy", eventItem.CreatedBy }
            };

            int rowsAffected = ExecuteNonQuery("SP_UpdateEvent", parameters);
            return rowsAffected > 0;
        }


        public bool DeleteEvent(int id)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", id }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteEvent", parameters);
            return rowsAffected > 0;
        }
    }
}