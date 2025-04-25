// src/components/treatments/TreatmentsFilters.jsx
import React from 'react';
import { 
  Box, 
  Paper,
  Grid, 
  TextField, 
  Button,
  InputAdornment 
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { 
  Search as SearchIcon,
  FilterList as FilterListIcon 
} from '@mui/icons-material';
import { useTreatmentContext } from './TreatmentContext';

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
    setPage
  } = useTreatmentContext();

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              variant="outlined"
              placeholder="חיפוש בטיפולים..."
              fullWidth
              value={searchTerm}
              onChange={handleSearch}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'action.active' }} />,
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                variant="outlined" 
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen(!filterOpen)}
                sx={{ mr: 1 }}
              >
                {filterOpen ? 'הסתר סינון מתקדם' : 'סינון מתקדם'}
              </Button>
              {(dateFrom || dateTo || employeeFilter) && (
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={clearFilters}
                >
                  נקה סינון
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>
        
        {filterOpen && (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                <DatePicker
                  label="מתאריך"
                  value={dateFrom}
                  onChange={(newValue) => setDateFrom(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
                <DatePicker
                  label="עד תאריך"
                  value={dateTo}
                  onChange={(newValue) => setDateTo(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="סינון לפי מטפל"
                value={employeeFilter}
                onChange={(e) => setEmployeeFilter(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
};

export default TreatmentsFilters;