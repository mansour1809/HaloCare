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
  Typography,
  IconButton,
  Tooltip,
  Collapse,
  Badge,
  Stack,
  styled,
  alpha
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';
import { useSelector } from 'react-redux';
import HebrewReactDatePicker from '../../../components/common/HebrewReactDatePicker';

// Simple styled components
const FilterContainer = styled(Paper)(({ theme }) => ({
  borderRadius: 12,
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  border: '1px solid',
  borderColor: theme.palette.grey[200],
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: theme.palette.grey[50],
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4cb5c3',
      }
    },
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4cb5c3',
  }
}));

const QuickFilterChip = styled(Chip)(({ theme, selected }) => ({
  borderRadius: 8,
  fontWeight: 500,
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundColor: selected ? '#4cb5c3' : theme.palette.grey[100],
  color: selected ? 'white' : theme.palette.text.primary,
  border: selected ? 'none' : `1px solid ${theme.palette.grey[300]}`,
  '&:hover': {
    backgroundColor: selected ? '#3da1af' : theme.palette.grey[200],
    transform: 'translateY(-1px)',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 8,
    backgroundColor: theme.palette.grey[50],
    '&:hover': {
      backgroundColor: theme.palette.background.paper,
    },
    '&.Mui-focused': {
      backgroundColor: theme.palette.background.paper,
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4cb5c3',
      }
    }
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#4cb5c3',
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

  // Simplified quick filters
  const quickFilters = [
    {
      id: 'all',
      label: 'הכל',
      action: () => {
        clearFilters();
        setQuickFilterPreset('all');
      }
    },
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
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() + (6 - dayOfWeek));
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
    }
  ];

  // Count active filters
  const getActiveFiltersCount = () => {
    let count = 0;
    if (searchTerm.trim()) count++;
    if (dateFrom || dateTo) count++;
    if (employeeFilter) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <FilterContainer elevation={0}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
        {/* Main search bar */}
        <Grid container spacing={2} alignItems="center">
          <Grid item size={{xs:12,md:6}}>
            <SearchField
              fullWidth
              size="small"
              placeholder="חיפוש בתיאור הטיפול..."
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearchTerm} size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item size={{xs:12, md:6}}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                {filteredTreatments.length} תוצאות
              </Typography>
              
              <Badge badgeContent={activeFiltersCount} color="primary">
                <Button
                  size="small"
                  variant={filterOpen ? "contained" : "outlined"}
                  startIcon={<FilterListIcon />}
                  onClick={() => setFilterOpen(!filterOpen)}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    ...(filterOpen && {
                      background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                    })
                  }}
                >
                  סינון מתקדם
                </Button>
              </Badge>
              
              {activeFiltersCount > 0 && (
                <Tooltip title="נקה הכל">
                  <IconButton 
                    size="small"
                    onClick={clearFilters}
                    sx={{ color: 'error.main' }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Quick Filters - Always visible */}
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 1 }}>
            {quickFilters.map((filter) => (
              <QuickFilterChip
                key={filter.id}
                label={filter.label}
                selected={quickFilterPreset === filter.id || (filter.id === 'all' && !quickFilterPreset)}
                onClick={() => filter.action()}
                size="small"
              />
            ))}
          </Stack>
        </Box>

        {/* Advanced Filters - Collapsible */}
        <Collapse in={filterOpen}>
          <Box sx={{ 
            mt: 2, 
            pt: 2, 
            borderTop: '1px solid',
            borderColor: 'divider'
          }}>
            <Grid container spacing={2}>
              {/* Date range */}
              <Grid item size={{ xs: 12, md: 4 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarIcon fontSize="small" />
                    טווח תאריכים
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <HebrewReactDatePicker
                      maxDate={new Date()}
                      label="מתאריך"
                      value={dateFrom}
                      onChange={(newValue) => {
                        setDateFrom(newValue);
                        setQuickFilterPreset(null);
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'grey.50',
                            }
                          }
                        }
                      }}
                    />
                    <HebrewReactDatePicker
                      maxDate={new Date()}
                      minDate={dateFrom}
                      label="עד תאריך"
                      value={dateTo}
                      onChange={(newValue) => {
                        setDateTo(newValue);
                        setQuickFilterPreset(null);
                      }}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true,
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              backgroundColor: 'grey.50',
                            }
                          }
                        }
                      }}
                    />
                  </Stack>
                </Stack>
              </Grid>

              {/* Employee filter */}
              <Grid item size={{ xs: 12, md: 4 }}>
                <Stack spacing={1}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" />
                    מטפל
                  </Typography>
                  <StyledFormControl fullWidth size="small">
                    <Select
                      value={employeeFilter}
                      onChange={(e) => {
                        setEmployeeFilter(e.target.value);
                        setQuickFilterPreset(null);
                      }}
                      displayEmpty
                    >
                      <MenuItem value="">כל המטפלים</MenuItem>
                      {employees?.map((employee) => (
                        <MenuItem key={employee.employeeId} value={employee.employeeId}>
                          {employee.firstName} {employee.lastName}
                        </MenuItem>
                      ))}
                    </Select>
                  </StyledFormControl>
                </Stack>
              </Grid>

              {/* Clear filters button in advanced section */}
              <Grid item size={{ xs: 12, md: 4 }}>
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'flex-end',
                  justifyContent: { xs: 'center', md: 'flex-end' }
                }}>
                  <Button
                    size="small"
                    variant="text"
                    onClick={clearFilters}
                    disabled={activeFiltersCount === 0}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'error.main',
                        backgroundColor: alpha('#f44336', 0.08),
                      }
                    }}
                  >
                    נקה את כל הסינונים ({activeFiltersCount})
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Collapse>
      </LocalizationProvider>
    </FilterContainer>
  );
};

export default TreatmentsFilters;