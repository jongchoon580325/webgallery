'use client';

import { openDB } from 'idb';
import JSZip from 'jszip';
// streamsaver는 동적으로 임포트하여 사용

const DB_NAME = 'photo-gallery-db';
const DB_VERSION = 2;

// 기본 카테고리 정의
const defaultCategories = [
  { id: 1, name: '가족', creationDate: new Date().toISOString() },
  { id: 2, name: '인물', creationDate: new Date().toISOString() },
  { id: 3, name: '풍경', creationDate: new Date().toISOString() },
  { id: 4, name: '꽃', creationDate: new Date().toISOString() },
  { id: 5, name: '식물', creationDate: new Date().toISOString() },
  { id: 6, name: '조류', creationDate: new Date().toISOString() },
  { id: 7, name: '기타', creationDate: new Date().toISOString() },
];

// DB 초기화
async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion) {
      // 기존 카테고리 스토어가 있다면 삭제
      if (db.objectStoreNames.contains('categories')) {
        db.deleteObjectStore('categories');
      }
      
      // 카테고리 스토어 재생성
      const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
      categoryStore.createIndex('name', 'name', { unique: false });  // unique 제약 해제
      
      // 기본 카테고리 추가
      defaultCategories.forEach(category => {
        categoryStore.put(category);
      });
      
      // 사진 스토어
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        photoStore.createIndex('categoryId', 'categoryId');
        photoStore.createIndex('date', 'date');
      }

      // 썸네일 스토어
      if (!db.objectStoreNames.contains('thumbnails')) {
        db.createObjectStore('thumbnails', { keyPath: 'photoId' });
      }
    },
  });
  return db;
}

// 기본 카테고리 복구 함수
export async function restoreDefaultCategories() {
  const db = await openDB(DB_NAME);
  const tx = db.transaction('categories', 'readwrite');
  const store = tx.objectStore('categories');
  
  // 현재 카테고리 확인
  const existingCategories = await store.getAll();
  
  // 기본 카테고리 중 없는 것들만 추가
  for (const category of defaultCategories) {
    const exists = existingCategories.some(c => c.id === category.id);
    if (!exists) {
      await store.put(category);
    }
  }
  
  await tx.done;
}

// 카테고리 관련 함수들
export async function getAllCategories() {
  const db = await openDB(DB_NAME);
  return db.getAll('categories');
}

export async function addCategory(category: { name: string; creationDate: string }) {
  const db = await openDB(DB_NAME);
  return db.add('categories', category);
}

export async function updateCategory(category: { id: number; name: string; creationDate: string }) {
  const db = await openDB(DB_NAME);
  return db.put('categories', category);
}

export async function deleteCategory(id: number) {
  const db = await openDB(DB_NAME);
  return db.delete('categories', id);
}

// 사진 관련 함수들
export async function getAllPhotos() {
  const db = await openDB(DB_NAME);
  const photos = await db.getAll('photos');
  
  // 썸네일 데이터 가져오기
  for (const photo of photos) {
    const thumbnail = await db.get('thumbnails', photo.id);
    if (thumbnail) {
      photo.thumbnailPath = thumbnail.data;
    }
  }
  
  return photos;
}

export async function addPhoto(photo: {
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  date: string;
  location: string;
  photographer: string;
  categoryId: number;
  uploadDate: string;
}) {
  const db = await openDB(DB_NAME);
  return db.add('photos', photo);
}

export async function addThumbnail(thumbnail: { photoId: number; data: string }) {
  const db = await openDB(DB_NAME);
  return db.put('thumbnails', thumbnail);
}

// 썸네일 가져오기 함수
export async function getThumbnailByPhotoId(photoId: number) {
  const db = await openDB(DB_NAME);
  return db.get('thumbnails', photoId);
}

export async function deletePhoto(photoId: number) {
  const db = await openDB(DB_NAME);
  const tx = db.transaction(['photos', 'thumbnails'], 'readwrite');
  
  // Delete photo from photos store
  await tx.objectStore('photos').delete(photoId);
  // Delete thumbnail from thumbnails store
  await tx.objectStore('thumbnails').delete(photoId);
  
  await tx.done;
}

// 사진 DB 데이터 내보내기
export const exportPhotosData = async () => {
  const db = await openDB(DB_NAME, DB_VERSION);
  const photos = await db.getAll('photos');
  const jsonData = JSON.stringify(photos, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const currentDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd 형식
  const a = document.createElement('a');
  a.href = url;
  a.download = `SG-PhotoDB-Data_${currentDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 사진 DB 데이터 가져오기
export const importPhotosData = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const db = await openDB(DB_NAME, DB_VERSION);
        const tx = db.transaction('photos', 'readwrite');
        const store = tx.objectStore('photos');
        
        // 기존 데이터 삭제
        await store.clear();
        
        // 새 데이터 추가
        for (const photo of jsonData) {
          await store.add(photo);
        }
        
        await tx.done;
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsText(file);
  });
};

// 카테고리 데이터 내보내기
export const exportCategoriesData = async () => {
  const db = await openDB(DB_NAME, DB_VERSION);
  const categories = await db.getAll('categories');
  const jsonData = JSON.stringify(categories, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const currentDate = new Date().toISOString().split('T')[0]; // yyyy-mm-dd 형식
  const a = document.createElement('a');
  a.href = url;
  a.download = `SG-Categories_${currentDate}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// 카테고리 데이터 가져오기
export const importCategoriesData = async (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const db = await openDB(DB_NAME, DB_VERSION);
        const tx = db.transaction('categories', 'readwrite');
        const store = tx.objectStore('categories');
        
        // 기본 카테고리(id: 1-6)는 유지하고 나머지만 삭제
        const existingCategories = await store.getAll();
        for (const category of existingCategories) {
          if (category.id > 6) {
            await store.delete(category.id);
          }
        }
        
        // 새 데이터 추가 (기본 카테고리 제외)
        for (const category of jsonData) {
          if (category.id > 6) {
            await store.add(category);
          }
        }
        
        await tx.done;
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
    reader.readAsText(file);
  });
};

// 메타데이터 타입 정의
interface PhotoMetadata {
  id: number;
  filename: string;
  date: string;
  location: string;
  photographer: string;
  categoryId: number;
  uploadDate: string;
}

// 원본 사진 데이터 내보내기
export const exportOriginalPhotos = async (
  onProgress?: (progress: number) => void
): Promise<void> => {
  const CHUNK_SIZE = 10;
  const db = await openDB(DB_NAME, DB_VERSION);
  const photos = await db.getAll('photos');
  const totalPhotos = photos.length;
  
  if (totalPhotos === 0) {
    throw new Error('내보낼 사진이 없습니다.');
  }

  const zip = new JSZip();
  const currentDate = new Date().toISOString().split('T')[0];
  let processedCount = 0;

  // 메타데이터 추가
  const metadata: PhotoMetadata[] = photos.map(photo => ({
    id: photo.id!,
    filename: photo.filename,
    date: photo.date,
    location: photo.location,
    photographer: photo.photographer,
    categoryId: photo.categoryId,
    uploadDate: photo.uploadDate
  }));
  zip.file('metadata.json', JSON.stringify(metadata, null, 2));

  // 청크 단위로 처리
  for (let i = 0; i < totalPhotos; i += CHUNK_SIZE) {
    const chunk = photos.slice(i, i + CHUNK_SIZE);
    
    await Promise.all(chunk.map(async (photo) => {
      try {
        const base64Data = photo.originalPath.split(',')[1];
        const binaryData = atob(base64Data);
        const array = new Uint8Array(binaryData.length);
        for (let j = 0; j < binaryData.length; j++) {
          array[j] = binaryData.charCodeAt(j);
        }
        
        zip.file(photo.filename, array);
        
        processedCount++;
        if (onProgress) {
          onProgress((processedCount / totalPhotos) * 100);
        }
      } catch (error) {
        console.error(`Error processing photo ${photo.filename}:`, error);
      }
    }));
  }

  // ZIP 파일 생성 및 다운로드
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'STORE',
    streamFiles: true
  });

  // 브라우저 환경에서만 실행
  if (typeof window !== 'undefined') {
    const streamSaver = (await import('streamsaver')).default;
    const fileStream = streamSaver.createWriteStream(
      `SG-Photos-Original_${currentDate}.zip`
    );
    const readableStream = blob.stream();
    if (window.WritableStream && readableStream.pipeTo) {
      return readableStream.pipeTo(fileStream);
    }
  }
};

// 원본 사진 데이터 가져오기
export const importOriginalPhotos = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const zip = new JSZip();
    
    zip.loadAsync(file)
      .then(async (contents) => {
        try {
          // 메타데이터 읽기
          const metadataFile = contents.file('metadata.json');
          if (!metadataFile) {
            throw new Error('메타데이터 파일을 찾을 수 없습니다.');
          }
          
          const metadataText = await metadataFile.async('text');
          const metadata = JSON.parse(metadataText) as PhotoMetadata[];
          
          const db = await openDB(DB_NAME, DB_VERSION);
          let processedCount = 0;
          const totalFiles = Object.keys(contents.files).length - 1; // metadata.json 제외

          // 기존 데이터 삭제 (메타데이터 기준)
          const deleteTx = db.transaction(['photos', 'thumbnails'], 'readwrite');
          for (const meta of metadata) {
            await deleteTx.objectStore('photos').delete(meta.id);
            await deleteTx.objectStore('thumbnails').delete(meta.id);
          }
          await deleteTx.done;
          
          // 새 데이터 추가
          for (const [filename, file] of Object.entries(contents.files)) {
            if (filename === 'metadata.json') continue;
            
            const meta = metadata.find((m: PhotoMetadata) => m.filename === filename);
            if (!meta) continue;
            
            const blob = await file.async('blob');
            const reader = new FileReader();
            
            await new Promise((resolve, reject) => {
              reader.onload = async () => {
                try {
                  const originalPath = reader.result as string;
                  
                  // 원본 이미지로부터 썸네일 생성
                  const img = new Image();
                  img.src = originalPath;
                  await new Promise(resolve => { img.onload = resolve; });
                  
                  // 캔버스를 사용하여 썸네일 생성
                  const canvas = document.createElement('canvas');
                  const ctx = canvas.getContext('2d')!;
                  
                  // 썸네일 크기 계산 (최대 300px)
                  const maxSize = 300;
                  let width = img.width;
                  let height = img.height;
                  
                  if (width > height) {
                    if (width > maxSize) {
                      height *= maxSize / width;
                      width = maxSize;
                    }
                  } else {
                    if (height > maxSize) {
                      width *= maxSize / height;
                      height = maxSize;
                    }
                  }
                  
                  canvas.width = width;
                  canvas.height = height;
                  ctx.drawImage(img, 0, 0, width, height);
                  
                  const thumbnailPath = canvas.toDataURL('image/jpeg', 0.7);
                  
                  // 각 항목마다 새로운 트랜잭션 생성
                  const tx = db.transaction(['photos', 'thumbnails'], 'readwrite');
                  
                  // 사진 데이터 저장
                  await tx.objectStore('photos').put({
                    ...meta,
                    originalPath
                  });
                  
                  // 썸네일 저장
                  await tx.objectStore('thumbnails').put({
                    photoId: meta.id,
                    data: thumbnailPath
                  });
                  
                  // 트랜잭션 완료 대기
                  await tx.done;
                  
                  processedCount++;
                  if (onProgress) {
                    onProgress((processedCount / totalFiles) * 100);
                  }
                  
                  resolve(null);
                } catch (error) {
                  reject(error);
                }
              };
              reader.onerror = () => reject(new Error(`파일 읽기 실패: ${filename}`));
              reader.readAsDataURL(blob);
            });
          }
          
          resolve();
        } catch (error) {
          reject(error);
        }
      })
      .catch(error => {
        reject(new Error('ZIP 파일 처리 중 오류가 발생했습니다: ' + error.message));
      });
  });
};

// 전체 데이터 초기화 함수
export async function resetAllData() {
  const db = await openDB(DB_NAME, DB_VERSION);
  // 모든 사진/썸네일/카테고리 삭제
  await db.clear('photos');
  await db.clear('thumbnails');
  await db.clear('categories');
  // 기본 카테고리 복구
  for (const category of defaultCategories) {
    await db.add('categories', category);
  }
}

// DB 초기화 실행 및 기본 카테고리 복구
initDB()
  .then(() => restoreDefaultCategories())
  .catch(console.error); 