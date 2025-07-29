
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
} from '@mui/icons-material';
import axios from '../../components/common/axiosConfig';

import { 
  updateFormStatus,
} from '../../Redux/features/onboardingSlice';

import { fetchParentById } from '../../Redux/features/parentSlice';

import KidDocumentManager from './KidDocumentManager';

const OnboardingDashboard = ({ 
  onboardingData, 
  selectedKid, 
  onFormClick, 
  onRefresh 
}) => {
  const dispatch = useDispatch();
  
  // Local State 
  const [sendDialog, setSendDialog] = useState({ open: false, form: null });
  const [parentEmail, setParentEmail] = useState('');
  const [sendingToParent, setSendingToParent] = useState(false);
  const [loadingParentEmail, setLoadingParentEmail] = useState(false);

  // Parent sending functions (existing code)
  const handleSendToParent = async (form) => {
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
        
        alert('הטופס נשלח בהצלחה להורה!');
        
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

  // Reset form to start
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

  // Permission checks
  const canEditForm = (form) => {
    return ['NotStarted', 'InProgress'].includes(form.status);
  };

  const canSendToParent = (form) => {
    return ['NotStarted', 'InProgress', 'Completed'].includes(form.status);
  };

  if (!onboardingData || !onboardingData.forms) {
    return (
      <Alert severity="info">
        אין נתוני קליטה זמינים
      </Alert>
    );
  }

  return (
    <Box dir="rtl">
      {/* General Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{xs:12, sm:3}}>
          <Card sx={{ textAlign: 'center', bgcolor: 'success.light', color: 'white', borderRadius: 20, width: '90px' }}>
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {onboardingData.completedForms}
              </Typography>
              <Typography variant="body2">
                הושלמו
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs:12, sm:3}}>
          <Card sx={{ textAlign: 'center', bgcolor: 'primary.dark', color: 'white', borderRadius: 20, width: '90px' }}>
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {onboardingData.forms.filter(f => f.status === 'InProgress').length}
              </Typography>
              <Typography variant="body2">
                בתהליך
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs:12, sm:3}}>
          <Card sx={{ textAlign: 'center', bgcolor: 'info.light', color: 'white', borderRadius: 20, width: '90px' }}>
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {onboardingData.forms.filter(f => f.status === 'SentToParent').length}
              </Typography>
              <Typography variant="body2">
                אצל הורים
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item size={{xs:12, sm:3}}>
          <Card sx={{ textAlign: 'center', bgcolor: 'grey.400', color: 'white', borderRadius: 20, width: '90px' }}>
            <CardContent>
              <Typography variant="h3" fontWeight="bold">
                {onboardingData.forms.filter(f => f.status === 'NotStarted').length}
              </Typography>
              <Typography variant="body2">
                לא התחילו
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* New Documents Area */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FolderIcon sx={{ mr: 1, color: 'primary.main' }} />
          מסמכים ותעודות
          <Chip 
            label="אופציונלי" 
            size="small" 
            color="secondary" 
            sx={{ ml: 1 }} 
          />
        </Typography>
        
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            ניתן להעלות מסמכים רלוונטיים לילד (תעודות חיסונים, דוחות רפואיים, תעודות וכו'). 
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

      {/* Form Cards */}
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        טפסי קליטה
      </Typography>
      
      <Grid container spacing={3}>
        {onboardingData.forms.map((form) => {
          const progress = form.totalQuestions > 0 
            ? Math.round((form.answeredQuestions / form.totalQuestions) * 100) 
            : 0;

          return (
            <Grid item size={{xs:12, md:6, lg:4}} key={form.formId}>
              <Card 
                sx={{ 
                  height: '100%',
                  width: '200px',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.2s ease',
                  borderRadius: 4,
                  boxShadow: 5,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flex: 1 }}>
                  {/* Title and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ flex: 1 }}>
                      {form.formName}
                    </Typography>
                  </Box>

                  {/* Description */}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {form.formDescription}
                  </Typography>

                  {/* Progress */}
                  {form.status === 'InProgress' && form.totalQuestions > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          התקדמות
                        </Typography>
                        
                        <Typography variant="caption" color="primary" fontWeight="bold">
                          {progress}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        {form.answeredQuestions} מתוך {form.totalQuestions} שאלות
                      </Typography>
                      

                    </Box>
                  )}
                  {/* Dates */}
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
                </CardContent>

                {/* Actions */}
                <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                  <Box>
                    {/* Buttons for Edit/View */}
                    { canEditForm(form) ? (
                      <Button
                        startIcon={<EditIcon />}
                        onClick={() => onFormClick(form, 'edit')}
                        color="primary"
                      >
                        {form.status === 'NotStarted' ? 'התחל' : 'המשך עריכה'}
                      </Button>
                    ) : (
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {(form.formId != '1002' || !form.formName.includes('אישי') )&& (
                          <Button
                            startIcon={<ViewIcon />}
                            onClick={() => onFormClick(form, 'view')}
                            color="secondary"
                            size="small"
                          >
                            צפייה
                          </Button>
                        )}
                                                {!form.formName.includes('אישור') && (

                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => onFormClick(form, 'edit')}
                          color="primary"
                          size="small"
                        >
                          עריכה
                        </Button>
                                                                        )}

                      </Box>
                    )}
                  </Box>
                  <Box>
                    {/* Send to Parent */}
                    {canSendToParent(form) && form.formId != '1002' && (
                      <Tooltip PopperProps={{ disablePortal: true }} title="שלח טופס להורה">
                        <IconButton
                          onClick={() => handleSendToParent(form)}
                          color="info"
                        >
                          <SendIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Parent Send Dialog - existing code */}
      <Dialog 
        open={sendDialog.open} 
        onClose={() => setSendDialog({ open: false, form: null })}
        maxWidth="sm"
        dir='rtl'
        fullWidth
      >
        <DialogTitle>
          שליחת טופס להורה
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            שליחת הטופס "{sendDialog.form?.formName}" להורה של {selectedKid?.firstName}
          </Typography>
          
          {loadingParentEmail && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                טוען פרטי הורה...
              </Typography>
            </Box>
          )}
          
          <TextField
            fullWidth
            label="כתובת דוא״ל של ההורה"
            type="email"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
            margin="normal"
            required
            placeholder="example@email.com"
            helperText="הטופס יישלח עם קישור למילוי אונליין"
            disabled={true}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            הטופס יישלח להורים באימייל עם קישור למילוי
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSendDialog({ open: false, form: null })}
            disabled={sendingToParent || loadingParentEmail}
          >
            ביטול
          </Button>
          <Button 
            onClick={confirmSendToParent}
            variant="contained"
            disabled={sendingToParent || !parentEmail.trim() || loadingParentEmail}
            startIcon={sendingToParent ? <CircularProgress size={20} /> : <SendIcon />}
          >
            {sendingToParent ? 'שולח...' : 'שלח'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OnboardingDashboard;
