//alert.tsx
import React from 'react';
import { Alert as MuiAlert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface CustomAlertProps {
    severity: 'success' | 'error' | 'warning' | 'info';
    message: string;
    visible: boolean;
    onClose: () => void;
}

const Alert: React.FC<CustomAlertProps> = ({ severity, message, visible, onClose }) => {
    if (!visible) return null; // Do not render if not visible

    return (
        <MuiAlert
            severity={severity}
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 10}}
            action={
                <IconButton
                    size="small"
                    aria-label="close"
                    color="inherit"
                    onClick={onClose}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            }
        >
            {message}
        </MuiAlert>
    );
};

export default Alert;
