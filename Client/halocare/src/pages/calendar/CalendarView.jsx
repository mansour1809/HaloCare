import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { Box, Skeleton, Tooltip, Typography } from '@mui/material';
import './calendarStyles.css';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

const CalendarView = ({
  calendarRef,
  events,
  isLoading
}) => {
  // קבלת ערכים ופונקציות מהקונטקסט
  const {
    calendarView,
    handleDateClick,
    handleEventClick
  } = useCalendar();
  
  // אם טוען אירועים, הצג skeleton 
  if (isLoading) {
    return (
      <Box sx={{ p: 4, height: '600px' }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={560} animation="wave" />
      </Box>
    );
  }
  
  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView={calendarView}
      locale={heLocale}
      direction="rtl"
      headerToolbar={{
        right: 'next today prev',
        center: 'title',
        left: 'timeGridDay timeGridWeek dayGridMonth'
      }}
      events={events}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      editable={false} // אירועים לא ניתנים לגרירה כברירת מחדל
      selectable={true}
      selectMirror={true}
      dayMaxEvents={true}
      weekends={true}
      allDaySlot={false}
      slotMinTime="07:00:00"
      slotMaxTime="19:00:00"
      height="auto"
      aspectRatio={1.8}  // יחס גובה-רוחב טוב יותר לתצוגה
      handleWindowResize={true}
      stickyHeaderDates={true}
      nowIndicator={true} // הצגת קו המציין את השעה הנוכחית
      // מראה המלל בתאים
      eventTimeFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }}
      // עיצוב תצוגת תוויות זמן בצד היומן
      slotLabelFormat={{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }}
      // טקסט כפתורים
      buttonText={{
        today: 'היום',
        month: 'חודש',
        week: 'שבוע',
        day: 'יום'
      }}
      // פורמט תאריכים בכותרת
      views={{
        timeGridDay: {
          titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
        },
        timeGridWeek: {
          titleFormat: { day: 'numeric', month: 'long', year: 'numeric' }
        },
        dayGridMonth: {
          titleFormat: { month: 'long', year: 'numeric' }
        }
      }}
      // עיצוב האירועים
      eventContent={renderEventContent}
     // eventDidMount={eventDidMount}
      // סגנון כללי
      dayHeaderClassNames="fc-day-header"
      eventClassNames="fc-event-custom"
    />
  );
};

// פונקציה לעיצוב תוכן האירוע
const renderEventContent = (eventInfo) => {
  // קבלת המידע מהאירוע
  const event = eventInfo.event;
  const location = event.extendedProps.location;
  const kidIds = event.extendedProps.kidIds || [];
  const employeeIds = event.extendedProps.employeeIds || [];
  
  // הגדרת התוכן בהתאם לתצוגה
  return (
    <>
      <div className="fc-event-time">
        {eventInfo.timeText}
      </div>
      <div className="fc-event-title-container">
        <div className="fc-event-title" style={{ fontWeight: 'bold' }}>
          {event.title}
        </div>
        
        {/* הצגת מיקום בתצוגות יום ושבוע */}
        {eventInfo.view.type !== 'dayGridMonth' && location && (
          <div className="fc-event-location">
            <span className="location-icon">📍</span> {location}
          </div>
        )}
        
        {/* הצגת מספר משתתפים בתצוגות יום ושבוע */}
        {eventInfo.view.type !== 'dayGridMonth' && (kidIds.length > 0 || employeeIds.length > 0) && (
          <div className="fc-event-participants">
            {kidIds.length > 0 && (
              <span className="kids-count">👶 {kidIds.length}</span>
            )}
            {employeeIds.length > 0 && (
              <span className="employees-count">👨‍💼 {employeeIds.length}</span>
            )}
          </div>
        )}
      </div>
    </>
  );
};

// פונקציה שמופעלת כאשר אירוע נטען
// const eventDidMount = (info) => {
//   // הוספת tooltip מורחב לאירוע
//   const description = info.event.extendedProps.description;
//   const location = info.event.extendedProps.location;
//   const eventType = info.event.extendedProps.type;
  
//   if (description || location || eventType) {
//     const tooltipContent = document.createElement('div');
//     tooltipContent.className = 'event-tooltip';
    
//     // תבנית הטולטיפ
//     let html = '<div style="padding: 10px; max-width: 300px;">';
    
//     // כותרת האירוע
//     html += `<div style="font-weight: bold; margin-bottom: 5px;">${info.event.title}</div>`;
    
//     // סוג האירוע
//     if (eventType) {
//       html += `<div style="margin-bottom: 5px; color: ${info.event.backgroundColor}; font-weight: bold;">${eventType}</div>`;
//     }
    
//     // מיקום האירוע
//     if (location) {
//       html += `<div style="margin-bottom: 5px;"><b>מיקום:</b> ${location}</div>`;
//     }
    
//     // תיאור האירוע
//     if (description) {
//       html += `<div style="margin-bottom: 5px;"><b>תיאור:</b> ${description}</div>`;
//     }
    
//     html += '</div>';
    
//     tooltipContent.innerHTML = html;
    
//     // יצירת tooltip באמצעות tippy.js או tooltipster אם קיים
//     if (window.tippy) {
//       window.tippy(info.el, {
//         content: tooltipContent,
//         placement: 'top',
//         arrow: true,
//         theme: 'light-border'
//       });
//     } else {
//       // אם אין ספריית tooltip, מוסיף title רגיל
//       let tooltipText = '';
//       if (eventType) tooltipText += `${eventType}\n`;
//       if (location) tooltipText += `מיקום: ${location}\n`;
//       if (description) tooltipText += `תיאור: ${description}`;
      
//       if (tooltipText) {
//         info.el.setAttribute('title', tooltipText);
//       }
//     }
//   }
// };

export default CalendarView;