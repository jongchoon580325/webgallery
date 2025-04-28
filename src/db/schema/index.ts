export interface Photo {
  id?: number;
  filename: string;
  originalPath: string;
  thumbnailPath: string;
  date: string;
  location: string;
  photographer: string;
  categoryId: number;
  uploadDate: string;
}

export interface Category {
  id?: number;
  name: string;
  description?: string;
  creationDate: string;
}

export interface Thumbnail {
  id?: number;
  photoId: number; // 원본 사진 id 참조
  data: string; // base64 or blob url
}

export const DB_NAME = 'SmartGalleryDB';
export const DB_VERSION = 1;

export const STORE_NAMES = {
  PHOTOS: 'photos',
  CATEGORIES: 'categories',
  THUMBNAILS: 'thumbnails',
} as const;

export const DEFAULT_CATEGORIES = [
  { name: '가족', description: '가족 사진' },
  { name: '인물', description: '인물 사진' },
  { name: '풍경', description: '풍경 사진' },
  { name: '식물', description: '식물 사진' },
  { name: '조류', description: '조류 사진' },
  { name: '기타', description: '기타 사진' },
]; 