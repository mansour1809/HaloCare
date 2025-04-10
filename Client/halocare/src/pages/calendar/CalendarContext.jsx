import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toISOStringWithoutTimezone } from './calendarUtils';
import Swal from 'sweetalert2';

// API Endpoints
const API_BASE_URL = 'https://localhost:7225/api';
const EVENTS_ENDPOINT = `${API_BASE_URL}/Events`;
const KIDS_ENDPOINT = `${API_BASE_URL}/Kids`;
const EMPLOYEES_ENDPOINT = `${API_BASE_URL}/Employees`;
const EVENT_TYPES_ENDPOINT = `${API_BASE_URL}/EventTypes`; // שינוי - נקודת קצה לטבלת סוגי אירועים

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
  const [eventTypes, setEventTypes] = useState([]);
  const [isLoadingReferenceData, setIsLoadingReferenceData] = useState(false);
  const [createdByUserId, setCreatedByUserId] = useState(0); // מזהה יוצר האירוע - ברירת מחדל

  // מצבים - עריכה/יצירת אירוע
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
    createdBy: 0,
    eventTypeId: 0, // שינוי - שימוש במזהה סוג אירוע במקום מחרוזת
    type: '', // שמירה לנוחות ממשק המשתמש
    color: '', // צבע האירוע - חדש
    kidIds: [],
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
    eventTypeId: '' 
  });

  useEffect(() => { // setup createdByUserId from localStorage

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        setCreatedByUserId(user.id); // הגדרת מזהה יוצר האירוע
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
  }, [])

  const getDefaultEventValues = useCallback((startTime = new Date(), endTime = null) => {
    if (!endTime) {
      endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1);
    }
    
    return {
      title: '',
      start: toISOStringWithoutTimezone(startTime),
      end: toISOStringWithoutTimezone(endTime),
      location: '',
      description: '',
      createdBy: createdByUserId,
      eventTypeId: eventTypes.length > 0 ? eventTypes[0].eventTypeId : '',
      type: eventTypes.length > 0 ? eventTypes[0].eventType : '',
      color: eventTypes.length > 0 ? eventTypes[0].color : '',
      kidIds: [],
      employeeIds: []
    };
  }, [eventTypes, createdByUserId]);


  const prepareEventData = useCallback((eventData) => {
    return {
      eventId: eventData.id ? parseInt(eventData.id) : 0,
      eventType: eventData.eventType,
      startTime: eventData.start,
      endTime: eventData.end,
      color: eventData.color,
      location: eventData.location || '',
      description: eventData.description || '',
      eventTitle: eventData.title || '',
      createdBy: eventData.createdBy || createdByUserId,
      kidIds: Array.isArray(eventData.kidIds) ? eventData.kidIds.map(id => parseInt(id)) : [],
      employeeIds: Array.isArray(eventData.employeeIds) ? eventData.employeeIds.map(id => parseInt(id)) : []
    };
  }, [createdByUserId]);

  
  // המרת אירוע מהשרת לפורמט המתאים ליומן
  const formatEventForCalendar = useCallback((event) => {
    return {
      id: event.eventId,
      title: event.eventTitle || event.eventType, // שימוש בכותרת החדשה אם קיימת
      start: event.startTime,
      end: event.endTime,
      backgroundColor: event.color || '#1976d2', // שימוש בצבע שהגיע מהשרת
      borderColor: event.color || '#1976d2',
      extendedProps: {
        location: event.location,
        description: event.description,
        eventTypeId: event.eventTypeId, // שמירת המזהה של סוג האירוע
        type: event.eventType, // שמירת המחרוזת של סוג האירוע
        color: event.color, // שמירת הצבע
        createdBy: event.createdBy,
        kidIds: event.kidIds || [],
        employeeIds: event.employeeIds || []
      }
    };
  },[]);

  // טעינת סוגי אירועים מהשרת
  const fetchEventTypes = useCallback(async () => {
    try {
      const response = await axios.get(EVENT_TYPES_ENDPOINT);
      setEventTypes(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching event types:', error);
      return [];
    }
  }, []);

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
      console.error('Error adding event:', error);
      setError('אירעה שגיאה בטעינת האירועים');
      setEvents([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [formatEventForCalendar]);

  // הוספת אירוע חדש
  const addEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);


    try {
      // המרת נתוני האירוע לפורמט שהשרת מצפה לו
      const serverEventData = prepareEventData(eventData);
      const response = await axios.post(EVENTS_ENDPOINT, serverEventData);
      const newFormattedEvent = formatEventForCalendar(response.data);
      setEvents(prevEvents => [...prevEvents, newFormattedEvent]);
      return response.data;
    } catch (error) {
      console.error('Error adding event:', error);
      setError('אירעה שגיאה בהוספת האירוע');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [prepareEventData, formatEventForCalendar]);

  // עדכון אירוע קיים
  const updateEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);

    try {
      // converting the event calendar for the server
      const serverEventData = prepareEventData(eventData);
      const response = await axios.put(`${EVENTS_ENDPOINT}/${eventData.id}`, serverEventData);
      await fetchEvents();//refreshing the events list
      return response.data;
    } catch (error) {
      console.error('Error updating event:', error);
      setError('אירעה שגיאה בעדכון האירוע');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [prepareEventData, fetchEvents]);

  // מחיקת אירוע
  const deleteEvent = useCallback(async (eventId) => {
    setIsLoading(true);
    setError(null);

    try {
      await axios.delete(`${EVENTS_ENDPOINT}/${eventId}`);

      // רענון הנתונים
      await fetchEvents();

      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('אירעה שגיאה במחיקת האירוע');
      throw error;
    } finally {
      setIsLoading(false);
    }
  },[fetchEvents]);

  // טעינת רשימת ילדים
  const fetchKids = useCallback(async () => {
    try {
      const response = await axios.get(KIDS_ENDPOINT);
      setKids(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching kids:', error);
      setKids([]);
      return [];
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
      setEmployees([]);
      return [];
    }
  }, []);

  // פונקציית סינון אירועים
  const filterEvents = useCallback(() => {
    let filtered = [...events];

    if (filterOptions.kidId) {
      filtered = filtered.filter(event =>
        event.extendedProps.kidIds &&
        event.extendedProps.kidIds.includes(parseInt(filterOptions.kidId))
      );
    }

    if (filterOptions.employeeId) {
      filtered = filtered.filter(event =>
        event.extendedProps.employeeIds &&
        event.extendedProps.employeeIds.includes(parseInt(filterOptions.employeeId))
      );
    }

    if (filterOptions.eventTypeId) {
      filtered = filtered.filter(event =>
        event.extendedProps.eventTypeId === parseInt(filterOptions.eventTypeId)
      );
    }

    setFilteredEvents(filtered);
  }, [events, filterOptions]);

  // איפוס מסננים
  const resetFilters = useCallback(() => {
    setFilterOptions({
      kidId: '',
      employeeId: '',
      eventTypeId: ''
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

  // טיפול בשינוי ערכי האירוע
  const handleEventChange = useCallback((e) => {
    const { name, value } = e.target;

    setNewEvent(prev => {
      // update the color if eventType updated
      if (name === 'eventTypeId') {
        const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(value));

        return {
          ...prev,
          [name]: value,
          type: selectedType ? selectedType.eventType : '', // שמירת המחרוזת של סוג האירוע
          color: selectedType ? selectedType.color : '', // עדכון הצבע
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });
  }, [eventTypes]);

  // הפעלת הסינון בעת שינוי במסנן או באירועים
  useEffect(() => {
    filterEvents();
  }, [events, filterOptions, filterEvents]);

  // טעינת נתוני עזר
  const fetchReferenceData = useCallback(async () => {
    setIsLoadingReferenceData(true);
    setError(null);

    try {
      await Promise.all([
        fetchKids(),
        fetchEmployees(),
        fetchEventTypes()
      ]);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setError('אירעה שגיאה בטעינת נתוני עזר');
    } finally {
      setIsLoadingReferenceData(false);
    }
  }, [fetchKids, fetchEmployees, fetchEventTypes]);

  // טעינת נתונים ראשונית
  useEffect(() => {
    fetchEvents();
    fetchReferenceData();
  }, [fetchEvents, fetchReferenceData]);



  
  // טיפול בלחיצה על תאריך ביומן
  const handleDateClick = useCallback((info) => {
    const defaultVal= getDefaultEventValues(info.date, null);
    setSelectedEvent(null);
    setNewEvent(defaultVal);
    setOpenDialog(true);
  }, [getDefaultEventValues]);

  // טיפול בלחיצה על אירוע קיים
  const handleEventClick = useCallback((info) => {
    const event = info.event;

    // המר תאריכים לפורמט HTML datetime-local
    const startStr = toISOStringWithoutTimezone(new Date(event.start));
    const endStr = event.end ? toISOStringWithoutTimezone(new Date(event.end)) : startStr;

    setSelectedEvent(event);

    setNewEvent({
      id: event.id,
      title: event.title || '',
      start: startStr,
      end: endStr,
      location: event.extendedProps.location || '',
      description: event.extendedProps.description || '',
      createdBy: event.extendedProps.createdBy,
      eventTypeId: event.extendedProps.eventTypeId || '', // שמירת המזהה
      type: event.extendedProps.type || '', // שמירת המחרוזת
      color: event.extendedProps.color || '', // שמירת הצבע
      kidIds: event.extendedProps.kidIds || [],
      employeeIds: event.extendedProps.employeeIds || []
    });

    setOpenDialog(true);
  }, []);

  // שמירת אירוע
  const handleSaveEvent = useCallback(async () => {
    // מציאת סוג האירוע לפי המזהה
    const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(newEvent.eventTypeId));
    // בניית אובייקט הנתונים לשליחה
    const eventData = {
      id: selectedEvent ? selectedEvent.id : 0,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      location: newEvent.location || '',
      description: newEvent.description || '',
      createdBy: newEvent.createdBy || 1,
      color: selectedType.color || '', // שמירת הצבע שנבחר
      eventType: selectedType.eventType, // שליחת שם סוג האירוע
      eventTypeId: parseInt(newEvent.eventTypeId), // מזהה סוג האירוע
      kidIds: Array.isArray(newEvent.kidIds) ? newEvent.kidIds.map(id => parseInt(id)) : [],
      employeeIds: Array.isArray(newEvent.employeeIds) ? newEvent.employeeIds.map(id => parseInt(id)) : []
    };

    try {
      if (selectedEvent) {
        await updateEvent(eventData);
      } else {
        await addEvent(eventData);
      }
      setOpenDialog(false);
    } catch (error) {
      console.error('Error saving event:', error.response ? error.response.data : error);
      alert('אירעה שגיאה בשמירת האירוע');
    }
  }, [newEvent, selectedEvent, updateEvent, addEvent, eventTypes]);


  const handleDeleteEvent = useCallback(async () => {
    if (!selectedEvent || !selectedEvent.id) {
      Swal.fire({
        icon: 'warning',
        title: 'שגיאה',
        text: 'לא נבחר אירוע למחיקה',
      });
      return;
    }

    setOpenDialog(false);

    // Wait to ensure the dialog closed
    setTimeout(() => {
      Swal.fire({
        title: '? האם אתה בטוח',
        text: '? האם אתה בטוח שברצונך למחוק אירוע זה',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'כן, מחק!',
        cancelButtonText: 'בטל'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteEvent(selectedEvent.id);
            Swal.fire({
              icon: 'success',
              title: 'נמחק בהצלחה',
              text: 'האירוע נמחק בהצלחה',
              timer: 2000,
              showConfirmButton: false
            });
          } catch (error) {
            console.error('Error deleting event:', error);
            Swal.fire({
              icon: 'error',
              title: 'שגיאה',
              text: 'אירעה שגיאה במחיקת האירוע',
            });
          }
        }
      });
    }, 100); // Slight delay to ensure dialog closes first

  }, [selectedEvent, deleteEvent]);


  // changing calendar view
  const handleViewChange = useCallback((view) => {
    setCalendarView(view);
  }, []);

  // creating new event
  const createNewEvent = useCallback(() => {
    const now = new Date();
    const later = new Date(now);
    later.setHours(later.getHours() + 1);
    setSelectedEvent(null);
    const defaultVal= getDefaultEventValues(now,later);
    setNewEvent(defaultVal);
    setOpenDialog(true);
  }, [getDefaultEventValues]);

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
    createdByUserId,

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

// הוק שימושי לשימוש בקונטקסט
export const useCalendar = () => {
  const context = useContext(CalendarContext);

  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }

  return context;
};

export default CalendarContext;