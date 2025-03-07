
"use client";
import React, { useState } from "react";
import Image from "next/image";
import ForgotPasswordForm3 from "./components/forgot-password-form-3";
import { AuthProvider } from "@/app/hooks/AuthContext";
import { AppProvider } from "@/app/hooks/AppContext";
import LanguageIcon from '@mui/icons-material/Language';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
export default function ForgotPassword() {
    return (
        <>
            <AuthProvider>
                <AppProvider>
                <div className="flex min-h-screen flex-col bg-white overflow-hidden md:overflow-hidden">
                    <div className="flex pt-4 px-16 justify-between items-center">
                        <div className="items-center px-5 py-1">LOGO</div>
                        <div className="p-2 gap-4"><LanguageIcon fontSize="small" sx={{color: "#383838"}}/>Vietnamese<KeyboardArrowDownIcon fontSize="small"  sx={{color: "#383838"}}/></div>
                    </div>
                    <div className="flex grow flex-col md:flex-row">
                        <div className="flex items-center justify-center p-12 md:w-3/5">
                            <Image
                                src="/login_img.png"
                                width={464}
                                height={378}
                                alt="Login Image">
                            </Image>
                        </div>
                        <div className="flex flex-col justify-center gap-6 rounded-lg bg-white pr-32 py-12 md:w-2/5">
                        
                            <ForgotPasswordForm3 />
                        </div>
                    </div>
                    <style jsx>{`
                @media (max-width: 768px) {
                    .overflow-hidden {
                        overflow: auto; /* Allow scrolling on smaller screens */
                    }
                }
                @media (min-width: 768px) {
                    .overflow-hidden {
                        overflow: hidden; /* Prevent scrolling on larger screens */
                    }
                }
            `}</style>
                </div>
                </AppProvider>
            </AuthProvider>
        </>
    )
}