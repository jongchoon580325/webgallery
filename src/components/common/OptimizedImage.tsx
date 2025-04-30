import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  className = '',
  width = 800,
  height = 600,
  priority = false
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div 
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-500">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onLoadingComplete={() => setIsLoaded(true)}
        onError={() => setError(true)}
        className={`transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ objectFit: 'cover' }}
      />
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-100 animate-pulse"
        />
      )}
    </div>
  );
} 