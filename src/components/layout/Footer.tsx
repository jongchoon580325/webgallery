import React from 'react';
import { Box, Typography, Container } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.05)',
      }}
    >
      <Container maxWidth="sm">
        <Typography 
          variant="body2" 
          color={theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary'} 
          align="center"
        >
          Smart Gallery - Built by Najongchoon | Contact: najongchoon@gmail.com
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 