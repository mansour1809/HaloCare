// src/components/kids/IntakeActionButtons.jsx
import React from 'react';
import { Box, Button, Tooltip, IconButton } from '@mui/material';
import {
  PlayCircleFilled as ContinueIcon,
  Visibility as ViewIcon,
  Email as RemindIcon,
  Edit as EditIcon,
  Pause as PauseIcon,
  PlayArrow as ResumeIcon
} from '@mui/icons-material';

const IntakeActionButtons = ({ 
  kidId, 
  status, 
  onAction, 
  compact = false 
}) => {
  const getActionButtons = (status) => {
    switch (status) {
      case 'IN_PROGRESS': // ברירת המחדל החדשה
        return [
          {
            action: 'continue',
            label: 'המשך קליטה',
            icon: <ContinueIcon />,
            color: 'primary',
            variant: 'contained'
          },
          {
            action: 'pause',
            label: 'השהה',
            icon: <PauseIcon />,
            color: 'warning',
            variant: 'outlined'
          }
        ];
      
      case 'PENDING_PARENTS':
        return [
          {
            action: 'remind',
            label: 'שלח תזכורת',
            icon: <RemindIcon />,
            color: 'info',
            variant: 'contained'
          },
          {
            action: 'fill-instead',
            label: 'מלא במקום ההורים',
            icon: <EditIcon />,
            color: 'secondary',
            variant: 'outlined'
          }
        ];
      
      case 'COMPLETED':
        return [
          {
            action: 'view',
            label: 'צפה בתיק',
            icon: <ViewIcon />,
            color: 'success',
            variant: 'contained'
          },
          {
            action: 'edit',
            label: 'ערוך פרטים',
            icon: <EditIcon />,
            color: 'primary',
            variant: 'outlined'
          }
        ];
      
      case 'PAUSED':
        return [
          {
            action: 'resume',
            label: 'המשך תהליך',
            icon: <ResumeIcon />,
            color: 'primary',
            variant: 'contained'
          }
        ];
      
      default:
        return [
          {
            action: 'continue',
            label: 'המשך קליטה',
            icon: <ContinueIcon />,
            color: 'primary',
            variant: 'contained'
          }
        ];
    }
  };

  const buttons = getActionButtons(status);

  if (compact) {
    return (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {buttons.map((button, index) => (
          <Tooltip key={index} title={button.label}>
            <IconButton
              size="small"
              onClick={() => onAction(button.action, kidId)}
              sx={{
                backgroundColor: `${button.color}.main`,
                color: 'white',
                '&:hover': {
                  backgroundColor: `${button.color}.dark`,
                }
              }}
            >
              {button.icon}
            </IconButton>
          </Tooltip>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {buttons.map((button, index) => (
        <Button
          key={index}
          variant={button.variant}
          color={button.color}
          size="small"
          startIcon={button.icon}
          onClick={() => onAction(button.action, kidId)}
          sx={{
            minWidth: 'auto',
            whiteSpace: 'nowrap'
          }}
        >
          {button.label}
        </Button>
      ))}
    </Box>
  );
};

export default IntakeActionButtons;