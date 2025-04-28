import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DB_NAME, DB_VERSION, STORE_NAMES, Photo, Category, DEFAULT_CATEGORIES } from '../schema';

interface SmartGalleryDB extends DBSchema {
  photos: {
    key: number;
    value: Photo;
    indexes: { 'by-category': number };
  };
  categories: {
    key: number;
    value: Category;
    indexes: { 'by-name': string };
  };
  thumbnails: {
    key: number;
    value: import('../schema').Thumbnail;
    indexes: { 'by-photoId': number };
  };
}

let db: IDBPDatabase<SmartGalleryDB> | null = null;
let dbInitPromise: Promise<IDBPDatabase<SmartGalleryDB>> | null = null;

export const initDB = async () => {
  if (db) return db;
  
  // 이미 초기화가 진행 중이라면 해당 Promise를 반환
  if (dbInitPromise) return dbInitPromise;

  try {
    dbInitPromise = openDB<SmartGalleryDB>(DB_NAME, DB_VERSION, {
      upgrade(database) {
        // Photos store가 없을 경우에만 생성
        if (!database.objectStoreNames.contains(STORE_NAMES.PHOTOS)) {
          const photoStore = database.createObjectStore(STORE_NAMES.PHOTOS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          photoStore.createIndex('by-category', 'categoryId');
        }

        // Categories store가 없을 경우에만 생성
        if (!database.objectStoreNames.contains(STORE_NAMES.CATEGORIES)) {
          const categoryStore = database.createObjectStore(STORE_NAMES.CATEGORIES, {
            keyPath: 'id',
            autoIncrement: true,
          });
          categoryStore.createIndex('by-name', 'name');

          // Add default categories
          DEFAULT_CATEGORIES.forEach((category) => {
            categoryStore.add({
              ...category,
              creationDate: new Date().toISOString(),
            });
          });
        }

        // Thumbnails store가 없을 경우에만 생성
        if (!database.objectStoreNames.contains(STORE_NAMES.THUMBNAILS)) {
          const thumbStore = database.createObjectStore(STORE_NAMES.THUMBNAILS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          thumbStore.createIndex('by-photoId', 'photoId');
        }
      },
      blocked() {
        console.warn('Database upgrade was blocked');
      },
      blocking() {
        console.warn('Database is blocking an upgrade');
        db?.close();
      },
      terminated() {
        console.error('Database connection was terminated');
        db = null;
        dbInitPromise = null;
      },
    });

    db = await dbInitPromise;
    return db;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    db = null;
    dbInitPromise = null;
    throw error;
  }
};

export const getDB = async () => {
  try {
    if (!db) {
      await initDB();
    }
    return db!;
  } catch (error) {
    console.error('Failed to get database connection:', error);
    throw error;
  }
};

export const addPhoto = async (photo: Omit<Photo, 'id'>) => {
  const database = await getDB();
  return database.add(STORE_NAMES.PHOTOS, photo);
};

export const getPhoto = async (id: number) => {
  const database = await getDB();
  return database.get(STORE_NAMES.PHOTOS, id);
};

export const getAllPhotos = async () => {
  const database = await getDB();
  return database.getAll(STORE_NAMES.PHOTOS);
};

export const getPhotosByCategory = async (categoryId: number) => {
  const database = await getDB();
  const index = database.transaction(STORE_NAMES.PHOTOS).store.index('by-category');
  return index.getAll(categoryId);
};

export const updatePhoto = async (photo: Photo) => {
  const database = await getDB();
  return database.put(STORE_NAMES.PHOTOS, photo);
};

export const deletePhoto = async (id: number) => {
  const database = await getDB();
  return database.delete(STORE_NAMES.PHOTOS, id);
};

export const addCategory = async (category: Omit<Category, 'id'>) => {
  const database = await getDB();
  return database.add(STORE_NAMES.CATEGORIES, category);
};

export const getCategory = async (id: number) => {
  const database = await getDB();
  return database.get(STORE_NAMES.CATEGORIES, id);
};

export const getAllCategories = async () => {
  const database = await getDB();
  return database.getAll(STORE_NAMES.CATEGORIES);
};

export const updateCategory = async (category: Category) => {
  const database = await getDB();
  return database.put(STORE_NAMES.CATEGORIES, category);
};

export const deleteCategory = async (id: number) => {
  const database = await getDB();
  return database.delete(STORE_NAMES.CATEGORIES, id);
};

export const addThumbnail = async (thumbnail: Omit<import('../schema').Thumbnail, 'id'>) => {
  const database = await getDB();
  return database.add(STORE_NAMES.THUMBNAILS, thumbnail);
};

export const getThumbnailByPhotoId = async (photoId: number) => {
  const database = await getDB();
  const index = database.transaction(STORE_NAMES.THUMBNAILS).store.index('by-photoId');
  return index.get(photoId);
};

// DB 연결 종료 함수 추가
export const closeDB = () => {
  if (db) {
    db.close();
    db = null;
    dbInitPromise = null;
  }
};

// 트랜잭션 래퍼 함수 수정
export const withTransaction = async <T>(
  storeName: typeof STORE_NAMES[keyof typeof STORE_NAMES],
  mode: 'readonly' | 'readwrite',
  callback: (store: any) => Promise<T>
): Promise<T> => {
  const database = await getDB();
  const tx = database.transaction(storeName, mode);
  try {
    const result = await callback(tx.store);
    await tx.done;
    return result;
  } catch (error) {
    console.error(`Transaction failed for store ${storeName}:`, error);
    throw error;
  }
}; 