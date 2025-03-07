"use client"
import { AppProvider } from '@/app/hooks/AppContext'
import { AuthProvider } from '@/app/hooks/AuthContext'
import React from 'react'
import ReportPage from './components/report-page'

const Report = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ReportPage/>
      </AppProvider>
    </AuthProvider>
  )
}

export default Report