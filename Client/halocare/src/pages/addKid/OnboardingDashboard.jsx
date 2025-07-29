
// OnboardingDashboard.jsx - Updated with Employee styling
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box, Grid, Card, CardContent, CardActions, Typography, Button,
  Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Tooltip, LinearProgress,
  Divider, Paper, Container, Fade
} from '@mui/material';
import {
  Edit as EditIcon,
  Send as SendIcon,
  Visibility as ViewIcon,
  Folder as FolderIcon,
  Star as StarIcon,
  AutoAwesome as AutoAwesomeIcon
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import axios from '../../components/common/axiosConfig';

import { 
  updateFormStatus,
} from '../../Redux/features/onboardingSlice';

import { fetchParentById } from '../../Redux/features/parentSlice';
import KidDocumentManager from './KidDocumentManager';

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

// Modern Card matching Employee design
const ModernCard = styled(Card)(({ theme }) => ({
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

// Section Header matching Employee design
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

const OnboardingDashboard = ({ 
  onboardingData, 
  selectedKid,
  onKidUpdate,
  readOnly = false
}) => {
  const dispatch = useDispatch();
  
  // Local state
  const [sendDialog, setSendDialog] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [sendingToParent, setSendingToParent] = useState(false);

  // Handle form actions
  const handleFormAction = (form, action) => {
    setSelectedForm(form);
    if (action === 'send') {
      setSendDialog(true);
      setEmailContent(`שלום,\n\nאנא מלא את הטופס: ${form.formName}\n\nתודה`);
    }
  };

  // Send form to parent
  const handleSendToParent = async () => {
    setSendingToParent(true);
    try {
      // API call to send email
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      setSendDialog(false);
      setEmailContent('');
    } catch (error) {
      console.error('Error sending form:', error);
    } finally {
      setSendingToParent(false);
    }
  };

  if (!onboardingData) {
    return (
      <Container>
        <Alert severity="info" sx={{ borderRadius: 3 }}>
          אין נתוני קליטה זמינים
        </Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Documents Section */}
      <Box sx={{ mb: 4 }}>
        <SectionHeader>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center',
            fontWeight: 700,
            color: '#2a8a95'
          }}>
            <FolderIcon sx={{ mr: 2, color: '#4cb5c3' }} />
            📄 ניהול מסמכים
          </Typography>
        </SectionHeader>

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
            💡 העלאת מסמכים היא אופציונלית ולא חוסמת את תהליך הקליטה.
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

      {/* Forms Section */}
      <SectionHeader>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 700,
          color: '#2a8a95'
        }}>
          <StarIcon sx={{ mr: 2, color: '#ff7043' }} />
          📋 טפסי קליטה
        </Typography>
      </SectionHeader>
      
      <Grid container spacing={3}>
        {onboardingData.forms.map((form) => {
          const progress = form.totalQuestions > 0 
            ? Math.round((form.answeredQuestions / form.totalQuestions) * 100) 
            : 0;

          return (
            <Grid item xs={12} md={6} lg={4} key={form.formId}>
              <ModernCard>
                <CardContent sx={{ flex: 1, p: 3 }}>
                  {/* Title and Status */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h3" sx={{ 
                      flex: 1,
                      fontWeight: 700,
                      color: '#2a8a95'
                    }}>
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

                  {/* Status Chip */}
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      label={form.status === 'Completed' ? 'הושלם' : 
                             form.status === 'InProgress' ? 'בתהליך' : 'לא התחיל'}
                      color={form.status === 'Completed' ? 'success' : 
                             form.status === 'InProgress' ? 'warning' : 'default'}
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                </CardContent>

                <CardActions sx={{ 
                  p: 2, 
                  pt: 0,
                  justifyContent: 'space-between',
                  borderTop: `1px solid ${alpha('#4cb5c3', 0.1)}`
                }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="צפייה בטופס">
                      <IconButton 
                        size="small"
                        sx={{ 
                          color: '#4cb5c3',
                          '&:hover': { 
                            backgroundColor: alpha('#4cb5c3', 0.1),
                            transform: 'scale(1.1)'
                          }
                        }}
                        onClick={() => handleFormAction(form, 'view')}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                    
                    {!readOnly && (
                      <Tooltip title="עריכת טופס">
                        <IconButton 
                          size="small"
                          sx={{ 
                            color: '#ff7043',
                            '&:hover': { 
                              backgroundColor: alpha('#ff7043', 0.1),
                              transform: 'scale(1.1)'
                            }
                          }}
                          onClick={() => handleFormAction(form, 'edit')}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {!readOnly && (
                    <AnimatedButton
                      size="small"
                      onClick={() => handleFormAction(form, 'send')}
                      sx={{ minWidth: 'auto', px: 2 }}
                    >
                      <SendIcon sx={{ fontSize: '1rem' }} />
                    </AnimatedButton>
                  )}
                </CardActions>
              </ModernCard>
            </Grid>
          );
        })}
      </Grid>

      {/* Send Dialog */}
      <Dialog 
        open={sendDialog} 
        onClose={() => setSendDialog(false)}
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
          fontWeight: 700
        }}>
          <AutoAwesomeIcon sx={{ mr: 2 }} />
          שליחת טופס להורה
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
            הטופס יישלח למייל ההורה הרשום במערכת
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="תוכן ההודעה"
            value={emailContent}
            onChange={(e) => setEmailContent(e.target.value)}
            sx={{ borderRadius: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <Button 
            onClick={() => setSendDialog(false)}
            sx={{ borderRadius: 2 }}
          >
            ביטול
          </Button>
          <AnimatedButton
            onClick={handleSendToParent}
            disabled={sendingToParent}
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