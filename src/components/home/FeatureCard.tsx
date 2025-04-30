import React from 'react';
import { Paper, Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: string;
}

export default function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          height: '100%',
          borderRadius: 4,
          background: 'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography variant="h1" sx={{ fontSize: '4rem', mb: 2 }}>
            {icon}
          </Typography>
        </Box>
        <Typography
          variant="h5"
          component="h3"
          gutterBottom
          sx={{
            fontWeight: 700,
            textAlign: 'center',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            backgroundClip: 'text',
            textFillColor: 'transparent',
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            textAlign: 'center',
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      </Paper>
    </motion.div>
  );
} 