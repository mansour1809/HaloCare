// ProgressLogo.jsx - Updated styling while preserving fill logic
import React from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress } from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  HourglassEmpty as PendingIcon,
  VerifiedUser as CompletedByParentIcon
} from '@mui/icons-material';

// Main container with Employee styling
const IntegratedContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Logo area - updated styling but preserving functionality
const LogoArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '150px',
  height: '134px',
  marginBottom: '-10px',
  zIndex: 2,
  // Add subtle glow effect
  filter: 'drop-shadow(0 4px 12px rgba(76, 181, 195, 0.3))',
}));

// SVG Wrapper - enhanced with Employee styling
const LogoWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'visible',
  // Add subtle animation
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'scale(1.05)',
    filter: 'drop-shadow(0 6px 16px rgba(76, 181, 195, 0.4))',
  }
}));

// Logo outline - preserve original functionality
const LogoOutline = styled('svg')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
}));

// Logo fill - preserve original clip-path logic
const LogoFill = styled('svg')(({ progress, theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 2,
  clipPath: `inset(${100 - progress}% 0 0 0)`, // DO NOT CHANGE - this is the fill logic
  transition: 'clip-path 0.8s ease-in-out', // DO NOT CHANGE - this is the fill animation
}));

// Progress text - enhanced styling
const ProgressText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: '#fff',
  zIndex: 3,
  backgroundColor: 'rgba(76, 181, 195, 0.9)', // Updated to match Employee colors
  padding: '6px 12px',
  borderRadius: '20px',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
  boxShadow: '0 4px 12px rgba(76, 181, 195, 0.3)', // Add shadow
  border: '2px solid rgba(255, 255, 255, 0.2)', // Add border
}));

// Kid's name - enhanced with Employee styling
const KidName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: '-5px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  padding: '4px 16px', // Increased padding
  borderRadius: '16px', // More rounded
  zIndex: 4,
  boxShadow: '0 4px 12px rgba(76, 181, 195, 0.4)', // Enhanced shadow
  maxWidth: '90%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  // Add Employee-style gradient
  background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
  border: '2px solid rgba(255, 255, 255, 0.2)',
}));

// Forms summary - updated with Employee styling
const FormsSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3, 4, 4, 4), // Increased padding
  borderRadius: 20, // Increased border radius
  background: 'rgba(255, 255, 255, 0.95)', // Updated background
  backdropFilter: 'blur(20px)', // Add backdrop filter
  border: '1px solid rgba(255, 255, 255, 0.2)', // Add border
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)', // Enhanced shadow
  width: '100%',
  maxWidth: '800px',
  zIndex: 1,
  position: 'relative',
  // Add Employee-style top border
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

const ProgressLogo = ({ 
  onboardingData = null,
  kidName = null, 
  showFormsSummary = true,
  compact = false
}) => {
  // Progress calculation - DO NOT CHANGE
  const calculateProgress = () => {
    if (!onboardingData || !onboardingData.forms) return 0;
    
    const { completedForms, totalForms } = onboardingData;
    return totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
  };

  const progress = calculateProgress();
  
  // Logo path - DO NOT CHANGE
  const logoPath = "M338.307,722.666s-33.981-4.66-80.779-31.845-92.04-61.166-130.488-98.643S79.423,533.5,78.055,525.537s22.061,19.723,43.512,34.81,38.889,25.02,38.889,25.02,30.657,17.453,60.645,28.827,61.211,16.257,61.211,16.257,51.212,11.83,96.056,8.733,83.319-21.12,83.319-21.12,46.266-18.987,89.1-52.578c29.564-23.184,51.425-48.141,65.7-69.742,35.33-53.468,55.591-106.45,62.761-132.77S692.983,290.353,690,237.618s-5.976-71.695-22.7-85.586-24.347-14.19-46.007-10.157-40.628,26.29-40.628,26.29a255.615,255.615,0,0,0-29.874,51.979c-12.081,29.031-18.455,64.141-18.455,64.141L531.2,346.238s-1.369,7.6-4.184,12.068a9.431,9.431,0,0,1-6.92,4.667,7.536,7.536,0,0,1-6.114-4.667c-1.971-4.466-1.931-12.068-1.931-12.068s2.414-50.166,0-55.839-6.316,6.88-9.011,23.011-.433,33.184-4.344,41.517c-3.17,6.758-10.75,1.009-11.1-4.183-.844-12.391.966-42.965.966-42.965a80.038,80.038,0,0,0,0-13.84c-.6-4.584-2.334-7.143-3.54-7.241-2.977-.241-5.15.684-7.4,5.311s-1.93,11.907-1.93,11.907v38.459s-1.006,18.747-4.667,19.31-8.448,3.541-10.3-7.724,0-35.722,0-35.722l.966-24.3S461,280.1,458.951,277.2s-3.983-.321-5.793,4.184-2.576,11.586-2.576,11.586.017,28.258-.966,45.541c-.481,8.471-1.691,13.386-2.253,14.321-1.81,3.017-3.58,3.983-7.241,3.219s-4.3-1.861-7.4-6.276c-3.543-5.047-2.663-8.488-3.057-7.4-.081.221-2.276-31.005-1.127-51.976a136.142,136.142,0,0,1,4.184-26.551c.724-3.544,1.757-6.5,2.253-9.333,1.287-7.363,3.218-13.951,3.218-16.9,0-8.367-6.281,5.894-6.758,7.241-1.356,3.827-1.933,8.106-2.9,10.62a57.8,57.8,0,0,1-6.276,11.587s-7.161,4.506-13.838,5.31a26.669,26.669,0,0,1-12.874-2.091s-7.724-2.736-9.816-8.368,2.574-12.39,2.574-12.39a40.183,40.183,0,0,1,12.23-9.817c5.7-2.843,11.96-3.894,17.38-8.528";

  return (
    <IntegratedContainer>
      {/* Logo Area */}
      <LogoArea>
        <LogoWrapper>
          {/* Gray outline - DO NOT CHANGE */}
          <LogoOutline viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
            <path d={logoPath} fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2"/>
          </LogoOutline>
          
          {/* Colored fill - DO NOT CHANGE CLIP-PATH LOGIC */}
          <LogoFill viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg" progress={progress}>
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4cb5c3" />
                <stop offset="50%" stopColor="#ff7043" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
            <path d={logoPath} fill="url(#logoGradient)" stroke="#2a8a95" strokeWidth="3"/>
          </LogoFill>
          
          {/* Progress text */}
          <ProgressText>
            {progress}%
          </ProgressText>
          
          {/* Kid name */}
          {kidName && (
            <KidName>
              {kidName}
            </KidName>
          )}
        </LogoWrapper>
      </LogoArea>

      {/* Forms Summary */}
      {showFormsSummary && onboardingData && onboardingData.forms && (
        <FormsSummary elevation={0}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              fontWeight: 700,
              color: '#2a8a95',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            📊 סיכום טפסים
          </Typography>
          
          <Grid container spacing={2}>
            {onboardingData.forms.map((form, index) => {
              const getStatusIcon = (status) => {
                switch (status) {
                  case 'Completed':
                    return <CheckIcon sx={{ fontSize: '1rem' }} />;
                  case 'CompletedByParent':
                    return <CompletedByParentIcon sx={{ fontSize: '1rem' }} />;
                  case 'SentToParent':
                    return <EmailIcon sx={{ fontSize: '1rem' }} />;
                  case 'InProgress':
                    return <EditIcon sx={{ fontSize: '1rem' }} />;
                  default:
                    return <PendingIcon sx={{ fontSize: '1rem' }} />;
                }
              };

              const getStatusColor = (status) => {
                switch (status) {
                  case 'Completed':
                  case 'CompletedByParent':
                    return 'success';
                  case 'SentToParent':
                    return 'info';
                  case 'InProgress':
                    return 'warning';
                  default:
                    return 'default';
                }
              };

              const getStatusText = (status) => {
                switch (status) {
                  case 'Completed':
                    return 'הושלם';
                  case 'CompletedByParent':
                    return 'הושלם ע"י הורה';
                  case 'SentToParent':
                    return 'נשלח להורה';
                  case 'InProgress':
                    return 'בתהליך';
                  default:
                    return 'ממתין';
                }
              };

              return (
                <Grid item xs={12} sm={6} md={4} key={form.formId || index}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha('#4cb5c3', 0.05)} 0%, ${alpha('#ff7043', 0.05)} 100%)`,
                    border: `1px solid ${alpha('#4cb5c3', 0.1)}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: `linear-gradient(135deg, ${alpha('#4cb5c3', 0.1)} 0%, ${alpha('#ff7043', 0.1)} 100%)`,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(76, 181, 195, 0.2)'
                    }
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        color: '#2a8a95'
                      }}
                    >
                      {form.formName || `טופס ${index + 1}`}
                    </Typography>
                    
                    <Chip
                      icon={getStatusIcon(form.status)}
                      label={getStatusText(form.status)}
                      size="small"
                      color={getStatusColor(form.status)}
                      sx={{ 
                        fontWeight: 600,
                        '& .MuiChip-icon': {
                          color: 'inherit'
                        }
                      }}
                    />
                    
                    {form.totalQuestions > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {form.answeredQuestions}/{form.totalQuestions} שאלות
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={(form.answeredQuestions / form.totalQuestions) * 100}
                          sx={{
                            height: 4,
                            borderRadius: 2,
                            mt: 0.5,
                            backgroundColor: alpha('#4cb5c3', 0.2),
                            '& .MuiLinearProgress-bar': {
                              background: 'linear-gradient(90deg, #4cb5c3, #10b981)',
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Box>
                    )}
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </FormsSummary>
      )}
    </IntegratedContainer>
  );
};

export default ProgressLogo;