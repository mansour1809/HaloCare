// TreatmentsTable.jsx - גרסה משופרת עם עיצוב קארדים
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  IconButton,
  Avatar,
  Tooltip,
  Rating,
  LinearProgress,
  Stack,
  Divider,
  Zoom
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon,
  // MoodIcon,
  TrendingUpIcon,
  // LocalHospitalIcon,
  StarIcon
} from '@mui/icons-material';
import MoodIcon from '@mui/icons-material/Mood';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { useTreatmentContext } from './TreatmentContext';
import { useSelector } from 'react-redux';

const TreatmentsTable = () => {
  const { 
    filteredTreatments, 
    page, 
    rowsPerPage,
    openViewDialog,
    getColorForTreatmentType,
    getTreatmentName,
    formatDate 
  } = useTreatmentContext();
  
  const treatmentTypes = useSelector(state => state.treatmentTypes.treatmentTypes);

  // פונקציה לקבלת אייקון לפי סוג טיפול
  const getTreatmentIcon = (typeId) => {
    const treatmentType = treatmentTypes.find(t => t.treatmentTypeId === typeId);
    // כאן תוכל להוסיף לוגיקה לאייקונים שונים לפי שם הטיפול
    return <LocalHospitalIcon />;
  };

  // פונקציה לקבלת טקסט לרמת שיתוף פעולה
  const getCooperationText = (level) => {
    const levels = {
      1: 'לא משתף פעולה',
      2: 'שיתוף פעולה נמוך',
      3: 'שיתוף פעולה בינוני',
      4: 'שיתוף פעולה טוב',
      5: 'שיתוף פעולה מעולה'
    };
    return levels[level] || 'לא הוגדר';
  };

  // פונקציה לקבלת צבע לרמת שיתוף פעולה
  const getCooperationColor = (level) => {
    if (level >= 4) return '#4caf50'; // ירוק
    if (level === 3) return '#ff9800'; // כתום
    if (level <= 2) return '#f44336'; // אדום
    return '#9e9e9e'; // אפור
  };

  // חישוב אחוז התקדמות (בהתבסס על מספר הטיפולים)
  const calculateProgress = (treatments, currentIndex) => {
    return Math.min(((currentIndex + 1) / treatments.length) * 100, 100);
  };

  // טיפול בלחיצה על קארד
  const handleCardClick = (treatment) => {
    openViewDialog(treatment);
  };

  // עיצוב קארד בודד
  const TreatmentCard = ({ treatment, index }) => {
    const treatmentColor = getColorForTreatmentType(treatment.treatmentTypeId);
    const treatmentName = getTreatmentName(treatment.treatmentTypeId);
    const progress = calculateProgress(filteredTreatments, index);

    return (
      <Zoom in timeout={300 + (index * 100)}>
        <Card
          sx={{
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            position: 'relative',
            borderRadius: 3,
            overflow: 'hidden',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            '&:hover': {
              transform: 'translateY(-8px) scale(1.02)',
              boxShadow: `0 12px 40px ${treatmentColor}20`,
              '& .action-buttons': {
                opacity: 1,
                transform: 'translateY(0)'
              }
            },
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: `linear-gradient(90deg, ${treatmentColor}, ${treatmentColor}80)`,
              zIndex: 1
            }
          }}
          onClick={() => handleCardClick(treatment)}
        >
          <CardContent sx={{ p: 3 }}>
            {/* כותרת הקארד */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar 
                sx={{ 
                  bgcolor: treatmentColor,
                  width: 48,
                  height: 48,
                  mr: 2,
                  boxShadow: `0 4px 20px ${treatmentColor}40`
                }}
              >
                {getTreatmentIcon(treatment.treatmentTypeId)}
              </Avatar>
              
              <Box sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: '#1a1a1a',
                    mb: 0.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {treatmentName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(treatment.treatmentDate)}
                  </Typography>
                </Box>
              </Box>

              {/* כפתורי פעולה */}
              <Box 
                className="action-buttons"
                sx={{
                  opacity: 0,
                  transform: 'translateY(10px)',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  gap: 1
                }}
              >
                <Tooltip title="צפייה">
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': { bgcolor: 'primary.dark' }
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(treatment);
                    }}
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* תוכן הטיפול */}
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                color: 'text.secondary',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4
              }}
            >
              {treatment.description || 'אין תיאור זמין'}
            </Typography>

            {/* מידע נוסף */}
            <Stack spacing={2}>
              {/* מטפל */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  מטפל: {treatment.employeeName || 'לא הוזן'}
                </Typography>
              </Box>

              {/* רמת שיתוף פעולה */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoodIcon sx={{ fontSize: 18, color: getCooperationColor(treatment.cooperationLevel) }} />
                    <Typography variant="body2" fontWeight={600}>
                      שיתוף פעולה
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: getCooperationColor(treatment.cooperationLevel),
                      fontWeight: 600
                    }}
                  >
                    {getCooperationText(treatment.cooperationLevel)}
                  </Typography>
                </Box>
                
                <Rating
                  value={treatment.cooperationLevel || 0}
                  max={5}
                  readOnly
                  size="small"
                  icon={<StarIcon fontSize="inherit" />}
                  emptyIcon={<StarIcon fontSize="inherit" sx={{ color: '#e0e0e0' }} />}
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: getCooperationColor(treatment.cooperationLevel)
                    }
                  }}
                />
              </Box>

              {/* התקדמות */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon sx={{ fontSize: 18, color: treatmentColor }} />
                    <Typography variant="body2" fontWeight={600}>
                      התקדמות כללית
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    bgcolor: '#f5f5f5',
                    '& .MuiLinearProgress-bar': {
                      background: `linear-gradient(90deg, ${treatmentColor}, ${treatmentColor}80)`,
                      borderRadius: 3
                    }
                  }}
                />
              </Box>

              {/* הדגשה */}
              {treatment.highlight && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box 
                    sx={{
                      bgcolor: `${treatmentColor}10`,
                      border: `1px solid ${treatmentColor}30`,
                      borderRadius: 2,
                      p: 1.5
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600,
                        color: treatmentColor,
                        fontSize: '0.85rem'
                      }}
                    >
                      💡 {treatment.highlight}
                    </Typography>
                  </Box>
                </>
              )}

              {/* סטטוס */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Chip
                  label={treatment.status === 'active' ? 'פעיל' : 'לא פעיל'}
                  size="small"
                  color={treatment.status === 'active' ? 'success' : 'default'}
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Zoom>
    );
  };

  // אם אין טיפולים
  if (!filteredTreatments || filteredTreatments.length === 0) {
    return (
      <Box 
        sx={{ 
          textAlign: 'center', 
          py: 8,
          bgcolor: '#fafafa',
          borderRadius: 3,
          border: '2px dashed #e0e0e0'
        }}
      >
        <LocalHospitalIcon sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          אין טיפולים להצגה
        </Typography>
        <Typography variant="body2" color="text.secondary">
          נסה לשנות את מסנני החיפוש או להוסיף טיפולים חדשים
        </Typography>
      </Box>
    );
  }

  // חישוב טיפולים לעמוד הנוכחי
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentTreatments = filteredTreatments.slice(startIndex, endIndex);

  return (
    <Box sx={{ mt: 3 }}>
      {/* סטטיסטיקות מהירות */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f8f9fa' }}>
              <Typography variant="h4" fontWeight={700} color="primary.main">
                {filteredTreatments.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                סה"כ טיפולים
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#f1f8e9' }}>
              <Typography variant="h4" fontWeight={700} color="success.main">
                {filteredTreatments.filter(t => t.cooperationLevel >= 4).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                שיתוף פעולה טוב
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#fff3e0' }}>
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {filteredTreatments.filter(t => t.cooperationLevel === 3).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                שיתוף פעולה בינוני
              </Typography>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={3}>
            <Card sx={{ textAlign: 'center', p: 2, bgcolor: '#ffebee' }}>
              <Typography variant="h4" fontWeight={700} color="error.main">
                {filteredTreatments.filter(t => t.cooperationLevel <= 2).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                זקוק לתשומת לב
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* רשת הקארדים */}
      <Grid container spacing={3}>
        {currentTreatments.map((treatment, index) => (
          <Grid item xs={12} md={6} lg={4} key={treatment.treatmentId}>
            <TreatmentCard treatment={treatment} index={index} />
          </Grid>
        ))}
      </Grid>

      {/* אם יש הרבה טיפולים, נוסיף pagination כאן */}
      {filteredTreatments.length > rowsPerPage && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            מציג {startIndex + 1}-{Math.min(endIndex, filteredTreatments.length)} מתוך {filteredTreatments.length} טיפולים
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default TreatmentsTable;