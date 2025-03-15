using System;
using System.Collections.Generic;
using System.Data;
using halocare.DAL.Models;
using Microsoft.Extensions.Configuration;

namespace halocare.DAL.Repositories
{
    public class EventEmployeeRepository : DBService
    {
        public EventEmployeeRepository(IConfiguration configuration) : base(configuration) { }

        public List<EventEmployee> GetEventEmployeesByEventId(int eventId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId }
            };

            List<EventEmployee> eventEmployees = new List<EventEmployee>();
            DataTable dataTable = ExecuteQuery("SP_GetEventEmployeesByEventId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                EventEmployee eventEmployee = new EventEmployee
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"])
                };

                eventEmployees.Add(eventEmployee);
            }

            return eventEmployees;
        }

        public List<EventEmployee> GetEventEmployeesByEmployeeId(int employeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EmployeeId", employeeId }
            };

            List<EventEmployee> eventEmployees = new List<EventEmployee>();
            DataTable dataTable = ExecuteQuery("SP_GetEventEmployeesByEmployeeId", parameters);

            foreach (DataRow row in dataTable.Rows)
            {
                EventEmployee eventEmployee = new EventEmployee
                {
                    EventId = Convert.ToInt32(row["EventId"]),
                    EmployeeId = Convert.ToInt32(row["EmployeeId"])
                };

                eventEmployees.Add(eventEmployee);
            }

            return eventEmployees;
        }

        public bool AddEventEmployee(int eventId, int employeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId },
                { "@EmployeeId", employeeId }
            };

            int rowsAffected = ExecuteNonQuery("SP_AddEventEmployee", parameters);
            return rowsAffected > 0;
        }

        public bool DeleteEventEmployee(int eventId, int employeeId)
        {
            Dictionary<string, object> parameters = new Dictionary<string, object>
            {
                { "@EventId", eventId },
                { "@EmployeeId", employeeId }
            };

            int rowsAffected = ExecuteNonQuery("SP_DeleteEventEmployee", parameters);
            return rowsAffected > 0;
        }
    }
}