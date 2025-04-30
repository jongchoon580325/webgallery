'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Container, Typography, Box, Divider, Grid, Card, CardContent, CardMedia, Select, MenuItem, FormControl, InputLabel, Pagination, Stack, Modal, IconButton, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import {
  getAllPhotos,
  getAllCategories,
  getThumbnailByPhotoId,
} from '@/db/utils';
import OptimizedImage from '@/components/common/OptimizedImage';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

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
  const [dateFilter, setDateFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [ripple, setRipple] = useState<{ idx: number; x: number; y: number } | null>(null);
  const [modalRipple, setModalRipple] = useState<{ x: number; y: number } | null>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([{ id: 0, name: '전체' }]);
  const [selectedPhoto, setSelectedPhoto] = useState<any | null>(null);
  const [locations, setLocations] = useState<string[]>([]);

  // DB에서 사진/카테고리 fetch
  useEffect(() => {
    async function fetchPhotosWithThumbnails() {
      const data = await getAllPhotos();
      const photosWithThumb = await Promise.all(
        data.map(async (photo) => {
          if (typeof photo.id === 'number') {
            const thumb = await getThumbnailByPhotoId(photo.id);
            return { ...photo, thumbnailPath: thumb?.data || '' };
          }
          return { ...photo, thumbnailPath: '' };
        })
      );
      setPhotos(photosWithThumb);
      
      // 위치 목록 추출
      const uniqueLocations = Array.from(new Set(photosWithThumb.map(p => p.location).filter(Boolean)));
      setLocations(uniqueLocations.sort());
    }
    fetchPhotosWithThumbnails();

    getAllCategories().then(data =>
      setCategories([{ id: 0, name: '전체' }, ...data.map(c => ({ id: c.id, name: c.name }))])
    );
  }, []);

  // 필터링 로직
  const filtered = photos.filter(photo => {
    // 카테고리 필터
    if (category !== 0 && photo.categoryId !== category) return false;
    
    // 날짜 필터
    if (dateFilter && photo.date && !photo.date.includes(dateFilter)) return false;
    
    // 위치 필터
    if (locationFilter && photo.location !== locationFilter) return false;
    
    return true;
  });

  const paged = filtered.slice((page - 1) * PHOTOS_PER_PAGE, page * PHOTOS_PER_PAGE);
  const pageCount = Math.ceil(filtered.length / PHOTOS_PER_PAGE);

  // 필터 초기화 함수
  const resetFilters = () => {
    setCategory(0);
    setDateFilter('');
    setLocationFilter('');
    setPage(1);
  };

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

  const handleModalClose = () => {
    setSelectedPhoto(null);
  };

  // 이전/다음 이미지 이동 핸들러
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[prevIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
    const nextIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[nextIndex]);
  };

  // 키보드 네비게이션 추가
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPhoto) return;
      
      if (e.key === 'ArrowLeft') {
        const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
        const prevIndex = (currentIndex - 1 + photos.length) % photos.length;
        setSelectedPhoto(photos[prevIndex]);
      } else if (e.key === 'ArrowRight') {
        const currentIndex = photos.findIndex(photo => photo.id === selectedPhoto.id);
        const nextIndex = (currentIndex + 1) % photos.length;
        setSelectedPhoto(photos[nextIndex]);
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos]);

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

      {/* 필터 섹션 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" gutterBottom>필터</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
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
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              type="date"
              label="날짜"
              value={dateFilter}
              onChange={e => { setDateFilter(e.target.value); setPage(1); setExpandedIdx(null); }}
              InputLabelProps={{ 
                shrink: true,
                sx: {
                  color: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'inherit'
                }
              }}
              sx={{
                '& .MuiInputBase-root': {
                  '& .MuiInputBase-input[type="date"]::-webkit-calendar-picker-indicator': {
                    filter: theme => theme.palette.mode === 'dark' ? 'invert(1)' : 'none'
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>위치</InputLabel>
              <Select
                value={locationFilter}
                label="위치"
                onChange={e => { setLocationFilter(e.target.value); setPage(1); setExpandedIdx(null); }}
              >
                <MenuItem value="">전체</MenuItem>
                {locations.map(location => (
                  <MenuItem key={location} value={location}>{location}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* 필터 결과 및 초기화 버튼 */}
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {filtered.length}개의 사진이 검색되었습니다
          </Typography>
          {(category !== 0 || dateFilter || locationFilter) && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={resetFilters}
            >
              필터 초기화
            </Typography>
          )}
        </Box>
      </Box>

      <Grid container spacing={2} columns={{ xs: 2, sm: 4, md: 5 }}>
        {paged.map((photo, idx) => (
          <Grid item xs={1} sm={1} md={1} key={photo.id}>
            <Card
              sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', position: 'relative', cursor: 'pointer' }}
              onClick={() => setSelectedPhoto(photo)}
              onMouseMove={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setRipple({
                  idx,
                  x: e.clientX - rect.left,
                  y: e.clientY - rect.top,
                });
              }}
            >
              <OptimizedImage
                src={photo.thumbnailPath || photo.url || ''}
                alt={`Photo taken at ${photo.location}`}
                className="w-full h-64 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                width={400}
                height={256}
              />
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
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 overflow-y-auto" onClick={handleModalClose}>
          <div className="relative min-h-screen w-full flex items-center justify-center py-8" onClick={(e) => e.stopPropagation()}>
            <div className="relative max-w-7xl mx-auto px-4">
              {/* 닫기 버튼 */}
              <button
                className="fixed top-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 z-50"
                onClick={handleModalClose}
                style={{
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {/* 이전 버튼 */}
              <button
                className="fixed left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 z-50"
                onClick={handlePrevImage}
                style={{
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <ChevronLeftIcon className="h-8 w-8" />
              </button>

              {/* 다음 버튼 */}
              <button
                className="fixed right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full transition-all duration-200 transform hover:scale-110 z-50"
                onClick={handleNextImage}
                style={{
                  backdropFilter: 'blur(4px)',
                  WebkitBackdropFilter: 'blur(4px)',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <ChevronRightIcon className="h-8 w-8" />
              </button>

              {/* 이미지 컨테이너 */}
              <div className="relative">
                <OptimizedImage
                  src={selectedPhoto.originalPath}
                  alt={`Photo taken at ${selectedPhoto.location}`}
                  className="w-auto max-h-[85vh] mx-auto rounded-lg shadow-2xl"
                  priority={true}
                />
                
                {/* 이미지 정보 */}
                <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-3 rounded-lg backdrop-blur-sm">
                  <p className="text-lg font-semibold">{selectedPhoto.location}</p>
                  <p className="text-sm">{new Date(selectedPhoto.date).toLocaleDateString()}</p>
                  <p className="text-sm">Photo by: {selectedPhoto.photographer}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <ScrollToTopButton />
    </Container>
  );
} 