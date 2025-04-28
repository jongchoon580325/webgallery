'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Box, Divider, Grid, Card, CardContent, CardMedia, Select, MenuItem, FormControl, InputLabel, Pagination, Stack, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import {
  getAllPhotos,
  getAllCategories,
} from '@/db/utils';

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
  url: `https://picsum.photos/seed/${i + 1}/800/600`,
  date: `2025-04-${(i % 28 + 1).toString().padStart(2, '0')}`,
  location: '서울',
  categoryId: (i % 6) + 1,
}));

const PHOTOS_PER_PAGE = 20;

export default function GalleryPage() {
  const [category, setCategory] = useState(0);
  const [page, setPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [ripple, setRipple] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [modalRipple, setModalRipple] = useState<{ x: number; y: number } | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: 0, name: '전체' }]);

  // DB에서 사진/카테고리 fetch
  useEffect(() => {
    getAllPhotos().then(data => setPhotos(data));
    getAllCategories().then(data => setCategories([{ id: 0, name: '전체' }, ...data.map(c => ({ id: c.id, name: c.name }))]));
  }, []);

  const filtered = category === 0 ? photos : photos.filter(p => p.categoryId === category);
  const paged = filtered.slice((page - 1) * PHOTOS_PER_PAGE, page * PHOTOS_PER_PAGE);
  const pageCount = Math.ceil(filtered.length / PHOTOS_PER_PAGE);

  // 확장 보기 모달 내비게이션
  const handlePrev = useCallback(() => {
    if (expandedIdx === null) return;
    setExpandedIdx(idx => (idx! - 1 + paged.length) % paged.length);
  }, [expandedIdx, paged.length]);

  const handleNext = useCallback(() => {
    if (expandedIdx === null) return;
    setExpandedIdx(idx => (idx! + 1) % paged.length);
  }, [expandedIdx, paged.length]);

  // 키보드 지원
  useEffect(() => {
    if (expandedIdx === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'Escape') setExpandedIdx(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [expandedIdx, handlePrev, handleNext]);

  // Ripple 애니메이션 종료 후 상태 초기화
  useEffect(() => {
    if (ripple) {
      const timeout = setTimeout(() => setRipple(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [ripple]);

  useEffect(() => {
    if (modalRipple) {
      const timeout = setTimeout(() => setModalRipple(null), 600);
      return () => clearTimeout(timeout);
    }
  }, [modalRipple]);

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
            onChange={e => { setCategory(Number(e.target.value)); setPage(1); setExpandedIdx(null); }}
          >
            {categories.map(cat => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Grid container spacing={2} columns={{ xs: 2, sm: 4, md: 5 }}>
        {paged.map((photo, idx) => (
          <Grid item xs={1} sm={1} md={1} key={photo.id}>
            <Card
              sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', position: 'relative', cursor: 'pointer' }}
              onClick={() => setExpandedIdx(idx)}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setRipple({
                  idx,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              {photo.thumbnailPath || photo.url ? (
                <CardMedia
                  component="img"
                  height="140"
                  image={photo.thumbnailPath || photo.url || ''}
                  alt="gallery"
                  sx={{ objectFit: 'cover', aspectRatio: '4/3', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.03)' } }}
                />
              ) : (
                <Box sx={{ width: '100%', height: 140, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', color: 'grey.400' }}>
                  이미지 없음
                </Box>
              )}
              {/* Ripple 효과 */}
              {ripple && ripple.idx === idx && (
                <Box
                  sx={{
                    pointerEvents: 'none',
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      left: ripple.x - 100,
                      top: ripple.y - 100,
                      width: 200,
                      height: 200,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.35)',
                      transform: 'scale(0)',
                      animation: 'ripple-wave 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
                      pointerEvents: 'none',
                    }}
                  />
                  <style>{`
                    @keyframes ripple-wave {
                      to {
                        transform: scale(2.5);
                        opacity: 0;
                      }
                    }
                  `}</style>
                </Box>
              )}
              {/* 메타데이터 오버레이 */}
              <Box sx={{
                position: 'absolute',
                left: 0,
                bottom: 0,
                width: '100%',
                bgcolor: 'rgba(0,0,0,0.5)',
                color: '#fff',
                px: 1,
                py: 0.5,
                fontSize: 12,
                letterSpacing: 0.5,
              }}>
                {photo.date} | {photo.location}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Stack alignItems="center" sx={{ mt: 4 }}>
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, v) => { setPage(v); setExpandedIdx(null); }}
          color="primary"
          shape="rounded"
        />
      </Stack>
      {/* 확장 보기 모달 */}
      <Modal open={expandedIdx !== null} onClose={() => setExpandedIdx(null)} sx={{ zIndex: 1300 }}>
        <Box sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          bgcolor: 'rgba(0,0,0,0.85)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {expandedIdx !== null && (
            <Box sx={{ position: 'relative', maxWidth: 800, width: '90vw', maxHeight: '90vh', bgcolor: 'background.paper', borderRadius: 2, boxShadow: 6, p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <IconButton onClick={() => setExpandedIdx(null)} sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}>
                <CloseIcon fontSize="large" />
              </IconButton>
              <img
                src={paged[expandedIdx].thumbnailPath || paged[expandedIdx].url || ''}
                alt="expanded"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxWidth: 800,
                  maxHeight: '70vh',
                  borderRadius: 8,
                  marginBottom: 16,
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'block',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.12)'
                }}
                onMouseMove={e => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setModalRipple({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
              />
              {/* 모달 ripple 효과 */}
              {modalRipple && (
                <span
                  style={{
                    position: 'absolute',
                    left: modalRipple.x - 120,
                    top: modalRipple.y - 120,
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.15)',
                    transform: 'scale(0)',
                    animation: 'ripple-wave-modal 0.6s cubic-bezier(0.4,0,0.2,1) forwards',
                    pointerEvents: 'none',
                    zIndex: 10,
                  }}
                />
              )}
              <style>{`
                @keyframes ripple-wave-modal {
                  to {
                    transform: scale(2.5);
                    opacity: 0;
                  }
                }
              `}</style>
              {/* 내비게이션 버튼 스타일 개선 */}
              <IconButton onClick={handlePrev} sx={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', background: 'rgba(0,0,0,0.25)', opacity: 1, zIndex: 2, '&:hover': { background: 'rgba(0,0,0,0.4)' } }}>
                <ArrowBackIosNewIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={handleNext} sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: '#fff', background: 'rgba(0,0,0,0.25)', opacity: 1, zIndex: 2, '&:hover': { background: 'rgba(0,0,0,0.4)' } }}>
                <ArrowForwardIosIcon fontSize="large" />
              </IconButton>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                {paged[expandedIdx].date} | {paged[expandedIdx].location}
              </Typography>
            </Box>
          )}
        </Box>
      </Modal>
      <ScrollToTopButton />
    </Container>
  );
} 