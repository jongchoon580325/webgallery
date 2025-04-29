import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AppBar, Toolbar, Typography, Button, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';

interface NavbarProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ darkMode, toggleDarkMode }) => {
  const pathname = usePathname();

  return (
    <AppBar position="static">
      <Toolbar sx={{ justifyContent: 'space-between', gap: 2 }}>
        <Link href="/" passHref style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              cursor: 'pointer',
              '&:hover': {
                transform: 'scale(1.05)',
                transition: 'transform 0.2s ease-in-out',
              }
            }}
          >
            Smart Gallery
          </Typography>
        </Link>
        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}>
          <Link href="/" passHref>
            <Button 
              color="inherit"
              size="large"
              sx={{ 
                fontSize: '1.2rem',
                fontWeight: pathname === '/' ? 'bold' : 'normal',
                position: 'relative',
                overflow: 'hidden',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                },
                '&:hover::before': {
                  animation: 'firework1 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '&:hover::after': {
                  animation: 'firework2 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                },
                '@keyframes firework1': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'translate(-50%, -50%) scale(15)',
                    opacity: 0.5,
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(30)',
                    opacity: 0,
                  }
                },
                '@keyframes firework2': {
                  '0%': {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 0,
                  },
                  '50%': {
                    transform: 'translate(-50%, -50%) scale(20)',
                    opacity: 0.4,
                  },
                  '100%': {
                    transform: 'translate(-50%, -50%) scale(35)',
                    opacity: 0,
                  }
                }
              }}
            >
              홈
            </Button>
          </Link>
          <Link href="/gallery" passHref>
            <Button 
              color="inherit"
              size="large"
              sx={{ 
                fontSize: '1.2rem',
                fontWeight: pathname === '/gallery' ? 'bold' : 'normal',
                position: 'relative',
                overflow: 'hidden',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                },
                '&:hover::before': {
                  animation: 'firework1 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '&:hover::after': {
                  animation: 'firework2 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                },
              }}
            >
              갤러리
            </Button>
          </Link>
          <Link href="/management" passHref>
            <Button 
              color="inherit"
              size="large"
              sx={{ 
                fontSize: '1.2rem',
                fontWeight: pathname === '/management' ? 'bold' : 'normal',
                position: 'relative',
                overflow: 'hidden',
                '&::before, &::after': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0,
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 50%, transparent 100%)',
                },
                '&:hover::before': {
                  animation: 'firework1 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                '&:hover::after': {
                  animation: 'firework2 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s',
                },
              }}
            >
              관리
            </Button>
          </Link>
        </Box>
        <IconButton color="inherit" onClick={toggleDarkMode}>
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 