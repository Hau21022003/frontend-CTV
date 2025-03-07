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
  import router, { useRouter, useSearchParams } from "next/navigation";
  import { useAuth } from "@/app/hooks/AuthContext";
  import { useAppContext } from "@/app/hooks/AppContext";
  import ProgressOverlay from "@/app/components/progress-Overlay";
import Image from "next/image";
  export default function ForgotPasswordForm2() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email"); // Lấy email từ URL
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
          setDepartments(res.data);
          if (res.data.length > 0) {
            setSelectedDepartment(res.data[0].id.toString());
          }
        } catch (err) {
          console.error(err);
        }
      };
  
      getDepartments();
    }, []);
    const handleBack = () => {
      //setShowResetPassword(true);
      router.push("/login");
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
      // if (loginSuccess) {
      //     router.replace('/department'); // Điều hướng đến trang department
      // }
    };
  
    // useEffect(() => {
    //   fetchDepartments();
    //   localStorage.removeItem("access_token");
    //   logout();
    // }, []);
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
            <div className="flex flex-col items-center m-2">
               <Image src="/email-icon.png" width={70} height={70}/>
              <Typography className="mb-3 text-2xl font-bold">
                Kiểm tra email
              </Typography>
              <Typography className="mb-3 text-base text-[#6A6A81] text-center">
                Vui lòng kiểm tra địa chỉ email <strong>{email}</strong> để được hướng dẫn lấy lại mật khẩu
              </Typography>
            </div>
            <div className="w-full">
              <div>
                <div className="relative">
                  {/* <TextField
                    label="Địa chỉ email"
                    value={username}
                    onChange={handleUsernameChange}
                    maxLength={50}
                    required
                  /> */}
                  <Button type="submit" className="my-4 w-full">
                    Gửi lại email
                  </Button>
                  <Button variant="text" className="w-full" onClick={handleBack}>Trở về</Button>
                </div>
              </div>
            </div>
          </div>
        </form>
  
        <ProgressOverlay isLoading={isLoading} />
      </>
    );
  }
  