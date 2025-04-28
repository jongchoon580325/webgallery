import React from 'react';
import { TextField } from '@mui/material';

interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  margin?: 'none' | 'dense' | 'normal';
}

const FormInput: React.FC<FormInputProps> = ({ label, value, onChange, type = 'text', error = false, helperText = '', required = false, fullWidth = true, margin = 'normal' }) => (
  <TextField
    label={label}
    value={value}
    onChange={e => onChange(e.target.value)}
    type={type}
    error={error}
    helperText={helperText}
    required={required}
    fullWidth={fullWidth}
    margin={margin}
  />
);

export default FormInput; 