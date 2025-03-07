import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Snackbar, Alert, Typography } from '@mui/material'; 
import { Button } from '@/app/components/button';
import PasswordField from '../../login/components/password-field';
import React, { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';

interface ResetPasswordDialogProps {
  open: boolean;
  onClose: () => void;
  onReset: (password: string) => void;
}

export function ResetPasswordDialog({ open, onClose, onReset }: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState('');
  // const [openSnackbar, setOpenSnackbar] = useState(false);
  // const [snackbarMessage, setSnackbarMessage] = useState('');

  // useEffect(() => {
  //   if (open) {
  //     setNewPassword('');
  //   }
  // }, [open]);

  // const handleSave = () => {
  //   if (validatePassword(newPassword)) {
  //     onSave(newPassword);
  //     onClose();
  //   }
  // };
  const handleConfirm = () => {
    onClose();
    onReset(newPassword);
  };


  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle sx={{ fontWeight: 700 }}>
          Đặt lại mật khẩu
          <IconButton
            aria-label='close'
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography>Bạn có muốn đặt lại mật khẩu?</Typography>
        </DialogContent>
        <DialogActions sx={{paddingRight:'20px', paddingBottom:'16px'}}>
          <Button onClick={onClose} variant='outlined'>Không</Button>
          <Button onClick={handleConfirm} color="primary">Có</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
