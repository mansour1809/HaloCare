// src/pages/kids/KidsManagement.jsx - גרסה משופרת
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Avatar, Button, IconButton, TextField, InputAdornment,
  CircularProgress, Alert, Chip, Breadcrumbs, FormControl, InputLabel, 
  Select, MenuItem, Switch, Dialog, DialogTitle, DialogContent, DialogActions,
  Tabs, Tab, Tooltip, Card, CardContent, Grid, LinearProgress, Fab
} from '@mui/material';
import { 
  Add as AddIcon, Search as SearchIcon, Visibility as VisibilityIcon,
  Home as HomeIcon, Group as GroupIcon, FilterList as FilterIcon,
  Refresh as RefreshIcon, ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon
} from '@mui/icons-material';
import { fetchKids } from '../../Redux/features/kidsSlice';
import { fetchIntakeProcesses } from '../../Redux/features/intakeProcessSlice';
import axios from 'axios';
import Swal from 'sweetalert2';
import { fetchDocumentsByKidId, clearDocuments } from '../../Redux/features/documentsSlice';
import FilesList from '../../components/common/FilesList';
import FileUploader from '../../components/common/FileUploader';
import IntakeStatusBadge from '../../components/kids/IntakeStatusBadge';
import IntakeActionButtons from '../../components/kids/IntakeActionButtons';
import { intakeProcessService } from '../../services/intakeProcessService';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { baseURL } from "../../components/common/axiosConfig";

const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          textAlign: 'center',
        },
      },
    },
  },
});

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Redux state
  const { kids, status, error } = useSelector(state => state.kids);
  const { processes } = useSelector(state => state.intakeProcess);
  const documentsStatus = useSelector(state => state.documents.status);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedKidForDocuments, setSelectedKidForDocuments] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  
  // רשימת הכיתות הייחודיות
  const classes = [...new Set(kids.map(kid => kid.classId).filter(Boolean))];
  
  // טעינת נתונים
  useEffect(() => {
    dispatch(fetchKids());
    dispatch(fetchIntakeProcesses());
  }, [dispatch]);
  
  // יצירת מפה של תהליכי קליטה לפי kidId
  const processesMap = React.useMemo(() => {
    const map = {};
    processes.forEach(process => {
      map[process.kidId] = process;
    });
    return map;
  }, [processes]);
  
  // פילטור הילדים המתקדם
  const filteredKids = kids.filter(kid => {
    const process = processesMap[kid.id];
    
    // סינון לפי חיפוש
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm ? true : 
      (kid.firstName && kid.firstName.toLowerCase().includes(searchLower)) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchLower)) ||
      (kid.gender && kid.gender.toLowerCase().includes(searchLower));
    
    // סינון לפי כיתה
    const classMatch = !classFilter ? true : kid.classId === classFilter;
    
    // סינון לפי סטטוס קליטה
    const statusMatch = !statusFilter ? true : 
      (process ? process.status === statusFilter : statusFilter === 'NOT_STARTED');
    
    return searchMatch && classMatch && statusMatch;
  });
  
  // רענון נתונים
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchKids()),
        dispatch(fetchIntakeProcesses())
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // טיפול בפעולות תהליך קליטה
  const handleIntakeAction = async (action, kidId) => {
    try {
      switch (action) {
        case 'start':
          await intakeProcessService.startProcess(kidId);
          Swal.fire({
            icon: 'success',
            title: 'תהליך קליטה החל בהצלחה',
            timer: 2000
          });
          navigate(`/kids/intake/${kidId}`);
          break;
          
        case 'continue':
          navigate(`/kids/intake/${kidId}`);
          break;
          
        case 'view':
          navigate(`/kids/${kidId}`);
          break;
          
        case 'remind':
          // כאן תוסיף לוגיקה לשליחת תזכורת
          Swal.fire({
            icon: 'info',
            title: 'שליחת תזכורת',
            text: 'תזכורת נשלחה להורים'
          });
          break;
          
        case 'pause':
          await intakeProcessService.updateStatus(kidId, 'PAUSED');
          break;
          
        case 'resume':
          await intakeProcessService.updateStatus(kidId, 'IN_PROGRESS');
          break;
          
        case 'edit':
          navigate(`/kids/intake/${kidId}`);
          break;
          
        case 'fill-instead':
          navigate(`/kids/intake/${kidId}`);
          break;
      }
      
      // רענון הנתונים אחרי פעולה
      dispatch(fetchIntakeProcesses());
      
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה',
        text: error.message || 'אירעה שגיאה בביצוע הפעולה'
      });
    }
  };
  
  // חישוב גיל
  const calculateAge = (birthDateString) => {
    if (!birthDateString) return '–';
    const birthDate = new Date(birthDateString);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    const days = today.getDate() - birthDate.getDate();

    if (months < 0 || (months === 0 && days < 0)) {
      years--;
      months += 12;
    }

    const age = years + months / 12;
    return age.toFixed(1);
  };
  
  // טיפול בשינוי סטטוס פעיל/לא פעיל
  const handleToggleActive = async (kidId, currentStatus) => {
    try {
      const result = await Swal.fire({
        icon: 'question',
        title: `האם אתה בטוח שברצונך ${currentStatus ? 'להשבית' : 'להפעיל'} את הילד?`,
        text: `הילד יהיה ${currentStatus ? 'לא פעיל' : 'פעיל'} במערכת`,
        showCancelButton: true,
        confirmButtonText: 'כן, בצע שינוי',
        cancelButtonText: 'ביטול',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
      if (!result.isConfirmed) return;
      
      await axios.patch(`/Kids/${kidId}/deactivate`, {
        isActive: !currentStatus,
      });
      
      dispatch(fetchKids());
      
      Swal.fire({
        icon: 'success',
        title: 'הסטטוס עודכן בהצלחה!',
        timer: 2000
      });
      
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'שגיאה בעדכון סטטוס הילד'
      });
    }
  };
  
  // פתיחת דיאלוג מסמכים
  const handleOpenDocuments = (kid) => {
    setSelectedKidForDocuments(kid);
    setDocumentsDialogOpen(true);
    dispatch(fetchDocumentsByKidId(kid.id));
  };
  
  // סגירת דיאלוג מסמכים
  const handleCloseDocuments = () => {
    setActiveTab(0);
    dispatch(clearDocuments());
    setDocumentsDialogOpen(false);
    setSelectedKidForDocuments(null);
  };
  
  // רנדור תצוגת כרטיסיות
 const renderCardsView = () => (
    <Grid container spacing={3}>
      {filteredKids.map((kid) => {
        const process = processesMap[kid.id];
        return (
          <Grid item xs={12} sm={6} md={4} key={kid.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                    alt={`${kid.firstName} ${kid.lastName}`}
                    sx={{ width: 60, height: 60, ml: 2 }}
                  >
                    {!kid.photo && `${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h3">
                      {`${kid.firstName || ""} ${kid.lastName || ""}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      גיל: {calculateAge(kid.birthDate)} | 
                      {kid.gender === 'male' ? ' זכר' : kid.gender === 'female' ? ' נקבה' : ' –'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      כיתה: {kid.classId || "–"} | הורה: {kid.parentName1 || "–"}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <IntakeStatusBadge 
                    status={process?.status || 'IN_PROGRESS'} // ברירת מחדל IN_PROGRESS
                    percentage={process?.completionPercentage || 20} // ברירת מחדל 20%
                  />
                </Box>
                
                {(process?.completionPercentage || 20) > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      התקדמות: {process?.completionPercentage || 20}%
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={process?.completionPercentage || 20} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {/* כפתור צפייה בפרופיל */}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => navigate(`/kids/${kid.id}`)}
                    sx={{ minWidth: 'auto' }}
                  >
                    פרופיל
                  </Button>
                  
                  <IntakeActionButtons
                    kidId={kid.id}
                    status={process?.status || 'IN_PROGRESS'} // ברירת מחדל IN_PROGRESS
                    onAction={handleIntakeAction}
                    compact={false}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
  
  // רנדור תצוגת טבלה משופרת
  const renderTableView = () => (
    <TableContainer
      component={Paper}
      sx={{
        maxWidth: "100%",
        mb: 4,
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              שם מלא
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              גיל
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              מגדר
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              כיתה
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              הורה ראשי
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              טלפון
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              סטטוס קליטה
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              התקדמות
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              פעיל
            </TableCell>
            <TableCell sx={{ fontWeight: "700", fontSize: "1rem" }}>
              פעולות
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredKids.length > 0 ? (
            filteredKids.map((kid) => {
              const process = processesMap[kid.id];
              return (
                <TableRow
                  key={kid.id}
                  sx={{
                    "&:hover": { backgroundColor: "#f5f9fa" },
                    borderBottom: "1px solid #eee",
                  }}
                >
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar
                        src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                        alt={`${kid.firstName} ${kid.lastName}`}
                        sx={{
                          width: 40,
                          height: 40,
                          ml: 1,
                          border: "2px solid #fff",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }}
                      >
                        {!kid.photo && `${kid.firstName?.[0] || ''}${kid.lastName?.[0] || ''}`}
                      </Avatar>
                      <Typography sx={{ fontWeight: "medium" }}>
                        {`${kid.firstName || ""} ${kid.lastName || ""}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{calculateAge(kid.birthDate)}</TableCell>
                  <TableCell>
                    {kid.gender ? (
                      <Chip
                        label={kid.gender === 'male' ? 'זכר' : 'נקבה'}
                        sx={{
                          backgroundColor: kid.gender === 'male' ? '#e3f2fd' : '#fce4ec',
                          color: kid.gender === 'male' ? '#1976d2' : '#c2185b',
                          fontWeight: "medium",
                          fontSize: '0.75rem'
                        }}
                        size="small"
                      />
                    ) : (
                      "–"
                    )}
                  </TableCell>
                  <TableCell>{kid.classId || "–"}</TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {kid.parentName1 || '–'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {kid.parentPhone1 || '–'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <IntakeStatusBadge 
                      status={process?.status || 'IN_PROGRESS'} // ברירת מחדל IN_PROGRESS
                      percentage={process?.completionPercentage || 20} // ברירת מחדל 20%
                    />
                  </TableCell>
                  <TableCell>
                    {(process?.completionPercentage || 20) > 0 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={process?.completionPercentage || 20} 
                          sx={{ width: 100, height: 6, borderRadius: 3 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {process?.completionPercentage || 20}%
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">–</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={Boolean(kid.isActive)}
                      onChange={() => handleToggleActive(kid.id, kid.isActive)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {/* כפתור צפייה בפרופיל */}
                      <Tooltip title="צפייה בפרופיל הילד">
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/kids/${kid.id}`)}
                          sx={{
                            backgroundColor: '#4caf50',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#388e3c',
                            }
                          }}
                        >
                          <VisibilityIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      
                      {/* כפתורי פעולות תהליך קליטה */}
                      <IntakeActionButtons
                        kidId={kid.id}
                        status={process?.status || 'IN_PROGRESS'} // ברירת מחדל IN_PROGRESS
                        onAction={handleIntakeAction}
                        compact={true}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                <Typography color="text.secondary">
                  לא נמצאו ילדים המתאימים לקריטריונים
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
 
 return (
   <ThemeProvider theme={theme}>
     <Box sx={{ p: 3 }} dir="rtl">
       {/* Breadcrumbs */}
       <Breadcrumbs sx={{ mb: 2 }}>
         <Link
           underline="hover"
           sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
           color="inherit"
           onClick={() => navigate('/')}
         >
           <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
           ראשי
         </Link>
         <Typography color="text.primary" sx={{ fontWeight: 'medium', display: 'flex', alignItems: 'center' }}>
           <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
           ניהול ילדים
         </Typography>
       </Breadcrumbs>
       
       {/* כותרת ופעולות עליונות */}
       <Paper sx={{ p: 3, mb: 3, borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
         <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
           <Box>
             <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3', mb: 1 }}>
               ניהול ילדים
             </Typography>
             <Typography variant="body1" color="text.secondary">
               מעקב אחר תהליכי קליטה וניהול פרטי ילדים במערכת
             </Typography>
           </Box>
           
           <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
             {/* כפתור רענון */}
             <Tooltip title="רענון נתונים">
               <IconButton 
                 onClick={handleRefresh} 
                 disabled={refreshing}
                 sx={{ 
                   backgroundColor: '#f5f5f5',
                   '&:hover': { backgroundColor: '#e0e0e0' }
                 }}
               >
                 <RefreshIcon sx={{ 
                   animation: refreshing ? 'spin 1s linear infinite' : 'none',
                   '@keyframes spin': {
                     '0%': { transform: 'rotate(0deg)' },
                     '100%': { transform: 'rotate(360deg)' },
                   }
                 }} />
               </IconButton>
             </Tooltip>
             
             {/* מתג תצוגה */}
             <Box sx={{ display: 'flex', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
               <IconButton
                 onClick={() => setViewMode('table')}
                 sx={{
                   backgroundColor: viewMode === 'table' ? '#4cb5c3' : 'transparent',
                   color: viewMode === 'table' ? 'white' : '#666',
                   borderRadius: 0,
                   '&:hover': {
                     backgroundColor: viewMode === 'table' ? '#3da1af' : '#f5f5f5'
                   }
                 }}
               >
                 <ViewListIcon />
               </IconButton>
               <IconButton
                 onClick={() => setViewMode('cards')}
                 sx={{
                   backgroundColor: viewMode === 'cards' ? '#4cb5c3' : 'transparent',
                   color: viewMode === 'cards' ? 'white' : '#666',
                   borderRadius: 0,
                   '&:hover': {
                     backgroundColor: viewMode === 'cards' ? '#3da1af' : '#f5f5f5'
                   }
                 }}
               >
                 <ViewModuleIcon />
               </IconButton>
             </Box>
           </Box>
         </Box>
         
         {/* סרגל חיפוש וסינון */}
         <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
           {/* חיפוש חופשי */}
           <TextField
             variant="outlined"
             size="small"
             placeholder="חיפוש לפי שם ילד..."
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
           
           {/* סינון לפי סטטוס קליטה */}
           <FormControl sx={{ minWidth: 200 }} size="small">
             <InputLabel>סטטוס קליטה</InputLabel>
             <Select
               value={statusFilter}
               onChange={(e) => setStatusFilter(e.target.value)}
               label="סטטוס קליטה"
             >
               <MenuItem value="">הכל</MenuItem>
               <MenuItem value="NOT_STARTED">לא התחיל</MenuItem>
               <MenuItem value="IN_PROGRESS">בתהליך</MenuItem>
               <MenuItem value="PENDING_PARENTS">אצל הורים</MenuItem>
               <MenuItem value="COMPLETED">הושלם</MenuItem>
               <MenuItem value="PAUSED">מושהה</MenuItem>
             </Select>
           </FormControl>
           
           {/* סינון לפי כיתה */}
           <FormControl sx={{ minWidth: 150 }} size="small">
             <InputLabel>כיתה</InputLabel>
             <Select
               value={classFilter}
               onChange={(e) => setClassFilter(e.target.value)}
               label="כיתה"
             >
               <MenuItem value="">הכל</MenuItem>
               {classes.map((classId) => (
                 <MenuItem key={classId} value={classId}>
                   כיתה {classId}
                 </MenuItem>
               ))}
             </Select>
           </FormControl>
           
           {/* כפתור איפוס סינונים */}
           {(searchTerm || statusFilter || classFilter) && (
             <Button
               variant="outlined"
               size="small"
               onClick={() => {
                 setSearchTerm('');
                 setStatusFilter('');
                 setClassFilter('');
               }}
               startIcon={<FilterIcon />}
             >
               נקה סינונים
             </Button>
           )}
           
           <Box sx={{ flexGrow: 1 }} />
           
           {/* כפתור הוספת ילד */}
           <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={() => navigate('/kids/add')}
             sx={{
               fontWeight: "medium",
               backgroundColor: "#4cb5c3",
               "&:hover": {
                 backgroundColor: "#3da1af",
               },
               borderRadius: '8px',
               px: 3
             }}
           >
             הוספת ילד חדש
           </Button>
         </Box>
       </Paper>
       
       {/* סטטיסטיקות מהירות */}
       <Grid container spacing={2} sx={{ mb: 3 }}>
         <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ textAlign: 'center', p: 2 }}>
             <Typography variant="h3" color="primary" fontWeight="bold">
               {kids.length}
             </Typography>
             <Typography variant="body2" color="text.secondary">
               סה"כ ילדים
             </Typography>
           </Card>
         </Grid>
         <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ textAlign: 'center', p: 2 }}>
             <Typography variant="h3" color="success.main" fontWeight="bold">
               {processes.filter(p => p.status === 'COMPLETED').length}
             </Typography>
             <Typography variant="body2" color="text.secondary">
               קליטה הושלמה
             </Typography>
           </Card>
         </Grid>
         <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ textAlign: 'center', p: 2 }}>
             <Typography variant="h3" color="warning.main" fontWeight="bold">
               {processes.filter(p => p.status === 'IN_PROGRESS').length}
             </Typography>
             <Typography variant="body2" color="text.secondary">
               בתהליך קליטה
             </Typography>
           </Card>
         </Grid>
         <Grid item xs={12} sm={6} md={3}>
           <Card sx={{ textAlign: 'center', p: 2 }}>
             <Typography variant="h3" color="info.main" fontWeight="bold">
               {processes.filter(p => p.status === 'PENDING_PARENTS').length}
             </Typography>
             <Typography variant="body2" color="text.secondary">
               אצל הורים
             </Typography>
           </Card>
         </Grid>
       </Grid>
       
       {/* הודעות שגיאה */}
       {(error || localError) && (
         <Alert severity="error" sx={{ mb: 2 }}>
           {error || localError}
         </Alert>
       )}
       
       {/* מצב טעינה */}
       {status === 'loading' && !kids.length && (
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
           <CircularProgress size={60} />
         </Box>
       )}
       
       {/* תצוגת תוכן */}
       {viewMode === 'table' ? renderTableView() : renderCardsView()}
       
       {/* כפתור צף להוספת ילד */}
       <Fab
         color="primary"
         aria-label="add"
         onClick={() => navigate('/kids/add')}
         sx={{
           position: 'fixed',
           bottom: 24,
           left: 24,
           backgroundColor: '#4cb5c3',
           '&:hover': {
             backgroundColor: '#3da1af'
           }
         }}
       >
         <AddIcon />
       </Fab>
       
       {/* דיאלוג מסמכי ילד */}
       <Dialog
         open={documentsDialogOpen}
         onClose={handleCloseDocuments}
         fullWidth
         maxWidth="md"
         dir="rtl"
         PaperProps={{
           sx: { borderRadius: "12px" },
         }}
       >
         <DialogTitle
           sx={{
             backgroundColor: "#f8f9fa",
             fontWeight: "bold",
             borderBottom: "1px solid #eee",
             fontSize: "1.5rem",
             color: "#4cb5c3",
             display: "flex",
             alignItems: "center",
             justifyContent: "space-between",
           }}
         >
           <Box>
             מסמכי ילד: {selectedKidForDocuments?.firstName}{" "}
             {selectedKidForDocuments?.lastName}
           </Box>
           <IconButton onClick={handleCloseDocuments} size="small">
             <div style={{ fontSize: "1.5rem" }}>&times;</div>
           </IconButton>
         </DialogTitle>
         <DialogContent sx={{ p: 0 }}>
           <Tabs
             value={activeTab}
             onChange={(e, newValue) => setActiveTab(newValue)}
             variant="fullWidth"
             sx={{ borderBottom: 1, borderColor: "divider" }}
           >
             <Tab label="רשימת מסמכים" value={0} />
             <Tab label="העלאת מסמך חדש" value={1} />
           </Tabs>
           
           <Box sx={{ p: 3 }}>
             {activeTab === 0 ? (
               <>
                 {documentsStatus === "loading" ? (
                   <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                     <CircularProgress />
                   </Box>
                 ) : (
                   <FilesList
                     entityId={selectedKidForDocuments?.id}
                     entityType="kid"
                     closeDialog={() => setDocumentsDialogOpen(false)}
                     openDialog={() => setDocumentsDialogOpen(true)}
                   />
                 )}
               </>
             ) : (
               <FileUploader
                 entityId={selectedKidForDocuments?.id}
                 entityType="kid"
                 docType="document"
                 buttonText="בחר מסמך להעלאה"
                 onSuccess={() => {
                   setActiveTab(0);
                   dispatch(fetchDocumentsByKidId(selectedKidForDocuments?.id));
                 }}
                 closeDialog={() => setDocumentsDialogOpen(false)}
                 openDialog={() => setDocumentsDialogOpen(true)}
               />
             )}
           </Box>
         </DialogContent>
         <DialogActions sx={{ padding: 2, borderTop: "1px solid #eee" }}>
           <Button
             onClick={handleCloseDocuments}
             variant="contained"
             sx={{
               backgroundColor: "#4cb5c3",
               "&:hover": {
                 backgroundColor: "#3da1af",
               },
               borderRadius: 2,
             }}
           >
             סגור
           </Button>
         </DialogActions>
       </Dialog>
     </Box>
   </ThemeProvider>
 );
};

export default KidsManagement;