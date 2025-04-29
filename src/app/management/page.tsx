'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Divider, Grid, TextField, Button, MenuItem, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import SuccessModal from '@/components/ui/SuccessModal';
import {
  getAllCategories,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  getAllPhotos,
  addPhoto as dbAddPhoto,
  addThumbnail as dbAddThumbnail,
  restoreDefaultCategories
} from '@/db/utils';

// 기본 카테고리 상수로 정의
const defaultCategories = [
  { id: 1, name: '가족' },
  { id: 2, name: '인물' },
  { id: 3, name: '풍경' },
  { id: 4, name: '꽃' },
  { id: 5, name: '식물' },
  { id: 6, name: '조류' },
  { id: 7, name: '기타' },
];

// 카테고리 타입 정의
interface Category {
  id: number;
  name: string;
}

// 이미지 리사이즈(썸네일 생성) 함수
function resizeImage(file: File, maxWidth = 200): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const scale = maxWidth / img.width;
        const canvas = document.createElement('canvas');
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// 원본 이미지 리사이즈(압축) 함수
function resizeOriginalImage(file: File, maxWidth = 1920, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    if (file.size <= 2 * 1024 * 1024) { // 2MB 이하면 원본 유지
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.readAsDataURL(file);
      return;
    }
    const img = new window.Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        let targetWidth = img.width;
        let targetHeight = img.height;
        if (img.width > maxWidth) {
          const scale = maxWidth / img.width;
          targetWidth = maxWidth;
          targetHeight = img.height * scale;
        }
        const canvas = document.createElement('canvas');
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// 이미지 데이터 URL의 크기를 MB 단위로 계산하는 함수
function calculateImageSize(dataUrl: string): number {
  const base64Length = dataUrl.split(',')[1].length;
  const sizeInBytes = (base64Length * 3) / 4;
  return Number((sizeInBytes / (1024 * 1024)).toFixed(2));
}

export default function ManagementPage() {
  // 카테고리 상태 초기화를 빈 배열로 변경 (타입 명시)
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: '',
  });

  // 업로드 폼 상태(임시)
  const [form, setForm] = useState({
    date: '',
    location: '',
    photographer: '',
    categoryId: '',
    files: [] as File[],
  });

  // DB 연동: 카테고리 fetch
  const fetchCategories = async () => {
    try {
      await restoreDefaultCategories(); // 기본 카테고리 복구
      const cats = await getAllCategories();
      setCategories(cats.map(c => ({ id: c.id!, name: c.name })));
    } catch (error) {
      console.error('카테고리 로딩 중 오류:', error);
      setCategories(defaultCategories);
    }
  };

  // 컴포넌트 마운트 시 한 번만 실행
  useEffect(() => {
    fetchCategories();
  }, []);

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!form.date || !form.location || !form.photographer || !form.categoryId || form.files.length === 0) return;
    
    try {
      let totalSize = 0;
      for (const file of form.files.slice(0, 10)) {
        // 원본 이미지 리사이즈/압축
        const originalBase64 = await resizeOriginalImage(file, 1920, 0.8);
        // 썸네일 생성
        const thumbnailBase64 = await resizeImage(file, 200);
        
        // 변환된 이미지 크기 계산
        totalSize += calculateImageSize(originalBase64);
        
        // 원본 사진 저장
        const photo = {
          filename: file.name,
          originalPath: originalBase64,
          thumbnailPath: '', // 분리 저장
          date: form.date,
          location: form.location,
          photographer: form.photographer,
          categoryId: Number(form.categoryId),
          uploadDate: new Date().toISOString(),
        };
        const photoId = await dbAddPhoto(photo) as number;
        // 썸네일 별도 저장
        await dbAddThumbnail({ photoId, data: thumbnailBase64 });
      }
      setForm({ date: '', location: '', photographer: '', categoryId: '', files: [] });
      
      // 성공 모달 표시 (저장된 크기 정보 포함)
      setSuccessModal({
        open: true,
        message: `${form.files.length}장의 사진이 성공적으로 업로드되었습니다!\n(저장된 크기: ${totalSize.toFixed(2)}MB)`,
      });
    } catch (error) {
      console.error('사진 업로드 중 오류:', error);
      alert('사진 업로드 중 오류가 발생했습니다.');
    }
  };

  // 업로드 엔터키 지원
  const handleUploadKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUpload();
  };

  // 카테고리 추가
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name) return;
    
    try {
      const newCat = { name, creationDate: new Date().toISOString() };
      const newId = await dbAddCategory(newCat) as number;
      
      // 상태 업데이트 - 새 카테고리를 기존 목록에 추가
      setCategories(prevCategories => [...prevCategories, { id: newId, name }]);
      setNewCategory('');
    } catch (error) {
      console.error('카테고리 추가 중 오류:', error);
      alert('카테고리 추가 중 오류가 발생했습니다.');
    }
  };

  const handleAddCategoryKey = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // 이벤트 기본 동작 방지
      if (!e.repeat) { // 키 반복 입력 방지
        await handleAddCategory();
      }
    }
  };

  // 카테고리 수정
  const handleEditCategory = async (id: number) => {
    const name = editValue.trim();
    if (!name || categories.some(c => c.name === name && c.id !== id)) return;
    await dbUpdateCategory({ id, name, creationDate: new Date().toISOString() });
    setCategories(cats => cats.map(c => c.id === id ? { ...c, name } : c));
    setEditId(null);
    setEditValue('');
  };
  const handleEditCategoryKey = (e: React.KeyboardEvent, id: number) => {
    if (e.key === 'Enter') handleEditCategory(id);
  };

  // 카테고리 삭제
  const handleDeleteCategory = async (id: number) => {
    if (id <= 6) return alert('기본 카테고리는 삭제할 수 없습니다.');
    await dbDeleteCategory(id);
    setCategories(cats => cats.filter(c => c.id !== id));
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ color: theme => theme.palette.mode === 'light' ? '#202421' : 'inherit', fontWeight: 'bold' }}
        >
          사진 관리
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph>
          사진을 업로드하고 카테고리를 관리하세요
        </Typography>
        <Divider sx={{ my: 2 }} />
      </Box>
      <Grid container spacing={4}>
        {/* 사진 업로드 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>사진 업로드</Typography>
            <Box component="form" noValidate autoComplete="off" onSubmit={e => e.preventDefault()}>
              <TextField
                label="날짜"
                type="date"
                fullWidth
                margin="normal"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              />
              <TextField
                label="위치"
                fullWidth
                margin="normal"
                value={form.location}
                onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
              />
              <TextField
                label="사진작가"
                fullWidth
                margin="normal"
                value={form.photographer}
                onChange={e => setForm(f => ({ ...f, photographer: e.target.value }))}
              />
              <TextField
                select
                label="카테고리"
                fullWidth
                margin="normal"
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
              >
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </TextField>
              <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
                파일 업로드
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={e => setForm(f => ({ ...f, files: Array.from(e.target.files || []) }))}
                />
              </Button>
              <Box sx={{ mt: 1, fontSize: 14, color: 'text.secondary' }}>
                {form.files.length > 0 ? `${form.files.length}개 파일 선택됨` : '최대 10장, 이미지 파일만 업로드 가능'}
              </Box>
              <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }}
                onClick={handleUpload}
                disabled={!(form.date && form.location && form.photographer && form.categoryId && form.files.length > 0)}
                onKeyDown={handleUploadKey}
                type="button"
              >
                업로드
              </Button>
            </Box>
          </Paper>
        </Grid>
        {/* 카테고리 관리 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>카테고리 관리</Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                label="새 카테고리"
                size="small"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                fullWidth
                onKeyDown={handleAddCategoryKey}
              />
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />} 
                onClick={handleAddCategory} 
                type="button"
                sx={{ 
                  height: '40px',  // TextField의 기본 높이와 동일
                  minWidth: '140px', // 버튼의 최소 너비 증가
                  whiteSpace: 'nowrap', // 텍스트 줄바꿈 방지
                  flexShrink: 0 // 버튼 크기 고정
                }}
              >
                추가
              </Button>
            </Box>
            <List>
              {categories.map(cat => (
                <ListItem
                  key={cat.id}
                  secondaryAction={
                    editId === cat.id ? (
                      <>
                        <IconButton edge="end" aria-label="edit" color="primary" onClick={() => handleEditCategory(cat.id)}>
                          <EditIcon />
                        </IconButton>
                        {cat.id > 6 && (
                          <IconButton edge="end" aria-label="delete" color="error" onClick={() => handleDeleteCategory(cat.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    ) : (
                      <>
                        <IconButton edge="end" aria-label="edit" onClick={() => { setEditId(cat.id); setEditValue(cat.name); }}>
                          <EditIcon />
                        </IconButton>
                        {cat.id > 6 && (
                          <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteCategory(cat.id)}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </>
                    )
                  }
                >
                  {editId === cat.id ? (
                    <TextField
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      size="small"
                      onKeyDown={e => handleEditCategoryKey(e, cat.id)}
                      autoFocus
                      sx={{ width: 120 }}
                    />
                  ) : (
                    <ListItemText primary={cat.name} />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
        message={successModal.message}
      />
      <ScrollToTopButton />
    </Container>
  );
} 