// src/pages/kids/KidsManagement.jsx - גרסה חדשה מלאה
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Button, IconButton, TextField, InputAdornment,
  CircularProgress, Alert, Chip, Breadcrumbs, FormControl, InputLabel, 
  Select, MenuItem, Tooltip, Card, CardContent, Grid, LinearProgress, Fab,
  Stack, Collapse, CardActions, Divider, Badge, useTheme, alpha
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Visibility as VisibilityIcon,
  Home as HomeIcon, Group as GroupIcon, Refresh as RefreshIcon,
  PlayArrow as StartIcon, Edit as EditIcon, CheckCircle as CompleteIcon,
  Dashboard as DashboardIcon, Email as EmailIcon, Schedule as ScheduleIcon,
  Warning as WarningIcon, TrendingUp as TrendingUpIcon, 
  Assignment as AssignmentIcon, ExpandMore as ExpandMoreIcon,
  FilterList as FilterIcon, Sort as SortIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format, differenceInDays } from 'date-fns';
import { he } from 'date-fns/locale';

import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchOnboardingSummary } from '../../Redux/features/onboardingSlice';
// import { calculateAge } from '../../utils/dateUtils';

const theme = {
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    success: { main: '#2e7d32' },
    warning: { main: '#ed6c02' },
    error: { main: '#d32f2f' },
    info: { main: '#0288d1' }
  }
};

// סטיילד קומפוננטים
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  overflow: 'hidden',
  '& .MuiTableHead-root': {
    '& .MuiTableCell-root': {
      backgroundColor: alpha(theme.palette.primary.main, 0.1),
      fontWeight: 600,
      color: theme.palette.primary.main,
      borderBottom: `2px solid ${theme.palette.primary.main}`,
    }
  }
}));

const StatusCard = styled(Card)(({ theme, severity }) => {
  const colors = {
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    info: theme.palette.info.main
  };

  return {
    borderLeft: `4px solid ${colors[severity] || colors.info}`,
    borderRadius: 12,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)'
    }
  };
});

// קומפוננטת סטטוס קליטה משופרת
const OnboardingStatusDisplay = ({ kidId, onStatusLoad }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const result = await dispatch(fetchOnboardingSummary(kidId)).unwrap();
        setSummary(result);
        onStatusLoad?.(kidId, result);
      } catch (error) {
        setSummary(null);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, [kidId, dispatch, onStatusLoad]);

  if (loading) {
    return <CircularProgress size={24} />;
  }

  if (!summary) {
    return (
      <Chip
        label="לא התחיל"
        color="default"
        variant="outlined"
        size="small"
        icon={<ScheduleIcon />}
      />
    );
  }

  const getStatusConfig = () => {
    switch (summary.processStatus) {
      case 'Completed':
        return { 
          color: 'success', 
          label: 'הושלם', 
          icon: <CompleteIcon />,
          variant: 'filled'
        };
      case 'InProgress':
        return { 
          color: 'primary', 
          label: `בתהליך (${summary.completionPercentage}%)`, 
          icon: <TrendingUpIcon />,
          variant: 'filled'
        };
      case 'NotStarted':
        return { 
          color: 'warning', 
          label: 'לא התחיל', 
          icon: <ScheduleIcon />,
          variant: 'outlined'
        };
      default:
        return { 
          color: 'default', 
          label: 'לא ידוע', 
          icon: <WarningIcon />,
          variant: 'outlined'
        };
    }
  };
  
  const config = getStatusConfig();

  return (
    <Tooltip 
      title={
        <Box>
          <Typography variant="body2" fontWeight="bold">
            סטטוס: {config.label}
          </Typography>
          <Typography variant="caption">
            טפסים: {summary.completedForms}/{summary.totalForms}
          </Typography>
          <Typography variant="caption" display="block">
            זמן בתהליך: {summary.daysInProcess} ימים
          </Typography>
          {summary.nextForm && (
            <Typography variant="caption" display="block">
              הבא: {summary.nextForm}
            </Typography>
          )}
        </Box>
      }
    >
      <Chip
        label={config.label}
        color={config.color}
        variant={config.variant}
        size="small"
        icon={config.icon}
        sx={{ minWidth: 120, fontWeight: 'medium' }}
      />
    </Tooltip>
  );
};

// בר התקדמות משופר
const ProgressDisplay = ({ kidId, summary }) => {
  if (!summary) {
    return (
      <Box sx={{ width: '100%', color: 'text.secondary' }}>
        <Typography variant="caption">לא התחיל</Typography>
      </Box>
    );
  }

  const { completionPercentage, completedForms, totalForms } = summary;

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          {completedForms}/{totalForms} טפסים
        </Typography>
        <Typography variant="caption" fontWeight="bold" color="primary">
          {completionPercentage}%
        </Typography>
      </Stack>
      <LinearProgress 
        variant="determinate" 
        value={completionPercentage}
        sx={{ 
          height: 8, 
          borderRadius: 4,
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          '& .MuiLinearProgress-bar': {
            borderRadius: 4,
            background: completionPercentage === 100 
              ? `linear-gradient(45deg, ${theme.palette.success.main}, ${theme.palette.success.light})`
              : `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`
          }
        }}
      />
    </Box>
  );
};

// פעולות תהליך קליטה
const OnboardingActions = ({ kid, summary, onAction }) => {
  const getActions = () => {
    if (!summary) {
      return [{
        key: 'start',
        label: 'התחל תהליך',
        icon: <StartIcon />,
        color: 'primary',
        variant: 'contained'
      }];
    }

    const actions = [];

    // תמיד יש אפשרות לצפות
    actions.push({
      key: 'view',
      label: 'צפה',
      icon: <DashboardIcon />,
      color: 'primary',
      variant: 'outlined'
    });

    // אם בתהליך - אפשר לערוך
    if (summary.processStatus === 'InProgress') {
      actions.push({
        key: 'continue',
        label: 'המשך',
        icon: <EditIcon />,
        color: 'primary',
        variant: 'contained'
      });
    }

    return actions;
  };

  return (
    <Stack direction="row" spacing={1}>
      {getActions().map(action => (
        <Tooltip key={action.key} title={action.label}>
          <Button
            size="small"
            variant={action.variant}
            color={action.color}
            startIcon={action.icon}
            onClick={() => onAction(action.key, kid, summary)}
            sx={{ 
              minWidth: 'auto',
              borderRadius: 2,
              fontWeight: 'medium'
            }}
          >
            {action.label}
          </Button>
        </Tooltip>
      ))}
    </Stack>
  );
};

const KidsManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { kids, status, error } = useSelector(state => state.kids);
  
  // State מקומי
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [onboardingSummaries, setOnboardingSummaries] = useState({});
  const [showFilters, setShowFilters] = useState(false);

  // טעינה ראשונית
  useEffect(() => {
    dispatch(fetchKids());
  }, [dispatch]);

  // מטפל בטעינת סטטוס קליטה
  const handleOnboardingStatusLoad = (kidId, summary) => {
    setOnboardingSummaries(prev => ({
      ...prev,
      [kidId]: summary
    }));
  };

  // סינון וחיפוש
  const filteredKids = useMemo(() => {
    let filtered = kids.filter(kid => {
      const matchesSearch = 
        kid.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        kid.parentName1?.toLowerCase().includes(searchTerm.toLowerCase());

      const summary = onboardingSummaries[kid.id];
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'completed' && summary?.processStatus === 'Completed') ||
        (statusFilter === 'in_progress' && summary?.processStatus === 'InProgress') ||
        (statusFilter === 'not_started' && (!summary || summary.processStatus === 'NotStarted'));

      return matchesSearch && matchesStatus;
    });

    // מיון
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return (a.firstName || '').localeCompare(b.firstName || '');
        case 'age':
          return new Date(b.birthDate) - new Date(a.birthDate);
        case 'progress':
          const progressA = onboardingSummaries[a.id]?.completionPercentage || 0;
          const progressB = onboardingSummaries[b.id]?.completionPercentage || 0;
          return progressB - progressA;
        default:
          return 0;
      }
    });

    return filtered;
  }, [kids, searchTerm, statusFilter, sortBy, onboardingSummaries]);

  // מטפל בפעולות
  const handleAction = async (action, kid, summary) => {
    switch (action) {
      case 'start':
        navigate(`/kids/onboarding/new`);
        break;
      case 'view':
      case 'continue':
        navigate(`/kids/onboarding/${kid.id}`);
        break;
      default:
        console.log('Unknown action:', action);
    }
  };

  // רענון נתונים
  const handleRefresh = () => {
    dispatch(fetchKids());
    setOnboardingSummaries({});
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
  // סטטיסטיקות כלליות
  const stats = useMemo(() => {
    const total = kids.length;
    const withOnboarding = Object.keys(onboardingSummaries).length;
    const completed = Object.values(onboardingSummaries).filter(s => s.processStatus === 'Completed').length;
    const inProgress = Object.values(onboardingSummaries).filter(s => s.processStatus === 'InProgress').length;
    
    return {
      total,
      withOnboarding,
      completed,
      inProgress,
      notStarted: total - completed - inProgress
    };
  }, [kids, onboardingSummaries]);

  if (status === 'loading' && kids.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* כותרת ונתיב */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Typography color="inherit" sx={{ display: 'flex', alignItems: 'center' }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            בית
          </Typography>
          <Typography color="primary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 'medium' }}>
            <GroupIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            ניהול ילדים
          </Typography>
        </Breadcrumbs>

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" fontWeight="bold" color="primary">
            ניהול ילדים ותהליכי קליטה
          </Typography>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
            >
              רענן
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/kids/onboarding/new')}
              sx={{ borderRadius: 2 }}
            >
              ילד חדש
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* סטטיסטיקות כלליות */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatusCard severity="info">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                  <GroupIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.total}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    סה"כ ילדים
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatusCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatusCard severity="success">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <CompleteIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.completed}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    הושלמו
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatusCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatusCard severity="warning">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.inProgress}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    בתהליך
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatusCard>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatusCard severity="error">
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <ScheduleIcon />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    {stats.notStarted}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    לא התחילו
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </StatusCard>
        </Grid>
      </Grid>

      {/* כלי חיפוש וסינון */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            placeholder="חפש לפי שם ילד או הורה..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flexGrow: 1 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            endIcon={<ExpandMoreIcon sx={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            מסננים
          </Button>
        </Stack>

        <Collapse in={showFilters}>
          <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>סטטוס קליטה</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="סטטוס קליטה"
              >
                <MenuItem value="all">הכל</MenuItem>
                <MenuItem value="completed">הושלם</MenuItem>
                <MenuItem value="in_progress">בתהליך</MenuItem>
                <MenuItem value="not_started">לא התחיל</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>מיון לפי</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="מיון לפי"
              >
                <MenuItem value="name">שם</MenuItem>
                <MenuItem value="age">גיל</MenuItem>
                <MenuItem value="progress">התקדמות</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Collapse>
      </Paper>

      {/* שגיאה */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* טבלת ילדים */}
      <StyledTableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ילד</TableCell>
              <TableCell align="center">גיל</TableCell>
              <TableCell align="center">מין</TableCell>
              <TableCell>הורה ראשי</TableCell>
              <TableCell align="center">סטטוס קליטה</TableCell>
              <TableCell align="center">התקדמות</TableCell>
              <TableCell align="center">פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredKids.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {kids.length === 0 ? 'אין ילדים במערכת' : 'לא נמצאו תוצאות'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredKids.map((kid) => (
                <TableRow 
                  key={kid.id}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: alpha(theme.palette.primary.main, 0.04) 
                    } 
                  }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          width: 40, 
                          height: 40,
                          fontSize: '1rem'
                        }}
                      >
                        {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                      </Avatar>
                      <Box>
                        <Typography fontWeight="medium">
                          {`${kid.firstName || ''} ${kid.lastName || ''}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {kid.hName || 'לא צוין'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={calculateAge(kid.birthDate)}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={kid.gender === 'זכר' ? 'זכר' : 'נקבה'} 
                      size="small"
                      color={kid.gender === 'זכר' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {kid.parentName1 || '–'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <OnboardingStatusDisplay
                      kidId={kid.id}
                      onStatusLoad={handleOnboardingStatusLoad}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <ProgressDisplay
                      kidId={kid.id}
                      summary={onboardingSummaries[kid.id]}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <OnboardingActions
                      kid={kid}
                      summary={onboardingSummaries[kid.id]}
                      onAction={handleAction}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* כפתור צף */}
      <Fab
        color="primary"
        onClick={() => navigate('/kids/onboarding/new')}
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          left: 24,
          boxShadow: '0 8px 24px rgba(25, 118, 210, 0.3)'
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default KidsManagement;