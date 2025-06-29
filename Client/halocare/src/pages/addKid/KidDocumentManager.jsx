// KidDocumentManager.jsx - עיצוב מתקדם מבוסס על Employee components
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Alert, Fade, 
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Collapse, Stack, Avatar
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  Image as ImageIcon,
  AutoAwesome as AutoAwesomeIcon,
  Celebration as CelebrationIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { createTheme, ThemeProvider, styled, alpha } from '@mui/material/styles';

import FileUploader from '../../components/common/FileUploader';
import FilesList from '../../components/common/FilesList';

// Redux imports
import { 
  fetchDocumentsByKidId, 
  clearDocuments 
} from '../../Redux/features/documentsSlice';

// יצירת theme מתקדם עם תמיכה ב-RTL כמו ב-Employee components
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
      light: '#7cd8e5',
      dark: '#2a8a95',
    },
    secondary: {
      main: '#ff7043',
      light: '#ffa270',
      dark: '#c63f17',
    },
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#047857',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#1d4ed8',
    }
  },
});

// קונטיינר ראשי מעוצב
const DocumentContainer = styled(Paper)(({ theme, compact }) => ({
  borderRadius: compact ? 16 : 24,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'visible',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: compact ? '3px' : '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: `${compact ? 16 : 24}px ${compact ? 16 : 24}px 0 0`,
  },
  '&:hover': {
    transform: compact ? 'translateY(-2px)' : 'translateY(-4px)',
    boxShadow: '0 15px 50px rgba(0,0,0,0.15)',
  }
}));

// כותרת מעוצבת עם אפקטים
const DocumentHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
  borderBottom: '1px solid rgba(76, 181, 195, 0.2)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: '20%',
    right: '20%',
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

// אייקון מעוצב עם אנימציות
const StyledIcon = styled(Avatar)(({ theme, color = 'primary' }) => ({
  width: 50,
  height: 50,
  background: `linear-gradient(135deg, ${theme.palette[color]?.main}, ${theme.palette[color]?.dark})`,
  color: 'white',
  fontSize: '1.5rem',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  boxShadow: `0 6px 20px ${alpha(theme.palette[color]?.main, 0.4)}`,
  '&:hover': {
    transform: 'scale(1.1) rotate(10deg)',
    boxShadow: `0 8px 25px ${alpha(theme.palette[color]?.main, 0.5)}`,
  }
}));

// כפתור מונפש מתקדם
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

// אייקון כפתור מעוצב
const StyledIconButton = styled(IconButton)(({ theme, variant = 'primary' }) => ({
  width: 45,
  height: 45,
  borderRadius: '50%',
  background: `linear-gradient(135deg, ${theme.palette[variant]?.main}, ${theme.palette[variant]?.dark})`,
  color: 'white',
  boxShadow: `0 4px 15px ${alpha(theme.palette[variant]?.main, 0.4)}`,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.1) rotate(15deg)',
    boxShadow: `0 6px 20px ${alpha(theme.palette[variant]?.main, 0.5)}`,
  },
  '&:disabled': {
    background: '#e5e7eb',
    color: '#9ca3af',
  }
}));

// Tabs מעוצבים
const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    height: 4,
    borderRadius: 2,
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  },
  '& .MuiTab-root': {
    fontWeight: 600,
    fontSize: '1rem',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s ease',
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      background: alpha(theme.palette.primary.main, 0.1),
    },
    '&:hover': {
      background: alpha(theme.palette.primary.main, 0.05),
    }
  }
}));

// קונטיינר תוכן עם אפקטים
const ContentContainer = styled(Box)(({ theme }) => ({
  flex: 1,
  overflow: 'auto',
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(248, 250, 252, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%)',
  borderRadius: '0 0 20px 20px',
}));

// דיאלוג מעוצב
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    overflow: 'visible',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: '4px',
      background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
      borderRadius: '24px 24px 0 0',
    }
  }
}));

// Chip סטטיסטיקה מעוצב
const StatChip = styled(Chip)(({ theme, color = 'primary' }) => ({
  fontWeight: 600,
  borderRadius: 20,
  background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main, 0.1)}, ${alpha(theme.palette[color]?.light, 0.05)})`,
  border: `1px solid ${alpha(theme.palette[color]?.main, 0.3)}`,
  color: theme.palette[color]?.main,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: `0 4px 15px ${alpha(theme.palette[color]?.main, 0.3)}`,
  }
}));

// התראה מעוצבת
const StyledAlert = styled(Alert)(({ theme }) => ({
  borderRadius: 16,
  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05))',
  border: '1px solid rgba(59, 130, 246, 0.2)',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.2)',
  '& .MuiAlert-icon': {
    fontSize: '1.5rem',
  }
}));

const KidDocumentManager = ({ 
  kidId, 
  kidName = '',
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

  useEffect(() => {
    if (kidId) {
      loadDocuments();
    }
    
    return () => {
      dispatch(clearDocuments());
    };
  }, [kidId]);

  const loadDocuments = async () => {
    try {
      await dispatch(fetchDocumentsByKidId(kidId)).unwrap();
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

  // מצב קומפקטי לדשבורד
  if (compact) {
    return (
      <ThemeProvider theme={rtlTheme}>
        <DocumentContainer 
          dir="rtl"
          elevation={3} 
          compact={compact}
          sx={{ 
            p: 3, 
            maxHeight: maxHeight || 400,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* כותרת */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <StyledIcon color="primary">
                <FolderIcon />
              </StyledIcon>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  📁 מסמכים
                </Typography>
                {kidName && (
                  <Typography variant="body2" color="text.secondary">
                    • {kidName}
                  </Typography>
                )}
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showStats && (
                <StatChip
                  icon={<DocumentIcon />}
                  label={`${stats.total} מסמכים`}
                  size="small"
                  color={stats.total > 0 ? 'primary' : 'default'}
                />
              )}
              
              <StyledIconButton 
                size="small" 
                onClick={() => setExpanded(!expanded)}
                variant="primary"
                sx={{ 
                  transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.4s ease'
                }}
              >
                <ExpandIcon />
              </StyledIconButton>
            </Box>
          </Box>

          <Collapse in={expanded}>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {/* כפתורי פעולה */}
              {showUpload && (
                <Fade in timeout={300}>
                  <Box sx={{ mb: 3 }}>
                    <AnimatedButton
                      variant="contained"
                      startIcon={<UploadIcon />}
                      onClick={() => setUploadDialog(true)}
                      size="small"
                      fullWidth
                    >
                      📤 העלאת מסמכים
                    </AnimatedButton>
                  </Box>
                </Fade>
              )}

              {/* רשימת מסמכים */}
              <ContentContainer sx={{ maxHeight: 250, p: 2 }}>
                {documentsStatus === 'loading' ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress size={40} sx={{ color: 'primary.main' }} />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      טוען מסמכים...
                    </Typography>
                  </Box>
                ) : documentsError ? (
                  <StyledAlert severity="error">
                    ❌ {documentsError}
                  </StyledAlert>
                ) : (
                  <FilesList
                    entityId={kidId}
                    entityType="kid"
                    showFileType={false}
                    onDelete={handleDeleteSuccess}
                    compact={true}
                  />
                )}
              </ContentContainer>
            </Box>
          </Collapse>

          {/* דיאלוג העלאה */}
          <StyledDialog 
            open={uploadDialog} 
            onClose={() => setUploadDialog(false)}
            maxWidth="md"
            fullWidth
            dir="rtl"
          >
            <DialogTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(255, 112, 67, 0.1))',
              borderBottom: '1px solid rgba(76, 181, 195, 0.2)',
              fontWeight: 700
            }}>
              <AutoAwesomeIcon color="primary" />
              📤 העלאת מסמכים - {kidName}
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <FileUploader
                entityId={kidId}
                entityType="kid"
                docType="document"
                onSuccess={handleUploadSuccess}
                allowMultiple={true}
                title="בחר מסמכים להעלאה"
                dragAndDrop={true}
                maxFiles={10}
              />
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <AnimatedButton 
                onClick={() => setUploadDialog(false)}
                variant="outlined"
                sx={{
                  color: '#6b7280',
                  borderColor: '#d1d5db',
                  '&:hover': {
                    borderColor: '#9ca3af',
                  }
                }}
              >
                ✖️ סגור
              </AnimatedButton>
            </DialogActions>
          </StyledDialog>
        </DocumentContainer>
      </ThemeProvider>
    );
  }

  // מצב מלא (לפרופיל ילד)
  return (
    <ThemeProvider theme={rtlTheme}>
      <Box 
        dir='rtl' 
        sx={{ 
          maxHeight: maxHeight, 
          overflow: 'hidden', 
          display: 'flex', 
          flexDirection: 'column',
          ml: 2,
          mr: 2
        }}
      >
        {/* כותרת עם סטטיסטיקות */}
        <DocumentHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <StyledIcon color="primary" sx={{ width: 60, height: 60 }}>
              <FolderIcon sx={{ fontSize: '2rem' }} />
            </StyledIcon>
            <Box>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
                📁 מסמכים ילד
                {kidName && (
                  <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                    • {kidName}
                  </Typography>
                )}
              </Typography>
              
              {showStats && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <StatChip
                    icon={<DocumentIcon />}
                    label={`${stats.total} סה"כ מסמכים`}
                    color="primary"
                    size="small"
                  />
                  {stats.profilePics > 0 && (
                    <StatChip
                      icon={<ImageIcon />}
                      label={`${stats.profilePics} תמונות פרופיל`}
                      color="secondary"
                      size="small"
                    />
                  )}
                  {stats.regularDocs > 0 && (
                    <StatChip
                      icon={<StarIcon />}
                      label={`${stats.regularDocs} מסמכים רגילים`}
                      color="success"
                      size="small"
                    />
                  )}
                </Stack>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 2 }}>
            {showUpload && (
              <AnimatedButton
                variant="contained"
                startIcon={<UploadIcon />}
                onClick={() => setUploadDialog(true)}
              >
                📤 העלאת מסמכים
              </AnimatedButton>
            )}
            
            <StyledIconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              variant="info"
            >
              {refreshing ? <CircularProgress size={20} color="inherit" /> : <RefreshIcon />}
            </StyledIconButton>
          </Box>
        </DocumentHeader>

        {/* Tabs */}
        <Paper sx={{ borderRadius: '0 0 20px 20px', overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <StyledTabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{ 
              borderBottom: 2, 
              borderColor: 'divider',
              background: 'rgba(76, 181, 195, 0.05)'
            }}
          >
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DocumentIcon />
                  כל המסמכים
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ImageIcon />
                  תמונות פרופיל
                </Box>
              } 
            />
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StarIcon />
                  מסמכים רגילים
                </Box>
              } 
            />
          </StyledTabs>

          {/* תוכן הטאבים */}
          <ContentContainer>
            {documentsStatus === 'loading' ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                  📄 טוען מסמכים...
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אנא המתן בזמן טעינת המסמכים
                </Typography>
              </Box>
            ) : documentsError ? (
              <StyledAlert severity="error" sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  ❌ שגיאה בטעינת מסמכים
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  {documentsError}
                </Typography>
              </StyledAlert>
            ) : (
              <Fade in={true} timeout={500}>
                <Box>
                  {currentTab === 0 && (
                    <FilesList
                      entityId={kidId}
                      entityType="kid"
                      showFileType={true}
                      onDelete={handleDeleteSuccess}
                    />
                  )}
                  
                  {currentTab === 1 && (
                    <FilesList
                      entityId={kidId}
                      entityType="kid"
                      showFileType={true}
                      onDelete={handleDeleteSuccess}
                      filterByType="profile"
                    />
                  )}
                  
                  {currentTab === 2 && (
                    <FilesList
                      entityId={kidId}
                      entityType="kid"
                      showFileType={true}
                      onDelete={handleDeleteSuccess}
                      filterByType="document"
                    />
                  )}
                </Box>
              </Fade>
            )}
          </ContentContainer>
        </Paper>

        {/* דיאלוג העלאה */}
        <StyledDialog 
          open={uploadDialog} 
          onClose={() => setUploadDialog(false)}
          maxWidth="lg"
          fullWidth
          dir="rtl"
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1), rgba(255, 112, 67, 0.1))',
            borderBottom: '1px solid rgba(76, 181, 195, 0.2)',
            fontWeight: 700,
            fontSize: '1.3rem'
          }}>
            <CelebrationIcon color="primary" />
            📤 העלאת מסמכים - {kidName}
          </DialogTitle>
          <DialogContent sx={{ p: 4 }}>
            <StyledAlert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                📋 ניתן להעלות עד 5 קבצים בבת אחת
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                קבצים נתמכים: תמונות, PDF, מסמכים ועוד.
              </Typography>
            </StyledAlert>
            
            <FileUploader
              entityId={kidId}
              entityType="kid"
              docType="document"
              onSuccess={handleUploadSuccess}
              allowMultiple={true}
              title="העלאת מסמכים חדשים"
              dragAndDrop={true}
              maxFiles={10}
              showPreview={true}
            />
          </DialogContent>
          <DialogActions sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05), rgba(255, 112, 67, 0.05))',
            borderTop: '1px solid rgba(76, 181, 195, 0.1)'
          }}>
            <AnimatedButton 
              onClick={() => setUploadDialog(false)} 
              size="large"
              variant="outlined"
              sx={{
                color: '#6b7280',
                borderColor: '#d1d5db',
                '&:hover': {
                  borderColor: '#9ca3af',
                }
              }}
            >
              ✖️ סגור
            </AnimatedButton>
          </DialogActions>
        </StyledDialog>
      </Box>
    </ThemeProvider>
  );
};

export default KidDocumentManager;