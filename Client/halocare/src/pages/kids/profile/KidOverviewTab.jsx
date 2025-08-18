// src/components/kids/tabs/KidOverviewTab.jsx 
import  { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Alert,
  Collapse,
  IconButton,
  CircularProgress,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  School as SchoolIcon,
  Warning as WarningIcon,
  Medication as MedicationIcon,
  Emergency as EmergencyIcon,
  ExpandMore as ExpandMoreIcon,
  Smartphone as MobileIcon,
  LocationCity as CityIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import SimpleFlowerProfile from './SimpleFlowerProfile';
import { fetchCriticalMedicalInfo } from '../../../Redux/features/answersSlice';
import { fetchParentById } from '../../../Redux/features/parentSlice';
import { useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced styled components
const EnhancedPaper = styled(Paper)(() => ({
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  },
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
  }
}));

const CriticalPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(244, 67, 54, 0.05) 100%)',
  // backdropFilter: 'blur(20px)',
  border: '2px solid',
  borderImage: 'linear-gradient(135deg, #ff9800, #f44336) 1',
  boxShadow: '0 10px 40px rgba(255, 152, 0, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    // transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  marginBottom: theme.spacing(2),
  border: '2px solid',
  borderColor: theme.palette[severity]?.main,
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette[severity]?.main, 0.05)} 0%, ${alpha(theme.palette[severity]?.dark, 0.05)} 100%)`,
  position: 'relative',
  overflow: 'hidden',
  '& .MuiAlert-icon': { 
    fontSize: '1.8rem',
    animation: severity === 'error' ? `${pulse} 2s infinite` : 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: `linear-gradient(90deg, ${theme.palette[severity]?.light}, ${theme.palette[severity]?.main}, ${theme.palette[severity]?.dark})`,
  }
}));

const InfoItemPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(1),
  backgroundColor: 'rgba(255,255,255,0.95)',
  // backdropFilter: 'blur(10px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    // transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  }
}));

const StyledAvatar = styled(Avatar)(({bgcolor }) => ({
  width: 32,
  height: 32,
  background: bgcolor || 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
  '& svg': {
    fontSize: '1.2rem',
  }
}));

const PersonalInfoAvatar = styled(Avatar)(() => ({
  width: 28,
  height: 28,
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  boxShadow: '0 3px 10px rgba(76, 181, 195, 0.25)',
  '& svg': {
    fontSize: '1rem',
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  background: props => {
    if (props.color === 'error') {
      return 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)';
    }
    if (props.color === 'warning') {
      return 'linear-gradient(45deg, #ff9800 30%, #ffa726 90%)';
    }
    return theme.palette[props.color]?.main;
  },
  color: 'white',
  boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
  }
}));

const FlowerContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.03) 0%, rgba(255, 112, 67, 0.03) 100%)',
  border: '1px solid rgba(76, 181, 195, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  }
}));

const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.9)',
  '& .MuiCircularProgress-root': {
    color: theme.palette.warning.main,
  }
}));


// Critical Info Card Component - Enhanced styling only
const CriticalInfoCard = ({ title, icon, data, color = "warning", bgColor }) => {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <StyledAlert 
      severity={color}
      sx={{ 
        height: expanded ? 'auto' : 'auto',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        '& .MuiAlert-message': {
          width: '100%',
          padding: 0
        }
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer',
          minHeight: '48px'
        }} onClick={handleToggle}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <StyledAvatar 
              bgcolor={`${color}.main`}
              sx={{ 
                width: 36, 
                height: 36,
                boxShadow: theme => `0 4px 12px ${alpha(theme.palette[color].main, 0.3)}`
              }}
            >
              {icon}
            </StyledAvatar>
            <Box>
              <Typography variant="h6" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                {title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {data.length} {data.length === 1 ? 'פריט' : 'פריטים'}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="small" 
            sx={{ 
              color: 'inherit',
              transition: 'transform 0.3s ease',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5, opacity: 0.3 }} />
          <Box sx={{ mt: 2, maxHeight: '400px', overflowY: 'auto' }}>
            {data.map((item, index) => (
              <InfoItemPaper 
                key={index}
                sx={{ 
                  mb: index < data.length - 1 ? 1.5 : 0,
                  // animation: `${slideIn} 0.3s ease-out ${index * 0.1}s`
                }}
              >
                {title === 'תרופות' && (
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item size={{xs:12 , sm:3}} >
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            שם התרופה
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="primary.main">
                            {item.medicationName}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs:12 , sm:3}}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            מינון
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.dosage}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs:12 , sm:3}}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            זמני נטילה
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.times}
                          </Typography>
                        </Box>
                      </Grid>
                      {item.notes && (
                        <Grid item size={{xs:12 , sm:3}}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              הערות
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {item.notes}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {title === 'רגישויות ואלרגיות' && (
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item size={{xs:12 , sm:3}}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            חומר אלרגני
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {item.allergen}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs:12 , sm:3}}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            חומרה
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <StyledChip 
                              label={item.severity} 
                              color={item.severity === 'חמורה' ? 'error' : 'warning'}
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item size={{xs:12 , sm:3}}>
                        <Box>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            תגובה
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.reaction}
                          </Typography>
                        </Box>
                      </Grid>
                      {item.notes && (
                        <Grid item size={{xs:12 , sm:3}}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              הערות נוספות
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {item.notes}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
                
                {title === 'התקפים' && (
                  <Box sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item size={{xs:12 , sm:4}}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            סוג התקף
                          </Typography>
                          <Typography variant="body2" fontWeight={600} color="error.main">
                            {item.seizureType}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item size={{xs:12 , sm:4}}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            תדירות
                          </Typography>
                          <Typography variant="body2" fontWeight={500}>
                            {item.frequency}
                          </Typography>
                        </Box>
                      </Grid>
                      {item.triggers && (
                        <Grid item size={{xs:12 , sm:4}}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              טריגרים
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {item.triggers}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {item.medications && (
                        <Grid item xs={12}>
                          <Box sx={{ mb: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              תרופות רלוונטיות
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {item.medications}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                      {item.notes && (
                        <Grid item xs={12}>
                          <Box sx={{ 
                            pt: 1, 
                            borderTop: '1px solid',
                            borderColor: 'divider'
                          }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600}>
                              הערות נוספות
                            </Typography>
                            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                              {item.notes}
                            </Typography>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                )}
              </InfoItemPaper>
            ))}
          </Box>
        </Collapse>
      </Box>
    </StyledAlert>
  );
};

const KidOverviewTab = ({ selectedKid }) => {
  const dispatch = useDispatch();
  const { kidId } = useParams();
  
  // Local state for loading critical data 
  const [criticalInfo, setCriticalInfo] = useState({
    medications: [],
    allergies: [],
    seizures: []
  });
  const [loadingCritical, setLoadingCritical] = useState(false);
  const [criticalError, setCriticalError] = useState(null);
 const [parentsData, setParentsData] = useState({
    parent1: null,
    parent2: null,
    loading: false,
    error: null
  });
  // Fetch critical data on component load 
  useEffect(() => {
    if (kidId) {
      fetchCriticalInfo();
      fetchParentsInfo();
    }
  }, [kidId]);

  // Fetch critical info function 
  const fetchCriticalInfo = async () => {
    setLoadingCritical(true);
    setCriticalError(null);
    
    try {
      const result = await dispatch(fetchCriticalMedicalInfo(kidId)).unwrap();
      
      // Process results by type
      const medications = [];
      const allergies = [];
      const seizures = [];
      result.forEach(item => {
        try {
          const multipleEntries = JSON.parse(item.multipleEntries);
          
          switch (item.multipleEntryType) {
            case 'medications':
              medications.push(...multipleEntries);
              break;
            case 'allergies':
              allergies.push(...multipleEntries);
              break;
            case 'seizures':
              seizures.push(...multipleEntries);
              break;
          }
        } catch (error) {
          console.error('Error parsing JSON:', error);
        }
      });
      
      setCriticalInfo({ medications, allergies, seizures });
    } catch (error) {
      setCriticalError('שגיאה בטעינת מידע קריטי');
      console.error('Critical info fetch error:', error);
    } finally {
      setLoadingCritical(false);
    }
  };

  // Helper functions 
  const formatDate = (dateString) => {
    if (!dateString) return '–';
    try {
      return new Date(dateString).toLocaleDateString('he-IL');
    } catch {
      return '–';
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '–';
    try {
      const today = new Date();
      const birth = new Date(birthDate);
      const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + 
                         (today.getMonth() - birth.getMonth());
      
      if (ageInMonths < 12) {
        return `${ageInMonths} חודשים`;
      } else {
        const years = Math.floor(ageInMonths / 12);
        const months = ageInMonths % 12;
        return months > 0 ? `${years} שנים ו-${months} חודשים` : `${years} שנים`;
      }
    } catch {
      return '–';
    }
  };

  // Check if critical data exists 
  const hasCriticalInfo = criticalInfo.medications.length > 0 || 
                         criticalInfo.allergies.length > 0 || 
                         criticalInfo.seizures.length > 0;

  // Personal Info 
  const personalInfo = [
    {
      icon: <PersonIcon />,
      label: 'שם מלא',
      value: `${selectedKid.firstName || ''} ${selectedKid.lastName || ''}`.trim() || '–'
    },
    {
      icon: <CakeIcon />,
      label: 'תאריך לידה',
      value: formatDate(selectedKid.birthDate),
      secondary: calculateAge(selectedKid.birthDate)
    },
    {
      icon: <PersonIcon />,
      label: 'מגדר',
      value: selectedKid.gender || '–'
    },
    {
      icon: <SchoolIcon />,
      label: 'כיתה',
      value: selectedKid.classId || 'לא משויך'
    },
    {
      icon: <HomeIcon />,
      label: 'כתובת',
      value: selectedKid.address ? 
        `${selectedKid.address}${selectedKid.cityName ? `, ${selectedKid.cityName}` : ''}` : '–'
    },
  ];
const fetchParentsInfo = async () => {
    setParentsData(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const promises = [];
      
      // Fetch first parent if exists
      if (selectedKid.parentId1) {
        promises.push(dispatch(fetchParentById(selectedKid.parentId1)).unwrap());
      }
      
      // Fetch second parent if exists
      if (selectedKid.parentId2) {
        promises.push(dispatch(fetchParentById(selectedKid.parentId2)).unwrap());
      }
      
      const results = await Promise.all(promises);
      
      setParentsData({
        parent1: results[0] || null,
        parent2: results[1] || null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching parents data:', error);
      setParentsData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load parents information'
      }));
    }
  };
  // Parents Info 
   const getParentInfo = (parent, label) => {
    if (!parent) {
      return {
        label,
        name: selectedKid[`parentName${label === 'הורה ראשי' ? '1' : '2'}`] || 'לא מצוין',
        details: []
      };
    }

    return {
      label,
      name: `${parent.firstName || ''} ${parent.lastName || ''}`.trim() || 'לא מצוין',
      details: [
        parent.mobilePhone && { icon: <MobileIcon />, value: parent.mobilePhone, label: 'נייד' },
        parent.homePhone && { icon: <PhoneIcon />, value: parent.homePhone, label: 'בית' },
        parent.email && { icon: <EmailIcon />, value: parent.email, label: 'מייל' },
        parent.address && { icon: <HomeIcon />, value: parent.address, label: 'כתובת' },
        parent.cityName && { icon: <CityIcon />, value: parent.cityName, label: 'עיר' }
      ].filter(Boolean)
    };
  };


  return (
    <Box dir="rtl" sx={{ 
      p: 3, 
      background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.02) 0%, rgba(255, 112, 67, 0.02) 100%)',
      minHeight: '100%'
    }}>
      {/* Critical information for the caregiver - Enhanced styling only */}
      {(loadingCritical || hasCriticalInfo || criticalError) && (
        <CriticalPaper>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            sx={{ 
              mb: 2, 
              background: 'linear-gradient(45deg, #ff9800 30%, #f44336 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            🚨 מידע קריטי למטפל
          </Typography>
          
          {loadingCritical && (
            <LoadingBox>
              <CircularProgress size={24} />
              <Typography>טוען מידע קריטי...</Typography>
            </LoadingBox>
          )}
          
          {criticalError && (
            <StyledAlert severity="error">
              {criticalError}
            </StyledAlert>
          )}
          
          {!loadingCritical && hasCriticalInfo && (
  <Grid container spacing={2}>
    {/* תרופות */}
    {criticalInfo.medications.length > 0 && (
      <Grid item size={{xs:12}}>
        <CriticalInfoCard
          title="תרופות"
          icon={<MedicationIcon />}
          data={criticalInfo.medications}
          color="warning"
          bgColor="rgba(255, 152, 0, 0.1)"
        />
      </Grid>
    )}
    
    {/* רגישויות ואלרגיות */}
    {criticalInfo.allergies.length > 0 && (
      <Grid item size={{xs:12}}>
        <CriticalInfoCard
          title="רגישויות ואלרגיות"
          icon={<WarningIcon />}
          data={criticalInfo.allergies}
          color="error"
          bgColor="rgba(244, 67, 54, 0.1)"
        />
      </Grid>
    )}
    
    {/* התקפים */}
    {criticalInfo.seizures.length > 0 && (
      <Grid item size={{xs:12}}>
        <CriticalInfoCard
          title="התקפים"
          icon={<EmergencyIcon />}
          data={criticalInfo.seizures}
          color="error"
          bgColor="rgba(156, 39, 176, 0.1)"
        />
      </Grid>
    )}
  </Grid>
)}
          
          {!loadingCritical && !hasCriticalInfo && !criticalError && (
            <StyledAlert severity="success">
              <Typography fontWeight="bold">
                ✅ אין מידע קריטי רשום
              </Typography>
              <Typography variant="body2">
                לא דווחו תרופות, רגישויות או התקפים
              </Typography>
            </StyledAlert>
          )}
        </CriticalPaper>
      )}

      <Grid container spacing={3}>
        {/* Left column - Treatment Flower - Enhanced styling only */}
        <Grid item size={{xs:12, lg:8}}>
          <EnhancedPaper sx={{ p: 3 }}>
            <Typography 
              variant="h6" 
              fontWeight="bold" 
              sx={{
                mb: 3,
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
               תחומי טיפול
            </Typography>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mb: 3,
                fontWeight: 500,
                letterSpacing: '0.5px'
              }}
            >
              לחץ על כל עלה כדי לעבור לטיפולים באותו תחום
            </Typography>
            
            {/* Existing flower - Enhanced container only */}
            <FlowerContainer>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',
                minHeight: '400px',
                alignItems: 'center'
              }}>
                <SimpleFlowerProfile kid={selectedKid} />
              </Box>
            </FlowerContainer>
            
            <Divider sx={{ 
              mt: 8,
              background: 'linear-gradient(90deg, transparent, rgba(76, 181, 195, 0.3), transparent)'
            }} />
          </EnhancedPaper>
        </Grid>

        {/* Right column - Basic Information - Enhanced styling only */}
        <Grid item size={{xs:12, lg:4}}>
          <Stack spacing={2}>
            {/* Personal Details - Enhanced styling only */}
            <EnhancedPaper sx={{ p: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{
                  mb: 2,
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                 פרטים אישיים
              </Typography>
              
              <Stack spacing={1.5}>
                {personalInfo.map((info, index) => (
                  <Box 
                    key={index} 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1.5,
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(76, 181, 195, 0.05)',
                        transform: 'translateX(-4px)',
                      }
                    }}
                  >
                    <PersonalInfoAvatar>
                      {info.icon}
                    </PersonalInfoAvatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {info.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {info.value}
                        {info.secondary && (
                          <Typography 
                            component="span" 
                            variant="body2" 
                            sx={{ 
                              ml: 1,
                              color: 'primary.main',
                              fontWeight: 500
                            }}
                          >
                            ({info.secondary})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </EnhancedPaper>

            {/* Parents Details - Enhanced styling only */}
            <EnhancedPaper sx={{ p: 2 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                sx={{
                  mb: 2,
                  background: 'linear-gradient(45deg, #ff7043 30%, #ff9575 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                פרטי הורים
                {parentsData.loading && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </Typography>
              
              <Stack spacing={2}>
                {/* Parent 1 */}
                {(() => {
                  const parent1Info = getParentInfo(parentsData.parent1, 'הורה ראשי');
                  return (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(255, 112, 67, 0.05) 0%, rgba(255, 151, 117, 0.05) 100%)',
                        border: '1px solid rgba(255, 112, 67, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(-4px)',
                          boxShadow: '0 4px 12px rgba(255, 112, 67, 0.15)',
                        }
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                      >
                        {parent1Info.label}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={700}
                        sx={{ 
                          mb: parent1Info.details.length > 0 ? 1 : 0,
                          color: 'primary.main'
                        }}
                      >
                        {parent1Info.name}
                      </Typography>
                      
                      {parent1Info.details.length > 0 && (
                        <Stack spacing={0.5}>
                          {parent1Info.details.map((detail, idx) => (
                            <Box 
                              key={idx}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                py: 0.25
                              }}
                            >
                              <Box sx={{ 
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                '& svg': { fontSize: 16 }
                              }}>
                                {detail.icon}
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {detail.value}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  );
                })()}

                {/* Parent 2 */}
                {selectedKid.parentId2 && (() => {
                  const parent2Info = getParentInfo(parentsData.parent2, 'הורה משני');
                  return (
                    <Box 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(42, 138, 149, 0.05) 100%)',
                        border: '1px solid rgba(76, 181, 195, 0.1)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateX(-4px)',
                          boxShadow: '0 4px 12px rgba(76, 181, 195, 0.15)',
                        }
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        color="text.secondary" 
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                      >
                        {parent2Info.label}
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={700}
                        sx={{ 
                          mb: parent2Info.details.length > 0 ? 1 : 0,
                          color: 'secondary.main'
                        }}
                      >
                        {parent2Info.name}
                      </Typography>
                      
                      {parent2Info.details.length > 0 && (
                        <Stack spacing={0.5}>
                          {parent2Info.details.map((detail, idx) => (
                            <Box 
                              key={idx}
                              sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1,
                                py: 0.25
                              }}
                            >
                              <Box sx={{ 
                                color: 'secondary.main',
                                display: 'flex',
                                alignItems: 'center',
                                '& svg': { fontSize: 16 }
                              }}>
                                {detail.icon}
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontSize: '0.875rem'
                                }}
                              >
                                {detail.value}
                              </Typography>
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </Box>
                  );
                })()}

                {/* Emergency contact if different from parents */}
                {selectedKid.emergencyContact && 
                 selectedKid.emergencyContact !== parentsData.parent1?.mobilePhone &&
                 selectedKid.emergencyContact !== parentsData.parent2?.mobilePhone && (
                  <Box 
                    sx={{ 
                      p: 1.5, 
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(239, 83, 80, 0.05) 100%)',
                      border: '1px solid rgba(244, 67, 54, 0.2)',
                    }}
                  >
                    <Typography 
                      variant="caption" 
                      color="error.main" 
                      fontWeight={600}
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <PhoneIcon sx={{ fontSize: 14 }} />
                      איש קשר חירום נוסף
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {selectedKid.emergencyContact}
                    </Typography>
                  </Box>
                )}

                {/* Error message if failed to load */}
                {parentsData.error && (
                  <Alert 
                    severity="warning" 
                    sx={{ 
                      borderRadius: 2,
                      '& .MuiAlert-icon': { fontSize: 20 }
                    }}
                  >
                    <Typography variant="caption">
                      לא ניתן לטעון את כל פרטי ההורים
                    </Typography>
                  </Alert>
                )}
              </Stack>
            </EnhancedPaper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KidOverviewTab;