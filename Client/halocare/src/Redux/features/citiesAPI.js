
import axios from 'axios';

const API_URL = 'https://localhost:7225/api';

// מרכז את כל קריאות ה-API הקשורות לערים
export const citiesAPI = {

    // פונקציה לקבלת כל הערים
  fetchCities: async () => {

    const response = await axios.get(`${API_URL}/ReferenceData/cities`);
    return response.data;
  },
};
