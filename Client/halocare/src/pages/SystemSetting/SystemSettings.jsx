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
  Chip,
  Avatar,
  styled,
  keyframes,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  LocationCity as CityIcon,
  School as ClassIcon,
  LocalHospital as HealthIcon,
  MedicalServices as TreatmentIcon,
  Event as EventIcon,
  AutoAwesome as AutoAwesomeIcon,
  Home as HomeIcon,
  Group as GroupIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

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

// Professional animations matching the style
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// RTL Theme with professional colors
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
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
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
    }
  }
});

// Professional styled components
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 0,
  }
}));

const HeroCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 20,
  position: 'relative',
  overflow: 'hidden',
  marginBottom: theme.spacing(4),
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  }
}));

const TabsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: 0,
  borderRadius: '20px 20px 0 0',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderBottom: 'none',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s infinite`,
  }
}));

const TabContent = styled(Box)(() => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderTop: 'none',
  borderRadius: '0 0 20px 20px',
  minHeight: '70vh',
  position: 'relative',
  overflow: 'hidden'
}));

const CategoryChip = styled(Chip)(({ theme, active, chipcolor }) => ({
  backgroundColor: active ? chipcolor : alpha(chipcolor, 0.15),
  color: active ? 'white' : chipcolor,
  fontWeight: 700,
  fontSize: '1rem',
  padding: theme.spacing(2.5, 3),
  height: 'auto',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  borderRadius: 16,
  border: `2px solid ${active ? chipcolor : alpha(chipcolor, 0.3)}`,
  boxShadow: active ? `0 6px 20px ${alpha(chipcolor, 0.4)}` : 'none',
  '&:hover': {
    backgroundColor: chipcolor,
    color: 'white',
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: `0 12px 30px ${alpha(chipcolor, 0.4)}`,
    borderColor: chipcolor,
  },
  '& .MuiChip-icon': {
    fontSize: '1.8rem',
    color: active ? 'white' : chipcolor,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)',
  animation: `${float} 3s ease-in-out infinite`,
  marginLeft: theme.spacing(3),
}));
const EnhancedBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.primary.main,
  },
  '& .MuiBreadcrumbs-li': {
    '& a': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '4px 8px',
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(76, 181, 195, 0.1)',
        transform: 'translateY(-2px)',
      }
    }
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    transition: 'transform 0.3s ease',
  }
}));

const CurrentPage = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    color: theme.palette.primary.main,
  }
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);


  // Load all reference data on component mount - PRESERVED EXACTLY
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
        <Box dir="rtl" sx={{p: 3, position: 'relative', zIndex: 2 ,direction: 'rtl' }}>
             <EnhancedBreadcrumbs dir="rtl" sx={{ mb: -2 }}>
                    <StyledLink
                      underline="hover"
                      onClick={() => navigate('/')}
                    >
                      <HomeIcon />
                      ראשי
                    </StyledLink>
                    
                
                    <CurrentPage>
                      ⚙️
                      ניהול רשימות 
                    
                    </CurrentPage>
                  </EnhancedBreadcrumbs>

          <Container maxWidth="xl" sx={{ py: 4 }}>
            
            {/* Professional Main title card */}
            <Zoom in timeout={800}>
              <HeroCard>
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" justifyContent="center" dir="rtl">
                    <StyledAvatar>
                      <AutoAwesomeIcon sx={{ fontSize: '3rem' }} />
                    </StyledAvatar>
                    <Box sx={{ ml: 3, textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ 
                        fontWeight: 800,
                        background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}>
                        הגדרות מערכת
                      </Typography>
                      <Typography variant="body1" sx={{ 
                        color: 'text.secondary',
                        fontWeight: 500
                      }}>
                        ניהול נתוני בסיס ורשימות קבועות במערכת
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </HeroCard>
            </Zoom>

            {/* Professional Tab system */}
            <Fade in timeout={1200}>
              <Paper elevation={0} sx={{ borderRadius: 4, overflow: 'hidden' }}>
                
                {/* Professional Navigation Tabs */}
                <TabsContainer>
                  <Typography variant="h6" sx={{ 
                    mb: 3, 
                    fontWeight: 700, 
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}>
                    📊 קטגוריות המערכת
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap>
                    {tabs.map((tab, index) => (
                      <CategoryChip
                      dir="rtl"
                        key={index}
                        icon={tab.icon}
                        label={tab.label}
                        onClick={() => setActiveTab(index)}
                        active={activeTab === index ? 1 : 0}
                        chipcolor={tab.color}
                        sx={{ animation: `${pulse} 2s infinite` }}
                      />
                    ))}
                  </Stack>
                </TabsContainer>

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