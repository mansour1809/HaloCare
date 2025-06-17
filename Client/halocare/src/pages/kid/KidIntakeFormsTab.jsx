// src/components/kids/tabs/KidIntakeFormsTab.jsx - טאב מידע מטפסי קליטה (מסודר לפי נושאים)
import React, { useEffect, useState } from 'react';
import {
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Paper,
  Grid,
  Chip,
  Avatar,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  styled
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  LocalHospital as MedicalIcon,
  Restaurant as NutritionIcon,
  Psychology as DevelopmentIcon,
  // Family as FamilyIcon,
  Home as HomeIcon,
  School as EducationIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchForms } from '../../Redux/features/formsSlice';
import { fetchFormAnswers } from '../../Redux/features/answersSlice';

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

const InfoCard = ({ label, value, icon, color = 'primary' }) => {
  if (!value || value === 'NULL' || value === '') return null;
  
  return (
    <Card sx={{ 
      borderRadius: 2, 
      border: '1px solid', 
      borderColor: 'divider',
      '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          {icon && (
            <Avatar sx={{ 
              width: 24, 
              height: 24, 
              bgcolor: `${color}.light`,
              color: `${color}.main`,
              mr: 1,
              fontSize: '0.8rem'
            }}>
              {icon}
            </Avatar>
          )}
          <Typography variant="subtitle2" color={`${color}.main`} fontWeight={600}>
            {label}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ wordBreak: 'break-word' }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

const CategoryHeader = ({ icon, title, description, color, dataCount }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
    <Avatar sx={{ 
      bgcolor: `${color}.main`, 
      width: 48, 
      height: 48,
      fontSize: '1.2rem'
    }}>
      {icon}
    </Avatar>
    
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" fontWeight="bold" color="text.primary">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Box>
    
    {dataCount > 0 && (
      <Chip
        label={`${dataCount} פריטי מידע`}
        color={color}
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    )}
  </Box>
);

const KidIntakeFormsTab = ({ selectedKid }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState(false);
  
  // Redux selectors
  const { forms, status: formsStatus } = useSelector(state => state.forms);
  const { answersByKidAndForm } = useSelector(state => state.answers);

  // טעינת טפסים ותשובות
  useEffect(() => {
    const loadData = async () => {
      if (!selectedKid?.id) return;
      
      setLoading(true);
      
      try {
        // טעינת רשימת הטפסים
        if (formsStatus === 'idle') {
          await dispatch(fetchForms()).unwrap();
        }
        
        // טעינת תשובות לכל טופס
        if (forms && forms.length > 0) {
          const promises = forms.map(form => 
            dispatch(fetchFormAnswers({ 
              kidId: selectedKid.id, 
              formId: form.formId 
            }))
          );
          
          await Promise.allSettled(promises);
        }
      } catch (error) {
        console.error('Error loading forms data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedKid?.id, dispatch, forms?.length]);

  // איסוף כל התשובות
  const getAllAnswers = () => {
    if (!selectedKid?.id) return [];
    
    let allAnswers = [];
    forms?.forEach(form => {
      const formKey = `${selectedKid.id}_${form.formId}`;
      const answers = answersByKidAndForm[formKey] || [];
      allAnswers = [...allAnswers, ...answers];
    });
    
    return allAnswers;
  };

  // פונקציה לחיפוש תשובה לפי מילות מפתח
  const findAnswerByKeywords = (keywords) => {
    const allAnswers = getAllAnswers();
    return allAnswers.find(answer => 
      keywords.some(keyword => 
        answer.answer?.toLowerCase().includes(keyword.toLowerCase()) ||
        answer.other?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // פונקציה לחיפוש כל התשובות לפי מילות מפתח
  const findAnswersByKeywords = (keywords) => {
    const allAnswers = getAllAnswers();
    return allAnswers.filter(answer => 
      keywords.some(keyword => 
        answer.answer?.toLowerCase().includes(keyword.toLowerCase()) ||
        answer.other?.toLowerCase().includes(keyword.toLowerCase())
      )
    );
  };

  // ארגון המידע לפי קטגוריות לוגיות
  const organizeDataByCategories = () => {
    const allAnswers = getAllAnswers();
    
    // כאן תוכל להוסיף לוגיקה חכמה יותר בהתאם למבנה השאלות שלך
    return {
      personal: {
        title: 'מידע אישי',
        icon: <PersonIcon />,
        color: 'primary',
        description: 'פרטים אישיים בסיסיים על הילד',
        data: [
          { label: 'שם מלא', value: `${selectedKid.firstName} ${selectedKid.lastName}` },
          { label: 'תאריך לידה', value: selectedKid.birthDate ? new Date(selectedKid.birthDate).toLocaleDateString('he-IL') : null },
          { label: 'מגדר', value: selectedKid.gender },
          { label: 'כתובת', value: selectedKid.address },
          { label: 'עיר', value: selectedKid.cityName },
          // הוסף תשובות רלוונטיות מהטפסים
          ...allAnswers
            .filter(a => a.questionNo <= 5) // נניח שהשאלות הראשונות הן פרטים אישיים
            .map(a => ({ label: `שאלה ${a.questionNo}`, value: a.answer || a.other }))
        ].filter(item => item.value)
      },
      
      medical: {
        title: 'מידע רפואי ובריאות',
        icon: <MedicalIcon />,
        color: 'error',
        description: 'מצב בריאותי, תרופות ומגבלות רפואיות',
        data: allAnswers
          .filter(a => 
            a.answer?.toLowerCase().includes('תרופ') ||
            a.answer?.toLowerCase().includes('אלרג') ||
            a.answer?.toLowerCase().includes('רופא') ||
            a.answer?.toLowerCase().includes('בריא') ||
            a.answer?.toLowerCase().includes('חול') ||
            a.questionNo >= 50 && a.questionNo <= 70 // נניח שאלות רפואיות
          )
          .map(a => ({ 
            label: `מידע רפואי ${a.questionNo}`, 
            value: a.answer || a.other,
            icon: <MedicalIcon />
          }))
      },
      
      nutrition: {
        title: 'תזונה והאכלה',
        icon: <NutritionIcon />,
        color: 'success',
        description: 'הרגלי אכילה, העדפות ומגבלות תזונתיות',
        data: allAnswers
          .filter(a => 
            a.answer?.toLowerCase().includes('אוכל') ||
            a.answer?.toLowerCase().includes('אכיל') ||
            a.answer?.toLowerCase().includes('מזון') ||
            a.answer?.toLowerCase().includes('שתי') ||
            a.answer?.toLowerCase().includes('חלב') ||
            a.questionNo >= 10 && a.questionNo <= 25 // נניח שאלות תזונה
          )
          .map(a => ({ 
            label: `הרגלי אכילה ${a.questionNo}`, 
            value: a.answer || a.other,
            icon: <NutritionIcon />
          }))
      },
      
      development: {
        title: 'התפתחות ויכולות',
        icon: <DevelopmentIcon />,
        color: 'warning',
        description: 'התפתחות מוטורית, קוגניטיבית וחברתית',
        data: allAnswers
          .filter(a => 
            a.answer?.toLowerCase().includes('התפתח') ||
            a.answer?.toLowerCase().includes('יכול') ||
            a.answer?.toLowerCase().includes('מיומנ') ||
            a.answer?.toLowerCase().includes('שפה') ||
            a.questionNo >= 30 && a.questionNo <= 45 // נניח שאלות התפתחות
          )
          .map(a => ({ 
            label: `התפתחות ${a.questionNo}`, 
            value: a.answer || a.other,
            icon: <DevelopmentIcon />
          }))
      },
      
      family: {
        title: 'רקע משפחתי',
        // icon: <FamilyIcon />,
        color: 'info',
        description: 'מידע על המשפחה, הורים ורקע חברתי',
        data: [
          { label: 'הורה ראשי', value: selectedKid.parentName1 },
          { label: 'הורה משני', value: selectedKid.parentName2},
          ...allAnswers
            .filter(a => 
              a.answer?.toLowerCase().includes('הורה') ||
              a.answer?.toLowerCase().includes('משפח') ||
              a.answer?.toLowerCase().includes('אח') ||
              a.answer?.toLowerCase().includes('סבא') ||
              a.questionNo >= 70 && a.questionNo <= 85 // נניח שאלות משפחה
            )
            .map(a => ({ 
              label: `רקע משפחתי ${a.questionNo}`, 
              value: a.answer || a.other,
              // icon: <FamilyIcon />
            }))
        ].filter(item => item.value)
      },
      
      environment: {
        title: 'סביבה ומסגרות',
        icon: <HomeIcon />,
        color: 'secondary',
        description: 'מסגרות קודמות, סביבת הבית ושגרה יומית',
        data: allAnswers
          .filter(a => 
            a.answer?.toLowerCase().includes('גן') ||
            a.answer?.toLowerCase().includes('מסגר') ||
            a.answer?.toLowerCase().includes('בית') ||
            a.answer?.toLowerCase().includes('שגר') ||
            a.questionNo >= 85 // נניח שאלות סביבה
          )
          .map(a => ({ 
            label: `סביבה ${a.questionNo}`, 
            value: a.answer || a.other,
            icon: <HomeIcon />
          }))
      }
    };
  };

  const handleAccordionChange = (category) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? category : false);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>
          מארגן מידע...
        </Typography>
      </Box>
    );
  }

  const categories = organizeDataByCategories();
  const totalDataItems = Object.values(categories).reduce((sum, cat) => sum + cat.data.length, 0);

  if (totalDataItems === 0) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          אין מידע זמין מטפסי הקליטה
        </Typography>
        <Typography variant="body2">
          לא נמצא מידע שנאסף בתהליך הקליטה להצגה
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* כותרת וסטטיסטיקות */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)' }}>
        <Typography variant="h6" fontWeight="bold" color="primary.main" mb={2}>
          📋 מידע על הילד מתהליך הקליטה
        </Typography>
        
        <Typography variant="body2" color="text.secondary" mb={3}>
          המידע שנאסף מארגן לפי נושאים לוגיים לקריאה נוחה
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Chip 
            label={`${totalDataItems} פריטי מידע`} 
            color="primary" 
            variant="outlined" 
          />
          <Chip 
            label={`${Object.keys(categories).length} קטגוריות`} 
            color="info" 
            variant="outlined" 
          />
        </Box>
      </Paper>

      {/* קטגוריות המידע */}
      <Stack spacing={2}>
        {Object.entries(categories)
          .filter(([key, category]) => category.data.length > 0)
          .map(([key, category]) => (
            <StyledAccordion
              key={key}
              expanded={expandedCategory === key}
              onChange={handleAccordionChange(key)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`${key}-content`}
                id={`${key}-header`}
              >
                <CategoryHeader
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  color={category.color}
                  dataCount={category.data.length}
                />
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={2}>
                  {category.data.map((item, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <InfoCard
                        label={item.label}
                        value={item.value}
                        icon={item.icon}
                        color={category.color}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </StyledAccordion>
          ))
        }
      </Stack>
    </Box>
  );
};

export default KidIntakeFormsTab;