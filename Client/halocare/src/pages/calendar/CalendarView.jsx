import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import heLocale from '@fullcalendar/core/locales/he';
import { Box, Skeleton } from '@mui/material';
import '../../assets/styles/calendarStyles.css';
import PropTypes from 'prop-types';

// שימוש בקונטקסט
import { useCalendar } from './CalendarContext';

const CalendarView = ({
  calendarRef,
  events,
  isLoadingFromRedux
}) => {
  // קבלת ערכים ופונקציות מהקונטקסט
  const {
    calendarView,
    handleDateClick,
    handleEventClick
  } = useCalendar();

  // אם טוען אירועים, הצג skeleton 
    if (isLoadingFromRedux ) {
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
const renderEventContent = (eventInfo) => {
  const event = eventInfo.event;
  const location = event.extendedProps.location;
  const kidIds = event.extendedProps.kidIds || [];
  const employeeIds = event.extendedProps.employeeIds || [];
  const eventTimeC = (event.end - event.start) / (1000 * 60);

  // Determine how many icons can be shown
  let maxIcons = 0;
  if (eventTimeC >= 90) maxIcons = 3;
  else if (eventTimeC >= 60) maxIcons = 2;
  else if (eventTimeC >= 30) maxIcons = 0;

  // Build list of available elements
  const availableElements = [];

  if (location) {
    availableElements.push(
      <div key="location" className="fc-event-location">
        <span className="location-icon">📍</span> {location}
      </div>
    );
  }

  if (kidIds.length > 0) {
    availableElements.push(
      <div key="kids" className="fc-event-participants">
        <span className="kids-count">👶 {kidIds.length}</span>
      </div>
    );
  }

  if (employeeIds.length > 0) {
    availableElements.push(
      <div key="employees" className="fc-event-participants">
        <span className="employees-count">👨‍💼 {employeeIds.length}</span>
      </div>
    );
  }

  // Pick the maxIcons number of available elements
  const visibleElements = availableElements.slice(0, maxIcons);

  return (
    <>
      <div className="fc-event-time">{eventInfo.timeText}</div>
      <div className="fc-event-title-container">
        <div className="fc-event-title" style={{ fontWeight: 'bold' }}>
          {event.title}
        </div>
        {/* Display limited icons */}
        {eventInfo.view.type !== 'dayGridMonth' && visibleElements}
      </div>
    </>
  );
};


CalendarView.propTypes = {
  calendarRef: PropTypes.object,
  events: PropTypes.array.isRequired,
  isLoadingFromRedux: PropTypes.bool.isRequired,
};
export default CalendarView;
