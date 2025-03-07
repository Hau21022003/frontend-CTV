"use client";
import Layout from "@/app/components/layout";
import { AppProvider } from "@/app/hooks/AppContext";
import { AuthProvider } from "@/app/hooks/AuthContext";
import React from "react";
import ReportSection from "./components/report-section";
import ReportDeclarePage from "./components/report-declare-page";

interface PageProps {
  params: {
    slug: string;
  };
}

const Page: React.FC<PageProps> = ({ params }) => {
  const { slug } = params;
  const mode = slug === "edit" ? "edit" : slug === "view" ? "view" : undefined;

  return (
    <AuthProvider>
      <AppProvider>
        {mode && <ReportDeclarePage mode={mode} />}
      </AppProvider>
    </AuthProvider>
  );
};

export default Page;
