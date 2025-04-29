import { openDB } from 'idb';

const DB_NAME = 'photo-gallery-db';
const DB_VERSION = 1;

// DB 초기화
async function initDB() {
  const db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // 카테고리 스토어
      if (!db.objectStoreNames.contains('categories')) {
        const categoryStore = db.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        categoryStore.createIndex('name', 'name', { unique: true });
      }
      
      // 사진 스토어
      if (!db.objectStoreNames.contains('photos')) {
        const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
        photoStore.createIndex('categoryId', 'categoryId');
        photoStore.createIndex('date', 'date');
      }

      // 썸네일 스토어 (별도 저장)
      if (!db.objectStoreNames.contains('thumbnails')) {
        db.createObjectStore('thumbnails', { keyPath: 'photoId' });
      }
    },
  });
  return db;
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

export async function deletePhoto(photoId: number) {
  const db = await openDB();
  const tx = db.transaction(['photos', 'thumbnails'], 'readwrite');
  
  // Delete photo from photos store
  await tx.objectStore('photos').delete(photoId);
  // Delete thumbnail from thumbnails store
  await tx.objectStore('thumbnails').delete(photoId);
  
  await tx.done;
}

// DB 초기화 실행
initDB().catch(console.error); 