// 이미지 포맷 및 품질 설정
const IMAGE_CONFIG = {
  thumbnail: {
    maxWidth: 400,
    quality: 0.92,
    filter: 'contrast(1.1) saturate(1.1)'
  },
  original: {
    standardWidth: 2048,
    quality: {
      webp: 0.95,
      jpeg: 0.92
    },
    filter: {
      standard: 'contrast(1.05) saturate(1.02)',
      large: 'contrast(1.03) saturate(1.01)'
    }
  }
};

// 썸네일 최적화
export function optimizeImageThumbnail(file: File, maxWidth = IMAGE_CONFIG.thumbnail.maxWidth): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 종횡비 유지하면서 리사이즈
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
        
        // 이미지 렌더링 품질 향상 설정
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 선명도 향상을 위한 샤프닝 효과
          ctx.filter = IMAGE_CONFIG.thumbnail.filter;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        // WebP 포맷 지원 확인 및 적용
        const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        
        resolve(canvas.toDataURL(
          isWebPSupported ? 'image/webp' : 'image/jpeg',
          IMAGE_CONFIG.thumbnail.quality
        ));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// 원본 이미지 최적화
export function optimizeOriginalImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    const reader = new FileReader();
    
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // 원본 해상도 유지
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // 고품질 렌더링 설정
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          
          // 이미지 크기에 따른 최적 필터 적용
          ctx.filter = img.width <= IMAGE_CONFIG.original.standardWidth
            ? IMAGE_CONFIG.original.filter.standard
            : IMAGE_CONFIG.original.filter.large;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        }
        
        // 최적의 포맷 선택 및 적용
        const isWebPSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
        const format = isWebPSupported ? 'image/webp' : 'image/jpeg';
        const quality = isWebPSupported 
          ? IMAGE_CONFIG.original.quality.webp 
          : IMAGE_CONFIG.original.quality.jpeg;
        
        resolve(canvas.toDataURL(format, quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// 이미지 포맷 지원 여부 확인
export function checkWebPSupport(): boolean {
  const canvas = document.createElement('canvas');
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
} 