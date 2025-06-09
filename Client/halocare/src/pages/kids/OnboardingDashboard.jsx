// // src/pages/kids/OnboardingDashboard.jsx
// import React, { useState, useEffect } from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import {
//   Box, Paper, Typography, Grid, Card, CardContent, CardActions,
//   Button, Chip, LinearProgress, IconButton, Tooltip, Divider,
//   Alert, AlertTitle, Fade, Dialog, DialogTitle, DialogContent,
//   DialogActions, CircularProgress
// } from '@mui/material';
// import {
//   CheckCircle as CheckIcon,
//   PlayArrow as StartIcon,
//   Edit as EditIcon,
//   Send as SendIcon,
//   Schedule as ScheduleIcon,
//   Email as EmailIcon,
//   Warning as WarningIcon,
//   Info as InfoIcon,
//   Assignment as AssignmentIcon
// } from '@mui/icons-material';
// import { styled } from '@mui/material/styles';
// import Swal from 'sweetalert2';
// import VisibilityIcon from '@mui/icons-material/Visibility';
// import { 
//   completeFormStep, 
//   sendFormToParent,
//   updateFormStatusLocally 
// } from '../../Redux/features/onboardingSlice';

// // עיצוב מותאם לכרטיס טופס
// const FormCard = styled(Card)(({ theme, status }) => {
//   const getCardStyles = () => {
//     switch (status) {
//       case 'completed':
//       case 'completed_by_parent':
//         return {
//           borderLeft: `6px solid ${theme.palette.success.main}`,
//           backgroundColor: theme.palette.success.light + '10',
//         };
//       case 'in_progress':
//         return {
//           borderLeft: `6px solid ${theme.palette.primary.main}`,
//           backgroundColor: theme.palette.primary.light + '10',
//         };
//       case 'sent_to_parent':
//         return {
//           borderLeft: `6px solid ${theme.palette.info.main}`,
//           backgroundColor: theme.palette.info.light + '10',
//         };
//       default:
//         return {
//           borderLeft: `6px solid ${theme.palette.grey[300]}`,
//           backgroundColor: theme.palette.grey[50],
//         };
//     }
//   };

//   return {
//     height: '100%',
//     transition: 'all 0.3s ease',
//     cursor: 'pointer',
//     ...getCardStyles(),
//     '&:hover': {
//       transform: 'translateY(-4px)',
//       boxShadow: theme.shadows[8],
//     }
//   };
// });

// const OnboardingDashboard = ({ 
//   kidId, 
//   onboardingData, 
//   onFormSelect,
//   onSendToParent,
//   loading = false 
// }) => {
//   const dispatch = useDispatch();
//   const [sendDialog, setSendDialog] = useState({ open: false, form: null });
//   const { completingForm, sendingToParent } = useSelector(state => state.onboarding);

//   if (!onboardingData) {
//     return (
//       <Alert severity="info" sx={{ mb: 3 }}>
//         <AlertTitle>אין נתוני קליטה</AlertTitle>
//         לא נמצא תהליך קליטה עבור ילד זה
//       </Alert>
//     );
//   }

//   // פונקציות עזר
//   const getStatusConfig = (form) => {
//     switch (form.status) {
//       case 'completed':
//         return {
//           icon: <CheckIcon />,
//           label: 'הושלם',
//           color: 'success',
//           variant: 'filled'
//         };
//       case 'completed_by_parent':
//         return {
//           icon: <CheckIcon />,
//           label: 'הושלם ע"י הורים',
//           color: 'success',
//           variant: 'filled'
//         };
//       case 'in_progress':
//         return {
//           icon: <EditIcon />,
//           label: 'בתהליך',
//           color: 'primary',
//           variant: 'filled'
//         };
//       case 'sent_to_parent':
//         return {
//           icon: <EmailIcon />,
//           label: 'נשלח להורים',
//           color: 'info',
//           variant: 'filled'
//         };
//       default:
//         return {
//           icon: <ScheduleIcon />,
//           label: 'לא התחיל',
//           color: 'default',
//           variant: 'outlined'
//         };
//     }
//   };

//   const getProgressPercentage = (form) => {
//     if (form.totalQuestions === 0) return 0;
//     return Math.round((form.answeredQuestions / form.totalQuestions) * 100);
//   };

//   const canEditForm = (form) => {
//     return ['not_started', 'in_progress'].includes(form.status);
//   };

//   const canSendToParent = (form) => {
//     return form.status === 'in_progress' && form.answeredQuestions > 0;
//   };

//   const isCompleted = (form) => {
//     return ['completed', 'completed_by_parent'].includes(form.status);
//   };

//   // טיפול בפעולות
//   const handleFormClick = (form) => {
//     // כל הטפסים ניתנים לעריכה - כולל הטופס הראשון
//     if (onFormSelect) {
//       onFormSelect(form);
//     }
//   };

//   const handleSendToParent = (form) => {
//     setSendDialog({ open: true, form });
//   };

//   const confirmSendToParent = async () => {
//     const { form } = sendDialog;
//     setSendDialog({ open: false, form: null });

//     try {
//       await dispatch(sendFormToParent({ 
//         kidId, 
//         formId: form.form.formId 
//       })).unwrap();

//       Swal.fire({
//         icon: 'success',
//         title: 'נשלח בהצלחה!',
//         text: `הטופס "${form.form.formName}" נשלח להורים למילוי`,
//         timer: 3000,
//         showConfirmButton: false
//       });

//       if (onSendToParent) {
//         onSendToParent(form);
//       }
//     } catch (error) {
//       Swal.fire({
//         icon: 'error',
//         title: 'שגיאה בשליחה',
//         text: error.message || 'אירעה שגיאה בשליחת הטופס להורים'
//       });
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ textAlign: 'center', py: 4 }}>
//         <CircularProgress size={60} />
//         <Typography variant="h6" sx={{ mt: 2 }}>
//           טוען נתוני קליטה...
//         </Typography>
//       </Box>
//     );
//   }

//   return (
//     <Box dir="rtl">
//       {/* כותרת עם סטטיסטיקות */}
//       <Paper sx={{ p: 3, mb: 4, borderRadius: 3 }}>
//         <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//           <AssignmentIcon color="primary" />
//           טפסי קליטה
//         </Typography>
        
//         <Grid container spacing={2} sx={{ mt: 1 }}>
//           <Grid item xs={12} sm={3}>
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography variant="h3" color="primary.main" fontWeight="bold">
//                 {onboardingData.completionPercentage}%
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 התקדמות כללית
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography variant="h3" color="success.main" fontWeight="bold">
//                 {onboardingData.completedForms}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 טפסים הושלמו
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography variant="h3" color="warning.main" fontWeight="bold">
//                 {onboardingData.forms.filter(f => f.status === 'in_progress').length}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 בתהליך
//               </Typography>
//             </Box>
//           </Grid>
//           <Grid item xs={12} sm={3}>
//             <Box sx={{ textAlign: 'center' }}>
//               <Typography variant="h3" color="info.main" fontWeight="bold">
//                 {onboardingData.forms.filter(f => f.status === 'sent_to_parent').length}
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 נשלחו להורים
//               </Typography>
//             </Box>
//           </Grid>
//         </Grid>

//         <Box sx={{ mt: 3 }}>
//           <LinearProgress 
//             variant="determinate" 
//             value={onboardingData.completionPercentage} 
//             sx={{ height: 12, borderRadius: 6 }}
//           />
//         </Box>
//       </Paper>

//       {/* רשת כרטיסי הטפסים */}
//       <Grid container spacing={3}>
//         {onboardingData.forms.map((form, index) => {
//           const statusConfig = getStatusConfig(form);
//           const progressPercentage = getProgressPercentage(form);

//           return (
//             <Grid item xs={12} md={6} lg={4} key={form.form.formId}>
//               <Fade in={true} timeout={300 + (index * 100)}>
//                 <FormCard 
//                   status={form.status}
//                   onClick={() => handleFormClick(form)}
//                 >
//                   <CardContent sx={{ pb: 1 }}>
//                     {/* כותרת הטופס */}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
//                       <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', flex: 1 }}>
//                         {form.form.formName}
//                       </Typography>
//                       <Chip
//                         icon={statusConfig.icon}
//                         label={statusConfig.label}
//                         color={statusConfig.color}
//                         variant={statusConfig.variant}
//                         size="small"
//                       />
//                     </Box>

//                     {/* תיאור הטופס */}
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                       {form.form.formDescription}
//                     </Typography>

//                     {/* התקדמות */}
//                     {!form.form.isFirstStep && form.totalQuestions > 0 && (
//                       <Box sx={{ mb: 2 }}>
//                         <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
//                           <Typography variant="body2" color="text.secondary">
//                             התקדמות:
//                           </Typography>
//                           <Typography variant="body2" fontWeight="bold">
//                             {form.answeredQuestions}/{form.totalQuestions} שאלות
//                           </Typography>
//                         </Box>
//                         <LinearProgress 
//                           variant="determinate" 
//                           value={progressPercentage}
//                           sx={{ height: 6, borderRadius: 3 }}
//                         />
//                       </Box>
//                     )}

//                     {/* מידע נוסף */}
//                     {form.completedAt && (
//                       <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
//                         הושלם ב: {new Date(form.completedAt).toLocaleDateString('he-IL')}
//                       </Typography>
//                     )}
                    
//                     {form.sentToParentAt && (
//                       <Typography variant="caption" color="info.main" sx={{ display: 'block', mt: 1 }}>
//                         נשלח להורים ב: {new Date(form.sentToParentAt).toLocaleDateString('he-IL')}
//                       </Typography>
//                     )}
//                   </CardContent>

//                   {/* פעולות */}
//                   <CardActions sx={{ pt: 0, px: 2, pb: 2 }}>
//                     <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
//                       {/* כל הטפסים ניתנים לעריכה */}
//                       {!isCompleted(form) && (
//                         <Button
//                           size="small"
//                           variant="contained"
//                           startIcon={form.status === 'not_started' ? <StartIcon /> : <EditIcon />}
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             handleFormClick(form);
//                           }}
//                           sx={{ flex: 1 }}
//                         >
//                           {form.status === 'not_started' ? 'התחל' : 'המשך'}
//                         </Button>
//                       )}

//                       {/* שליחה להורים - רק לטפסים שאינם הראשון */}
//                       {!form.form.isFirstStep && canSendToParent(form) && (
//                         <Tooltip title="שלח טופס להורים למילוי">
//                           <IconButton
//                             size="small"
//                             color="secondary"
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleSendToParent(form);
//                             }}
//                             disabled={sendingToParent}
//                           >
//                             <SendIcon />
//                           </IconButton>
//                         </Tooltip>
//                       )}

//                       {/* צפייה/עריכה - תמיד זמין */}
//                       <Button
//                         size="small"
//                         variant={isCompleted(form) ? "outlined" : "contained"}
//                         startIcon={isCompleted(form) ? <VisibilityIcon /> : <EditIcon />}
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleFormClick(form);
//                         }}
//                         sx={{ flex: 1 }}
//                       >
//                         {isCompleted(form) ? 'צפה/ערוך' : 'ערוך'}
//                       </Button>
//                     </Box>
//                   </CardActions>
//                 </FormCard>
//               </Fade>
//             </Grid>
//           );
//         })}
//       </Grid>

//       {/* דיאלוג אישור שליחה להורים */}
//       <Dialog
//         open={sendDialog.open}
//         onClose={() => setSendDialog({ open: false, form: null })}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>שליחת טופס להורים</DialogTitle>
//         <DialogContent>
//           <Typography>
//             האם ברצונך לשלוח את הטופס "{sendDialog.form?.form?.formName}" להורים למילוי?
//           </Typography>
//           <Alert severity="info" sx={{ mt: 2 }}>
//             הטופס יישלח להורים באימייל/SMS עם קישור למילוי
//           </Alert>
//         </DialogContent>
//         <DialogActions>
//           <Button 
//             onClick={() => setSendDialog({ open: false, form: null })}
//             disabled={sendingToParent}
//           >
//             ביטול
//           </Button>
//           <Button 
//             onClick={confirmSendToParent}
//             variant="contained"
//             disabled={sendingToParent}
//             startIcon={sendingToParent ? <CircularProgress size={20} /> : <SendIcon />}
//           >
//             {sendingToParent ? 'שולח...' : 'שלח'}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default OnboardingDashboard;