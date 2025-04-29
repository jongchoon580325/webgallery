import { useState } from 'react';
import Image from 'next/image';
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { deletePhoto } from '@/db/utils';

interface ImageCardProps {
  id: string;
  src: string;
  thumbnail?: string;
  date: string;
  location?: string;
  onDelete: () => void;
}

export default function ImageCard({ id, src, thumbnail, date, location, onDelete }: ImageCardProps) {
  const [showDeleteIcon, setShowDeleteIcon] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const handleDelete = async () => {
    try {
      await deletePhoto(Number(id));
      onDelete();
      setOpenDialog(false);
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  return (
    <div 
      className="relative group"
      onMouseEnter={() => setShowDeleteIcon(true)}
      onMouseLeave={() => setShowDeleteIcon(false)}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg">
        <Image
          src={thumbnail || src}
          alt={`Photo from ${date}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-2 left-2 right-2 text-white text-sm">
            <div>{new Date(date).toLocaleDateString()}</div>
            {location && <div>{location}</div>}
          </div>
        </div>
        {showDeleteIcon && (
          <IconButton
            className="absolute top-2 right-2 bg-black/30 hover:bg-black/50"
            onClick={() => setOpenDialog(true)}
            size="small"
          >
            <DeleteIcon className="text-white" />
          </IconButton>
        )}
      </div>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>이미지 삭제 확인</DialogTitle>
        <DialogContent>
          이 이미지를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            삭제
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
} 