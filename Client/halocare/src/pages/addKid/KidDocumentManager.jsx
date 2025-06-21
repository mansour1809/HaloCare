
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
  Info as InfoIcon
} from '@mui/icons-material';

// Import הקומפוננטות הקיימות
import FileUploader from '../../components/common/FileUploader';
import FilesList from '../../components/common/FilesList';

// Redux imports
import { 
  fetchDocumentsByKidId, 
  clearDocuments 
} from '../../Redux/features/documentsSlice';

const KidDocumentManager = ({ 
  kidId, 
  kidName = '',
  compact = false,           // מצב קומפקטי לדשבורד
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
    if (kidId) {
      loadDocuments();
    }
    
    return () => {
      // ניקוי כשעוזבים את הקומפוננטה
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

  // מצב קומפקטי לדשבורד
  if (compact) {
    return (
      <Paper 
      dir="rtl"
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
        {/* כותרת */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FolderIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="h6">
              מסמכים
              {kidName && (
                <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  • {kidName}
                </Typography>
              )}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showStats && (
              <Chip
                label={`${stats.total} מסמכים`}
                size="small"
                color={stats.total > 0 ? 'primary' : 'default'}
              />
            )}
            
            <IconButton 
              size="small" 
              onClick={() => setExpanded(!expanded)}
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <ExpandIcon />
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ flex: 1, overflow: 'hidden' }}>
            {/* כפתורי פעולה */}
            {showUpload && (
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                  size="small"
                  fullWidth
                >
                  העלאת מסמכים
                </Button>
              </Box>
            )}

            {/* רשימת מסמכים */}
            <Box sx={{ flex: 1, overflow: 'auto', maxHeight: 250 }}>
              {documentsStatus === 'loading' ? (
                <Box sx={{ textAlign: 'center', py: 3 }}>
                  <CircularProgress size={30} />
                </Box>
              ) : documentsError ? (
                <Alert severity="error" size="small">
                  {documentsError}
                </Alert>
              ) : (
                <FilesList
                  entityId={kidId}
                  entityType="kid"
                  showFileType={false}
                  onDelete={handleDeleteSuccess}
                  compact={true}
                />
              )}
            </Box>
          </Box>
        </Collapse>

        {/* דיאלוג העלאה */}
        <Dialog 
          open={uploadDialog} 
          onClose={() => setUploadDialog(false)}
          maxWidth="md"
          fullWidth
          dir="rtl"
        >
          <DialogTitle>העלאת מסמכים - {kidName}</DialogTitle>
          <DialogContent>
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
          <DialogActions>
            <Button onClick={() => setUploadDialog(false)}>
              סגור
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    );
  }

  // מצב מלא (לפרופיל ילד)
  return (
    <Box dir='rtl' sx={{ maxHeight: maxHeight, overflow: 'hidden', display: 'flex', flexDirection: 'column' , ml:2 ,mr:2 }}>
      {/* כותרת עם סטטיסטיקות */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom>
            מסמכים ילד
            {kidName && (
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 1 }}>
                • {kidName}
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
                  label={`${stats.profilePics} תמונות פרופיל`}
                  color="secondary"
                  size="small"
                />
              )}
              {stats.regularDocs > 0 && (
                <Chip
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
            >
              העלאת מסמכים
            </Button>
          )}
          
          <IconButton 
            onClick={handleRefresh}
            disabled={refreshing}
            color="primary"
          >
            {refreshing ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Box>

      {/* טאבים */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden', flex: 2, display: 'flex', flexDirection: 'column' }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
          sx={{ borderBottom: 2, borderColor: 'divider' }}
        >
          <Tab label="כל המסמכים" />
          <Tab label="תמונות פרופיל" />
          <Tab label="מסמכים רגילים" />
        </Tabs>

        {/* תוכן הטאבים */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {documentsStatus === 'loading' ? (
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <CircularProgress size={50} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                טוען מסמכים...
              </Typography>
            </Box>
          ) : documentsError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              <Typography variant="h6">שגיאה בטעינת מסמכים</Typography>
              {documentsError}
            </Alert>
          ) : (
            <Fade in={true}>
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
        </Box>
      </Paper>

      {/* דיאלוג העלאה */}
      <Dialog 
        open={uploadDialog} 
        onClose={() => setUploadDialog(false)}
        maxWidth="lg"
        fullWidth
        dir="rtl"
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <UploadIcon sx={{ mr: 1 }} />
            העלאת מסמכים - {kidName}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ניתן להעלות עד 5 קבצים בבת אחת. קבצים נתמכים: תמונות, PDF, מסמכים ועוד.
            </Typography>
          </Alert>
          
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
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} size="large">
            סגור
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default KidDocumentManager;