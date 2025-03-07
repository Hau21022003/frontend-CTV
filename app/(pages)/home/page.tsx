"use client";
import React, { useState } from "react";
import Image from "next/image";
// import LoginForm from "./components/login-form";
import { AuthProvider } from "@/app/hooks/AuthContext";
import { AppProvider } from "@/app/hooks/AppContext";
import LanguageIcon from "@mui/icons-material/Language";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import ForgotPasswordForm from "../forgot-password/components/forgot-password-form";
import ForgotPasswordForm2 from "../forgot-password-2/components/forgot-password-form-2";
import ForgotPasswordForm3 from "../reset-password/components/forgot-password-form-3";
import { Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/button";
export default function Login() {
  const router = useRouter();
  const handleChange = () => {
    router.push("/department");
  };
  return (
    <>
      <AuthProvider>
        <AppProvider>
          <div className="flex min-h-screen flex-col bg-white overflow-hidden md:overflow-hidden">
            <div className="flex pt-4 px-16 justify-between items-center">
              <div className="items-center px-5 py-1">LOGO</div>
              <div className="flex gap-4">
                <div></div>
                <Button>Đăng xuất</Button>
                <div className="p-2 gap-4">
                  <LanguageIcon fontSize="small" sx={{ color: "#383838" }} />
                  Vietnamese
                  <KeyboardArrowDownIcon
                    fontSize="small"
                    sx={{ color: "#383838" }}
                  />
                </div>
              </div>
            </div>
            <div className="flex grow flex-col gap-7 items-center">
              <div className="flex flex-col items-center px-12 pt-12 ">
                <Typography className="mb-3 text-2xl font-bold">
                  Chào mừng
                </Typography>
                <Typography className="mb-3 text-base text-[#6A6A81]">
                  Tìm hiểu các tính năng chính của phần mềm với hướng dẫn của
                  chúng tôi.
                </Typography>
              </div>
              <div className="p-10 bg-white rounded-3xl shadow-2xl">
                <Image
                  src="/rectangle.png"
                  width={500}
                  height={270}
                  alt="Login Image"
                />
              </div>
              <div>
                <Button onClick={handleChange}>Bắt đầu</Button>
              </div>
            </div>
          </div>
        </AppProvider>
      </AuthProvider>
    </>
  );
}
