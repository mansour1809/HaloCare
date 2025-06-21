// src/components/kids/tabs/KidOverviewTab.jsx - טאב סקירה כללית משופר
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
  TableHead
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

// קומפוננטה לכרטיס התראה קריטית
const CriticalInfoCard = ({ title, icon, data, color = "warning", bgColor }) => {
  const [expanded, setExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const handleToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <Alert 
      severity={color} 
      sx={{ 
        mb: 2, 
        border: '2px solid',
        borderColor: `${color}.main`,
        backgroundColor: bgColor || `${color}.lighter`,
        '& .MuiAlert-icon': { fontSize: '1.5rem' },
        borderRadius: 2
      }}
    >
      <Box sx={{ width: '100%' }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          cursor: 'pointer'
        }} onClick={handleToggle}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon}
            <Typography variant="h6" fontWeight="bold">
              {title} ({data.length})
            </Typography>
          </Box>
          <IconButton size="small" sx={{ color: 'inherit' }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>
        
        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            {data.map((item, index) => (
              <Paper key={index} sx={{ 
                p: 2, 
                mb: 1, 
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 1
              }}>
                {title === 'תרופות' && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                          <TableCell><strong>שם התרופה:</strong></TableCell>
                          <TableCell><strong>מינון:</strong></TableCell>
                          <TableCell><strong>זמנים:</strong></TableCell>
                          <TableCell><strong>הערות:</strong></TableCell>
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
                  </TableContainer>
                )}
                
                {title === 'רגישויות ואלרגיות' && (
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">חומר</Typography>
                      <Typography fontWeight="bold">{item.allergen}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">חומרה</Typography>
                      <Chip 
                        label={item.severity} 
                        color={item.severity === 'חמורה' ? 'error' : 'warning'}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="text.secondary">תגובה</Typography>
                      <Typography>{item.reaction}</Typography>
                    </Grid>
                  </Grid>
                )}
                
                {title === 'התקפים' && (
                  <TableContainer>
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
                  </TableContainer>
                )}
              </Paper>
            ))}
          </Box>
        </Collapse>
      </Box>
    </Alert>
  );
};

const KidOverviewTab = ({ selectedKid }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { kidId } = useParams();
  
  // מצב מקומי לטעינת מידע קריטי
  const [criticalInfo, setCriticalInfo] = useState({
    medications: [],
    allergies: [],
    seizures: []
  });
  const [loadingCritical, setLoadingCritical] = useState(false);
  const [criticalError, setCriticalError] = useState(null);

  // שליפת מידע קריטי בטעינת הקומפוננטה
  useEffect(() => {
    if (kidId) {
      fetchCriticalInfo();
    }
  }, [kidId]);

  const fetchCriticalInfo = async () => {
    setLoadingCritical(true);
    setCriticalError(null);
    
    try {
      const result = await dispatch(fetchCriticalMedicalInfo(kidId)).unwrap();
      
      // עיבוד התוצאות לפי סוג
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
          console.error('שגיאה בפרסור JSON:', error);
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

  // פונקציות עזר
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

  // בדיקה אם יש מידע קריטי
  const hasCriticalInfo = criticalInfo.medications.length > 0 || 
                         criticalInfo.allergies.length > 0 || 
                         criticalInfo.seizures.length > 0;

  // פרטים אישיים בסיסיים
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
    // {
    //   icon: <PhoneIcon />,
    //   label: 'איש קשר חירום',
    //   value: selectedKid.emergencyContact || '–',
    //   secondary: selectedKid.emergencyPhone
    // }
  ];

  // פרטי הורים
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
    <Box dir="rtl" sx={{ p: 3, bgcolor: 'background.default' }}>
      {/* מידע קריטי למטפל - בראש הדף */}
      {(loadingCritical || hasCriticalInfo || criticalError) && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '2px solid #ff9800' }}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2, color: 'error.main' }}>
            🚨 מידע קריטי למטפל
          </Typography>
          
          {loadingCritical && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={24} />
              <Typography>טוען מידע קריטי...</Typography>
            </Box>
          )}
          
          {criticalError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {criticalError}
            </Alert>
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
            <Alert severity="success" sx={{ mb: 2 }}>
              <Typography fontWeight="bold">
                ✅ אין מידע קריטי רשום
              </Typography>
              <Typography variant="body2">
                לא דווחו תרופות, רגישויות או התקפים
              </Typography>
            </Alert>
          )}
        </Paper>
      )}

      <Grid container spacing={3}>
        {/* עמודה שמאל - פרח הטיפולים */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ 
            p: 3, 
            borderRadius: 2,
            background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main" mb={3}>
              🌸 תחומי טיפול
            </Typography>
            
            <Typography variant="body2" color="text.secondary" mb={3}>
              לחץ על כל עלה כדי לעבור לטיפולים באותו תחום
            </Typography>
            
            {/* הפרח הקיים */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center',
              minHeight: '400px',
              alignItems: 'center'
            }}>
              <SimpleFlowerProfile kid={selectedKid} />
            </Box>
            
            <Divider sx={{ mt: 8 }} />
            
            {/* <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AssignmentIcon />}
                onClick={() => navigate(`/kids/${kidId}/treatments`)}
              >
                ניהול טיפולים מלא
              </Button>
            </Box> */}
          </Paper>
        </Grid>

        {/* עמודה ימין - מידע בסיסי */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={2}>
            {/* פרטים אישיים */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
                👤 פרטים אישיים
              </Typography>
              
              <Stack spacing={1.5}>
                {personalInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, bgcolor: 'primary.light' }}>
                      {info.icon}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {info.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {info.value}
                        {info.secondary && (
                          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                            ({info.secondary})
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* סטטוס ילד */}
            {/* <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
                📊 סטטוס נוכחי
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip 
                  label={selectedKid.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                  color={selectedKid.isActive ? 'success' : 'error'}
                  sx={{ fontWeight: 600 }}
                />
                {selectedKid.className && (
                  <Chip 
                    label={`כיתה: ${selectedKid.className}`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
              
              {selectedKid.enrollmentDate && (
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    תאריך קליטה
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {formatDate(selectedKid.enrollmentDate)}
                  </Typography>
                </Box>
              )}
              
              {selectedKid.notes && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={600}>
                    הערות
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {selectedKid.notes}
                  </Typography>
                </Box>
              )}
            </Paper> */}

            {/* פרטי הורים */}
            <Paper sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
                👨‍👩‍👧‍👦 פרטי הורים
              </Typography>
              
              <Stack spacing={1.5}>
                {parentsInfo.map((parent, index) => (
                  <Box key={index}>
                    <Typography variant="body2" color="text.secondary">
                      {parent.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {parent.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KidOverviewTab;