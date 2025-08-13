import  { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip
} from '@mui/material';
import {
  Psychology as BrainIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  Delete as DeleteIcon,
  Description as WordIcon,
  TextSnippet as TextIcon,
  ThumbUp as ApproveIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchTasheReportsByKid, 
  approveTasheReport, 
  deleteTasheReport, 
  clearError
} from '../../Redux/features/tasheReportsSlice';
import { useAuth } from '../../components/login/AuthContext';
import { baseURL } from '../../components/common/axiosConfig';
import TasheReportGenerator from './TasheReportGenerator';
import EditReportDialog from './EditReportDialog';
import ReportsStatisticsWidget from './ReportsStatisticsWidget';
import Swal from 'sweetalert2';

const KidReportsTab = ({ selectedKid }) => {
 

  const dispatch = useDispatch();
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [reportToEdit, setReportToEdit] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState(null);

  const { currentUser } = useAuth();
  const { reports = [], status, error } = useSelector(state => state.tasheReports || {});

  const kidName = selectedKid ? `${selectedKid.firstName || ''} ${selectedKid.lastName || ''}`.trim() : 'לא נבחר ילד';

  useEffect(() => {
    if (selectedKid?.id) { // בדיקה שהילד קיים ויש לו ID
      loadReports();
    }

    return () => {
      dispatch(clearError());
    };
  }, [selectedKid?.id]);


   // בדיקה בסיסית שהילד קיים
  if (!selectedKid) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography variant="h6" color="text.secondary">
          אנא בחרו ילד מהרשימה לצפייה בדוחות
        </Typography>
      </Box>
    );
  }
  const loadReports = async () => {
    if (!selectedKid?.id) {
      console.warn('לא ניתן לטעון דוחות - אין ילד נבחר');
      return;
    }

    try {
      await dispatch(fetchTasheReportsByKid(selectedKid.id)).unwrap();
    } catch (error) {
      console.error('שגיאה בטעינת דוחות:', error);
    }
  };

  const handleEditClick = (report) => {
    setReportToEdit(report);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setReportToEdit(null);
    loadReports(); // רענון הרשימה
  };

  const canEdit = (report) => {
    if (!report || !currentUser) return false;
    
    // בדיקה פשוטה: רק מנהל יכול לערוך כל דוח, או יוצר הדוח יכול לערוך את הדוח שלו
    const isManager = currentUser.role === 'מנהל' || currentUser.role === 'מנהל/ת';
    const isCreator = report.generatedByEmployeeId === currentUser.id;
    const isNotApproved = !report.isApproved;
    
    return isNotApproved && (isManager || isCreator);
  };

  const handleViewReport = (report) => {
    // פתיחה בחלון חדש עם הדוח המעוצב
    const viewUrl = `/TasheReports/${report.reportId}/view`;
    window.open(baseURL + viewUrl, '_blank', 'width=1200,height=900,scrollbars=yes');
  };

  const handleDownloadWord = (report) => {
    // הורדת הדוח כ-Word
    const downloadUrl = `${baseURL}/TasheReports/${report.reportId}/download-word`;
    
    // יצירת link זמני להורדה
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `דוח_תשה_${kidName.replace(/\s+/g, '_')}_${new Date(report.periodStartDate).toLocaleDateString('he-IL').replace(/\//g, '-')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadText = (report) => {
    // הורדת הדוח כטקסט
    const downloadUrl = `${baseURL}/TasheReports/${report.reportId}/download-text`;
    
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `דוח_תשה_${kidName.replace(/\s+/g, '_')}_${new Date(report.periodStartDate).toLocaleDateString('he-IL').replace(/\//g, '-')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApprove = async (report) => {
    try {
      await dispatch(approveTasheReport({ 
        reportId: report.reportId, 
        approvedByEmployeeId: currentUser.id 
      })).unwrap();

      Swal.fire({
    title: 'הדוח אושר בהצלחה! 👍',
    text: `הדוח "${report.reportTitle}" אושר ונעול לעריכה`,
    icon: 'success',
    confirmButtonText: 'הבנתי',
    confirmButtonColor: '#4CAF50',
    timer: 2000,
    timerProgressBar: true
  });
      loadReports();
    } catch (error) {
      console.error('שגיאה באישור דוח:', error);
    }
  };

  const handleDeleteClick = (report) => {
    setReportToDelete(report);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reportToDelete) return;
    
    try {
      await dispatch(deleteTasheReport({ 
        reportId: reportToDelete.reportId, 
        deletedByEmployeeId: currentUser.id 
      })).unwrap();

      Swal.fire({
    title: 'הדוח נמחק בהצלחה! 🗑️',
    text: `הדוח "${reportToDelete.reportTitle}" הוסר מהמערכת`,
    icon: 'success',
    confirmButtonText: 'אוקיי',
    confirmButtonColor: '#FF5722',
    timer: 2000,
    timerProgressBar: true
  });
      loadReports();
    } catch (error) {
      console.error('שגיאה במחיקת דוח:', error);
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const getStatusChip = (report) => {
    if (!report) return null; // הוספת בדיקה למקרה של null/undefined
    
    if (report.isApproved) {
      return (
        <Chip
          icon={<ApprovedIcon />}
          label="מאושר"
          color="success"
          size="small"
          variant="outlined"
        />
      );
    } else {
      return (
        <Chip
          icon={<PendingIcon />}
          label="ממתין לאישור"
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    }
  };

  const canApprove = (report) => {
    if (!report) return false; // הוספת בדיקה למקרה של null/undefined
    
    return !report.isApproved && 
           (currentUser.role === 'מנהל/ת' || currentUser.role === 'מנהל');
  };

  const canDelete = (report) => {
    if (!report) return false; // הוספת בדיקה למקרה של null/undefined
    
    return !report.isApproved && 
           (report.generatedByEmployeeId === currentUser.id || 
            currentUser.role === 'מנהל/ת' || 
            currentUser.role === 'מנהל');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין'; // הוספת בדיקה למקרה של תאריך חסר
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const onGeneratorSuccess = () => {
    setGeneratorOpen(false);
    loadReports();
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

      {/* Statistics Widget */}
      {selectedKid?.id && (
        <ReportsStatisticsWidget 
          kidId={selectedKid.id} 
          kidName={kidName}
        />
      )}
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
          startIcon={<AddIcon />}
          onClick={() => setGeneratorOpen(true)}
          disabled={!selectedKid?.id} // השבתה אם אין ילד נבחר
          sx={{
            background: !selectedKid?.id ? 'grey.400' : 'linear-gradient(45deg, #FF6B6B, #4ECDC4)',
            '&:hover': {
              background: !selectedKid?.id ? 'grey.400' : 'linear-gradient(45deg, #FF5252, #26A69A)',
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
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <BrainIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            עדיין לא נוצרו דוחות תש"ה
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            צרו את הדוח הראשון באמצעות הבינה המלאכותית שלנו
          </Typography>
          <Button
            variant="outlined"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => setGeneratorOpen(true)}
            sx={{ px: 4, py: 1.5 }}
          >
            צרו דוח חדש
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} lg={6} key={report.reportId}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold" sx={{ flex: 1, mr: 1 }}>
                      {report.reportTitle}
                    </Typography>
                    {getStatusChip(report)}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>תקופה:</strong> {formatDate(report.periodStartDate)} - {formatDate(report.periodEndDate)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>נוצר על ידי:</strong> {report.generatedByEmployeeName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    <strong>תאריך יצירה:</strong> {formatDate(report.generatedDate)}
                  </Typography>

                  {report.isApproved && (
                    <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                      <strong>אושר על ידי:</strong> {report.approvedByEmployeeName}
                      <br />
                      <strong>בתאריך:</strong> {formatDate(report.approvedDate)}
                    </Typography>
                  )}

                  {report.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      <strong>הערות:</strong> {report.notes}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  {/* כפתורי צפייה והורדה */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewReport(report)}
                      sx={{ mr: 1 }}
                    >
                      צפייה
                    </Button>
                    
                    <Tooltip title="הורדה כ-Word">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadWord(report)}
                        sx={{ 
                          color: 'primary.main',
                          border: '1px solid',
                          borderColor: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'primary.50'
                          }
                        }}
                      >
                        <WordIcon />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="הורדה כטקסט">
                      <IconButton 
                        size="small" 
                        onClick={() => handleDownloadText(report)}
                        sx={{ 
                          color: 'info.main',
                          border: '1px solid',
                          borderColor: 'info.main',
                          '&:hover': {
                            backgroundColor: 'info.50'
                          }
                        }}
                      >
                        <TextIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  
                  {/* כפתורי פעולות מנהלים */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {canEdit(report) && (
                      <Tooltip title="עריכת דוח">
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditClick(report)}
                          sx={{ 
                            color: 'info.main',
                            border: '1px solid',
                            borderColor: 'info.main',
                            '&:hover': {
                              backgroundColor: 'info.50'
                            }
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {canApprove(report) && (
                      <Tooltip title="אישור דוח">
                        <IconButton 
                          size="small" 
                          onClick={() => handleApprove(report)}
                          sx={{ 
                            color: 'success.main',
                            border: '1px solid',
                            borderColor: 'success.main',
                            '&:hover': {
                              backgroundColor: 'success.50'
                            }
                          }}
                        >
                          <ApproveIcon />
                        </IconButton>
                      </Tooltip>
                    )}

                    {canDelete(report) && (
                      <Tooltip title="מחיקת דוח">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(report)}
                          sx={{ 
                            color: 'error.main',
                            border: '1px solid',
                            borderColor: 'error.main',
                            '&:hover': {
                              backgroundColor: 'error.50'
                            }
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Edit Report Dialog */}
      <EditReportDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        report={reportToEdit}
        onSuccess={handleEditSuccess}
      />

      {/* Delete confirmation dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>אישור מחיקה</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתם בטוחים שברצונכם למחוק את הדוח "{reportToDelete?.reportTitle}"?
            <br />
            פעולה זו אינה ניתנת לביטול.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            ביטול
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            מחיקה
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Generator Dialog */}
      <TasheReportGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        selectedKid={selectedKid}
        onSuccess={onGeneratorSuccess}
      />
    </Box>
  );
};

export default KidReportsTab;