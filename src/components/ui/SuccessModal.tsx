import React, { useEffect } from 'react';
import { Modal, Box, Typography, Fade } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { keyframes } from '@mui/system';

// 팝업 애니메이션 정의
const popIn = keyframes`
  0% {
    transform: scale(0.5);
    opacity: 0;
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
`;

interface SuccessModalProps {
  open: boolean;
  onClose: () => void;
  message: string;
  autoCloseDelay?: number; // 자동 닫힘 시간 (ms)
}

export default function SuccessModal({ 
  open, 
  onClose, 
  message, 
  autoCloseDelay = 3000  // 기본값 3초
}: SuccessModalProps) {
  // 자동 닫힘 타이머 설정
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (open) {
      timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [open, onClose, autoCloseDelay]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
    >
      <Fade in={open}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 300,
            bgcolor: 'background.paper',
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            p: 4,
            textAlign: 'center',
            animation: `${popIn} 0.5s ease-out`,
            '&:focus': {
              outline: 'none',
            },
          }}
        >
          <Box
            sx={{
              animation: `${bounce} 1s ease infinite`,
              display: 'inline-block',
              mb: 2,
            }}
          >
            <CheckCircleOutlineIcon
              sx={{
                fontSize: 60,
                color: 'success.main',
              }}
            />
          </Box>
          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: 1,
              fontWeight: 'bold',
              color: 'success.main',
            }}
          >
            성공!
          </Typography>
          <Typography
            sx={{
              color: 'text.secondary',
              fontSize: '1rem',
            }}
          >
            {message}
          </Typography>
        </Box>
      </Fade>
    </Modal>
  );
} 