'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, Divider, Grid, TextField, Button, MenuItem, Paper, List, ListItem, ListItemText, IconButton, LinearProgress } from '@mui/material';
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
  restoreDefaultCategories,
  exportPhotosData,
  importPhotosData,
  exportCategoriesData,
  importCategoriesData,
  exportOriginalPhotos,
  importOriginalPhotos,
  resetAllData
} from '@/db/utils';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { optimizeImageThumbnail, optimizeOriginalImage } from '@/utils/imageOptimizer';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FolderZipIcon from '@mui/icons-material/FolderZip';

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

  // 파일 입력을 위한 ref 추가
  const photoDataFileRef = useRef<HTMLInputElement>(null);
  const categoryDataFileRef = useRef<HTMLInputElement>(null);

  // 진행률 상태 추가
  const [progress, setProgress] = useState<number | null>(null);
  const originalPhotosFileRef = useRef<HTMLInputElement>(null);

  // 데이터 초기화 관련 상태
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

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
        // 원본 이미지 최적화
        const originalBase64 = await optimizeOriginalImage(file);
        // 썸네일 생성
        const thumbnailBase64 = await optimizeImageThumbnail(file);
        
        // 변환된 이미지 크기 계산
        const base64Length = originalBase64.split(',')[1].length;
        const sizeInBytes = (base64Length * 3) / 4;
        totalSize += Number((sizeInBytes / (1024 * 1024)).toFixed(2));
        
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

  // 사진 DB 데이터 내보내기/가져오기 핸들러
  const handleExportPhotosData = () => {
    exportPhotosData();
  };

  const handleImportPhotosData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importPhotosData(file);
      setSuccessModal({
        open: true,
        message: '사진 DB 데이터를 성공적으로 가져왔습니다.'
      });
      // 파일 입력 초기화
      if (photoDataFileRef.current) {
        photoDataFileRef.current.value = '';
      }
    } catch (error) {
      console.error('사진 DB 데이터 가져오기 실패:', error);
      setSuccessModal({
        open: true,
        message: '사진 DB 데이터 가져오기에 실패했습니다.'
      });
    }
  };

  // 카테고리 데이터 내보내기/가져오기 핸들러
  const handleExportCategoriesData = () => {
    exportCategoriesData();
  };

  const handleImportCategoriesData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await importCategoriesData(file);
      await fetchCategories(); // 카테고리 목록 새로고침
      setSuccessModal({
        open: true,
        message: '카테고리 데이터를 성공적으로 가져왔습니다.'
      });
      // 파일 입력 초기화
      if (categoryDataFileRef.current) {
        categoryDataFileRef.current.value = '';
      }
    } catch (error) {
      console.error('카테고리 데이터 가져오기 실패:', error);
      setSuccessModal({
        open: true,
        message: '카테고리 데이터 가져오기에 실패했습니다.'
      });
    }
  };

  // 원본 사진 데이터 내보내기 핸들러
  const handleExportOriginalPhotos = async () => {
    try {
      setProgress(0);
      await exportOriginalPhotos((progress) => {
        setProgress(progress);
      });
      setSuccessModal({
        open: true,
        message: '원본 사진 데이터를 성공적으로 내보냈습니다.'
      });
    } catch (error) {
      console.error('원본 사진 데이터 내보내기 실패:', error);
      setSuccessModal({
        open: true,
        message: '원본 사진 데이터 내보내기에 실패했습니다.'
      });
    } finally {
      setProgress(null);
    }
  };

  // 원본 사진 데이터 가져오기 핸들러
  const handleImportOriginalPhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setProgress(0);
      await importOriginalPhotos(file, (progress) => {
        setProgress(progress);
      });
      setSuccessModal({
        open: true,
        message: '원본 사진 데이터를 성공적으로 가져왔습니다.'
      });
      // 파일 입력 초기화
      if (originalPhotosFileRef.current) {
        originalPhotosFileRef.current.value = '';
      }
    } catch (error) {
      console.error('원본 사진 데이터 가져오기 실패:', error);
      setSuccessModal({
        open: true,
        message: '원본 사진 데이터 가져오기에 실패했습니다.'
      });
    } finally {
      setProgress(null);
    }
  };

  // 데이터 초기화 핸들러
  const handleResetAllData = async () => {
    setResetLoading(true);
    try {
      await resetAllData();
      await fetchCategories();
      setSuccessModal({
        open: true,
        message: '모든 데이터가 초기화되었습니다. (원본 사진, DB, 카테고리)'
      });
    } catch (error) {
      setSuccessModal({
        open: true,
        message: '데이터 초기화 중 오류가 발생했습니다.'
      });
    } finally {
      setResetLoading(false);
      setResetDialogOpen(false);
    }
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
      <Divider sx={{ my: 4, borderStyle: 'dotted', borderWidth: '1px' }} />
      
      {/* 데이터 관리 섹션 */}
      <Grid container spacing={4}>
        {/* 사진 데이터 관리 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>사진 데이터 관리</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 원본 사진 데이터 관리 */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  사진 데이터 (원본)
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportOriginalPhotos}
                    sx={{ flex: 1 }}
                  >
                    내보내기
                  </Button>
                  <input
                    type="file"
                    accept=".zip"
                    style={{ display: 'none' }}
                    ref={originalPhotosFileRef}
                    onChange={handleImportOriginalPhotos}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileUploadIcon />}
                    onClick={() => originalPhotosFileRef.current?.click()}
                    sx={{ flex: 1 }}
                  >
                    가져오기
                  </Button>
                </Box>
                {progress !== null && (
                  <Box sx={{ width: '100%', mt: 2 }}>
                    <LinearProgress variant="determinate" value={progress} />
                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* 사진 DB 데이터 관리 */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  사진 DB 데이터
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportPhotosData}
                    sx={{ flex: 1 }}
                  >
                    내보내기
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    ref={photoDataFileRef}
                    onChange={handleImportPhotosData}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileUploadIcon />}
                    onClick={() => photoDataFileRef.current?.click()}
                    sx={{ flex: 1 }}
                  >
                    가져오기
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* 카테고리 데이터 관리 섹션 */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>카테고리 데이터 관리</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* 카테고리 데이터 관리 */}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium', color: 'text.secondary' }}>
                  카테고리 데이터
                </Typography>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileDownloadIcon />}
                    onClick={handleExportCategoriesData}
                    sx={{ flex: 1 }}
                  >
                    내보내기
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    ref={categoryDataFileRef}
                    onChange={handleImportCategoriesData}
                  />
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<FileUploadIcon />}
                    onClick={() => categoryDataFileRef.current?.click()}
                    sx={{ flex: 1 }}
                  >
                    가져오기
                  </Button>
                </Box>
              </Box>
              {/* 데이터 초기화 컴포넌트 - 내보내기/가져오기 아래에 위치 */}
              <Box sx={{ p: 2, bgcolor: 'rgba(255,0,0,0.04)', borderRadius: 2, border: '1px solid #f44336' }}>
                <Typography variant="h6" color="error" gutterBottom>데이터 초기화</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  모든 데이터가 초기화 되오니 <b>조심하여 주시기 바랍니다.</b>
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="large"
                  onClick={() => setResetDialogOpen(true)}
                  sx={{ fontWeight: 'bold', fontSize: 16 }}
                  disabled={resetLoading}
                >
                  데이터 초기화
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
      <SuccessModal
        open={successModal.open}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
        message={successModal.message}
      />
      <ScrollToTopButton />
      <Dialog 
        open={resetDialogOpen} 
        onClose={() => setResetDialogOpen(false)}
        PaperProps={{
          sx: {
            width: '400px',
            height: '400px',
            maxHeight: '400px',
            borderRadius: 2,
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }
        }}
      >
        <DialogTitle sx={{ 
          textAlign: 'center', 
          fontSize: '1.8rem', 
          fontWeight: 'bold',
          color: 'error.main',
          pb: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1
        }}>
          <WarningAmberIcon sx={{ fontSize: '2rem' }} />
          데이터 초기화 확인
        </DialogTitle>
        <DialogContent sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center'
        }}>
          <DeleteForeverIcon sx={{ 
            fontSize: '4rem', 
            color: 'error.main',
            mb: 2
          }} />
          <DialogContentText sx={{ 
            fontSize: '1.1rem',
            lineHeight: 1.8,
            fontWeight: 'medium'
          }}>
            이 작업은 <b>원본 사진, DB 데이터, 카테고리 데이터</b>를 모두 삭제하고 기본 카테고리만 복구합니다. 정말 초기화하시겠습니까?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          display: 'flex',
          justifyContent: 'center',
          gap: 2
        }}>
          <Button 
            onClick={() => setResetDialogOpen(false)} 
            disabled={resetLoading}
            variant="outlined"
            size="large"
            startIcon={<CancelIcon />}
            sx={{ 
              width: '120px',
              fontSize: '1.1rem'
            }}
          >
            취소
          </Button>
          <Button 
            onClick={handleResetAllData} 
            color="error" 
            disabled={resetLoading} 
            variant="contained"
            size="large"
            startIcon={<DeleteForeverIcon />}
            sx={{ 
              width: '120px',
              fontSize: '1.1rem'
            }}
          >
            {resetLoading ? '초기화 중...' : '초기화'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* 데이터 관리 안내 섹션 */}
      <Divider sx={{ my: 4, borderStyle: 'dotted', borderWidth: '2px' }} />
      <Paper sx={{ p: 4, mt: 4, mb: 8, bgcolor: 'background.paper', borderRadius: 3, boxShadow: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <InfoIcon color="primary" sx={{ fontSize: 32, mr: 1 }} />
          <Typography variant="h5" fontWeight="bold">데이터 관리 안내</Typography>
        </Box>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
          {/* 좌측: 내보내기 파일명 안내 */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
              내보내기 파일명 안내
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <FolderZipIcon color="action" />
              <Typography variant="body1" fontWeight="bold">사진 데이터(원본)</Typography>
              <Typography variant="body2" color="text.secondary">photos_original_yyyymmdd.zip</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
              <InsertDriveFileIcon color="action" />
              <Typography variant="body1" fontWeight="bold">사진 DB 데이터</Typography>
              <Typography variant="body2" color="text.secondary">photos_db_yyyymmdd.json</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InsertDriveFileIcon color="action" />
              <Typography variant="body1" fontWeight="bold">카테고리 데이터</Typography>
              <Typography variant="body2" color="text.secondary">categories_yyyymmdd.json</Typography>
            </Box>
          </Box>
          {/* 우측: 가져오기 순서 안내 */}
          <Box sx={{ flex: 1, borderLeft: { md: '1.5px dotted #bbb' }, pl: { md: 4 }, mt: { xs: 4, md: 0 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <WarningAmberIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                가져오기 순서 안내
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, ml: 4 }}>
              <b>성공 메시지 창이 보일 때까지 잠시 기다려 주세요.</b>
            </Typography>
            <Box sx={{ ml: 4 }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                1. <b>카테고리 데이터</b> (<span style={{ color: '#1976d2' }}>categories_yyyymmdd.json</span>)
              </Typography>
              <Typography variant="body1" sx={{ mb: 1 }}>
                2. <b>사진 DB 데이터</b> (<span style={{ color: '#1976d2' }}>photos_db_yyyymmdd.json</span>)
              </Typography>
              <Typography variant="body1">
                3. <b>사진 데이터(원본)</b> (<span style={{ color: '#1976d2' }}>photos_original_yyyymmdd.zip</span>)
              </Typography>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 