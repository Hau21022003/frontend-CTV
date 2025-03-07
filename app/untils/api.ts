    import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
    import { useRouter } from 'next/router';

    class ApiService {
        private api: AxiosInstance;
        private isRefreshing = false; // Cờ để xác định trạng thái refresh token
        private pendingRequests: Array<{ resolve: (token: string) => void, reject: (error: any) => void }> = [];
        // const router = useRouter();

        constructor(baseURL: string) {
            this.api = axios.create({
                baseURL,
                headers: {
                    'Content-Type': 'application/json',
                },
                // validateStatus: (status) => status >= 200 && status < 500 && status !== 401,
            });

            this.api.interceptors.request.use(
                config => {
                    if (typeof window !== 'undefined') {
                        const token = localStorage.getItem('access_token');
                        if (token) {
                            config.headers.Authorization = `Bearer ${token}`;
                        }
                    }
                    return config;
                },
                error => {
                    return Promise.reject(error);
                }
            );

            this.api.interceptors.response.use(
                response => response,
                async (error) => {
                    const originalRequest = error.config;
                    // console.log('ERROR: ', error?.respone?.message === "Invalid refresh token");
                    if(error.response && error.response.status === 401 &&   error.response.data.message === "Invalid refresh token"){
                        this.redirectToLogin();
                    }
                    // Kiểm tra lỗi 401 và chưa retry
                    if (error.response && error.response.status === 401 && !originalRequest._retry) {
                        originalRequest._retry = true;
            
                        if (this.isRefreshing) {
                            // Nếu có refresh token đang xử lý, chờ cho đến khi refresh xong
                            return new Promise((resolve, reject) => {
                                this.pendingRequests.push({ resolve, reject });
                            }).then(newToken => {
                                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                                return this.api(originalRequest);
                            }).catch(err => Promise.reject(err));
                        }
            
                        this.isRefreshing = true;
            
                        const refreshToken = localStorage.getItem('refresh_token');
                        // console.log("Refresh Token:", refreshToken);
                        if (!refreshToken) {
                            // console.log("Không tìm thấy refresh token trong localStorage.");
                            return Promise.reject(error);  // Trả lỗi nếu không có refresh token
                        }
            
                        try {
                            // Gọi API refresh token
                            const { data } = await this.api.post('/auth/refresh-token', { refreshToken });
                            console.log("Refresh Token:", data);
                            const { access_token } = data;
                            localStorage.setItem('access_token', access_token);
                            originalRequest.headers.Authorization = `Bearer ${access_token}`;
            
                            // Tiếp tục các yêu cầu đang chờ với token mới
                            this.pendingRequests.forEach(({ resolve }) => resolve(access_token));
                            this.pendingRequests = [];
            
                            return this.api(originalRequest);  // Thực hiện lại yêu cầu ban đầu
            
                        } catch (err: any) {
                            console.error("Lỗi Refresh:", err);
                                       
                            // Trả lỗi lại cho tất cả các yêu cầu đang chờ
                            this.pendingRequests.forEach(({ reject }) => reject(err));
                            this.pendingRequests = [];
                            
                            return Promise.reject(err);  // Truyền lỗi vào catch
            
                        } finally {
                            this.isRefreshing = false;  // Đánh dấu kết thúc quá trình refresh
                        }
                    }
            
                    return Promise.reject(error);  // Truyền lỗi xuống nếu không phải 401
                }
            );
        }

        private redirectToLogin() {
            alert('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.'); // Thông báo cho người dùng
            window.location.href = '/login'; // Chuyển hướng đến trang đăng nhập
        }

        post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
            return this.api.post<T>(url, data, config);
        }
        get<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
            return this.api.get<T>(url, config);
        }
        put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
            return this.api.put<T>(url, data, config);
        }
        delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
            return this.api.delete<T>(url, config);
        }
    }

    const apiService = new ApiService('http://localhost:3002');

    export default apiService;
