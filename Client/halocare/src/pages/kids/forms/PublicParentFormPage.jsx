import  { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container, Box, Paper, Typography, TextField, Button, 
  CircularProgress, Alert, Stepper, Step, StepLabel,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Security as SecurityIcon,
  Assignment as FormIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';
import axios from 'axios';
import QuestionRenderer from './QuestionRenderer';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import MultipleEntriesComponent from './MultipleEntriesComponent';
import LanguageSelector from './LanguageSelector';

const PublicParentFormPage = () => {
  const { token } = useParams();
  
  // States
  const [currentStep, setCurrentStep] = useState(0);
  const [kidIdNumber, setKidIdNumber] = useState('');
  const [formData, setFormData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitDialog, setSubmitDialog] = useState(false);
  const [multipleEntriesData, setMultipleEntriesData] = useState({});
  const [optionsMapping, setOptionsMapping] = useState({});

  // Translation states
  const [currentLanguage, setCurrentLanguage] = useState('he');
  const [translatedQuestions, setTranslatedQuestions] = useState(null);
  const [translating, setTranslating] = useState(false);

  const steps = ['אימות זהות', 'מילוי הטופס', 'סיום'];

  // Function to handle complex data
  const handleMultipleEntriesChange = (questionNo, entriesData) => {
    setMultipleEntriesData(prev => ({
      ...prev,
      [questionNo]: entriesData
    }));
  };

  // Form translation function
 const handleLanguageChange = async (language) => {
  
  if (language === 'he') {
    setTranslatedQuestions(null);
    setCurrentLanguage('he');
    setOptionsMapping({}); 
    return;
  }

  setTranslating(true);
  try {
    const questionsToTranslate = formData.questions.map(q => ({
      questionNo: q.questionNo,
      questionText: q.questionText,
      possibleValues: q.possibleValues || '',
      questionType: q.questionType
    }));

    const response = await axios.post('/Translation/translate-form', {
      questions: questionsToTranslate,
      targetLanguage: language,
      sourceLanguage: 'he'
    });

    if (response.data.success) {
      const newOptionsMapping = {};
      
      formData.questions.forEach((original, index) => {
        const translated = response.data.translatedQuestions[index];
        
        if (original.possibleValues && translated.possibleValues) {
          const originalOptions = original.possibleValues.split(',').map(o => o.trim());
          const translatedOptions = translated.possibleValues.split(',').map(o => o.trim());
          
          const mapping = {};
          originalOptions.forEach((orig, idx) => {
            if (translatedOptions[idx]) {
              // מתורגם → מקורי
              mapping[translatedOptions[idx]] = orig;
              // מקורי → מתורגם
              mapping[orig] = translatedOptions[idx];
            }
          });
          
          newOptionsMapping[original.questionNo] = mapping;
        }
      });
      
      setOptionsMapping(newOptionsMapping);
      
      const translated = formData.questions.map(original => {
        const translation = response.data.translatedQuestions.find(
          t => t.questionNo === original.questionNo
        );
        
        return {
          ...original,
          questionText: translation?.questionText || original.questionText,
          possibleValues: translation?.possibleValues || original.possibleValues
        };
      });

      setTranslatedQuestions(translated);
      setCurrentLanguage(language);
    }
  } catch (error) {
    console.error('שגיאה בתרגום:', error);
    alert('שגיאה בתרגום הטופס.');
  } finally {
    setTranslating(false);
  }
};


  // Access validation
  const handleValidation = async () => {
    if (!kidIdNumber.trim()) {
      setError('נא להזין תעודת זהות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Validate token and ID number
      const validateResponse = await axios.post('/ParentForm/validate', {
        token,
        kidIdNumber: kidIdNumber.trim()
      });

      if (validateResponse.data.success) {
        const formResponse = await axios.get(`/ParentForm/form/${token}`);
        
        if (formResponse.data) {
          setFormData(formResponse.data);
          
            // Load existing answers
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

  // Update answer
  const handleAnswerChange = (questionNo, answer, other = '') => {
  
  let finalAnswer = answer;
  const question = formData.questions.find(q => q.questionNo === questionNo);
  
  // תרגום מיידי של תשובות קבועות
  const fixedAnswers = {
    // ערבית
    'أوافق/أوافق': 'מאשר/ת',
    'أوافق': 'מאשר/ת',
    'لا أوافق': 'לא מאשר/ת',
    'نعم': 'כן',
    'لا': 'לא',
    // אנגלית
    'Authorize': 'מאשר/ת',
    'I authorize': 'מאשר/ת',
    'Do not authorize': 'לא מאשר/ת',
    'I do not authorize': 'לא מאשר/ת',
    'Yes': 'כן',
    'No': 'לא',
    // רוסית
    'Разрешаю': 'מאשר/ת',
    'Разрешаю/ю': 'מאשר/ת',
    'Не разрешаю': 'לא מאשר/ת',
    'Не разрешаю/ю': 'לא מאשר/ת',
    'Да': 'כן',
    'Нет': 'לא'
  };
  
  // בדיקה אם זו תשובה קבועה
  if (fixedAnswers[answer]) {
    finalAnswer = fixedAnswers[answer];
  }
  // בדיקה אם זו אופציה ממופה
  else if (optionsMapping[questionNo] && optionsMapping[questionNo][answer]) {
    finalAnswer = optionsMapping[questionNo][answer];
  }
  // עבור checkbox - טיפול במספר אופציות
  else if (question?.questionType === 'checkbox' || question?.questionType === 'multiChoice') {
    const selectedValues = answer.split(',').map(v => v.trim());
    const mappedValues = selectedValues.map(val => {
      // בדיקה אם יש מיפוי
      if (optionsMapping[questionNo] && optionsMapping[questionNo][val]) {
        return optionsMapping[questionNo][val];
      }
      // בדיקה אם זו תשובה קבועה
      if (fixedAnswers[val]) {
        return fixedAnswers[val];
      }
      return val;
    });
    finalAnswer = mappedValues.join(', ');
  }
  
  setAnswers(prev => ({
    ...prev,
    [questionNo]: { 
      answer: finalAnswer,
      other: other,
      displayAnswer: answer // שומרים את מה שמוצג למשתמש
    }
  }));
};


const handleSubmit = async () => {
  setLoading(true);
  
  try {

    let finalAnswers = { ...answers }; // יצירת עותק
    
    // אם הטופס מולא בשפה אחרת, נתרגם חזרה לעברית
    if (currentLanguage !== 'he') {
      const answersToTranslate = Object.entries(answers)
        .filter(([_, answerData]) => answerData.answer || answerData.other)
        .map(([questionNo, answerData]) => ({
          questionNo: parseInt(questionNo),
          answer: answerData.answer || '',
          other: answerData.other || ''
        }));
      
      
      if (answersToTranslate.length > 0) {
        try {
          const translateResponse = await axios.post('/Translation/translate-answers', {
            answers: answersToTranslate,
            sourceLanguage: currentLanguage
          });
          
          
          if (translateResponse.data.success && translateResponse.data.translatedAnswers) {
            const translatedAnswersMap = {};
            
            translateResponse.data.translatedAnswers.forEach(item => {
              translatedAnswersMap[item.questionNo] = {
                answer: item.answer || '',
                other: item.other || ''
              };
            });
            
            finalAnswers = translatedAnswersMap;
          } else {
            console.warn('תרגום נכשל, משתמשים בתשובות המקוריות');
          }
        } catch (translateError) {
          console.error('שגיאה בתרגום התשובות:', translateError);
          alert('שגיאה בתרגום התשובות. האם להמשיך עם התשובות בשפה המקורית?');
        }
      }
    }
    
    // המרת התשובות הסופיות לפורמט הנדרש
    const formattedAnswers = Object.entries(finalAnswers).map(([questionNo, answerData]) => {
      const question = formData.questions.find(q => q.questionNo === parseInt(questionNo));
      
      let answerObject = {
        questionNo: parseInt(questionNo),
        answer: answerData.answer || '',
        other: answerData.other || ''
      };
      
      
      // הוספת נתונים מורכבים אם קיימים
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
       const getDisplayValue = (questionNo) => {
  const answer = answers[questionNo];
  if (!answer) return { answer: '', other: '' };
  
  // אם יש ערך תצוגה (בשפה הנוכחית) - מציגים אותו
  if (currentLanguage !== 'he' && answer.displayAnswer) {
    return {
      answer: answer.displayAnswer,
      other: answer.other || ''
    };
  }
  
  // אם אנחנו בשפה אחרת ויש תשובה שמורה בעברית - נתרגם אותה לתצוגה
  if (currentLanguage !== 'he' && answer.answer && optionsMapping[questionNo]) {
    // בדיקה אם זו תשובה מרובה (checkbox)
    if (answer.answer.includes(',')) {
      const values = answer.answer.split(',').map(v => v.trim());
      const translatedValues = values.map(val => 
        optionsMapping[questionNo][val] || val
      );
      return {
        answer: translatedValues.join(', '),
        other: answer.other || ''
      };
    }
    
    // תשובה בודדת
    const translatedAnswer = optionsMapping[questionNo][answer.answer];
    if (translatedAnswer) {
      return {
        answer: translatedAnswer,
        other: answer.other || ''
      };
    }
  }
  
  // תרגום תשובות קבועות לתצוגה
  if (currentLanguage !== 'he' && answer.answer) {
    const displayTranslations = {
      'ar': {
        'כן': 'نعم',
        'לא': 'لا',
        'מאשר/ת': 'أوافق/أوافق',
        'לא מאשר/ת': 'لا أوافق'
      },
      'en': {
        'כן': 'Yes',
        'לא': 'No',
        'מאשר/ת': 'Authorize',
        'לא מאשר/ת': 'Do not authorize'
      },
      'ru': {
        'כן': 'Да',
        'לא': 'Нет',
        'מאשר/ת': 'Разрешаю/ю',
        'לא מאשר/ת': 'Не разрешаю/ю'
      }
    };
    
    if (displayTranslations[currentLanguage] && 
        displayTranslations[currentLanguage][answer.answer]) {
      return {
        answer: displayTranslations[currentLanguage][answer.answer],
        other: answer.other || ''
      };
    }
  }
  
  // ברירת מחדל - מחזירים את התשובה כמו שהיא
  return {
    answer: answer.answer || '',
    other: answer.other || ''
  };
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


  // Function to get the current questions (original or translated)
  const getCurrentQuestions = () => {
    return translatedQuestions || formData?.questions || [];
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
    <Container dir="rtl" maxWidth="md" sx={{ py: 4 }}>
      {/* Title */}
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
            {/* chooser */}
            <LanguageSelector
              onLanguageChange={handleLanguageChange}
              loading={translating}
            />

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

            {/* Form questions - using the new function */}
            <Box sx={{ mb: 4 }}>
              {getCurrentQuestions().map((question) => {
    const { answer, other } = getDisplayValue(question.questionNo);
                
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

                    {/* Complex data */}
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

            {/* Confirmation dialog */}
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setSubmitDialog(true)}
                disabled={loading || calculateProgress() < 100 || translating}
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

      {/* Submit confirmation dialog */}
      <Dialog open={submitDialog} onClose={() => setSubmitDialog(false)}>
        <DialogTitle>אישור שליחת טופס</DialogTitle>
        <DialogContent>
          <Typography>
            האם אתה בטוח שברצונך לשלוח את הטופס?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            לאחר השליחה לא ניתן יהיה לערוך את התשובות.
          </Typography>
          {currentLanguage !== 'he' && (
            <Alert severity="info" sx={{ mt: 2 }}>
              התשובות שלך יתורגמו אוטומטית לעברית לפני השמירה במערכת
            </Alert>
          )}
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