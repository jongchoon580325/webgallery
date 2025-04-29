import { openDB } from 'idb';

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

// DB 초기화 실행 및 기본 카테고리 복구
initDB()
  .then(() => restoreDefaultCategories())
  .catch(console.error); 