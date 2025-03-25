import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { eventColors, toISOStringWithoutTimezone } from './calendarUtils';
import { set } from 'lodash';

// API Endpoints
const API_BASE_URL = 'https://localhost:7225/api';
const EVENTS_ENDPOINT = `${API_BASE_URL}/Events`;
const KIDS_ENDPOINT = `${API_BASE_URL}/Kids`;
const EMPLOYEES_ENDPOINT = `${API_BASE_URL}/Employees`;
const TREATMENT_TYPES_ENDPOINT = `${API_BASE_URL}/TreatmentTypes`; // נוסף - טבלת סוגי טיפולים

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
    kidId: [],
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
        kidIds: event.kidIds || [],
        employeeIds: event.employeeIds || []
      }
    };
  };

    // טעינת סוגי טיפולים מהשרת
    const fetchTreatmentTypes = useCallback(async () => {
      try {
        const response = await axios.get(TREATMENT_TYPES_ENDPOINT);
        
        // הנחה שהשרת מחזיר מערך עם שדה 'name' או 'type' שמכיל את סוג הטיפול
        const types = response.data.map(type => type.name || type.type);
        setEventTypes([...types, 'פגישת הורים', 'מפגש קבוצתי', 'ביקור בית', 'אחר']);
        return types;
      } catch (error) {
        console.error('Error fetching treatment types:', error);
        // אין יותר נתוני דמו - במקרה של שגיאה, נגדיר מינימום סוגי אירועים
        const fallbackTypes = ['פגישת הורים', 'מפגש קבוצתי', 'ביקור בית', 'אחר'];
        setEventTypes(fallbackTypes);
        return fallbackTypes;
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
      // return formattedEvents;//123
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('אירעה שגיאה בטעינת האירועים');
      setEvents([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // הוספת אירוע חדש
  const addEvent = useCallback(async (eventData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('eventData:', eventData);
      const response = await axios.post(EVENTS_ENDPOINT, eventData);
      const newEvent = formatEventForCalendar(response.data);
      
      setEvents(prevEvents => [...prevEvents, newEvent]);
      // return newEvent;//123
    } catch (error) {
      console.error('Error adding event:', error);
      setError('אירעה שגיאה בהוספת האירוע');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      console.error("Error updating event:", error);
      setError("אירעה שגיאה בעדכון האירוע");
      throw error;
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
     throw error;
    } finally {
      setIsLoading(false);
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

  
  // טעינת נתוני עזר
  const fetchReferenceData = useCallback(async () => {
    setIsLoadingReferenceData(true);
    setError(null);
    
    try {
      await Promise.all([
        fetchKids(),
        fetchEmployees(),        
        fetchTreatmentTypes()
      ]);
    } catch (error) {
      console.error('Error fetching reference data:', error);
      setError('אירעה שגיאה בטעינת נתוני עזר');
    } finally {
      setIsLoadingReferenceData(false);
    }
  }, [fetchTreatmentTypes, fetchKids, fetchEmployees]);
  

  // טעינת נתונים ראשונית
  useEffect(() => {
    fetchEvents();
    fetchReferenceData();
  }, [fetchEvents, fetchReferenceData]);
  
  // טיפול בלחיצה על תאריך ביומן
  const handleDateClick = useCallback((info) => {
    const startTime = new Date(info.date);
    const endTime = new Date(info.date);
    endTime.setMinutes(startTime.getMinutes() + 30);

    // פורמט ISO למחרוזת
    const startStr = toISOStringWithoutTimezone(startTime);
    const endStr = toISOStringWithoutTimezone(endTime);

    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: startStr,
      end: endStr,
      location: '',
      description: '',
      createdBy: 1,
      type: eventTypes.length > 0 ? eventTypes[0] : '',
      kidIds: [],
      employeeIds: []
    });
    setOpenDialog(true);
  }, [eventTypes]);
  
  // טיפול בלחיצה על אירוע קיים
  const handleEventClick = useCallback((info) => {
    const event = info.event;
    
    // המר תאריכים לפורמט HTML datetime-local
    const startStr = toISOStringWithoutTimezone(new Date(event.start))
    const endStr = event.end ? toISOStringWithoutTimezone(new Date(event.end)) : startStr;
    
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
      kidIds: event.extendedProps.kidIds || [],
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
      event: {
        id: selectedEvent ? selectedEvent.id : 0,
        title: newEvent.title,
        startTime: newEvent.start,
        endTime: newEvent.end,
        location: newEvent.location,
        description: newEvent.description,
        createdBy: newEvent.createdBy,
        type: newEvent.type
      },
      kidIds: Array.isArray(newEvent.kidIds) ? newEvent.kidIds : [],
      employeeIds: Array.isArray(newEvent.employeeIds) ? newEvent.employeeIds : []
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
      title: "",
      start: toISOStringWithoutTimezone(now),
      end: toISOStringWithoutTimezone(later),
      location: "",
      description: "",
      createdBy: 3,
      type: eventTypes.length > 0 ? eventTypes[0] : "",
      kidIds: [],
      employeeIds: []
    });
    setOpenDialog(true);
  }, [eventTypes]);


  //add new event
  

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