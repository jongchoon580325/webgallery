import React from 'react';
import { Pagination, Stack } from '@mui/material';

interface PaginationControlProps {
  count: number;
  page: number;
  onChange: (page: number) => void;
  color?: 'primary' | 'secondary';
  shape?: 'rounded' | 'circular';
}

const PaginationControl: React.FC<PaginationControlProps> = ({ count, page, onChange, color = 'primary', shape = 'rounded' }) => (
  <Stack alignItems="center" sx={{ mt: 4 }}>
    <Pagination
      count={count}
      page={page}
      onChange={(_, v) => onChange(v)}
      color={color}
      shape={shape}
    />
  </Stack>
);

export default PaginationControl; 