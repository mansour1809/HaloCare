import React, { useState } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Grid, 
  Typography, 
  Paper, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Box,
  Divider
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// יצירת תמה מותאמת עם תמיכה בעברית
const theme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, Arial, sans-serif',
  },
  palette: {
    primary: {
      main: '#4cb5c3',
    },
  },
});

const NewEmployeeForm = () => {
  // מצב טופס התחלתי
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    id: '',
    birthDate: null,
    address: '',
    phone: '',
    role: '',
    workStartDate: null,
    jobType: '',
    workHours: '',
    salaryType: '',
    notes: '',
  });

  // טיפול בשינויים בשדות הטופס
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  // טיפול בשינוי תאריכים
  const handleDateChange = (name, date) => {
    setFormData(prevData => ({
      ...prevData,
      [name]: date,
    }));
  };

  // שליחת הטופס
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('נתוני הטופס:', formData);
    
    // אם הפונקציה קיימת (כמו במקרה של מסך ההתחברות), נפעיל אותה
    // if (setIsAuthenticated) {
    //   localStorage.setItem('isAuthenticated', 'true');
    //   setIsAuthenticated(true);
    // }
    
    // כאן בעתיד תהיה שליחה לדאטאבייס
  };

  return (
    <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
          <Container maxWidth="md" dir="rtl">
            <Paper elevation={3} sx={{ padding: 3, marginTop: 4, marginBottom: 4 }}>
              <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
                קליטת עובד חדש
              </Typography>
              
              <form onSubmit={handleSubmit}>
                {/* חלק 1: פרטים אישיים */}
                <Box sx={{ marginBottom: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                    פרטים אישיים
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="שם פרטי"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ marginBottom: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="שם משפחה"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ marginBottom: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="תאריך לידה"
                        value={formData.birthDate}
                        onChange={(date) => handleDateChange('birthDate', date)}
                        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="תעודת זהות"
                        name="id"
                        value={formData.id}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ marginBottom: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="כתובת"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ marginBottom: 2 }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="טלפון נייד"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        sx={{ marginBottom: 2 }}
                      />
                    </Grid>
                  </Grid>
                </Box>
                
                {/* חלק 2: פרטי העסקה */}
                <Box sx={{ marginBottom: 3 }}>
                  <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                    פרטי העסקה
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>תפקיד</InputLabel>
                        <Select
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          label="תפקיד"
                        >
                          <MenuItem value="גננת">גננת</MenuItem>
                          <MenuItem value="סייעת">סייעת</MenuItem>
                          <MenuItem value="מטפל/ת">מטפל/ת</MenuItem>
                          <MenuItem value="מנהל/ת">מנהל/ת</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        label="תחילת עבודה"
                        value={formData.workStartDate}
                        onChange={(date) => handleDateChange('workStartDate', date)}
                        slotProps={{ textField: { fullWidth: true, variant: "outlined" } }}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>סוג משרה</InputLabel>
                        <Select
                          name="jobType"
                          value={formData.jobType}
                          onChange={handleChange}
                          label="סוג משרה"
                        >
                          <MenuItem value="מלאה">מלאה</MenuItem>
                          <MenuItem value="חלקית">חלקית</MenuItem>
                          <MenuItem value="זמנית">זמנית</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>היקף משרה</InputLabel>
                        <Select
                          name="workHours"
                          value={formData.workHours}
                          onChange={handleChange}
                          label="היקף משרה"
                        >
                          <MenuItem value="100%">100%</MenuItem>
                          <MenuItem value="75%">75%</MenuItem>
                          <MenuItem value="50%">50%</MenuItem>
                          <MenuItem value="25%">25%</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth variant="outlined" sx={{ marginBottom: 2 }}>
                        <InputLabel>שכר לפי</InputLabel>
                        <Select
                          name="salaryType"
                          value={formData.salaryType}
                          onChange={handleChange}
                          label="שכר לפי"
                        >
                          <MenuItem value="שעות">שעות</MenuItem>
                          <MenuItem value="חודשי">חודשי</MenuItem>
                          <MenuItem value="ימים">ימים</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
                
                {/* הערות נוספות */}
                <Box sx={{ marginBottom: 4 }}>
                  <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
                    הערות נוספות
                  </Typography>
                  
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    variant="outlined"
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    type="submit" 
                    variant="contained" 
                    color="primary" 
                    sx={{ 
                      paddingX: 4, 
                      paddingY: 1,
                      fontSize: '1rem',
                      borderRadius: 2
                    }}
                  >
                    שמירה
                  </Button>
                </Box>
              </form>
            </Paper>
          </Container>
        </LocalizationProvider>
    </ThemeProvider>
  );
};

export default NewEmployeeForm;