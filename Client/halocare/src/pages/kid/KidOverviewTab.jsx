// src/components/kids/tabs/KidOverviewTab.jsx - טאב סקירה כללית
import React from 'react';
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
  Button
} from '@mui/material';
import {
  Person as PersonIcon,
  Cake as CakeIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  LocalHospital as MedicalIcon,
  School as SchoolIcon,
  TrendingUp as ProgressIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// ייבוא הפרח הקיים
// import KidFlowerProfile from '../kids/KidFlowerProfile';
import SimpleFlowerProfile from '../kid/SimpleFlowerProfile';

const KidOverviewTab = ({ selectedKid }) => {
  const navigate = useNavigate();

  // פונקציית עזר לפורמט תאריך
  const formatDate = (dateString) => {
    if (!dateString) return '–';
    try {
      return new Date(dateString).toLocaleDateString('he-IL');
    } catch {
      return '–';
    }
  };

  // חישוב גיל
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
    {
      icon: <PhoneIcon />,
      label: 'איש קשר חירום',
      value: selectedKid.emergencyContact || '–',
      secondary: selectedKid.emergencyPhone
    }
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
            
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<ProgressIcon />}
                onClick={() => navigate(`/kids/${selectedKid.id}/treatments`)}
                sx={{ 
                  px: 3,
                  borderRadius: 2,
                  boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)'
                }}
              >
                צפייה בכל הטיפולים
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* עמודה ימין - פרטים אישיים */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* כרטיס פרטים אישיים */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" mb={3}>
                👤 פרטים אישיים
              </Typography>
              
              <Stack spacing={2.5}>
                {personalInfo.map((item, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    <Avatar sx={{ 
                      width: 32, 
                      height: 32, 
                      bgcolor: 'primary.light',
                      color: 'primary.main'
                    }}>
                      {item.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {item.value}
                      </Typography>
                      {item.secondary && (
                        <Typography variant="caption" color="text.secondary">
                          {item.secondary}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* כרטיס פרטי הורים */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" mb={3}>
                👨‍👩‍👧‍👦 פרטי הורים
              </Typography>
              
              <Stack spacing={2}>
                {parentsInfo.map((item, index) => (
                  <Box key={index}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      {item.label}
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Paper>

            {/* כרטיס סטטוס */}
            <Paper sx={{ p: 3, borderRadius: 2 }}>
              <Typography variant="h6" fontWeight="bold" color="text.primary" mb={3}>
                📊 סטטוס ילד
              </Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary" fontWeight={600} mb={1}>
                    סטטוס במערכת
                  </Typography>
                  <Chip 
                    label={selectedKid.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                    color={selectedKid.isActive ? 'success' : 'error'}
                    sx={{ fontWeight: 600 }}
                  />
                </Box>
                
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
                  <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                      הערות
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {selectedKid.notes}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default KidOverviewTab;