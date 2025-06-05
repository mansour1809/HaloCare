// src/pages/kids/KidsManagement.jsx - גרסה מעודכנת לתמיכה במבנה החדש
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
  Email as EmailIcon, Schedule as PendingIcon
} from '@mui/icons-material';

import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchOnboardingStatus } from '../../Redux/features/onboardingSlice';
import Swal from 'sweetalert2';

// קומפוננטה לבאדג' סטטוס מעודכנת
const OnboardingStatusChip = ({ process }) => {
  if (!process) {
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

  const { processStatus, completionPercentage } = process;
  
  const getStatusConfig = () => {
    switch (processStatus) {
      case 'Completed':
        return { 
          color: 'success', 
          label: '✓ הושלם', 
          variant: 'filled',
          icon: <CompleteIcon fontSize="small" />
        };
      case 'InProgress':
        return { 
          color: 'primary', 
          label: `⚡ בתהליך (${completionPercentage}%)`, 
          variant: 'filled',
          icon: <EditIcon fontSize="small" />
        };
      default:
        return { 
          color: 'default', 
          label: '○ ממתין', 
          variant: 'outlined',
          icon: <PendingIcon fontSize="small" />
        };
    }
  };

  const config = getStatusConfig();
  
  return (
    <Chip
      icon={config.icon}
      label={config.label}
      color={config.color}
      variant={config.variant}
      size="small"
      sx={{ fontWeight: 'medium', minWidth: '140px' }}
    />
  );
};

// קומפוננטה לפירוט הטפסים
const FormsBreakdown = ({ forms }) => {
  if (!forms || forms.length === 0) return null;

  const statusCounts = {
    completed: forms.filter(f => f.status === 'completed' || f.status === 'returned_from_parent').length,
    inProgress: forms.filter(f => f.status === 'in_progress').length,
    sentToParent: forms.filter(f => f.status === 'sent_to_parent').length,
    notStarted: forms.filter(f => f.status === 'not_started').length
  };

  return (
    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {statusCounts.completed > 0 && (
        <Chip 
          label={`${statusCounts.completed} הושלמו`}
          size="small" 
          color="success" 
          variant="outlined"
        />
      )}
      {statusCounts.inProgress > 0 && (
        <Chip 
          label={`${statusCounts.inProgress} בתהליך`}
          size="small" 
          color="warning" 
          variant="outlined"
        />
      )}
      {statusCounts.sentToParent > 0 && (
        <Chip 
          label={`${statusCounts.sentToParent} אצל הורים`}
          size="small" 
          color="info" 
          variant="outlined"
        />
      )}
      {statusCounts.notStarted > 0 && (
        <Chip 
          label={`${statusCounts.notStarted} לא התחילו`}
          size="small" 
          color="default" 
          variant="outlined"
        />
      )}
    </Box>
  );
};

// כפתורי פעולות מעודכנים
const OnboardingActions = ({ kid, onboardingProcess, onAction }) => {
  const getActions = () => {
    if (!onboardingProcess) {
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

    switch (onboardingProcess.processStatus) {
      case 'InProgress':
        return [
          { 
            action: 'continue', 
            label: 'המשך', 
            color: 'primary', 
            icon: <EditIcon />,
            tooltip: 'המשך תהליך הקליטה'
          }
        ];
      case 'Completed':
        return [
          { 
            action: 'view', 
            label: 'צפה', 
            color: 'success', 
            icon: <VisibilityIcon />,
            tooltip: 'צפה בפרופיל הילד'
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

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { kids, status, error } = useSelector(state => state.kids);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [onboardingProcesses, setOnboardingProcesses] = useState({});
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
      
      // טעינת סטטוסי קליטה לכל ילד
      const processPromises = kidsResult.map(async (kid) => {
        try {
          const processResult = await dispatch(fetchOnboardingStatus(kid.id)).unwrap();
          return { kidId: kid.id, process: processResult };
        } catch (error) {
          // אם אין תהליך קליטה - החזר null
          return { kidId: kid.id, process: null };
        }
      });
      
      const processes = await Promise.all(processPromises);
      const processMap = {};
      processes.forEach(({ kidId, process }) => {
        processMap[kidId] = process;
      });
      
      setOnboardingProcesses(processMap);
      
    } catch (error) {
      console.error('Error loading data:', error);
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
        // התחלת קליטה חדשה
        navigate(`/kids/onboarding/${kidId}`);
        break;
      case 'continue':
        // המשך קליטה קיימת
        navigate(`/kids/onboarding/${kidId}`);
        break;
      case 'view':
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
    
    const onboardingProcess = onboardingProcesses[kid.id];
    const processStatus = onboardingProcess?.processStatus || 'NotStarted';
    const statusMatch = !statusFilter || processStatus === statusFilter;
    
    return searchMatch && statusMatch;
  });

  // חישוב סטטיסטיקות מעודכן
  const stats = {
    total: kids.length,
    completed: Object.values(onboardingProcesses).filter(p => p?.processStatus === 'Completed').length,
    inProgress: Object.values(onboardingProcesses).filter(p => p?.processStatus === 'InProgress').length,
    notStarted: kids.length - Object.values(onboardingProcesses).filter(p => p !== null).length
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

      {/* טבלת ילדים מעודכנת */}
      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 700 }}>ילד</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>גיל</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>מגדר</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>הורה ראשי</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>סטטוס קליטה</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>התקדמות</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>פירוט טפסים</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredKids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    לא נמצאו ילדים
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredKids.map((kid) => {
                const onboardingProcess = onboardingProcesses[kid.id];
                const completionPercentage = onboardingProcess?.completionPercentage || 0;
                
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
                      <OnboardingStatusChip process={onboardingProcess} />
                    </TableCell>
                    <TableCell>
                      {completionPercentage > 0 ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={completionPercentage} 
                            sx={{ width: 100, height: 8, borderRadius: 4 }}
                          />
                          <Typography variant="body2">{completionPercentage}%</Typography>
                        </Box>
                      ) : '–'}
                    </TableCell>
                    <TableCell>
                      <FormsBreakdown forms={onboardingProcess?.forms} />
                    </TableCell>
                    <TableCell>
                      <OnboardingActions
                        kid={kid}
                        onboardingProcess={onboardingProcess}
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