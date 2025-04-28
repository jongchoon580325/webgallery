import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface DropdownProps {
  label: string;
  value: string | number;
  options: { value: string | number; label: string }[];
  onChange: (value: string | number) => void;
  size?: 'small' | 'medium';
}

const Dropdown: React.FC<DropdownProps> = ({ label, value, options, onChange, size = 'medium' }) => (
  <FormControl fullWidth size={size}>
    <InputLabel>{label}</InputLabel>
    <Select
      value={value}
      label={label}
      onChange={e => onChange(e.target.value)}
    >
      {options.map(opt => (
        <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
      ))}
    </Select>
  </FormControl>
);

export default Dropdown; 