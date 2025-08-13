// src/components/kids/tabs/KidOverviewTab.jsx - Professional styled version with ALL functionality preserved
import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Chip,
  Stack,
  Divider,
  Card,
  CardContent,
  Button,
  Alert,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  TableHead,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  LocalHospital as MedicalIcon,
  School as SchoolIcon,
  TrendingUp as ProgressIcon,
  Warning as WarningIcon,
  Medication as MedicationIcon,
  Emergency as EmergencyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import SimpleFlowerProfile from './SimpleFlowerProfile';
import { fetchCriticalMedicalInfo } from '../../Redux/features/answersSlice';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Enhanced styled components
const EnhancedPaper = styled(Paper)(({ theme }) => ({
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
  backdropFilter: 'blur(20px)',
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
    background: 'radial-gradient(circle, rgba(255, 152, 0, 0.1) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const StyledAlert = styled(Alert)(({ theme, severity }) => ({
  marginBottom: theme.spacing(2),
  border: '2px solid',
  borderColor: theme.palette[severity]?.main,
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette[severity]?.main, 0.05)} 0%, ${alpha(theme.palette[severity]?.dark, 0.05)} 100%)`,
  backdropFilter: 'blur(10px)',
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
  backdropFilter: 'blur(10px)',
  borderRadius: 12,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme, bgcolor }) => ({
  width: 32,
  height: 32,
  background: bgcolor || 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
  '& svg': {
    fontSize: '1.2rem',
  }
}));

const PersonalInfoAvatar = styled(Avatar)(({ theme }) => ({
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
    background: 'radial-gradient(circle at center, rgba(76, 181, 195, 0.05) 0%, transparent 70%)',
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

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 12,
  overflow: 'hidden',
  '& .MuiTable-root': {
    '& .MuiTableHead-root': {
      '& .MuiTableCell-root': {
        background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
        fontWeight: 700,
        borderBottom: '2px solid rgba(76, 181, 195, 0.2)',
      }
    },
    '& .MuiTableBody-root': {
      '& .MuiTableRow-root': {
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: 'rgba(76, 181, 195, 0.05)',
        }
      }
    }
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
    <StyledAlert severity={color}>
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={handleToggle}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StyledAvatar bgcolor={`${color}.main`}>
              {icon}
            </StyledAvatar>
            <Typography variant="h6" fontWeight="bold">
              {title} ({data.length})
            </Typography>
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
          <Box sx={{ mt: 2 }}>
            {data.map((item, index) => (
              <InfoItemPaper key={index}>
                {title === 'תרופות' && (
                  <StyledTableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>שם התרופה:</strong></TableCell>
                          <TableCell><strong>מינון:</strong></TableCell>
                          <TableCell><strong>זמנים:</strong></TableCell>
                          <TableCell><strong>הערות:</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell>{item.medicationName}</TableCell>
                          <TableCell>{item.dosage}</TableCell>
                          <TableCell>{item.times}</TableCell>
                          <TableCell>{item.notes}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
                )}
                
                {title === 'רגישויות ואלרגיות' && (
                  <Grid container spacing={2} alignItems="center">
                    <Grid item size={{xs:3}}>
                      <Typography variant="subtitle2" color="text.secondary">חומר</Typography>
                      <Typography fontWeight="bold">{item.allergen}</Typography>
                    </Grid>
                    <Grid item size={{xs:3}}>
                      <Typography variant="subtitle2" color="text.secondary">חומרה</Typography>
                      <StyledChip 
                        label={item.severity} 
                        color={item.severity === 'חמורה' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Grid>
                    <Grid item size={{xs:6}}>
                      <Typography variant="subtitle2" color="text.secondary">תגובה</Typography>
                      <Typography>{item.reaction}</Typography>
                    </Grid>
                  </Grid>
                )}
                
                {title === 'התקפים' && (
                  <StyledTableContainer>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell><strong>סוג:</strong></TableCell>
                          <TableCell>{item.seizureType}</TableCell>
                          <TableCell><strong>תדירות:</strong></TableCell>
                          <TableCell>{item.frequency}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell><strong>טריגרים:</strong></TableCell>
                          <TableCell>{item.triggers}</TableCell>
                          <TableCell><strong>הערות:</strong></TableCell>
                          <TableCell>{item.notes}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </StyledTableContainer>
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
  const navigate = useNavigate();
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

  // Fetch critical data on component load 
  useEffect(() => {
    if (kidId) {
      fetchCriticalInfo();
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
      console.log('Critical info result:', result);
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
      value: selectedKid.className || 'לא משויך'
    },
    {
      icon: <HomeIcon />,
      label: 'כתובת',
      value: selectedKid.address ? 
        `${selectedKid.address}${selectedKid.cityName ? `, ${selectedKid.cityName}` : ''}` : '–'
    },
  ];

  // Parents Info 
  const parentsInfo = [
    {
      label: 'הורה ראשי',
      value: selectedKid.parentName1 || '–'
    },
    {
      label: 'הורה משני', 
      value: selectedKid.parentName2 || '–'
    }
  ];

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
            <>
              <CriticalInfoCard
                title="תרופות"
                icon={<MedicationIcon />}
                data={criticalInfo.medications}
                color="warning"
                bgColor="rgba(255, 152, 0, 0.1)"
              />
              
              <CriticalInfoCard
                title="רגישויות ואלרגיות"
                icon={<WarningIcon />}
                data={criticalInfo.allergies}
                color="error"
                bgColor="rgba(244, 67, 54, 0.1)"
              />
              
              <CriticalInfoCard
                title="התקפים"
                icon={<EmergencyIcon />}
                data={criticalInfo.seizures}
                color="error"
                bgColor="rgba(156, 39, 176, 0.1)"
              />
            </>
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
              🌸 תחומי טיפול
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
                👤 פרטים אישיים
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
                }}
              >
                👨‍👩‍👧‍👦 פרטי הורים
              </Typography>
              
              <Stack spacing={1.5}>
                {parentsInfo.map((parent, index) => (
                  <Box 
                    key={index}
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        background: 'rgba(255, 112, 67, 0.05)',
                        transform: 'translateX(-4px)',
                      }
                    }}
                  >
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      {parent.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {parent.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </EnhancedPaper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KidOverviewTab;