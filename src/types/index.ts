export interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  createdAt: string;
  location?: string;
  categoryId?: number;
  filename?: string;
  photographer?: string;
  uploadDate?: string;
} 