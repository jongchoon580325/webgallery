'use client';

import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

interface ClientLayoutProps {
  children: React.ReactNode;
}

const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  // 시스템의 다크모드 설정을 확인
  const prefersDarkMode = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-color-scheme: dark)').matches 
    : true;

  // 다크모드를 기본값으로 설정
  const [darkMode, setDarkMode] = React.useState(true);

  // 컴포넌트 마운트 시 시스템 설정 반영
  React.useEffect(() => {
    setDarkMode(true);
  }, []);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? 'dark' : 'light',
          background: {
            default: darkMode ? '#121212' : '#f5f5f5',
            paper: darkMode ? '#1e1e1e' : '#ffffff',
          },
        },
      }),
    [darkMode]
  );

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {children}
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default ClientLayout; 