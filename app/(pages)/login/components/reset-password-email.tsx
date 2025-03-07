import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/text-field";
import { useResetPasswordEmail } from "../../../hooks/forgotHandlers";
import theme from "@/app/components/theme";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
interface ResetPasswordEmailProps {
  onClose: () => void;
}

const ResetPasswordEmail: React.FC<ResetPasswordEmailProps> = ({ onClose }) => {
  const {
    email,
    emailError,
    alert,
    countdown,
    handleEmailChange,
    handleSendRequest,
  } = useResetPasswordEmail(onClose);

  return (
    <>
      <Snackbar
        open={alert.visible}
        autoHideDuration={6000}
        onClose={alert.handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {/* Display Alert inside Snackbar */}
        <Alert severity={alert.severity} onClose={alert.handleClose}>
          {alert.message}
        </Alert>
      </Snackbar>
      <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle fontWeight={700} align="center">
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", left: 16, top: 8 }}
          >
            <ArrowBackIcon />
          </IconButton>
          Quên mật khẩu
        </DialogTitle>
        <DialogContent>
          <Typography
            variant="body2"
            sx={{ color: "gray", mb: 2, textAlign: "center" }}
          >
            Vui lòng nhập email đã đăng ký tài khoản
          </Typography>
          <TextField
            label="Email (*)"
            value={email}
            onChange={handleEmailChange}
            error={emailError}
            helperText={emailError ? "Email không hợp lệ" : ""}
            type="email"
            maxLength={50}
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handleSendRequest}
            variant="contained"
            className="mt-4 w-full"
            disabled={countdown > 0}
            fullWidth
          >
            Gửi yêu cầu
          </Button>

          {countdown > 0 && (
            <Typography
              variant="body2"
              sx={{ mt: 2, textAlign: "center", color: "black" }}
            >
              Gửi yêu cầu lần tiếp theo:
              <Typography
                component="span"
                sx={{ color: theme.palette.primary.main }}
              >
                {countdown}s
              </Typography>
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Typography variant="body2" sx={{ mr: 1 }}>
            Bạn đã có tài khoản?
          </Typography>
          <Button onClick={onClose} variant="text">
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResetPasswordEmail;
