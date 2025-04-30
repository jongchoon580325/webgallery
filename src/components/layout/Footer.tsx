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
          Smart Gallery - Built by Najongchoon | Contact: 
          <a 
            href="mailto:najongchoon@gmail.com" 
            style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}
          >
            najongchoon@gmail.com
          </a>
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer; 