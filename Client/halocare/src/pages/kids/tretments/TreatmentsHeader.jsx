// src/components/treatments/TreatmentsHeader.jsx - גרסה משופרת עם סטטיסטיקות
import React from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Chip,
  Breadcrumbs,
  Link,
  Paper,
  Grid,
  Avatar,
  Stack,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  Add as AddIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTreatmentContext } from './TreatmentContext';

const TreatmentsHeader = ({ kidId, treatmentType, selectedKid }) => {
  const navigate = useNavigate();
  const { 
    openAddDialog, 
    getTreatmentName, 
    getColorForTreatmentType,
    getEmployeeName,
    filteredTreatments,
    getFilteredTreatmentStats
  } = useTreatmentContext();

  // קבלת סטטיסטיקות
  const stats = getFilteredTreatmentStats();

  // פונקציה לחישוב טרנד (משוערת)
  const getTrend = () => {
    if (!filteredTreatments.length) return null;
    
    const now = new Date();
    const thisMonth = filteredTreatments.filter(t => {
      const date = new Date(t.treatmentDate);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    
    const lastMonth = filteredTreatments.filter(t => {
      const date = new Date(t.treatmentDate);
      const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1);
      return date.getMonth() === lastMonthDate.getMonth() && date.getFullYear() === lastMonthDate.getFullYear();
    }).length;
    
    if (lastMonth === 0) return thisMonth > 0 ? '+100%' : '0%';
    const trend = ((thisMonth - lastMonth) / lastMonth * 100).toFixed(0);
    return trend > 0 ? `+${trend}%` : `${trend}%`;
  };

  const trend = getTrend();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          ראשי
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/kids/list')}
        >
          <PersonIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          רשימת ילדים
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate(`/kids/${kidId}`)}
        >
          {selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : 'פרופיל ילד'}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
          {getTreatmentName(treatmentType) ? `טיפולי ${getTreatmentName(treatmentType)}` : 'כל הטיפולים'}
        </Typography>
      </Breadcrumbs>
      
      {/* כותרת ראשית */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              mb: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 2
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 48, 
                height: 48,
                fontSize: '1.5rem'
              }}>
                📋
              </Avatar>
              
              סיכומי טיפולים
              
              {treatmentType && (
                <Chip 
                  label={getTreatmentName(treatmentType)}
                  sx={{ 
                    backgroundColor: getColorForTreatmentType(treatmentType),
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem'
                  }}
                />
              )}
            </Typography>
            
            {selectedKid && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Avatar sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'secondary.main',
                  fontSize: '0.9rem'
                }}>
                  {selectedKid.firstName?.charAt(0)}{selectedKid.lastName?.charAt(0)}
                </Avatar>
                <Typography variant="h6" color="text.secondary">
                  {selectedKid.firstName} {selectedKid.lastName}
                </Typography>
                <Chip 
                  label={selectedKid.isActive ? 'פעיל' : 'לא פעיל'}
                  color={selectedKid.isActive ? 'success' : 'default'}
                  size="small"
                />
              </Box>
            )}
            
            <Typography variant="body1" color="text.secondary">
              מעקב ותיעוד התקדמות הילד בטיפולים שונים
            </Typography>
          </Box>
          
          <Button 
            variant="contained" 
            size="large"
            startIcon={<AddIcon />} 
            onClick={openAddDialog}
            sx={{ 
              fontWeight: 'bold',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
              '&:hover': { 
                boxShadow: '0 6px 16px rgba(76, 181, 195, 0.4)',
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            טיפול חדש
          </Button>
        </Box>

        {/* סטטיסטיקות מהירות */}
        {stats.total > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Grid container spacing={3}>
              {/* סך הכל טיפולים */}
              <Grid item xs={12} sm={6} md={3}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%)'
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    mx: 'auto', 
                    mb: 1,
                    width: 40,
                    height: 40
                  }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    סיכומי טיפולים
                  </Typography>
                  {trend && (
                    <Chip 
                      label={`${trend} החודש`}
                      size="small"
                      color={trend.startsWith('+') ? 'success' : 'default'}
                      sx={{ mt: 1 }}
                    />
                  )}
                </Paper>
              </Grid>

              {/* ממוצע שיתוף פעולה */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #fff3e0 0%, #ffffff 100%)'
                }}>
                  <Avatar sx={{ 
                    bgcolor: '#ff9800', 
                    mx: 'auto', 
                    mb: 1,
                    width: 40,
                    height: 40
                  }}>
                    <StarIcon />
                  </Avatar>
                  <Typography variant="h4" color="#ff9800" fontWeight="bold">
                    {stats.averageCooperation}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ממוצע שיתוף פעולה
                  </Typography>
                  <Stack direction="row" justifyContent="center" spacing={0.5} mt={1}>
                    {[1,2,3,4,5].map(num => (
                      <StarIcon 
                        key={num}
                        fontSize="small" 
                        sx={{ 
                          color: num <= Math.round(stats.averageCooperation) ? '#ffc107' : '#e0e0e0' 
                        }} 
                      />
                    ))}
                  </Stack>
                </Paper>
              </Grid>

              {/* מטפלים שונים */}
              <Grid item xs={12} sm={6} md={4}>
                <Paper sx={{ 
                  p: 2, 
                  textAlign: 'center',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%)'
                }}>
                  <Avatar sx={{ 
                    bgcolor: '#9c27b0', 
                    mx: 'auto', 
                    mb: 1,
                    width: 40,
                    height: 40
                  }}>
                    <PersonIcon />
                  </Avatar>
                  <Typography variant="h4" color="#9c27b0" fontWeight="bold">
                    {filteredTreatments.reduce((acc, t) => {
                      const employeeName = getEmployeeName(t.employeeId);
                      if (employeeName && employeeName !== 'לא ידוע' && !acc.includes(employeeName)) {
                        acc.push(employeeName);
                      }
                      return acc;
                    }, []).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    מטפלים שונים
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* חלוקה לפי סוגי טיפולים */}
            {Object.keys(stats.treatmentTypeDistribution || {}).length > 1 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" color="text.primary" mb={2}>
                  <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  התפלגות לפי סוגי טיפול:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {Object.entries(stats.treatmentTypeDistribution || {}).map(([type, count]) => (
                    <Tooltip key={type} title={`${count} טיפולים מסוג ${type}`}>
                      <Chip
                        label={`${type}: ${count}`}
                        variant="outlined"
                        sx={{ 
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          },
                          transition: 'all 0.2s ease-in-out'
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default TreatmentsHeader;