// Component: CalendarFilter.jsx
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
  FormHelperText
} from '@mui/material';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import InfoIcon from '@mui/icons-material/Info';

import { useCalendar } from './CalendarContext';

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
  
  // בדיקה אם יש מסננים פעילים
  const hasActiveFilters = 
    filterOptions.kidId || 
    filterOptions.employeeId || 
    filterOptions.eventTypeId;
  
  // ספירת מסננים פעילים
  const activeFilterCount = Object.values(filterOptions)
    .filter(value => value !== '').length;
  
  return (
    <Fade in={true}>
      <Paper 
        elevation={2} 
        sx={{ 
          mb: 2, 
          p: 3, 
          borderRadius: '12px',
          borderLeft: '4px solid #4fc3f7',
          background: 'linear-gradient(to left, #ffffff, #f8fbff)'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterAltIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              סינון אירועים
            </Typography>
            
            {activeFilterCount > 0 && (
              <Chip 
                label={activeFilterCount} 
                color="primary" 
                size="small" 
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          
          {hasActiveFilters && (
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ClearAllIcon />}
              onClick={resetFilters}
              sx={{ 
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: 'rgba(244, 67, 54, 0.04)'
                }
              }}
            >
              נקה הכל
            </Button>
          )}
        </Box>
          
        <Grid container spacing={3}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>ילד</InputLabel>
              <Select
                name="kidId"
                value={filterOptions.kidId}
                onChange={handleFilterChange}
                label="ילד"
                disabled={isLoadingReferenceData || kids.length === 0}
              >
                <MenuItem value="">
                  <em>הכל</em>
                </MenuItem>
                {kids.map(kid => (
                  <MenuItem key={kid.id} value={kid.id}>
                    {`${kid.firstName} ${kid.lastName}`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                סנן אירועים לפי ילד ספציפי
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>איש צוות</InputLabel>
              <Select
                name="employeeId"
                value={filterOptions.employeeId}
                onChange={handleFilterChange}
                label="איש צוות"
                disabled={isLoadingReferenceData || employees.length === 0}
              >
                <MenuItem value="">
                  <em>הכל</em>
                </MenuItem>
                {employees.map(employee => (
                  <MenuItem key={employee.employeeId} value={employee.employeeId}>
                    {`${employee.firstName} ${employee.lastName}`}
                    {employee.role && ` (${employee.role})`}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                סנן אירועים לפי איש צוות
              </FormHelperText>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" size="small">
              <InputLabel>סוג אירוע</InputLabel>
              <Select
                name="eventTypeId"
                value={filterOptions.eventTypeId}
                onChange={handleFilterChange}
                label="סוג אירוע"
                disabled={isLoadingReferenceData || eventTypes.length === 0}
              >
                <MenuItem value="">
                  <em>הכל</em>
                </MenuItem>
                {eventTypes.map(type => (
                  <MenuItem 
                    key={type.eventTypeId} 
                    value={type.eventTypeId}
                    sx={{ 
                      borderRight: `4px solid ${type.color || '#1976d2'}`
                    }}
                  >
                    {type.eventType}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon fontSize="small" sx={{ mr: 0.5, opacity: 0.6 }} />
                סנן אירועים לפי סוג
              </FormHelperText>
            </FormControl>
          </Grid>
        </Grid>
        
        {isLoadingReferenceData && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 1 }}>
              טוען נתונים...
            </Typography>
          </Box>
        )}
        
      </Paper>
    </Fade>
  );
};

export default CalendarFilter;