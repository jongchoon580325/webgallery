'use client';

import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { PhotoLibrary, Category, Settings, Speed } from '@mui/icons-material';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';

export default function Home() {
  const features = [
    {
      icon: <PhotoLibrary sx={{ fontSize: 40 }} />,
      title: '사진 탐색',
      description: '아름다운 그리드 레이아웃으로 사진을 탐색하고, 확장 보기로 자세히 살펴보세요.',
    },
    {
      icon: <Category sx={{ fontSize: 40 }} />,
      title: '카테고리 관리',
      description: '사진을 카테고리별로 정리하고, 쉽게 찾아볼 수 있습니다.',
    },
    {
      icon: <Settings sx={{ fontSize: 40 }} />,
      title: '관리 도구',
      description: '직관적인 인터페이스로 사진을 업로드하고 관리할 수 있습니다.',
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: '최적화된 성능',
      description: '빠른 로딩 속도와 부드러운 애니메이션으로 최적의 사용자 경험을 제공합니다.',
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            color: theme => theme.palette.mode === 'light' ? '#202421' : 'inherit',
            fontWeight: 'bold'
          }}
        >
          Smart Gallery
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          현대적인 웹 포토 갤러리 애플리케이션
        </Typography>
      </Box>

      <Grid container spacing={4} sx={{ mt: 2 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Box sx={{ mb: 2, color: 'primary.main' }}>{feature.icon}</Box>
                <Typography gutterBottom variant="h5" component="h2">
                  {feature.title}
                </Typography>
                <Typography color="text.secondary">{feature.description}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <ScrollToTopButton />
    </Container>
  );
}
