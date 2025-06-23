import { 
  Box, 
  Paper,
  Grid, 
  TextField, 
  Button,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Typography,
  Slider,
  IconButton,
  Tooltip,
  Collapse,
  Badge,
  Stack
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import StarIcon from '@mui/icons-material/Star';
import SaveIcon from '@mui/icons-material/Save';
import TuneIcon from '@mui/icons-material/Tune';
import { useTreatmentContext } from './TreatmentContext';
import { useSelector } from 'react-redux';

const TreatmentsFilters = () => {
  const { 
    searchTerm, 
    setSearchTerm, 
    filterOpen, 
    setFilterOpen,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    employeeFilter,
    setEmployeeFilter,
    clearFilters,
    setPage,
    filteredTreatments,
    cooperationLevelFilter,
    setCooperationLevelFilter,
    quickFilterPreset,
    setQuickFilterPreset
  } = useTreatmentContext();

  // Get data from Redux
  const { employees } = useSelector(state => state.employees);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const clearSearchTerm = () => {
    setSearchTerm('');
    setPage(0);
  };

  // Predefined quick filters
  const quickFilters = [
    {
      id: 'today',
      label: 'היום',
      action: () => {
        const today = new Date();
        setDateFrom(today);
        setDateTo(today);
        setQuickFilterPreset('today');
      }
    },
    {
      id: 'thisWeek',
      label: 'השבוע',
      action: () => {
        const today = new Date();
        const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        setDateFrom(startOfWeek);
        setDateTo(endOfWeek);
        setQuickFilterPreset('thisWeek');
      }
    },
    {
      id: 'thisMonth',
      label: 'החודש',
      action: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateFrom(startOfMonth);
        setDateTo(endOfMonth);
        setQuickFilterPreset('thisMonth');
      }
    },
    {
      id: 'highCooperation',
      label: 'שיתוף פעולה גבוה',
      action: () => {
        setCooperationLevelFilter([4, 5]);
        setQuickFilterPreset('highCooperation');
      }
    },
    {
      id: 'lowCooperation',
      label: 'שיתוף פעולה נמוך',
      action: () => {
        setCooperationLevelFilter([1, 2]);
        setQuickFilterPreset('lowCooperation');
      }
    }
  ];

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    if (employeeFilter) count++;
    if (cooperationLevelFilter && cooperationLevelFilter.length > 0) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();


  return (
    <Box sx={{ mb: 3 }}>
      {/* Top search bar */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              variant="outlined"
              placeholder="חיפוש בתיאור, הערות, שם מטפל..."
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'action.active' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={clearSearchTerm}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                }
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Badge badgeContent={activeFiltersCount} color="primary">
                <Button 
                  variant={filterOpen ? "contained" : "outlined"}
                  startIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  onClick={() => setFilterOpen(!filterOpen)}
                  sx={{ minWidth: 140 }}
                >
                  סינון מתקדם
                </Button>
              </Badge>
              
              {activeFiltersCount > 0 && (
                <Tooltip title="נקה את כל הפילטרים">
                  <Button 
                    variant="outlined" 
                    color="error" 
                    onClick={clearFilters}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    <ClearIcon />
                  </Button>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Quick Filters */}
        {!filterOpen && activeFiltersCount === 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              פילטרים מהירים:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {quickFilters.map((filter) => (
                <Chip
                  key={filter.id}
                  label={filter.label}
                  variant={quickFilterPreset === filter.id ? "filled" : "outlined"}
                  size="small"
                  onClick={filter.action}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      backgroundColor: 'primary.light',
                      color: 'white'
                    }
                  }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {/* Display active filters */}
        {activeFiltersCount > 0 && !filterOpen && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              פילטרים פעילים ({filteredTreatments.length} תוצאות):
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {searchTerm && (
                <Chip
                  label={`חיפוש: "${searchTerm}"`}
                  variant="filled"
                  size="small"
                  onDelete={() => setSearchTerm('')}
                  color="primary"
                />
              )}
              {dateFrom && (
                <Chip
                  label={`מתאריך: ${dateFrom.toLocaleDateString('he-IL')}`}
                  variant="filled"
                  size="small"
                  onDelete={() => setDateFrom(null)}
                  color="secondary"
                />
              )}
              {dateTo && (
                <Chip
                  label={`עד תאריך: ${dateTo.toLocaleDateString('he-IL')}`}
                  variant="filled"
                  size="small"
                  onDelete={() => setDateTo(null)}
                  color="secondary"
                />
              )}
              {employeeFilter && (
                <Chip
                  label={`מטפל: ${employeeFilter}`}
                  variant="filled"
                  size="small"
                  onDelete={() => setEmployeeFilter('')}
                  color="info"
                />
              )}
            </Stack>
          </Box>
        )}
      </Paper>

     {/* Advanced Filters Panel */}
      <Collapse in={filterOpen}>
        <Paper sx={{ p: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="h6" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TuneIcon color="primary" />
            סינון מתקדם
          </Typography>
          
          <Grid container spacing={3}>
            {/* Date Range */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon fontSize="small" color="primary" />
                טווח תאריכים
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                    <DatePicker
                      label="מתאריך"
                      value={dateFrom}
                      onChange={(newValue) => {
                        setDateFrom(newValue);
                        setQuickFilterPreset(null);
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      maxDate={dateTo || new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                    <DatePicker
                      label="עד תאריך"
                      value={dateTo}
                      onChange={(newValue) => {
                        setDateTo(newValue);
                        setQuickFilterPreset(null);
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth size="small" />}
                      minDate={dateFrom}
                      maxDate={new Date()}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Employee selection */}
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon fontSize="small" color="primary" />
                מטפל
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel>בחר מטפל</InputLabel>
                <Select
                  value={employeeFilter}
                  onChange={(e) => setEmployeeFilter(e.target.value)}
                  label="בחר מטפל"
                >
                  <MenuItem value="">הכל</MenuItem>
                  {employees && employees.map((employee) => (
                    <MenuItem key={employee.employeeId} value={employee.firstName + ' ' + employee.lastName}>
                      {employee.firstName} {employee.lastName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              {/* Empty space or additional content in the future */}
            </Grid>

            {/* Cooperation Level */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <StarIcon fontSize="small" color="primary" />
                רמת שיתוף פעולה
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={cooperationLevelFilter || [1, 5]}
                  onChange={(event, newValue) => {
                    setCooperationLevelFilter(newValue);
                    setQuickFilterPreset(null);
                  }}
                  valueLabelDisplay="auto"
                  min={1}
                  max={5}
                  marks={[
                    { value: 1, label: '1' },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' }
                  ]}
                  sx={{ 
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#ffc107',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#ffc107',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" align="center" display="block">
                  {cooperationLevelFilter 
                    ? `${cooperationLevelFilter[0]} - ${cooperationLevelFilter[1]}`
                    : '1 - 5'
                  }
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

           {/* Action Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  נמצאו {filteredTreatments.length} טיפולים
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="שמור הגדרות פילטרים">
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SaveIcon />}
                      onClick={saveFiltersPreset}
                      disabled={activeFiltersCount === 0}
                    >
                      שמור פילטרים
                    </Button>
                  </Tooltip>
                  
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={clearFilters}
                    disabled={activeFiltersCount === 0}
                  >
                    נקה הכל
                  </Button>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Collapse>
    </Box>
  );
};

export default TreatmentsFilters;