import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import React from 'react';
import theme from './theme';

interface ButtonProps extends MuiButtonProps {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "error" | "secondary";
  customVariants?: "text-primary";
}

export function Button({ children, variant = "contained", color = "primary", customVariants, ...rest }: ButtonProps) {
  return (
    <MuiButton 
      data-variant={customVariants}
      variant={variant}
      color={color} 
      {...rest} 
      sx={{
        fontSize: '14px',
        textTransform:'none',
        '&.MuiButton-contained': {
          backgroundColor: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          color: color === "error" ? '#fff' : undefined,
          '&:disabled': {
            backgroundColor: theme.palette.secondary.light,
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
          },
        },
        '&.MuiButton-outlined': {
          color: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          borderColor: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
          '&:hover': {
            backgroundColor: color === "error" ? theme.palette.error.light : theme.palette.primary.light,
          },
        },
        '&.MuiButton-text': {
          
          color: color === "error" ? theme.palette.error.main : theme.palette.secondary.main,
          '&:hover': {
            color: color === "error" ? theme.palette.error.main : theme.palette.primary.main,
            backgroundColor: color === "error" ? theme.palette.error.light : theme.palette.primary.light,
          },
        },
        '&[data-variant="text-primary"]': { 
          fontWeight: 600,
          color: color === "error" ? theme.palette.error.main : theme.palette.primary.main, 
          backgroundColor: 'transparent',
          '&:hover': {
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.primary.light,
          },
          boxShadow: 'none',
        },
      }}
    >
      {children}
    </MuiButton>
  );
}
