import  { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Avatar,
  Badge,
  Chip,
  styled,
  Button,
  Stack,
  Tooltip,
  alpha
} from '@mui/material';
import {
  Visibility as OverviewIcon,
  Assignment as FormsIcon,
  Folder as DocumentsIcon,
  Assessment as ReportsIcon,

} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Import components for each tab
import KidOverviewTab from './KidOverviewTab';
import KidIntakeFormsTab from './KidIntakeFormsTab';
import KidDocumentsTab from './KidDocumentsTab';
import KidReportsTab from './KidReportsTab';
import { baseURL } from '../../../components/common/axiosConfig';

// Enhanced Styled Components with professional design
const MainContainer = styled(Box)(({ theme }) => ({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 25%, #ff7043 50%, #10b981 75%, #4cb5c3 100%)',
  backgroundSize: '400% 400%',
  animation: 'gradientShift 20s ease infinite',
  padding: theme.spacing(3),
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 1,
  },
  '@keyframes gradientShift': {
    '0%': { backgroundPosition: '0% 50%' },
    '50%': { backgroundPosition: '100% 50%' },
    '100%': { backgroundPosition: '0% 50%' },
  }
}));

const EnhancedHeaderPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    borderRadius: '20px 20px 0 0',
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '200%',
    height: '200%',
    transform: 'translate(-50%, -50%)',
    pointerEvents: 'none',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: 'none',
  marginTop: theme.spacing(3),
  '& .MuiTabs-indicator': {
    backgroundColor: 'transparent',
    height: 0,
  },
  '& .MuiTab-root': {
    textTransform: 'none',
    minWidth: 120,
    fontWeight: 600,
    fontSize: '0.95rem',
    padding: '16px 24px',
    margin: '0 8px',
    borderRadius: 16,
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'translateY(-4px) scale(1.02)',
      boxShadow: '0 8px 25px rgba(76, 181, 195, 0.25)',
      background: 'rgba(255, 255, 255, 0.9)',
      '&::after': {
        left: '100%',
      }
    },
    '&.Mui-selected': {
      color: theme.palette.primary.main,
      background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.15) 0%, rgba(255, 112, 67, 0.15) 100%)',
      border: '1px solid rgba(76, 181, 195, 0.3)',
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(76, 181, 195, 0.2)',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: '-100%',
      width: '100%',
      height: '100%',
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
      transition: 'all 0.5s ease',
    },
  },
}));

const AnimatedQuickActionButton = styled(Button)(() => ({
  minWidth: 'auto',
  padding: '10px 20px',
  borderRadius: 12,
  textTransform: 'none',
  fontSize: '0.875rem',
  fontWeight: 600,
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  color: 'white',
  boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
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
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'all 0.5s ease',
  },
  '&:hover': {
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: '0 8px 25px rgba(76, 181, 195, 0.4)',
    background: 'linear-gradient(45deg, #3da1af 30%, #1a6b75 90%)',
    '&::before': {
      left: '100%',
    }
  },
}));


const StyledAvatar = styled(Avatar)(() => ({
  width: 64,
  height: 64,
  background: 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)',
  fontSize: '1.5rem',
  fontWeight: 'bold',
  boxShadow: '0 4px 15px rgba(76, 181, 195, 0.3)',
  border: '3px solid rgba(255, 255, 255, 0.9)',
}));

const StyledChip = styled(Chip)(() => ({
  borderRadius: 8,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  }
}));

const TabContentPaper = styled(Paper)(() => ({
  borderRadius: 20,
  minHeight: '500px',
  position: 'relative',
  overflow: 'hidden',
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  zIndex: 2,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
  }
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
  const { kidId } = useParams();
  const navigate = useNavigate();
  
  // State for the current tab 
  const [currentTab, setCurrentTab] = useState(0);
  
  // Fetching data from Redux 
  const { forms } = useSelector(state => state.forms);
  const { answersByKidAndForm } = useSelector(state => state.answers);
  const { documents } = useSelector(state => state.documents);



  // Function to calculate number of completed forms 
  const getCompletedFormsCount = () => {
    if (!forms || !kidId) return 0;
    
    return forms.filter(form => {
      const formKey = `${kidId}_${form.formId}`;
      const answers = answersByKidAndForm[formKey];
      return answers && answers.length > 0;
    }).length;
  };

  // Function to calculate number of documents 
  const getDocumentsCount = () => {
    if (!documents || !kidId) return 0;
    return documents.filter(doc => doc.kidId === parseInt(kidId)).length;
  };

  // Tabs configuration 
  const tabs = [
    {
      id: 'overview',
      label: 'מבט כללי',
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
      description: 'קבצים ומסמכים'
    },
    {
      id: 'reports',
      label: 'דוחות תקופתיים',
      icon: <ReportsIcon />,
      component: KidReportsTab,
      badge: null,
      description: 'דוחות תש"ה'
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
          background: isSelected ? 'linear-gradient(135deg, #4cb5c3 0%, #2a8a95 100%)' : 'rgba(200, 200, 200, 0.3)',
          color: isSelected ? 'white' : 'grey.600',
          fontSize: '1rem',
          boxShadow: isSelected ? '0 4px 12px rgba(76, 181, 195, 0.3)' : 'none',
          transition: 'all 0.3s ease'
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
                    height: '20px',
                    background: 'linear-gradient(45deg, #ff7043 30%, #ff9575 90%)',
                    boxShadow: '0 2px 8px rgba(255, 112, 67, 0.3)'
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
    <MainContainer dir="rtl">
      {/* Top header with child details and quick access buttons - Enhanced styling only */}
      <EnhancedHeaderPaper>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <StyledAvatar
              src={selectedKid.photoPath ? `${baseURL}/Documents/content-by-path?path=${encodeURIComponent(selectedKid.photoPath)}` : undefined}
            >
              {selectedKid.firstName?.charAt(0) || '?'}
            </StyledAvatar>
            
            <Box>
              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                {selectedKid.firstName} {selectedKid.lastName}
              </Typography>
              
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <StyledChip 
                  label={selectedKid.isActive ? '✅ פעיל' : '❌ לא פעיל'}
                  color={selectedKid.isActive ? 'success' : 'error'}
                  size="small"
                />
                {selectedKid.className && (
                  <StyledChip 
                    label={`כיתה: ${selectedKid.className}`}
                    variant="outlined"
                    size="small"
                  />
                )}
                {selectedKid.birthDate && (() => {
                  const birthDate = new Date(selectedKid.birthDate);
                  const today = new Date();

                  let years = today.getFullYear() - birthDate.getFullYear();
                  let months = today.getMonth() - birthDate.getMonth();
                  let days = today.getDate() - birthDate.getDate();

                  // If the month hasn't arrived yet this year
                  if (months < 0 || (months === 0 && days < 0)) {
                    years--;
                    months += 12;
                  }

                  // If the day hasn't arrived yet this month
                  if (days < 0) {
                    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                    days += prevMonth.getDate();
                    months--;
                    if (months < 0) {
                      months += 12;
                      years--;
                    }
                  }

                  return (
                    <StyledChip 
                      label={`גיל: ${years} שנים, ${months} חודשים, ${days} ימים`}
                      variant="outlined"
                      size="small"
                    />
                  );
                })()}
              </Stack>
            </Box>
          </Box>
          
          {/* Quick access buttons - Enhanced styling only */}
          <Stack direction="row" spacing={1}>
            <Tooltip placement="bottom" 
              PopperProps={{
                disablePortal: true,
                modifiers: [
                  {
                    name: 'flip',
                    enabled: false 
                  },
                  {
                    name: 'preventOverflow',
                    options: {
                      boundary: 'window', 
                    },
                  },
                ],
              }}
              title="מצב טפסי קליטה"
            >
              <AnimatedQuickActionButton

                onClick={() => navigate(`/kids/onboarding/${selectedKid.id}`)}
              >
                קליטה  👁️
              </AnimatedQuickActionButton>
            </Tooltip>
            
            
            
           
           
          </Stack>
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'text.secondary',
            fontWeight: 500,
            letterSpacing: '0.5px'
          }}
        >
          תיק דיגיטלי מלא של {selectedKid.firstName} - טיפולים, טפסים, מסמכים ודוחות
        </Typography>

        {/* The tabs themselves - Enhanced styling only */}
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
      </EnhancedHeaderPaper>

      {/* Tab content - Enhanced styling only */}
      <TabContentPaper>
        {tabs.map((tab, index) => {
          const Component = tab.component;
          return (
            <TabPanel key={tab.id} value={currentTab} index={index}>
              <Component selectedKid={selectedKid} />
            </TabPanel>
          );
        })}
      </TabContentPaper>
    </MainContainer>
  );
};

export default KidProfileTabs;