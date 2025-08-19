import  { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  IconButton,
  Collapse,
  Divider,
  styled,
  alpha,
  keyframes
} from '@mui/material';
import {
  Assessment as StatsIcon,
  TrendingUp as TrendIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportStatistics } from '../../../Redux/features/tasheReportsSlice';

// Animation keyframes
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% { background-position: -200% center; }
  100% { background-position: 200% center; }
`;

// Enhanced Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: 20,
  background: 'rgba(255, 255, 255, 0.95)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
  position: 'relative',
  overflow: 'hidden',
  animation: `${slideIn} 0.5s ease-out`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #4cb5c3, #ff7043, #10b981, #4cb5c3)',
    animation: `${shimmer} 3s ease infinite`,
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

const StatBox = styled(Box)(({ theme, color }) => ({
  textAlign: 'center',
  padding: theme.spacing(2),
  borderRadius: 16,
  background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.02)} 100%)`,
  border: `1px solid ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1)}`,
  position: 'relative',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: `0 8px 25px ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.15)}`,
    background: `linear-gradient(135deg, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.03)} 100%)`,
  }
}));

const AnimatedNumber = styled(Typography)(() => ({
  fontWeight: 'bold',
  background: 'linear-gradient(45deg, currentColor 30%, currentColor 90%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    animation: `${pulse} 0.5s ease`,
  }
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: 10,
  borderRadius: 20,
  backgroundColor: alpha(theme.palette.success.main, 0.1),
  '& .MuiLinearProgress-bar': {
    borderRadius: 20,
    background: 'linear-gradient(90deg, #4caf50, #66bb6a, #4caf50)',
    backgroundSize: '200% 100%',
    animation: `${shimmer} 2s ease infinite`,
  }
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 10,
  fontWeight: 600,
  backdropFilter: 'blur(10px)',
  background: 'linear-gradient(45deg, rgba(76, 181, 195, 0.1) 30%, rgba(255, 112, 67, 0.1) 90%)',
  border: '1px solid rgba(76, 181, 195, 0.2)',
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 4px 12px rgba(76, 181, 195, 0.2)',
    background: 'linear-gradient(45deg, rgba(76, 181, 195, 0.15) 30%, rgba(255, 112, 67, 0.15) 90%)',
  }
}));

const TreatmentBox = styled(Box)(({ theme, treatmentColor }) => ({
  padding: theme.spacing(1.5),
  border: '2px solid',
  borderColor: treatmentColor || theme.palette.grey[300],
  borderRadius: 12,
  textAlign: 'center',
  background: `linear-gradient(135deg, ${alpha(treatmentColor || '#grey', 0.1)} 0%, ${alpha(treatmentColor || '#grey', 0.05)} 100%)`,
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
    transform: 'translateY(-3px) scale(1.05)',
    boxShadow: `0 6px 20px ${alpha(treatmentColor || '#grey', 0.3)}`,
    borderColor: treatmentColor || theme.palette.grey[400],
    '&::before': {
      left: '100%',
    }
  }
}));

const AnimatedExpandButton = styled(IconButton)(({ theme }) => ({
  padding: 8,
  borderRadius: 10,
  background: 'rgba(255, 255, 255, 0.9)',
  border: '1px solid rgba(76, 181, 195, 0.2)',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  '&:hover': {
    transform: 'rotate(180deg)',
    background: 'linear-gradient(135deg, rgba(76, 181, 195, 0.1) 0%, rgba(255, 112, 67, 0.1) 100%)',
    borderColor: theme.palette.primary.main,
  }
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: theme.spacing(2, 0),
  background: 'linear-gradient(90deg, transparent, rgba(76, 181, 195, 0.3), transparent)',
  height: 2,
  border: 'none',
}));

const ReportsStatisticsWidget = ({ kidId, kidName }) => {
  const dispatch = useDispatch();
  const [expanded, setExpanded] = useState(false);
  const { statistics, error } = useSelector(state => state.tasheReports || {});

  useEffect(() => {
    if (kidId) {
      dispatch(fetchReportStatistics(kidId));
    }
  }, [kidId, dispatch]);

  if (!statistics || error) {
    return null; // Don't display anything if no data or error
  }

  const approvalRate = statistics.totalReports > 0 
    ? (statistics.approvedReports / statistics.totalReports) * 100 
    : 0;

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        {/* Header with expand button */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StatsIcon 
              sx={{ 
                mr: 1.5, 
                fontSize: 28,
                color: 'primary.main',
                filter: 'drop-shadow(0 2px 4px rgba(76, 181, 195, 0.3))',
                animation: `${pulse} 2s infinite`
              }} 
            />
            <Typography 
              variant="h6" 
              fontWeight="bold"
              sx={{
                background: 'linear-gradient(45deg, #4cb5c3 30%, #2a8a95 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              סטטיסטיקות דוחות
            </Typography>
          </Box>
          <Tooltip 
            title={expanded ? "כווץ" : "הרחב"}
            placement="top"
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
          >
            <AnimatedExpandButton onClick={handleToggleExpanded} size="small">
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </AnimatedExpandButton>
          </Tooltip>
        </Box>

        {/* Basic statistics - always displayed */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item size={{xs:6,sm:3}}>
            <StatBox color="primary">
              <AnimatedNumber variant="h4" color="primary.main">
                {statistics.totalReports}
              </AnimatedNumber>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                סה"כ דוחות
              </Typography>
            </StatBox>
          </Grid>

          <Grid item size={{xs:6,sm:3}}>
            <StatBox color="success">
              <AnimatedNumber variant="h4" color="success.main">
                {statistics.approvedReports}
              </AnimatedNumber>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                מאושרים
              </Typography>
            </StatBox>
          </Grid>

          <Grid item size={{xs:6,sm:3}}>
            <StatBox color="warning">
              <AnimatedNumber variant="h4" color="warning.main">
                {statistics.pendingReports}
              </AnimatedNumber>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                ממתינים
              </Typography>
            </StatBox>
          </Grid>

          <Grid item size={{xs:6,sm:3}}>
            <StatBox color="info">
              <AnimatedNumber variant="h4" color="info.main">
                {approvalRate.toFixed(0)}%
              </AnimatedNumber>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontWeight: 500 }}>
                שיעור אישור
              </Typography>
            </StatBox>
          </Grid>
        </Grid>

        {/* Approval progress bar */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              התקדמות אישורים
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 700,
                color: 'success.main',
                background: 'rgba(76, 175, 80, 0.1)',
                padding: '2px 10px',
                borderRadius: 10,
              }}
            >
              {statistics.approvedReports}/{statistics.totalReports}
            </Typography>
          </Box>
          <StyledLinearProgress 
            variant="determinate" 
            value={approvalRate}
            color="success"
          />
        </Box>

        {/* Expanded details */}
        <Collapse in={expanded}>
          <StyledDivider />
          
          {/* Last report date */}
          {statistics.lastReportDate && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              p: 1.5,
              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(3, 169, 244, 0.05) 100%)',
              borderRadius: 2,
              border: '1px solid rgba(33, 150, 243, 0.1)'
            }}>
              <CalendarIcon sx={{ 
                mr: 1.5, 
                color: 'info.main',
                filter: 'drop-shadow(0 2px 4px rgba(33, 150, 243, 0.3))'
              }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                דוח אחרון: 
                <Typography component="span" sx={{ fontWeight: 700, color: 'info.main', ml: 1 }}>
                  {new Date(statistics.lastReportDate).toLocaleDateString('he-IL')}
                </Typography>
              </Typography>
            </Box>
          )}

          {/* Reports by month */}
          {statistics.reportsByMonth && statistics.reportsByMonth.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle2" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  mb: 2,
                  fontWeight: 700,
                  color: 'primary.main'
                }}
              >
                <TrendIcon sx={{ mr: 1, fontSize: 20 }} />
                דוחות לפי חודש:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statistics.reportsByMonth.map((monthData, index) => (
                  <StyledChip
                    key={index}
                    label={`${monthData.month}: ${monthData.count}`}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}


        </Collapse>
      </CardContent>
    </StyledCard>
  );
};

export default ReportsStatisticsWidget;