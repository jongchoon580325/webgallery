import React, { useEffect } from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

interface SuccessModalProps {
  open: boolean;
  message: string;
  onClose?: () => void;
}

export default function SuccessModal({ open, message, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose?.();
      }, 10000); // 10초 후 자동 닫힘
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          <CheckCircleIcon className="h-12 w-12 text-green-500" />
        </div>
        <p className="text-center text-gray-700 dark:text-gray-300 mb-6 whitespace-pre-line">
          {message}
        </p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
} 