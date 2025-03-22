import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { eventColors } from '../utils/calendarUtils';

// API Endpoints
const API_BASE_URL = 'https://localhost:7225/api';
const EVENTS_ENDPOINT = `${API_BASE_URL}/Events`;
const KIDS_ENDPOINT = `${API_BASE_URL}/Kids`;
const EMPLOYEES_ENDPOINT = `${API_BASE_URL}/Employees`;

// רשימת סוגי אירועים מוגדרים מראש
const DEFAULT_EVENT_TYPES = [
  'טיפול פיזיותרפיה',
  'טיפול רגשי',
  'טיפול בעיסוק',
  'פגישת הורים',
  'מפגש קבוצתי',
  'ביקור בית',
  'אחר'
];

// יצירת הקונטקסט
const CalendarContext = createContext();

// פרובידר לקונטקסט
export const CalendarProvider = ({ children }) => {
  // מצבים - אירועים
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // מצבים - נתוני עזר
  const [kids, setKids] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [eventTypes, setEventTypes] = useState(DEFAULT_EVENT_TYPES);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);

  // מצבים - עריכה/יצירת אירוע
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
    createdBy: 1,
    type: '',
    kidId: '',
    employeeIds: []
  });

  // תצוגה והצגת דיאלוגים
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [showFilterForm, setShowFilterForm] = useState(false);
  
  // סינון
  const [filterOptions, setFilterOptions] = useState({
    kidId: '',
    employeeId: '',
    eventType: ''
  });

  // המרת אירוע מהשרת לפורמט המתאים ליומן
  const formatEventForCalendar = (event) => {
    return {
      id: event.id,
      title: event.title || `אירוע ${event.type}`,
      start: event.startTime,
      end: event.endTime,
      backgroundColor: eventColors[event.type] || eventColors['אחר'],
      borderColor: eventColors[event.type] || eventColors['אחר'],
      extendedProps: {
        location: event.location,
        description: event.description,
        type: event.type,
        createdBy: event.createdBy,
        kidId: event.kidId,
        employeeIds: event.employeeIds || []
      }
    };
  };

  // טעינת אירועים
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(EVENTS_ENDPOINT);
      const formattedEvents = response.data.map(formatEventForCalendar);
      setEvents(formattedEvents);
      return formattedEvents;
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('אירעה שגיאה בטעינת האירועים');
      
      // נתוני הדגמה למקרה שהשרת לא זמין
      const demoEvents = [
        {
          id: 1,
          title: 'טיפול פיזיותרפיה - יוסי',
          start: '2024-03-14T09:00:00',
          end: '2024-03-14T10:00:00',
          backgroundColor: eventColors['טיפול פיזיותרפיה'],
          borderColor: eventColors['טיפול פיזיותרפיה'],
          extendedProps: {
            location: 'חדר טיפולים 1',
            description: 'טיפול שבועי',
            type: 'טיפול פיזיותרפיה',
            createdBy: 1,
            kidId: 1,
            employeeIds: [2]
          }
        },
        {
          id: 2,
          title: 'פגישת הורים - משפחת כהן',
          start: '2024-03-14T11:00:00',
          end: '2024-03-14T12:00:00',
          backgroundColor: eventColors['פגישת הורים'],
          borderColor: eventColors['פגישת הורים'],
          extendedProps: {
            location: 'חדר ישיבות',
            description: 'פגישה עם הורי יוסי',
            type: 'פגישת הורים',
            createdBy: 1,
            kidId: 1,
            employeeIds: [1, 3]
          }
        },
        {
          id: 3,
          title: 'טיפול רגשי - נועה',
          start: '2024-03-15T10:00:00',
          end: '2024-03-15T11:00:00',
          backgroundColor: eventColors['טיפול רגשי'],
          borderColor: eventColors['טיפול רגשי'],
          extendedProps: {
            location: 'חדר טיפולים 2',
            description: 'טיפול רגשי שבועי',
            type: 'טיפול רגשי',
            createdBy: 1,
            kidId: 2,
            employeeIds: [3]
          }
        },
        {
          id: 4,
          title: 'מפגש קבוצתי',
          start: '2024-03-16T09:30:00',
          end: '2024-03-16T11:00:00',
          backgroundColor: eventColors['מפגש קבוצתי'],
          borderColor: eventColors['מפגש קבוצתי'],
          extendedProps: {
            location: 'חדר פעילות',
            description: 'מפגש קבוצתי שבועי',
            type: 'מפגש קבוצתי',
            createdBy: 1,
            employeeIds: [1, 2, 3, 5]
          }
        }
      ];
      
      setEvents(demoEvents);
      return demoEvents;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // הוספת אירוע חדש
  const addEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(EVENTS_ENDPOINT, eventData);
      const newEvent = formatEventForCalendar(response.data);
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      setError('אירעה שגיאה בהוספת האירוע');
      
      // במקרה של שגיאה, מוסיף אירוע בלוקאלי עם ID מספרי חדש
      const newId = Math.max(...events.map(e => parseInt(e.id)), 0) + 1;
      const newEvent = {
        ...formatEventForCalendar({
          ...eventData,
          id: newId
        })
      };
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      return newEvent;
    } finally {
      setIsLoading(false);
    }
  }, [events]);

  // עדכון אירוע קיים
  const updateEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`${EVENTS_ENDPOINT}/${eventData.id}`, eventData);
      const updatedEvent = formatEventForCalendar(response.data);
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('אירעה שגיאה בעדכון האירוע');
      
      // במקרה של שגיאה, מעדכן אירוע בלוקאלי
      const updatedEvent = formatEventForCalendar(eventData);
      
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === updatedEvent.id ? updatedEvent : event
        )
      );
      
      return updatedEvent;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // מחיקת אירוע
  const deleteEvent = useCallback(async (eventId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await axios.delete(`${EVENTS_ENDPOINT}/${eventId}`);
      
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('אירעה שגיאה במחיקת האירוע');
      
      // במקרה של שגיאה, מוחק אירוע בלוקאלי
      setEvents(prevEvents => 
        prevEvents.filter(event => event.id !== eventId)
      );
      
      return { success: true };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // טעינת נתוני עזר
  const fetchReferenceData = useCallback(async () => {
    setIsLoadingReferenceData(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchKids(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setError('אירעה שגיאה בטעינת נתוני עזר');
    } finally {
      setIsLoadingReferenceData(false);
    }
  }, []);
  
  // טעינת רשימת ילדים
  const fetchKids = useCallback(async () => {
    try {
      const response = await axios.get(KIDS_ENDPOINT);
      setKids(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching kids:', error);
      
      // נתוני הדגמה במקרה שהשרת לא זמין
      const demoKids = [
        { id: 1, firstName: 'יוסי', lastName: 'כהן' },
        { id: 2, firstName: 'נועה', lastName: 'לוי' },
        { id: 3, firstName: 'דני', lastName: 'גולן' },
        { id: 4, firstName: 'מיכל', lastName: 'אברהם' },
        { id: 5, firstName: 'רון', lastName: 'שלום' },
      ];
      
      setKids(demoKids);
      return demoKids;
    }
  }, []);

  // טעינת רשימת עובדים
  const fetchEmployees = useCallback(async () => {
    try {
      const response = await axios.get(EMPLOYEES_ENDPOINT);
      setEmployees(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching employees:', error);
      
      // נתוני הדגמה במקרה שהשרת לא זמין
      const demoEmployees = [
        { id: 1, firstName: 'טלי', lastName: 'ישראלי', role: 'מנהלת' },
        { id: 2, firstName: 'יעל', lastName: 'כהן', role: 'פיזיותרפיסטית' },
        { id: 3, firstName: 'דן', lastName: 'לוי', role: 'מטפל רגשי' },
        { id: 4, firstName: 'מירה', lastName: 'שגב', role: 'מרפאה בעיסוק' },
        { id: 5, firstName: 'אורן', lastName: 'דוד', role: 'פסיכולוג' },
      ];
      
      setEmployees(demoEmployees);
      return demoEmployees;
    }
  }, []);

  // פונקציית סינון אירועים
  const filterEvents = useCallback(() => {
    let filtered = [...events];
    
    if (filterOptions.kidId) {
      filtered = filtered.filter(event => 
        event.extendedProps.kidId === parseInt(filterOptions.kidId)
      );
    }
    
    if (filterOptions.employeeId) {
      filtered = filtered.filter(event => 
        event.extendedProps.employeeIds && 
        event.extendedProps.employeeIds.includes(parseInt(filterOptions.employeeId))
      );
    }
    
    if (filterOptions.eventType) {
      filtered = filtered.filter(event => 
        event.extendedProps.type === filterOptions.eventType
      );
    }
    
    setFilteredEvents(filtered);
  }, [events, filterOptions]);

  // איפוס מסננים
  const resetFilters = useCallback(() => {
    setFilterOptions({
      kidId: '',
      employeeId: '',
      eventType: ''
    });
  }, []);

  // טיפול בשינוי מסננים
  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);
  
  // הטיפול בסיכום טופס האירוע
  const handleEventChange = useCallback((e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // הפעלת הסינון בעת שינוי במסנן או באירועים
  useEffect(() => {
    filterEvents();
  }, [events, filterOptions, filterEvents]);

  // טעינת נתונים ראשונית
  useEffect(() => {
    fetchEvents();
    fetchReferenceData();
  }, [fetchEvents, fetchReferenceData]);
  
  // טיפול בלחיצה על תאריך ביומן
  const handleDateClick = useCallback((info) => {
    const startTime = new Date(info.date);
    const endTime = new Date(info.date);
    endTime.setHours(startTime.getHours() + 1);
    
    // פורמט ISO למחרוזת
    const startStr = startTime.toISOString().slice(0, 16);
    const endStr = endTime.toISOString().slice(0, 16);
    
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: startStr,
      end: endStr,
      location: '',
      description: '',
      createdBy: 1,
      type: eventTypes.length > 0 ? eventTypes[0] : '',
      kidId: '',
      employeeIds: []
    });
    setOpenDialog(true);
  }, [eventTypes]);
  
  // טיפול בלחיצה על אירוע קיים
  const handleEventClick = useCallback((info) => {
    const event = info.event;
    
    // המר תאריכים לפורמט HTML datetime-local
    const startStr = new Date(event.start).toISOString().slice(0, 16);
    const endStr = event.end ? new Date(event.end).toISOString().slice(0, 16) : startStr;
    
    setSelectedEvent(event);
    setNewEvent({
      id: event.id,
      title: event.title,
      start: startStr,
      end: endStr,
      location: event.extendedProps.location || '',
      description: event.extendedProps.description || '',
      createdBy: event.extendedProps.createdBy || 1,
      type: event.extendedProps.type || '',
      kidId: event.extendedProps.kidId || '',
      employeeIds: event.extendedProps.employeeIds || []
    });
    setOpenDialog(true);
  }, []);

  // שמירת אירוע
  const handleSaveEvent = useCallback(async () => {
    // בדיקות תקינות
    if (!newEvent.title || !newEvent.start || !newEvent.end || !newEvent.type) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }
    
    if (new Date(newEvent.end) <= new Date(newEvent.start)) {
      alert('זמן הסיום חייב להיות אחרי זמן ההתחלה');
      return;
    }
    
    const eventData = {
      id: selectedEvent ? selectedEvent.id : undefined,
      title: newEvent.title,
      startTime: newEvent.start,
      endTime: newEvent.end,
      location: newEvent.location,
      description: newEvent.description,
      createdBy: newEvent.createdBy,
      type: newEvent.type,
      kidId: newEvent.kidId || null,
      employeeIds: newEvent.employeeIds || []
    };
    
    try {
      if (selectedEvent) {
        await updateEvent(eventData);
      } else {
        await addEvent(eventData);
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('שגיאה בשמירת האירוע:', error);
      alert('אירעה שגיאה בשמירת האירוע');
    }
  }, [newEvent, selectedEvent, updateEvent, addEvent]);

  // מחיקת אירוע
  const handleDeleteEvent = useCallback(async () => {
    if (selectedEvent) {
      try {
        await deleteEvent(selectedEvent.id);
        setOpenDialog(false);
      } catch (error) {
        console.error('שגיאה במחיקת האירוע:', error);
        alert('אירעה שגיאה במחיקת האירוע');
      }
    }
  }, [selectedEvent, deleteEvent]);

  // שינוי תצוגת יומן
  const handleViewChange = useCallback((view) => {
    setCalendarView(view);
  }, []);

  // יצירת אירוע חדש
  const createNewEvent = useCallback(() => {
    // יצירת אירוע בזמן נוכחי עם שעה עתידית
    const now = new Date();
    const later = new Date(now);
    later.setHours(later.getHours() + 1);
    
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: now.toISOString().slice(0, 16),
      end: later.toISOString().slice(0, 16),
      location: '',
      description: '',
      createdBy: 1,
      type: eventTypes.length > 0 ? eventTypes[0] : '',
      kidId: '',
      employeeIds: []
    });
    setOpenDialog(true);
  }, [eventTypes]);

  // ערך הקונטקסט - כל מה שנרצה לחשוף
  const contextValue = {
    // נתונים
    events,
    filteredEvents,
    isLoading,
    error,
    kids,
    employees,
    eventTypes,
    isLoadingReferenceData,
    selectedEvent,
    newEvent,
    openDialog,
    calendarView,
    showFilterForm,
    filterOptions,
    
    // פעולות
    fetchEvents,
    addEvent,
    updateEvent,
    deleteEvent,
    fetchReferenceData,
    filterEvents,
    resetFilters,
    handleFilterChange,
    handleEventChange,
    handleDateClick,
    handleEventClick,
    handleSaveEvent,
    handleDeleteEvent,
    handleViewChange,
    createNewEvent,
    setSelectedEvent,
    setNewEvent,
    setOpenDialog,
    setCalendarView,
    setShowFilterForm
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
};

// Hook שימושי לשימוש בקונטקסט
export const useCalendar = () => {
  const context = useContext(CalendarContext);
  
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  
  return context;
};

export default CalendarContext;