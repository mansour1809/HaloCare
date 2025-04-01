// src/components/EmployeesManagement.jsx - גרסה מפושטת
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
  InputAdornment
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from "@mui/icons-material/Edit";
import { Link, useNavigate } from "react-router-dom";

// ייבוא הוק הקונטקסט שיצרנו
import { useEmployees } from './EmployeesContext';

const EmployeesManagement = () => {
  const navigate = useNavigate();
  
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
  }, [refreshEmployees]);

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
    <Box sx={{ height: '100%', width: '100%', padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold' }}>
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
                <MenuItem key={role.roleName} value={role.roleName}>{role.roleName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            component={Link}
            to="/employees/add"
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
      
      <TableContainer component={Paper} sx={{ maxWidth: "100%", mb: 4 , direction : "ltr" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center" sx={{ width: "10%" }}>פעולות</TableCell>
              <TableCell align="center">שם מלא</TableCell>
              <TableCell align="center">טלפון</TableCell>
              <TableCell align="center">דוא"ל</TableCell>

              <TableCell align="center">כיתה</TableCell>

              <TableCell align="center">תאריך התחלה</TableCell>
              <TableCell align="center">תפקיד</TableCell>

              <TableCell align="center">סטטוס</TableCell>
            </TableRow>
          </TableHead>
          {filteredEmployees.length > 0 ? (
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow
                  key={employee.employeeId}
                  sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                >
                  <TableCell align="center">
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                      <IconButton
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: "primary.main",
                          "&:hover": { backgroundColor: "primary.dark" },
                          color: "white",
                        }}
                        onClick={() => handleEdit(employee)}
                      >
                        <EditIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {employee.photoPath && (
                        <Avatar 
                          src={employee.photoPath} 
                          alt={`${employee.firstName} ${employee.lastName}`}
                          sx={{ width: 40, height: 40, mr: 1 }}
                        />
                      )}
                      <Typography>{`${employee.firstName} ${employee.lastName}`}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{employee.mobilePhone || '–'}</TableCell>
                  <TableCell align="center">{employee.email || '–'}</TableCell>
                  <TableCell align="center">{getClassName(employee.classId)}</TableCell>
                  <TableCell align="center">{formatDate(employee.startDate)}</TableCell>
                  <TableCell align="center">{employee.roleName || '–'}</TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={Boolean(employee.isActive)}
                      onChange={() => handleToggleActive(employee.employeeId, employee.isActive)}
                      color="primary"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          ) : (
            <TableBody>
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: "red" }}>
                  לא נמצאו עובדים
                </TableCell>
              </TableRow>
            </TableBody>
          )}
        </Table>
      </TableContainer>

      {/* דיאלוג עריכת עובד */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" dir="rtl">
        <DialogTitle>עריכת עובד</DialogTitle>
        <DialogContent>
          {localError && (
            <Typography color="error" variant="body2" sx={{ mb: 2 }}>
              {localError}
            </Typography>
          )}
          <TextField
            fullWidth
            label="שם פרטי"
            value={selectedEmployee?.firstName || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="שם משפחה"
            value={selectedEmployee?.lastName || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="דוא״ל"
            type="email"
            value={selectedEmployee?.email || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="טלפון"
            value={selectedEmployee?.mobilePhone || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mobilePhone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="מספר רישיון"
            value={selectedEmployee?.licenseNum || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, licenseNum: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>תפקיד</InputLabel>
            <Select
              value={selectedEmployee?.roleName || ""}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, roleName: e.target.value })}
              label="תפקיד"
              required
            >
              {roles.map((role) => (
                <MenuItem key={role.roleName} value={role.roleName}>{role.roleName}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>כיתה</InputLabel>
            <Select
              value={selectedEmployee?.classId || ""}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, classId: e.target.value })}
              label="כיתה"
            >
              <MenuItem value="">ללא שיוך</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>{cls.className}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">ביטול</Button>
          <Button onClick={handleSave} color="primary" variant="contained">שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesManagement;