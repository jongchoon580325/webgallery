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

export const initDB = async () => {
  if (db) return db;

  db = await openDB<SmartGalleryDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      // Photos store
      const photoStore = database.createObjectStore(STORE_NAMES.PHOTOS, {
        keyPath: 'id',
        autoIncrement: true,
      });
      photoStore.createIndex('by-category', 'categoryId');

      // Categories store
      const categoryStore = database.createObjectStore(STORE_NAMES.CATEGORIES, {
        keyPath: 'id',
        autoIncrement: true,
      });
      categoryStore.createIndex('by-name', 'name');

      // Thumbnails store
      const thumbStore = database.createObjectStore(STORE_NAMES.THUMBNAILS, {
        keyPath: 'id',
        autoIncrement: true,
      });
      thumbStore.createIndex('by-photoId', 'photoId');

      // Add default categories
      DEFAULT_CATEGORIES.forEach((category) => {
        categoryStore.add({
          ...category,
          creationDate: new Date().toISOString(),
        });
      });
    },
  });

  return db;
};

export const getDB = async () => {
  if (!db) {
    await initDB();
  }
  return db!;
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