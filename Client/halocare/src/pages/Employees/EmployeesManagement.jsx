// src/components/EmployeesManagement.jsx 
import  { useState, useEffect } from "react";
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
  Chip,
  Tab,
  Tabs,
  Tooltip
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from "@mui/icons-material/Edit";
import DescriptionIcon from "@mui/icons-material/Description";
import { Link } from "react-router-dom";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Alert } from '@mui/material';
import FilesList from '../../components/common/FilesList';
import FileUploader from '../../components/common/FileUploader';

// ייבוא הוק הקונטקסט שיצרנו
import { useEmployees } from './EmployeesContext';
import { useDispatch, useSelector } from 'react-redux';
import { clearDocuments, fetchDocumentsByEmployeeId } from '../../Redux/features/documentsSlice';
import EmployeeForm from "./EmployeeForm";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { baseURL } from "../../components/common/axiosConfig";


const theme = createTheme({
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          textAlign: 'center',
          
        },
      },
    },
  },
});

const EmployeesManagement = () => {
  const dispatch = useDispatch();
  
  // שימוש בקונטקסט
  const { 
    employees, 
    roles, 
    classes,
    loading, 
    error, 
    toggleEmployeeStatus,
    refreshEmployees,
    // updateEmployee
  } = useEmployees();
  
  // מצבים מקומיים
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchText, setSearchText] = useState('');
  const [localError, setLocalError] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedEmployeeForDocuments, setSelectedEmployeeForDocuments] = useState(null);
  
  // קבלת המסמכים מהרדקס
  const  documentsStatus = useSelector(state => state.documents.status);
  
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


  // opening documents dialog
  const handleOpenDocuments = (employee) => {
    setSelectedEmployeeForDocuments(employee);
    setDocumentsDialogOpen(true);
    // dispatch(fetchDocumentsByEmployeeId(employee.employeeId));

  };

  // closing documents dialog
  const handleCloseDocuments = () => {
    setActiveTab(0); // reset to the first tab
    dispatch(clearDocuments()); // clear documents from redux store
    setDocumentsDialogOpen(false);
    setSelectedEmployeeForDocuments(null);
  };

  
  // date formatting
  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch (e) {
      return dateString;
    }
  };

    // search color of role in roles 
    const getRoleColor = (roleName) => {
    if (!roleName) return "#9e9e9e"; 
    
    const role = roles.find(r => r.roleName === roleName);
    return role?.description || "#9e9e9e"; 
  };

  const filteredEmployees = employees.filter(emp => {
    // filter by role
    const roleMatch = selectedRole ? emp.roleName === selectedRole : true;
    
    // search engine
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

  // getting class name by classId
  const getClassName = (classId) => {
    if (!classId) return '–';
    const foundClass = classes.find(c => c.classId === classId);
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
      <Box sx={{ height: "100%", width: "100%", padding: 2 }} dir="rtl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{ fontWeight: "bold", color: "#4cb5c3" }}
          >
            ניהול עובדים
          </Typography>

          <Box sx={{ display: "flex", gap: 2 }}>
            {/* חיפוש חופשי */}
            <TextField
              variant="outlined"
              size="small"
              placeholder="חיפוש חופשי..."
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
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
                fontWeight: "medium",
                backgroundColor: "#4cb5c3",
                "&:hover": {
                  backgroundColor: "#3da1af",
                },
              }}
            >
              הוספת עובד חדש
            </Button>
          </Box>
        </Box>

        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localError}
          </Alert>
        )}
        <ThemeProvider theme={theme}>
          <TableContainer
            component={Paper}
            sx={{
              maxWidth: "100%",
              mb: 4,
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              borderRadius: "10px",
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    שם מלא
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    תפקיד
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    כיתה
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    טלפון
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    דוא"ל
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    תאריך התחלה
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    סטטוס
                  </TableCell>
                  <TableCell
                    sx={{
                      fontWeight: "700",
                      fontSize: "1rem",
                    }}
                  >
                    פעולות
                  </TableCell>
                </TableRow>
              </TableHead>
              {filteredEmployees.length > 0 ? (
                <TableBody>
                  {filteredEmployees.map((employee) => (
                    <TableRow
                      key={employee.employeeId}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f9fa" },
                        borderBottom: "1px solid #eee",
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
src={
  employee.photo
    ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(employee.photo)}`
    : ''
}  alt={`${employee.firstName} ${employee.lastName}`}
  sx={{
    width: 40,
    height: 40,
    ml: 1,
    border: "2px solid #fff",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  }}
>
  {!employee.photo && (
    <>
      {employee.firstName && employee.firstName[0]}
      {employee.lastName && employee.lastName[0]}
    </>
  )}
</Avatar>
                          <Typography sx={{ fontWeight: "medium" }}>
                            {`${employee.firstName || ""} ${
                              employee.lastName || ""
                            }`}
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        {employee.roleName ? (
                          <Chip
                            label={employee.roleName}
                            sx={{
                              backgroundColor: getRoleColor(employee.roleName),
                              color: "white",
                              fontWeight: "medium",
                            }}
                            size="small"
                          />
                        ) : (
                          "–"
                        )}
                      </TableCell>
                      <TableCell>{getClassName(employee.classId)}</TableCell>
                      <TableCell dir="ltr">
                        {employee.mobilePhone || "–"}
                      </TableCell>
                      <TableCell>{employee.email || "–"}</TableCell>
                      <TableCell>{formatDate(employee.startDate)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={Boolean(employee.isActive)}
                          onChange={() =>
                            handleToggleActive(
                              employee.employeeId,
                              employee.isActive
                            )
                          }
                          color="primary"
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: "#4cb5c3",
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track":
                              {
                                backgroundColor: "#4cb5c3",
                              },
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="עריכת פרטי עובד">
                            <IconButton
                              sx={{
                                width: 35,
                                height: 35,
                                backgroundColor: "#4cb5c3",
                                "&:hover": { backgroundColor: "#3da1af" },
                                color: "white",
                                transition: "all 0.2s",
                              }}
                              onClick={() => handleEdit(employee)}
                            >
                              <EditIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>

                          <Tooltip title="ניהול מסמכים">
                            <IconButton
                              sx={{
                                width: 35,
                                height: 35,
                                backgroundColor: "#ff9800",
                                "&:hover": { backgroundColor: "#f57c00" },
                                color: "white",
                                transition: "all 0.2s",
                              }}
                              onClick={() => handleOpenDocuments(employee)}
                            >
                              <DescriptionIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
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
        </ThemeProvider>
        {/* דיאלוג עריכת עובד */}
        <Dialog
          open={open}
          onClose={handleClose}
          fullWidth
          maxWidth="md"
          dir="rtl"
        >
          <DialogTitle>
            <IconButton onClick={handleClose}>
              <div style={{ fontSize: "1.5rem" }}>&times;</div>
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {selectedEmployee && (
              <EmployeeForm
                existingEmployee={selectedEmployee}
                
                onSubmitSuccess={() => {
                  handleClose();
                  refreshEmployees();
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* דיאלוג מסמכי עובד */}
        <Dialog
          open={documentsDialogOpen}
          onClose={handleCloseDocuments}
          fullWidth
          maxWidth="md"
          dir="rtl"
          PaperProps={{
            sx: { borderRadius: "10px" },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: "#f8f9fa",
              fontWeight: "bold",
              borderBottom: "1px solid #eee",
              fontSize: "1.5rem",
              color: "#4cb5c3",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box>
              מסמכי עובד: {selectedEmployeeForDocuments?.firstName}{" "}
              {selectedEmployeeForDocuments?.lastName}
            </Box>
            <IconButton onClick={handleCloseDocuments} size="small">
              <div style={{ fontSize: "1.5rem" }}>&times;</div>
            </IconButton>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
          <Tabs
  value={activeTab}
  onChange={(e, newValue) => setActiveTab(newValue)}
  variant="fullWidth"
  sx={{ borderBottom: 1, borderColor: "divider" }}
>
  <Tab label="רשימת מסמכים" value={0} />
  <Tab label="העלאת מסמך חדש" />
</Tabs>

            <Box sx={{ p: 3 }}>
              {activeTab === 0 ? (
                <>
                  {documentsStatus === "loading" ? (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", p: 4 }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : (
                    <FilesList
                      entityId={selectedEmployeeForDocuments?.employeeId}
                      entityType="employee"
                      closeDialog={() => setDocumentsDialogOpen(false)}
                      openDialog={() => setDocumentsDialogOpen(true)}
                      // autoFetch={true}
                      // showFileType={true}
                    />
                  )}
                </>
              ) : (<FileUploader
                entityId={selectedEmployeeForDocuments?.employeeId}
                entityType="employee"
                docType="document"
                buttonText="בחר מסמך להעלאה"
                onSuccess={() => {
                     setActiveTab(0);
                  // רענן את רשימת המסמכים
                  dispatch(
                    fetchDocumentsByEmployeeId(
                      selectedEmployeeForDocuments?.employeeId
                    )
                  );
                }}
                closeDialog={() => setDocumentsDialogOpen(false)}
                openDialog={() => setDocumentsDialogOpen(true)}
              />)}
            </Box>
          </DialogContent>
          <DialogActions sx={{ padding: 2, borderTop: "1px solid #eee" }}>
            <Button
              onClick={handleCloseDocuments}
              variant="contained"
              sx={{
                backgroundColor: "#4cb5c3",
                "&:hover": {
                  backgroundColor: "#3da1af",
                },
                borderRadius: 2,
              }}
            >
              סגור
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default EmployeesManagement;