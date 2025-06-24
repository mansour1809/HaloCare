import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, 
  CircularProgress, Alert, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent,
  DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assignment as FormIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import axios from 'axios';
import QuestionRenderer from '../kids/QuestionRenderer';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MultipleEntriesComponent from './MultipleEntriesComponent';

const PublicParentFormPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [kidIdNumber, setKidIdNumber] = useState('');
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitDialog, setSubmitDialog] = useState(false);
  const [multipleEntriesData, setMultipleEntriesData] = useState({});

  const steps = ['אימות זהות', 'מילוי הטופס', 'סיום'];

// Function to handle complex data
  const handleMultipleEntriesChange = (questionNo, entriesData) => {
    setMultipleEntriesData(prev => ({
      ...prev,
      [questionNo]: entriesData
    }));
  };



  // Access Validation
  const handleValidation = async () => {
    if (!kidIdNumber.trim()) {
      setError('נא להזין תעודת זהות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Token and ID validation
      const validateResponse = await axios.post('/ParentForm/validate', {
        token,
        kidIdNumber: kidIdNumber.trim()
      });

      if (validateResponse.data.success) {
        // Loading form data
        const formResponse = await axios.get(`/ParentForm/form/${token}`);
        
        if (formResponse.data) {
          setFormData(formResponse.data);
          
            // Loading existing answers
          const existingAnswers = {};
          formResponse.data.existingAnswers?.forEach(answer => {
            existingAnswers[answer.questionNo] = {
              answer: answer.answer || '',
              other: answer.other || ''
            };
          });
          setAnswers(existingAnswers);
          
          setCurrentStep(1);
        } else {
          setError('שגיאה בטעינת נתוני הטופס');
        }
      } else {
        setError('תעודת זהות שגויה או קישור לא תקין');
      }
    } catch (error) {
      console.error('שגיאה באימות:', error);
      setError('שגיאה באימות. אנא נסה שוב.');
    } finally {
      setLoading(false);
    }
  };

  // Answer update
  const handleAnswerChange = (questionNo, answer, other = '') => {
    setAnswers(prev => ({
      ...prev,
      [questionNo]: { answer, other }
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Convert answers to the required format
      const formattedAnswers = Object.entries(answers).map(([questionNo, answerData]) => {
        const question = formData.questions.find(q => q.questionNo === parseInt(questionNo));
        
        let answerObject = {
          questionNo: parseInt(questionNo),
          answer: answerData.answer || '',
          other: answerData.other || ''
        };

        // Adding complex data if available
        if (question?.requiresMultipleEntries && answerData.answer === 'כן') {
          const entriesData = multipleEntriesData[questionNo];
          if (entriesData && entriesData.length > 0) {
            const validEntries = entriesData.filter(entry => 
              Object.values(entry).some(val => val && val.toString().trim())
            );
            if (validEntries.length > 0) {
              answerObject.multipleEntries = validEntries;
            }
          }
        }

        return answerObject;
      });

      const payload = {
        token: token,
        answers: formattedAnswers
      };

      const response = await axios.post('/ParentForm/submit', payload);
      
      if (response.data.success) {
        setCurrentStep(2);
      } else {
        setError(response.data.message || 'שגיאה בשמירת הטופס');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('שגיאה בשליחת הטופס. אנא נסה שוב.');
    } finally {
      setLoading(false);
      setSubmitDialog(false);
    }
  };
       

  const calculateProgress = () => {
    if (!formData?.questions?.length) return 0;
    
    const mandatoryQuestions = formData.questions.filter(q => q.isMandatory);
    const answeredMandatory = mandatoryQuestions.filter(q => {
      const answer = answers[q.questionNo];
      return answer && answer.answer && answer.answer.trim() !== '';
    });
    
    return mandatoryQuestions.length > 0 
      ? Math.round((answeredMandatory.length / mandatoryQuestions.length) * 100) 
      : 0;
  };

  const getAnswerValue = (questionNo) => {
    const answer = answers[questionNo];
    return {
      answer: answer?.answer || '',
      other: answer?.other || ''
    };
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container dir="rtl" maxWidth="md" sx={{ py: 4 }}>
      {/* כותרת */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom color="primary">
          גן הילד
        </Typography>
        <Typography variant="h5" color="text.secondary">
          מילוי טופס הורים
        </Typography>
      </Box>

      {/* Stepper */}
      <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              StepIconComponent={({ active, completed }) => (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: completed ? 'success.main' : active ? 'primary.main' : 'grey.300',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}
                >
                  {completed ? <SuccessIcon /> : 
                   active && index === 0 ? <SecurityIcon /> :
                   active && index === 1 ? <FormIcon /> :
                   index + 1}
                </Box>
              )}
            >
              {label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Errors */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Content by step */}
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        {currentStep === 0 && (
          <Box sx={{ textAlign: 'center' }}>
            <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              אימות זהות
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              לצורכי אבטחה, נא להזין את תעודת הזהות של הילד/ה
            </Typography>
            
            <Box sx={{ maxWidth: 300, mx: 'auto' }}>
              <TextField
                fullWidth
                label="תעודת זהות של הילד/ה"
                value={kidIdNumber}
                onChange={(e) => setKidIdNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
                disabled={loading}
                sx={{ mb: 3 }}
                inputProps={{ maxLength: 9 }}
              />
              
              <Button
                fullWidth
                variant="contained"
                onClick={handleValidation}
                disabled={loading || !kidIdNumber.trim()}
                size="large"
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'מאמת...' : 'המשך'}
              </Button>
            </Box>
          </Box>
        )}

        {currentStep === 1 && formData && (
          <Box>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                {formData.form.formName}
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                עבור: {formData.kid.firstName} {formData.kid.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {formData.form.formDescription}
              </Typography>
              
              {/* Progress */}
              <Box sx={{ mt: 2, mx: 'auto', maxWidth: 400 }}>
                <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                  התקדמות: {calculateProgress()}%
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: 8,
                    backgroundColor: 'grey.200',
                    borderRadius: 4,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${calculateProgress()}%`,
                      height: '100%',
                      backgroundColor: 'primary.main',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* Form questions */}
            <Box sx={{ mb: 4 }}>
              {formData.questions.map((question) => {
                const { answer, other } = getAnswerValue(question.questionNo);
                
                return (
                  <Box key={question.questionNo} sx={{ mb: 3 }}>
                    <QuestionRenderer
                      question={question}
                      value={answer}
                      otherValue={other}
                      onChange={(value, otherValue) =>
                        handleAnswerChange(
                          question.questionNo,
                          value,
                          otherValue
                        )
                      }
                      readOnly={false}
                    />

                    {/* Adding complex data component */}
                    {question.requiresMultipleEntries &&
                      answer === "כן" && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            פרטי תשובות נוספות:
                          </Typography>
                          <MultipleEntriesComponent
                            question={question}
                            existingAnswer={{
                              multipleEntries: JSON.stringify(
                                multipleEntriesData[question.questionNo] || []
                              ),
                            }}
                            onDataChange={(data) =>
                              handleMultipleEntriesChange(
                                question.questionNo,
                                data
                              )
                            }
                          />
                        </Box>
                      )}
                  </Box>
                );
              })}
            </Box>

            {/* Save button */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setSubmitDialog(true)}
                disabled={loading || calculateProgress() < 100}
                sx={{ minWidth: 200 }}
              >
                שלח טופס
              </Button>
              
              {calculateProgress() < 100 && (
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
                  יש למלא את כל השאלות החובה לפני השליחה
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {currentStep === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom color="success.main">
              הטופס נשלח בהצלחה!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              תודה על מילוי הטופס. הנתונים נשמרו במערכת המעון.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              אפשר לסגור את הדף. המעון יעדכן אותך במידת הצורך.
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Submission Confirmation Dialog */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>אישור שליחת טופס</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך לשלוח את הטופס?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            לאחר השליחה לא ניתן יהיה לערוך את התשובות.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSubmitDialog(false)}>ביטול</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'שולח...' : 'שלח'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
    </LocalizationProvider>
  );
};

export default PublicParentFormPage;



// // src/pages/public/ParentFormPage.jsx - עמוד ציבורי להורים
// import React, { useState, useEffect } from 'react';
// import { useParams } from 'react-router-dom';
// import {
//   Container, Box, Paper, Typography, TextField, Button, 
//   CircularProgress, Alert, Stepper, Step, StepLabel,
//   Card, CardContent, Dialog, DialogTitle, DialogContent,
//   DialogActions, CssBaseline, ThemeProvider, createTheme
// } from '@mui/material';
// import {
//   Security as SecurityIcon,
//   Assignment as FormIcon,
//   CheckCircle as SuccessIcon
// } from '@mui/icons-material';
// import axios from 'axios';

// // 🔥 Theme פשוט למען העמוד הציבורי
// const theme = createTheme({
//   direction: 'rtl',
//   typography: {
//     fontFamily: 'Arial, sans-serif',
//   },
//   palette: {
//     primary: {
//       main: '#2196F3',
//     },
//     success: {
//       main: '#4CAF50',
//     },
//   },
// });

// // 🔥 קומפוננט QuestionRenderer פשוט (ללא תלות במערכת)
// const SimpleQuestionRenderer = ({ question, value, otherValue, onChange, readOnly = false }) => {
//   const handleValueChange = (newValue, newOtherValue = '') => {
//     onChange(newValue, newOtherValue);
//   };

//   const renderInput = () => {
//     switch (question.questionType?.toLowerCase()) {
//       case 'yesno':
//         return (
//           <Box>
//             <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
//               {question.questionText}
//               {question.isMandatory && <span style={{ color: 'red' }}> *</span>}
//             </Typography>
//             <Box sx={{ display: 'flex', gap: 2 }}>
//               <Button
//                 variant={value === 'כן' ? 'contained' : 'outlined'}
//                 onClick={() => handleValueChange('כן')}
//                 disabled={readOnly}
//               >
//                 כן
//               </Button>
//               <Button
//                 variant={value === 'לא' ? 'contained' : 'outlined'}
//                 onClick={() => handleValueChange('לא')}
//                 disabled={readOnly}
//               >
//                 לא
//               </Button>
//             </Box>
//           </Box>
//         );

//       case 'multiple':
//         const options = question.possibleValues ? question.possibleValues.split(',') : [];
//         return (
//           <Box>
//             <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
//               {question.questionText}
//               {question.isMandatory && <span style={{ color: 'red' }}> *</span>}
//             </Typography>
//             <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//               {options.map((option, index) => (
//                 <Button
//                   key={index}
//                   variant={value === option.trim() ? 'contained' : 'outlined'}
//                   onClick={() => handleValueChange(option.trim())}
//                   disabled={readOnly}
//                   sx={{ justifyContent: 'flex-start' }}
//                 >
//                   {option.trim()}
//                 </Button>
//               ))}
//               {question.hasOther && (
//                 <Box sx={{ mt: 1 }}>
//                   <Button
//                     variant={value === 'אחר' ? 'contained' : 'outlined'}
//                     onClick={() => handleValueChange('אחר')}
//                     disabled={readOnly}
//                   >
//                     אחר
//                   </Button>
//                   {value === 'אחר' && (
//                     <TextField
//                       fullWidth
//                       placeholder="פרט..."
//                       value={otherValue}
//                       onChange={(e) => handleValueChange('אחר', e.target.value)}
//                       disabled={readOnly}
//                       sx={{ mt: 1 }}
//                     />
//                   )}
//                 </Box>
//               )}
//             </Box>
//           </Box>
//         );

//       default:
//         return (
//           <Box>
//             <TextField
//               fullWidth
//               label={question.questionText + (question.isMandatory ? ' *' : '')}
//               multiline={question.questionType === 'textArea'}
//               rows={question.questionType === 'textArea' ? 4 : 1}
//               value={value}
//               onChange={(e) => handleValueChange(e.target.value)}
//               disabled={readOnly}
//             />
//           </Box>
//         );
//     }
//   };

//   return (
//     <Paper sx={{ p: 3, mb: 2 }}>
//       {renderInput()}
//     </Paper>
//   );
// };

// const PublicParentFormPage = () => {
//   const { token } = useParams();
  
//   // States
//   const [currentStep, setCurrentStep] = useState(0);
//   const [kidIdNumber, setKidIdNumber] = useState('');
//   const [formData, setFormData] = useState(null);
//   const [answers, setAnswers] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [submitDialog, setSubmitDialog] = useState(false);

//   const steps = ['אימות זהות', 'מילוי הטופס', 'סיום'];

//   // 🔥 axios instance ללא authentication
//   const publicAxios = axios.create({
//     baseURL: 'https://localhost:7225/api', // או הבסיס URL שלך
//     // ללא headers של authorization!
//   });

//   // אימות גישה
//   const handleValidation = async () => {
//     if (!kidIdNumber.trim()) {
//       setError('נא להזין תעודת זהות');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     try {
//       const validateResponse = await publicAxios.post('/ParentForm/validate', {
//         token,
//         kidIdNumber: kidIdNumber.trim()
//       });

//       if (validateResponse.data.success) {
//         const formResponse = await publicAxios.get(`/ParentForm/form/${token}`);
        
//         if (formResponse.data) {
//           setFormData(formResponse.data);
          
//           // טעינת תשובות קיימות
//           const existingAnswers = {};
//           formResponse.data.existingAnswers?.forEach(answer => {
//             existingAnswers[answer.questionNo] = {
//               answer: answer.answer || '',
//               other: answer.other || ''
//             };
//           });
//           setAnswers(existingAnswers);
          
//           setCurrentStep(1);
//         } else {
//           setError('שגיאה בטעינת נתוני הטופס');
//         }
//       } else {
//         setError('תעודת זהות שגויה או קישור לא תקין');
//       }
//     } catch (error) {
//       console.error('שגיאה באימות:', error);
//       setError('שגיאה באימות. אנא נסה שוב.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // עדכון תשובה
//   const handleAnswerChange = (questionNo, answer, other = '') => {
//     setAnswers(prev => ({
//       ...prev,
//       [questionNo]: { answer, other }
//     }));
//   };

//   // שמירת הטופס
//   const handleSubmit = async () => {
//     setLoading(true);
    
//     try {
//       const answersToSubmit = Object.entries(answers)
//         .filter(([_, answerData]) => answerData.answer && answerData.answer.trim() !== '')
//         .map(([questionNo, answerData]) => ({
//           questionNo: parseInt(questionNo),
//           answer: answerData.answer,
//           other: answerData.other || ''
//         }));

//       const response = await publicAxios.post('/ParentForm/submit', {
//         token,
//         answers: answersToSubmit
//       });

//       if (response.data.success) {
//         setCurrentStep(2);
//         setSubmitDialog(false);
//       } else {
//         setError('שגיאה בשמירת הטופס');
//       }
//     } catch (error) {
//       console.error('שגיאה בשמירה:', error);
//       setError('שגיאה בשמירת הטופס');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // חישוב התקדמות
//   const calculateProgress = () => {
//     if (!formData?.questions?.length) return 0;
    
//     const mandatoryQuestions = formData.questions.filter(q => q.isMandatory);
//     const answeredMandatory = mandatoryQuestions.filter(q => {
//       const answer = answers[q.questionNo];
//       return answer && answer.answer && answer.answer.trim() !== '';
//     });
    
//     return mandatoryQuestions.length > 0 
//       ? Math.round((answeredMandatory.length / mandatoryQuestions.length) * 100) 
//       : 0;
//   };

//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Container maxWidth="md" sx={{ py: 4 }}>
//         {/* כותרת */}
//         <Box sx={{ textAlign: 'center', mb: 4 }}>
//           <Typography variant="h3" component="h1" gutterBottom color="primary">
//             גן הילד
//           </Typography>
//           <Typography variant="h5" color="text.secondary">
//             מילוי טופס הורים
//           </Typography>
//         </Box>

//         {/* Stepper */}
//         <Stepper activeStep={currentStep} sx={{ mb: 4 }}>
//           {steps.map((label, index) => (
//             <Step key={label}>
//               <StepLabel>{label}</StepLabel>
//             </Step>
//           ))}
//         </Stepper>

//         {/* שגיאות */}
//         {error && (
//           <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
//             {error}
//           </Alert>
//         )}

//         {/* תוכן לפי שלב */}
//         <Paper sx={{ p: 4, borderRadius: 3 }}>
//           {currentStep === 0 && (
//             <Box sx={{ textAlign: 'center' }}>
//               <SecurityIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
//               <Typography variant="h5" gutterBottom>
//                 אימות זהות
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                 לצורכי אבטחה, נא להזין את מספר הזהות של הילד/ה
//               </Typography>
              
//               <Box sx={{ maxWidth: 300, mx: 'auto' }}>
//                 <TextField
//                   fullWidth
//                   label="מספר זהות של הילד/ה"
//                   value={kidIdNumber}
//                   onChange={(e) => setKidIdNumber(e.target.value)}
//                   onKeyPress={(e) => e.key === 'Enter' && handleValidation()}
//                   disabled={loading}
//                   sx={{ mb: 3 }}
//                   inputProps={{ maxLength: 9 }}
//                 />
                
//                 <Button
//                   fullWidth
//                   variant="contained"
//                   onClick={handleValidation}
//                   disabled={loading || !kidIdNumber.trim()}
//                   size="large"
//                   startIcon={loading ? <CircularProgress size={20} /> : null}
//                 >
//                   {loading ? 'מאמת...' : 'המשך'}
//                 </Button>
//               </Box>
//             </Box>
//           )}

//           {currentStep === 1 && formData && (
//             <Box>
//               <Box sx={{ textAlign: 'center', mb: 4 }}>
//                 <Typography variant="h5" gutterBottom>
//                   {formData.form.formName}
//                 </Typography>
//                 <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
//                   עבור: {formData.kid.firstName} {formData.kid.lastName}
//                 </Typography>
//                 <Typography variant="body2" color="text.secondary">
//                   {formData.form.formDescription}
//                 </Typography>
                
//                 {/* התקדמות */}
//                 <Box sx={{ mt: 2, mx: 'auto', maxWidth: 400 }}>
//                   <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
//                     התקדמות: {calculateProgress()}%
//                   </Typography>
//                   <Box
//                     sx={{
//                       width: '100%',
//                       height: 8,
//                       backgroundColor: 'grey.200',
//                       borderRadius: 4,
//                       overflow: 'hidden'
//                     }}
//                   >
//                     <Box
//                       sx={{
//                         width: `${calculateProgress()}%`,
//                         height: '100%',
//                         backgroundColor: 'primary.main',
//                         transition: 'width 0.3s ease'
//                       }}
//                     />
//                   </Box>
//                 </Box>
//               </Box>

//               {/* שאלות הטופס */}
//               <Box sx={{ mb: 4 }}>
//                 {formData.questions.map((question) => {
//                   const answerData = answers[question.questionNo] || { answer: '', other: '' };
                  
//                   return (
//                     <SimpleQuestionRenderer
//                       key={question.questionNo}
//                       question={question}
//                       value={answerData.answer}
//                       otherValue={answerData.other}
//                       onChange={(value, otherValue) => 
//                         handleAnswerChange(question.questionNo, value, otherValue)
//                       }
//                       readOnly={false}
//                     />
//                   );
//                 })}
//               </Box>

//               {/* כפתור שמירה */}
//               <Box sx={{ textAlign: 'center' }}>
//                 <Button
//                   variant="contained"
//                   size="large"
//                   onClick={() => setSubmitDialog(true)}
//                   disabled={loading || calculateProgress() < 100}
//                   sx={{ minWidth: 200 }}
//                 >
//                   שלח טופס
//                 </Button>
                
//                 {calculateProgress() < 100 && (
//                   <Typography variant="caption" display="block" sx={{ mt: 1, color: 'warning.main' }}>
//                     יש למלא את כל השאלות החובה לפני השליחה
//                   </Typography>
//                 )}
//               </Box>
//             </Box>
//           )}

//           {currentStep === 2 && (
//             <Box sx={{ textAlign: 'center' }}>
//               <SuccessIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
//               <Typography variant="h4" gutterBottom color="success.main">
//                 הטופס נשלח בהצלחה!
//               </Typography>
//               <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
//                 תודה על מילוי הטופס. הנתונים נשמרו במערכת המעון.
//               </Typography>
//               <Typography variant="body2" color="text.secondary">
//                 אפשר לסגור את הדף. המעון יעדכן אותך במידת הצורך.
//               </Typography>
//             </Box>
//           )}
//         </Paper>

//         {/* דיאלוג אישור שליחה */}
//         <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
//           <DialogTitle>אישור שליחת טופס</DialogTitle>
//           <DialogContent>
//             <Typography>
//               האם אתה בטוח שברצונך לשלוח את הטופס?
//             </Typography>
//             <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//               לאחר השליחה לא ניתן יהיה לערוך את התשובות.
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setSubmitDialog(false)}>ביטול</Button>
//             <Button 
//               onClick={handleSubmit} 
//               variant="contained"
//               disabled={loading}
//               startIcon={loading ? <CircularProgress size={20} /> : null}
//             >
//               {loading ? 'שולח...' : 'שלח'}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Container>
//     </ThemeProvider>
//   );
// };

// export default PublicParentFormPage;
