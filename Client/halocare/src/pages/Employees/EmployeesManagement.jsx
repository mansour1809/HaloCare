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
  Chip,
  CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
// תיקון ייבוא לוקליזציה בעברית
import { heIL as dataGridHeIL } from '@mui/x-data-grid/locales';
import axios from "axios";

const API_URL = 'https://localhost:7225/api';

const EmployeesManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');

  // טעינת נתונים מהשרת
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // טעינת רשימת עובדים
        const employeesResponse = await axios.get(`${API_URL}/Employees`);
        setEmployees(employeesResponse.data);
        
        // טעינת רשימת תפקידים ייחודיים לצורך הסינון
        const uniqueRoles = [...new Set(employeesResponse.data
          .filter(emp => emp.roleName) // מסנן ערכים null או undefined
          .map(emp => emp.roleName))];
        setRoles(uniqueRoles);
        
        setLoading(false);
      } catch (err) {
        console.error('שגיאה בטעינת נתונים:', err);
        setError('שגיאה בטעינת נתוני העובדים. אנא נסה שוב מאוחר יותר.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    try {
      // עדכון מצב העובד בשרת
      await axios.patch(`${API_URL}/Employees/${id}/status`, { isActive: !currentStatus });
      
      // עדכון מצב העובד במצב המקומי
      setEmployees((prev) =>
        prev.map((emp) => (emp.employeeId === id ? { ...emp, isActive: !currentStatus } : emp))
      );
    } catch (err) {
      console.error('שגיאה בעדכון סטטוס העובד:', err);
      setError('שגיאה בעדכון סטטוס העובד. אנא נסה שוב.');
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
  };

  const handleSave = async () => {
    try {
      // שליחת עדכון העובד לשרת
      await axios.put(`${API_URL}/Employees/${selectedEmployee.employeeId}`, selectedEmployee);
      
      // עדכון העובד במצב המקומי
      setEmployees((prev) =>
        prev.map((emp) => (emp.employeeId === selectedEmployee.employeeId ? selectedEmployee : emp))
      );
      handleClose();
    } catch (err) {
      console.error('שגיאה בעדכון פרטי העובד:', err);
      setError('שגיאה בעדכון פרטי העובד. אנא בדוק את הנתונים ונסה שוב.');
    }
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

  // סינון העובדים לפי תפקיד נבחר
  const filteredEmployees = selectedRole 
    ? employees.filter(emp => emp.roleName === selectedRole) 
    : employees;

  // עמודות הטבלה - מותאמות לשדות הטבלה שלך
  const columns = [
    { field: 'employeeId', headerName: 'מזהה', width: 80 },
    { field: 'firstName', headerName: 'שם פרטי', flex: 1 },
    { field: 'lastName', headerName: 'שם משפחה', flex: 1 },
    { 
      field: 'birthDate', 
      headerName: 'תאריך לידה', 
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    },
    { field: 'mobilePhone', headerName: 'טלפון', flex: 1 },
    { field: 'email', headerName: 'דוא"ל', flex: 1.5 },
    { field: 'licenseNum', headerName: 'מספר רישיון', flex: 1 },
    { 
      field: 'startDate', 
      headerName: 'תאריך התחלה', 
      flex: 1,
      valueFormatter: (params) => formatDate(params.value)
    },
    { 
      field: 'roleName', 
      headerName: 'תפקיד', 
      flex: 1,
      renderCell: (params) => params.value || '–'
    },
    { 
      field: 'isActive', 
      headerName: 'סטטוס', 
      flex: 0.8,
      renderCell: (params) => (
        <Switch
          checked={Boolean(params.value)}
          onChange={() => handleToggleActive(params.row.employeeId, params.value)}
          color="primary"
        />
      )
    },
    { 
      field: 'actions', 
      headerName: 'פעולות', 
      flex: 0.8,
      renderCell: (params) => (
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => handleEdit(params.row)}
        >
          ערוך
        </Button>
      )
    },
  ];

  if (loading) {
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
          {/* סינון לפי תפקיד */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>סינון לפי תפקיד</InputLabel>
            <Select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              label="סינון לפי תפקיד"
            >
              <MenuItem value="">הכל</MenuItem>
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <Button 
            variant="contained" 
            color="primary" 
            href="/employees/add"
          >
            הוספת עובד חדש
          </Button>
        </Box>
      </Box>
      
      {selectedRole && (
        <Box sx={{ mb: 2 }}>
          <Chip 
            label={`מציג ${filteredEmployees.length} עובדים בתפקיד: ${selectedRole}`}
            onDelete={() => setSelectedRole('')}
            color="primary"
          />
        </Box>
      )}
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper sx={{ height: 500, width: '100%' }}>
        <DataGrid
          rows={filteredEmployees}
          columns={columns}
          getRowId={(row) => row.employeeId}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          pageSizeOptions={[10, 25, 50]}
          localeText={dataGridHeIL.components.MuiDataGrid.defaultProps.localeText}
          disableRowSelectionOnClick
        />
      </Paper>

      {/* דיאלוג עריכת עובד */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>עריכת עובד</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="שם פרטי"
            value={selectedEmployee?.firstName || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="שם משפחה"
            value={selectedEmployee?.lastName || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="דוא״ל"
            value={selectedEmployee?.email || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="טלפון"
            value={selectedEmployee?.mobilePhone || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, mobilePhone: e.target.value })}
            margin="dense"
          />
          <TextField
            fullWidth
            label="מספר רישיון"
            value={selectedEmployee?.licenseNum || ""}
            onChange={(e) => setSelectedEmployee({ ...selectedEmployee, licenseNum: e.target.value })}
            margin="dense"
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>תפקיד</InputLabel>
            <Select
              value={selectedEmployee?.roleName || ""}
              onChange={(e) => setSelectedEmployee({ ...selectedEmployee, roleName: e.target.value })}
              label="תפקיד"
            >
              {roles.map((role) => (
                <MenuItem key={role} value={role}>{role}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="secondary">ביטול</Button>
          <Button onClick={handleSave} color="primary">שמור</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeesManagement;