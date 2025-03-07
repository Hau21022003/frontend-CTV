"use client"
import HomePage from './components/role-page'
import { AppProvider } from '@/app/hooks/AppContext'
import { AuthProvider } from '@/app/hooks/AuthContext'
import React from 'react'

const RolePage = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <HomePage/>
      </AppProvider>
    </AuthProvider>
  )
}

export default RolePage