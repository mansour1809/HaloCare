
import  { useState, useEffect } from "react";
import {
  Typography, Box, Tabs, Tab
} from "@mui/material";
import { useDispatch } from "react-redux";
import { fetchKids } from "../../Redux/features/kidsSlice";
import { AttendanceProvider } from "../../components/context/AttendanceContext";
import AttendanceMarking from "./AttendanceMarking";
import AttendanceReports from "./AttendanceReports";
import AttendanceAnalytics from "./AttendanceAnalytics";

const AttendanceDashboard = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = useState(0);

  // טעינת רשימת הילדים
  useEffect(() => {
    dispatch(fetchKids());
  }, [dispatch]);

  // מעבר בין טאבים
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <AttendanceProvider>
      <div style={{ padding: "20px", direction: "rtl" }}>
        <Typography variant="h5" gutterBottom>ניהול נוכחות</Typography>
        
        {/* טאבים */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="סימון נוכחות" />
            <Tab label="דוחות נוכחות" />
            <Tab label="אנליטיקה" />
          </Tabs>
        </Box>

        {/* תוכן טאב סימון נוכחות */}
        {tabValue === 0 && <AttendanceMarking />}

        {/* תוכן טאב דוחות */}
        {tabValue === 1 && <AttendanceReports />}
        
        {/* תוכן טאב אנליטיקה */}
        {tabValue === 2 && (
          <Box>
            <Typography variant="h6" gutterBottom>אנליטיקת נוכחות</Typography>
            <AttendanceAnalytics />
          </Box>
        )}
      </div>
    </AttendanceProvider>
  );
};

export default AttendanceDashboard;