import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  scrollY: number;
}

export default function HeroSection({ scrollY }: HeroSectionProps) {
  return (
    <Box
      sx={{
        height: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #000428 0%, #004e92 100%)',
      }}
    >
      {/* Parallax Stars Background */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          transform: `translateY(${scrollY * 0.5}px)`,
          transition: 'transform 0.1s ease-out',
          '&::before': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(white, rgba(255,255,255,.2) 2px, transparent 40px)',
            backgroundSize: '550px 550px',
            opacity: 0.3,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(white, rgba(255,255,255,.15) 1px, transparent 30px)',
            backgroundSize: '350px 350px',
            opacity: 0.3,
          }
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 800,
              color: 'white',
              textAlign: 'center',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 3
            }}
          >
            Smart Gallery
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Typography
            variant="h4"
            sx={{
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              color: 'rgba(255,255,255,0.9)',
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            당신의 소중한 순간을 더욱 아름답게 보관하고 관리하세요
          </Typography>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <Box
            sx={{
              width: '30px',
              height: '50px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderRadius: '15px',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                width: '6px',
                height: '6px',
                backgroundColor: 'white',
                left: '50%',
                transform: 'translateX(-50%)',
                top: '8px',
                borderRadius: '50%',
              }
            }}
          />
        </motion.div>
      </Container>
    </Box>
  );
} 