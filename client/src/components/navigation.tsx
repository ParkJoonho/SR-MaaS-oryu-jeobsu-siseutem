import { useAuth } from "@/hooks/useAuth";
import { Bug, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import type { User } from "@shared/schema";

interface NavigationProps {
  activeSection?: 'report' | 'dashboard';
  onSectionChange?: (section: 'report' | 'dashboard') => void;
}

export default function Navigation({ activeSection = 'report', onSectionChange = () => {} }: NavigationProps = {}) {
  const { user } = useAuth();
  const typedUser = user as User | undefined;
  const isMobile = useIsMobile();

  const getNavItemClass = (section: 'report' | 'dashboard') => {
    return activeSection === section
      ? "border-blue-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium";
  };

  const getMobileNavClass = (section: 'report' | 'dashboard') => {
    return activeSection === section
      ? "flex flex-col items-center py-2 px-3 text-blue-600"
      : "flex flex-col items-center py-2 px-3 text-gray-400";
  };

  return (
    <>
      {/* Desktop Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  <Bug className="inline-block w-6 h-6 text-blue-600 mr-2" />
                  SR-MaaS 통합정보시스템 오류 관리 시스템
                </h1>
              </div>
              <nav className="hidden md:ml-8 md:flex md:space-x-8">
                <button
                  className={getNavItemClass('report')}
                  onClick={() => onSectionChange('report')}
                  data-testid="nav-error-report"
                >
                  오류 신고
                </button>
                <button
                  className={getNavItemClass('dashboard')}
                  onClick={() => onSectionChange('dashboard')}
                  data-testid="nav-admin-dashboard"
                >
                  관리자 대시보드
                </button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500" data-testid="text-username">
                  {typedUser?.firstName || typedUser?.email || "사용자"}
                </span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  관리자
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobile && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex justify-around">
            <button
              className={getMobileNavClass('report')}
              onClick={() => onSectionChange('report')}
              data-testid="mobile-nav-error-report"
            >
              <Bug className="text-lg" />
              <span className="text-xs mt-1">오류 신고</span>
            </button>
            <button
              className={getMobileNavClass('dashboard')}
              onClick={() => onSectionChange('dashboard')}
              data-testid="mobile-nav-admin-dashboard"
            >
              <i className="fas fa-chart-bar text-lg"></i>
              <span className="text-xs mt-1">대시보드</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
