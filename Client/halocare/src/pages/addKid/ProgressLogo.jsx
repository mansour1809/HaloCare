// components/kids/ProgressLogo.jsx
import React from 'react';
import { Box, Typography, Paper, Grid, Chip, LinearProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  CheckCircle as CheckIcon,
  Edit as EditIcon,
  Email as EmailIcon,
  HourglassEmpty as PendingIcon,
  VerifiedUser as CompletedByParentIcon
} from '@mui/icons-material';

const IntegratedContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  marginBottom: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

// Logo area with the complete state
const LogoArea = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '150px',
  height: '134px',
  marginBottom: '-10px',
  zIndex: 2,
}));

// SVG Wrapper
const LogoWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'visible',
}));

// Full SVG (gray background)
const LogoOutline = styled('svg')(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 1,
}));

// SVG that fills (colorful)
const LogoFill = styled('svg')(({ progress, theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 2,
  clipPath: `inset(${100 - progress}% 0 0 0)`,
  transition: 'clip-path 0.8s ease-in-out',
}));

// Progress percentage
const ProgressText = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  color: '#fff',
  zIndex: 3,
  backgroundColor: 'rgba(0,0,0,0.4)',
  padding: '4px 8px',
  borderRadius: '20px',
  textShadow: '0 1px 2px rgba(0,0,0,0.5)',
}));

// Kid's name
const KidName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: '-5px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  backgroundColor: theme.palette.primary.main,
  color: '#fff',
  padding: '2px 12px',
  borderRadius: '12px',
  zIndex: 4,
  boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  maxWidth: '90%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));

// Forms summary below the logo
const FormsSummary = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3, 3),
  borderRadius: theme.spacing(2, 2, 2, 2),
  backgroundColor: theme.palette.grey[50],
  boxShadow: '0 -4px 20px rgba(0,0,0,0.05)',
  width: '100%',
  maxWidth: '800px',
  zIndex: 1
}));

const ProgressLogo = ({ 
  onboardingData = null,
  kidName = null, 
  showFormsSummary = true,
  compact = false
}) => {
  // Updated calculation with the new data
  const calculateProgress = () => {
    if (!onboardingData || !onboardingData.forms) return 0;
    
    const { completedForms, totalForms } = onboardingData;
    return totalForms > 0 ? Math.round((completedForms / totalForms) * 100) : 0;
  };

  const progress = calculateProgress();
  
  const logoPath = "M338.307,722.666s-33.981-4.66-80.779-31.845-92.04-61.166-130.488-98.643S79.423,533.5,78.055,525.537s22.061,19.723,43.512,34.81,38.889,25.02,38.889,25.02,30.657,17.453,60.645,28.827,61.211,16.257,61.211,16.257,51.212,11.83,96.056,8.733,83.319-21.12,83.319-21.12,46.266-18.987,89.1-52.578c29.564-23.184,51.425-48.141,65.7-69.742,35.33-53.468,55.591-106.45,62.761-132.77S692.983,290.353,690,237.618s-5.976-71.695-22.7-85.586-24.347-14.19-46.007-10.157-40.628,26.29-40.628,26.29a255.615,255.615,0,0,0-29.874,51.979c-12.081,29.031-18.455,64.141-18.455,64.141L531.2,346.238s-1.369,7.6-4.184,12.068a9.431,9.431,0,0,1-6.92,4.667,7.536,7.536,0,0,1-6.114-4.667c-1.971-4.466-1.931-12.068-1.931-12.068s2.414-50.166,0-55.839-6.316,6.88-9.011,23.011-.433,33.184-4.344,41.517c-3.17,6.758-10.75,1.009-11.1-4.183-.844-12.391.966-42.965.966-42.965a80.038,80.038,0,0,0,0-13.84c-.6-4.584-2.334-7.143-3.54-7.241-2.977-.241-5.15.684-7.4,5.311s-1.93,11.907-1.93,11.907v38.459s-1.006,18.747-4.667,19.31-8.448,3.541-10.3-7.724,0-35.722,0-35.722l.966-24.3S461,280.1,458.951,277.2s-3.983-.321-5.793,4.184-2.576,11.586-2.576,11.586.017,28.258-.966,45.541c-.481,8.471-1.691,13.386-2.253,14.321-1.81,3.017-3.58,3.983-7.241,3.219s-4.3-1.861-7.4-6.276c-3.543-5.047-2.663-8.488-3.057-7.4-.081.221-2.276-31.005-1.127-51.976a136.142,136.142,0,0,1,4.184-26.551c.724-3.544,1.757-6.5,2.253-9.333,1.287-7.363,3.218-13.951,3.218-16.9,0-8.367-6.281,5.894-6.758,7.241-1.356,3.827-1.933,8.106-2.9,10.62a57.8,57.8,0,0,1-6.276,11.587s-7.161,4.506-13.838,5.31a26.669,26.669,0,0,1-12.874-2.091s-7.724-2.736-9.816-8.368,2.574-12.39,2.574-12.39a40.183,40.183,0,0,1,12.23-9.817c5.7-2.843,11.96-3.894,17.38-8.528,13.48-11.527,23.185-29.534,23.185-29.534s27.805-57.1,60.666-100.193,64.8-62.965,64.8-62.965,35.62-22.75,65.722-32.171S686.986.8,686.986.8a153.187,153.187,0,0,1,38.147,10.571c14.176,6.148,26.84,15.873,39.525,27.115,30.794,27.288,45.5,71.468,45.5,71.468s9.651,29.988,11.49,77.212-4.137,111.683-4.137,111.683-6.318,55.668-19.3,102.49a493.594,493.594,0,0,1-32.631,84.795s-18.614,39.411-39.525,70.779a405.081,405.081,0,0,1-44.122,54.692s-27.422,31.341-63.423,55.611-80.585,41.467-80.585,41.467S485.3,728.491,435.4,731.986c-5.991.42-11.938.6-17.774.6A338.879,338.879,0,0,1,338.307,722.666ZM314.576,609.313c-44.581-5.86-99.733-28.035-99.733-28.035s-38.261-15.857-68.48-38.147-52.394-51.016-52.394-51.016-19.533-26.081-34.93-52.854a517.864,517.864,0,0,1-26.657-54.232A416.944,416.944,0,0,1,11.93,324.591C3.946,292.363.44,256.112.44,256.112S-1.627,218.77,3.2,188.092A214.723,214.723,0,0,1,19.744,133.4S31,104.79,53.754,85.6s56.991-28.955,56.991-28.955,33.78-7.238,69.4,0S253.219,85.6,253.219,85.6s21.6,13.673,50.1,38.605,57.449,55.152,57.449,55.152a97.174,97.174,0,0,0,21.6,15.627c12.868,6.778,24.932,5.056,31.712,13.787s-1.264,21.027-11.95,22.521c-3.976.556-10.893,2.127-17.464-2.759-10.044-7.463-19.878-28.724-21.143-23.438-.844,3.53,3.88,11.068,9.367,23.438,2.454,5.53,8.141,23.245,9.477,32.627,4.021,28.258,2.547,35.684,1.143,50.046-.839,8.574-8.041,9.848-12.551,3.219-2.58-3.789-4.346-17.38-4.346-17.38s-1.086-15.127-4.506-25.908-7.844-18.747-9.654-17.057,2.413,23.815,2.413,23.815,4.064,15.871,4.829,28.564,1.529,21.18-3.38,23.171-12.39,0-14.483-15.205a251.5,251.5,0,0,0-9.816-43.288c-4.344-13.316-7.6-12.531-7.886-4.424-.111,3.21,1.53,7.523,3.219,16.735s2.576,13.6,2.576,13.6,3.66,15.448,3.219,23.574-2.777,16.354-6.92,14.806-9.656-21-9.656-21-3.66-19.331-8.69-30.977-10.9-18.345-11.586-13.518,6.276,25.908,6.276,25.908,5.028,16.133,5.31,27.2.241,16.091-4.183,17.057-7.041-4.043-12.391-14.8c-2.253-4.53-8.207-28.241-8.207-28.241l-9.977-30.332s-21.514-52.856-48.484-80.02-41.1-27.881-65.758-25.808c-14.548,1.223-29.274,17.781-35,41.718-3.819,15.958-6.364,44.978,5.3,93.236s41.364,99.794,41.364,99.794,24.887,42.159,63.283,71.769,90.3,46.667,90.3,46.667,35.152,8.927,67.022,8.484S451.607,512.3,451.607,512.3s54.329-11.233,95.1-45.005,67.985-90.08,67.985-90.08.114,49.751-18.384,90.08S540.7,538.534,540.7,538.534s-31.712,29.644-66.641,47.339-73.076,23.44-73.076,23.44a352.862,352.862,0,0,1-44.19,2.6A326.932,326.932,0,0,1,314.576,609.313Z";

  // Updated function to get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckIcon color="success" fontSize="small" />;
      case 'CompletedByParent':
        return <CompletedByParentIcon color="success" fontSize="small" />;
      case 'InProgress':
        return <EditIcon color="primary" fontSize="small" />;
      case 'SentToParent':
        return <EmailIcon color="info" fontSize="small" />;
      case 'NotStarted':
      default:
        return <PendingIcon color="disabled" fontSize="small" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'CompletedByParent':
        return 'success';
      case 'InProgress':
        return 'primary';
      case 'SentToParent':
        return 'info';
      case 'NotStarted':
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'Completed':
        return 'הושלם';
      case 'CompletedByParent':
        return 'הושלם ע"י הורים';
      case 'InProgress':
        return 'בתהליך';
      case 'SentToParent':
        return 'נשלח להורים';
      case 'NotStarted':
      default:
        return 'לא התחיל';
    }
  };

  return (
    <IntegratedContainer>
      <LogoArea>
        <LogoWrapper>
          {/* The gray logo (background) */}
          <LogoOutline
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 824.009 734.597"
          >
            <path
              d={logoPath}
              transform="translate(1.003 1.007)"
              fill="#f5f5f5"
              stroke="#e0e0e0"
              strokeWidth="2"
            />
          </LogoOutline>

          {/* The colorful logo (fills up) */}
          <LogoFill
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 824.009 734.597"
            progress={progress}
          >
            <defs>
              <linearGradient
                id="logoGradient"
                x1="100%"
                y1="100%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#3F5AA7" />
                <stop offset="25%" stopColor="#3E5BA1" />
                <stop offset="50%" stopColor="#71C8DD" />
                <stop offset="75%" stopColor="#8BCCC6" />
                <stop offset="100%" stopColor="#73BFB5" />
              </linearGradient>
              <filter
                id="logoGlow"
                x="-20%"
                y="-20%"
                width="140%"
                height="140%"
              >
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <path
              d={logoPath}
              transform="translate(1.003 1.007)"
              fill="url(#logoGradient)"
              stroke="#4A8897"
              strokeWidth="2"
              filter="url(#logoGlow)"
            />
          </LogoFill>

          {/* Display progress percentage */}
          <ProgressText>{progress}%</ProgressText>

          {/* Kid's name if available */}
          {kidName && <KidName>{kidName}</KidName>}
        </LogoWrapper>
      </LogoArea>

      {/* Updated forms summary */}
      {showFormsSummary && onboardingData && (
        <FormsSummary elevation={3}>
          {compact ? (
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                התקדמות קליטה
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {onboardingData.completedForms} מתוך {onboardingData.totalForms}{" "}
                טפסים הושלמו
              </Typography>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ mt: 1, height: 8, borderRadius: 4 }}
              />
            </Box>
          ) : (
            <>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ textAlign: "center", mb: 3 }}
              >
                סטטוס טפסי הקליטה
              </Typography>

              <Grid
                container
                spacing={2}
                justifyContent="center"
              >
                {onboardingData.forms?.map((form, index) => (
                  <Grid item size={{xs:12 , sm:6 , md:4 }}  key={form.formId}>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        textAlign: "center",
                        height: "100%",
                        minHeight: 100,
                        width: '180px',
                        maxWidth: 2000,
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: "white",
                        border: "1px solid",
                        borderColor: "grey.200",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "primary.main",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1,
                        }}
                      >
                        {getStatusIcon(form.status)}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography
                            variant="body1"
                            fontWeight="medium"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {form.formName}
                          </Typography>
                          {form.status === "InProgress" &&
                            form.totalQuestions > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {form.answeredQuestions}/{form.totalQuestions}{" "}
                                שאלות
                              </Typography>
                            )}
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", justifyContent: "center" }}>
                        <Chip
                          size="small"
                          label={getStatusText(form.status)}
                          color={getStatusColor(form.status)}
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>

            </>
          )}
        </FormsSummary>
      )}
    </IntegratedContainer>
  );
};

export default ProgressLogo;