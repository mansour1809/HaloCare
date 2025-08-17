// src/components/EmployeesManagement.jsx - Fixed and Styled Version
import { useState, useEffect } from "react";
import { 
  Paper, Button, Switch, Dialog, DialogTitle, DialogContent, 
  TextField, Box, FormControl, InputLabel, Select, MenuItem,
  Typography, IconButton, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Avatar,
  Chip, Tooltip, Container, Fade, Zoom, Stack, Breadcrumbs,
  alpha, styled, keyframes,
  Link
} from "@mui/material";
import {
  Person as PersonIcon,
  FilterList as FilterIcon,
  Group as GroupIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon,
  Home as HomeIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { he } from 'date-fns/locale';
import { Alert } from '@mui/material';
import { createTheme, ThemeProvider } from "@mui/material/styles";

// Context and hooks
import { useEmployees } from './EmployeesContext';
import EmployeeForm from "./EmployeeForm";
import { baseURL } from "../../components/common/axiosConfig";
import { useDispatch } from "react-redux";

// Professional animations
const gradientShift = keyframes`
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
`;



const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;


// Theme
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '2.2rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.8rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.4rem'
    }
  },
  palette: {
    primary: {
      main: '#4cb5c3',
      light: '#7ec8d3',
      dark: '#2a8a95',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff7043',
      light: '#ff9575',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  components: {
    MuiTableCell: {
      styleOverrides: {
        root: {
          textAlign: 'center',
          fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
          fontSize: '1rem',
          padding: '16px 12px'
        },
        head: {
          backgroundColor: 'rgba(76, 181, 195, 0.05)',
          fontWeight: 700,
          fontSize: '1.1rem',
          color: '#2a8a95',
          borderBottom: '2px solid rgba(76, 181, 195, 0.2)'
        }
      },
    }
  }
});

// Styled Components
const FullScreenContainer = styled(Box)(() => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: `${gradientShift} 20s ease infinite`,
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 2,
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s ease infinite`,
  }
}));
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: 20,
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
  }
}));

const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  color: 'white',
  boxShadow: '0 6px 20px rgba(76, 181, 195, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-3px)',
    boxShadow: '0 12px 35px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
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

const EnhancedBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(2),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 16,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  '& .MuiBreadcrumbs-separator': {
    color: theme.palette.primary.main,
  },
  '& .MuiBreadcrumbs-li': {
    '& a': {
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      padding: '4px 8px',
      borderRadius: 8,
      '&:hover': {
        background: 'rgba(76, 181, 195, 0.1)',
        transform: 'translateY(-2px)',
      }
    }
  }
}));

const StyledLink = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  color: theme.palette.text.secondary,
  textDecoration: 'none',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: theme.palette.primary.main,
    '& svg': {
      transform: 'scale(1.2) rotate(10deg)',
    }
  },
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    transition: 'transform 0.3s ease',
  }
}));

const CurrentPage = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  fontWeight: 700,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  '& svg': {
    marginRight: theme.spacing(0.5),
    fontSize: 'small',
    color: theme.palette.primary.main,
  }
}));


const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 15px rgba(76, 181, 195, 0.15)',
    },
    '&:hover fieldset': {
      borderColor: '#4cb5c3',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#4cb5c3',
      borderWidth: 2,
    }
  }
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: 12,
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(76, 181, 195, 0.3)',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: '#4cb5c3',
    borderWidth: 2,
  }
}));


const EmployeesManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { 
    employees, 
    roles, 
    classes,
    loading, 
    error, 
    toggleEmployeeStatus,
    refreshEmployees,
  } = useEmployees();
  
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [searchText, setSearchText] = useState('');
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    refreshEmployees();
  }, []);

  const handleToggleActive = async (id, currentStatus) => {
    const result = await toggleEmployeeStatus(id, currentStatus);
    if (!result.success) {
      setLocalError(result.error);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedEmployee(null);
    setLocalError("");
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'NULL') return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('he-IL');
    } catch (error) {
      console.error("Error parsing date:", error);
      return dateString;
    }
  };

  const getRoleColor = (roleName) => {
    if (!roleName) return "#9e9e9e"; 
    const role = roles.find(r => r.roleName === roleName);
    return role?.description || "#9e9e9e"; 
  };

  const filteredEmployees = employees.filter(emp => {
    const roleMatch = selectedRole ? emp.roleName === selectedRole : true;
    
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

  const getClassName = (classId) => {
    if (!classId) return '–';
    const foundClass = classes.find(c => c.classId === classId);
    return foundClass ? foundClass.className : classId.toString();
  };

  const getStats = () => {
    return {
      total: employees.length,
      active: employees.filter(emp => emp.isActive).length,
      inactive: employees.filter(emp => !emp.isActive).length,
      roles: [...new Set(employees.map(emp => emp.roleName).filter(Boolean))].length
    };
  };

  const stats = getStats();

  if (loading && !employees.length) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <Box sx={{ direction: 'rtl' }}>
          <FullScreenContainer>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center', 
              justifyContent: 'center',
              minHeight: '100vh',
              position: 'relative',
              zIndex: 2
            }}>
              <CircularProgress size={80} thickness={4} sx={{ color: 'white', mb: 3 }} />
              <Typography variant="h5" sx={{ 
                color: 'white',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                fontWeight: 600
              }}>
                🔄 טוען נתוני עובדים...
              </Typography>
            </Box>
          </FullScreenContainer>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={rtlTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={he}>
            <FullScreenContainer>
              <Box sx={{ p: 3, position: 'relative', zIndex: 2 }} dir="rtl">
            
            {/* Fixed Breadcrumbs */}
               <EnhancedBreadcrumbs> 
                                <StyledLink
                                  underline="hover"
                                  onClick={() => navigate('/')}
                                >
                                  <HomeIcon />
                                  ראשי
                                </StyledLink>
                                
                            
                                <CurrentPage>
                                  <GroupIcon />
                                  ניהול עובדים
                                </CurrentPage>
                              </EnhancedBreadcrumbs>

          
            {/* <Container maxWidth="xl" sx={{ py: 4, position: 'relative', zIndex: 2 }} dir="rtl"> */}
              
              {/* Modern headline */}
              <Fade in timeout={800}>
                <ModernHeader elevation={0}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" sx={{ 
                      fontWeight: 700,
                      background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <GroupIcon sx={{ mr: 2, fontSize: '2.5rem', color: '#4cb5c3' }} />
                      ניהול עובדים
                    </Typography>

                    <AnimatedButton
                      variant="contained"
                      onClick={() => navigate('/employees/add')}
                      startIcon={<AddIcon />}
                    >
                      הוספת עובד חדש
                    </AnimatedButton>
                  </Box>

                  {/* Statistics */}
                  <Stack direction="row" spacing={3} sx={{ mt: 3 }}>
                    <StyledChip
                      icon={<GroupIcon />}
                      label={`${stats.total} אנשי צוות`}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.15) 0%, rgba(76, 181, 195, 0.05) 100%)',
                        color: '#2a8a95',
                        border: '1px solid rgba(76, 181, 195, 0.3)',
                        fontSize: '1rem',
                        px: 2,
                        py: 1,
                        height: 'auto'
                      }}
                      size="medium"
                    />
                    <StyledChip
                      icon={<CelebrationIcon />}
                      label={`${stats.active} פעילים`}
                      sx={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
                        color: '#059669',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        fontSize: '1rem',
                        px: 2,
                        py: 1,
                        height: 'auto'
                      }}
                      size="medium"
                    />
                  </Stack>
                </ModernHeader>
              </Fade>

              {/* Searchbar and filters */}
              <Zoom in timeout={1000}>
                <Paper dir="rtl" sx={{ 
                  p: 3, 
                  mb: 3,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  position: 'relative',
                  zIndex: 2,
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
                    borderRadius: '4px 4px 0 0',
                  }
                }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
                    <StyledTextField
                      variant="outlined"
                      size="medium"
                      placeholder="🔍 חיפוש חופשי בשם, מייל או טלפון..."
                      value={searchText}
                      onChange={(event) => setSearchText(event.target.value)}
                      sx={{ flex: 1 }}
                      fullWidth
                    />

                    <FormControl sx={{ minWidth: 250 }}>
                      <InputLabel sx={{ color: '#4cb5c3', fontWeight: 600 }}>
                        <FilterIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        סינון לפי תפקיד
                      </InputLabel>
                      <StyledSelect
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        label="סינון לפי תפקיד"
                      >
                        <MenuItem value="">🌟 הכל</MenuItem>
                        {roles.map((role) => (
                          <MenuItem key={role.roleName} value={role.roleName}>
                            {role.roleName}
                          </MenuItem>
                        ))}
                      </StyledSelect>
                    </FormControl>
                  </Stack>
                </Paper>
              </Zoom>

              {/* Errors */}
              {(error || localError) && (
                <Fade in timeout={500}>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 3,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    ❌ {error || localError}
                  </Alert>
                </Fade>
              )}

              {/* Employees table */}
              <Fade in timeout={1200}>
                <StyledTableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>👤 שם מלא</TableCell>
                        <TableCell>🎯 תפקיד</TableCell>
                        <TableCell>🏫 כיתה</TableCell>
                        <TableCell>📱 טלפון</TableCell>
                        <TableCell>📧 דוא"ל</TableCell>
                        <TableCell>📅 תחילת עבודה</TableCell>
                        <TableCell>🔐 סטטוס</TableCell>
                        <TableCell>⚡ פעולות</TableCell>
                      </TableRow>
                    </TableHead>
                    {filteredEmployees.length > 0 ? (
                      <TableBody>
                        {filteredEmployees.map((employee, index) => (
                          <TableRow
                            key={employee.employeeId}
                            sx={{
                              "&:hover": { 
                                backgroundColor: "rgba(76, 181, 195, 0.05)",
                                transform: 'scale(1.01)',
                                transition: 'all 0.3s ease'
                              },
                              borderBottom: "1px solid rgba(76, 181, 195, 0.1)",
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                                <Avatar
                                  src={
                                    employee.photo
                                      ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(employee.photo)}`
                                      : ''
                                  }  
                                  alt={`${employee.firstName} ${employee.lastName}`}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    border: "3px solid rgba(76, 181, 195, 0.3)",
                                    boxShadow: "0 4px 12px rgba(76, 181, 195, 0.2)",
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                      transform: 'scale(1.1)',
                                      boxShadow: "0 6px 20px rgba(76, 181, 195, 0.4)",
                                    }
                                  }}
                                >
                                  {!employee.photo && (
                                    <>
                                      {employee.firstName && employee.firstName[0]}
                                      {employee.lastName && employee.lastName[0]}
                                    </>
                                  )}
                                </Avatar>
                                
                                <Typography sx={{ 
                                  fontWeight: 600,
                                  fontSize: '1.1rem',
                                  color: '#2a8a95',
                                  ml: 2,
                                }}>
                                  {`${employee.firstName || ""} ${employee.lastName || ""}`}
                                </Typography>
                              </Box>
                            </TableCell>

                            <TableCell>
                              {employee.roleName ? (
                                <StyledChip
                                  label={employee.roleName}
                                  sx={{
                                    backgroundColor: getRoleColor(employee.roleName),
                                    color: "white",
                                    fontWeight: 700,
                                    fontSize: '0.9rem',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                                  }}
                                  size="medium"
                                />
                              ) : (
                                <Typography color="text.secondary">–</Typography>
                              )}
                            </TableCell>
                            
                            <TableCell>
                              <Typography fontWeight={500} color="text.primary">
                                {getClassName(employee.classId)}
                              </Typography>
                            </TableCell>
                            
                            <TableCell dir="ltr">
                              <Typography fontWeight={500} color="text.primary">
                                {employee.mobilePhone || "–"}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Typography fontWeight={500} color="text.primary" sx={{ fontSize: '0.9rem' }}>
                                {employee.email || "–"}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Typography fontWeight={500} color="text.primary">
                                {formatDate(employee.startDate)}
                              </Typography>
                            </TableCell>
                            
                            <TableCell>
                              <Switch
                                checked={Boolean(employee.isActive)}
                                onChange={() =>
                                  handleToggleActive(
                                    employee.employeeId,
                                    employee.isActive
                                  )
                                }
                                sx={{
                                  "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "#10b981",
                                  },
                                  "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "#10b981",
                                  },
                                  "& .MuiSwitch-track": {
                                    backgroundColor: "#ef4444",
                                  },
                                  transform: 'scale(1.2)'
                                }}
                              />
                            </TableCell>
                            
                            <TableCell>
                              <Tooltip placement="top" 
                                PopperProps={{
                                  disablePortal: true,
                                  modifiers: [
                                    {
                                      name: 'flip',
                                      enabled: false 
                                    },
                                    {
                                      name: 'preventOverflow',
                                      options: {
                                        boundary: 'window', 
                                      },
                                    },
                                  ],
                                }}
                                title="פרופיל עובד"
                              >
                                <IconButton
                                  sx={{
                                    width: 45,
                                    height: 45,
                                    background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                                    color: "white",
                                    transition: "all 0.3s ease",
                                    boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)',
                                    "&:hover": { 
                                      background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
                                      transform: 'scale(1.1) rotate(10deg)',
                                      boxShadow: '0 6px 20px rgba(76, 181, 195, 0.4)',
                                    },
                                  }}
                                  onClick={() => navigate(`/employees/profile/${employee.employeeId}`)}
                                >
                                  <PersonIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    ) : (
                      <TableBody>
                        <TableRow>
                          <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                            <Box sx={{ textAlign: 'center' }}>
                              <AutoAwesomeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                              <Typography variant="h6" color="text.secondary" gutterBottom>
                                🔍 לא נמצאו עובדים
                              </Typography>
                              <Typography color="text.secondary">
                                נסה לשנות את מונחי החיפוש או הסינון
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    )}
                  </Table>
                </StyledTableContainer>
              </Fade>

              {/* Edit employee dialog */}
              <Dialog
                open={open}
                onClose={handleClose}
                fullWidth
                maxWidth="md"
                dir="rtl"
                PaperProps={{
                  sx: {
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '2px solid rgba(76, 181, 195, 0.3)',
                  }
                }}
              >
                <DialogTitle sx={{
                  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '1.3rem',
                  fontWeight: 600
                }}>
                  ✏️ עריכת עובד
                  <IconButton 
                    onClick={handleClose}
                    sx={{ color: 'white' }}
                  >
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
            {/* </Container> */}
          </Box>
        </FullScreenContainer>
      </LocalizationProvider>
    </ThemeProvider>
  );
};

export default EmployeesManagement;