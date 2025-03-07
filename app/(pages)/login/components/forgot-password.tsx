import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography } from '@mui/material';
import ResetPasswordEmail from './reset-password-email';
import ResetPasswordSMS from './reset-password-sms';
import {Button} from '@/app/components/button'


interface ResetPasswordProps {
    onClose: () => void;
    showUpdatePasswordAlert: (message: string, severity: any) => void;
}

const ResetPassword: React.FC<ResetPasswordProps> = ({ onClose, showUpdatePasswordAlert }) => {
    const [showEmailPopup, setShowEmailPopup] = useState(false);
    const [showSMSPopup, setShowSMSPopup] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleEmailPopupOpen = () => {
        setShowEmailPopup(true);
        setIsDialogOpen(false);
    }
    const handleSMSPopupOpen = () => {
        setShowSMSPopup(true);
        setIsDialogOpen(false);
    }
    const handleCloseResetPassword = () => {
        onClose();
    }
    return (
        <>
            <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
                <DialogTitle textAlign="center" fontWeight={700}>Vui lòng chọn phương thức</DialogTitle>
                <DialogContent>
                    <Button variant="contained" fullWidth onClick={handleEmailPopupOpen}>
                        Gửi mã xác thực qua Email
                    </Button>
                    <Button variant="outlined" fullWidth onClick={handleSMSPopupOpen} style={{ marginTop: '16px' }}>
                        Gửi mã xác thực qua SMS
                    </Button>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center' }}>
                    <Typography variant="body2">Bạn đã có tài khoản?</Typography>
                    <Button onClick={onClose} variant="text">
                        Đăng nhập
                    </Button>
                </DialogActions>
            </Dialog>

            {showEmailPopup && <ResetPasswordEmail onClose={() => {
                setShowEmailPopup(false)
                handleCloseResetPassword();
            }} />}
            {showSMSPopup && <ResetPasswordSMS onClose={() => 
                {
                    setShowSMSPopup(false);
                    handleCloseResetPassword(); 
                }
            } 
            showUpdatePasswordAlert={showUpdatePasswordAlert}
            />}
            
        </>
    );
};
export default ResetPassword;

