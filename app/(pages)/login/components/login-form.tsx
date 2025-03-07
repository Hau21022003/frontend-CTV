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
export default function LoginForm() {
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  useEffect(() => {
    const getDepartments = async () => {
      try {
        const res: Departments = await fetchDepartments();
        setDepartments(res);
        if (res.length > 0) {
          setSelectedDepartment(res[0].departmentId.toString());
        }
      } catch (err) {
        console.error(err);
      }
    };

    getDepartments();
  }, []);
  const handleForgotPassword = () => {
    //setShowResetPassword(true);
    router.push("/forgot-password");
  };

  const handleCloseResetPassword = () => {
    setShowResetPassword(false);
  };

  const handleDepartmentsChange = (event: SelectChangeEvent<string>) => {
    setSelectedDepartment(event.target.value);
  };
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    // try {
    // setIsLoading(true);
    const loginSuccess = await handleLogin(e, selectedDepartment, setIsLoading);
    // }finally {
    //     setIsLoading(false);
    // }
    if (loginSuccess) {
        router.replace('/department'); // Điều hướng đến trang department
    }
  };

  useEffect(() => {
    fetchDepartments();
    localStorage.removeItem("access_token");
    logout();
  }, []);
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
              Chào mừng trở lại
            </Typography>
            <Typography className="mb-3 text-base text-[#6A6A81]">
              Đăng nhập để tiếp tục
            </Typography>
          </div>
          <div className="w-full">
            <div>
              <div className="relative">
                {/* <FormControl fullWidth margin="normal"> */}
                  {/* <InputLabel
                    htmlFor="department"
                    size="small"
                    sx={{
                      "&.Mui-focused": {
                        color: theme.palette.primary.main,
                      },
                    }}
                  >
                    Cơ quan
                  </InputLabel> */}
                  <TextField
                    select
                    id="departments"
                    label="Cơ quan"
                    size="small"
                    value={selectedDepartment}
                    onChange={handleDepartmentsChange}
                    sx={{
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    {departments.map((dept: Department) => (
                      <MenuItem
                        key={dept.departmentId}
                        value={dept.departmentId.toString()}
                        id={`menu-item-${dept.departmentId}`}
                      >
                        {dept.departmentName}
                      </MenuItem>
                    ))}
                  </TextField>
                {/* </FormControl> */}

                <TextField
                  label="Tên đăng nhập"
                  value={username}
                  onChange={handleUsernameChange}
                  maxLength={50}
                  required
                />

                <PasswordField
                  label="Mật khẩu"
                  value={password}
                  onChange={handlePasswordChange}
                  maxLength={50}
                  error={false}
                  helperText={""}
                />

                <div className="flex items-center justify-end mt-2">
                  <Button variant="text" onClick={handleForgotPassword}>
                    Quên mật khẩu?
                  </Button>
                </div>
                <Button type="submit" className="mt-4 w-full">
                  Đăng nhập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
      {showResetPassword && (
        <ResetPassword
          onClose={handleCloseResetPassword}
          // showUpdatePasswordAlert={handleShowUpdatePasswordAlert}
        />
      )}

      <ProgressOverlay isLoading={isLoading} />
    </>
  );
}
