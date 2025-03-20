import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { Box, Skeleton, Typography } from '@mui/material';

// שימוש בקונטקסט
import { useCalendar } from '../context/CalendarContext';

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

  // אם בטעינה, מציג סקלטון
  if (isLoading) {
    return (
      <Box sx={{ p: 4, height: '600px' }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={560} animation="wave" />
      </Box>
    );
  }

  // אם אין אירועים
  if (events.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          height: '600px', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center' 
        }}
      >
        <Typography variant="h6" color="text.secondary">
          אין אירועים להצגה
        </Typography>
        <Typography variant="body2" color="text.secondary">
          לחץ על התאריך ביומן להוספת אירוע חדש
        </Typography>
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
        right: 'prev,next',
        center: 'title',
        left: ''
      }}
      events={events}
      dateClick={handleDateClick}
      eventClick={handleEventClick}
      editable={true}
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
      // סגנון כללי
      dayHeaderClassNames="fc-day-header"
      eventClassNames="fc-event-custom"
    />
  );
};

// פונקציה לעיצוב תוכן האירוע
const renderEventContent = (eventInfo) => {
  return (
    <>
      <div className="fc-event-time">
        {eventInfo.timeText}
      </div>
      <div className="fc-event-title-container">
        <div className="fc-event-title" style={{ fontWeight: 'bold' }}>
          {eventInfo.event.title}
        </div>
        {eventInfo.view.type !== 'dayGridMonth' && eventInfo.event.extendedProps.location && (
          <div className="fc-event-location" style={{ fontSize: '0.8em', opacity: 0.8 }}>
            {eventInfo.event.extendedProps.location}
          </div>
        )}
      </div>
    </>
  );
};

export default CalendarView;