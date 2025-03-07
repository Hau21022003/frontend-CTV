import { useState, useEffect } from 'react';
import apiService from '../untils/api';
import { Alert } from '@mui/material';
import { AxiosResponse } from 'axios';
import { error } from 'console';
import { Anybody } from 'next/font/google';
import useAlert from '@/app/hooks/useAlert';
import { useAppContext } from './AppContext';
import { useRouter } from "next/navigation";
export const useResetPasswordEmail = (onClose: () => void) => {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [emailError, setEmailError] = useState<boolean>(false);
    const [alert, setAlert] = useState<{ visible: boolean; message: string; severity: 'success' | 'error' }>({
        visible: false,
        message: '',
        severity: 'error',
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [countdown, setCountdown] = useState<number>(0);

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
        setEmailError(!validateEmail(event.target.value));
    };

    const validateEmail = (email: string): boolean => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const handleSendRequest = async () => {
        if (!validateEmail(email)) {
            setAlert({ visible: true, message: 'Vui lòng nhập đúng định dạng email. Định dạng đúng là ...@...', severity: 'error' });
            return;
        }
        setIsLoading(true);
        const payload = { email };

        try {
            const res = await apiService.post('/auth/forgot-password', payload);
            const data = res.data as { message: string };

            if (res.status === 201) {
                console.log('Reset password email sent successfully', data.message);
                setAlert({ visible: true, message: 'Gửi email thành công!', severity: 'success' });
                setTimeout(() => {
                    router.push(`/forgot-password-2?email=${encodeURIComponent(email)}`);
                }, 2000);
                // setCountdown(5);
                // setEmail('');
            }
        } catch (error: any) {
            setAlert({ visible: true, message: 'Email chưa đăng ký trong hệ thống. Xin vui lòng thử lại sau.', severity: 'error' });
        } finally {
            setIsLoading(false); // Tắt loading sau khi hoàn thành
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout | undefined;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (countdown === 0 && alert.visible) {
            setTimeout(() => setAlert({ ...alert, visible: false }), 2000); // Auto-hide alert after 2 seconds
        }
        return () => {
            if (timer) {
                clearInterval(timer);
            }
        };
    }, [countdown, alert.visible]);

    return {
        email,
        emailError,
        alert,
        countdown,
        handleEmailChange,
        handleSendRequest,
        isLoading,
    };
};
export const useResetPasswordSMS = (onClose: () => void) => {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [phoneError, setPhoneError] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [otpError, setOtpError] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null); // Added errorMessage state
    const [countdown, setCountdown] = useState(60);
    const [canRequest, setCanRequest] = useState(true);

    const handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (/^[\d]*$/.test(value) || value === '') {
            if (/^\d{0,10}$/.test(value)) {
                setPhoneNumber(value);
                setPhoneError(value.length !== 10);
            }
        }
    };

    const handleSendRequest = async (): Promise<any> => {
        if (phoneNumber.length !== 10) {
            setPhoneError(true);
            setErrorMessage('Số điện thoại không hợp lệ. Vui lòng thử lại'); // Set error message here
            return {success: false, message: 'Số điện thoại không hợp lệ. Vui lòng thử lại'};
        } else {
            try {
                const payload = { 'phone': String(phoneNumber) };
                const res = await apiService.post('/user/reset-password-sms', payload);

                if (res.status === 201) {
                    setCanRequest(false);
                    setCountdown(60);
                    return { success: true, message: null };
                }
            } catch (error: any) {
                console.error('Error during API request', error);
                if (error.response) {
                    setErrorMessage(error.response.data.message); // Set error message from API response
                }
                return { success: false, message: error.response?.data?.message || 'Lỗi không xác định' };
            }
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        if (/^\d{0,1}$/.test(value)) {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setOtpError(newOtp.join('').length !== 4);
        }
    };

    const handleSubmitOtp = async (): Promise<any> => {
        if (otp.join('').length !== 4) {
            setOtpError(true);
            return { success: false, message: 'Mã OTP không hợp lệ.' }; // Display OTP error
        }

        try {
            const payload = { 'phone': String(phoneNumber), 'otp': String(otp.join('')) };
            const res = await apiService.post('/user/validate-otp-sms', payload);

            if (res.status === 201) {
                return { success: true, message: '' };
            }
        } catch (error: any) {
            console.error('Error during API request', error);
            if (error.response) {
                setErrorMessage(error.response.data.message); // Set error message from API response
            }
            return { success: false, message: error.response?.data?.message || 'Lỗi không xác định' };
        }
    };

    const handleResetOtp = () => {
        setOtp(['', '', '', '']);
    };

    const handleSummitNewPassword = async (newPassword: string) => {
        try {
            const payload = { 'phone': phoneNumber, 'newPassword': newPassword };
            const res = await apiService.post('/user/update-password-sms', payload);

            if (res.status === 201) {
                return { success: true, message: 'Cập nhật mật khẩu thành công' };
            }
        } catch (error: any) {
            console.error('Error during API request', error);
            if (error.response) {
                setErrorMessage(error.response.data.message); // Set error message from API response
            }
            return { success: false, message: 'Cập nhật mật khẩu không thành công' };
        }
    };

    return {
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
        errorMessage, // Return errorMessage
    };
};

function setError(arg0: string) {
    throw new Error('Function not implemented.');
}

function setType(arg0: string) {
    throw new Error('Function not implemented.');
}

function setOpen(arg0: boolean) {
    throw new Error('Function not implemented.');
}

function Logger(res: AxiosResponse<unknown, any>) {
    throw new Error('Function not implemented.');
}

