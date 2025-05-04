export const api = {
  // Attendance
  getAttendanceByDate: async (date) => {
    const response = await fetch(`${API_URL}/Attendance/date/${date}`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return response.json();
  },

  // Events
  getEventsByDate: async (date) => {
    const response = await fetch(`${API_URL}/Events?date=${date}`);
    if (!response.ok) throw new Error('Failed to fetch events');
    return response.json();
  },

  // Kids
  getAllKids: async () => {
    const response = await fetch(`${API_URL}/Kids`);
    if (!response.ok) throw new Error('Failed to fetch kids');
    return response.json();
  },

  // Classes
  getAllClasses: async () => {
    const response = await fetch(`${API_URL}/Classes`);
    if (!response.ok) throw new Error('Failed to fetch classes');
    return response.json();
  }
};