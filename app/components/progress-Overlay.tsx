// components/ProgressOverlay.tsx
"user client"
import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';
import { AppProvider } from '../hooks/AppContext';
import { AuthProvider } from '../hooks/AuthContext';

interface ProgressOverlayProps {
  isLoading: boolean;
}

const ProgressOverlay: React.FC<ProgressOverlayProps> = ({ isLoading }) => {
  return (
    <AuthProvider>
        <AppProvider>
        <Backdrop
                sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)',color: '#fff', zIndex: (theme) => theme.zIndex.modal + 1 }}
                open={isLoading}
                >
                <CircularProgress color="inherit" />
        </Backdrop>
        </AppProvider>
    </AuthProvider>
  );
};

export default ProgressOverlay;
