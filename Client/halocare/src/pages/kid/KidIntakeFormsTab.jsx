// src/components/kids/tabs/KidIntakeFormsTab.jsx - טאב מידע מטפסי קליטה משופר
import React, { useEffect, useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Chip,
  Avatar,
  Stack,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  styled,
  TextField,
  InputAdornment,
  Divider,
  Badge,
  IconButton,
  Button
} from '@mui/material';
import ExportIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  LocalHospital as MedicalIcon,
  Restaurant as NutritionIcon,
  Psychology as DevelopmentIcon,
  Home as HomeIcon,
  School as EducationIcon,
  Info as InfoIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchForms } from '../../Redux/features/formsSlice';
import { fetchFormAnswers } from '../../Redux/features/answersSlice';
import { fetchQuestionsByFormId } from '../../Redux/features/questionsSlice';
import { Navigate } from 'react-router-dom';
import DigitalSignature from '../addKid/DigitalSignature';
// Styled Components
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '12px !important',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
    transform: 'translateY(-2px)',
  },
  '&:before': {
    display: 'none',
  },
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(2, 3),
    borderRadius: '12px',
    minHeight: '64px',
    '&.Mui-expanded': {
      borderRadius: '12px 12px 0 0',
    }
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(3),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor: 'rgba(255,255,255,0.8)',
  }
}));

const CategoryHeader = ({ icon, title, description, color, dataCount, formName }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
    <Avatar sx={{ 
      bgcolor: `${color}.light`,
      color: `${color}.main`,
      width: 48,
      height: 48
    }}>
      {icon}
    </Avatar>
    
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="h6" fontWeight="bold" color={`${color}.main`}>
          {title}
        </Typography>
        <Badge badgeContent={dataCount} color="primary" />
        {formName && (
          <Chip 
            label={formName} 
            size="small" 
            variant="outlined" 
            color={color}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Box>
);

const QuestionCard = ({ question, answer }) => {
  // פונקציה לעיבוד תשובה (טיפול ב-JSON אם קיים)
  const formatAnswer = (answer) => {
    if (!answer) return 'לא נענה';
    
    // בדיקה אם זה JSON
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => (
          <Box key={index} sx={{ mb: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
            {Object.entries(item).map(([key, value]) => (
              <Typography key={key} variant="body2">
                <strong>{key}:</strong> {value}
              </Typography>
            ))}
          </Box>
        ));
      }
    } catch (e) {
      // לא JSON, נחזיר כמו שזה
    }

    if(answer && answer.startsWith('data:image/')) {
      return <DigitalSignature
                    value={answer}
                    readOnly={true}
                    label=""
                  />
    }
    return answer;
  };

  return (
    <Card sx={{ 
      mb: 2, 
      borderRadius: 2, 
      border: '1px solid', 
      borderColor: 'divider',
      '&:hover': { 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        borderColor: 'primary.light'
      }
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
          <QuestionIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: '1.2rem' }} />
          <Typography variant="subtitle2" color="primary.main" fontWeight={600} sx={{ flex: 1 }}>
            {question.questionText}
          </Typography>
          {question.isMandatory && (
            <Chip label="חובה" size="small" color="error" variant="outlined" />
          )}
        </Box>
        
        <Box sx={{ mr: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            תשובה:
          </Typography>
          <Box sx={{ 
            p: 1.5, 
            bgcolor: 'grey.50', 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.200'
          }}>
           
            {formatAnswer(answer?.answer)}
            {answer?.other && (
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                אחר: {answer.other}
              </Typography>
            )}
          </Box>
          
          {answer?.ansDate && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              נענה ב: {new Date(answer.ansDate).toLocaleDateString('he-IL')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

const KidIntakeFormsTab = ({ selectedKid }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { kidId } = useParams();
  
  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Redux selectors
  const { forms } = useSelector(state => state.forms);
  const { answersByKidAndForm } = useSelector(state => state.answers);
  const { questionsByForm } = useSelector(state => state.questions);

  // טעינת נתונים
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // טעינת טפסים אם לא קיימים
        if (!forms.length) {
          await dispatch(fetchForms()).unwrap();
        }
        
        // טעינת תשובות ושאלות לכל הטפסים
        if (kidId && forms.length > 0) {
          const formPromises = forms.map(async (form) => {
            // טעינת תשובות
            await dispatch(fetchFormAnswers({ kidId, formId: form.formId }));
            
            // טעינת שאלות אם לא טענו עדיין
            if (!questionsByForm[form.formId]) {
              await dispatch(fetchQuestionsByFormId(form.formId));
            }
          });
          
          await Promise.all(formPromises);
        }
      } catch (error) {
        console.error('Error loading intake forms data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [dispatch, kidId, forms.length, questionsByForm]);

  // פונקציה לייצוא המידע
  const exportToFile = (format = 'txt') => {
    const organizedData = organizeDataByFormsAndCategories();
    let content = '';
    
    if (format === 'txt') {
      content = `תיק ילד - ${selectedKid.firstName} ${selectedKid.lastName}\n`;
      content += `תאריך יצוא: ${new Date().toLocaleDateString('he-IL')}\n`;
      content += '='.repeat(50) + '\n\n';
      
      Object.values(organizedData).forEach(formData => {
        content += `${formData.formName}\n`;
        content += '-'.repeat(30) + '\n';
        
        Object.values(formData.categories).forEach(categoryData => {
          content += `\n📋 ${categoryData.categoryName}:\n`;
          
          categoryData.questions.forEach(({ question, answer }) => {
            content += `\nשאלה: ${question.questionText}\n`;
            content += `תשובה: ${answer.answer || 'לא נענה'}\n`;
            if (answer.other) {
              content += `הערה נוספת: ${answer.other}\n`;
            }
            if (answer.ansDate) {
              content += `תאריך מענה: ${new Date(answer.ansDate).toLocaleDateString('he-IL')}\n`;
            }
            content += '\n';
          });
        });
        content += '\n' + '='.repeat(50) + '\n\n';
      });
      
      // יצירת קובץ טקסט להורדה
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `טפסי_קליטה_${selectedKid.firstName}_${selectedKid.lastName}_${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  // פונקציה להדפסה
  const printData = () => {
    const organizedData = organizeDataByFormsAndCategories();
    
    let htmlContent = `
      <html dir="rtl">
        <head>
          <title>טפסי קליטה - ${selectedKid.firstName} ${selectedKid.lastName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              direction: rtl; 
              line-height: 1.6;
            }
            h1 { 
              color: #1976d2; 
              border-bottom: 3px solid #1976d2; 
              padding-bottom: 10px;
            }
            h2 { 
              color: #666; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
              margin-top: 30px;
            }
            h3 {
              color: #1976d2;
              background: #f5f5f5;
              padding: 8px 12px;
              border-right: 4px solid #1976d2;
              margin: 20px 0 10px 0;
            }
            .question-block { 
              margin: 15px 0; 
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              background: #fafafa;
            }
            .question { 
              font-weight: bold; 
              color: #333;
              margin-bottom: 5px;
            }
            .answer { 
              margin-right: 20px;
              color: #555;
            }
            .answer-date {
              font-size: 0.8em;
              color: #888;
              margin-top: 5px;
            }
            .page-break { 
              page-break-before: always; 
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>תיק ילד - ${selectedKid.firstName} ${selectedKid.lastName}</h1>
          <p><strong>תאריך הדפסה:</strong> ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}</p>
          <p><strong>גיל:</strong> ${selectedKid.birthDate ? 
            new Date().getFullYear() - new Date(selectedKid.birthDate).getFullYear() + ' שנים' : 
            'לא מצוין'}</p>
          <p><strong>כיתה:</strong> ${selectedKid.className || 'לא משויך'}</p>
          <hr>
    `;
    
    Object.values(organizedData).forEach((formData, formIndex) => {
      if (formIndex > 0) htmlContent += '<div class="page-break"></div>';
      
      htmlContent += `<h2>${formData.formName}</h2>`;
      
      Object.values(formData.categories).forEach(categoryData => {
        htmlContent += `<h3>📋 ${categoryData.categoryName} (${categoryData.questions.length} שאלות)</h3>`;
        
        categoryData.questions.forEach(({ question, answer }) => {
          htmlContent += `
            <div class="question-block">
              <div class="question">שאלה: ${question.questionText}</div>
              <div class="answer">תשובה: ${answer.answer || 'לא נענה'}</div>
              ${answer.other ? `<div class="answer">הערה נוספת: ${answer.other}</div>` : ''}
              ${answer.ansDate ? 
                `<div class="answer-date">תאריך מענה: ${new Date(answer.ansDate).toLocaleDateString('he-IL')}</div>` : 
                ''}
            </div>
          `;
        });
      });
    });
    
    htmlContent += '</body></html>';
    
    // פתיחת חלון הדפסה
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // פונקציה ליצירת PDF (באמצעות ממשק הדפסה)
  const exportToPdf = () => {
    // משתמש באותה פונקציה כמו הדפסה אבל עם הוראה ל-PDF
    const organizedData = organizeDataByFormsAndCategories();
    
    let htmlContent = `
      <html dir="rtl">
        <head>
          <title>טפסי קליטה - ${selectedKid.firstName} ${selectedKid.lastName}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              direction: rtl; 
              line-height: 1.6;
            }
            h1 { 
              color: #1976d2; 
              border-bottom: 3px solid #1976d2; 
              padding-bottom: 10px;
            }
            h2 { 
              color: #666; 
              border-bottom: 1px solid #ddd; 
              padding-bottom: 5px; 
              margin-top: 30px;
            }
            h3 {
              color: #1976d2;
              background: #f5f5f5;
              padding: 8px 12px;
              border-right: 4px solid #1976d2;
              margin: 20px 0 10px 0;
            }
            .question-block { 
              margin: 15px 0; 
              padding: 10px;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              background: #fafafa;
            }
            .question { 
              font-weight: bold; 
              color: #333;
              margin-bottom: 5px;
            }
            .answer { 
              margin-right: 20px;
              color: #555;
            }
            .answer-date {
              font-size: 0.8em;
              color: #888;
              margin-top: 5px;
            }
            .pdf-instructions {
              background: #e3f2fd;
              padding: 15px;
              border-radius: 5px;
              margin-bottom: 20px;
              border: 1px solid #1976d2;
            }
          </style>
        </head>
        <body>
          <div class="pdf-instructions">
            <strong>💡 להורדת PDF:</strong> 
            לחץ על Ctrl+P (או Cmd+P במק), בחר "Save as PDF" ולחץ על שמירה
          </div>
          
          <h1>תיק ילד - ${selectedKid.firstName} ${selectedKid.lastName}</h1>
          <p><strong>תאריך יצוא:</strong> ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}</p>
          <p><strong>גיל:</strong> ${selectedKid.birthDate ? 
            new Date().getFullYear() - new Date(selectedKid.birthDate).getFullYear() + ' שנים' : 
            'לא מצוין'}</p>
          <p><strong>כיתה:</strong> ${selectedKid.className || 'לא משויך'}</p>
          <hr>
    `;
    
    Object.values(organizedData).forEach(formData => {
      htmlContent += `<h2>${formData.formName}</h2>`;
      
      Object.values(formData.categories).forEach(categoryData => {
        htmlContent += `<h3>📋 ${categoryData.categoryName} (${categoryData.questions.length} שאלות)</h3>`;
        
        categoryData.questions.forEach(({ question, answer }) => {
          htmlContent += `
            <div class="question-block">
              <div class="question">שאלה: ${question.questionText}</div>
              <div class="answer">תשובה: ${answer.answer || 'לא נענה'}</div>
              ${answer.other ? `<div class="answer">הערה נוספת: ${answer.other}</div>` : ''}
              ${answer.ansDate ? 
                `<div class="answer-date">תאריך מענה: ${new Date(answer.ansDate).toLocaleDateString('he-IL')}</div>` : 
                ''}
            </div>
          `;
        });
      });
    });
    
    htmlContent += '</body></html>';
    
    // פתיחת חלון חדש עם הוראות PDF
    const pdfWindow = window.open('', '_blank');
    pdfWindow.document.write(htmlContent);
    pdfWindow.document.close();
    
    // הצגת הוראות למשתמש
    setTimeout(() => {
      alert('💡 להורדת PDF: לחץ על Ctrl+P (או Cmd+P במק), בחר "Save as PDF" ולחץ על שמירה');
    }, 500);
  };

  // פונקציה לטיפול בפתיחת אקורדיון
  const handleAccordionChange = (categoryKey) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? categoryKey : null);
  };
  const getAllAnswers = () => {
    if (!kidId || !answersByKidAndForm) return [];
    
    const allAnswers = [];
    Object.keys(answersByKidAndForm).forEach(key => {
      if (key.startsWith(`${kidId}_`)) {
        allAnswers.push(...answersByKidAndForm[key]);
      }
    });
    
    return allAnswers;
  };

  // קבלת שאלות עם תשובות לפי טופס
  const getQuestionsWithAnswers = (formId) => {
    const formKey = `${kidId}_${formId}`;
    const answers = answersByKidAndForm[formKey] || [];
    
    // יצירת מפה של תשובות לפי מספר שאלה
    const answersMap = {};
    answers.forEach(answer => {
      answersMap[answer.questionNo] = answer;
    });
    
    return { answersMap };
  };

  // קיבוץ נתונים לפי טפסים וקטגוריות
  const organizeDataByFormsAndCategories = () => {
    const formGroups = {};
    
    forms.forEach(form => {
      // דילוג על טופס פרטים אישיים (1002)
      if (form.formId === 1002) return;
      
      const { answersMap } = getQuestionsWithAnswers(form.formId);
      const formQuestions = questionsByForm[form.formId] || [];
      
      // אם יש תשובות לטופס זה
      if (Object.keys(answersMap).length > 0) {
        // קיבוץ לפי קטגוריות בתוך הטופס
        const categories = {};
        
        formQuestions.forEach(question => {
          const answer = answersMap[question.questionNo];
          if (answer) {
            const category = question.category || 'כללי';
            
            if (!categories[category]) {
              categories[category] = {
                categoryName: category,
                questions: []
              };
            }
            
            categories[category].questions.push({
              question,
              answer
            });
          }
        });
        
        // רק אם יש קטגוריות עם תשובות
        if (Object.keys(categories).length > 0) {
          formGroups[form.formId] = {
            formName: form.formName,
            formDescription: form.formDescription,
            categories,
            totalAnswers: Object.keys(answersMap).length
          };
        }
      }
    });
    
    return formGroups;
  };

  // קבלת אייקון לפי שם טופס
  const getFormIcon = (formName) => {
    if (formName.includes('רקע התפתחותי')) return <DevelopmentIcon />;
    if (formName.includes('בריאות')) return <MedicalIcon />;
    if (formName.includes('תזונה')) return <NutritionIcon />;
    if (formName.includes('אישור')) return <SecurityIcon />;
    if (formName.includes('ביקור בית')) return <HomeIcon />;
    return <AssignmentIcon />;
  };

  // קבלת צבע לפי שם טופס
  const getFormColor = (formName) => {
    if (formName.includes('רקע התפתחותי')) return 'info';
    if (formName.includes('בריאות')) return 'error';
    if (formName.includes('תזונה')) return 'success';
    if (formName.includes('אישור')) return 'warning';
    if (formName.includes('ביקור בית')) return 'secondary';
    return 'primary';
  };

  // סינון לפי חיפוש
  const filterBySearch = (data) => {
    if (!searchTerm) return data;
    
    const filtered = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.keys(data).forEach(formId => {
      const form = data[formId];
      const filteredCategories = {};
      
      Object.keys(form.categories).forEach(categoryKey => {
        const category = form.categories[categoryKey];
        const matchingQuestions = category.questions.filter(({ question, answer }) => {
          return (
            // חיפוש בטקסט השאלה
            question.questionText?.toLowerCase().includes(searchLower) ||
            // חיפוש בתוכן התשובה
            answer.answer?.toLowerCase().includes(searchLower) ||
            answer.other?.toLowerCase().includes(searchLower) ||
            // חיפוש בקטגוריה
            category.categoryName?.toLowerCase().includes(searchLower)
          );
        });
        
        if (matchingQuestions.length > 0) {
          filteredCategories[categoryKey] = {
            ...category,
            questions: matchingQuestions
          };
        }
      });
      
      if (Object.keys(filteredCategories).length > 0) {
        filtered[formId] = {
          ...form,
          categories: filteredCategories,
          totalAnswers: Object.values(filteredCategories).reduce(
            (sum, cat) => sum + cat.questions.length, 0
          )
        };
      }
    });
    
    return filtered;
  };

  const organizedData = filterBySearch(organizeDataByFormsAndCategories());
  const totalDataItems = Object.values(organizedData).reduce(
    (sum, form) => sum + form.totalAnswers, 0
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={48} />
          <Typography variant="h6" color="text.secondary">
            טוען מידע מטפסי קליטה...
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (totalDataItems === 0 && !searchTerm) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            אין מידע זמין מטפסי קליטה
          </Typography>
          <Typography>
            לא נמצא מידע מטפסי קליטה עבור {selectedKid.firstName}. 
            ייתכן שטפסי הקליטה עדיין לא מולאו או שהמידע לא נשמר במערכת.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box dir="rtl" sx={{ p: 3 }}>
      {/* כותרת וחיפוש */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
        <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
          📋 מידע מטפסי קליטה
        </Typography>
        <Button
          variant="outlined"
          size="small"
          position="left"
          onClick={() => navigate(`/kids/onboarding/${selectedKid.id}`)}
          >
            ניהול טפסי קליטה
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" mb={3}>
          כל המידע שנאסף בתהליך הקליטה, מאורגן לפי טפסים וקטגוריות
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <TextField
            size="small"
            placeholder="חיפוש במידע..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ mr: -1 }}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <Chip 
            label={`${totalDataItems} פריטי מידע`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${Object.keys(organizedData).length} טפסים`} 
            color="info" 
            variant="outlined" 
          />
          
          <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={printData}
            >
              הדפס
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<PdfIcon />}
              onClick={exportToPdf}
              color="error"
            >
              PDF
            </Button>
            
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExportIcon />}
              onClick={() => exportToFile('txt')}
            >
              טקסט
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* טפסים */}
      <Stack spacing={2}>
        {Object.keys(organizedData).length === 0 && searchTerm ? (
          // הודעה כשאין תוצאות חיפוש
          <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
            <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom color="text.secondary">
              לא נמצאו תוצאות עבור "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              נסה לחפש במילים אחרות או נקה את תיבת החיפוש כדי לראות את כל המידע
            </Typography>
            <Button
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => setSearchTerm('')}
            >
              נקה חיפוש
            </Button>
          </Paper>
        ) : (
          // תוצאות רגילות
          Object.entries(organizedData).map(([formId, formData]) => {
            const form = forms.find(f => f.formId == formId);
            if (!form) return null;

            return (
              <StyledAccordion
                key={formId}
                expanded={expandedCategory === formId}
                onChange={handleAccordionChange(formId)}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls={`${formId}-content`}
                  id={`${formId}-header`}
                >
                  <CategoryHeader
                    icon={getFormIcon(formData.formName)}
                    title={formData.formName}
                    description={formData.formDescription}
                    color={getFormColor(formData.formName)}
                    dataCount={formData.totalAnswers}
                  />
                </AccordionSummary>
                
                <AccordionDetails>
                  {/* קטגוריות בתוך הטופס */}
                  <Stack spacing={3}>
                    {Object.entries(formData.categories).map(([categoryKey, categoryData]) => (
                      <Box key={categoryKey}>
                        <Typography 
                          variant="h6" 
                          color="primary.main" 
                          sx={{ 
                            mb: 2, 
                            pb: 1, 
                            borderBottom: '2px solid',
                            borderColor: 'primary.light'
                          }}
                        >
                          📋 {categoryData.categoryName} ({categoryData.questions.length})
                        </Typography>
                        
                        <Stack spacing={2}>
                          {categoryData.questions.map(({ question, answer }, index) => (
                            <QuestionCard
                              key={`${question.formId}-${question.questionNo}-${index}`}
                              question={question}
                              answer={answer}
                            />
                          ))}
                        </Stack>
                        
                        {/* מפריד בין קטגוריות */}
                        {Object.keys(formData.categories).length > 1 && 
                         categoryKey !== Object.keys(formData.categories).slice(-1)[0] && (
                          <Divider sx={{ mt: 3, mb: 1 }} />
                        )}
                      </Box>
                    ))}
                  </Stack>
                </AccordionDetails>
              </StyledAccordion>
            );
          })
        )}
      </Stack>
    </Box>
  );
};

export default KidIntakeFormsTab;