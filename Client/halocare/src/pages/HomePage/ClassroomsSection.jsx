import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stack,
  Divider,
  Tooltip,
  Chip,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Switch,
  FormControlLabel,
  TextField,
  InputAdornment,
  Fab,
  Zoom,
  LinearProgress,
  Alert,
  Collapse,
  Menu,
  MenuItem,
  Paper,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import {
  School as SchoolIcon,
  Groups as GroupsIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  QuestionMark as UnknownIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  PersonAdd as AddKidIcon,
  Call as CallIcon,
  Message as MessageIcon,
  Notifications as NotificationIcon,
  Schedule as ScheduleIcon,
  AssignmentTurnedIn as TaskIcon,
  Close as CloseIcon,
  Person as PersonIcon,
  QuestionMark
} from '@mui/icons-material';
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchAttendanceByDate, updateAttendanceRecord } from '../../Redux/features/attendanceSlice';
import { Navigate, useNavigate } from 'react-router-dom';

const ClassroomsSection = ({ onKidClick }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { classes, status: classesStatus } = useSelector(state => state.classes);
  const { kids, status: kidsStatus } = useSelector(state => state.kids);
  const { todayRecords, status: attendanceStatus } = useSelector(state => state.attendance);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [filterMode, setFilterMode] = useState('all'); // all, present, absent, unknown
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showClassDetails, setShowClassDetails] = useState({});
  const [actionMenuAnchor, setActionMenuAnchor] = useState(null);
  const [selectedKidForAction, setSelectedKidForAction] = useState(null);

  // Load data on mount
  useEffect(() => {
    dispatch(fetchClasses());
    dispatch(fetchKids());
    dispatch(fetchAttendanceByDate(selectedDate));
  }, [dispatch, selectedDate]);

  // Auto refresh every 5 minutes
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      dispatch(fetchAttendanceByDate(selectedDate));
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [autoRefresh, selectedDate, dispatch]);

  // Process data
  const getKidsWithAttendance = () => {
    if (!kids.length) return [];
    
    return kids.map(kid => {
      const attendanceRecord = todayRecords.find(record => record.kidId === kid.id);
      return {
        ...kid,
        isPresent: attendanceRecord?.isPresent,
        arrivalTime: attendanceRecord?.arrivalTime,
        attendanceNotes: attendanceRecord?.notes,
        attendanceId: attendanceRecord?.id
      };
    });
  };

  const getClassData = () => {
    const kidsWithAttendance = getKidsWithAttendance();
    
    return classes.map(classItem => {
      const classKids = kidsWithAttendance.filter(kid => kid.classId === classItem.classId);
      
      // Filter kids based on search and filter mode
      let filteredKids = classKids;
      
      if (searchTerm) {
        filteredKids = filteredKids.filter(kid => 
          kid.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          kid.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (filterMode !== 'all') {
        filteredKids = filteredKids.filter(kid => {
          switch (filterMode) {
            case 'present': return kid.isPresent === true;
            case 'absent': return kid.isPresent === false;
            case 'unknown': return kid.isPresent === null || kid.isPresent === undefined;
            default: return true;
          }
        });
      }
      
      const stats = {
        present: classKids.filter(kid => kid.isPresent === true).length,
        absent: classKids.filter(kid => kid.isPresent === false).length,
        unknown: classKids.filter(kid => kid.isPresent === null || kid.isPresent === undefined).length,
        total: classKids.length
      };
      
      return {
        ...classItem,
        kids: filteredKids,
        allKids: classKids,
        stats
      };
    });
  };

  const handleQuickAttendanceToggle = async (kidId, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    
    try {
      // Find existing attendance record or create new one
      const existingRecord = todayRecords.find(record => record.kidId === kidId);
      
      if (existingRecord) {
        await dispatch(updateAttendanceRecord({
          id: existingRecord.id,
          data: { ...existingRecord, isPresent: newStatus }
        }));
      }
      //  else {
      //   // Need to add addAttendanceRecord to the slice
      //   await dispatch(addAttendanceRecord({
      //     kidId,
      //     date: selectedDate,
      //     isPresent: newStatus,
      //     arrivalTime: newStatus ? new Date().toISOString() : null
      //   }));
      // }
      
      // Refresh attendance data
      dispatch(fetchAttendanceByDate(selectedDate));
    } catch (error) {
      console.error('Error updating attendance:', error);
    }
  };

  const handleKidAction = (kid, action) => {
    setActionMenuAnchor(null);
    
    switch (action) {
      case 'profile':
        onKidClick(kid.id);
        break;
      case 'call':
        // Open call dialog or integrate with phone
        window.open(`tel:${kid.parentPhone}`);
        break;
      case 'message':
        // Open messaging interface
        console.log('Send message to:', kid);
        break;
      default:
        break;
    }
  };

  const getAttendanceIcon = (isPresent) => {
    switch (isPresent) {
      case true: return <PresentIcon color="success" />;
      case false: return <AbsentIcon color="error" />;
      default: return <UnknownIcon color="warning" />;
    }
  };

  const getAttendanceColor = (isPresent) => {
    switch (isPresent) {
      case true: return 'success.main';
      case false: return 'error.main';
      default: return 'warning.main';
    }
  };

  const ClassCard = ({ classData }) => {
    const isExpanded = showClassDetails[classData.classId];
    const hasAbsentKids = classData.stats.absent > 0;
    const hasUnknownKids = classData.stats.unknown > 0;
    
    return (
      <Card 
        elevation={3}
        sx={{ 
          height: '100%',
          transition: 'all 0.3s ease',
          border: hasAbsentKids ? '2px solid' : '1px solid',
          borderColor: hasAbsentKids ? 'error.main' : 'divider',
          '&:hover': { 
            transform: 'translateY(-2px)',
            boxShadow: 6 
          }
        }}
      >
        <CardContent sx={{ p: 2 }}>
          {/* Class Header */}
          <Stack direction="row" spacing={2} alignItems="center" mb={2}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main',
                width: 45,
                height: 45,
                fontSize: '1.2rem'
              }}
            >
              {classData.icon || '🎓'}
            </Avatar>
            <Box flex={1}>
              <Typography variant="h6" fontWeight="bold">
                {classData.className}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                גננת: {classData.teacherName || 'לא מוגדר'}
              </Typography>
            </Box>
            
            {/* Alerts */}
            {hasAbsentKids && (
              <Chip 
                icon={<WarningIcon />}
                label={`${classData.stats.absent} נעדרים`}
                color="error"
                size="small"
              />
            )}
            {hasUnknownKids && (
              <Chip 
                icon={<QuestionMark />}
                label={`${classData.stats.unknown} לא סומן`}
                color="warning"
                size="small"
              />
            )}
          </Stack>

          {/* Quick Stats */}
          <Paper elevation={1} sx={{ p: 1.5, mb: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="success.main" fontWeight="bold">
                    {classData.stats.present}
                  </Typography>
                  <Typography variant="caption">נוכחים</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    {classData.stats.absent}
                  </Typography>
                  <Typography variant="caption">נעדרים</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                    {classData.stats.unknown}
                  </Typography>
                  <Typography variant="caption">לא סומן</Typography>
                </Box>
              </Grid>
              <Grid item xs={3}>
                <Box textAlign="center">
                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                    {classData.stats.total}
                  </Typography>
                  <Typography variant="caption">סה"כ</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Kids Grid */}
          {classData.kids.length > 0 ? (
            <Grid container spacing={1} mb={2}>
              {classData.kids.map((kid) => (
                <Grid item key={kid.id}>
                  <Badge
                    badgeContent={getAttendanceIcon(kid.isPresent)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  >
                    <Tooltip 
                      title={
                        <Box>
                          <Typography variant="body2">
                            {kid.firstName} {kid.lastName}
                          </Typography>
                          <Typography variant="caption">
                            {kid.isPresent === true ? 'נוכח' : 
                             kid.isPresent === false ? 'נעדר' : 'לא סומן'}
                          </Typography>
                          {kid.arrivalTime && (
                            <Typography variant="caption" display="block">
                              הגיע: {new Date(kid.arrivalTime).toLocaleTimeString('he-IL')}
                            </Typography>
                          )}
                        </Box>
                      }
                    >
                      <Avatar
                        onClick={(e) => {
                          setSelectedKidForAction(kid);
                          setActionMenuAnchor(e.currentTarget);
                        }}
                        sx={{
                          width: 40,
                          height: 40,
                          cursor: 'pointer',
                          bgcolor: getAttendanceColor(kid.isPresent),
                          opacity: kid.isPresent === false ? 0.6 : 1,
                          transition: 'all 0.2s ease',
                          fontSize: '0.9rem',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            boxShadow: 2
                          }
                        }}
                      >
                        {kid.firstName?.charAt(0) || '?'}
                      </Avatar>
                    </Tooltip>
                  </Badge>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info" sx={{ mb: 2 }}>
              אין ילדים בכיתה זו או שהמסנן לא מציג תוצאות
            </Alert>
          )}

          {/* Action Buttons */}
          <Stack direction="row" spacing={1} justifyContent="space-between">
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowClassDetails(prev => ({
                ...prev,
                [classData.classId]: !prev[classData.classId]
              }))}
            >
              {isExpanded ? 'הסתר פרטים' : 'הצג פרטים'}
            </Button>
            
            {hasAbsentKids && (
              <Button
                size="small"
                variant="contained"
                color="warning"
                startIcon={<CallIcon />}
                onClick={() => console.log('Call absent kids parents')}
              >
                חייג לנעדרים
              </Button>
            )}
          </Stack>

          {/* Expanded Details */}
          <Collapse in={isExpanded}>
            <Divider sx={{ my: 2 }} />
            <List dense>
              {classData.allKids.map(kid => (
                <ListItem 
                  key={kid.id}
                  secondaryAction={
                    <Switch
                      checked={kid.isPresent === true}
                      onChange={() => handleQuickAttendanceToggle(kid.id, kid.isPresent)}
                      color="success"
                    />
                  }
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getAttendanceColor(kid.isPresent) }}>
                      {kid.firstName?.charAt(0) || '?'}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${kid.firstName} ${kid.lastName}`}
                    secondary={
                      kid.arrivalTime ? 
                        `הגיע: ${new Date(kid.arrivalTime).toLocaleTimeString('he-IL')}` :
                        kid.isPresent === false ? 'נעדר' : 'לא סומן'
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  const classesData = getClassData();
  const isLoading = classesStatus === 'loading' || kidsStatus === 'loading' || attendanceStatus === 'loading';

  return (
    <>
      <Card elevation={3} sx={{ height: '100%' }}>
        {/* Header with Controls */}
        <Box 
          sx={{ 
            p: 2.5,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SchoolIcon color="primary" />
              <Typography variant="h5" fontWeight="bold">
                כיתות הגן
              </Typography>
              <Chip 
                label={selectedDate} 
                icon={<CalendarIcon />}
                variant="outlined"
                size="small"
              />
            </Stack>
            
            <Stack direction="row" spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    size="small"
                  />
                }
                label="רענון אוטומטי"
              />
              
              <IconButton onClick={() => dispatch(fetchAttendanceByDate(selectedDate))}>
                <RefreshIcon />
              </IconButton>
              
              <Button
                variant="contained"
                size="small"
                startIcon={<GroupsIcon />}
                onClick={() => navigate('/kids/list')}
              >
                כל הילדים
              </Button>
            </Stack>
          </Stack>

          {/* Filters and Search */}
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              size="small"
              placeholder="חיפוש ילד..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              sx={{ minWidth: 200 }}
            />
            
            <ToggleButtonGroup
              value={filterMode}
              exclusive
              onChange={(e, newValue) => newValue && setFilterMode(newValue)}
              size="small"
            >
              <ToggleButton value="all">הכל</ToggleButton>
              <ToggleButton value="present">נוכחים</ToggleButton>
              <ToggleButton value="absent">נעדרים</ToggleButton>
              <ToggleButton value="unknown">לא סומן</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Box>
        
        {/* Loading Bar */}
        {isLoading && <LinearProgress />}
        
        {/* Content */}
        <CardContent sx={{ p: 3 }}>
          {classesData.length > 0 ? (
            <Grid container spacing={3}>
              {classesData.map((classData) => (
                <Grid item xs={12} md={6} key={classData.classId}>
                  <ClassCard classData={classData} />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Alert severity="info">
              לא נמצאו כיתות או שהמסנן לא מציג תוצאות
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Kid Action Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleKidAction(selectedKidForAction, 'profile')}>
          <PersonIcon sx={{ mr: 1 }} />
          פרופיל ילד
        </MenuItem>
        <MenuItem onClick={() => handleKidAction(selectedKidForAction, 'call')}>
          <CallIcon sx={{ mr: 1 }} />
          חייג להורים
        </MenuItem>
        <MenuItem onClick={() => handleKidAction(selectedKidForAction, 'message')}>
          <MessageIcon sx={{ mr: 1 }} />
          שלח הודעה
        </MenuItem>
      </Menu>

      {/* Floating Action Button for Quick Actions */}
      <Zoom in={!isLoading}>
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setQuickActionsOpen(true)}
        >
          <TaskIcon />
        </Fab>
      </Zoom>

      {/* Quick Actions Dialog */}
      <Dialog open={quickActionsOpen} onClose={() => setQuickActionsOpen(false)}>
        <DialogTitle>פעולות מהירות</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Button
              variant="outlined"
              startIcon={<CallIcon />}
              fullWidth
              onClick={() => console.log('Call all absent kids')}
            >
              חייג לכל ההורים של הנעדרים
            </Button>
            <Button
              variant="outlined"
              startIcon={<MessageIcon />}
              fullWidth
              onClick={() => console.log('Send message to all')}
            >
              שלח הודעה לכל ההורים
            </Button>
            <Button
              variant="outlined"
              startIcon={<TrendingIcon />}
              fullWidth
              onClick={() => console.log('Generate attendance report')}
            >
              צור דוח נוכחות
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickActionsOpen(false)}>סגור</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClassroomsSection;