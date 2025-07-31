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
  Stack,
  styled,
  alpha,
  Fade,
  Zoom
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Tune as TuneIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { useSelector } from 'react-redux';

// Enhanced Styled Components with modern design
const FilterContainer = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${alpha('#ffffff', 0.2)}`,
  borderRadius: '20px',
  overflow: 'hidden',
  position: 'relative',
  boxShadow: '0 15px 45px rgba(76, 181, 195, 0.1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 8s ease infinite',
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.9)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 25px rgba(76, 181, 195, 0.15)',
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      boxShadow: '0 8px 25px rgba(76, 181, 195, 0.25)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4cb5c3',
        borderWidth: '2px',
      }
    },
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: alpha('#4cb5c3', 0.3),
      transition: 'all 0.3s ease',
    }
  },
  '& .MuiInputLabel-root': {
    color: alpha(theme.palette.text.primary, 0.7),
    '&.Mui-focused': {
      color: '#4cb5c3',
    }
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: '12px',
  padding: '10px 20px',
  fontWeight: 600,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&.filter-button': {
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(76, 181, 195, 0.4)',
    }
  },
  '&.clear-button': {
    background: 'linear-gradient(45deg, #ff7043 30%, #f4511e 90%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(255, 112, 67, 0.3)',
    '&:hover': {
      background: 'linear-gradient(45deg, #f4511e 30%, #d84315 90%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 10px 30px rgba(255, 112, 67, 0.4)',
    }
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover::after': {
    left: '100%',
  }
}));

const QuickFilterChip = styled(Chip)(({ theme }) => ({
  borderRadius: '12px',
  fontWeight: 600,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.2)',
  },
  '&.active': {
    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
    color: 'white',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  },
  '&.inactive': {
    background: alpha('#4cb5c3', 0.1),
    color: '#4cb5c3',
    border: `1px solid ${alpha('#4cb5c3', 0.3)}`,
    '&:hover': {
      background: alpha('#4cb5c3', 0.2),
    }
  }
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.8)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.9)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4cb5c3',
      }
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4cb5c3',
        borderWidth: '2px',
      }
    }
  },
  '& .MuiInputLabel-root': {
    '&.Mui-focused': {
      color: '#4cb5c3',
    }
  }
}));

const FilterBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(45deg, #ff7043 30%, #f4511e 90%)',
    color: 'white',
    fontWeight: 700,
    boxShadow: '0 3px 10px rgba(255, 112, 67, 0.3)',
    animation: 'pulse 2s infinite',
  },
  '@keyframes pulse': {
    '0%': {
      transform: 'scale(1)',
      boxShadow: '0 3px 10px rgba(255, 112, 67, 0.3)',
    },
    '50%': {
      transform: 'scale(1.1)',
      boxShadow: '0 6px 20px rgba(255, 112, 67, 0.4)',
    },
    '100%': {
      transform: 'scale(1)',
      boxShadow: '0 3px 10px rgba(255, 112, 67, 0.3)',
    },
  }
}));

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
      icon: '📅',
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
      icon: '📊',
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
      icon: '🗓️',
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
      icon: '⭐',
      action: () => {
        setCooperationLevelFilter([4, 5]);
        setQuickFilterPreset('highCooperation');
      }
    },
    {
      id: 'lowCooperation',
      label: 'שיתוף פעולה נמוך',
      icon: '⚠️',
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
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        <FilterContainer elevation={0} sx={{ p: 3 }}>
          {/* Main search and filter controls */}
          <Fade in timeout={800}>
            <Grid container spacing={3} alignItems="center">
              {/* Search field */}
              <Grid item xs={12} md={6}>
                <SearchField
                  fullWidth
                  placeholder="חיפוש בתיאור הטיפול, הארות ועוד..."
                  value={searchTerm}
                  onChange={handleSearch}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#4cb5c3' }} />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <Tooltip title="נקה חיפוש">
                          <IconButton onClick={clearSearchTerm} size="small">
                            <ClearIcon />
                          </IconButton>
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Filter controls */}
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    {filteredTreatments.length} תוצאות
                  </Typography>
                  
                  <FilterBadge badgeContent={activeFiltersCount} invisible={activeFiltersCount === 0}>
                    <AnimatedButton
                      className="filter-button"
                      variant={filterOpen ? "contained" : "outlined"}
                      startIcon={<TuneIcon />}
                      endIcon={filterOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      onClick={() => setFilterOpen(!filterOpen)}
                      sx={{ minWidth: 160 }}
                    >
                      סינון מתקדם
                    </AnimatedButton>
                  </FilterBadge>
                  
                  {activeFiltersCount > 0 && (
                    <Tooltip title="נקה את כל הפילטרים">
                      <AnimatedButton 
                        className="clear-button"
                        variant="contained" 
                        onClick={clearFilters}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        <ClearIcon />
                      </AnimatedButton>
                    </Tooltip>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Fade>

          {/* Quick Filters */}
          {!filterOpen && activeFiltersCount === 0 && (
            <Fade in timeout={1000}>
              <Box sx={{ mt: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 2, 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    fontWeight: 600
                  }}
                >
                  <FilterListIcon sx={{ color: '#4cb5c3', fontSize: '1.2rem' }} />
                  פילטרים מהירים:
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                  {quickFilters.map((filter, index) => (
                    <Zoom in timeout={200 + index * 100} key={filter.id}>
                      <QuickFilterChip
                        label={`${filter.icon} ${filter.label}`}
                        className={quickFilterPreset === filter.id ? 'active' : 'inactive'}
                        onClick={() => filter.action()}
                        sx={{ fontSize: '0.9rem' }}
                      />
                    </Zoom>
                  ))}
                </Stack>
              </Box>
            </Fade>
          )}

          {/* Advanced Filters */}
          <Collapse in={filterOpen}>
            <Fade in={filterOpen} timeout={500}>
              <Paper sx={{ 
                mt: 3, 
                p: 3, 
                borderRadius: '16px',
                background: alpha('#4cb5c3', 0.02),
                border: `1px solid ${alpha('#4cb5c3', 0.1)}`
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mb: 3, 
                    color: '#4cb5c3', 
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <TuneIcon />
                  סינון מתקדם
                </Typography>
                
                <Grid container spacing={3}>
                  {/* Date range */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4cb5c3' }} />
                      טווח תאריכים
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <DatePicker
                          label="מתאריך"
                          value={dateFrom}
                          onChange={(newValue) => {
                            setDateFrom(newValue);
                            setQuickFilterPreset(null);
                          }}
                          slots={{
                            textField: (props) => <TextField {...props} size="small" fullWidth />
                          }}
                          slotProps={{
                            textField: {
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                }
                              }
                            }
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <DatePicker
                          label="עד תאריך"
                          value={dateTo}
                          onChange={(newValue) => {
                            setDateTo(newValue);
                            setQuickFilterPreset(null);
                          }}
                          slots={{
                            textField: (props) => <TextField {...props} size="small" fullWidth />
                          }}
                          slotProps={{
                            textField: {
                              sx: {
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '12px',
                                }
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Employee filter */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      <PersonIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4cb5c3' }} />
                      סינון לפי מטפל
                    </Typography>
                    <StyledFormControl fullWidth size="small">
                      <InputLabel>בחר מטפל</InputLabel>
                      <Select
                        value={employeeFilter}
                        label="בחר מטפל"
                        onChange={(e) => {
                          setEmployeeFilter(e.target.value);
                          setQuickFilterPreset(null);
                        }}
                      >
                        <MenuItem value="">הכל</MenuItem>
                        {employees?.map((employee) => (
                          <MenuItem key={employee.employeeId} value={employee.employeeId}>
                            {employee.firstName} {employee.lastName}
                          </MenuItem>
                        ))}
                      </Select>
                    </StyledFormControl>
                  </Grid>

                  {/* Cooperation level */}
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'text.primary' }}>
                      <StarIcon sx={{ mr: 1, verticalAlign: 'middle', color: '#4cb5c3' }} />
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
                          { value: 1, label: '1⭐' },
                          { value: 2, label: '2⭐' },
                          { value: 3, label: '3⭐' },
                          { value: 4, label: '4⭐' },
                          { value: 5, label: '5⭐' },
                        ]}
                        sx={{
                          color: '#4cb5c3',
                          '& .MuiSlider-thumb': {
                            background: 'linear-gradient(45deg, #4cb5c3, #2a8a95)',
                            boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
                            '&:hover': {
                              boxShadow: '0 6px 20px rgba(76, 181, 195, 0.4)',
                            }
                          },
                          '& .MuiSlider-track': {
                            background: 'linear-gradient(90deg, #4cb5c3, #2a8a95)',
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Filter actions */}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                          {activeFiltersCount > 0 && `${activeFiltersCount} פילטרים פעילים`}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Tooltip title="נקה את כל הפילטרים">
                          <AnimatedButton
                            className="clear-button"
                            variant="outlined"
                            size="small"
                            onClick={clearFilters}
                            disabled={activeFiltersCount === 0}
                          >
                            נקה הכל
                          </AnimatedButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Fade>
          </Collapse>
        </FilterContainer>
      </LocalizationProvider>
    </Box>
  );
};

export default TreatmentsFilters;