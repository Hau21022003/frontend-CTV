import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Snackbar,
  Alert as MuiAlert,
  Box,
  Alert,
  IconButton,
} from "@mui/material";
import { Button } from "@/app/components/button";
import TextField from "@/app/components/text-field";
import { useResetPasswordSMS } from "../../../hooks/forgotHandlers";
import PasswordField from "@/app/(pages)/login/components/password-field";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
interface ResetPasswordSMSProps {
  onClose: () => void;
  showUpdatePasswordAlert: (message: string, severity: any) => void;
}

const ResetPasswordSMS: React.FC<ResetPasswordSMSProps> = ({
  onClose,
  showUpdatePasswordAlert,
}) => {
  const {
    phoneNumber,
    phoneError,
    otp,
    otpError,
    countdown,
    handleResetOtp,
    handlePhoneNumberChange,
    handleSendRequest,
    handleOtpChange,
    handleSubmitOtp,
    handleSummitNewPassword,
    errorMessage, // Get errorMessage from the hook
  } = useResetPasswordSMS(onClose);

  const [alertVisible, setAlertVisible] = useState(false);
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  
  // const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorMessageOtp, setErrorMessageOtp] = useState<string | null>(null);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const [snackSeverity, setSnackSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");

  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setNewPassword(value);
    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^.+-])[A-Za-z\d@$!%*?&#^.+-]{8,}$/;
    setNewPasswordError(!passwordValidation.test(value));
  };

  const handleConfirmNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConfirmNewPassword(value);
    setConfirmPasswordError(value !== newPassword);
  };

  const handleConfirmNewPassword = async () => {
    if (!newPasswordError && !confirmPasswordError) {
      let result = await handleSummitNewPassword(newPassword);
      if (result?.success) {
        setSnackMessage("Cập nhật mật khẩu thành công");
        setSnackSeverity("success");
        onClose();
      } else {
        setSnackMessage("Cập nhật mật khẩu thất bại");
        setSnackSeverity("error");
      }
    }
  };

  useEffect(() => {
    if (errorMessage) {
      setSnackMessage(errorMessage); // Set error message from hook
      setSnackSeverity("error"); // Show as error severity
    }
  }, [errorMessage]);

  const handleSendRequestClick = async () => {
    let result = await handleSendRequest();
    if (result.success) {
      setShowNewPasswordDialog(false);
      setShowOtpDialog(true);
    } else {
      setSnackMessage(result.message);
      setSnackSeverity("error");
    }
  };

  const handleSubmitOtpClick = async () => {
    let result = await handleSubmitOtp();
    if (result.success) {
      setShowNewPasswordDialog(true);
      setShowOtpDialog(false);
    } else {
      setSnackMessage(result.message);
      setSnackSeverity("error");
    }
  };

  return (
    <>
      <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle align="center" fontWeight={700}>
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
          <Typography variant="body2" color="gray" mb={2}>
            Nhập số điện thoại đăng ký tài khoản
          </Typography>

          <TextField
            label="Số điện thoại (*)"
            value={phoneNumber}
            onChange={handlePhoneNumberChange}
            error={phoneError}
            helperText={phoneError ? "Số điện thoại không hợp lệ" : undefined}
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handleSendRequestClick}
            variant="contained"
            fullWidth
          >
            Gửi yêu cầu
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Typography variant="body2">Đã có tài khoản?</Typography>
          <Button onClick={onClose} variant="text">
            Đăng nhập
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog
        open={showOtpDialog}
        onClose={() => setShowOtpDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle align="center" fontWeight={700}>
          Nhập mã xác thực
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography variant="body2" mb={1}>
            Mã xác thực OTP đã được gửi qua SĐT: {phoneNumber}
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            {otp.map((digit, index) => (
              <TextField
                label=""
                key={index}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                error={otpError}
                inputProps={{
                  maxLength: 1,
                  pattern: "[0-9]*",
                  inputMode: "numeric",
                }}
                sx={{ width: 40, mx: 0.5, textAlign: "center" }}
              />
            ))}
          </Box>
          <Button
            onClick={handleSubmitOtpClick}
            variant="contained"
            disabled={otpError}
          >
            Xác nhận
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => {
              setShowOtpDialog(false);
              handleResetOtp();
            }}
            variant="text"
          >
            Quay lại
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        open={showNewPasswordDialog}
        onClose={() => setShowNewPasswordDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle align="center" fontWeight={700}>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ position: "absolute", left: 16, top: 8 }}
          >
            <ArrowBackIcon />
          </IconButton>
          Tạo mật khẩu mới
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <PasswordField
            label="Mật khẩu mới (*)"
            value={newPassword}
            onChange={handleNewPasswordChange}
            error={newPasswordError}
            helperText={
              newPasswordError
                ? "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt."
                : undefined
            }
            fullWidth
          />
          <PasswordField
            label="Xác nhận mật khẩu mới (*)"
            value={confirmNewPassword}
            onChange={handleConfirmNewPasswordChange}
            error={confirmPasswordError}
            helperText={
              confirmPasswordError ? "Mật khẩu xác nhận không khớp." : undefined
            }
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            onClick={handleConfirmNewPassword}
            variant="contained"
            fullWidth
            disabled={newPasswordError || confirmPasswordError}
          >
            Hoàn thành
          </Button>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button
            onClick={() => setShowNewPasswordDialog(false)}
            variant="text"
          >
            Quay lại
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for success/error messages */}
      <Snackbar
        open={snackMessage !== null}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        autoHideDuration={6000}
        onClose={() => setSnackMessage(null)}
      >
        <Alert severity={snackSeverity} onClose={() => setSnackMessage(null)}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResetPasswordSMS;
