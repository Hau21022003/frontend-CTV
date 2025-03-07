//useAlert.ts
import { useState } from 'react';

interface AlertState {
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
}

const useAlert = () => {
    const [alert, setAlert] = useState<AlertState>({
        message: '',
        severity: 'error',
        visible: false,
    });

    const showAlert = (message: string, severity: 'success' | 'error' | 'warning' | 'info') => {
        setAlert({ message, severity, visible: true });
        setTimeout(() => {
            setAlert((prev) => ({ ...prev, visible: false }));
        }, 2000); // Adjust the duration as needed
    };

    const handleCloseAlert = () => {
        setAlert((prev) => ({ ...prev, visible: false }));
    };

    return {
        alert,
        showAlert,
        handleCloseAlert,
    };
};

export default useAlert;
