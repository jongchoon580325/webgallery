'use client';

import React, { useState } from 'react';
import { Container, Typography, Box, Divider, Grid, Card, CardContent, CardMedia, Select, MenuItem, FormControl, InputLabel, Pagination, Stack } from '@mui/material';

const sampleCategories = [
  { id: 0, name: '전체' },
  { id: 1, name: '가족' },
  { id: 2, name: '인물' },
  { id: 3, name: '풍경' },
  { id: 4, name: '식물' },
  { id: 5, name: '조류' },
  { id: 6, name: '기타' },
];

const samplePhotos = Array.from({ length: 23 }).map((_, i) => ({
  id: i + 1,
  url: `https://picsum.photos/seed/${i + 1}/400/300`,
  date: `2025-04-${(i % 28 + 1).toString().padStart(2, '0')}`,
  location: '서울',
  categoryId: (i % 6) + 1,
}));

const PHOTOS_PER_PAGE = 20;

export default function GalleryPage() {
  const [category, setCategory] = useState(0);
  const [page, setPage] = useState(1);

  const filtered = category === 0 ? samplePhotos : samplePhotos.filter(p => p.categoryId === category);
  const paged = filtered.slice((page - 1) * PHOTOS_PER_PAGE, page * PHOTOS_PER_PAGE);
  const pageCount = Math.ceil(filtered.length / PHOTOS_PER_PAGE);

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ color: theme => theme.palette.mode === 'light' ? '#202421' : 'inherit', fontWeight: 'bold' }}
        >
          사진 갤러리
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          아름다운 사진들을 탐색하고 즐겨보세요
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">카테고리별로 사진을 필터링할 수 있습니다.</Typography>
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>카테고리</InputLabel>
          <Select
            value={category}
            label="카테고리"
            onChange={e => { setCategory(Number(e.target.value)); setPage(1); }}
          >
            {sampleCategories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2} columns={{ xs: 2, sm: 4, md: 5 }}>
        {paged.map(photo => (
          <Grid item xs={1} sm={1} md={1} key={photo.id}>
            <Card sx={{ borderRadius: 2, overflow: 'hidden', height: '100%' }}>
              <CardMedia
                component="img"
                height="140"
                image={photo.url}
                alt="gallery"
                sx={{ objectFit: 'cover', aspectRatio: '4/3' }}
              />
              <CardContent sx={{ p: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {photo.date} | {photo.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, v) => setPage(v)}
          color="primary"
          shape="rounded"
        />
      </Stack>
    </Container>
  );
} 