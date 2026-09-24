import React, { Suspense } from "react";
import Loading from "../components/Loading";

interface ActionReportLayoutProps {
  children: React.ReactNode;
}

export default function ActionReportLayout({
  children
}: ActionReportLayoutProps) {
  return (
    <div className="w-full min-h-screen bg-white shadow-lg rounded-lg biling-report-layout">
      <Suspense fallback={<Loading />}>{children}</Suspense>
    </div>
  );
}
