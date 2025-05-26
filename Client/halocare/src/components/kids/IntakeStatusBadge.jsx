// src/components/kids/IntakeStatusBadge.jsx
import React from 'react';
import { Chip, Tooltip, Box } from '@mui/material';
import { 
  NotStarted as NotStartedIcon,
  PlayArrow as PlayArrowIcon,
  Mail as MailIcon,
  CheckCircle as CheckCircleIcon,
  Pause as PauseIcon
} from '@mui/icons-material';

const IntakeStatusBadge = ({ status = 'IN_PROGRESS', percentage = 20, showPercentage = true }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'IN_PROGRESS': // ברירת המחדל החדשה
        return {
          label: showPercentage ? `בתהליך (${percentage}%)` : 'בתהליך',
          color: '#ff9800',
          backgroundColor: '#fff3e0',
          icon: <PlayArrowIcon sx={{ fontSize: 16 }} />,
          tooltip: `תהליך הקליטה בעיצומו - הושלמו ${percentage}% מהשלבים`
        };
      
      case 'NOT_STARTED':
        return {
          label: 'לא התחיל',
          color: '#f44336',
          backgroundColor: '#ffebee',
          icon: <NotStartedIcon sx={{ fontSize: 16 }} />,
          tooltip: 'תהליך הקליטה עדיין לא התחיל'
        };
      case 'PENDING_PARENTS':
        return {
          label: 'אצל הורים',
          color: '#2196f3',
          backgroundColor: '#e3f2fd',
          icon: <MailIcon sx={{ fontSize: 16 }} />,
          tooltip: 'טפסים נשלחו להורים ומחכים למילוי'
        };
      case 'COMPLETED':
        return {
          label: 'הושלם',
          color: '#4caf50',
          backgroundColor: '#e8f5e8',
          icon: <CheckCircleIcon sx={{ fontSize: 16 }} />,
          tooltip: 'תהליך הקליטה הושלם במלואו'
        };
      case 'PAUSED':
        return {
          label: 'מושהה',
          color: '#9e9e9e',
          backgroundColor: '#f5f5f5',
          icon: <PauseIcon sx={{ fontSize: 16 }} />,
          tooltip: 'תהליך הקליטה הושהה זמנית'
        };
      default:
        return {
          label: 'לא ידוע',
          color: '#9e9e9e',
          backgroundColor: '#f5f5f5',
          icon: null,
          tooltip: 'סטטוס לא ידוע'
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Tooltip title={config.tooltip} arrow>
      <Chip
        label={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {config.icon}
            {config.label}
          </Box>
        }
        sx={{
          color: config.color,
          backgroundColor: config.backgroundColor,
          fontWeight: 600,
          fontSize: '0.75rem',
          border: `1px solid ${config.color}20`,
          '& .MuiChip-label': {
            px: 1
          }
        }}
        size="small"
      />
    </Tooltip>
  );
};

export default IntakeStatusBadge;