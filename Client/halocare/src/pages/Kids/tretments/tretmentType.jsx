// TreatmentSummariesPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Avatar,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Breadcrumbs,
  Link,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Chip
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  NavigateNext as NavigateNextIcon,
  NavigateBefore as NavigateBeforeIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon  // הוספת ייבוא חסר
} from '@mui/icons-material';
//  import axios from 'axios';
//  import { API_BASE_URL } from '../../config';

// קומפוננטה לצפייה בסיכום טיפול
const TretmentType = ({ open, handleClose, treatment }) => {
  if (!treatment) return null;
console.log("hello")
  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          סיכום טיפול
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>סוג הטיפול</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              {treatment.type}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>תאריך הטיפול</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              {treatment.date}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>שם הטיפול</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              {treatment.title}
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>מטפל/ת</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', display: 'flex', alignItems: 'center', gap: 1 }}>
              {treatment.therapist && (
                <>
                  <Avatar
                    src={treatment.therapist.photo}
                    alt={treatment.therapist.name}
                    sx={{ width: 24, height: 24 }}
                  />
                  <Typography>{treatment.therapist.name}</Typography>
                </>
              )}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>תיאור מהלך הטיפול</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100px' }}>
              {treatment.content}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>המלצות להמשך</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100px' }}>
              {treatment.recommendations || 'אין המלצות להמשך.'}
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>היילייט לתש"ה</Typography>
            <Paper variant="outlined" sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              {treatment.highlight || 'אין היילייט לתש"ה.'}
            </Paper>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          color="primary"
        >
          סגור
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => {
            handleClose();
            // פה יש להוסיף פונקציונליות עריכה
          }}
        >
          ערוך
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// קומפוננטה להוספת סיכום טיפול חדש
const AddTreatmentDialog = ({ open, handleClose, onSave, kidId }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    content: '',
    recommendations: '',
    highlight: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // בפועל כאן תהיה קריאת API לשמירת הנתונים
      // const response = await axios.post(`${API_BASE_URL}/treatments`, {
      //   ...formData,
      //   kidId: kidId,
      //   date: new Date().toISOString().split('T')[0]
      // });
      
      // דימוי קריאת API
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newTreatment = {
        id: Math.floor(Math.random() * 1000),
        ...formData,
        date: new Date().toISOString().split('T')[0],
        therapist: {
          id: 1,
          name: 'משה כהן',
          photo: '/avatar.jpg'
        }
      };
      
      onSave(newTreatment);
      handleClose();
      
      // איפוס הטופס
      setFormData({
        title: '',
        type: '',
        content: '',
        recommendations: '',
        highlight: ''
      });
    } catch (error) {
      console.error('Error saving treatment:', error);
      // כאן אפשר להוסיף הצגת הודעת שגיאה למשתמש
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #e0e0e0',
        pb: 2
      }}>
        <Typography variant="h6" component="div">
          הוספת סיכום טיפול
        </Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 3, mt: 2 }}>
        <Grid container spacing={3}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel id="treatment-type-label">סוג הטיפול</InputLabel>
              <Select
                labelId="treatment-type-label"
                name="type"
                value={formData.type}
                onChange={handleChange}
                label="סוג הטיפול"
                required
              >
                <MenuItem value="פיזיותרפיה">פיזיותרפיה</MenuItem>
                <MenuItem value="ריפוי בעיסוק">ריפוי בעיסוק</MenuItem>
                <MenuItem value="טיפול רגשי">טיפול רגשי</MenuItem>
                <MenuItem value="קלינאות תקשורת">קלינאות תקשורת</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              label="שם הטיפול"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="תיאור מהלך הטיפול"
              name="content"
              value={formData.content}
              onChange={handleChange}
              multiline
              rows={4}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="המלצות להמשך"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleChange}
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="היילייט לתשה\"
              name="highlight"
              value={formData.highlight}
              onChange={handleChange}
              helperText="משפט קצר שמסכם את הנקודה החשובה ביותר מהטיפול"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button 
          onClick={handleClose} 
          variant="outlined" 
          color="primary"
        >
          ביטול
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || !formData.title || !formData.type || !formData.content}
        >
          {isSubmitting ? <CircularProgress size={24} /> : 'שמור'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// דף ראשי של סיכומי טיפולים
const TreatmentSummariesPage = () => {
  const { kidId, therapyType } = useParams();
  const navigate = useNavigate();
  
  // סטייטים לניהול הנתונים והמצב
  const [kid, setKid] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTreatments: 0,
    progressPercentage: 0,
    achievedGoals: 0
  });
  
  // סטייטים לדיאלוגים
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [selectedTreatment, setSelectedTreatment] = useState(null);
  
  // סטייטים למיון ופילטור
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // טעינת נתונים
  useEffect(() => {
    const fetchData = async () => {
      try {
        // בפועל תהיה כאן קריאת API
        // const kidResponse = await axios.get(`${API_BASE_URL}/kids/${kidId}`);
        // const treatmentsResponse = await axios.get(`${API_BASE_URL}/kids/${kidId}/treatments`);
        
        // דימוי קריאת API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const kidData = {
          id: kidId || '1',
          firstName: 'דניאל',
          lastName: 'כהן',
          birthDate: '2020-05-15',
          photo: '/kid-photo.jpg',
          therapyArea: therapyType || 'פיזיותרפיה',
          lastVisit: '2023-10-13'
        };
        
        const treatmentsData = [
          { 
            id: 1, 
            title: 'עבודה עם חיות', 
            date: '2024-10-13', 
            therapist: { id: 1, name: 'משה כהן', photo: '/therapist1.jpg' },
            content: 'דניאל הראה התקדמות משמעותית בעבודה עם החיות. התמקדנו בתרגילי מוטוריקה עדינה.',
            type: 'טיפול רגשי',
            recommendations: 'להמשיך באינטראקציה עם חיות קטנות, להגביר משך המגע.',
            highlight: 'השתפר ביכולת לגעת בחיות ללא חרדה'
          },
          { 
            id: 2, 
            title: 'עבודה עם רגליים', 
            date: '2024-10-05', 
            therapist: { id: 2, name: 'מיכל לוי', photo: '/therapist2.jpg' },
            content: 'תרגלנו הליכה על קצות האצבעות והתקדמנו לתרגילי שיווי משקל מורכבים יותר.',
            type: 'פיזיותרפיה',
            recommendations: 'לתרגל שיווי משקל על כרית ביתית.',
            highlight: 'מצליח לעמוד על רגל אחת למשך 3 שניות'
          },
          { 
            id: 3, 
            title: 'ישיבה נכונה', 
            date: '2024-09-27', 
            therapist: { id: 3, name: 'יוסי אברהם', photo: '/therapist3.jpg' },
            content: 'עבדנו על יציבה נכונה בזמן ישיבה. דניאל הראה שיפור ביכולת לשמור על יציבה לאורך זמן.',
            type: 'ריפוי בעיסוק',
            recommendations: 'להקפיד על ישיבה זקופה בזמן הארוחות',
            highlight: 'מתמיד בישיבה נכונה למשך 10 דקות'
          },
          { 
            id: 4, 
            title: 'תרגילי תקשורת', 
            date: '2024-09-15', 
            therapist: { id: 4, name: 'דנה פרץ', photo: '/therapist4.jpg' },
            content: 'עבדנו על זיהוי והבעת רגשות בסיסיים. דניאל הצליח לזהות 3 מתוך 5 הבעות פנים.',
            type: 'קלינאות תקשורת',
            recommendations: 'להמשיך בזיהוי רגשות בתמונות ובסיפורים',
            highlight: 'מזהה רגשות בסיסיים בתמונות'
          }
        ];
        
        setKid(kidData);
        setTreatments(treatmentsData);
        
        setStats({
          totalTreatments: 24,
          progressPercentage: 85,
          achievedGoals: 12
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [kidId, therapyType]);
  
  // פתיחת דיאלוג צפייה בטיפול
  const handleViewTreatment = (treatment) => {
    setSelectedTreatment(treatment);
    setViewDialogOpen(true);
  };
  
  // פתיחת דיאלוג הוספת טיפול
  const handleAddTreatment = () => {
    setAddDialogOpen(true);
  };
  
  // שמירת טיפול חדש
  const handleSaveTreatment = (treatment) => {
    setTreatments([treatment, ...treatments]);
    
    // עדכון סטטיסטיקות
    setStats(prev => ({
      ...prev,
      totalTreatments: prev.totalTreatments + 1
    }));
  };
  
  // טיפול בשינוי עמוד
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  // טיפול בשינוי מספר שורות לעמוד
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // סינון טיפולים
  const filteredTreatments = treatments.filter(treatment => {
    const matchesSearch = treatment.title.includes(searchText) || 
                         treatment.content.includes(searchText) ||
                         treatment.therapist.name.includes(searchText);
    
    const matchesType = filterType === 'all' || treatment.type === filterType;
    
    return matchesSearch && matchesType;
  });
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* כותרות וניווט */}
      <Box sx={{ mb: 3 }}>
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
          <Link color="inherit" href="/kids/list" underline="hover">
            רשימת ילדים
          </Link>
          <Link color="inherit" href={`/kids/${kid.id}`} underline="hover">
            תיק ילד ({kid.firstName})
          </Link>
          <Typography color="text.primary">{kid.therapyArea}</Typography>
        </Breadcrumbs>
      </Box>
      
      {/* פרטי ילד */}
      <Paper sx={{ p: 3, mb: 3, display: 'flex', alignItems: 'center' }} elevation={2}>
        <Box sx={{ position: 'relative', mr: 2 }}>
          <Avatar 
            src={kid.photo || '/placeholder.jpg'} 
            alt={kid.firstName}
            sx={{ width: 80, height: 80 }}
          />
          {/* אפקט המעגל הירוק */}
          <Box 
            sx={{
              position: 'absolute',
              top: -10,
              left: -10,
              width: 100,
              height: 100,
              borderRadius: '50%',
              bgcolor: 'primary.light',
              zIndex: -1
            }}
          />
        </Box>
        
        <Box sx={{ ml: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
            {kid.firstName} {kid.lastName}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            תחום: {kid.therapyArea} <span style={{ margin: '0 8px' }}>•</span> ביקור אחרון: {kid.lastVisit}
          </Typography>
        </Box>
        
        <Box sx={{ ml: 'auto' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={() => {
              // רענון נתונים
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            התעדכן
          </Button>
        </Box>
      </Paper>
      
      <Grid container spacing={3}>
        {/* סטטיסטיקה */}
        <Grid item xs={12} md={3}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>סטטיסטיקה</Typography>
          
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {stats.totalTreatments}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                סה"כ טיפולים
              </Typography>
            </CardContent>
          </Card>
          
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {stats.progressPercentage}%
              </Typography>
              <Typography variant="body1" color="text.secondary">
                אחוז התקדמות
              </Typography>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                {stats.achievedGoals}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                יעדים שהושגו
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        
        {/* רשימת סיכומי טיפולים */}
        <Grid item xs={12} md={9}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>סיכומי טיפולים</Typography>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                placeholder="חיפוש"
                size="small"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 200 }}
              />
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="filter-type-label">סוג טיפול</InputLabel>
                <Select
                  labelId="filter-type-label"
                  id="filter-type"
                  value={filterType}
                  label="סוג טיפול"
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <MenuItem value="all">הכל</MenuItem>
                  <MenuItem value="פיזיותרפיה">פיזיותרפיה</MenuItem>
                  <MenuItem value="ריפוי בעיסוק">ריפוי בעיסוק</MenuItem>
                  <MenuItem value="טיפול רגשי">טיפול רגשי</MenuItem>
                  <MenuItem value="קלינאות תקשורת">קלינאות תקשורת</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                {filteredTreatments.length} רשומות
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button 
                  sx={{ 
                    color: 'primary.main', 
                    minWidth: 'auto', 
                    fontSize: '0.875rem',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  חודש אחרון
                </Button>
                <Typography sx={{ mx: 1, color: '#ccc' }}>|</Typography>
                <Button 
                  sx={{ 
                    color: 'text.secondary', 
                    minWidth: 'auto', 
                    fontSize: '0.875rem',
                    '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' }
                  }}
                >
                  3 חודשים
                </Button>
              </Box>
            </Box>
            
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleAddTreatment}
            >
              טיפול חדש
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>שם הטיפול</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>תאריך</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>מטפל</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>פעולות</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTreatments
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((treatment) => (
                    <TableRow key={treatment.id} hover>
                      <TableCell align="right">{treatment.title}</TableCell>
                      <TableCell align="right">{treatment.date}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar 
                            src={treatment.therapist.photo || '/placeholder.jpg'} 
                            alt={treatment.therapist.name}
                            sx={{ width: 30, height: 30 }}
                          />
                          <Typography>{treatment.therapist.name}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton 
                          color="primary" 
                          onClick={() => handleViewTreatment(treatment)}
                          size="small"
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          color="default"
                          size="small"
                          onClick={() => {
                            // כאן תהיה פונקציונליות הורדת קובץ
                            console.log('Download treatment:', treatment.id);
                          }}
                        >
                          <DownloadIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                }
                {filteredTreatments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography sx={{ py: 3 }}>לא נמצאו סיכומי טיפולים</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            component="div"
            count={filteredTreatments.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="שורות בעמוד:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} מתוך ${count}`}
            nextIconButtonProps={{ 'aria-label': 'לעמוד הבא' }}
            backIconButtonProps={{ 'aria-label': 'לעמוד הקודם' }}
          />
        </Grid>
      </Grid>
      
      {/* דיאלוג לצפייה בפרטי טיפול */}
      <TreatmentViewDialog
        open={viewDialogOpen}
        handleClose={() => setViewDialogOpen(false)}
        treatment={selectedTreatment}
      />
      
      {/* דיאלוג להוספת טיפול חדש */}
      <AddTreatmentDialog
        open={addDialogOpen}
        handleClose={() => setAddDialogOpen(false)}
        onSave={handleSaveTreatment}
        kidId={kidId}
      />
    </Box>
  );
};

export default TretmentType;