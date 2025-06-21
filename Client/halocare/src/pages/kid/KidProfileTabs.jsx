// src/components/kids/KidProfileTabs.jsx - מבנה טאבים עם כפתורי גישה מהירה
import React, { useState, useEffect } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Avatar,
  Badge,
  Chip,
  Divider,
  useTheme,
  styled,
  Button,
  Stack,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as OverviewIcon,
  Assignment as FormsIcon,
  Folder as DocumentsIcon,
  Assessment as ReportsIcon,
  CalendarToday as CalendarIcon,
  Groups as AttendanceIcon,
  Refresh as RefreshIcon,
  Print as PrintIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Import קומפוננטות הטאבים
import KidOverviewTab from './KidOverviewTab';
import KidIntakeFormsTab from './KidIntakeFormsTab';
import KidDocumentsTab from './KidDocumentsTab';
import KidDocumentManager from '../addKid/KidDocumentManager';
import KidReportsTab from './KidReportsTab';

// Styled Components
const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid',
  borderColor: theme.palette.divider,
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 120,
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '12px 24px',
    margin: '0 4px',
    borderRadius: '12px 12px 0 0',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: 'rgba(76, 181, 195, 0.08)',
      transform: 'translateY(-2px)',
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      backgroundColor: 'rgba(76, 181, 195, 0.1)',
    },
  },
}));

const QuickActionButton = styled(Button)(({ theme }) => ({
  minWidth: 'auto',
  padding: '8px 16px',
  borderRadius: '8px',
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 500,
  border: '1px solid',
  borderColor: theme.palette.divider,
  color: theme.palette.text.primary,
  backgroundColor: theme.palette.background.paper,
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.primary.lighter || 'rgba(76, 181, 195, 0.08)',
    transform: 'translateY(-1px)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
}));

const TabPanel = ({ children, value, index, ...other }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`kid-tabpanel-${index}`}
    aria-labelledby={`kid-tab-${index}`}
    {...other}
  >
    {value === index && (
      <Box sx={{ py: 3 }}>
        {children}
      </Box>
    )}
  </div>
);

const KidProfileTabs = ({ selectedKid }) => {
  const theme = useTheme();
  const { kidId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // State לטאב הנוכחי
  const [currentTab, setCurrentTab] = useState(0);
  
  // שליפת נתונים מהרדקס
  const { forms } = useSelector(state => state.forms);
  const { answersByKidAndForm } = useSelector(state => state.answers);
  const { documents } = useSelector(state => state.documents);

  // פונקציות עזר
  const handleRefresh = () => {
    // רענון כל הנתונים הרלוונטיים
    if (kidId) {
      // כאן תוכל להוסיף רענון של כל הנתונים הרלוונטיים
      window.location.reload(); // פתרון זמני - ניתן לשפר
    }
  };

  const handlePrint = () => {
    // הדפסת סיכום הילד
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html dir="rtl">
        <head>
          <title>סיכום ילד - ${selectedKid.firstName} ${selectedKid.lastName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; direction: rtl; }
            h1 { color: #1976d2; }
            h2 { color: #666; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; display: inline-block; width: 150px; }
          </style>
        </head>
        <body>
          <h1>תיק ילד - ${selectedKid.firstName} ${selectedKid.lastName}</h1>
          <h2>פרטים בסיסיים</h2>
          <div class="info-row"><span class="label">תאריך לידה:</span> ${selectedKid.birthDate || 'לא מצוין'}</div>
          <div class="info-row"><span class="label">מגדר:</span> ${selectedKid.gender || 'לא מצוין'}</div>
          <div class="info-row"><span class="label">כתובת:</span> ${selectedKid.address || 'לא מצוין'}</div>
          <div class="info-row"><span class="label">כיתה:</span> ${selectedKid.className || 'לא משויך'}</div>
          <div class="info-row"><span class="label">סטטוס:</span> ${selectedKid.isActive ? 'פעיל' : 'לא פעיל'}</div>
          <div class="info-row"><span class="label">הורה ראשי:</span> ${selectedKid.parentName1 || 'לא מצוין'}</div>
          <div class="info-row"><span class="label">הורה משני:</span> ${selectedKid.parentName2 || 'לא מצוין'}</div>
          <div class="info-row"><span class="label">איש קשר חירום:</span> ${selectedKid.emergencyContact || 'לא מצוין'}</div>
          <h2>הערות</h2>
          <p>${selectedKid.notes || 'אין הערות'}</p>
          <br><br>
          <p><small>הופק ב: ${new Date().toLocaleDateString('he-IL')} ${new Date().toLocaleTimeString('he-IL')}</small></p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // פונקציה לחישוב מספר טפסים שהושלמו
  const getCompletedFormsCount = () => {
    if (!forms || !kidId) return 0;
    
    return forms.filter(form => {
      const formKey = `${kidId}_${form.formId}`;
      const answers = answersByKidAndForm[formKey];
      return answers && answers.length > 0;
    }).length;
  };

  // פונקציה לחישוב מספר מסמכים
  const getDocumentsCount = () => {
    if (!documents || !kidId) return 0;
    return documents.filter(doc => doc.kidId === parseInt(kidId)).length;
  };

  // הגדרת הטאבים
  const tabs = [
    {
      id: 'overview',
      label: 'סקירה כללית',
      icon: <OverviewIcon />,
      component: KidOverviewTab,
      badge: null,
      description: 'מידע קריטי, פרח טיפולים ופרטים בסיסיים'
    },
    {
      id: 'intake-forms', 
      label: 'טפסי קליטה',
      icon: <FormsIcon />,
      component: KidIntakeFormsTab,
      badge: getCompletedFormsCount(),
      description: 'כל המידע שנאסף בתהליך הקליטה'
    },
    {
      id: 'documents',
      label: 'מסמכים',
      icon: <DocumentsIcon />,
      component: KidDocumentsTab,
      badge: getDocumentsCount(),
      description: 'קבצים ומסמכים מועלים'
    },
    {
      id: 'reports',
      label: 'דוחות תקופתיים',
      icon: <ReportsIcon />,
      component: KidReportsTab,
      badge: null,
      description: 'דוחות והערכות (בפיתוח)'
    }
  ];

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const renderTabIcon = (tab, index) => {
    const isSelected = currentTab === index;
    
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1.5,
        color: isSelected ? 'primary.main' : 'text.secondary'
      }}>
        <Avatar sx={{ 
          width: 32, 
          height: 32,
          bgcolor: isSelected ? 'primary.main' : 'grey.300',
          color: isSelected ? 'white' : 'grey.600',
          fontSize: '1rem'
        }}>
          {tab.icon}
        </Avatar>
        
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body1" fontWeight={isSelected ? 'bold' : 'medium'}>
              {tab.label}
            </Typography>
            {tab.badge !== null && tab.badge > 0 && (
              <Badge 
                badgeContent={tab.badge} 
                color="primary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    minWidth: '20px',
                    height: '20px'
                  }
                }}
              />
            )}
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
            {tab.description}
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <Box dir="rtl">
      {/* כותרת עליונה עם פרטי הילד וכפתורי גישה מהירה */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              sx={{ 
                width: 64, 
                height: 64,
                bgcolor: 'primary.main',
                fontSize: '1.5rem',
                fontWeight: 'bold'
              }}
            >
              {selectedKid.firstName?.charAt(0) || '?'}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {selectedKid.firstName} {selectedKid.lastName}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Chip 
                  label={selectedKid.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                  color={selectedKid.isActive ? 'success' : 'error'}
                  size="small"
                />
                {selectedKid.className && (
                  <Chip 
                    label={`כיתה: ${selectedKid.className}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {selectedKid.birthDate && (
                  <Chip 
                    label={`גיל: ${new Date().getFullYear() - new Date(selectedKid.birthDate).getFullYear()}`}
                    variant="outlined"
                    size="small"
                  />
                )}
              </Stack>
            </Box>
          </Box>
          
          {/* כפתורי גישה מהירה */}
          <Stack direction="row" spacing={1}>
            <Tooltip title="יומן כללי">
              <QuickActionButton
                startIcon={<CalendarIcon />}
                onClick={() => navigate('/calendar/schedule')}
              >
                יומן
              </QuickActionButton>
            </Tooltip>
            
            <Tooltip title="נוכחות היום">
              <QuickActionButton
                startIcon={<AttendanceIcon />}
                onClick={() => navigate('/reports/attendance')}
              >
                נוכחות
              </QuickActionButton>
            </Tooltip>
            
            <Tooltip title="רענן נתונים">
              <IconButton
                onClick={handleRefresh}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="הדפס סיכום">
              <IconButton
                onClick={handlePrint}
                sx={{ 
                  border: '1px solid',
                  borderColor: 'divider',
                  '&:hover': { borderColor: 'primary.main' }
                }}
              >
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>
        
        <Typography variant="body2" color="text.secondary">
          תיק דיגיטלי מלא של {selectedKid.firstName} - טיפולים, טפסים, מסמכים ודוחות
        </Typography>

        {/* הטאבים עצמם */}
        <Box sx={{ mt: 3 }}>
          <StyledTabs
            value={currentTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ 
              px: 2,
              '& .MuiTabs-flexContainer': {
                gap: 1
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.id}
                label={renderTabIcon(tab, index)}
                id={`kid-tab-${index}`}
                aria-controls={`kid-tabpanel-${index}`}
                sx={{ minHeight: '80px' }}
              />
            ))}
          </StyledTabs>
        </Box>
      </Paper>

      {/* תוכן הטאבים */}
      <Paper sx={{ 
        borderRadius: 3,
        minHeight: '500px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {tabs.map((tab, index) => {
          const Component = tab.component;
          return (
            <TabPanel key={tab.id} value={currentTab} index={index}>
              <Component selectedKid={selectedKid} />
            </TabPanel>
          );
        })}
      </Paper>
    </Box>
  );
};

export default KidProfileTabs;