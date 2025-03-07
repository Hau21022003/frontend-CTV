"use client"
import { AppProvider } from '@/app/hooks/AppContext'
import { AuthProvider } from '@/app/hooks/AuthContext'
import React from 'react'
import ReportDeclarePage from '../[slug]/components/report-declare-page'

const ReportDeclare = () => {
  return (
    <AuthProvider>
      <AppProvider>
        <ReportDeclarePage/>
      </AppProvider>
    </AuthProvider>
  )
}

export default ReportDeclare