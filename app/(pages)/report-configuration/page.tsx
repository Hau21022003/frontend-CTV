"use client"
import { AppProvider } from '@/app/hooks/AppContext'
import { AuthProvider } from '@/app/hooks/AuthContext'
import React from 'react'
import ReportConfigPage from './components/report-config-page'

const ReportConfiguration = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ReportConfigPage/>
      </AppProvider>
    </AuthProvider>
  )
}

export default ReportConfiguration