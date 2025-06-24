using System;
using System.Collections.Generic;
using halocare.DAL.Models;
using halocare.DAL.Repositories;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace halocare.BL.Services
{
    public class EventService
    {
        private readonly EventRepository _eventRepository;
        private readonly EventTypeRepository _eventTypeRepository;
        private readonly EventKidRepository _eventKidRepository;
        private readonly EventEmployeeRepository _eventEmployeeRepository;
        private readonly KidRepository _kidRepository;
        private readonly EmployeeRepository _employeeRepository;

        public EventService(IConfiguration configuration)
        {
            _eventRepository = new EventRepository(configuration);
            _eventTypeRepository = new EventTypeRepository(configuration);
            _eventKidRepository = new EventKidRepository(configuration);
            _eventEmployeeRepository = new EventEmployeeRepository(configuration);
            _kidRepository = new KidRepository(configuration);
            _employeeRepository = new EmployeeRepository(configuration);
        }

        // List of event types - new function added
        public List<EventTypes> GetAllEventTypes()
        {
            return _eventTypeRepository.GetAllEventTypes();
        }

        public List<Event> GetAllEvents()
        {
            List<Event> events = _eventRepository.GetAllEvents();

            foreach (Event ev in events)
            {
                List<EventKid> kids = _eventKidRepository.GetEventKidsByEventId(ev.EventId);
                ev.KidIds = kids.Select(k => k.KidId).ToList();

                List<EventEmployee> employees = _eventEmployeeRepository.GetEventEmployeesByEventId(ev.EventId);
                ev.EmployeeIds = employees.Select(e => e.EmployeeId).ToList();
            }
            return events;
        }

        public Event GetEventById(int id)
        {
            return _eventRepository.GetEventById(id);
        }

        public List<Event> GetEventsByDate(DateTime date)
        {
            return _eventRepository.GetEventsByDate(date);
        }

        //public List<Event> GetEventsByDateRange(DateTime startDate, DateTime endDate)
        //{
        //    return _eventRepository.GetEventsByDateRange(startDate, endDate);
        //}

        public int AddEvent(Event eventItem, List<int> kidIds = null, List<int> employeeIds = null)
        {
            // Verify the creator employee exists and is active
            Employee creator = _employeeRepository.GetEmployeeById(eventItem.CreatedBy);
            if (creator == null)
            {
                throw new ArgumentException("העובד היוצר את האירוע לא נמצא במערכת");
            }
            if (!creator.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור אירוע על ידי עובד שאינו פעיל");
            }

            // Verify that the end time is after the start time
            if (eventItem.EndTime <= eventItem.StartTime)
            {
                throw new ArgumentException("זמן הסיום חייב להיות מאוחר יותר מזמן ההתחלה");
            }

            // Create the event
            int eventId = _eventRepository.AddEvent(eventItem);

            // Add kids to the event, if provided
            if (kidIds != null && kidIds.Count > 0)
            {
                foreach (int kidId in kidIds)
                {
                    // Verify the kid exists and is active
                    Kid kid = _kidRepository.GetKidById(kidId);
                    if (kid == null)
                    {
                        throw new ArgumentException($"הילד עם מזהה {kidId} לא נמצא במערכת");
                    }
                    if (!kid.IsActive)
                    {
                        throw new ArgumentException($"לא ניתן להוסיף לאירוע ילד שאינו פעיל (מזהה {kidId})");
                    }

                    _eventKidRepository.AddEventKid(eventId, kidId);
                }
            }

            // Add employees to the event, if provided
            if (employeeIds != null && employeeIds.Count > 0)
            {
                foreach (int employeeId in employeeIds)
                {
                    // Verify the employee exists and is active
                    Employee employee = _employeeRepository.GetEmployeeById(employeeId);
                    if (employee == null)
                    {
                        throw new ArgumentException($"העובד עם מזהה {employeeId} לא נמצא במערכת");
                    }
                    if (!employee.IsActive)
                    {
                        throw new ArgumentException($"לא ניתן להוסיף לאירוע עובד שאינו פעיל (מזהה {employeeId})");
                    }

                    _eventEmployeeRepository.AddEventEmployee(eventId, employeeId);
                }
            }

            return eventId;
        }

        public bool UpdateEvent(Event eventItem, List<int> kidIds = null, List<int> employeeIds = null)
        {
            // Verify the event exists
            Event existingEvent = _eventRepository.GetEventById(eventItem.EventId);
            if (existingEvent == null)
            {
                throw new ArgumentException("האירוע לא נמצא במערכת");
            }

            // Verify that the end time is after the start time
            if (eventItem.EndTime <= eventItem.StartTime)
            {
                throw new ArgumentException("זמן הסיום חייב להיות מאוחר יותר מזמן ההתחלה");
            }

            // Update the event
            bool updated = _eventRepository.UpdateEvent(eventItem);

            // If kids are specified, update the kids in the event
            if (kidIds != null)
            {
                // Get existing kids in the event
                List<EventKid> existingKids = _eventKidRepository.GetEventKidsByEventId(eventItem.EventId);

                // Delete kids not in the new list
                foreach (EventKid existingKid in existingKids)
                {
                    if (!kidIds.Contains(existingKid.KidId))
                    {
                        _eventKidRepository.DeleteEventKid(eventItem.EventId, existingKid.KidId);
                    }
                }

                // Add new kids
                foreach (int kidId in kidIds)
                {
                    bool exists = false;
                    foreach (EventKid existingKid in existingKids)
                    {
                        if (existingKid.KidId == kidId)
                        {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists)
                    {
                        // Verify the kid exists and is active
                        Kid kid = _kidRepository.GetKidById(kidId);
                        if (kid == null)
                        {
                            throw new ArgumentException($"הילד עם מזהה {kidId} לא נמצא במערכת");
                        }
                        if (!kid.IsActive)
                        {
                            throw new ArgumentException($"לא ניתן להוסיף לאירוע ילד שאינו פעיל (מזהה {kidId})");
                        }

                        _eventKidRepository.AddEventKid(eventItem.EventId, kidId);
                    }
                }
            }

            // If employees are specified, update the employees in the event
            if (employeeIds != null)
            {
                // Get existing employees in the event
                List<EventEmployee> existingEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(eventItem.EventId);

                // Delete employees not in the new list
                foreach (EventEmployee existingEmployee in existingEmployees)
                {
                    if (!employeeIds.Contains(existingEmployee.EmployeeId))
                    {
                        _eventEmployeeRepository.DeleteEventEmployee(eventItem.EventId, existingEmployee.EmployeeId);
                    }
                }

                // Add new employees
                foreach (int employeeId in employeeIds)
                {
                    bool exists = false;
                    foreach (EventEmployee existingEmployee in existingEmployees)
                    {
                        if (existingEmployee.EmployeeId == employeeId)
                        {
                            exists = true;
                            break;
                        }
                    }

                    if (!exists)
                    {
                        // Verify the employee exists and is active
                        Employee employee = _employeeRepository.GetEmployeeById(employeeId);
                        if (employee == null)
                        {
                            throw new ArgumentException($"העובד עם מזהה {employeeId} לא נמצא במערכת");
                        }
                        if (!employee.IsActive)
                        {
                            throw new ArgumentException($"לא ניתן להוסיף לאירוע עובד שאינו פעיל (מזהה {employeeId})");
                        }

                        _eventEmployeeRepository.AddEventEmployee(eventItem.EventId, employeeId);
                    }
                }
            }

            return updated;
        }

        public bool DeleteEvent(int id)
        {
            // Verify the event exists
            Event existingEvent = _eventRepository.GetEventById(id);
            if (existingEvent == null)
            {
                throw new ArgumentException("האירוע לא נמצא במערכת");
            }

            // Delete kids from the event
            List<EventKid> eventKids = _eventKidRepository.GetEventKidsByEventId(id);
            foreach (EventKid eventKid in eventKids)
            {
                _eventKidRepository.DeleteEventKid(id, eventKid.KidId);
            }

            // Delete employees from the event
            List<EventEmployee> eventEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(id);
            foreach (EventEmployee eventEmployee in eventEmployees)
            {
                _eventEmployeeRepository.DeleteEventEmployee(id, eventEmployee.EmployeeId);
            }

            // Delete the event itself
            return _eventRepository.DeleteEvent(id);
        }

        public List<Kid> GetEventKids(int eventId)
        {
            List<Kid> kids = new List<Kid>();

            // Get list of kids in the event
            List<EventKid> eventKids = _eventKidRepository.GetEventKidsByEventId(eventId);

            // Get kid details
            foreach (EventKid eventKid in eventKids)
            {
                Kid kid = _kidRepository.GetKidById(eventKid.KidId);
                if (kid != null)
                {
                    kids.Add(kid);
                }
            }

            return kids;
        }

        public List<Employee> GetEventEmployees(int eventId)
        {
            List<Employee> employees = new List<Employee>();

            // Get list of employees in the event
            List<EventEmployee> eventEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(eventId);

            // Get employee details
            foreach (EventEmployee eventEmployee in eventEmployees)
            {
                Employee employee = _employeeRepository.GetEmployeeById(eventEmployee.EmployeeId);
                if (employee != null)
                {
                    employees.Add(employee);
                }
            }

            return employees;
        }
        // for the event types

        public EventTypes GetEventTypeById(int id)
        {
            return _eventTypeRepository.GetEventTypeById(id);
        }

        public int AddEventType(EventTypes eventType)
        {
            // Check that the name is not empty
            if (string.IsNullOrWhiteSpace(eventType.EventType))
            {
                throw new ArgumentException("שם סוג האירוע לא יכול להיות ריק");
            }

            // Check that there is no existing event type with the same name
            List<EventTypes> existingTypes = _eventTypeRepository.GetAllEventTypes();
            if (existingTypes.Any(et => et.EventType.Equals(eventType.EventType, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException($"סוג אירוע בשם '{eventType.EventType}' כבר קיים");
            }

            // If no color is defined, set default color
            if (string.IsNullOrWhiteSpace(eventType.Color))
            {
                eventType.Color = "#3788d8"; // Basic blue
            }

            return _eventTypeRepository.AddEventType(eventType);
        }

        public bool UpdateEventType(EventTypes eventType)
        {
            // Check that the name is not empty
            if (string.IsNullOrWhiteSpace(eventType.EventType))
            {
                throw new ArgumentException("שם סוג האירוע לא יכול להיות ריק");
            }

            // Check that the event type exists
            EventTypes existingType = _eventTypeRepository.GetEventTypeById(eventType.EventTypeId);

            if (existingType == null)
            {
                throw new ArgumentException("סוג האירוע לא נמצא");
            }

            // Check that no other event type has the same name
            List<EventTypes> allTypes = _eventTypeRepository.GetAllEventTypes();
            if (allTypes.Any(et => et.EventType.Equals(eventType.EventType, StringComparison.OrdinalIgnoreCase) && et.EventTypeId != eventType.EventTypeId))
            {
                throw new ArgumentException($"סוג אירוע בשם '{eventType.EventType}' כבר קיים");
            }

            // If no color is defined, preserve existing color
            if (string.IsNullOrWhiteSpace(eventType.Color))
            {
                eventType.Color = existingType.Color;
            }

            return _eventTypeRepository.UpdateEventType(eventType);
        }

        public bool DeleteEventType(int id)
        {
            // Check if the event type exists
            EventTypes existingType = _eventTypeRepository.GetEventTypeById(id);
            if (existingType == null)
            {
                throw new ArgumentException("סוג האירוע לא נמצא");
            }

            // Check if there are events of this type
            List<Event> events = _eventRepository.GetAllEvents();
            if (events.Any(e => e.EventTypeId == id))
            {
                throw new ArgumentException("לא ניתן למחוק סוג אירוע זה כי קיימים אירועים המשתמשים בו");
            }

            return _eventTypeRepository.DeleteEventType(id);
        }

        public EventTypes GetEventTypeByName(string name)
        {
            List<EventTypes> allTypes = _eventTypeRepository.GetAllEventTypes();
            return allTypes.FirstOrDefault(et => et.EventType.Equals(name, StringComparison.OrdinalIgnoreCase));
        }
    }
}
