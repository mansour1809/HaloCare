import { Box, Typography, Paper, Grid } from '@mui/material';



const HomePage = () => {
    return (
        <Box sx={{ display: 'flex', height: '100vh', backgroundColor: '#f5f5f5' }}>
            
            {/* Main Content */}
            <Box sx={{ flexGrow: 1, p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">ברוכים הבאים, טלי</Typography>
                </Box>

                {/* Statistics */}
                <Grid container spacing={2}>
                    <Grid item xs={4}>
                        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid #0077C2' }}>
                            <Typography color="#0077C2">פעילויות/אירועים</Typography>
                            <Typography variant="h6" fontWeight="bold">4</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid green' }}>
                            <Typography color="green">נוכחות צוות</Typography>
                            <Typography variant="h6" fontWeight="bold">8/10</Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={4}>
                        <Paper elevation={3} sx={{ p: 2, textAlign: 'center', borderTop: '5px solid red' }}>
                            <Typography color="red">נוכחות ילדים</Typography>
                            <Typography variant="h6" fontWeight="bold">18/20</Typography>
                        </Paper>
                    </Grid>
                </Grid>

                    
                    Staff & Kids Section
                    <Paper elevation={3} sx={{ p: 2, width: '40%' }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>צוות וילדים</Typography>
                        <Grid container spacing={1}>
                            {/* Placeholder images for staff/kids */}
                            {[...Array(10)].map((_, index) => (
                                <Grid item xs={3} key={index}>
                                    <Paper sx={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#ccc' }} />
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Box>
            </Box>      
    );
};

export default HomePage;
