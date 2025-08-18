// src/components/kids/tabs/KidDocumentsTab.jsx - טאב מסמכים
import React from 'react';
import { Box } from '@mui/material';

// Import existing component
import KidDocumentManager from '../managment/KidDocumentManager';

const KidDocumentsTab = ({ selectedKid }) => {
  return (
    <Box>
      <KidDocumentManager
        kidId={selectedKid?.id}
        kidName={`${selectedKid?.firstName || ''} ${selectedKid?.lastName || ''}`.trim()}
        compact={false}
        showUpload={true}
        showStats={true}
        maxHeight="70vh"
      />
    </Box>
  );
};

export default KidDocumentsTab;