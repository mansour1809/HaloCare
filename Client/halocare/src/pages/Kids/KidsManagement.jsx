// src/components/kids/KidsManagement.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Avatar, 
  Button, 
  IconButton, 
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  Chip,
  Breadcrumbs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Tooltip,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon,
  Visibility as VisibilityIcon,
  Home as HomeIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { fetchKids } from '../../Redux/features/kidsSlice';
import axios from 'axios';
import Swal from 'sweetalert2';
import { fetchDocumentsByKidId, clearDocuments } from '../../Redux/features/documentsSlice';
import FilesList from '../../components/common/FilesList';
import FileUploader from '../../components/common/FileUploader';
import { createTheme, ThemeProvider } from "@mui/material/styles";

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

import { baseURL } from "../../components/common/axiosConfig";

const KidsManagement = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kids, status, error } = useSelector(state => state.kids);
  const documentsStatus = useSelector(state => state.documents.status);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [documentsDialogOpen, setDocumentsDialogOpen] = useState(false);
  const [selectedKidForDocuments, setSelectedKidForDocuments] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [localError, setLocalError] = useState("");
  
  // רשימת הכיתות הייחודיות
  const classes = [...new Set(kids.map(kid => kid.classId).filter(Boolean))];
  
  useEffect(() => {
    dispatch(fetchKids());
  }, [dispatch]);
  
  // פילטור הילדים
  const filteredKids = kids.filter(kid => {
    // סינון לפי חיפוש
    const searchLower = searchTerm.toLowerCase();
    const searchMatch = !searchTerm ? true : 
      (kid.firstName && kid.firstName.toLowerCase().includes(searchLower)) ||
      (kid.lastName && kid.lastName.toLowerCase().includes(searchLower)) ||
      (kid.gender && kid.gender.toLowerCase().includes(searchLower));
    
    // סינון לפי כיתה
    const classMatch = !classFilter ? true : kid.classId === classFilter;
    
    return searchMatch && classMatch;
  });
  
  const handleViewKidProfile = (kidId) => {
    navigate(`/kids/${kidId}`);
  };
  
  const calculateAge = (birthDateString) => {
  if (!birthDateString) return '–';

  const birthDate = new Date(birthDateString);
  const today = new Date();

  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  const days = today.getDate() - birthDate.getDate();

  // Adjust if current month/day is before birthday month/day
  if (months < 0 || (months === 0 && days < 0)) {
    years--;
    months += 12;
  }

  // Include partial months as decimals
  const age = years + months / 12;

  return age.toFixed(1); // rounded to 1 decimal place, e.g., 5.3
};

  
  // טיפול בשינוי סטטוס
  const handleToggleActive = async (kidId, currentStatus) => {
    try {
      // שאלת אישור לפני שינוי הסטטוס
      const result = await Swal.fire({
        icon: 'question',
        title: `האם אתה בטוח שברצונך ${currentStatus ? 'להשבית' : 'להפעיל'} את הילד?`,
        text: `הילד יהיה ${currentStatus ? 'לא פעיל' : 'פעיל'} במערכת`,
        showCancelButton: true,
        confirmButtonText: 'כן, בצע שינוי',
        cancelButtonText: 'ביטול',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
      if (!result.isConfirmed) {
        return { success: false };
      }
      
      // עדכון מצב הילד בשרת
      await axios.patch(`/Kids/${kidId}/deactivate`, {
        isActive: !currentStatus,
      });
      
      // רענון רשימת הילדים
      dispatch(fetchKids());
      
      // הצגת הודעת הצלחה
      Swal.fire({
        icon: 'success',
        title: 'הסטטוס עודכן בהצלחה!',
        text: `הילד ${!currentStatus ? 'פעיל' : 'לא פעיל'} כעת`,
        confirmButtonText: 'אישור',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
      return { success: true };
    } catch (err) {
      console.error("שגיאה בעדכון סטטוס הילד:", err);
      
      Swal.fire({
        icon: 'error',
        title: 'שגיאה!',
        text: "שגיאה בעדכון סטטוס הילד. אנא נסה שוב.",
        confirmButtonText: 'אישור',
        customClass: {
          container: 'swal-rtl'
        }
      });
      
      setLocalError("שגיאה בעדכון סטטוס הילד. אנא נסה שוב.");
      return {
        success: false,
        error: "שגיאה בעדכון סטטוס הילד. אנא נסה שוב.",
      };
    }
  };
  
  // פתיחת דיאלוג מסמכים
  const handleOpenDocuments = (kid) => {
    setSelectedKidForDocuments(kid);
    setDocumentsDialogOpen(true);
    dispatch(fetchDocumentsByKidId(kid.id));
  };
  
  // סגירת דיאלוג מסמכים
  const handleCloseDocuments = () => {
    setActiveTab(0); // איפוס לטאב הראשון
    dispatch(clearDocuments()); // ניקוי מסמכים מהסטור
    setDocumentsDialogOpen(false);
    setSelectedKidForDocuments(null);
  };
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 3 }} dir="rtl">
        {/* Breadcrumbs */}
         <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/')}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          ראשי
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          color="inherit"
          onClick={() => navigate('/kids/list')}
        >
          <GroupIcon sx={{ mr: 0.5, fontSize: 'small' }} />
          רשימת ילדים
        </Link>

        <Typography color="text.primary" sx={{ fontWeight: 'medium' }}>
          {/* {getTreatmentName(treatmentType) ? `טיפולי ${getTreatmentName(treatmentType)}` : 'סיכומי טיפולים'} */}
        </Typography>
      </Breadcrumbs>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: '#4cb5c3' }}>
            ניהול ילדים
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* חיפוש חופשי */}
            <TextField
              variant="outlined"
              size="small"
              placeholder="חיפוש חופשי..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ width: 250 }}
            />
            
            {/* סינון לפי כיתה */}
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>סינון לפי כיתה</InputLabel>
              <Select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                label="סינון לפי כיתה"
              >
                <MenuItem value="">הכל</MenuItem>
                {classes.map((classId) => (
                  <MenuItem key={classId} value={classId}>
                    {classId}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/kids/add')}
              sx={{
                fontWeight: "medium",
                backgroundColor: "#4cb5c3",
                "&:hover": {
                  backgroundColor: "#3da1af",
                },
              }}
            >
              הוספת ילד חדש
            </Button>
          </Box>
        </Box>
        
        {(error || localError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || localError}
          </Alert>
        )}
        
        {status === 'loading' && !kids.length && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <CircularProgress />
          </Box>
        )}
        
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
                  גיל
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
                  מגדר
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
            {filteredKids.length > 0 ? (
              <TableBody>
                {filteredKids.map((kid) => (
                  <TableRow
                    key={kid.id}
                    sx={{
                      "&:hover": { backgroundColor: "#f5f9fa" },
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Avatar
                          src={kid.photo ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(kid.photo)}` : ''}
                          alt={`${kid.firstName} ${kid.lastName}`}
                          sx={{
                            width: 40,
                            height: 40,
                            ml: 1,
                            border: "2px solid #fff",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                          }}
                        >
                          {!kid.photo && (
                            <>
                              {kid.firstName && kid.firstName[0]}
                              {kid.lastName && kid.lastName[0]}
                            </>
                          )}
                        </Avatar>
                        <Typography sx={{ fontWeight: "medium" }}>
                          {`${kid.firstName || ""} ${kid.lastName || ""}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{calculateAge(kid.birthDate)}</TableCell>
                    <TableCell>{kid.classId || "–"}</TableCell>
                    <TableCell>
                      {kid.gender ? (
                        <Chip
                          label={kid.gender === 'male' ? 'זכר' : 'נקבה'}
                          sx={{
                            backgroundColor: kid.gender === 'male' ? '#bbdefb' : '#f8bbd0',
                            color: kid.gender === 'male' ? '#1565c0' : '#c2185b',
                            fontWeight: "medium",
                          }}
                          size="small"
                        />
                      ) : (
                        "–"
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={Boolean(kid.isActive)}
                        onChange={() => handleToggleActive(kid.id, kid.isActive)}
                        color="primary"
                        sx={{
                          "& .MuiSwitch-switchBase.Mui-checked": {
                            color: "#4cb5c3",
                          },
                          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                            backgroundColor: "#4cb5c3",
                          },
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="צפייה בפרופיל הילד">
                          <IconButton
                            sx={{
                              width: 35,
                              height: 35,
                              backgroundColor: "#4cb5c3",
                              "&:hover": { backgroundColor: "#3da1af" },
                              color: "white",
                              transition: "all 0.2s",
                            }}
                            onClick={() => handleViewKidProfile(kid.id)}
                          >
                            <VisibilityIcon sx={{ fontSize: 18 }} />
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
                            onClick={() => handleOpenDocuments(kid)}
                          >
                            {/* <DescriptionIcon sx={{ fontSize: 18 }} /> */}
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
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      לא נמצאו ילדים
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </TableContainer>
        
        {/* דיאלוג מסמכי ילד */}
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
              מסמכי ילד: {selectedKidForDocuments?.firstName}{" "}
              {selectedKidForDocuments?.lastName}
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
              <Tab label="העלאת מסמך חדש" value={1} />
            </Tabs>
            
            <Box sx={{ p: 3 }}>
              {activeTab === 0 ? (
                <>
                  {documentsStatus === "loading" ? (
                    <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <FilesList
                      entityId={selectedKidForDocuments?.id}
                      entityType="kid"
                      closeDialog={() => setDocumentsDialogOpen(false)}
                      openDialog={() => setDocumentsDialogOpen(true)}
                    />
                  )}
                </>
              ) : (
                <FileUploader
                  entityId={selectedKidForDocuments?.id}
                  entityType="kid"
                  docType="document"
                  buttonText="בחר מסמך להעלאה"
                  onSuccess={() => {
                    setActiveTab(0);
                    // רענון רשימת המסמכים
                    dispatch(fetchDocumentsByKidId(selectedKidForDocuments?.id));
                  }}
                  closeDialog={() => setDocumentsDialogOpen(false)}
                  openDialog={() => setDocumentsDialogOpen(true)}
                />
              )}
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
    </ThemeProvider>
  );
};

export default KidsManagement;