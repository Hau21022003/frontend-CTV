//login-service.ts
// import { LoginResponse } from "@/app/(pages)/login/types/login";
import { useAppContext } from "@/app/hooks/AppContext";
import apiService from "@/app/untils/api";
import { AxiosError } from "axios";
import { useAuth } from "@/app/hooks/AuthContext";
interface LoginResponse {
    success: boolean;
    message?: string;
    // data: {
        access_token: string;
        user: any;
    // };
}
export const loginUser = async (
    username: string,
    password: string,
    department: string,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<LoginResponse> => {
    try {
        setIsLoading(true);
        const response = await apiService.post('/auth/login', {
            username,
            password,
            department,
        });
        
        console.log("res", response)
        
        return response.data as LoginResponse;
    } catch (error) {
        if (error instanceof AxiosError) {
            const message = error.response?.data?.message || "Đăng nhập không thành công"; // Use optional chaining
            throw new Error(message);
        } else {
            throw new Error("Đăng nhập không thành công");
        }
    }
    finally{
        setIsLoading(false);
    }
};
