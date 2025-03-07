"use client"
import HomePage from './components/permission-page'
import { AppProvider } from '@/app/hooks/AppContext'
import { AuthProvider } from '@/app/hooks/AuthContext'
import React from 'react'

const PermissionPage = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HomePage/>
      </AppProvider>
    </AuthProvider>
  )
}

export default PermissionPage