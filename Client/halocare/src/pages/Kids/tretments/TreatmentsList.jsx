// src/components/treatments/TreatmentsList.jsx
import  { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { 
  Box, 
  CircularProgress, 
  Alert
} from '@mui/material';
import { fetchTreatmentsByKid } from '../../../Redux/features/treatmentsSlice';
import { fetchKidById } from '../../../Redux/features/kidsSlice';

// רכיבים משניים
import TreatmentsHeader from './TreatmentsHeader';
import TreatmentsFilters from './TreatmentsFilters';
import TreatmentsTable from './TreatmentsTable';
import TreatmentViewDialog from './TreatmentViewDialog';
import AddTreatmentDialog from './AddTreatmentDialog';

const TreatmentsList = () => {
  const { kidId, treatmentType } = useParams();
  const dispatch = useDispatch();
  
  // שליפת state מהסטור
  const { status, error } = useSelector(state => state.treatments);
  const { selectedKid, status: kidStatus } = useSelector(state => state.kids);
  
  // טעינת טיפולים בעת טעינת הדף
  useEffect(() => {
    if (kidId) {
      dispatch(fetchTreatmentsByKid({ kidId, treatmentType }));
      
      // אם אין פרטי ילד, נטען אותם
      if (!selectedKid || selectedKid.id !== parseInt(kidId)) {
        dispatch(fetchKidById(kidId));
      }
    }
  }, [dispatch, kidId, treatmentType, selectedKid]);

  // תוכן שיוצג בהתאם למצב הטעינה
  let content;
  if (status === 'loading' || kidStatus === 'loading') {
    content = (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  } else if (status === 'failed') {
    content = (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  } else {
    content = (
      <>
        {/* פילטר חיפוש ואפשרויות סינון */}
        <TreatmentsFilters />

        {/* טבלת טיפולים */}
        <TreatmentsTable />
      </>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <TreatmentsHeader 
        kidId={kidId} 
        treatmentType={treatmentType} 
        selectedKid={selectedKid}
      />
      {content}

      {/* דיאלוגים */}
      <TreatmentViewDialog />
      <AddTreatmentDialog kidId={kidId} treatmentType={treatmentType} />
    </Box>
  );
};

export default TreatmentsList;