import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Container,
  useTheme,
  alpha,
  Card,
  CardContent,
  Fade,
  Zoom,
  Stack,
  Chip
} from '@mui/material';
import {
  LocationCity as CityIcon,
  School as ClassIcon,
  LocalHospital as HealthIcon,
  MedicalServices as TreatmentIcon,
  Event as EventIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
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

// יצירת theme מדהים עם תמיכה ב-RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9473',
      dark: '#cc5a36',
    },
    background: {
      default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          minHeight: '100vh'
        }
      }
    }
  }
});

// קונטיינר מסך מלא מעוצב
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(76, 181, 195, 0.3) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255, 112, 67, 0.3) 0%, transparent 50%)',
    pointerEvents: 'none'
  }
}));

// כרטיס הכותרת הראשית המעוצב
const HeroCard = styled(Card)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.95) 0%, rgba(42, 138, 149, 0.95) 100%)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 25,
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    pointerEvents: 'none'
  }
}));

// טאבים מעוצבים - לא בשימוש עוד

// תוכן הטאבים
const TabContent = styled(Box)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderTop: 'none',
  borderRadius: '0 0 25px 25px',
  minHeight: '70vh',
  position: 'relative',
  overflow: 'hidden'
}));

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
      icon: <CityIcon sx={{ fontSize: '1.8rem' }} />,
      component: <CitiesTab />,
      color: '#10b981'
    },
    {
      label: 'כיתות',
      icon: <ClassIcon sx={{ fontSize: '1.8rem' }} />,
      component: <ClassesTab />,
      color: '#8b5cf6'
    },
    {
      label: 'קופות חולים',
      icon: <HealthIcon sx={{ fontSize: '1.8rem' }} />,
      component: <HealthInsuranceTab />,
      color: '#ef4444'
    },
    {
      label: 'סוגי טיפולים',
      icon: <TreatmentIcon sx={{ fontSize: '1.8rem' }} />,
      component: <TreatmentTypesTab />,
      color: '#f59e0b'
    },
    {
      label: 'סוגי אירועים',
      icon: <EventIcon sx={{ fontSize: '1.8rem' }} />,
      component: <EventTypesTab />,
      color: '#06b6d4'
    }
  ];

  return (
    <ThemeProvider theme={rtlTheme}>
      <FullScreenContainer>
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            
            {/* כרטיס הכותרת הראשית */}
            <Zoom in timeout={800}>
              <HeroCard>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="center">
                    <Box display="flex" alignItems="center">                      
                      <Box textAlign="center">
                        <Typography variant="h4" sx={{ 
                          fontWeight: 700,
                          background: 'linear-gradient(45deg, #ffffff, #f0f9ff)',
                          backgroundClip: 'text',
                          textFillColor: 'transparent',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          mb: 1
                        }}>
                         הגדרות מערכת
                        </Typography>                        
                      </Box>
                      <AutoAwesomeIcon sx={{ fontSize: '3.5rem', ml: 3, color: '#fbbf24' }} />
                    </Box>
                  </Box>
                </CardContent>
              </HeroCard>
            </Zoom>



            {/* מערכת הטאבים המעוצבת */}
            <Fade in timeout={1200}>
              <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                
                {/* Tabs Navigation בסגנון כפתורים */}
                <Paper sx={{ 
                  p: 3, 
                  mb: 0, 
                  borderRadius: '25px 25px 0 0',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderBottom: 'none',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
                }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                    📊 קטגוריות המערכת
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                    {tabs.map((tab, index) => (
                      <Chip
                        key={index}
                        icon={tab.icon}
                        label={tab.label}
                        onClick={() => setActiveTab(index)}
                        sx={{
                          backgroundColor: activeTab === index ? tab.color : alpha(tab.color, 0.2),
                          color: activeTab === index ? 'white' : tab.color,
                          fontWeight: 700,
                          fontSize: '1rem',
                          px: 3,
                          py: 2,
                          height: 'auto',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          borderRadius: 4,
                          '&:hover': {
                            backgroundColor: tab.color,
                            color: 'white',
                            transform: 'scale(1.05)'
                          }
                        }}
                      />
                    ))}
                  </Stack>
                </Paper>

                {/* Tab Content */}
                <TabContent>
                  {tabs.map((tab, index) => (
                    <TabPanel key={index} value={activeTab} index={index}>
                      {tab.component}
                    </TabPanel>
                  ))}
                </TabContent>
              </Paper>
            </Fade>
          </Container>
        </Box>
      </FullScreenContainer>
    </ThemeProvider>
  );
};

export default SystemSettings;