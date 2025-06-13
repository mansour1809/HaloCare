// src/pages/kids/KidsManagement.jsx - גרסה מעודכנת עם Redux החדש
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Avatar, Chip, Button, TextField, Grid, Card,
  CircularProgress, Alert, Breadcrumbs, InputAdornment, IconButton,
  Tooltip, Fab, MenuItem, Select, FormControl, InputLabel
} from '@mui/material';
import {
  Home as HomeIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

// 🔥 Redux החדש
import { fetchKids } from '../../Redux/features/kidsSlice';
import { 
  fetchOnboardingStatus,
  selectOnboardingData,
  selectOnboardingStats 
} from '../../Redux/features/onboardingSlice';

// קומפוננטים עזר
const OnboardingStatusChip = ({ onboardingData }) => {
  if (!onboardingData) {
    return <Chip label="לא התחיל" color="default" variant="outlined" size="small" />;
  }

  const { overallStatus, completedForms, totalForms } = onboardingData;
  
  const getStatusConfig = (status) => {
    switch (status) {
      case 'Completed':
        return { label: 'הושלם', color: 'success', variant: 'filled' };
      case 'InProgress':
        return { label: 'בתהליך', color: 'primary', variant: 'filled' };
      case 'NotStarted':
      default:
        return { label: 'לא התחיל', color: 'default', variant: 'outlined' };
    }
  };

  const config = getStatusConfig(overallStatus);
  
  return (
    <Tooltip title={`${completedForms} מתוך ${totalForms} טפסים הושלמו`}>
      <Chip 
        label={config.label} 
        color={config.color} 
        variant={config.variant}
        size="small" 
      />
    </Tooltip>
  );
};

const DetailedProgress = ({ onboardingData }) => {
  if (!onboardingData) {
    return (
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          –
        </Typography>
      </Box>
    );
  }

  const { completedForms, totalForms } = onboardingData;
  const completionPercentage = totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;

  // ספירת סטטוסים
  const statusCounts = {
    completed: onboardingData.forms?.filter(f => ['Completed', 'CompletedByParent'].includes(f.status)).length || 0,
    inProgress: onboardingData.forms?.filter(f => f.status === 'InProgress').length || 0,
    sentToParent: onboardingData.forms?.filter(f => f.status === 'SentToParent').length || 0,
  };

  return (
    <Box sx={{ minWidth: 150 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Box 
          sx={{ 
            width: 100, 
            height: 8, 
            backgroundColor: 'grey.200', 
            borderRadius: 4,
            overflow: 'hidden'
          }}
        >
          <Box
            sx={{
              width: `${completionPercentage}%`,
              height: '100%',
              backgroundColor: 'primary.main',
              borderRadius: 'inherit',
              transition: 'width 0.3s ease'
            }}
          />
        </Box>
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

const OnboardingActions = ({ kid, onboardingData, onAction }) => {
  const canStartOnboarding = !onboardingData;
  const canContinue = onboardingData && onboardingData.overallStatus === 'InProgress';
  const isCompleted = onboardingData && onboardingData.overallStatus === 'Completed';

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      {canStartOnboarding && (
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={() => onAction('start', kid)}
        >
          התחל קליטה
        </Button>
      )}
{/*       
      {canContinue && (
        <Button
          size="small"
          variant="outlined"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => onAction('continue', kid)}
        >
          המשך
        </Button>
      )}
       */}
      {onboardingData && (
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          startIcon={<ViewIcon />}
          onClick={() => onAction('view', kid)}
        >
          צפייה בקליטה
        </Button>
      )}
    </Box>
  );
};

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // 🔥 Redux state חדש
  const { kids, status, error } = useSelector(state => state.kids);
  const onboardingData = useSelector(selectOnboardingData);
  const onboardingStats = useSelector(selectOnboardingStats);
  
  // State מקומי
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // 🔥 טעינה ראשונית מעודכנת
  useEffect(() => {
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      // טעינת רשימת ילדים
      const kidsResult = await dispatch(fetchKids()).unwrap();
      
      // 🔥 טעינת נתוני קליטה לכל ילד במקביל
      const onboardingPromises = kidsResult.map(kid => 
        dispatch(fetchOnboardingStatus(kid.id))
          .unwrap()
          .catch(error => {
            console.warn(`שגיאה בטעינת נתוני קליטה לילד ${kid.id}:`, error);
            return null; // ממשיכים למרות השגיאה
          })
      );
      
      await Promise.allSettled(onboardingPromises);
      
    } catch (error) {
      console.error('שגיאה בטעינת נתונים:', error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 רענון נתונים
  const handleRefresh = async () => {
    await loadData();
  };

  // חישוב גיל
  const calculateAge = (birthDate) => {
    if (!birthDate) return '–';
    
    const today = new Date();
    const birth = new Date(birthDate);
    const ageInMs = today - birth;
    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
    
    if (ageInDays < 30) {
      return `${ageInDays} ימים`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      return `${months} חודשים`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return months > 0 ? `${years} שנים ו-${months} חודשים` : `${years} שנים`;
    }
  };

  // 🔥 פילטור ילדים מעודכן
  const filteredKids = kids.filter(kid => {
    const searchMatch = !searchTerm || 
      (kid.firstName && kid.firstName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const kidOnboardingData = onboardingData[kid.id];
    const overallStatus = kidOnboardingData?.overallStatus || 'NotStarted';
    const statusMatch = !statusFilter || overallStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // 🔥 טיפול בפעולות
  const handleAction = (action, kid) => {
    switch (action) {
      case 'start':
        // התחלת תהליך קליטה חדש
        navigate(`/kids/onboarding/${kid.id}`);
        break;
      case 'continue':
      case 'view':
        // המשך או צפייה בתהליך קליטה
        navigate(`/kids/onboarding/${kid.id}`);
        break;
      default:
        console.warn('פעולה לא מוכרת:', action);
    }
  };

  // 🔥 סטטיסטיקות מעודכנות
  const stats = {
    total: kids.length,
    completed: Object.values(onboardingData).filter(data => data?.overallStatus === 'Completed').length,
    inProgress: Object.values(onboardingData).filter(data => data?.overallStatus === 'InProgress').length,
    notStarted: kids.length - Object.keys(onboardingData).filter(kidId => onboardingData[kidId]).length
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
          
          <FormControl size="small" sx={{ width: 200 }}>
            <InputLabel>סינון לפי סטטוס</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="סינון לפי סטטוס"
            >
              <MenuItem value="">הכל</MenuItem>
              <MenuItem value="Completed">הושלם</MenuItem>
              <MenuItem value="InProgress">בתהליך</MenuItem>
              <MenuItem value="NotStarted">לא התחיל</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* 🔥 סטטיסטיקות מעודכנות */}
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

      {/* 🔥 טבלת ילדים מעודכנת */}
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