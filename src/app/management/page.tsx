'use client';

import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Divider, Grid, TextField, Button, MenuItem, Paper, List, ListItem, ListItemText, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ScrollToTopButton from '@/components/ui/ScrollToTopButton';
import {
  getAllCategories,
  addCategory as dbAddCategory,
  updateCategory as dbUpdateCategory,
  deleteCategory as dbDeleteCategory,
  getAllPhotos,
  addPhoto as dbAddPhoto,
  addThumbnail as dbAddThumbnail
} from '@/db/utils';

const defaultCategories = [
  { id: 1, name: '가족' },
  { id: 2, name: '인물' },
  { id: 3, name: '풍경' },
  { id: 4, name: '식물' },
  { id: 5, name: '조류' },
  { id: 6, name: '기타' },
];

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

export default function ManagementPage() {
  // 카테고리 상태(임시)
  const [categories, setCategories] = useState(defaultCategories);
  const [newCategory, setNewCategory] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

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
    const cats = await getAllCategories();
    setCategories(cats.map(c => ({ id: c.id!, name: c.name })));
  };
  useEffect(() => {
    fetchCategories();
  }, []);

  // 업로드 핸들러
  const handleUpload = async () => {
    if (!form.date || !form.location || !form.photographer || !form.categoryId || form.files.length === 0) return;
    for (const file of form.files.slice(0, 10)) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        // 썸네일 생성
        const thumbnailBase64 = await resizeImage(file, 200);
        // 원본 사진 저장
        const photo = {
          filename: file.name,
          originalPath: base64,
          thumbnailPath: '', // 분리 저장
          date: form.date,
          location: form.location,
          photographer: form.photographer,
          categoryId: Number(form.categoryId),
          uploadDate: new Date().toISOString(),
        };
        const photoId = await dbAddPhoto(photo);
        // 썸네일 별도 저장
        await dbAddThumbnail({ photoId, data: thumbnailBase64 });
      };
      reader.readAsDataURL(file);
    }
    setForm({ date: '', location: '', photographer: '', categoryId: '', files: [] });
    alert('사진 업로드 완료!');
  };

  // 업로드 엔터키 지원
  const handleUploadKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleUpload();
  };

  // 카테고리 추가
  const handleAddCategory = async () => {
    const name = newCategory.trim();
    if (!name || categories.some(c => c.name === name)) return;
    const newCat = { name, creationDate: new Date().toISOString() };
    await dbAddCategory(newCat);
    setNewCategory('');
    fetchCategories(); // 직접 추가하지 않고 fetch로만 동기화
  };
  const handleAddCategoryKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddCategory();
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
              <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddCategory} type="button">
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
      <ScrollToTopButton />
    </Container>
  );
} 