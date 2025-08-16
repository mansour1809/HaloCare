import  { useEffect, useState } from 'react';
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
  Button,
  alpha,
  keyframes
} from '@mui/material';
import ExportIcon from '@mui/icons-material/SaveAlt';
import PrintIcon from '@mui/icons-material/Print';
import PdfIcon from '@mui/icons-material/PictureAsPdf';
import CloseIcon from '@mui/icons-material/Close';
import {
  ExpandMore as ExpandMoreIcon,
  LocalHospital as MedicalIcon,
  Restaurant as NutritionIcon,
  Psychology as DevelopmentIcon,
  Home as HomeIcon,
  Assignment as AssignmentIcon,
  Security as SecurityIcon,
  Search as SearchIcon,
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchForms } from '../../Redux/features/formsSlice';
import { fetchFormAnswers } from '../../Redux/features/answersSlice';
import { fetchQuestionsByFormId } from '../../Redux/features/questionsSlice';
import DigitalSignature from '../addKid/DigitalSignature';
import {jsPDF} from 'jspdf';
import html2canvas from 'html2canvas';
import Swal from 'sweetalert2';

// Animation keyframes
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Enhanced Styled Components
const EnhancedPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  // backdropFilter: 'blur(20px)',
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
    borderRadius: '20px 20px 0 0',
  }
}));

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: '16px !important',
  background: 'rgba(255, 255, 255, 0.95)',
  // backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${slideIn} 0.5s ease-out`,
  // '&:hover': {
  //   transform: 'translateY(-4px) scale(1.01)',
  //   boxShadow: '0 12px 48px rgba(76, 181, 195, 0.15)',
  //   border: '1px solid rgba(76, 181, 195, 0.3)',
  // },
  '&:before': {
    display: 'none',
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
  },
  '& .MuiAccordionSummary-root': {
    padding: theme.spacing(2.5, 3),
    borderRadius: '16px',
    minHeight: '72px',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.03) 0%, rgba(255, 112, 67, 0.03) 100%)',
    '&.Mui-expanded': {
      borderRadius: '16px 16px 0 0',
      background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
    }
  },
  '& .MuiAccordionDetails-root': {
    padding: theme.spacing(3),
    borderTop: '1px solid rgba(76, 181, 195, 0.1)',
    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
  }
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 48,
  height: 48,
  background: props => `linear-gradient(135deg, ${theme.palette[props.color]?.light} 0%, ${theme.palette[props.color]?.main} 100%)`,
  boxShadow: props => `0 4px 15px ${alpha(theme.palette[props.color]?.main, 0.3)}`,
  '& svg': {
    fontSize: '1.5rem',
  }
}));

const StyledBadge = styled(Badge)(() => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(45deg, #ff7043 30%, #ff9575 90%)',
    color: 'white',
    fontWeight: 700,
    boxShadow: '0 2px 8px rgba(255, 112, 67, 0.3)',
  }
}));

const StyledChip = styled(Chip)(() => ({
  borderRadius: 10,
  fontWeight: 600,
  // backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  }
}));

const AnimatedButton = styled(Button)(() => ({
  borderRadius: 12,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
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
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(76, 181, 195, 0.25)',
    '&::before': {
      left: '100%',
    }
  }
}));

const QuestionCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 16,
  background: 'rgba(255, 255, 255, 0.95)',
  // backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    width: '3px',
    height: '100%',
    background: 'linear-gradient(180deg, #4cb5c3, #2a8a95)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    transform: 'translateX(-4px) scale(1.01)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.15)',
    borderColor: 'primary.light',
    '&::before': {
      opacity: 1,
    }
  }
}));

const AnswerBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.05) 0%, rgba(255, 112, 67, 0.05) 100%)',
  borderRadius: 12,
  border: '1px solid rgba(76, 181, 195, 0.1)',
  position: 'relative',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    // background: 'radial-gradient(circle, rgba(76, 181, 195, 0.05) 0%, transparent 70%)',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    background: 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    '&:hover': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
      }
    },
    '&.Mui-focused': {
      background: 'rgba(255, 255, 255, 1)',
      '& fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
      }
    }
  }
}));

const LoadingContainer = styled(Box)(() => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '400px',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
}));

// CategoryHeader Component - Enhanced styling only
const CategoryHeader = ({ icon, title, description, color, dataCount, formName }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
    <StyledAvatar color={color}>
      {icon}
    </StyledAvatar>
    
    <Box sx={{ flex: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography 
          variant="h6" 
          fontWeight="bold" 
          sx={{
            background: `linear-gradient(45deg, ${color}.main 30%, ${color}.light 90%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        <StyledBadge badgeContent={dataCount} color="primary" />
        {formName && (
          <StyledChip 
            label={formName} 
            size="small" 
            variant="outlined" 
            color={color}
          />
        )}
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
        {description}
      </Typography>
    </Box>
  </Box>
);

// QuestionCard Component - Enhanced styling only
const QuestionCardComponent = ({ question, answer }) => {
  // Function to process response (handle JSON if present) 
  const formatAnswer = (answer) => {
    if (!answer) return 'לא נענה';
    
    // Check if response is JSON
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.map((item, index) => (
          <Box key={index} sx={{ 
            mb: 1, 
            p: 1.5, 
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.9) 100%)',
            borderRadius: 2,
            border: '1px solid rgba(76, 181, 195, 0.1)'
          }}>
            {Object.entries(item).map(([key, value]) => (
              <Typography key={key} variant="body2">
                <strong>{key}:</strong> {value}
              </Typography>
            ))}
          </Box>
        ));
      }
    } catch (e) {
      // Not JSON – return as is
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
    <QuestionCard>
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1.5 }}>
          <QuestionIcon sx={{ 
            color: 'primary.main', 
            mt: 0.5, 
            fontSize: '1.3rem',
            animation: `${pulse} 2s infinite`
          }} />
          <Typography 
            variant="subtitle2" 
            sx={{ 
              flex: 1,
              fontWeight: 700,
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {question.questionText}
          </Typography>
          {question.isMandatory && (
            <StyledChip 
              label="חובה" 
              size="small" 
              color="error" 
              variant="outlined"
              sx={{
                background: 'linear-gradient(45deg, #f44336 30%, #ef5350 90%)',
                color: 'white',
                borderColor: 'transparent',
              }}
            />
          )}
        </Box>
        
        <Box sx={{ mr: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontWeight: 600 }}>
            תשובה:
          </Typography>
          <AnswerBox>
            {formatAnswer(answer?.answer)}
            {answer?.other && (
              <Typography variant="body2" sx={{ 
                mt: 1, 
                fontStyle: 'italic',
                color: 'primary.main',
                fontWeight: 500
              }}>
                אחר: {answer.other}
              </Typography>
            )}
          </AnswerBox>
          
          {answer?.ansDate && (
            <Typography 
              variant="caption" 
              sx={{ 
                mt: 1, 
                display: 'block',
                color: 'text.secondary',
                fontWeight: 500
              }}
            >
              נענה ב: {new Date(answer.ansDate).toLocaleDateString('he-IL')}
            </Typography>
          )}
        </Box>
      </CardContent>
    </QuestionCard>
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

  // Loading data 
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load forms if not existing
        if (!forms.length) {
          await dispatch(fetchForms()).unwrap();
        }
        
        // Loading answers and questions for all forms
        if (kidId && forms.length > 0) {
          const formPromises = forms.map(async (form) => {
            // Loading answers
            await dispatch(fetchFormAnswers({ kidId, formId: form.formId }));
            
            // Loading questions if not loaded yet
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


  // Function for printing  (just the content, not the HTML)
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
    
    // Open print dialog
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Function to create PDF  (just the content, not the HTML)
  // const exportToPdf = () => {
  //   const organizedData = organizeDataByFormsAndCategories();
    
  //   let htmlContent = `
  //     <html dir="rtl">
  //       <head>
  //         <title>טפסי קליטה - ${selectedKid.firstName} ${selectedKid.lastName}</title>
  //         <style>
  //           body { 
  //             font-family: Arial, sans-serif; 
  //             margin: 20px; 
  //             direction: rtl; 
  //             line-height: 1.6;
  //           }
  //           h1 { 
  //             color: #1976d2; 
  //             border-bottom: 3px solid #1976d2; 
  //             padding-bottom: 10px;
  //           }
  //           h2 { 
  //             color: #666; 
  //             border-bottom: 1px solid #ddd; 
  //             padding-bottom: 5px; 
  //             margin-top: 30px;
  //           }
  //           h3 {
  //             color: #1976d2;
  //             background: #f5f5f5;
  //             padding: 8px 12px;
  //             border-right: 4px solid #1976d2;
  //             margin: 20px 0 10px 0;
  //           }
  //           .question-block { 
  //             margin: 15px 0; 
  //             padding: 10px;
  //             border: 1px solid #e0e0e0;
  //             border-radius: 5px;
  //             background: #fafafa;
  //           }
  //           .question { 
  //             font-weight: bold; 
  //             color: #333;
  //             margin-bottom: 5px;
  //           }
  //           .answer { 
  //             margin-right: 20px;
  //             color: #555;
  //           }
  //           .answer-date {
  //             font-size: 0.8em;
  //             color: #888;
  //             margin-top: 5px;
  //           }
  //           .pdf-instructions {
  //             background: #e3f2fd;
  //             padding: 15px;
  //             border-radius: 5px;
  //             margin-bottom: 20px;
  //             border: 1px solid #1976d2;
  //           }
  //         </style>
  //       </head>
  //       <body>
  //         <div class="pdf-instructions">
  //           <strong>💡 להורדת PDF:</strong> 
  //           לחץ על Ctrl+P (או Cmd+P במק), בחר "Save as PDF" ולחץ על שמירה
  //         </div>
          
  //         <h1>תיק ילד - ${selectedKid.firstName} ${selectedKid.lastName}</h1>
  //         <p><strong>תאריך יצוא:</strong> ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}</p>
  //         <p><strong>גיל:</strong> ${selectedKid.birthDate ? 
  //           new Date().getFullYear() - new Date(selectedKid.birthDate).getFullYear() + ' שנים' : 
  //           'לא מצוין'}</p>
  //         <p><strong>כיתה:</strong> ${selectedKid.className || 'לא משויך'}</p>
  //         <hr>
  //   `;
    
  //   Object.values(organizedData).forEach(formData => {
  //     htmlContent += `<h2>${formData.formName}</h2>`;
      
  //     Object.values(formData.categories).forEach(categoryData => {
  //       htmlContent += `<h3>📋 ${categoryData.categoryName} (${categoryData.questions.length} שאלות)</h3>`;
        
  //       categoryData.questions.forEach(({ question, answer }) => {
  //         htmlContent += `
  //           <div class="question-block">
  //             <div class="question">שאלה: ${question.questionText}</div>
  //             <div class="answer">תשובה: ${answer.answer || 'לא נענה'}</div>
  //             ${answer.other ? `<div class="answer">הערה נוספת: ${answer.other}</div>` : ''}
  //             ${answer.ansDate ? 
  //               `<div class="answer-date">תאריך מענה: ${new Date(answer.ansDate).toLocaleDateString('he-IL')}</div>` : 
  //               ''}
  //           </div>
  //         `;
  //       });
  //     });
  //   });
    
  //   htmlContent += '</body></html>';
    
  //   // Open new window with PDF instructions
  //   const pdfWindow = window.open('', '_blank');
  //   pdfWindow.document.write(htmlContent);
  //   pdfWindow.document.close();
    
  //   // Display instructions to the user
  //   setTimeout(() => {
  //     alert('💡 להורדת PDF: לחץ על Ctrl+P (או Cmd+P במק), בחר "Save as PDF" ולחץ על שמירה');
  //   }, 500);
  // };

const exportToPdf = async () => {
  // Show loading message
  if (window.Swal) {
    Swal.fire({
      title: 'מכין את הקובץ...',
      html: 'אנא המתן',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });
  }

  const organizedData = organizeDataByFormsAndCategories();
  
  // Create a temporary container with the content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '210mm'; // A4 width
  container.style.padding = '10mm';
  container.style.background = 'white';
  container.style.fontFamily = 'Arial, sans-serif';
  
  container.innerHTML = `
    <div style="
      direction: rtl;
      text-align: right;
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
    ">
      <!-- Header -->
      <div style="
        background: linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%);
        color: white;
        padding: 30px;
        text-align: center;
        border-radius: 15px;
        margin-bottom: 30px;
      ">
        <h1 style="
          margin: 0;
          font-size: 32px;
          font-weight: bold;
        ">טפסי קליטה</h1>
        <h2 style="
          margin: 10px 0 0 0;
          font-size: 24px;
          font-weight: normal;
        ">${selectedKid.firstName} ${selectedKid.lastName}</h2>
      </div>

      <!-- Info Section -->
      <div style="
        background: #f8f9fa;
        border-right: 5px solid #4cb5c3;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 30px;
      ">
        <table style="width: 100%; font-size: 16px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4cb5c3; width: 150px;">
              תאריך יצוא:
            </td>
            <td style="padding: 8px 0;">
              ${new Date().toLocaleDateString('he-IL')}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4cb5c3;">
              גיל:
            </td>
            <td style="padding: 8px 0;">
              ${selectedKid.birthDate ? 
                `${new Date().getFullYear() - new Date(selectedKid.birthDate).getFullYear()} שנים` : 
                'לא מצוין'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; color: #4cb5c3;">
              כיתה:
            </td>
            <td style="padding: 8px 0;">
              ${selectedKid.className || 'לא משויך'}
            </td>
          </tr>
        </table>
      </div>

      <!-- Forms Data -->
      ${Object.values(organizedData).map(formData => `
        <div style="margin: 30px 0; page-break-inside: avoid;">
          <!-- Form Title -->
          <div style="
            background: linear-gradient(90deg, #2196f3 0%, #4cb5c3 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 22px;
            font-weight: bold;
            margin-bottom: 20px;
          ">
            ${formData.formName}
          </div>

          <!-- Categories -->
          ${Object.values(formData.categories).map(categoryData => `
            <div style="margin: 20px 0;">
              <!-- Category Header -->
              <div style="
                background: #e3f2fd;
                border-right: 5px solid #2196f3;
                padding: 12px 20px;
                margin-bottom: 15px;
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
                color: #1976d2;
              ">
                ${categoryData.categoryName}
                <span style="
                  float: left;
                  background: #2196f3;
                  color: white;
                  padding: 4px 12px;
                  border-radius: 15px;
                  font-size: 14px;
                ">
                  ${categoryData.questions.length} שאלות
                </span>
              </div>

              <!-- Questions -->
              ${categoryData.questions.map((item, index) => `
                <div style="
                  background: white;
                  border: 1px solid #e0e0e0;
                  border-radius: 10px;
                  padding: 15px;
                  margin: 12px 0;
                  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                ">
                  <div style="
                    color: #333;
                    font-weight: bold;
                    margin-bottom: 10px;
                    font-size: 15px;
                  ">
                    ${index + 1}. ${item.question.questionText}
                  </div>
                  
                  <div style="
                    background: #f5f5f5;
                    padding: 10px;
                    border-right: 3px solid #4cb5c3;
                    border-radius: 5px;
                    margin: 8px 0;
                  ">
                    <strong style="color: #4cb5c3;">תשובה:</strong> 
                    ${item.answer.answer || 'לא נענה'}
                  </div>
                  
                  ${item.answer.other ? `
                    <div style="
                      background: #fff3e0;
                      padding: 10px;
                      border-right: 3px solid #ff9800;
                      border-radius: 5px;
                      margin: 8px 0;
                    ">
                      <strong style="color: #ff9800;">הערה:</strong> 
                      ${item.answer.other}
                    </div>
                  ` : ''}
                  
                  ${item.answer.ansDate ? `
                    <div style="
                      color: #999;
                      font-size: 12px;
                      margin-top: 8px;
                      text-align: left;
                    ">
                      נענה: ${new Date(item.answer.ansDate).toLocaleDateString('he-IL')}
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
        </div>
      `).join('')}

      <!-- Footer -->
      <div style="
        margin-top: 50px;
        padding: 20px;
        background: #f8f9fa;
        border-radius: 10px;
        text-align: center;
        border-top: 3px solid #4cb5c3;
      ">
        <div style="color: #666; font-size: 14px;">
          מסמך זה הופק באופן אוטומטי מהמערכת<br>
          © ${new Date().getFullYear()} כל הזכויות שמורות
        </div>
      </div>
    </div>
  `;

  // Add to document
  document.body.appendChild(container);

  try {
    // Use html2canvas to convert to image
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const pageHeight = 297; // A4 height in mm
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    // Add image to PDF (handle multiple pages if needed)
    if (imgHeight <= pageHeight) {
      // Single page
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        0,
        imgWidth,
        imgHeight
      );
    } else {
      // Multiple pages
      let heightLeft = imgHeight;
      
      while (heightLeft > 0) {
        pdf.addImage(
          canvas.toDataURL('image/png'),
          'PNG',
          0,
          position,
          imgWidth,
          imgHeight
        );
        
        heightLeft -= pageHeight;
        
        if (heightLeft > 0) {
          position = -pageHeight;
          pdf.addPage();
        }
      }
    }

    // Save the PDF
    pdf.save(`טפסי_קליטה_${selectedKid.firstName}_${selectedKid.lastName}_${new Date().toISOString().split('T')[0]}.pdf`);

    // Success message
    if (window.Swal) {
      Swal.fire({
        title: 'הקובץ הורד בהצלחה! 📄',
        text: 'קובץ ה-PDF נשמר במחשב שלך',
        icon: 'success',
        confirmButtonText: 'אוקיי',
        confirmButtonColor: '#4cb5c3',
        timer: 3000,
        timerProgressBar: true
      });
    }

  } catch (error) {
    console.error('Error generating PDF:', error);
    
    if (window.Swal) {
      Swal.fire({
        title: 'שגיאה',
        text: 'לא הצלחנו ליצור את הקובץ. אנא נסה שנית.',
        icon: 'error',
        confirmButtonText: 'הבנתי',
        confirmButtonColor: '#f44336'
      });
    }
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};
  // Function to handle accordion toggle 
  const handleAccordionChange = (categoryKey) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? categoryKey : null);
  };


  // Retrieve questions with answers by form 
  const getQuestionsWithAnswers = (formId) => {
    const formKey = `${kidId}_${formId}`;
    const answers = answersByKidAndForm[formKey] || [];
    
    // Create a map of answers by question number
    const answersMap = {};
    answers.forEach(answer => {
      answersMap[answer.questionNo] = answer;
    });
    
    return { answersMap };
  };

  // Group data by forms and categories 
  const organizeDataByFormsAndCategories = () => {
    const formGroups = {};
    
    forms.forEach(form => {
      // Skip personal details form (1002)
      if (form.formId === 1002) return;
      
      const { answersMap } = getQuestionsWithAnswers(form.formId);
      const formQuestions = questionsByForm[form.formId] || [];
      
      // If there are answers for this form
      if (Object.keys(answersMap).length > 0) {
        // Grouping by categories within the form
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
        
        // Only if there are categories with answers
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

  // get Form Icon 
  const getFormIcon = (formName) => {
    if (formName.includes('רקע התפתחותי')) return <DevelopmentIcon />;
    if (formName.includes('בריאות')) return <MedicalIcon />;
    if (formName.includes('תזונה')) return <NutritionIcon />;
    if (formName.includes('אישור')) return <SecurityIcon />;
    if (formName.includes('ביקור בית')) return <HomeIcon />;
    return <AssignmentIcon />;
  };

  // get Form Color 
  const getFormColor = (formName) => {
    if (formName.includes('רקע התפתחותי')) return 'info';
    if (formName.includes('בריאות')) return 'error';
    if (formName.includes('תזונה')) return 'success';
    if (formName.includes('אישור')) return 'warning';
    if (formName.includes('ביקור בית')) return 'secondary';
    return 'primary';
  };

  // filter By Search 
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
            // Search in question text
            question.questionText?.toLowerCase().includes(searchLower) ||
            // Search in answer content
            answer.answer?.toLowerCase().includes(searchLower) ||
            answer.other?.toLowerCase().includes(searchLower) ||
            // Search in category
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
      <LoadingContainer>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress 
            size={48} 
            sx={{ 
              color: 'primary.main',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              }
            }} 
          />
          <Typography 
            variant="h6" 
            sx={{
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontWeight: 600
            }}
          >
            טוען מידע מטפסי קליטה...
          </Typography>
        </Stack>
      </LoadingContainer>
    );
  }

  if (totalDataItems === 0 && !searchTerm) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="info" 
          sx={{ 
            borderRadius: 3,
            background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(3, 169, 244, 0.05) 100%)',
            border: '1px solid rgba(33, 150, 243, 0.2)',
          }}
        >
          <Typography variant="h6" gutterBottom fontWeight={700}>
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
      {/* Title and Search - Enhanced styling only */}
      <EnhancedPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
          <Typography 
            variant="h5" 
            fontWeight="bold" 
            gutterBottom
            sx={{
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            📋 מידע מטפסי קליטה
          </Typography>
          <AnimatedButton
            variant="outlined"
            size="small"
            onClick={() => navigate(`/kids/onboarding/${selectedKid.id}`)}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                borderColor: 'primary.dark',
                background: 'rgba(76, 181, 195, 0.05)',
              }
            }}
          >
            ניהול טפסי קליטה
          </AnimatedButton>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          mb={3}
          sx={{ fontWeight: 500, letterSpacing: '0.5px' }}
        >
          כל המידע שנאסף בתהליך הקליטה, מאורגן לפי טפסים וקטגוריות
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 2 }}>
          <SearchField
            size="small"
            placeholder="חיפוש במידע..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'primary.main' }} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchTerm('')}
                    sx={{ 
                      mr: -1,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'rotate(90deg)',
                      }
                    }}
                  >
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ minWidth: 250 }}
          />
          
          <StyledChip 
            label={`${totalDataItems} פריטי מידע`} 
            color="primary" 
            variant="outlined" 
            sx={{
              background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
              color: 'white',
              borderColor: 'transparent',
            }}
          />
          <StyledChip 
            label={`${Object.keys(organizedData).length} טפסים`} 
            color="info" 
            variant="outlined" 
          />
          
          <Stack direction="row" spacing={1} sx={{ mr: 'auto' }}>
            <AnimatedButton
              variant="outlined"
              size="small"
              startIcon={<PrintIcon />}
              onClick={printData}
            >
              הדפס
            </AnimatedButton>
            
            <AnimatedButton
              variant="outlined"
              size="small"
              startIcon={<PdfIcon />}
              onClick={exportToPdf}
              color="error"
            >
              PDF
            </AnimatedButton>
            
          
          </Stack>
        </Box>
      </EnhancedPaper>

      {/* Forms - Enhanced styling only */}
      <Stack spacing={2}>
        {Object.keys(organizedData).length === 0 && searchTerm ? (
          // Message when no search results found - Enhanced styling only
          <EnhancedPaper sx={{ p: 4, textAlign: 'center' }}>
            <SearchIcon sx={{ 
              fontSize: 48, 
              color: 'text.secondary', 
              mb: 2,
              animation: `${pulse} 2s infinite`
            }} />
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{
                background: 'linear-gradient(45deg, #ff7043 30%, #ff9575 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontWeight: 700
              }}
            >
              לא נמצאו תוצאות עבור "{searchTerm}"
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              נסה לחפש במילים אחרות או נקה את תיבת החיפוש כדי לראות את כל המידע
            </Typography>
            <AnimatedButton
              variant="outlined"
              startIcon={<CloseIcon />}
              onClick={() => setSearchTerm('')}
            >
              נקה חיפוש
            </AnimatedButton>
          </EnhancedPaper>
        ) : (
          // Regular results - Enhanced styling only
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
                  expandIcon={<ExpandMoreIcon sx={{ 
                    transition: 'transform 0.3s ease',
                    transform: expandedCategory === formId ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} />}
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
                  {/* Categories within the form - Enhanced styling only */}
                  <Stack spacing={3}>
                    {Object.entries(formData.categories).map(([categoryKey, categoryData]) => (
                      <Box key={categoryKey}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            mb: 2, 
                            pb: 1, 
                            borderBottom: '2px solid',
                            borderImage: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981) 1',
                            background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            fontWeight: 700
                          }}
                        >
                          📋 {categoryData.categoryName} ({categoryData.questions.length})
                        </Typography>
                        
                        <Stack spacing={2}>
                          {categoryData.questions.map(({ question, answer }, index) => (
                            <QuestionCardComponent
                              key={`${question.formId}-${question.questionNo}-${index}`}
                              question={question}
                              answer={answer}
                            />
                          ))}
                        </Stack>
                        
                        {/* Separator between categories - Enhanced styling only */}
                        {Object.keys(formData.categories).length > 1 && 
                         categoryKey !== Object.keys(formData.categories).slice(-1)[0] && (
                          <Divider sx={{ 
                            mt: 3, 
                            mb: 1,
                            background: 'linear-gradient(90deg, transparent, rgba(76, 181, 195, 0.3), transparent)'
                          }} />
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