// src/services/intakeProcessService.js
import axios from 'axios';
import { baseURL } from '../components/common/axiosConfig';

const API_BASE = `${baseURL}/KidIntakeProcess`;

export const intakeProcessService = {
  // קבלת כל תהליכי הקליטה
  getAllProcesses: async () => {
    const response = await axios.get(API_BASE);
    return response.data;
  },

  // קבלת תהליך קליטה לפי ילד
  getKidProcess: async (kidId) => {
    const response = await axios.get(`${API_BASE}/kid/${kidId}`);
    return response.data;
  },

  // התחלת תהליך קליטה חדש
  startProcess: async (kidId) => {
    const response = await axios.post(`${API_BASE}/start/${kidId}`);
    return response.data;
  },

  // השלמת שלב בטופס
  completeForm: async (kidId, formId) => {
    const response = await axios.put(`${API_BASE}/complete-form`, {
      kidId,
      formId
    });
    return response.data;
  },

  // שליחת טופס להורים
  sendToParents: async (kidId, formId) => {
    const response = await axios.put(`${API_BASE}/send-to-parents`, {
      kidId,
      formId
    });
    return response.data;
  },

  // עדכון סטטוס
  updateStatus: async (kidId, status) => {
    const response = await axios.put(`${API_BASE}/status`, {
      kidId,
      status
    });
    return response.data;
  },

  // מחיקת תהליך קליטה
  deleteProcess: async (kidId) => {
    const response = await axios.delete(`${API_BASE}/kid/${kidId}`);
    return response.data;
  }
};