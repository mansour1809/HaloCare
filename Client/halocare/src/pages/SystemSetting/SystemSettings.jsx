import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Container,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  LocationCity as CityIcon,
  School as ClassIcon,
  LocalHospital as HealthIcon,
  MedicalServices as TreatmentIcon,
  Event as EventIcon
} from '@mui/icons-material';
import Swal from 'sweetalert2';

// Import components
import CitiesTab from "./CitiesTab"
import ClassesTab from "./ClassesTab"
import HealthInsuranceTab from "./HealthInsuranceTab"
import TreatmentTypesTab from "./TreatmentTypesTab"
import EventTypesTab from "./EventTypesTab"

// Import Redux actions
import { fetchCities } from '../../Redux/features/citiesSlice';
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchHealthInsurances } from '../../Redux/features/healthinsurancesSlice';
import { fetchTreatmentTypes } from '../../Redux/features/treatmentTypesSlice';
import { fetchEventTypes } from '../../Redux/features/eventTypesSlice';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const SystemSettings = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  // Redux state selectors
  const citiesStatus = useSelector(state => state.cities?.status);
  const classesStatus = useSelector(state => state.classes?.status);
  const healthInsuranceStatus = useSelector(state => state.healthInsurances?.status);
  const treatmentTypesStatus = useSelector(state => state.treatmentTypes?.status);
  const eventTypesStatus = useSelector(state => state.eventTypes?.status);

  // Load all reference data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCities()),
          dispatch(fetchClasses()),
          dispatch(fetchHealthInsurances()),
          dispatch(fetchTreatmentTypes()),
          dispatch(fetchEventTypes())
        ]);
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'שגיאה',
          text: 'שגיאה בטעינת נתוני המערכת',
          confirmButtonText: 'אישור'
        });
      }
    };

    loadData();
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabs = [
    {
      label: 'ערים',
      icon: <CityIcon />,
      component: <CitiesTab />
    },
    {
      label: 'כיתות',
      icon: <ClassIcon />,
      component: <ClassesTab />
    },
    {
      label: 'קופות חולים',
      icon: <HealthIcon />,
      component: <HealthInsuranceTab />
    },
    {
      label: 'סוגי טיפולים',
      icon: <TreatmentIcon />,
      component: <TreatmentTypesTab />
    },
    {
      label: 'סוגי אירועים',
      icon: <EventIcon />,
      component: <EventTypesTab />
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderRadius: 3,
          overflow: 'hidden',
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
        }}
      >
        {/* כותרת הדף */}
        <Box sx={{ 
          p: 3, 
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white'
        }}>
          <Typography variant="h4" component="h1" fontWeight="bold" textAlign="center">
            🔧 הגדרות מערכת
          </Typography>
          <Typography variant="subtitle1" textAlign="center" sx={{ mt: 1, opacity: 0.9 }}>
            ניהול רשימות הבסיס של המערכת
          </Typography>
        </Box>

        <Divider />

        {/* Tabs Navigation */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: 72,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                id={`settings-tab-${index}`}
                aria-controls={`settings-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Box>

        {/* Tab Panels */}
        {tabs.map((tab, index) => (
          <TabPanel key={index} value={activeTab} index={index}>
            {tab.component}
          </TabPanel>
        ))}
      </Paper>
    </Container>
  );
};

export default SystemSettings;