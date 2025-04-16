// src/context/TreatmentContext.jsx
import React, { createContext, useState, useContext } from 'react';
import axios from 'axios';

const TreatmentContext = createContext();

export const useTreatmentContext = () => useContext(TreatmentContext);

export const TreatmentProvider = ({ children }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentTreatment, setCurrentTreatment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // פתיחת דיאלוג הוספת טיפול
  const openAddDialog = () => {
    setCurrentTreatment(null);
    setIsAddDialogOpen(true);
  };

  // סגירת דיאלוג הוספת טיפול
  const closeAddDialog = () => {
    setIsAddDialogOpen(false);
  };

  // פתיחת דיאלוג צפייה בטיפול
  const openViewDialog = (treatment) => {
    setCurrentTreatment(treatment);
    setIsViewDialogOpen(true);
  };

  // סגירת דיאלוג צפייה בטיפול
  const closeViewDialog = () => {
    setIsViewDialogOpen(false);
    setCurrentTreatment(null);
  };

  // הוספת טיפול חדש
  const addTreatment = async (kidId, treatmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post(`/api/treatments`, {
        ...treatmentData,
        kidId
      });
      
      setLoading(false);
      closeAddDialog();
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בהוספת טיפול');
      throw err;
    }
  };

  // עדכון טיפול קיים
  const updateTreatment = async (treatmentId, treatmentData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.put(`/api/treatments/${treatmentId}`, treatmentData);
      
      setLoading(false);
      closeViewDialog();
      return response.data;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה בעדכון טיפול');
      throw err;
    }
  };

  // מחיקת טיפול
  const deleteTreatment = async (treatmentId) => {
    setLoading(true);
    setError(null);
    
    try {
      await axios.delete(`/api/treatments/${treatmentId}`);
      
      setLoading(false);
      closeViewDialog();
      return true;
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || 'שגיאה במחיקת טיפול');
      throw err;
    }
  };

  const value = {
    isAddDialogOpen,
    isViewDialogOpen,
    currentTreatment,
    loading,
    error,
    openAddDialog,
    closeAddDialog,
    openViewDialog,
    closeViewDialog,
    addTreatment,
    updateTreatment,
    deleteTreatment
  };

  return (
    <TreatmentContext.Provider value={value}>
      {children}
    </TreatmentContext.Provider>
  );
};

export default TreatmentProvider;