import React, { useState, useEffect } from 'react';
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
  Divider
} from '@mui/material';
import {
  Assessment as StatsIcon,
  TrendingUp as TrendIcon,
  CheckCircle as ApprovedIcon,
  Schedule as PendingIcon,
  ExpandMore as ExpandIcon,
  ExpandLess as CollapseIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReportStatistics } from '../../Redux/features/tasheReportsSlice';

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
    return null; // לא מציג כלום אם אין נתונים או יש שגיאה
  }

  const approvalRate = statistics.totalReports > 0 
    ? (statistics.approvedReports / statistics.totalReports) * 100 
    : 0;

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ mb: 3, border: '2px solid', borderColor: 'primary.100' }}>
      <CardContent>
        {/* כותרת עם כפתור הרחבה */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StatsIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight="bold">
              סטטיסטיקות דוחות
            </Typography>
          </Box>
          <Tooltip title={expanded ? "כווץ" : "הרחב"}   PopperProps={{
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
  }}>
            <IconButton onClick={handleToggleExpanded} size="small">
              {expanded ? <CollapseIcon /> : <ExpandIcon />}
            </IconButton>
          </Tooltip>
        </Box>

        {/* סטטיסטיקות בסיסיות - תמיד מוצג */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {statistics.totalReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                סה"כ דוחות
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {statistics.approvedReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                מאושרים
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {statistics.pendingReports}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ממתינים
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={6} sm={3}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {approvalRate.toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                שיעור אישור
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* פס התקדמות אישורים */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              התקדמות אישורים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {statistics.approvedReports}/{statistics.totalReports}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={approvalRate} 
            sx={{ height: 8, borderRadius: 4 }}
            color="success"
          />
        </Box>

        {/* פרטים מורחבים */}
        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />
          
          {/* תאריך דוח אחרון */}
          {statistics.lastReportDate && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon sx={{ mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                דוח אחרון: {new Date(statistics.lastReportDate).toLocaleDateString('he-IL')}
              </Typography>
            </Box>
          )}

          {/* דוחות לפי חודש */}
          {statistics.reportsByMonth && statistics.reportsByMonth.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendIcon sx={{ mr: 1, fontSize: 16 }} />
                דוחות לפי חודש:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statistics.reportsByMonth.map((monthData, index) => (
                  <Chip
                    key={index}
                    label={`${monthData.month}: ${monthData.count}`}
                    size="small"
                    variant="outlined"
                    color="primary"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* סיכום טיפולים */}
          {statistics.treatmentTypesSummary && statistics.treatmentTypesSummary.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                התפלגות טיפולים בדוחות:
              </Typography>
              <Grid container spacing={1}>
                {statistics.treatmentTypesSummary.map((treatment, index) => (
                  <Grid item xs={6} sm={4} key={index}>
                    <Box 
                      sx={{ 
                        p: 1, 
                        border: '1px solid', 
                        borderColor: treatment.color || 'grey.300',
                        borderRadius: 1,
                        textAlign: 'center',
                        bgcolor: `${treatment.color || '#grey'}10`
                      }}
                    >
                      <Typography variant="body2" fontWeight="bold">
                        {treatment.count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {treatment.treatmentType}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default ReportsStatisticsWidget;