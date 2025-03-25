import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import { styled } from '@mui/system';

const FlowerContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: '20px'
});

const Petal = styled(Paper)(({ theme, color }) => ({
    width: 150,
    height: 80,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    borderRadius: '50px',
    backgroundColor: color,
    boxShadow: theme.shadows[3]
}));

const InfoBox = styled(Paper)({
    width: '250px',
    padding: '15px',
    marginLeft: '20px',
    textAlign: 'right'
});

const KidFile = () => {
    return (
        <FlowerContainer>
            <InfoBox>
                <Typography variant="h6" fontWeight="bold">לוח הודעות</Typography>
                <Typography>הודעה חדשה...</Typography>
            </InfoBox>
            <Box display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" fontWeight="bold">תיק ילד</Typography>
                <Box position="relative" width={300} height={300} mb={5}>
                    <Petal color="#7AC7D7" style={{ top: 0, left: '50%', transform: 'translateX(-50%)' }}>תזונה</Petal>
                    <Petal color="#8FD3C3" style={{ top: '25%', left: '85%', transform: 'translate(-50%, -50%)' }}>פיזיותרפיה</Petal>
                    <Petal color="#FF9F9F" style={{ top: '70%', left: '85%', transform: 'translate(-50%, -50%)' }}>רפואי</Petal>
                    <Petal color="#DDE16A" style={{ bottom: 0, left: '50%', transform: 'translateX(-50%)' }}>תחום</Petal>
                    <Petal color="#F4B183" style={{ top: '70%', left: '15%', transform: 'translate(-50%, -50%)' }}>ריפוי בעיסוק</Petal>
                    <Petal color="#CE93D8" style={{ top: '25%', left: '15%', transform: 'translate(-50%, -50%)' }}>טיפול רגשי</Petal>
                    <Box
                        sx={{
                            width: 100,
                            height: 100,
                            borderRadius: '50%',
                            backgroundColor: '#FFF',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            boxShadow: 3
                        }}
                    >
                        <Typography>תמונה</Typography>
                    </Box>
                </Box>
            </Box>
        </FlowerContainer>
    );
};

export default KidFile;
