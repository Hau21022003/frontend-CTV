"use client"
import React from 'react';
import HomePage from './components/user-page';
import { AppProvider } from '../../hooks/AppContext'; 
import { AuthProvider } from '@/app/hooks/AuthContext';

const UserPage = () => {
    return (
        <AuthProvider>
            <AppProvider>
                <HomePage/>
            </AppProvider>
        </AuthProvider>
    );
};

export default UserPage;