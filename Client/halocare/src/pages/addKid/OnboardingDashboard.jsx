
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Tooltip, LinearProgress,
  Divider, 
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axios from '../../components/common/axiosConfig';

import { 
  updateFormStatus,
} from '../../Redux/features/onboardingSlice';

import { fetchParentById } from '../../Redux/features/parentSlice';
import KidDocumentManager from './KidDocumentManager';
import Swal from 'sweetalert2';

// Animated Button matching Employee design - VISUAL ONLY
const AnimatedButton = styled(Button)(({ theme }) => ({
  borderRadius: 16,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: '1rem',
  position: 'relative',
  overflow: 'hidden',
  color: '#fff',
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

// Modern Card matching Employee design - VISUAL ONLY
const ModernCard = styled(Card)(({ theme }) => ({
  display: 'flex',             
  flexDirection: 'column',    
  height: '100%',
  borderRadius: 20,
  
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  backdropFilter: 'blur(20px)',
  background: 'rgba(255, 255, 255, 0.95)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
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

// Section Header matching Employee design - VISUAL ONLY
const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  padding: theme.spacing(1.5, 0),
  borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: '50px',
    height: '2px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043)',
  }
}));

// Stats Card matching Employee design - VISUAL ONLY  
const StatsCard = styled(Card)(({ theme }) => ({
  textAlign: 'center',
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
  },
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

// PRESERVED - All original props and functionality
const OnboardingDashboard = ({ 
  onboardingData, 
  selectedKid, 
  onKidUpdate,
  onFormClick, 
  onSendToParent,
  onRefresh,
  readOnly = false
}) => {
  const dispatch = useDispatch();
  
  // Local State - PRESERVED
  const [sendDialog, setSendDialog] = useState({ open: false, form: null });
  const [parentEmail, setParentEmail] = useState('');
  const [sendingToParent, setSendingToParent] = useState(false);
  const [loadingParentEmail, setLoadingParentEmail] = useState(false);

  // PRESERVED - Parent sending functions (existing code)
  const handleSendToParentInternal = async (form) => {
    try {
      setLoadingParentEmail(true);
      
      if (selectedKid?.parentId1) {
        const parentResult = await dispatch(fetchParentById(selectedKid.parentId1)).unwrap();
        const defaultEmail = parentResult?.email || '';
        setParentEmail(defaultEmail);
      } else {
        setParentEmail('');
      }
      
      setSendDialog({ open: true, form });
    } catch (error) {
      console.error('שגיאה בטעינת נתוני הורה:', error);
      setParentEmail('');
      setSendDialog({ open: true, form });
    } finally {
      setLoadingParentEmail(false);
    }
  };

  // PRESERVED - original function
  const confirmSendToParent = async () => {
    if (!sendDialog.form || !parentEmail.trim()) {
      return;
    }

    try {
      setSendingToParent(true);
      
      const response = await axios.post('/ParentForm/send', {
        kidId: selectedKid.id,
        formId: sendDialog.form.formId,
        parentEmail: parentEmail.trim()
      });

      if (response.data.success) {
        setSendDialog({ open: false, form: null });
        setParentEmail('');
        
        Swal.fire({
          icon: 'success',
          title: 'הטופס נשלח בהצלחה!',
          text: 'הטופס נשלח להורה בהצלחה.',
          confirmButtonText: 'סגור',
          confirmButtonColor: '#4cb5c3'
        })
        
        setTimeout(() => {
          onRefresh && onRefresh();
        }, 1000);
      } else {
        alert('שגיאה בשליחת הטופס');
      }

    } catch (error) {
      console.error('שגיאה בשליחת הטופס:', error);
      alert('שגיאה בשליחת הטופס');
    } finally {
      setSendingToParent(false);
    }
  };

  // PRESERVED - Reset form to start
  const handleResetForm = async (form) => {
    try {
      await dispatch(updateFormStatus({
        kidId: selectedKid.id,
        formId: form.formId,
        newStatus: 'NotStarted',
        notes: `אופס בתאריך ${new Date().toLocaleDateString('he-IL')}`
      })).unwrap();

      setTimeout(() => {
        onRefresh && onRefresh();
      }, 1000);

    } catch (error) {
      console.error('שגיאה באיפוס הטופס:', error);
    }
  };

  // PRESERVED - Permission checks
  const canEditForm = (form) => {
    return ['NotStarted', 'InProgress'].includes(form.status);
  };

  const canSendToParent = (form) => {
    return ['NotStarted', 'InProgress', 'Completed'].includes(form.status);
  };

  // PRESERVED - original condition check
  if (!onboardingData || !onboardingData.forms) {
    return (
      <Alert severity="info" sx={{ 
        borderRadius: 3,
        background: 'rgba(76, 181, 195, 0.1)',
        border: '1px solid rgba(76, 181, 195, 0.2)'
      }}>
        אין נתוני קליטה זמינים
      </Alert>
    );
  }

  return (
    <Box dir="rtl">
      {/* General Statistics - PRESERVED functionality, updated styling */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 12, sm: 3 }}>
          <StatsCard>
            <CardContent>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#4cb5c3' }}>
                {onboardingData.totalForms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                סה"כ טפסים
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item size={{ xs: 12, sm: 3 }}>
          <StatsCard>
            <CardContent>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#10b981' }}>
                {onboardingData.completedForms}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                הושלמו
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item size={{ xs: 12, sm: 3 }}>
          <StatsCard>
            <CardContent>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#ff7043' }}>
                {onboardingData.forms.filter(f => f.status === 'InProgress').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                בתהליך
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
        <Grid item size={{ xs: 12, sm: 3 }}>
          <StatsCard>
            <CardContent>
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#667eea' }}>
                {onboardingData.forms.filter(f => f.status === 'SentToParent').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                אצל הורים
              </Typography>
            </CardContent>
          </StatsCard>
        </Grid>
      </Grid>

      {/* Documents Section - PRESERVED functionality, updated styling */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 700,
            color: '#fff'
          }}>
            📄 ניהול מסמכים
          </Typography>
        </SectionHeader>

        <Alert 
          severity="info" 
          sx={{ 
            mb: 3, 
            borderRadius: 3,
            background: 'rgba(143, 211, 221, 1)',
            border: '1px solid rgba(76, 181, 195, 0.2)'
          }}
        >
          <Typography variant="body2">
            העלאת מסמכים היא אופציונלית ולא חוסמת את תהליך הקליטה.
          </Typography>
        </Alert>

        <KidDocumentManager
          kidId={selectedKid?.id}
          kidName={selectedKid ? `${selectedKid.firstName} ${selectedKid.lastName}` : ''}
          compact={true}
          showUpload={true}
          showStats={true}
          maxHeight={400}
        />
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Forms Section - PRESERVED functionality, updated styling */}
      <SectionHeader>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 700,
          color: '#fff'
        }}>
          📋 טפסי קליטה
        </Typography>
      </SectionHeader>
      
      <Grid container spacing={3}>
        {/* PRESERVED - original forms mapping logic */}
        {onboardingData.forms.map((form) => {
          const progress = form.totalQuestions > 0 
            ? Math.round((form.answeredQuestions / form.totalQuestions) * 100) 
            : 0;

          return (
            <Grid item size={{xs:12 , md:6 , lg:4 }} key={form.formId}>
              <ModernCard>
<CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
    <Box sx={{ flex: 1 }}>

                  {/* Title and Status - PRESERVED */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ 
                      flex: 1,
                      fontWeight: 700,
                      color: '#2a8a95'
                    }}>
                      {form.formName}
                    </Typography>
                  </Box>

                  {/* Description - PRESERVED */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {form.formDescription}
                  </Typography>

                  {/* Progress - PRESERVED functionality, updated styling */}
                  {form.status === 'InProgress' && form.totalQuestions > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          התקדמות
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#4cb5c3', fontWeight: 'bold' }}>
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ 
                          height: 6, 
                          borderRadius: 3,
                          backgroundColor: alpha('#4cb5c3', 0.2),
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #4cb5c3, #10b981)',
                            borderRadius: 3,
                          }
                        }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {form.answeredQuestions} מתוך {form.totalQuestions} שאלות
                      </Typography>
                    </Box>
                  )}

                  {/* Status Chip - PRESERVED functionality, updated styling */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={form.status === 'Completed' ? 'הושלם' : 
                             form.status === 'InProgress' ? 'בתהליך' : 'לא התחיל'}
                      color={form.status === 'Completed' ? 'success' : 
                             form.status === 'InProgress' ? 'warning' : 'default'}
                      size="small"
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-label': {
                          px: 2
                        }
                      }}
                    />
                  </Box>

                  {/* PRESERVED - Original dates section */}
                  <Box sx={{ mt: 'auto' }}>
                    {form.startDate && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        התחיל: {new Date(form.startDate).toLocaleDateString('he-IL')}
                      </Typography>
                    )}
                    {form.completedDate && (
                      <Typography variant="caption" color="success.main" display="block" fontWeight="bold">
                        הושלם: {new Date(form.completedDate).toLocaleDateString('he-IL')}
                      </Typography>
                    )}
                  </Box>
                  </Box>
                </CardContent>

                {/* Card Actions - PRESERVED EXACT ORIGINAL LOGIC */}
                <CardActions sx={{ 
                  justifyContent: 'space-between', 
                  pt: 0,
                  borderTop: `1px solid ${alpha('#4cb5c3', 0.1)}`
                }}>
                  <Box>
                    {/* PRESERVED - Original button logic with exact conditions */}
                    {(canEditForm(form) && !form.formName.includes('אישור'))  ? (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => onFormClick(form, 'edit')}
                        color="primary"
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)'
                          }
                        }}
                      >
                        {form.status === 'NotStarted' ? 'התחל' : 'המשך עריכה'}
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {/* PRESERVED - Original view button condition */}
                        {(form.formId != '1002' || !form.formName.includes('אישי')) && (
                          <Button
                            startIcon={<ViewIcon />}
                            onClick={() => onFormClick(form, 'view')}
                            color="secondary"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(255, 112, 67, 0.3)'
                              }
                            }}
                          >
                            צפייה
                          </Button>
                        )}
                        
                        {/* PRESERVED - Original edit button condition */}
                        {!form.formName.includes('אישור') && (
                          <Button
                            startIcon={<EditIcon />}
                            onClick={() => onFormClick(form, 'edit')}
                            color="primary"
                            size="small"
                            sx={{
                              borderRadius: 2,
                              fontWeight: 600,
                              '&:hover': {
                                transform: 'translateY(-1px)',
                                boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)'
                              }
                            }}
                          >
                            עריכה
                          </Button>
                        )}
                      </Box>
                    )}
                  </Box>
                  
                  <Box>
                    {/* PRESERVED - Original send to parent logic */}
                    {canSendToParent(form) && form.formId != '1002' && (
                        <Tooltip PopperProps={{ disablePortal: true }} title="שלח להורה" arrow >

                      <AnimatedButton
                        size="small"
                        onClick={() => handleSendToParentInternal(form)}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        <SendIcon sx={{ fontSize: '1rem' }} />
                      </AnimatedButton>
                    </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </ModernCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Send Dialog  */}
      <Dialog 
        open={sendDialog.open} 
        onClose={() => setSendDialog({ open: false, form: null })}
        maxWidth="sm"
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
          שליחת טופס להורה
        </DialogTitle>
        
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            הטופס יישלח למייל ההורה הרשום במערכת
          </Typography>
          
          <TextField
            fullWidth
            label="מייל הורה"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            disabled={loadingParentEmail}
            sx={{ 
              borderRadius: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            InputProps={{
              endAdornment: loadingParentEmail && <CircularProgress size={20} />
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <Button 
            onClick={() => setSendDialog({ open: false, form: null })}
            sx={{ borderRadius: 2 }}
          >
            ביטול
          </Button>
          <AnimatedButton
            onClick={confirmSendToParent}
            disabled={sendingToParent || !parentEmail.trim()}
            startIcon={sendingToParent ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingToParent ? 'שולח...' : 'שלח'}
          </AnimatedButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;