'use client';

import React from 'react';
import { Container, Typography, Box, Divider } from '@mui/material';

export default function ManagementPage() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{
            color: theme => theme.palette.mode === 'light' ? '#202421' : 'inherit',
            fontWeight: 'bold'
          }}
        >
          사진 관리
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          사진을 업로드하고 카테고리를 관리하세요
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      
      {/* 관리 페이지 컨텐츠는 추후 구현 */}
      <Typography variant="body1" color="text.secondary" align="center">
        관리 페이지 컨텐츠가 곧 추가될 예정입니다.
      </Typography>
    </Container>
  );
} 