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
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Smart Gallery
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Link href="/" passHref>
            <Button color="inherit" sx={{ fontWeight: pathname === '/' ? 'bold' : 'normal' }}>
              홈
            </Button>
          </Link>
          <Link href="/gallery" passHref>
            <Button color="inherit" sx={{ fontWeight: pathname === '/gallery' ? 'bold' : 'normal' }}>
              갤러리
            </Button>
          </Link>
          <Link href="/management" passHref>
            <Button color="inherit" sx={{ fontWeight: pathname === '/management' ? 'bold' : 'normal' }}>
              관리
            </Button>
          </Link>
          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 