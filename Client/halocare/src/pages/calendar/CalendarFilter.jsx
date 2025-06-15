import { 
  Paper, 
  Box, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Typography,
  CircularProgress,
  Chip,
  Fade,
  FormHelperText,
  InputAdornment,
  Card,
  CardContent,
  Stack,
  Avatar,
  alpha,
  useTheme
} from '@mui/material';
import { 
  FilterAlt as FilterAltIcon,
  ClearAll as ClearAllIcon,
  Info as InfoIcon,
  ChildCare as ChildCareIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import { useCalendar } from './CalendarContext';

// כרטיס סינון מעוצב
const FilterCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.98)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  borderRadius: 24,
  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
  overflow: 'visible',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '6px',
    background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #d97706)',
    borderRadius: '24px 24px 0 0',
  }
}));

// כותרת סינון מעוצבת
const FilterHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: theme.spacing(3),
  padding: theme.spacing(2),
  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.light, 0.1)} 100%)`,
  borderRadius: 16,
  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
}));

// FormControl מעוצב
const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 16,
    transition: 'all 0.3s ease',
    background: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-focused': {
      boxShadow: '0 6px 20px rgba(102, 126, 234, 0.25)',
      transform: 'translateY(-3px)',
    }
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  }
}));

// Chip מעוצב עם אנימציה
const AnimatedChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
  color: 'white',
  fontWeight: 600,
  boxShadow: '0 4px 14px rgba(102, 126, 234, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  }
}));

// כפתור נקה עם אפקט זוהר
const GlowButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  fontWeight: 600,
  background: 'linear-gradient(45deg, #f093fb 30%, #ff6b6b 90%)',
  color: 'white',
  border: 'none',
  boxShadow: '0 4px 14px rgba(240, 147, 251, 0.4)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    background: 'linear-gradient(45deg, #e879f9 30%, #ef4444 90%)',
    transform: 'translateY(-3px)',
    boxShadow: '0 8px 25px rgba(240, 147, 251, 0.5)',
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

const CalendarFilter = () => {
  // קבלת ערכים ופונקציות מהקונטקסט
  const {
    filterOptions,
    handleFilterChange,
    resetFilters,
    kids,
    employees,
    eventTypes,
    isLoadingReferenceData
  } = useCalendar();
  
  const theme = useTheme();
  
  // בדיקה אם יש מסננים פעילים
  const hasActiveFilters = 
    filterOptions.kidId || 
    filterOptions.employeeId || 
    filterOptions.eventTypeId;
  
  // ספירת מסננים פעילים
  const activeFilterCount = Object.values(filterOptions)
    .filter(value => value !== '').length;
  
  return (
    <Fade in={true} timeout={500}>
      <FilterCard sx={{ mb: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <FilterHeader>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ 
                background: 'linear-gradient(45deg, #f59e0b 30%, #fbbf24 90%)',
                boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)'
              }}>
                <FilterAltIcon />
              </Avatar>
              
              <Box>
                <Typography variant="h6" sx={{ 
                  fontWeight: 700, 
                  background: 'linear-gradient(45deg, #f59e0b 30%, #d97706 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  סינון אירועים מתקדם
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סנן אירועים לפי הקריטריונים הרצויים
                </Typography>
              </Box>
              
              {activeFilterCount > 0 && (
                <AnimatedChip 
                  label={`${activeFilterCount} פילטרים פעילים`}
                  icon={<AutoAwesomeIcon />}
                  size="small"
                />
              )}
            </Stack>
            
            {hasActiveFilters && (
              <GlowButton
                variant="contained"
                startIcon={<ClearAllIcon />}
                onClick={resetFilters}
                size="small"
              >
                נקה הכל
              </GlowButton>
            )}
          </FilterHeader>
          
          <Grid container spacing={3}>
            {/* סינון לפי ילד */}
            <Grid item xs={12} sm={4}>
              <StyledFormControl fullWidth variant="outlined" size="medium">
                <InputLabel>בחר ילד</InputLabel>
                <Select
                  name="kidId"
                  value={filterOptions.kidId}
                  onChange={handleFilterChange}
                  label="בחר ילד"
                  disabled={isLoadingReferenceData || kids.length === 0}
                  startAdornment={
                    <InputAdornment position="start">
                      <ChildCareIcon color="primary" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        mt: 1,
                        '& .MuiMenuItem-root': {
                          borderRadius: 2,
                          margin: '4px 8px',
                          '&:hover': {
                            background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.1) 30%, rgba(118, 75, 162, 0.1) 90%)',
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ fontStyle: 'italic', color: '#666' }}>כל הילדים</em>
                  </MenuItem>
                  {kids.map(kid => (
                    <MenuItem key={kid.id} value={kid.id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                          👶
                        </Avatar>
                        <Typography>{`${kid.firstName} ${kid.lastName}`}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500,
                  color: 'text.primary'
                }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  סנן אירועים לפי ילד ספציפי
                </FormHelperText>
              </StyledFormControl>
            </Grid>
            
            {/* סינון לפי איש צוות */}
            <Grid item xs={12} sm={4}>
              <StyledFormControl fullWidth variant="outlined" size="medium">
                <InputLabel>בחר איש צוות</InputLabel>
                <Select
                  name="employeeId"
                  value={filterOptions.employeeId}
                  onChange={handleFilterChange}
                  label="בחר איש צוות"
                  disabled={isLoadingReferenceData || employees.length === 0}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon color="secondary" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        mt: 1,
                        '& .MuiMenuItem-root': {
                          borderRadius: 2,
                          margin: '4px 8px',
                          '&:hover': {
                            background: 'linear-gradient(45deg, rgba(240, 147, 251, 0.1) 30%, rgba(255, 187, 36, 0.1) 90%)',
                          }
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ fontStyle: 'italic', color: '#666' }}>כל אנשי הצוות</em>
                  </MenuItem>
                  {employees.map(employee => (
                    <MenuItem key={employee.employeeId} value={employee.employeeId}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Avatar sx={{ 
                          width: 24, 
                          height: 24, 
                          fontSize: '0.6rem',
                          background: 'linear-gradient(45deg, #f093fb 30%, #fbbf24 90%)'
                        }}>
                          {employee.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography>{`${employee.firstName} ${employee.lastName}`}</Typography>
                          {employee.role && (
                            <Typography variant="caption" color="text.secondary">
                              {employee.role}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500,
                  color: 'text.primary'
                }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  סנן אירועים לפי איש צוות
                </FormHelperText>
              </StyledFormControl>
            </Grid>
            
            {/* סינון לפי סוג אירוע */}
            <Grid item xs={12} sm={4}>
              <StyledFormControl fullWidth variant="outlined" size="medium">
                <InputLabel>בחר סוג אירוע</InputLabel>
                <Select
                  name="eventTypeId"
                  value={filterOptions.eventTypeId}
                  onChange={handleFilterChange}
                  label="בחר סוג אירוע"
                  disabled={isLoadingReferenceData || eventTypes.length === 0}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon color="info" />
                    </InputAdornment>
                  }
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        borderRadius: 3,
                        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                        mt: 1,
                        '& .MuiMenuItem-root': {
                          borderRadius: 2,
                          margin: '4px 8px',
                        }
                      }
                    }
                  }}
                >
                  <MenuItem value="">
                    <em style={{ fontStyle: 'italic', color: '#666' }}>כל סוגי האירועים</em>
                  </MenuItem>
                  {eventTypes.map(type => (
                    <MenuItem 
                      key={type.eventTypeId} 
                      value={type.eventTypeId}
                      sx={{ 
                        borderRight: `6px solid ${type.color || '#1976d2'}`,
                        borderRadius: '2px !important',
                        '&:hover': {
                          background: `${alpha(type.color || '#1976d2', 0.1)} !important`,
                        }
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: type.color || '#1976d2',
                            boxShadow: `0 2px 8px ${alpha(type.color || '#1976d2', 0.4)}`,
                          }}
                        />
                        <Typography fontWeight={500}>{type.eventType}</Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 500,
                  color: 'text.primary'
                }}>
                  <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.7 }} />
                  סנן אירועים לפי סוג האירוע
                </FormHelperText>
              </StyledFormControl>
            </Grid>
          </Grid>
          
          {/* אינדיקטור טעינה */}
          {isLoadingReferenceData && (
            <Fade in>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center', 
                justifyContent: 'center',
                mt: 3,
                p: 2,
                borderRadius: 3,
                background: alpha(theme.palette.primary.main, 0.05),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}>
                <CircularProgress 
                  size={40} 
                  thickness={4}
                  sx={{ 
                    color: 'primary.main',
                    mb: 1,
                    filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))'
                  }} 
                />
                <Typography variant="body2" sx={{ 
                  fontWeight: 600,
                  color: 'primary.main'
                }}>
                  טוען נתונים לסינון...
                </Typography>
              </Box>
            </Fade>
          )}
          
        </CardContent>
      </FilterCard>
    </Fade>
  );
};

export default CalendarFilter;