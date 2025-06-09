// src/pages/kids/KidsManagement.jsx - גרסה מעודכנת לגישה החדשה
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Button, IconButton, TextField, InputAdornment,
  CircularProgress, Alert, Chip, Breadcrumbs, FormControl, InputLabel, 
  Select, MenuItem, Tooltip, Card, CardContent, Grid, LinearProgress, Fab
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Visibility as VisibilityIcon,
  Home as HomeIcon, Group as GroupIcon, Refresh as RefreshIcon,
  PlayArrow as StartIcon, Edit as EditIcon, CheckCircle as CompleteIcon,
  Dashboard as DashboardIcon, Email as EmailIcon
} from '@mui/icons-material';

import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchOnboardingStatus } from '../../Redux/features/onboardingSlice';
import Swal from 'sweetalert2';

// קומפוננטה לבאדג' סטטוס מעודכן
const OnboardingStatusChip = ({ onboardingData }) => {
  if (!onboardingData) {
    return (
      <Chip
        label="○ לא התחיל"
        color="default"
        variant="outlined"
        size="small"
        sx={{ fontWeight: 'medium', minWidth: '120px' }}
      />
    );
  }

  const { process, completionPercentage, completedForms, totalForms } = onboardingData;
  
  const getStatusConfig = () => {
    switch (process.processStatus) {
      case 'Completed':
        return { 
          color: 'success', 
          label: `✅ הושלם (${completedForms}/${totalForms})`, 
          variant: 'filled' 
        };
      case 'InProgress':
        return { 
          color: 'primary', 
          label: `⚡ בתהליך (${completionPercentage}%)`, 
          variant: 'filled' 
        };
      default:
        return { 
          color: 'info', 
          label: '🚀 התחיל', 
          variant: 'filled' 
        };
    }
  };

  const config = getStatusConfig();
  
  return (
    <Chip
      label={config.label}
      color={config.color}
      variant={config.variant}
      size="small"
      sx={{ fontWeight: 'medium', minWidth: '120px' }}
    />
  );
};

// קומפוננטה מעודכנת לפעולות
const OnboardingActions = ({ kid, onboardingData, onAction }) => {
  const getActions = () => {
    if (!onboardingData) {
      return [
        { 
          action: 'start', 
          label: 'התחל קליטה', 
          color: 'primary', 
          icon: <StartIcon />,
          tooltip: 'התחל תהליך קליטה חדש'
        }
      ];
    }

    const { process } = onboardingData;

    switch (process.processStatus) {
      case 'InProgress':
        return [
          { 
            action: 'dashboard', 
            label: 'ממשק', 
            color: 'primary', 
            icon: <DashboardIcon />,
            tooltip: 'פתח ממשק ניהול הקליטה'
          }
        ];
      case 'Completed':
        return [
          { 
            action: 'dashboard', 
            label: 'צפה', 
            color: 'success', 
            icon: <VisibilityIcon />,
            tooltip: 'צפה בסטטוס הקליטה'
          }
        ];
      default:
        return [
          { 
            action: 'start', 
            label: 'התחל', 
            color: 'primary', 
            icon: <StartIcon />,
            tooltip: 'התחל תהליך קליטה'
          }
        ];
    }
  };

  const actions = getActions();

  return (
    <Box sx={{ display: 'flex', gap: 0.5 }}>
      {actions.map((actionConfig) => (
        <Tooltip key={actionConfig.action} title={actionConfig.tooltip}>
          <IconButton
            size="small"
            onClick={() => onAction(actionConfig.action, kid.id)}
            sx={{
              backgroundColor: `${actionConfig.color}.main`,
              color: 'white',
              '&:hover': {
                backgroundColor: `${actionConfig.color}.dark`,
              }
            }}
          >
            {actionConfig.icon}
          </IconButton>
        </Tooltip>
      ))}
      
      {/* כפתור צפייה בפרופיל תמיד זמין */}
      <Tooltip title="צפייה בפרופיל הילד">
        <IconButton
          size="small"
          onClick={() => onAction('profile', kid.id)}
          sx={{
            backgroundColor: 'info.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'info.dark',
            }
          }}
        >
          <VisibilityIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

// קומפוננטה חדשה להצגת התקדמות מפורטת
const DetailedProgress = ({ onboardingData }) => {
  if (!onboardingData || !onboardingData.forms) {
    return <Typography variant="body2" color="text.secondary">–</Typography>;
  }

  const { forms, completionPercentage } = onboardingData;
  
  // ספירת סטטוסים
  const statusCounts = forms.reduce((acc, form) => {
    const status = form.status;
    if (status === 'completed' || status === 'completed_by_parent') {
      acc.completed++;
    } else if (status === 'in_progress') {
      acc.inProgress++;
    } else if (status === 'sent_to_parent') {
      acc.sentToParent++;
    } else {
      acc.notStarted++;
    }
    return acc;
  }, { completed: 0, inProgress: 0, sentToParent: 0, notStarted: 0 });

  return (
    <Box sx={{ minWidth: 150 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={completionPercentage} 
          sx={{ width: 100, height: 8, borderRadius: 4 }}
        />
        <Typography variant="body2" fontWeight="bold">
          {completionPercentage}%
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
        {statusCounts.completed > 0 && (
          <Chip 
            label={`✅ ${statusCounts.completed}`} 
            size="small" 
            color="success" 
            variant="outlined"
          />
        )}
        {statusCounts.inProgress > 0 && (
          <Chip 
            label={`⚡ ${statusCounts.inProgress}`} 
            size="small" 
            color="primary" 
            variant="outlined"
          />
        )}
        {statusCounts.sentToParent > 0 && (
          <Chip 
            label={`📧 ${statusCounts.sentToParent}`} 
            size="small" 
            color="info" 
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { kids, status, error } = useSelector(state => state.kids);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onboardingData, setOnboardingData] = useState({});
  const [loading, setLoading] = useState(false);

  // טעינה ראשונית
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      // טעינת רשימת ילדים
      const kidsResult = await dispatch(fetchKids()).unwrap();
      
      // טעינת נתוני קליטה לכל ילד
      const onboardingPromises = kidsResult.map(async (kid) => {
        try {
          const statusResult = await dispatch(fetchOnboardingStatus(kid.id)).unwrap();
          return { kidId: kid.id, data: statusResult };
        } catch (error) {
          // אין תהליך קליטה - החזר null
          return { kidId: kid.id, data: null };
        }
      });
      
      const onboardingResults = await Promise.all(onboardingPromises);
      const onboardingMap = {};
      onboardingResults.forEach(({ kidId, data }) => {
        onboardingMap[kidId] = data;
      });
      
      setOnboardingData(onboardingMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בטעינת נתונים',
        text: error.message || 'אירעה שגיאה בטעינת הנתונים'
      });
    } finally {
      setLoading(false);
    }
  };

  // רענון נתונים
  const handleRefresh = () => {
    loadData();
  };

  // טיפול בפעולות
  const handleAction = (action, kidId) => {
    switch (action) {
      case 'start':
        navigate(`/kids/onboarding/${kidId}`);
        break;
      case 'dashboard':
        navigate(`/kids/onboarding/${kidId}`);
        break;
      case 'profile':
        navigate(`/kids/${kidId}`);
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  };

  // חישוב גיל
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '–';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    const years = today.getFullYear() - birthDate.getFullYear();
    const months = today.getMonth() - birthDate.getMonth();
    
    if (years > 0) {
      return `${years} שנים`;
    } else {
      return `${months >= 0 ? months : months + 12} חודשים`;
    }
  };

  // פילטור ילדים
  const filteredKids = kids.filter(kid => {
    const searchMatch = !searchTerm || 
      (kid.firstName && kid.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const kidOnboardingData = onboardingData[kid.id];
    const processStatus = kidOnboardingData?.process?.processStatus || 'NotStarted';
    const statusMatch = !statusFilter || processStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // חישוב סטטיסטיקות מעודכן
  const stats = {
    total: kids.length,
    completed: Object.values(onboardingData).filter(d => d?.process?.processStatus === 'Completed').length,
    inProgress: Object.values(onboardingData).filter(d => d?.process?.processStatus === 'InProgress').length,
    notStarted: kids.length - Object.keys(onboardingData).filter(k => onboardingData[k]).length
  };

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Box 
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          ראשי
        </Box>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          ניהול ילדים
        </Typography>
      </Breadcrumbs>
      
      {/* כותרת ופעולות */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
              ניהול ילדים
            </Typography>
            <Typography variant="body1" color="text.secondary">
              מעקב אחר תהליכי קליטה וניהול פרטי ילדים במערכת
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="רענון נתונים">
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/kids/onboarding/new')}
            >
              קליטת ילד חדש
            </Button>
          </Box>
        </Box>
        
        {/* פילטרים */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            size="small"
            placeholder="חיפוש לפי שם..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>סטטוס תהליך</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="סטטוס תהליך"
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="NotStarted">לא התחיל</MenuItem>
              <MenuItem value="InProgress">בתהליך</MenuItem>
              <MenuItem value="Completed">הושלם</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* סטטיסטיקות */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="primary.main" fontWeight="bold">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              סה"כ ילדים
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              הושלמו
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {stats.inProgress}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              בתהליך
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h3" color="info.main" fontWeight="bold">
              {stats.notStarted}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              לא התחילו
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* שגיאות */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* טבלת ילדים */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>ילד</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>גיל</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>מגדר</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>הורה ראשי</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>סטטוס קליטה</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>התקדמות מפורטת</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredKids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    לא נמצאו ילדים
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredKids.map((kid) => {
                const kidOnboardingData = onboardingData[kid.id];
                
                return (
                  <TableRow key={kid.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40 }}>
                          {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                        </Avatar>
                        <Typography fontWeight="medium">
                          {`${kid.firstName || ''} ${kid.lastName || ''}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{calculateAge(kid.birthDate)}</TableCell>
                    <TableCell>
                      <Chip 
                        label={kid.gender === 'זכר' ? 'זכר' : 'נקבה'} 
                        size="small"
                        color={kid.gender === 'זכר' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>{kid.parentName1 || '–'}</TableCell>
                    <TableCell>
                      <OnboardingStatusChip onboardingData={kidOnboardingData} />
                    </TableCell>
                    <TableCell>
                      <DetailedProgress onboardingData={kidOnboardingData} />
                    </TableCell>
                    <TableCell>
                      <OnboardingActions
                        kid={kid}
                        onboardingData={kidOnboardingData}
                        onAction={handleAction}
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* כפתור צף */}
      <Fab
        color="primary"
        onClick={() => navigate('/kids/onboarding/new')}
        sx={{ position: 'fixed', bottom: 24, left: 24 }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default KidsManagement;