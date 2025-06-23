import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../../components/common/axiosConfig';
import Swal from 'sweetalert2';
import { useDispatch } from 'react-redux';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchEmployees } from '../../Redux/features/employeesSlice';
import { fetchEventTypes } from '../../Redux/features/eventTypesSlice';
import { fetchEvents } from '../../Redux/features/eventsSlice';
import { useSelector } from 'react-redux';


const CalendarContext = createContext();


export const CalendarProvider = ({ children }) => {

  const dispatch = useDispatch();
  //data from redux store
  const { events, status: eventsStatus } = useSelector(state => state.events);
  const { kids, status: kidsStatus } = useSelector(state => state.kids);
  const { employees, status: employeesStatus } = useSelector(state => state.employees);
  const { eventTypes, status: eventTypesStatus } = useSelector(state => state.eventTypes);

  useEffect(() => {
    if (kidsStatus === 'idle') {
      dispatch(fetchKids());
    }
    if (employeesStatus === 'idle') {
      dispatch(fetchEmployees());
    }
    if (eventTypesStatus === 'idle') {
      dispatch(fetchEventTypes());
    }
    if (eventsStatus === 'idle') {
      dispatch(fetchEvents());
    }
  }, [dispatch, kidsStatus, employeesStatus, eventTypesStatus, eventsStatus]);
  

  // States - Events
  const [filteredEvents, setFilteredEvents] = useState([]);
  const isLoadingFromRedux = (eventsStatus === 'loading');
  const [createdByUserId, setCreatedByUserId] = useState(0); 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
    end: '',
    location: '',
    description: '',
    createdBy: 0,
    eventTypeId: 0,
    type: '', 
    color: '', 
    kidIds: [],
    employeeIds: []
  });

  // Display and show dialogs
  const [openDialog, setOpenDialog] = useState(false);
  const [calendarView, setCalendarView] = useState('timeGridWeek');
  const [showFilterForm, setShowFilterForm] = useState(false);

  // Filtering
  const [filterOptions, setFilterOptions] = useState({
    kidId: '',
    employeeId: '',
    eventTypeId: '' 
  });

  useEffect(() => { // setup createdByUserId from localStorage

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user.id) {
        setCreatedByUserId(user.id);
      }
    } catch (error) {
      console.error('Error reading user from localStorage:', error);
    }
  }, [])

   const toISOStringWithoutTimezone = (date) => {
    if (!date) return '';
    const dt = new Date(date);
    dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
    return dt.toISOString().slice(0, 16);
  };

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


  // Adding a new event
  const addEvent = useCallback(async (eventData) => {

      const serverEventData = prepareEventData(eventData);
      const response = await axios.post('/Events', serverEventData);
      dispatch(fetchEvents());
      return response.data;

  }, [prepareEventData, dispatch]);

  // Update an existing event
  const updateEvent = useCallback(async (eventData) => {

    const serverEventData = prepareEventData(eventData);
      const response = await axios.put(`/Events/${eventData.id}`, serverEventData);
      dispatch(fetchEvents());
      return response.data;
  }, [prepareEventData,dispatch]);

  // Delete event
  const deleteEvent = useCallback(async (eventId) => {
    await axios.delete(`Events/${eventId}`);
    dispatch(fetchEvents());
  },[dispatch]);


  // Event filtering function
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

  const resetFilters = useCallback(() => {
    setFilterOptions({
      kidId: '',
      employeeId: '',
      eventTypeId: ''
    });
  }, []);

  const handleFilterChange = useCallback((e) => {
    const { name, value } = e.target;
    setFilterOptions(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleEventChange = useCallback((e) => {
    const { name, value } = e.target;

    setNewEvent(prev => {
      if (name === 'eventTypeId') {
        const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(value));

        return {
          ...prev,
          [name]: value,
          type: selectedType ? selectedType.eventType : '', 
          color: selectedType ? selectedType.color : '',
        };
      }

      return {
        ...prev,
        [name]: value
      };
    });
  }, [eventTypes]);

  useEffect(() => {
    filterEvents();
  }, [events, filterOptions, filterEvents]);

  useEffect(() => {
     dispatch(fetchEvents());
  }, [dispatch]);


  const handleDateClick = useCallback((info) => {
    const defaultVal= getDefaultEventValues(info.date, null);
    setSelectedEvent(null);
    setNewEvent(defaultVal);
    setOpenDialog(true);
  }, [getDefaultEventValues]);

  const handleEventClick = useCallback((info) => {
    const event = info.event;

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
      eventTypeId: event.extendedProps.eventTypeId || '', 
      type: event.extendedProps.type || '', 
      color: event.extendedProps.color || '',
      kidIds: event.extendedProps.kidIds || [],
      employeeIds: event.extendedProps.employeeIds || []
    });

    setOpenDialog(true);
  }, []);


  const handleSaveEvent = useCallback(async () => {
 
    const selectedType = eventTypes.find(type => type.eventTypeId === parseInt(newEvent.eventTypeId));

    const eventData = {
      id: selectedEvent ? selectedEvent.id : 0,
      title: newEvent.title,
      start: newEvent.start,
      end: newEvent.end,
      location: newEvent.location || '',
      description: newEvent.description || '',
      createdBy: newEvent.createdBy || 1,
      color: selectedType.color || '', 
      eventType: selectedType.eventType, 
      eventTypeId: parseInt(newEvent.eventTypeId), 
      kidIds: Array.isArray(newEvent.kidIds) ? newEvent.kidIds.map(id => parseInt(id)) : [],
      employeeIds: Array.isArray(newEvent.employeeIds) ? newEvent.employeeIds.map(id => parseInt(id)) : []
    };

    try {
      // setIsLoading(true);
      if (selectedEvent) {
        setOpenDialog(false);
        Swal.fire({
          didOpen: () => {
            Swal.showLoading();
          },
          text: 'מעדכן את האירוע',
          showConfirmButton: false,
        });
        await updateEvent(eventData);
        Swal.fire({
          icon: 'success',
          title: 'עודכן בהצלחה',
          text: 'האירוע עודכן בהצלחה',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        setOpenDialog(false);
        Swal.fire({
          didOpen: () => {
            Swal.showLoading();
          },
          text: 'ממתין להוספת האירוע',
          showConfirmButton: false,
        });
        await addEvent(eventData);
        Swal.fire({
          icon: 'success',
          title: 'נוסף בהצלחה',
          text: 'האירוע נוסף בהצלחה',
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error saving event:', error.response ? error.response.data : error);
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: 'שגיאה בשמירת האירוע',
      });
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
    
    setTimeout(() => {
      Swal.fire({
        title: 'האם אתה בטוח?',
        text: 'האם אתה בטוח שברצונך למחוק אירוע זה?',
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
    }, 100);
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




  //what we want to expose to the components that use this context
  const contextValue = {
    events,
    filteredEvents,
    isLoadingFromRedux,
    kids,
    employees,
    eventTypes,
    selectedEvent,
    newEvent,
    openDialog,
    calendarView,
    showFilterForm,
    filterOptions,
    createdByUserId,

//actions
    fetchEvents: () => dispatch(fetchEvents()),
    addEvent,
    updateEvent,
    deleteEvent,
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
    setShowFilterForm,
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