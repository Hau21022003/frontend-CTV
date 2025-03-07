//use-login-handlers.ts
import { useEffect, useState } from "react";
import { SelectChangeEvent } from "@mui/material";
import { useRouter } from "next/router";
import useAlert from '@/app/hooks/useAlert';
import { fetchDepartments } from "../services/department/department-service";
import { loginUser } from "../services/login/login-sevice";
import { useAuth } from "./AuthContext";
import { LoginResponse } from "../(pages)/login/types/login";

const useLoginHandlers = () => {
    const { alert, showAlert, handleCloseAlert } = useAlert();
    // const [departments, setDepartments] = useState<any[]>([]);
    // const [selectedDepartment, setSelectedDepartment] = useState<string>('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const {isAuthenticated, login} = useAuth();
    
    useEffect(() => {
        const savedUsername = localStorage.getItem('username');
        const savedPassword = localStorage.getItem('password');
        const savedRememberMe = localStorage.getItem('rememberMe') === 'true';

        if (savedRememberMe) {
            setUsername(savedUsername || '');
            setPassword(savedPassword || '');
            setRememberMe(savedRememberMe);
        }
    }, []);

    const handleUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (value.length <= 50) {
            setUsername(value);
        }
    };

    const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        if (value.length <= 50) {
            setPassword(value);
        }
    };

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    const validatePassword = (password: string): true | string => {
        if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
        if (/\s/.test(password)) return "Mật khẩu không được chứa khoảng trắng.";
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt.";
        if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự in hoa.";
        if (!/[a-z]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự thường.";
        if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự số.";
        return true;
    };
    const handleLogin = async (event: React.FormEvent<HTMLFormElement>, selectedDepartment: string, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>): Promise<boolean> => {
        event.preventDefault();
        // Kiểm tra mật khẩu
        const passwordValidation = validatePassword(password);
        if (passwordValidation !== true) {
            showAlert(passwordValidation, "error");
            return false; // Ngừng nếu mật khẩu không hợp lệ
        }
    
        // Lưu thông tin đăng nhập nếu cần
        if (rememberMe) {
            localStorage.setItem('username', username);
            localStorage.setItem('password', password);
            localStorage.setItem('rememberMe', 'true');
        } else {
            localStorage.removeItem('username');
            localStorage.removeItem('password');
            localStorage.removeItem('rememberMe');
        }
    
        // try {
        //     const loginResponse: LoginResponse = await loginUser(username, password, selectedDepartment,setIsLoading);
    
        //     if (loginResponse.success) {
        //         login(loginResponse.access_token,loginResponse.refresh_token,loginResponse.userId );
        //         showAlert("Đăng nhập thành công!", "success");
        //         return true; // Đăng nhập thành công
        //     } else {
        //         showAlert(loginResponse.message || "Đăng nhập không thành công", "error");
        //         return false; // Đăng nhập không thành công
        //     }
        // } catch (error) {
        //     if (error instanceof Error) {
        //         showAlert(error.message, "error");
        //     }
        //     return false; // Lỗi trong quá trình đăng nhập
        // }
        try {
            const loginResponse: LoginResponse = await loginUser(username, password, selectedDepartment, setIsLoading);
    
            if (loginResponse.success) {
                const { access_token, refresh_token, user } = loginResponse;
                login(access_token, refresh_token, user);
                showAlert("Đăng nhập thành công!", "success");
                return true;
            } else {
                showAlert(loginResponse.message || "Đăng nhập không thành công", "error");
                return false;
            }
        } catch (error) {
            if (error instanceof Error) {
                showAlert(error.message, "error");
            }
            return false;
        }
    };
    
    
    return {
        // departments,
        // selectedDepartment,
        username,
        password,
        rememberMe,
        alert,
        showPassword,
        handleCloseAlert,
        // handleShowAlertNewPassword,
        // handleDepartmentsChange,
        handleUsernameChange,
        handlePasswordChange,
        handleRememberMeChange,
        showAlert,
        handleLogin,
        setShowPassword,
    };
};

export default useLoginHandlers;
