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
} from "@mui/material";
import Alert from "../../../components/alert";
import React, { useEffect, useState } from "react";
// import ResetPassword from "@/app/(pages)/login/components/forgot-password";
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
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/app/hooks/AuthContext";
import { useAppContext } from "@/app/hooks/AppContext";
import ProgressOverlay from "@/app/components/progress-Overlay";
import apiService from "@/app/untils/api";
export default function ResetPassword() {
  const {
    // departments,
    // selectedDepartment,
    username,
    password,
    rememberMe,
    alert,
    showPassword,
    handleCloseAlert,
    // handleDepartmentsChange,
    handleUsernameChange,
    handlePasswordChange,
    handleRememberMeChange,
    handleLogin,
    // handleShowAlertNewPassword,
    setShowPassword,
  } = useLoginHandlers();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [showResetPassword, setShowResetPassword] = React.useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token"); // Lấy token từ URL
  console.log("Token:", token);
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordError, setNewPasswordError] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleResetPassword = async () => {
    if (!token) {
      setError("Token không hợp lệ hoặc đã hết hạn.");
      return;
    }
  
    if (!newPassword || newPassword !== confirmNewPassword) {
      setError("Mật khẩu không khớp hoặc chưa nhập đủ.");
      return;
    }
  
    setIsLoading(true);
    setError("");
    setSuccessMessage("");
  
    try {
      const response = await apiService.post("/auth/reset-password", {
        token, // Gửi token từ URL
        newPassword, // Gửi mật khẩu mới
      });
  
      console.log("Payload gửi đi:", { token, newPassword });
      console.log("Reset Password Response:", response.data);
  
      if (response.data?.message === "Mật khẩu đã được đặt lại thành công") {
        setSuccessMessage("Mật khẩu đã được đặt lại thành công. Chuyển hướng...");
        setTimeout(() => router.push("/login"), 3000);
      } else {
        setError("Có lỗi xảy ra, vui lòng thử lại.");
      }
    } catch (error: any) {
      console.error("Lỗi đặt lại mật khẩu:", error.response?.data || error);
      setError(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleConfirmNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setConfirmNewPassword(value);
    setConfirmPasswordError(value !== newPassword);
  };
  const handleNewPasswordChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setNewPassword(value);
    const passwordValidation =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^.+-])[A-Za-z\d@$!%*?&#^.+-]{8,}$/;
    setNewPasswordError(!passwordValidation.test(value));
  };

  const handleCloseResetPassword = () => {
    setShowResetPassword(false);
  };

  const handleDepartmentsChange = (event: SelectChangeEvent<string>) => {
    setSelectedDepartment(event.target.value);
  };
  const { isAuthenticated, logout } = useAuth();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Thêm dòng này
    const loginSuccess = await handleLogin(e, selectedDepartment, setIsLoading);
  };
  
  return (
    <>
      {alert.visible && (
        <Alert
          severity={alert.severity}
          message={alert.message}
          visible={alert.visible}
          onClose={handleCloseAlert}
        />
      )}
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex-1 rounded-xl bg-white px-6 pb-6 pt-4 shadow-2xl">
          <div className="flex flex-col items-center">
            <Typography className="mb-3 text-2xl font-bold">
              Thay đổi mật khẩu
            </Typography>
            <Typography className="mb-3 text-base text-[#6A6A81] text-center">
              Nhập mật khẩu mới bên dưới
            </Typography>
          </div>
          <div className="w-full">
            <div>
              <div className="relative">
                <PasswordField
                  label="Mật khẩu mới"
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
                  label="Xác nhận mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={handleConfirmNewPasswordChange}
                  error={confirmPasswordError}
                  helperText={
                    confirmPasswordError
                      ? "Mật khẩu xác nhận không khớp."
                      : undefined
                  }
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button
                  onClick={handleResetPassword}
                  variant="contained"
                  fullWidth
                  disabled={newPasswordError || confirmPasswordError}
                >
                  Khôi phục mật khẩu mới
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <ProgressOverlay isLoading={isLoading} />
    </>
  );
}
