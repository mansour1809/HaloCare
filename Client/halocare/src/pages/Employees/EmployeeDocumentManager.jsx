// src/components/employees/EmployeeDocumentManager.jsx - ניהול מסמכים לעובדים

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Alert, Fade, 
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, Grid, Card, CardContent, IconButton, Tooltip,
  Collapse
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
  Image as ImageIcon
} from '@mui/icons-material';

// Import הקומפוננטות הקיימות
import FileUploader from '../../components/common/FileUploader';
import FilesList from '../../components/common/FilesList';

// Redux imports
import { 
  fetchDocumentsByEmployeeId, 
  clearDocuments 
} from '../../Redux/features/documentsSlice';

const EmployeeDocumentManager = ({ 
  employeeId, 
  employeeName = '',
  compact = false,           // מצב קומפקטי לשימוש עתידי
  showUpload = true,         // האם להציג אזור העלאה
  showStats = true,          // האם להציג סטטיסטיקות
  maxHeight = null           // גובה מקסימלי לתצוגה
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
      // ניקוי כשעוזבים את הקומפוננטה
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
    // רענון אוטומטי
    setTimeout(() => {
      loadDocuments();
    }, 500);
  };

  const handleDeleteSuccess = () => {
    // רענון אוטומטי אחרי מחיקה
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

  // מצב קומפקטי (לעתיד)
  if (compact) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          borderRadius: 3,
          maxHeight: maxHeight || 400,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* תוכן קומפקטי */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon color="primary" sx={{ mr: 1 }} />
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
    );
  }

  // מצב מלא
  return (
    <Box sx={{ maxHeight: maxHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* כותרת עם סטטיסטיקות */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            מסמכים ילד
            {employeeName && (
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                • {employeeName}
              </Typography>
            )}
          </Typography>
          
          {showStats && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip
                icon={<DocumentIcon />}
                label={`${stats.total} סה"כ מסמכים`}
                color="primary"
                size="small"
              />
              {stats.profilePics > 0 && (
                <Chip
                  icon={<PersonIcon />}
                  label={`${stats.profilePics} תמונות פרופיל`}
                  color="secondary"
                  size="small"
                />
              )}
              {stats.regularDocs > 0 && (
                <Chip
                  icon={<DocumentIcon />}
                  label={`${stats.regularDocs} מסמכים רגילים`}
                  color="info"
                  size="small"
                />
              )}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {showUpload && (
            <Button
              variant="contained"
              startIcon={<UploadIcon />}
              onClick={() => setUploadDialog(true)}
              sx={{
                borderRadius: 3,
                px: 3,
                py: 1.5,
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #2a8a95 30%, #1a6b75 90%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(76, 181, 195, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              העלאת מסמכים
            </Button>
          )}
          
          <Tooltip title="רענון מסמכים">
            <IconButton 
              onClick={handleRefresh}
              disabled={refreshing}
              color="primary"
              sx={{
                backgroundColor: 'rgba(76, 181, 195, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(76, 181, 195, 0.2)',
                  transform: 'scale(1.1)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* טאבים */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            backgroundColor: 'rgba(76, 181, 195, 0.05)',
            '& .MuiTab-root': {
              fontWeight: 600,
              fontSize: '1rem'
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
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={50} thickness={4} />
              <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
                טוען מסמכים...
              </Typography>
            </Box>
          ) : documentsError ? (
            <Alert 
              severity="error" 
              sx={{ 
                mt: 2,
                borderRadius: 3,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <Typography variant="h6" gutterBottom>
                שגיאה בטעינת מסמכים
              </Typography>
              {documentsError}
              <Button 
                onClick={handleRefresh}
                sx={{ mt: 1 }}
                variant="outlined"
                size="small"
              >
                נסה שוב
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
      </Paper>

      {/* דיאלוג העלאה */}
      <Dialog 
        open={uploadDialog} 
        onClose={() => setUploadDialog(false)}
        maxWidth="lg"
        fullWidth
        dir="rtl"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: 'hidden'
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
            fontWeight: 600
          }}
        >
          <UploadIcon sx={{ mr: 1 }} />
          העלאת מסמכים - {employeeName}
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
  );
};

export default EmployeeDocumentManager;