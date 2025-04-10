// src/components/EmployeesManagement.jsx - גרסה משודרגת
import React, { useState, useEffect } from "react";
import { 
  Paper, 
  Button, 
  Switch, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  TextField, 
  DialogActions,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  IconButton,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  InputAdornment,
  Chip
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from "@mui/icons-material/Edit";
import { Link } from "react-router-dom";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Alert, Grid } from '@mui/material';


// ייבוא הוק הקונטקסט שיצרנו
import { useEmployees } from './EmployeesContext';

// פונקציה להפקת צבע עקבי לפי תפקיד
const getRoleColor = (roleName) => {
  if (!roleName) return "#9e9e9e"; // צבע ברירת מחדל לתפקידים ריקים
  
  // מיפוי תפקידים לצבעים
  const roleColors = {
    "גננת": "#4caf50", // ירוק
    "מטפל רגשי": "#2196f3", // כחול
    "מנהלת": "#9c27b0", // סגול
    "פיזיותרפיסט": "#ff9800", // כתום
    "מרפא בעיסוק": "#e91e63", // ורוד
    "מזכירה": "#607d8b", // אפור כחול
    "קלינאי תקשורת": "#009688" // טורקיז
  };
  
  // החזרת צבע מהמיפוי או חישוב צבע אקראי-אך-עקבי לתפקידים חדשים
  if (roleColors[roleName]) {
    return roleColors[roleName];
  } else {
    // חישוב צבע עקבי לפי טקסט
    let hash = 0;
    for (let i = 0; i < roleName.length; i++) {
      hash = roleName.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }
};

const EmployeesManagement = () => {
  // שימוש בקונטקסט
  const { 
    employees, 
    roles, 
    classes,
    loading, 
    error, 
    updateEmployee, 
    toggleEmployeeStatus,
    refreshEmployees
  } = useEmployees();
  
  // מצבים מקומיים
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchText, setSearchText] = useState('');
  const [localError, setLocalError] = useState("");

  // רענון נתונים בעלייה
  useEffect(() => {
    refreshEmployees();
  }, []);

  // פונקציות לניהול דיאלוג עריכה
  const handleToggleActive = async (id, currentStatus) => {
    const result = await toggleEmployeeStatus(id, currentStatus);
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
    setLocalError("");
  };

  const handleSave = async () => {
    const result = await updateEmployee(selectedEmployee);
    if (result.success) {
      handleClose();
    } else {
      setLocalError(result.error);
    }
  };

  // סינון ממשקי
  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  // פורמוט התאריך
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch (e) {
      return dateString;
    }
  };

  // סינון העובדים
  const filteredEmployees = employees.filter(emp => {
    // סינון לפי תפקיד
    const roleMatch = selectedRole ? emp.roleName === selectedRole : true;
    
    // חיפוש טקסט חופשי
    if (!searchText) return roleMatch;
    
    const searchLower = searchText.toLowerCase();
    
    return roleMatch && (
      (emp.firstName && emp.firstName.toLowerCase().includes(searchLower)) ||
      (emp.lastName && emp.lastName.toLowerCase().includes(searchLower)) ||
      (emp.email && emp.email.toLowerCase().includes(searchLower)) ||
      (emp.mobilePhone && emp.mobilePhone.includes(searchText)) ||
      (emp.roleName && emp.roleName.toLowerCase().includes(searchLower))
    );
  });

  // מציאת שם כיתה לפי מזהה
  const getClassName = (classId) => {
    if (!classId) return '–';
    const foundClass = classes.find(c => c.id === classId);
    return foundClass ? foundClass.className : classId.toString();
  };

  if (loading && !employees.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
      <Box sx={{ height: '100%', width: '100%', padding: 2 }} dir="rtl">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
            ניהול עובדים
          </Typography>
          
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* חיפוש חופשי */}
          <TextField
            variant="outlined"
            size="small"
            placeholder="חיפוש חופשי..."
            value={searchText}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
          
          {/* סינון לפי תפקיד */}
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>סינון לפי תפקיד</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="סינון לפי תפקיד"
            >
              <MenuItem value="">הכל</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role.roleName} value={role.roleName}>
                  {role.roleName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link}
            to="/employees/add"
            sx={{ 
              fontWeight: 'medium',
              backgroundColor: '#4cb5c3',
              '&:hover': {
                backgroundColor: '#3da1af',
              }
            }}
          >
            הוספת עובד חדש
          </Button>
        </Box>
      </Box>
      
      {(error || localError) && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error || localError}
        </Typography>
      )}
      
      <TableContainer 
        component={Paper} 
        sx={{ 
          maxWidth: "100%", 
          mb: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>שם מלא</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>תפקיד</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>כיתה</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>טלפון</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>דוא"ל</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>תאריך התחלה</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>סטטוס</TableCell>
              <TableCell sx={{ fontWeight: '700', fontSize: '1rem' , textAlign: 'center' }}>פעולות</TableCell>
            </TableRow>
          </TableHead>
          {filteredEmployees.length > 0 ? (
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.employeeId}
                  sx={{ 
                    "&:hover": { backgroundColor: "#f5f9fa" },
                    borderBottom: '1px solid #eee'
                  }}
                >
                  <TableCell >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {employee.photoPath ? (
                        <Avatar 
                          src={employee.photoPath} 
                          alt={`${employee.firstName} ${employee.lastName}`}
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            ml: 1,
                            border: '2px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }}
                        />
                      ) : (
                        <Avatar
                          sx={{ 
                            width: 40, 
                            height: 40, 
                            ml: 1,
                            backgroundColor: '#4cb5c3',
                            color: 'white'
                          }}
                        >
                          {employee.firstName && employee.firstName[0]}
                          {employee.lastName && employee.lastName[0]}
                        </Avatar>
                      )}
                      <Typography sx={{ fontWeight: 'medium' }}>
                        {`${employee.firstName || ''} ${employee.lastName || ''}`}
                      </Typography>
                    </Box>
                  </TableCell>
                  
                  <TableCell align="center">
                    {employee.roleName ? (
                      <Chip
                        label={employee.roleName}
                        sx={{
                          backgroundColor: getRoleColor(employee.roleName),
                          color: 'white',
                          fontWeight: 'medium'
                        }}
                        size="small"
                      />
                    ) : (
                      '–'
                    )}
                  </TableCell>
                  <TableCell align="center">{getClassName(employee.classId)}</TableCell>
                  <TableCell align="center" dir="ltr">
                    {employee.mobilePhone ? (
                      <Typography
                        component="a"
                        href={`tel:${employee.mobilePhone}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: '#4cb5c3' }
                        }}
                      >
                        {employee.mobilePhone}
                      </Typography>
                    ) : (
                      '–'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {employee.email ? (
                      <Typography
                        component="a"
                        href={`mailto:${employee.email}`}
                        sx={{
                          textDecoration: 'none',
                          color: 'text.primary',
                          '&:hover': { color: '#4cb5c3' }
                        }}
                      >
                        {employee.email}
                      </Typography>
                    ) : (
                      '–'
                    )}
                  </TableCell>
                  <TableCell align="center">{formatDate(employee.startDate)}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={Boolean(employee.isActive)}
                      onChange={() => handleToggleActive(employee.employeeId, employee.isActive)}
                      color="primary"
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#4cb5c3',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#4cb5c3',
                        },
                      }}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        sx={{
                          width: 35,
                          height: 35,
                          backgroundColor: "#4cb5c3",
                          "&:hover": { backgroundColor: "#3da1af" },
                          color: "white",
                          transition: 'all 0.2s'
                        }}
                        onClick={() => handleEdit(employee)}
                      >
                        <EditIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    לא נמצאו עובדים
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* דיאלוג עריכת עובד */}
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md" // הגדלנו את הדיאלוג לגודל בינוני
        dir="rtl"
        PaperProps={{
          sx: { borderRadius: '10px' }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f8f9fa', 
          fontWeight: 'bold',
          borderBottom: '1px solid #eee',
          fontSize: '1.5rem',
          color: '#4cb5c3'
        }}>
          עריכת פרטי עובד
        </DialogTitle>
        <DialogContent sx={{ padding: 3, paddingTop: 3 }}>
          {localError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {localError}
            </Alert>
          )}
          
          {/* פרטים אישיים */}
          <Box sx={{ marginBottom: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
              פרטים אישיים
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם פרטי"
                  value={selectedEmployee?.firstName || ""}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="שם משפחה"
                  value={selectedEmployee?.lastName || ""}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
                  variant="outlined"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="תאריך לידה"
                  value={selectedEmployee?.birthDate ? new Date(selectedEmployee.birthDate) : null}
                  onChange={(date) => setSelectedEmployee({ ...selectedEmployee, birthDate: date })}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true, 
                      variant: "outlined" 
                    } 
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="טלפון נייד"
                  value={selectedEmployee?.mobilePhone || ""}
                  onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mobilePhone: e.target.value })}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>
          
          {/* פרטי תפקיד */}
          <Box>
            <Typography variant="subtitle1" sx={{ color: '#4cb5c3', fontWeight: 'bold', marginBottom: 2 }}>
              פרטי תפקיד
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>תפקיד</InputLabel>
                  <Select
                    value={selectedEmployee?.roleName || ""}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, roleName: e.target.value })}
                    label="תפקיד"
                    required
                  >
                    {roles.map((role) => (
                      <MenuItem key={role.roleName} value={role.roleName}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box 
                            sx={{ 
                              width: 12, 
                              height: 12, 
                              borderRadius: '50%', 
                              bgcolor: getRoleColor(role.roleName),
                              mr: 1
                            }} 
                          />
                          {role.roleName}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>שיוך לכיתה</InputLabel>
                  <Select
                    value={selectedEmployee?.classId || ""}
                    onChange={(e) => setSelectedEmployee({ ...selectedEmployee, classId: e.target.value })}
                    label="שיוך לכיתה"
                  >
                    <MenuItem value="">ללא שיוך</MenuItem>
                    {classes.map((cls) => (
                      <MenuItem key={cls.id} value={cls.id}>{cls.className}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ padding: 2, borderTop: '1px solid #eee' }}>
          <Button 
            onClick={handleClose} 
            variant="outlined" 
            sx={{ borderRadius: 2 }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleSave} 
            variant="contained" 
            sx={{ 
              backgroundColor: '#4cb5c3',
              '&:hover': {
                backgroundColor: '#3da1af',
              },
              borderRadius: 2
            }}
          >
            שמור שינויים
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    </LocalizationProvider>
  );
};

export default EmployeesManagement;