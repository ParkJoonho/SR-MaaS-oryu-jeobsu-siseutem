import { useState } from "react";
import Navigation from "@/components/navigation";
import ErrorReportPage from "@/pages/error-report";
import AdminDashboardPage from "@/pages/admin-dashboard";

export default function Home() {
  const [activeSection, setActiveSection] = useState<'report' | 'dashboard'>('report');

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation activeSection={activeSection} onSectionChange={setActiveSection} />
      
      {activeSection === 'report' ? <ErrorReportPage /> : <AdminDashboardPage />}
    </div>
  );
}
