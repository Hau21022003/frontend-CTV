//AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { userInfo } from "os";

export interface User {
  userId: number;
  username: string;
  fullname: string;
  avatar: string | null;
  isAdmin: boolean;
  departmentId: number;
  department: {
    departmentId: number;
    departmentName: string;
    level: number;
    province: {
      idProvince: string;
      name: string;
    };
    district: {
      idDistrict: string;
      name: string;
      idProvince: string;
    };
    ward: {
      idCommune: string;
      name: string;
      idDistrict: string;
    };
    parentId: number | null;
  };
  role: {
    id: number;
    name: string;
  };
  permissions: {
    department: Record<string, boolean>;
    role: Record<string, boolean>;
    permission: Record<string, boolean>;
    user: Record<string, boolean>;
  };
}

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  user: User | null; // Add user to context type
  login: (token: string, refresh_token: string, user: User) => void; // Modify login method
  logout: () => void;
  isEditing: boolean; // New state for editing
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null); // Add user state
  const router = useRouter();
  const pathname = usePathname(); // Lấy URL hiện tại

//   useEffect(() => {
//       if (typeof window !== 'undefined') {
//           const token = localStorage.getItem('access_token');
//           if (token) {
//               setIsAuthenticated(true);
//           } else {
//               setIsAuthenticated(false);
//           }

//       }
//   }, [pathname, router]);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_info");
      const dept = localStorage.getItem("dept");
      console.log("storedUser", storedUser);
      console.log("dept", dept);
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } else {
        setIsAuthenticated(false);
      }
    }
  }, []);

  const login = async (token: string, refresh_token: string, user: User) => {
    try {
      setIsLoading(true);
      localStorage.setItem("access_token", token);
      localStorage.setItem("refresh_token", refresh_token);
      console.log("ref", refresh_token);
      localStorage.setItem("user_info", JSON.stringify(user)); // Lưu thông tin người dùng
      console.log("user_info", user);
      localStorage.setItem("dept", JSON.stringify(user.department));
      console.log("dept", user.department);
      localStorage.setItem("avatar", user.avatar !== null ? user.avatar : "");
      localStorage.setItem("userId", user.userId.toString());
      localStorage.setItem("isAdmin", user.isAdmin.toString());
      console.log("isAdmin", localStorage.getItem("isAdmin"));
      localStorage.setItem("fullName", user.fullname);
      localStorage.setItem("province", JSON.stringify(user.department.province.name));
      console.log("province", localStorage.getItem("province"));
      
      localStorage.setItem("role", JSON.stringify(user.role));
      localStorage.setItem("permissions", JSON.stringify(user.permissions)); // Lưu permissions người dùng
      setIsAuthenticated(true);
      setUser(user); // Cập nhật state người dùng
      console.log("AAAAAAA");
      await router.replace("/department");
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  };
  // const login = async (token: string, refresh_token: string, user: User) => {
  //     try {
  //         setIsLoading(true);
  //         localStorage.setItem('access_token', token);
  //         localStorage.setItem('refresh_token', refresh_token);
  //         localStorage.setItem('user_info', JSON.stringify({
  //             userId: user.userId,
  //             username: user.username,
  //             fullname: user.fullname,
  //             avatar: user.avatar,
  //             isAdmin: user.isAdmin,
  //             department: user.department,
  //             role: user.role,
  //         }));
  //         console.log("user_info", userInfo)
  //         setIsAuthenticated(true);
  //         setUser(user);
  //         await router.replace('/department');
  //     } catch (e) {
  //         console.error("Login Error:", e);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };

  // const logout = async() => {
  //     try{
  //     setIsLoading(true);
  //     localStorage.removeItem('access_token');
  //     localStorage.removeItem('refresh_token');
  //     localStorage.removeItem('id');
  //     localStorage.removeItem('avatar');
  //     localStorage.removeItem('fullName');
  //     localStorage.removeItem('dept');
  //     localStorage.removeItem('user_info'); // Remove user info
  //     localStorage.removeItem('permissions'); // Remove user info
  //     localStorage.removeItem('role')
  //     setIsAuthenticated(false);
  //     setUser(null); // Clear user state
  //     await router.replace('/login');
  //     }
  //     catch (error) {}
  //     finally{
  //         setIsLoading(false);
  //     }
  // };
  const logout = async () => {
    try {
      setIsLoading(true);
      localStorage.clear(); // Xóa hết dữ liệu trong localStorage
      setIsAuthenticated(false);
      setUser(null);
      await router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated === null) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        isLoading,
        setIsLoading,
        isEditing,
        setIsEditing,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
