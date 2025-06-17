// src/components/kids/KidProfileTabs.jsx - מבנה טאבים חדש
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
  styled
} from '@mui/material';
import {
  Visibility as OverviewIcon,
  Assignment as FormsIcon,
  Folder as DocumentsIcon,
  Assessment as ReportsIcon
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
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
  // const dispatch = useDispatch();
  
  // State לטאב הנוכחי
  const [currentTab, setCurrentTab] = useState(0);
  
  // שליפת נתונים מהרדקס
  const { forms } = useSelector(state => state.forms);
  const { answersByKidAndForm } = useSelector(state => state.answers);
  const { documents } = useSelector(state => state.documents);

  // // טעינת נתונים בהתחלה
  // useEffect(() => {
  //   if (kidId) {
  //     // כאן תוכל להוסיף טעינת נתונים נוספים אם צריך
  //     console.log('Loading data for kid:', kidId);
  //   }
  // }, [kidId, dispatch]);

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
      description: 'פרח טיפולים וסטטיסטיקות'
    },
    {
      id: 'intake-forms', 
      label: 'טפסי קליטה',
      icon: <FormsIcon />,
      component: KidIntakeFormsTab,
      badge: getCompletedFormsCount(),
      description: 'טפסים שמולאו בתהליך הקליטה'
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
          transition: 'all 0.2s ease-in-out',
          fontSize: '1rem'
        }}>
          {tab.icon}
        </Avatar>
        
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={600}>
            {tab.label}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            {tab.description}
          </Typography>
        </Box>
        
        {tab.badge !== null && tab.badge > 0 && (
          <Badge 
            badgeContent={tab.badge} 
            color="primary"
            sx={{
              '& .MuiBadge-badge': {
                right: -8,
                top: -8,
                minWidth: 20,
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600
              }
            }}
          />
        )}
      </Box>
    );
  };

  if (!selectedKid) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          טוען פרטי ילד...
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* כותרת הטאבים */}
      <Paper sx={{ borderRadius: '12px 12px 0 0', overflow: 'hidden' }}>
        <Box sx={{ 
          p: 3, 
          background: 'linear-gradient(135deg, #f8fafb 0%, #ffffff 100%)',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ 
              width: 48, 
              height: 48, 
              bgcolor: 'primary.main',
              fontSize: '1.2rem'
            }}>
              {selectedKid.firstName?.charAt(0)}{selectedKid.lastName?.charAt(0)}
            </Avatar>
            
            <Box>
              <Typography variant="h5" fontWeight="bold" color="primary.main">
                {selectedKid.firstName} {selectedKid.lastName}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Chip 
                  label={selectedKid.isActive ? 'פעיל' : 'לא פעיל'}
                  color={selectedKid.isActive ? 'success' : 'default'}
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
              </Box>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary">
            תיק דיגיטלי מלא של {selectedKid.firstName} - טיפולים, טפסים, מסמכים ודוחות
          </Typography>
        </Box>

        {/* הטאבים עצמם */}
        <StyledTabs
          value={currentTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ px: 2 }}
        >
          {tabs.map((tab, index) => (
            <Tab
              key={tab.id}
              label={renderTabIcon(tab, index)}
              id={`kid-tab-${index}`}
              aria-controls={`kid-tabpanel-${index}`}
            />
          ))}
        </StyledTabs>
      </Paper>

      {/* תוכן הטאבים */}
      <Paper sx={{ 
        borderRadius: '0 0 12px 12px',
        minHeight: '500px',
        position: 'relative'
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