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
  Tooltip,
  styled,
  alpha,
  keyframes
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

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

// Enhanced Styled Components
const MainContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.02) 0%, rgba(255, 112, 67, 0.02) 100%)',
  minHeight: '100%',
  position: 'relative'
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
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

const AnimatedBrainIcon = styled(BrainIcon)(({ theme }) => ({
  fontSize: 40,
  color: theme.palette.primary.main,
  marginRight: theme.spacing(2),
  animation: `${pulse} 2s infinite`,
  filter: 'drop-shadow(0 4px 8px rgba(76, 181, 195, 0.3))'
}));

const CreateReportButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)',
  color: 'white',
  fontWeight: 'bold',
  padding: theme.spacing(1.5, 3),
  borderRadius: 16,
  boxShadow: '0 6px 20px rgba(255, 107, 107, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    background: 'linear-gradient(45deg, #FF5252 30%, #26A69A 90%)',
    transform: 'translateY(-3px) scale(1.02)',
    boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)',
    '&::before': {
      left: '100%',
    }
  },
  '&:disabled': {
    background: theme.palette.grey[400],
    boxShadow: 'none',
  }
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  // backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.01)',
    boxShadow: '0 12px 48px rgba(76, 181, 195, 0.15)',
    border: '1px solid rgba(76, 181, 195, 0.3)',
    '&::before': {
      opacity: 1,
    }
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const ActionIconButton = styled(IconButton)(({ theme, color }) => ({
  padding: 8,
  borderRadius: 10,
  border: '1px solid',
  borderColor: theme.palette[color]?.main || theme.palette.primary.main,
  color: theme.palette[color]?.main || theme.palette.primary.main,
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-2px) scale(1.1)',
    backgroundColor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
    boxShadow: `0 6px 20px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.25)}`,
  }
}));

const EmptyStateBox = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    background: 'radial-gradient(circle, rgba(76, 181, 195, 0.05) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const AnimatedEmptyIcon = styled(BrainIcon)(({ theme }) => ({
  fontSize: 80,
  color: theme.palette.grey[300],
  marginBottom: theme.spacing(2),
  animation: `${float} 3s ease-in-out infinite`,
}));

const StyledAlert = styled(Alert)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 16,
  backdropFilter: 'blur(10px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(244, 67, 54, 0.2)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #f44336, #ef5350, #f44336)',
  }
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 20,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  }
}));

const DialogTitleStyled = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255, 152, 0, 0.05) 100%)',
  borderBottom: '2px solid rgba(244, 67, 54, 0.2)',
  fontWeight: 700,
  fontSize: '1.3rem',
}));

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
    if (selectedKid?.id) { // Check that child exists and has ID
      loadReports();
    }

    return () => {
      dispatch(clearError());
    };
  }, [selectedKid?.id]);

  // Basic check that child exists
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
      console.warn('Cannot load reports - no child selected');
      return;
    }

    try {
      await dispatch(fetchTasheReportsByKid(selectedKid.id)).unwrap();
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const handleEditClick = (report) => {
    setReportToEdit(report);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setReportToEdit(null);
    loadReports(); // Refresh list
  };

  const canEdit = (report) => {
    if (!report || !currentUser) return false;
    
    // Simple check: only admin can edit any report, or report creator can edit their report
    const isManager = currentUser.role === 'מנהל' || currentUser.role === 'מנהל/ת';
    const isCreator = report.generatedByEmployeeId === currentUser.id;
    const isNotApproved = !report.isApproved;
    
    return isNotApproved && (isManager || isCreator);
  };

  const handleViewReport = (report) => {
    // Open styled report in new window
    const viewUrl = `/TasheReports/${report.reportId}/view`;
    window.open(baseURL + viewUrl, '_blank', 'width=1200,height=900,scrollbars=yes');
  };

  const handleDownloadWord = (report) => {
    // Download report as Word
    const downloadUrl = `${baseURL}/TasheReports/${report.reportId}/download-word`;
    
    // Create temporary download link
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `דוח_תשה_${kidName.replace(/\s+/g, '_')}_${new Date(report.periodStartDate).toLocaleDateString('he-IL').replace(/\//g, '-')}.docx`;
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
      console.error('Error approving report:', error);
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
      console.error('Error deleting report:', error);
    } finally {
      setDeleteDialogOpen(false);
      setReportToDelete(null);
    }
  };

  const getStatusChip = (report) => {
    if (!report) return null; // Added check for null/undefined
    
    if (report.isApproved) {
      return (
        <StyledChip
          icon={<ApprovedIcon />}
          label="מאושר"
          color="success"
          size="small"
          variant="outlined"
          sx={{
            background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
            color: 'white',
            borderColor: 'transparent',
          }}
        />
      );
    } else {
      return (
        <StyledChip
          icon={<PendingIcon />}
          label="ממתין לאישור"
          color="warning"
          size="small"
          variant="outlined"
          sx={{
            background: 'linear-gradient(45deg, #ff9800 30%, #ffa726 90%)',
            color: 'white',
            borderColor: 'transparent',
          }}
        />
      );
    }
  };

  const canApprove = (report) => {
    if (!report) return false; // Added check for null/undefined
    
    return !report.isApproved && 
           (currentUser.role === 'מנהל/ת' || currentUser.role === 'מנהל');
  };

  const canDelete = (report) => {
    if (!report) return false; // Added check for null/undefined
    
    return !report.isApproved && 
           (report.generatedByEmployeeId === currentUser.id || 
            currentUser.role === 'מנהל/ת' || 
            currentUser.role === 'מנהל');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'לא זמין'; // Added check for missing date
    return new Date(dateString).toLocaleDateString('he-IL');
  };

  const onGeneratorSuccess = () => {
    setGeneratorOpen(false);
    loadReports();
  };

  if (status === 'loading') {
    return (
      <LoadingContainer>
        <CircularProgress 
          sx={{ 
            color: 'primary.main',
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            }
          }} 
        />
      </LoadingContainer>
    );
  }

  return (
    <MainContainer dir="rtl">
      {error && (
        <StyledAlert severity="error">
          {error}
        </StyledAlert>
      )}

      {/* Statistics Widget */}
      {selectedKid?.id && (
        <ReportsStatisticsWidget 
          kidId={selectedKid.id} 
          kidName={kidName}
        />
      )}

      <HeaderBox>
        <AnimatedBrainIcon />
        <Box sx={{ flex: 1 }}>
          <Typography 
            variant="h4" 
            fontWeight="bold"
            sx={{
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            דוחות תש"ה
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
            {kidName} • דוחות התפתחותיים חכמים
          </Typography>
        </Box>
        <CreateReportButton
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={() => setGeneratorOpen(true)}
          disabled={!selectedKid?.id}
        >
          יצירת דוח AI חדש
        </CreateReportButton>
      </HeaderBox>

      {/* Reports Grid */}
      {reports.length === 0 ? (
        <EmptyStateBox>
          <AnimatedEmptyIcon />
          <Typography 
            variant="h5" 
            color="text.secondary" 
            gutterBottom
            sx={{ fontWeight: 600 }}
          >
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
            sx={{ 
              px: 4, 
              py: 1.5,
              borderRadius: 12,
              borderColor: 'primary.main',
              color: 'primary.main',
              fontWeight: 600,
              transition: 'all 0.3s ease',
              '&:hover': {
                borderColor: 'primary.dark',
                background: 'rgba(76, 181, 195, 0.05)',
                transform: 'translateY(-2px)',
              }
            }}
          >
            צרו דוח חדש
          </Button>
        </EmptyStateBox>
      ) : (
        <Grid container spacing={3}>
          {reports.map((report) => (
            <Grid item xs={12} lg={6} key={report.reportId}>
              <StyledCard>
                <CardContent sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        flex: 1, 
                        mr: 1,
                        background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                      }}
                    >
                      {report.reportTitle}
                    </Typography>
                    {getStatusChip(report)}
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <strong>תקופה:</strong> {formatDate(report.periodStartDate)} - {formatDate(report.periodEndDate)}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <strong>נוצר על ידי:</strong> {report.generatedByEmployeeName}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                    <strong>תאריך יצירה:</strong> {formatDate(report.generatedDate)}
                  </Typography>

                  {report.isApproved && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'success.main', fontWeight: 600 }}>
                      <strong>אושר על ידי:</strong> {report.approvedByEmployeeName}
                      <br />
                      <strong>בתאריך:</strong> {formatDate(report.approvedDate)}
                    </Typography>
                  )}

                  {report.notes && (
                    <Typography variant="body2" sx={{ 
                      mt: 1, 
                      fontStyle: 'italic',
                      color: 'text.secondary',
                      p: 1.5,
                      background: 'rgba(76, 181, 195, 0.05)',
                      borderRadius: 2,
                      borderLeft: '3px solid',
                      borderColor: 'primary.main'
                    }}>
                      <strong>הערות:</strong> {report.notes}
                    </Typography>
                  )}
                </CardContent>

                <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 3 }}>
                  {/* View and download buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => handleViewReport(report)}
                      sx={{ 
                        mr: 1,
                        borderRadius: 10,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          borderColor: 'primary.dark',
                          background: 'rgba(76, 181, 195, 0.05)',
                          transform: 'translateY(-2px)',
                        }
                      }}
                    >
                      צפייה
                    </Button>
                    
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
  }} title="הורדה כ-Word">
                      <ActionIconButton 
                        size="small" 
                        onClick={() => handleDownloadWord(report)}
                        color="primary"
                      >
                        <WordIcon />
                      </ActionIconButton>
                    </Tooltip>

                  </Box>
                  
                  {/* Admin action buttons */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {canEdit(report) && (
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
  }} title="עריכת דוח">
                        <ActionIconButton 
                          size="small" 
                          onClick={() => handleEditClick(report)}
                          color="info"
                        >
                          <EditIcon />
                        </ActionIconButton>
                      </Tooltip>
                    )}

                    {canApprove(report) && (
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
  }} title="אישור דוח">
                        <ActionIconButton 
                          size="small" 
                          onClick={() => handleApprove(report)}
                          color="success"
                        >
                          <ApproveIcon />
                        </ActionIconButton>
                      </Tooltip>
                    )}

                    {canDelete(report) && (
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
  }} title="מחיקת דוח">
                        <ActionIconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(report)}
                          color="error"
                        >
                          <DeleteIcon />
                        </ActionIconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </StyledCard>
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
      <StyledDialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitleStyled>אישור מחיקה</DialogTitleStyled>
        <DialogContent sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 500 }}>
            האם אתם בטוחים שברצונכם למחוק את הדוח "{reportToDelete?.reportTitle}"?
            <br />
            <Typography component="span" color="error" sx={{ fontWeight: 700 }}>
              פעולה זו אינה ניתנת לביטול.
            </Typography>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ 
              borderRadius: 10,
              px: 3,
              fontWeight: 600
            }}
          >
            ביטול
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            sx={{ 
              borderRadius: 10,
              px: 3,
              fontWeight: 600,
              background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
              }
            }}
          >
            מחיקה
          </Button>
        </DialogActions>
      </StyledDialog>

      {/* Report Generator Dialog */}
      <TasheReportGenerator
        open={generatorOpen}
        onClose={() => setGeneratorOpen(false)}
        selectedKid={selectedKid}
        onSuccess={onGeneratorSuccess}
      />
    </MainContainer>
  );
};

export default KidReportsTab;