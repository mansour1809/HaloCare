import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {useNavigate} from 'react-router-dom'
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Switch,
  TextField,
  InputAdornment,
  LinearProgress,
  Alert,
  Collapse,
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Fade,
  Zoom,
  Slide,
  Container
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import {
  School as SchoolIcon,
  Groups as GroupsIcon,
  Phone as PhoneIcon,
  Edit as EditIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  QuestionMark as UnknownIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Call as CallIcon,
  Save as SaveIcon,
  Person as PersonIcon,
  FileDownload as ExportIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AwesomeIcon,
  Insights as InsightsIcon
} from '@mui/icons-material';
import {useAuth} from '../../components/login/AuthContext'
import { fetchClasses } from '../../Redux/features/classesSlice';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchAttendanceByDate, addAttendanceRecord, updateAttendanceRecord } from '../../Redux/features/attendanceSlice';
import { exportAttendanceToPDF } from '../../utils/attendanceExport';
import { baseURL } from '../../components/common/axiosConfig';
import Swal from 'sweetalert2';



// 🎨 Stunning animations and styled components
const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const glow = keyframes`
  0%, 100% { box-shadow: 0 0 20px rgba(102, 126, 234, 0.3); }
  50% { box-shadow: 0 0 30px rgba(102, 126, 234, 0.6), 0 0 40px rgba(102, 126, 234, 0.4); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const GradientContainer = styled(Container)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  minHeight: '100vh',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '300px',
    background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
    borderRadius: '0 0 50px 50px',
    zIndex: 0,
  }
}));

const MainCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  boxShadow: '0 20px 60px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.2)',
  border: 'none',
  position: 'relative',
  zIndex: 1,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #667eea, #764ba2, #f093fb)',
    borderRadius: '24px 24px 0 0',
  }
}));

const StatsCard = styled(Card)(({ theme, color = '#667eea' }) => ({
  background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
  borderRadius: '20px',
  border: `2px solid ${color}20`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `0 20px 40px ${color}30`,
    animation: `${glow} 2s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '2px',
    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
    animation: `${shimmer} 3s infinite`,
  }
}));

const ClassCard = styled(Card)(({ theme, hasChanges, hasAbsent }) => ({
  background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
  borderRadius: '20px',
  border: hasAbsent ? '2px solid #ef4444' : hasChanges ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.3)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-12px)',
    boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
    '& .class-header': {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
    }
  },
  '&::after': hasChanges ? {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '0',
    height: '0',
    borderLeft: '30px solid transparent',
    borderTop: '30px solid #f59e0b',
  } : {}
}));

const FloatingAvatar = styled(Avatar)(({ theme, status }) => {
  const getStatusColor = () => {
    switch(status) {
      case true: return '#10b981';
      case false: return '#ef4444';
      default: return '#f59e0b';
    }
  };

  return {
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    background: `linear-gradient(135deg, ${getStatusColor()} 0%, ${getStatusColor()}dd 100%)`,
    border: '3px solid rgba(255,255,255,0.8)',
    boxShadow: `0 8px 25px ${getStatusColor()}40`,
    '&:hover': {
      transform: 'scale(1.2) rotate(5deg)',
      animation: `${float} 2s ease-in-out infinite`,
      boxShadow: `0 15px 35px ${getStatusColor()}60`,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-2px',
      left: '-2px',
      right: '-2px',
      bottom: '-2px',
      borderRadius: '50%',
      background: `conic-gradient(${getStatusColor()}, transparent, ${getStatusColor()})`,
      animation: `${shimmer} 3s linear infinite`,
      zIndex: -1,
    }
  };
});

const GlowingButton = styled(Button)(({ glowColor = 'black' }) => ({
  borderRadius: '16px',
  textTransform: 'none',
  fontWeight: 600,
  padding: '12px 24px',
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${glowColor} 0%, ${glowColor}dd 100%)`,
  boxShadow: `0 8px 25px ${glowColor}40`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: `0 15px 35px ${glowColor}60`,
    animation: `${pulse} 1.5s infinite`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
    transition: 'left 0.5s',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const AnimatedChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  borderRadius: '12px',
  fontWeight: 600,
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    transform: 'scale(1.1)',
  }
}));

const ClassroomsSection = ({ onKidClick, onViewAllKids }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {currentUser} = useAuth();
  
  // Redux state
  const { classes, status: classesStatus } = useSelector(state => state.classes);
  const { kids, status: kidsStatus } = useSelector(state => state.kids);
  const { todayRecords, status: attendanceStatus } = useSelector(state => state.attendance);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterMode, setFilterMode] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [showClassDetails, setShowClassDetails] = useState({});
  const [kidDetailsDialog, setKidDetailsDialog] = useState({ open: false, kid: null });
  const [attendanceUpdates, setAttendanceUpdates] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [exporting, setExporting] = useState(false);

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

  // Process data with active kids only
  const getActiveKidsWithAttendance = () => {
    if (!kids.length) return [];
    
    const activeKids = kids.filter(kid => kid.isActive === true);
    
    return activeKids.map(kid => {
      const attendanceRecord = todayRecords.find(record => record.kidId === kid.id);
      const localUpdate = attendanceUpdates[kid.id];
      
      return {
        ...kid,
        isPresent: localUpdate !== undefined ? localUpdate : attendanceRecord?.isPresent,
        absenceReason: attendanceRecord?.absenceReason,
        reportedBy: attendanceRecord?.reportedBy,
        attendanceId: attendanceRecord?.attendanceId,
        hasLocalChanges: localUpdate !== undefined
      };
    });
  };

  const getClassData = () => {
    const activeKidsWithAttendance = getActiveKidsWithAttendance();
    
    return classes.map(classItem => {
      const classKids = activeKidsWithAttendance.filter(kid => kid.classId === classItem.classId);
      
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

  const saveAllAttendanceChanges = async () => {
    if (Object.keys(attendanceUpdates).length === 0) {
      setSnackbar({
        open: true,
        message: 'אין שינויים לשמירה',
        severity: 'info'
      });
      return;
    }
    const absentKids = Object.entries(attendanceUpdates).filter(([kidId, isPresent]) => !isPresent);
    if (absentKids.length > 0) {
      const result = await Swal.fire({
        title: '⚠️ שים לב',
        html: `
          <div style="text-align: center; padding: 20px;">
            <div style="font-size: 18px; margin-bottom: 15px; color: #f59e0b; font-weight: bold;">
              יש ${absentKids.length} ילדים שסומנו כנעדרים
            </div>
            <div style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              במסך זה לא ניתן לרשום סיבת היעדרות מפורטת.<br>
              לרישום מלא של סיבות היעדרות, מומלץ לעבור למסך הנוכחות המלא.
            </div>
            <div style="font-size: 14px; color: #6b7280; background: #f3f4f6; padding: 15px; border-radius: 10px;">
              💡 <strong>טיפ:</strong> במסך הנוכחות המלא תוכל לרשום סיבות מפורטות, לשלוח הודעות להורים ולנהל נוכחות בצורה מתקדמת יותר
            </div>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: '💾 שמור בכל מקרה',
        cancelButtonText: '❌ ביטול',
        denyButtonText: '📊 עבור למסך נוכחות מלא',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        denyButtonColor: '#f59e0b',
        customClass: {
          popup: 'swal-rtl',
          title: 'swal-title-rtl',
          htmlContainer: 'swal-html-rtl',
          confirmButton: 'swal-btn-confirm',
          cancelButton: 'swal-btn-cancel',
          denyButton: 'swal-btn-deny'
        },
        didOpen: () => {
          const style = document.createElement('style');
          style.innerHTML = `
            .swal-rtl {
              direction: rtl;
              text-align: right;
              border-radius: 20px !important;
              box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
            }
            .swal-title-rtl {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              font-weight: bold;
            }
            .swal-html-rtl {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .swal-btn-confirm, .swal-btn-cancel, .swal-btn-deny {
              border-radius: 12px !important;
              font-weight: 600 !important;
              padding: 12px 24px !important;
              margin: 2px 8px !important;
              transition: all 0.3s ease !important;
            }
              
            .swal-btn-confirm:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
            }
            .swal-btn-deny:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 25px rgba(245, 158, 11, 0.4) !important;
            }
            .swal-btn-cancel:hover {
              transform: translateY(-2px) !important;
              box-shadow: 0 8px 25px rgba(107, 114, 128, 0.4) !important;
            }
          `;
          document.head.appendChild(style);
        }
      });

      if (result.isConfirmed) {
        // the user clicked "save anyway"
        setSavingAttendance(true);
      } else if (result.isDenied) {
        // navigate to full attendance page
        navigate('/reports/attendance');
        return;
      } else {
        setSnackbar({
          open: true,
          message: 'הפעולה בוטלה',
          severity: 'info'
        });
        return;
      }
    } else {
      setSavingAttendance(true);
    }


    
    try {
      const updates = Object.entries(attendanceUpdates);
      
      for (const [kidId, isPresent] of updates) {
        const existingRecord = todayRecords.find(record => record.kidId === parseInt(kidId));
        
        if (existingRecord) {
          await dispatch(updateAttendanceRecord({
            id: existingRecord.attendanceId,
            data: {
              ...existingRecord,
              isPresent,
              reportedBy: currentUser.id
            }
          })).unwrap();
        } else {
          await dispatch(addAttendanceRecord({
            kidId: parseInt(kidId),
            attendanceDate: selectedDate,
            isPresent,
            absenceReason: isPresent ? null : 'לא צוין',
            reportedBy: currentUser.id
          })).unwrap();
        }
      }
      
      setAttendanceUpdates({});
      dispatch(fetchAttendanceByDate(selectedDate));
      
      setSnackbar({
        open: true,
        message: `${updates.length} שינויי נוכחות נשמרו בהצלחה! ✨`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      setSnackbar({
        open: true,
        message: 'שגיאה בשמירת הנוכחות. נסה שוב.',
        severity: 'error'
      });
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleQuickAttendanceToggle = (kidId, currentStatus) => {
    const newStatus = currentStatus === true ? false : true;
    
    setAttendanceUpdates(prev => ({
      ...prev,
      [kidId]: newStatus
    }));
    
    setSnackbar({
      open: true,
      message: `הנוכחות עודכנה זמנית. לחץ על "שמור שינויים" לשמירה סופית.`,
      severity: 'info'
    });
  };

  const handleKidClick = (kid) => {
    setKidDetailsDialog({ open: true, kid });
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const classesData = getClassData();
      const totalStats = {
        present: classesData.reduce((sum, cls) => sum + cls.stats.present, 0),
        absent: classesData.reduce((sum, cls) => sum + cls.stats.absent, 0),
        unknown: classesData.reduce((sum, cls) => sum + cls.stats.unknown, 0),
        total: classesData.reduce((sum, cls) => sum + cls.stats.total, 0)
      };
      
      const fileName = exportAttendanceToPDF(classesData, selectedDate, totalStats);
      
      setSnackbar({
        open: true,
        message: `הדוח נוצר בהצלחה: ${fileName} 📄`,
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'שגיאה ביצירת הדוח',
        severity: 'error'
      });
    } finally {
      setExporting(false);
    }
  };


  const classesData = getClassData();
  const isLoading = classesStatus === 'loading' || kidsStatus === 'loading' || attendanceStatus === 'loading';
  const hasUnsavedChanges = Object.keys(attendanceUpdates).length > 0;
  
  const totalStats = {
    present: classesData.reduce((sum, cls) => sum + cls.stats.present, 0),
    absent: classesData.reduce((sum, cls) => sum + cls.stats.absent, 0),
    unknown: classesData.reduce((sum, cls) => sum + cls.stats.unknown, 0),
    total: classesData.reduce((sum, cls) => sum + cls.stats.total, 0)
  };

  return (
    <GradientContainer maxWidth="xl" >
      <Fade in timeout={800}>
        <MainCard elevation={0}>
          {/* Magical Header */}
          <Box dir='rtl' sx={{ 
            p: 4,
            background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
            borderRadius: '24px 24px 0 0',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'url("data:image/svg+xml,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 100 100\'><defs><pattern id=\'grain\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'><circle cx=\'50\' cy=\'50\' r=\'1\' fill=\'%23667eea\' opacity=\'0.1\'/></pattern></defs><rect width=\'100\' height=\'100\' fill=\'url(%23grain)\'/></svg>")',
              opacity: 0.3
            }} />
            
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ position: 'relative', zIndex: 1 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Zoom in timeout={600}>
                  <Avatar sx={{ 
                    width: 70, 
                    height: 70,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                    animation: `${float} 3s ease-in-out infinite`
                  }}>
                    <SchoolIcon sx={{ fontSize: '2rem' }} />
                  </Avatar>
                </Zoom>
                <Box>
                  <Typography variant="h3" sx={{ 
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    mb: 1
                  }}>
                    כיתות הגן ✨
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <AnimatedChip 
                      icon={<CalendarIcon />}
                      label={new Date(selectedDate).toLocaleDateString('he-IL')}
                      color="primary"
                      variant="outlined"
                    />
                    {hasUnsavedChanges && (
                      <AnimatedChip 
                        icon={<EditIcon />}
                        label={`${Object.keys(attendanceUpdates).length} שינויים לא נשמרו`}
                        color="warning"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
              
              <Stack direction="row" spacing={2}>
               
                <GlowingButton
                  startIcon={<ExportIcon />}
                  onClick={handleExportPDF}
                  disabled={exporting}
                  glowColor="#10b981"
                  size="large"
                >
                  {exporting ? 'מייצא...' : 'ייצא PDF'}
                </GlowingButton>
                
                <GlowingButton
                  startIcon={<AnalyticsIcon />}
                  onClick={() => navigate('/reports/attendance')}
                  glowColor="#f59e0b"
                  size="large"
                >
                  מסך נוכחות מלא
                </GlowingButton>
              </Stack>
            </Stack>

            {/* Amazing Stats Overview */}
            <Grid container spacing={3} mb={3}>
              <Grid item size={{xs:12 , sm:3}} >
                <Zoom in timeout={800}>
                  <StatsCard color="#10b981">
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        width: 60, 
                        height: 60, 
                        margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                        animation: `${glow} 2s infinite`
                      }}>
                        <PresentIcon sx={{ fontSize: '2rem' }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#10b981', mb: 1 }}>
                        {totalStats.present}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        נוכחים היום
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item size={{xs:12,sm:3}}>
                <Zoom in timeout={1000}>
                  <StatsCard color="#ef4444">
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        width: 60, 
                        height: 60, 
                        margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #ef4444 0%, #f87171 100%)',
                        animation: totalStats.absent > 0 ? `${pulse} 1s infinite` : 'none'
                      }}>
                        <AbsentIcon sx={{ fontSize: '2rem' }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#ef4444', mb: 1 }}>
                        {totalStats.absent}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        נעדרים היום
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item size={{xs:12,sm:3}}>
                <Zoom in timeout={1200}>
                  <StatsCard color="#f59e0b">
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        width: 60, 
                        height: 60, 
                        margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                      }}>
                        <UnknownIcon sx={{ fontSize: '2rem' }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#f59e0b', mb: 1 }}>
                        {totalStats.unknown}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        לא סומן
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
              
              <Grid item size={{xs:12,sm:3}}>
                <Zoom in timeout={1400}>
                  <StatsCard color="#667eea">
                    <CardContent sx={{ textAlign: 'center', p: 3 }}>
                      <Avatar sx={{ 
                        width: 60, 
                        height: 60, 
                        margin: '0 auto 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                        <GroupsIcon sx={{ fontSize: '2rem' }} />
                      </Avatar>
                      <Typography variant="h3" sx={{ fontWeight: 800, color: '#667eea', mb: 1 }}>
                        {totalStats.total}
                      </Typography>
                      <Typography variant="body1" color="text.secondary" fontWeight={600}>
                        סה"כ ילדים
                      </Typography>
                    </CardContent>
                  </StatsCard>
                </Zoom>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            <Stack direction="row" spacing={3} alignItems="center">
              <TextField
                size="medium"
                placeholder="🔍 חיפוש ילד..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '20px',
                    background: 'rgba(255,255,255,0.8)',
                    backdropFilter: 'blur(10px)',
                  }
                }}
              />
              
              <ToggleButtonGroup
                value={filterMode}
                exclusive
                onChange={(e, newValue) => newValue && setFilterMode(newValue)}
                sx={{
                  '& .MuiToggleButton-root': {
                    borderRadius: '12px',
                    margin: '0 4px',
                    fontWeight: 600,
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                    }
                  }
                }}
              >
                <ToggleButton value="all">🌟 הכל</ToggleButton>
                <ToggleButton value="present">✅ נוכחים</ToggleButton>
                <ToggleButton value="absent">❌ נעדרים</ToggleButton>
                <ToggleButton value="unknown">❓ לא סומן</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* Save Changes Button */}
            {hasUnsavedChanges && (
              <Slide direction="up" in timeout={500}>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <GlowingButton
                    size="large"
                    startIcon={savingAttendance ? <LinearProgress size={24} /> : <SaveIcon />}
                    onClick={saveAllAttendanceChanges}
                    disabled={savingAttendance}
                    glowColor="#ef4444"
                    sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
                  >
                    {savingAttendance ? "שומר נתונים..." : `שמור ${Object.keys(attendanceUpdates).length} שינויים`}
                  </GlowingButton>
                </Box>
              </Slide>
            )}
          </Box>
          
          {/* Loading Bar */}
          {isLoading && (
            <LinearProgress 
              sx={{ 
                height: 4,
                background: 'linear-gradient(90deg, #667eea, #764ba2)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #10b981, #34d399)'
                }
              }} 
            />
          )}
          
          {/* Classes Grid */}
          <CardContent sx={{ p: 4 }}>
            {classesData.length > 0 ? (
              <Grid container spacing={4}>
                {classesData.map((classData, index) => (
                  <Grid item size={{sx:12 ,lg:6}}  key={classData.classId}>
                    <Zoom in timeout={1000 + index * 200}>
                      <ClassCard 
                        hasChanges={classData.allKids.some(kid => kid.hasLocalChanges)}
                        hasAbsent={classData.stats.absent > 0}
                      >
                        <CardContent sx={{ p: 3 }}>
                          {/* Class Header */}
                          <Box 
                            className="class-header"
                            sx={{ 
                              p: 3, 
                              mx: -3, 
                              mt: -3, 
                              mb: 3,
                              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
                              borderRadius: '20px 20px 0 0',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Stack direction="row" spacing={3} alignItems="center" mb={2}>
                              <Avatar sx={{ 
                                width: 60, 
                                height: 60,
                                fontSize: '2rem',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
                              }}>
                                {classData.icon || '🎓'}
                              </Avatar>
                              <Box flex={1}>
                                <Typography variant="h5" fontWeight="bold" mb={1}>
                                  {classData.className}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  👩‍🏫 גננת: {classData.teacherName || 'לא מוגדר'}
                                </Typography>
                              </Box>
                              
                              {/* Status Badges */}
                              <Stack spacing={1}>
                                {classData.allKids.some(kid => kid.hasLocalChanges) && (
                                  <AnimatedChip 
                                    icon={<AwesomeIcon />}
                                    label="יש שינויים"
                                    color="warning"
                                    size="small"
                                  />
                                )}
                                {classData.stats.absent > 0 && (
                                  <AnimatedChip 
                                    icon={<WarningIcon />}
                                    label={`${classData.stats.absent} נעדרים`}
                                    color="error"
                                    size="small"
                                  />
                                )}
                              </Stack>
                            </Stack>

                            {/* Mini Stats */}
                            <Grid container spacing={2}>
                              <Grid item size={{xs:3}}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="success.main" fontWeight="bold">
                                    {classData.stats.present}
                                  </Typography>
                                  <Typography variant="caption">✅ נוכחים</Typography>
                                </Box>
                              </Grid>
                              <Grid item size={{xs:3}}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="error.main" fontWeight="bold">
                                    {classData.stats.absent}
                                  </Typography>
                                  <Typography variant="caption">❌ נעדרים</Typography>
                                </Box>
                              </Grid>
                              <Grid item size={{xs:3}}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="warning.main" fontWeight="bold">
                                    {classData.stats.unknown}
                                  </Typography>
                                  <Typography variant="caption">❓ לא סומן</Typography>
                                </Box>
                              </Grid>
                              <Grid item size={{xs:3}}>
                                <Box textAlign="center">
                                  <Typography variant="h6" color="primary.main" fontWeight="bold">
                                    {classData.stats.total}
                                  </Typography>
                                  <Typography variant="caption">👥 סה"כ</Typography>
                                </Box>
                              </Grid>
                            </Grid>
                          </Box>

                          {/* Magical Kids Grid */}
                          {classData.kids.length > 0 ? (
                            <Grid container spacing={2} mb={3}>
                              {classData.kids.map((kid, kidIndex) => (
                                <Grid item key={kid.id}>
                                  <Zoom in timeout={1200 + kidIndex * 100}>
                                    <Tooltip 
                                      title={
                                        <Box sx={{ p: 1 }}>
                                          <Typography variant="body2" fontWeight="bold">
                                            {kid.firstName} {kid.lastName}
                                          </Typography>
                                          <Typography variant="caption" display="block">
                                            {kid.isPresent === true ? '✅ נוכח' : 
                                             kid.isPresent === false ? '❌ נעדר' : '❓ לא סומן'}
                                          </Typography>
                                          {kid.hasLocalChanges && (
                                            <Typography variant="caption" display="block" sx={{ color: 'warning.main' }}>
                                              ⚡ שינוי זמני - לא נשמר
                                            </Typography>
                                          )}
                                          <Typography variant="caption" display="block" sx={{ mt: 1, fontStyle: 'italic' }}>
                                            🖱️ לחץ לפרטים נוספים
                                          </Typography>
                                        </Box>
                                      }
                                      arrow
                                    >
                                      <FloatingAvatar
                                        status={kid.isPresent}
                                        onClick={() => handleKidClick(kid)}
                                        sx={{
                                          width: 50,
                                          height: 50,
                                          fontSize: '1rem',
                                          border: kid.hasLocalChanges ? '3px solid #f59e0b' : '3px solid rgba(255,255,255,0.8)',
                                        }}
                                        src={
                                          kid.photoPath
                                            ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}`
                                            : ''
                                        }
                                        alt={`${kid.firstName} ${kid.lastName}`}
                                      >
                                        {!kid.photoPath && (
                                          <>
                                            {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                                          </>
                                        )}
                                      </FloatingAvatar>
                                    </Tooltip>
                                  </Zoom>
                                </Grid>
                              ))}
                            </Grid>
                          ) : (
                            <Alert 
                              severity="info" 
                              sx={{ 
                                mb: 3,
                                borderRadius: '16px',
                                background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)'
                              }}
                            >
                              🔍 אין ילדים פעילים בכיתה זו או שהמסנן לא מציג תוצאות
                            </Alert>
                          )}

                          {/* Action Buttons */}
                          <Stack direction="row" spacing={2} justifyContent="space-between">
                            <GlowingButton
                              size="small"
                              onClick={() => setShowClassDetails(prev => ({
                                ...prev,
                                [classData.classId]: !prev[classData.classId]
                              }))}
                              glowColor="#667eea"
                            >
                              {showClassDetails[classData.classId] ? '🔼 הסתר פרטים' : '🔽 הצג פרטים'}
                            </GlowingButton>
                            
                           
                          </Stack>

                          {/* Expanded Details */}
                          <Collapse in={showClassDetails[classData.classId]}>
                            <Divider sx={{ my: 3 }} />
                            <List>
                              {classData.allKids.map(kid => (
                                <Fade in timeout={500} key={kid.id}>
                                  <ListItem 
                                    sx={{
                                      borderRadius: '12px',
                                      mb: 1,
                                      background: kid.hasLocalChanges ? 'rgba(245, 158, 11, 0.1)' : 'transparent',
                                      border: kid.hasLocalChanges ? '1px solid #f59e0b' : 'none'
                                    }}
                                    secondaryAction={
                                      <Switch
                                        checked={kid.isPresent === true}
                                        onChange={() => handleQuickAttendanceToggle(kid.id, kid.isPresent)}
                                        color="success"
                                        size="medium"
                                      />
                                    }
                                  >
                                    <ListItemAvatar>
                                      <FloatingAvatar 
                                        status={kid.isPresent}
                                        sx={{ width: 40, height: 40 }}
                                        src={
                                          kid.photoPath
                                            ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photoPath)}`
                                            : ''
                                        }
                                        alt={`${kid.firstName} ${kid.lastName}`}
                                      >
                                        {!kid.photoPath && (
                                          <>
                                            {`${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                                          </>
                                        )}
                                      </FloatingAvatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                      primary={
                                        <Typography variant="body1" fontWeight={600}>
                                          {kid.firstName} {kid.lastName}
                                        </Typography>
                                      }
                                      secondary={
                                        <Stack>
                                          <Typography variant="caption">
                                            {kid.isPresent === true ? '✅ נוכח' : 
                                             kid.isPresent === false ? '❌ נעדר' : '❓ לא סומן'}
                                          </Typography>
                                          {kid.hasLocalChanges && (
                                            <Typography variant="caption" sx={{ color: 'warning.main', fontWeight: 600 }}>
                                              ⚡ שינוי זמני - טרם נשמר
                                            </Typography>
                                          )}
                                        </Stack>
                                      }
                                    />
                                  </ListItem>
                                </Fade>
                              ))}
                            </List>
                          </Collapse>
                        </CardContent>
                      </ClassCard>
                    </Zoom>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert 
                severity="info"
                sx={{
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.05) 100%)',
                  border: '1px solid rgba(33,150,243,0.2)'
                }}
              >
                🔍 לא נמצאו כיתות או שהמסנן לא מציג תוצאות
              </Alert>
            )}
          </CardContent>
        </MainCard>
      </Fade>

      {/* Magical Kid Details Dialog */}
      <Dialog 
        open={kidDetailsDialog.open} 
        onClose={() => setKidDetailsDialog({ open: false, kid: null })}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 4 }}>
          <Stack direction="row" spacing={3} alignItems="center" justifyContent="center">
            <FloatingAvatar
              status={kidDetailsDialog.kid?.isPresent}
              sx={{ width: 80, height: 80, fontSize: '2rem' }}
              src={
                kidDetailsDialog.kid?.photoPath
                  ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kidDetailsDialog.kid.photoPath)}`
                  : ''
              }
              alt={`${kidDetailsDialog.kid?.firstName} ${kidDetailsDialog.kid?.lastName}`}
            >
              {!kidDetailsDialog.kid?.photoPath && (
                <>
                  {`${kidDetailsDialog.kid?.firstName?.[0] || ''}${kidDetailsDialog.kid?.lastName?.[0] || ''}`}
                </>
              )}
            </FloatingAvatar>
            <Box>
              <Typography variant="h5" fontWeight="bold">
                {kidDetailsDialog.kid?.firstName} {kidDetailsDialog.kid?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                👶 פרטי ילד
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        
        <DialogContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            {/* Contact Information */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(102,126,234,0.05) 100%)',
                border: '1px solid rgba(102,126,234,0.2)'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#667eea' }}>
                📞 פרטי קשר להורים
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <PhoneIcon color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  {kidDetailsDialog.kid?.parentPhone || 'לא זמין'}
                </Typography>
                {kidDetailsDialog.kid?.parentPhone && (
                  <GlowingButton
                    size="small"
                    startIcon={<CallIcon />}
                    onClick={() => window.open(`tel:${kidDetailsDialog.kid.parentPhone}`)}
                    glowColor="#10b981"
                  >
                    📞 חייג כעת
                  </GlowingButton>
                )}
              </Stack>
            </Paper>
            
            {/* Class Information */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(16,185,129,0.05) 100%)',
                border: '1px solid rgba(16,185,129,0.2)'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#10b981' }}>
                🏫 פרטי כיתה
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {classesData.find(c => c.classId === kidDetailsDialog.kid?.classId)?.className || 'לא זמין'}
              </Typography>
            </Paper>
            
            {/* Attendance Status */}
            <Paper 
              elevation={2} 
              sx={{ 
                p: 3, 
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)',
                border: '1px solid rgba(245,158,11,0.2)'
              }}
            >
              <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ color: '#f59e0b' }}>
                📊 מצב נוכחות היום
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box>
                  {kidDetailsDialog.kid?.isPresent === true ? '✅' : 
                   kidDetailsDialog.kid?.isPresent === false ? '❌' : '❓'}
                </Box>
                <Typography variant="body1" fontWeight={600}>
                  {kidDetailsDialog.kid?.isPresent === true ? 'נוכח' : 
                   kidDetailsDialog.kid?.isPresent === false ? 'נעדר' : 'לא סומן'}
                </Typography>
                {kidDetailsDialog.kid?.hasLocalChanges && (
                  <AnimatedChip 
                    label="⚡ שינוי זמני"
                    color="warning"
                    size="small"
                  />
                )}
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ p: 4, justifyContent: 'space-between' }}>
          <GlowingButton
            onClick={() => setKidDetailsDialog({ open: false, kid: null })}
            glowColor="#6b7280"
          >
            ❌ סגור
          </GlowingButton>
          <GlowingButton
            startIcon={<PersonIcon />}
            onClick={() => {
              onKidClick(kidDetailsDialog.kid.id);
              setKidDetailsDialog({ open: false, kid: null });
            }}
            glowColor="#667eea"
          >
            👤 עבור לתיק הילד
          </GlowingButton>
        </DialogActions>
      </Dialog>

      {/* Magical Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{
          '& .MuiSnackbarContent-root': {
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            fontWeight: 600,
          }
        }}
      />
    </GradientContainer>
  );
};

export default ClassroomsSection;