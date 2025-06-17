// src/components/employees/EmployeeDocumentManager.jsx - ניהול מסמכים לעובדים

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Alert, Zoom, Fade, 
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Card, CardContent, IconButton, Tooltip,
  Collapse, Stack, Avatar
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Image as ImageIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

// Import הקומפוננטות הקיימות
import FileUploader from '../../components/common/FileUploader';
import FilesList from '../../components/common/FilesList';

// Redux imports
import { 
  fetchDocumentsByEmployeeId, 
  clearDocuments 
} from '../../Redux/features/documentsSlice';

// יצירת theme מדהים עם תמיכה ב-RTL
const rtlTheme = createTheme({
  direction: 'rtl',
  typography: {
    fontFamily: 'Rubik, "Heebo", Arial, sans-serif',
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
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(20px)',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          overflow: 'visible',
          position: 'relative',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          }
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          }
        },
        contained: {
          background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
          '&:hover': {
            background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
          }
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '1rem',
          borderRadius: '12px 12px 0 0',
          transition: 'all 0.3s ease',
          '&.Mui-selected': {
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(42, 138, 149, 0.1) 100%)',
            color: '#2a8a95',
          }
        }
      }
    }
  }
});

// מסך מלא מותאם RTL עם רקע מדהים
const FullScreenContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
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
    background: 'radial-gradient(circle at 30% 40%, rgba(76, 181, 195, 0.2) 0%, transparent 70%), radial-gradient(circle at 70% 60%, rgba(255, 112, 67, 0.2) 0%, transparent 70%), radial-gradient(circle at 50% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 1,
  }
}));

// כותרת עם עיצוב זכוכית ואפקטים
const ModernHeader = styled(Paper)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  position: 'relative',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  }
}));

// כרטיס סטטיסטיקה מדהים
const StatCard = styled(Card)(({ theme, color }) => ({
  padding: '24px 20px',
  textAlign: 'center',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: '20px',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  height: '140px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.light})`,
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: `radial-gradient(circle, ${alpha(theme.palette[color]?.main, 0.1)} 0%, transparent 70%)`,
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

// כרטיס תוכן מעוצב
const ContentCard = styled(Paper)(({ theme }) => ({
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

// כפתור מונפש מדהים
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
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

// אייקון מעוצב עם אנימציות
const StyledIcon = styled(Avatar)(({ theme, color }) => ({
  width: 60,
  height: 60,
  margin: '0 auto 16px',
  background: `linear-gradient(135deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.dark})`,
  color: 'white',
  fontSize: '1.8rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 8px 24px ${alpha(theme.palette[color]?.main, 0.4)}`,
  position: 'relative',
  overflow: 'visible',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '-3px',
    left: '-3px',
    right: '-3px',
    bottom: '-3px',
    background: `linear-gradient(45deg, ${theme.palette[color]?.light}, ${theme.palette[color]?.main})`,
    borderRadius: '50%',
    zIndex: -1,
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover::before': {
    opacity: 1,
  }
}));

const EmployeeDocumentManager = ({ 
  employeeId, 
  employeeName = '',
  compact = false,           
  showUpload = true,         
  showStats = true,          
  maxHeight = null           
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const documents = useSelector((state) => state.documents.documents);
  const documentsStatus = useSelector((state) => state.documents.status);
  const documentsError = useSelector((state) => state.documents.error);
  
  // Local state
  const [currentTab, setCurrentTab] = useState(0);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [expanded, setExpanded] = useState(!compact);

  // טעינת מסמכים
  useEffect(() => {
    if (employeeId) {
      loadDocuments();
    }
    
    return () => {
      dispatch(clearDocuments());
    };
  }, [employeeId]);

  const loadDocuments = async () => {
    try {
      await dispatch(fetchDocumentsByEmployeeId(employeeId)).unwrap();
    } catch (error) {
      console.error('שגיאה בטעינת מסמכים:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleUploadSuccess = (uploadedFiles) => {
    console.log('קבצים הועלו בהצלחה:', uploadedFiles);
    setUploadDialog(false);
    setTimeout(() => {
      loadDocuments();
    }, 500);
  };

  const handleDeleteSuccess = () => {
    setTimeout(() => {
      loadDocuments();
    }, 500);
  };

  // סטטיסטיקות
  const getDocumentStats = () => {
    if (!documents) return { total: 0, profilePics: 0, regularDocs: 0 };
    
    return {
      total: documents.length,
      profilePics: documents.filter(doc => doc.docType === 'profile').length,
      regularDocs: documents.filter(doc => doc.docType === 'document').length
    };
  };

  const stats = getDocumentStats();

  // מצב קומפקטי
  if (compact) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <Box sx={{ direction: 'rtl' }}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 2, 
              borderRadius: 3,
              maxHeight: maxHeight || 400,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FolderIcon sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">
                  מסמכים
                  {employeeName && (
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      • {employeeName}
                    </Typography>
                  )}
                </Typography>
              </Box>
              
              <Chip
                label={`${stats.total} מסמכים`}
                size="small"
                color={stats.total > 0 ? 'primary' : 'default'}
                sx={{
                  background: stats.total > 0 ? 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)' : undefined,
                  color: stats.total > 0 ? 'white' : undefined,
                  fontWeight: 600
                }}
              />
            </Box>

            <FilesList
              entityId={employeeId}
              entityType="employee"
              showFileType={false}
              onDelete={handleDeleteSuccess}
              compact={true}
            />
          </Paper>
        </Box>
      </ThemeProvider>
    );
  }

  // מצב מלא
  return (
    <ThemeProvider theme={rtlTheme}>
      <Box sx={{ direction: 'rtl' }}>
        <FullScreenContainer sx={{ minHeight: 'auto', background: 'transparent' }}>
          <Box sx={{ position: 'relative', zIndex: 2, maxHeight: maxHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            
            {/* כותרת מקצועית עם סטטיסטיקות */}
            <Fade in timeout={800}>
              <ModernHeader elevation={0}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box>
                    <Typography variant="h5" gutterBottom sx={{ 
                      fontWeight: 700,
                      color: 'white',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FolderIcon sx={{ mr: 2, fontSize: '2rem' }} />
                      📁 מסמכים עובד
                      {employeeName && (
                        <Typography component="span" variant="h6" sx={{ 
                          ml: 2,
                          color: 'rgba(255,255,255,0.9)',
                          fontWeight: 500
                        }}>
                          • {employeeName}
                        </Typography>
                      )}
                    </Typography>
                    
                    {showStats && (
                      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Chip
                          icon={<DocumentIcon />}
                          label={`${stats.total} סה"כ מסמכים`}
                          sx={{
                            background: 'rgba(255,255,255,0.2)',
                            backdropFilter: 'blur(10px)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            fontWeight: 600
                          }}
                          size="medium"
                        />
                        {stats.profilePics > 0 && (
                          <Chip
                            icon={<PersonIcon />}
                            label={`${stats.profilePics} תמונות פרופיל`}
                            sx={{
                              background: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.3)',
                              fontWeight: 600
                            }}
                            size="medium"
                          />
                        )}
                        {stats.regularDocs > 0 && (
                          <Chip
                            icon={<StarIcon />}
                            label={`${stats.regularDocs} מסמכים רגילים`}
                            sx={{
                              background: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              color: 'white',
                              border: '1px solid rgba(255,255,255,0.3)',
                              fontWeight: 600
                            }}
                            size="medium"
                          />
                        )}
                      </Stack>
                    )}
                  </Box>

                  <Stack direction="row" spacing={2}>
                    {showUpload && (
                      <AnimatedButton
                        variant="contained"
                        startIcon={<UploadIcon />}
                        onClick={() => setUploadDialog(true)}
                        sx={{
                          background: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            background: 'rgba(255,255,255,0.3)',
                          }
                        }}
                      >
                        העלאת מסמכים
                      </AnimatedButton>
                    )}
                    
                    <Tooltip title="רענון מסמכים">
                      <IconButton 
                        onClick={handleRefresh}
                        disabled={refreshing}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(10px)',
                          color: 'white',
                          border: '1px solid rgba(255,255,255,0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.3)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {refreshing ? (
                          <CircularProgress size={20} sx={{ color: 'white' }} />
                        ) : (
                          <RefreshIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </ModernHeader>
            </Fade>

            {/* כרטיס תוכן עם טאבים */}
            <Zoom in timeout={1000}>
              <ContentCard sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Tabs 
                  value={currentTab} 
                  onChange={(e, newValue) => setCurrentTab(newValue)}
                  variant="fullWidth"
                  sx={{ 
                    borderBottom: '2px solid rgba(76, 181, 195, 0.1)',
                    backgroundColor: 'rgba(76, 181, 195, 0.05)',
                    '& .MuiTab-root': {
                      fontWeight: 600,
                      fontSize: '1rem',
                      py: 2
                    },
                    '& .Mui-selected': {
                      color: '#2a8a95 !important'
                    },
                    '& .MuiTabs-indicator': {
                      height: 3,
                      borderRadius: '3px 3px 0 0',
                      background: 'linear-gradient(90deg, #4cb5c3, #2a8a95)'
                    }
                  }}
                >
                  <Tab 
                    label="כל המסמכים" 
                    icon={<FolderIcon />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="תמונות פרופיל" 
                    icon={<ImageIcon />}
                    iconPosition="start"
                  />
                  <Tab 
                    label="מסמכים רגילים" 
                    icon={<DocumentIcon />}
                    iconPosition="start"
                  />
                </Tabs>

                {/* תוכן הטאבים */}
                <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                  {documentsStatus === 'loading' ? (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                      <CircularProgress size={60} thickness={4} sx={{ color: '#4cb5c3' }} />
                      <Typography variant="h6" sx={{ mt: 3, color: 'text.secondary' }}>
                        🔄 טוען מסמכים...
                      </Typography>
                    </Box>
                  ) : documentsError ? (
                    <Alert 
                      severity="error" 
                      sx={{ 
                        mt: 2,
                        borderRadius: 3,
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        '& .MuiAlert-message': {
                          width: '100%'
                        }
                      }}
                    >
                      <Typography variant="h6" gutterBottom>
                        ❌ שגיאה בטעינת מסמכים
                      </Typography>
                      {documentsError}
                      <Button 
                        onClick={handleRefresh}
                        sx={{ mt: 1 }}
                        variant="outlined"
                        size="small"
                      >
                        🔄 נסה שוב
                      </Button>
                    </Alert>
                  ) : (
                    <Fade in={true}>
                      <Box>
                        {currentTab === 0 && (
                          <FilesList
                            entityId={employeeId}
                            entityType="employee"
                            showFileType={true}
                            onDelete={handleDeleteSuccess}
                          />
                        )}
                        
                        {currentTab === 1 && (
                          <FilesList
                            entityId={employeeId}
                            entityType="employee"
                            showFileType={true}
                            onDelete={handleDeleteSuccess}
                            filterByType="profile"
                          />
                        )}
                        
                        {currentTab === 2 && (
                          <FilesList
                            entityId={employeeId}
                            entityType="employee"
                            showFileType={true}
                            onDelete={handleDeleteSuccess}
                            filterByType="document"
                          />
                        )}
                      </Box>
                    </Fade>
                  )}
                </Box>
              </ContentCard>
            </Zoom>

            {/* דיאלוג העלאה מעוצב */}
            <Dialog 
              open={uploadDialog} 
              onClose={() => setUploadDialog(false)}
              maxWidth="lg"
              fullWidth
              dir="rtl"
              PaperProps={{
                sx: {
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <DialogTitle
                sx={{
                  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '1.3rem',
                  fontWeight: 600,
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: 'linear-gradient(90deg, #ff7043, #10b981, #4cb5c3)',
                  }
                }}
              >
                <UploadIcon sx={{ mr: 1 }} />
                📤 העלאת מסמכים - {employeeName}
              </DialogTitle>
              
              <DialogContent sx={{ p: 3 }}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    backgroundColor: 'rgba(76, 181, 195, 0.1)',
                    border: '1px solid rgba(76, 181, 195, 0.3)'
                  }}
                  icon={<AutoAwesomeIcon />}
                >
                  <Typography variant="body2">
                    💡 ניתן להעלות עד 5 קבצים בבת אחת. קבצים נתמכים: תמונות, PDF, מסמכים ועוד.
                  </Typography>
                </Alert>
                
                <FileUploader
                  entityId={employeeId}
                  entityType="employee"
                  docType="document"
                  onSuccess={handleUploadSuccess}
                  allowMultiple={true}
                  title="העלאת מסמכים חדשים לעובד"
                  dragAndDrop={true}
                  maxFiles={10}
                  showPreview={true}
                />
              </DialogContent>
              
              <DialogActions sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                <Button 
                  onClick={() => setUploadDialog(false)} 
                  size="large"
                  sx={{ 
                    borderRadius: 2,
                    px: 3
                  }}
                >
                  סגור
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </FullScreenContainer>
      </Box>
    </ThemeProvider>
  );
};

export default EmployeeDocumentManager;