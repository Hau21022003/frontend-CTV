//login-form.tsx
import {
  Avatar,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import ResetPassword from "@/app/(pages)/login/components/forgot-password";
import { Button } from "../../../components/button";
import theme from "../../../components/theme";
import TextField from "../../../components/text-field";
import PasswordField from "@/app/(pages)/login/components/password-field";
import useLoginHandlers from "@/app/hooks/useLoginHandlers";
// import { Department} from '@/app/(pages)/department/types/department';
import {
  Department,
  Departments,
  DepartmentsResponse,
} from "@/app/(pages)/department/types/department";
import { fetchDepartments } from "@/app/services/department/department-service";
import router, { useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { useAppContext } from "@/app/hooks/AppContext";
import ProgressOverlay from "@/app/components/progress-Overlay";
import { useResetPasswordEmail } from "@/app/hooks/forgotHandlers";
interface ForgotPasswordFormProps {
  onClose: () => void;
}
const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onClose }) => {
  const {
    email,
    emailError,
    alert,
    countdown,
    handleEmailChange,
    handleSendRequest,
    isLoading,
  } = useResetPasswordEmail(onClose);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const handleBack = () => {
    //setShowResetPassword(true);
    router.push("/login");
  };
  const router = useRouter();

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
      <form className="space-y-3 ">
        <div className="flex-1 rounded-xl bg-white px-6 pb-6 pt-4 shadow-2xl">
          <div className="flex flex-col items-center">
            <Typography className="mb-3 text-2xl font-bold">
              Quên mật khẩu
            </Typography>
            <Typography className="mb-3 text-base text-[#6A6A81] text-center">
              Nhập email của bạn và chúng tôi sẽ gửi cho bạn hướng dẫn đặt lại
              mật khẩu
            </Typography>
          </div>
          <div className="w-full">
            <div>
              <div className="relative">
                <TextField
                  label="Địa chỉ email"
                  value={email}
                  onChange={handleEmailChange}
                  error={emailError}
                  type="email"
                  maxLength={50}
                  required
                />
                {/* Giữ chiều cao cố định để tránh thay đổi layout */}
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ minHeight: "20px", display: "block", pl: 1 }}
                >
                  {emailError ? "Email không hợp lệ" : ""}
                </Typography>
                <Button
                  onClick={handleSendRequest}
                  variant="contained"
                  className="my-4 w-full"
                  disabled={countdown > 0 || isLoading}
                  fullWidth
                >
                  Gửi yêu cầu
                </Button>
                <Button variant="text" className="w-full" onClick={handleBack}>
                  Trở về
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ProgressOverlay isLoading={isLoading} />
    </>
  );
};

export default ForgotPasswordForm;
