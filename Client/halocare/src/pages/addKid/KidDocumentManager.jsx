// KidDocumentManager.jsx - Updated with Employee styling
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Paper, Typography, Tabs, Tab, Button, Alert, Fade, 
  CircularProgress, Chip, Dialog, DialogTitle, DialogContent,
  DialogActions, IconButton, Collapse, Card, CardContent
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Folder as FolderIcon,
  Description as DocumentIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandIcon,
  AutoAwesome as AutoAwesomeIcon,
  Star as StarIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';

import FileUploader from '../../components/common/FileUploader';
import FilesList from '../../components/common/FilesList';

// Redux imports
import { 
  fetchDocumentsByKidId, 
  clearDocuments 
} from '../../Redux/features/documentsSlice';

// Modern Container matching Employee design
const ModernContainer = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(20px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  overflow: 'visible',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    borderRadius: '20px 20px 0 0',
  }
}));

// Animated Button matching Employee design
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

// Stats Card matching Employee design
const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: 16,
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
  border: '1px solid rgba(76, 181, 195, 0.2)',
  textAlign: 'center',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.2)',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.15) 0%, rgba(255, 112, 67, 0.15) 100%)',
  }
}));

// Tab styling matching Employee design
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${alpha('#4cb5c3', 0.2)}`,
  '& .MuiTab-root': {
    fontWeight: 600,
    fontSize: '1rem',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.3s ease',
    '&.Mui-selected': {
      background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(42, 138, 149, 0.1) 100%)',
      color: '#2a8a95',
    }
  },
  '& .MuiTabs-indicator': {
    height: 3,
    borderRadius: '3px 3px 0 0',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
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
      console.error('Error loading documents:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDocuments();
    setRefreshing(false);
  };

  const handleUploadSuccess = (uploadedFiles) => {
    console.log('Files uploaded successfully:', uploadedFiles);
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

  // Calculate statistics
  const getDocumentStats = () => {
    if (!documents) return { total: 0, profilePics: 0, regularDocs: 0 };
    
    return {
      total: documents.length,
      profilePics: documents.filter(doc => doc.docType === 'picture' || doc.docType === 'profile').length,
      regularDocs: documents.filter(doc => doc.docType === 'document').length
    };
  };

  const stats = getDocumentStats();

  // Filter documents by type
  const getDocumentsByType = (type) => {
    if (!documents) return [];
    return documents.filter(doc => {
      if (type === 'pictures') return doc.docType === 'picture' || doc.docType === 'profile';
      if (type === 'documents') return doc.docType === 'document';
      return true;
    });
  };

  if (documentsError) {
    return (
      <ModernContainer>
        <CardContent>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: 3,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
              ❌ שגיאה בטעינת מסמכים
            </Typography>
            <Typography variant="body2">
              {documentsError}
            </Typography>
          </Alert>
        </CardContent>
      </ModernContainer>
    );
  }

  return (
    <ModernContainer sx={{ maxHeight }}>
      <CardContent sx={{ p: 0 }}>
        {/* Header */}
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
          borderBottom: `1px solid ${alpha('#4cb5c3', 0.1)}`
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 700, 
              color: '#2a8a95',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FolderIcon sx={{ mr: 2, color: '#4cb5c3' }} />
              📄 מסמכי {kidName || 'הילד'}
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{ 
                  color: '#4cb5c3',
                  '&:hover': { 
                    backgroundColor: alpha('#4cb5c3', 0.1),
                    transform: 'rotate(180deg)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <RefreshIcon />
              </IconButton>
              
              {showUpload && (
                <AnimatedButton
                  size="small"
                  startIcon={<UploadIcon />}
                  onClick={() => setUploadDialog(true)}
                  sx={{ px: 2 }}
                >
                  העלה מסמך
                </AnimatedButton>
              )}
            </Box>
          </Box>

          {/* Statistics */}
          {showStats && (
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <StatsCard elevation={0}>
                <Typography variant="h6" sx={{ color: '#4cb5c3', fontWeight: 700 }}>
                  {stats.total}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  סה"כ מסמכים
                </Typography>
              </StatsCard>
              
              <StatsCard elevation={0}>
                <Typography variant="h6" sx={{ color: '#ff7043', fontWeight: 700 }}>
                  {stats.profilePics}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  תמונות
                </Typography>
              </StatsCard>
              
              <StatsCard elevation={0}>
                <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>
                  {stats.regularDocs}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  מסמכים
                </Typography>
              </StatsCard>
            </Box>
          )}
        </Box>

        {/* Loading state */}
        {documentsStatus === 'loading' && (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            p: 4,
            flexDirection: 'column',
            gap: 2
          }}>
            <CircularProgress sx={{ color: '#4cb5c3' }} />
            <Typography variant="body2" color="text.secondary">
              טוען מסמכים...
            </Typography>
          </Box>
        )}

        {/* Content */}
        {documentsStatus !== 'loading' && (
          <>
            {/* Tabs */}
            <StyledTabs
              value={currentTab}
              onChange={(e, newValue) => setCurrentTab(newValue)}
              variant="fullWidth"
            >
              <Tab 
                label={`כל המסמכים (${stats.total})`}
                icon={<DocumentIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`תמונות (${stats.profilePics})`}
                icon={<StarIcon />}
                iconPosition="start"
              />
              <Tab 
                label={`מסמכים (${stats.regularDocs})`}
                icon={<FolderIcon />}
                iconPosition="start"
              />
            </StyledTabs>

            {/* Tab Content */}
            <Box sx={{ p: 3 }}>
              {currentTab === 0 && (
                <FilesList
                  documents={documents || []}
                  onDeleteSuccess={handleDeleteSuccess}
                  entityType="kid"
                  compact={compact}
                />
              )}
              
              {currentTab === 1 && (
                <FilesList
                  documents={getDocumentsByType('pictures')}
                  onDeleteSuccess={handleDeleteSuccess}
                  entityType="kid"
                  compact={compact}
                />
              )}
              
              {currentTab === 2 && (
                <FilesList
                  documents={getDocumentsByType('documents')}
                  onDeleteSuccess={handleDeleteSuccess}
                  entityType="kid"
                  compact={compact}
                />
              )}

              {/* Empty state */}
              {documents && documents.length === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 6,
                  color: 'text.secondary'
                }}>
                  <FolderIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    אין מסמכים
                  </Typography>
                  <Typography variant="body2">
                    לא נמצאו מסמכים עבור ילד זה
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </CardContent>

      {/* Upload Dialog */}
      <Dialog 
        open={uploadDialog} 
        onClose={() => setUploadDialog(false)}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogTitle sx={{ 
          background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
          color: 'white',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center'
        }}>
          <AutoAwesomeIcon sx={{ mr: 2 }} />
          העלאת מסמכים חדשים
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: 3,
              background: 'rgba(76, 181, 195, 0.1)',
              border: '1px solid rgba(76, 181, 195, 0.2)'
            }}
          >
            <Typography variant="body2">
              💡 קבצים נתמכים: תמונות, PDF, מסמכים ועוד.
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
    </ModernContainer>
  );
};

export default KidDocumentManager;