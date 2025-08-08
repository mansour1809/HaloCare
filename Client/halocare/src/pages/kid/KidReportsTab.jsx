import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Avatar,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  AutoAwesome as AIIcon,
  Assessment as ReportIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  GetApp as DownloadIcon,
  Close as CloseIcon,
  Star as StarIcon,
  Psychology as BrainIcon
} from '@mui/icons-material';

// Import החדש של הרכיבים
import TasheReportGenerator from './TasheReportGenerator';
import { 
  fetchTasheReportsByKid,
  clearError,
  approveTasheReport,
  deleteTasheReport 
} from '../../Redux/features/tasheReportsSlice';
import { useAuth } from '../../components/login/AuthContext';
import { baseURL } from '../../components/common/axiosConfig';

const KidReportsTab = ({ selectedKid }) => {
  const dispatch = useDispatch();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const { currentUser } = useAuth();
  // Redux state
  const { reports, status, error } = useSelector(state => state.tasheReports);

    const kidName = `${selectedKid.firstName} ${selectedKid.lastName}`.trim();
  useEffect(() => {
    if (selectedKid.id) {
      loadReports();
    }

    return () => {
      dispatch(clearError());
    };
  }, [selectedKid.id]);

  const loadReports = async () => {
    try {
      await dispatch(fetchTasheReportsByKid(selectedKid.id)).unwrap();
    } catch (error) {
      console.error('שגיאה בטעינת דוחות:', error);
    }
  };

const handleViewReport = (report) => {
  // פתיחה בחלון חדש עם הדוח המעוצב
  const viewUrl = `/tashereports/${report.reportId}/view`;
  window.open(baseURL + viewUrl, '_blank', 'width=1000,height=800,scrollbars=yes');
};
// const handleViewReport = (report) => {
//     setSelectedReport(report);
//     setViewDialogOpen(true);
//   };

const handleDownloadReport = (report) => {
  // הורדת הדוח כ-PDF
  const downloadUrl = `/api/tashereports/${report.reportId}/download`;
  
  // יצירת link זמני להורדה
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `דוח_תשה_${report.reportTitle}_${new Date().toLocaleDateString('he-IL')}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  const handleApprove = async (reportId) => {

    try {
      await dispatch(approveTasheReport({ 
        reportId, 
        approvedByEmployeeId: currentUser.id 
      })).unwrap();
      loadReports();
    } catch (error) {
      console.error('שגיאה באישור דוח:', error);
    }
  };

  const handleDelete = async (reportId) => {
    if (window.confirm('האם אתם בטוחים שברצונכם למחוק את הדוח?')) {
      try {
        await dispatch(deleteTasheReport({ 
          reportId, 
          deletedByEmployeeId: currentUser.id 
        })).unwrap();
        loadReports();
      } catch (error) {
        console.error('שגיאה במחיקת דוח:', error);
      }
    }
  };

  const getStatusChip = (report) => {
    if (report.isApproved) {
      return (
        <Chip
          icon={<ApprovedIcon />}
          label="מאושר"
          color="success"
          size="small"
        />
      );
    } else {
      return (
        <Chip
          icon={<PendingIcon />}
          label="ממתין לאישור"
          color="warning"
          size="small"
        />
      );
    }
  };
  const canApprove = (report) => {
    console.log('Curren:', report);
    return !report.isApproved && 
           (currentUser.role === 'מנהל/ת' || currentUser.role === 'מנהל') 
          //  &&           report.generatedByEmployeeId !== currentUser.id;
  };

  const canDelete = (report) => {
    return !report.isApproved && 
           (report.generatedByEmployeeId === currentUser.id || 
            currentUser.role === 'מנהל/ת');
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
        <BrainIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            דוחות תש"ה
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {kidName} • דוחות התפתחותיים חכמים
          </Typography>
        </Box>
        <Button
          variant="contained"
          size="large"
          startIcon={<AIIcon />}
          onClick={() => setGeneratorOpen(true)}
          sx={{
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FF5252, #26A69A)',
            },
            fontWeight: 'bold',
            px: 3,
            py: 1.5,
            borderRadius: 3,
            boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)'
          }}
        >
          יצירת דוח AI חדש
        </Button>
      </Box>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: 3 }}>
          <Avatar sx={{ 
            width: 80, 
            height: 80, 
            mx: 'auto', 
            mb: 2,
            background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)'
          }}>
            <ReportIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            עדיין אין דוחות תש"ה
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            ליצירת דוח תש"ה מקצועי באמצעות בינה מלאכותית
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AIIcon />}
            onClick={() => setGeneratorOpen(true)}
            sx={{
              background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
              fontWeight: 'bold',
              px: 4,
              py: 2,
              borderRadius: 3
            }}
          >
            צור דוח ראשון
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} key={report.reportId}>
              <Card sx={{ 
                borderRadius: 3,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <ReportIcon color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {report.reportTitle}
                        </Typography>
                        {getStatusChip(report)}
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📅 נוצר: {new Date(report.generatedDate).toLocaleDateString('he-IL')}
                      </Typography>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        📊 תקופה: {new Date(report.periodStartDate).toLocaleDateString('he-IL')} - {new Date(report.periodEndDate).toLocaleDateString('he-IL')}
                      </Typography>
                      
                      {report.isApproved && (
                        <Typography variant="body2" color="success.main" sx={{ mb: 1 }}>
                          ✅ אושר ב: {new Date(report.approvedDate).toLocaleDateString('he-IL')}
                        </Typography>
                      )}

                      {report.notes && (
                        <Typography variant="body2" color="text.secondary" sx={{ 
                          fontStyle: 'italic',
                          p: 1,
                          bgcolor: 'grey.50',
                          borderRadius: 1,
                          mt: 1
                        }}>
                          💬 {report.notes}
                        </Typography>
                      )}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <Tooltip title="צפה בדוח">
                        <IconButton
                          onClick={() => handleViewReport(report)}
                          color="primary"
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="הורד דוח">
                        <IconButton
    onClick={() => handleDownloadReport(report)}
                          color="info"
                        >
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>

                      {canApprove(report) && (
                        <Tooltip title="אשר דוח">
                          <IconButton
                            onClick={() => handleApprove(report.reportId)}
                            color="success"
                          >
                            <ApprovedIcon />
                          </IconButton>
                        </Tooltip>
                      )}

                      {canDelete(report) && (
                        <Tooltip title="מחק דוח">
                          <IconButton
                            onClick={() => handleDelete(report.reportId)}
                            color="error"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </Box>

                  {/* Preview של תחילת הדוח */}
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    mt: 2
                  }}>
                    <Typography variant="body2" sx={{ 
                      maxHeight: 60, 
                      overflow: 'hidden',
                      lineHeight: 1.4
                    }}>
                      {report.reportContent.substring(0, 150)}...
                    </Typography>
                  </Paper>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* כפתור צף */}
      <Fab
        color="primary"
        sx={{ 
          position: 'fixed', 
          bottom: 16, 
          right: 16,
          background: 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
          '&:hover': {
            background: 'linear-gradient(45deg, #FF5252, #26A69A)',
          }
        }}
        onClick={() => setGeneratorOpen(true)}
      >
        <AIIcon />
      </Fab>

      {/* Dialog ליצירת דוח חדש */}
      <TasheReportGenerator
        open={generatorOpen}
        onClose={() => {
          setGeneratorOpen(false);
          loadReports(); // רענון הרשימה
        }}
        kidId={selectedKid.id}
        kidName={kidName}
        currentUser={currentUser}
      />

      {/* Dialog לצפייה בדוח */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
        dir="rtl"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight="bold">
            {selectedReport?.reportTitle}
          </Typography>
          <IconButton onClick={() => setViewDialogOpen(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedReport && (
            <Box>
              <Typography variant="body1" sx={{ 
                whiteSpace: 'pre-line',
                lineHeight: 1.6,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 2
              }}>
                {selectedReport.reportContent}
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default KidReportsTab;