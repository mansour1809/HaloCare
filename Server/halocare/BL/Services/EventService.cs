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

        // רשימת סוגי אירועים - הוספה של פונקציה חדשה
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

        //public List<Event> GetEventsByDateRange(DateTime startDate, DateTime endDate)
        //{
        //    return _eventRepository.GetEventsByDateRange(startDate, endDate);
        //}

        public int AddEvent(Event eventItem, List<int> kidIds = null, List<int> employeeIds = null)
        {
            // וידוא שהעובד היוצר קיים ופעיל
            Employee creator = _employeeRepository.GetEmployeeById(eventItem.CreatedBy);
            if (creator == null)
            {
                throw new ArgumentException("העובד היוצר את האירוע לא נמצא במערכת");
            }
            if (!creator.IsActive)
            {
                throw new ArgumentException("לא ניתן ליצור אירוע על ידי עובד שאינו פעיל");
            }

            // וידוא שזמן הסיום מאוחר יותר מזמן ההתחלה
            if (eventItem.EndTime <= eventItem.StartTime)
            {
                throw new ArgumentException("זמן הסיום חייב להיות מאוחר יותר מזמן ההתחלה");
            }

            // יצירת האירוע
            int eventId = _eventRepository.AddEvent(eventItem);

            // הוספת ילדים לאירוע, אם צוינו
            if (kidIds != null && kidIds.Count > 0)
            {
                foreach (int kidId in kidIds)
                {
                    // וידוא שהילד קיים ופעיל
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

            // הוספת עובדים לאירוע, אם צוינו
            if (employeeIds != null && employeeIds.Count > 0)
            {
                foreach (int employeeId in employeeIds)
                {
                    // וידוא שהעובד קיים ופעיל
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
            // וידוא שהאירוע קיים
            Event existingEvent = _eventRepository.GetEventById(eventItem.EventId);
            if (existingEvent == null)
            {
                throw new ArgumentException("האירוע לא נמצא במערכת");
            }

            // וידוא שזמן הסיום מאוחר יותר מזמן ההתחלה
            if (eventItem.EndTime <= eventItem.StartTime)
            {
                throw new ArgumentException("זמן הסיום חייב להיות מאוחר יותר מזמן ההתחלה");
            }

            // עדכון האירוע
            bool updated = _eventRepository.UpdateEvent(eventItem);

            // אם צוינו ילדים, עדכון הילדים באירוע
            if (kidIds != null)
            {
                // קבלת הילדים הקיימים באירוע
                List<EventKid> existingKids = _eventKidRepository.GetEventKidsByEventId(eventItem.EventId);

                // מחיקת ילדים שאינם ברשימה החדשה
                foreach (EventKid existingKid in existingKids)
                {
                    if (!kidIds.Contains(existingKid.KidId))
                    {
                        _eventKidRepository.DeleteEventKid(eventItem.EventId, existingKid.KidId);
                    }
                }

                // הוספת ילדים חדשים
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
                        // וידוא שהילד קיים ופעיל
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

            // אם צוינו עובדים, עדכון העובדים באירוע
            if (employeeIds != null)
            {
                // קבלת העובדים הקיימים באירוע
                List<EventEmployee> existingEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(eventItem.EventId);

                // מחיקת עובדים שאינם ברשימה החדשה
                foreach (EventEmployee existingEmployee in existingEmployees)
                {
                    if (!employeeIds.Contains(existingEmployee.EmployeeId))
                    {
                        _eventEmployeeRepository.DeleteEventEmployee(eventItem.EventId, existingEmployee.EmployeeId);
                    }
                }

                // הוספת עובדים חדשים
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
                        // וידוא שהעובד קיים ופעיל
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
            // וידוא שהאירוע קיים
            Event existingEvent = _eventRepository.GetEventById(id);
            if (existingEvent == null)
            {
                throw new ArgumentException("האירוע לא נמצא במערכת");
            }

            // מחיקת הילדים מהאירוע
            List<EventKid> eventKids = _eventKidRepository.GetEventKidsByEventId(id);
            foreach (EventKid eventKid in eventKids)
            {
                _eventKidRepository.DeleteEventKid(id, eventKid.KidId);
            }

            // מחיקת העובדים מהאירוע
            List<EventEmployee> eventEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(id);
            foreach (EventEmployee eventEmployee in eventEmployees)
            {
                _eventEmployeeRepository.DeleteEventEmployee(id, eventEmployee.EmployeeId);
            }

            // מחיקת האירוע עצמו
            return _eventRepository.DeleteEvent(id);
        }

        public List<Kid> GetEventKids(int eventId)
        {
            List<Kid> kids = new List<Kid>();

            // קבלת רשימת הילדים באירוע
            List<EventKid> eventKids = _eventKidRepository.GetEventKidsByEventId(eventId);

            // קבלת פרטי הילדים
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

            // קבלת רשימת העובדים באירוע
            List<EventEmployee> eventEmployees = _eventEmployeeRepository.GetEventEmployeesByEventId(eventId);

            // קבלת פרטי העובדים
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
        //for the events types

        public EventTypes GetEventTypeById(int id)
        {
            return _eventTypeRepository.GetEventTypeById(id);
        }

        public int AddEventType(EventTypes eventType)
        {
            // בדיקה שהשם אינו ריק
            if (string.IsNullOrWhiteSpace(eventType.EventType))
            {
                throw new ArgumentException("שם סוג האירוע לא יכול להיות ריק");
            }

            // בדיקה שאין כבר סוג אירוע עם אותו שם
            List<EventTypes> existingTypes = _eventTypeRepository.GetAllEventTypes();
            if (existingTypes.Any(et => et.EventType.Equals(eventType.EventType, StringComparison.OrdinalIgnoreCase)))
            {
                throw new ArgumentException($"סוג אירוע בשם '{eventType.EventType}' כבר קיים");
            }

            // אם לא הוגדר צבע, הגדרת צבע ברירת מחדל
            if (string.IsNullOrWhiteSpace(eventType.Color))
            {
                eventType.Color = "#3788d8"; // כחול בסיסי
            }

            return _eventTypeRepository.AddEventType(eventType);
        }

        public bool UpdateEventType(EventTypes eventType)
        {
            // בדיקה שהשם אינו ריק
            if (string.IsNullOrWhiteSpace(eventType.EventType))
            {
                throw new ArgumentException("שם סוג האירוע לא יכול להיות ריק");
            }

            // בדיקה שסוג האירוע קיים
            EventTypes existingType = _eventTypeRepository.GetEventTypeById(eventType.EventTypeId);

            if (existingType == null)
            {
                throw new ArgumentException("סוג האירוע לא נמצא");
            }

            // בדיקה שאין כבר סוג אירוע אחר עם אותו שם
            List<EventTypes> allTypes = _eventTypeRepository.GetAllEventTypes();
            if (allTypes.Any(et => et.EventType.Equals(eventType.EventType, StringComparison.OrdinalIgnoreCase) && et.EventTypeId != eventType.EventTypeId))
            {
                throw new ArgumentException($"סוג אירוע בשם '{eventType.EventType}' כבר קיים");
            }

            // אם לא הוגדר צבע, שימור הצבע הקיים
            if (string.IsNullOrWhiteSpace(eventType.Color))
            {
                eventType.Color = existingType.Color;
            }

            return _eventTypeRepository.UpdateEventType(eventType);
        }

        public bool DeleteEventType(int id)
        {
            // בדיקה אם סוג האירוע קיים
            EventTypes existingType = _eventTypeRepository.GetEventTypeById(id);
            if (existingType == null)
            {
                throw new ArgumentException("סוג האירוע לא נמצא");
            }

            // בדיקה אם יש אירועים מסוג זה
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