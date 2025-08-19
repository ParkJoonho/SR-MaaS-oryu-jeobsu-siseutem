import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bug, BarChart3, Shield } from "lucide-react";
import { Link, useLocation } from "wouter";
import logoImage from "@assets/CIBI_basic_1755647078820.png";

export default function Home() {
  const [location, setLocation] = useLocation();

  // Admin 아이콘 클릭 시 관리자 대시보드로 이동
  const handleAdminClick = () => {
    setLocation("/admin-dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 flex items-center">
                <img 
                  src={logoImage} 
                  alt="CIBI Logo" 
                  className="w-8 h-8 mr-3 object-contain"
                />
                SR-MaaS 통합정보시스템 오류 관리 시스템
              </h1>
            </div>
            <button
              onClick={handleAdminClick}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              data-testid="button-admin"
              title="관리자 페이지"
            >
              <Shield className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            환영합니다!
          </h1>
          <p className="text-lg text-gray-600">
            SR-MaaS 통합정보시스템 오류 관리 시스템에서 효율적으로 오류를 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/error-submit">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bug className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">스마트 오류 접수</CardTitle>
                    <CardDescription>새로운 오류를 신고합니다</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  시스템에서 발생한 오류를 빠르게 접수하고 자동 제목 생성 기능을 활용하세요.
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/admin-dashboard">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BarChart3 className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">관리자 대시보드</CardTitle>
                    <CardDescription>오류 현황을 관리합니다</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  오류 통계와 처리 현황을 확인하고 체계적으로 관리하세요.
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>



        <Card>
          <CardHeader>
            <CardTitle>빠른 시작 가이드</CardTitle>
            <CardDescription>
              SR-MaaS 통합정보시스템 오류 관리 시스템 사용법
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">1. 스마트 오류 접수</h3>
                <p className="text-sm text-gray-600">
                  시스템에서 오류가 발생했을 때 '스마트 오류 접수' 메뉴를 클릭하여 상세한 정보를 입력하세요.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">2. AI 자동 제목 생성</h3>
                <p className="text-sm text-gray-600">
                  오류 내용을 10자 이상 입력하면 AI가 자동으로 적절한 제목을 생성해드립니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">3. 관리자 대시보드</h3>
                <p className="text-sm text-gray-600">
                  관리자 대시보드에서 오류 처리 현황과 통계를 실시간으로 확인할 수 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">4. AI 이미지 분석</h3>
                <p className="text-sm text-gray-600">
                  첨부된 이미지를 AI가 자동 분석하여 오류 진단 결과를 제공합니다.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Link href="/error-submit">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Bug className="w-4 h-4 mr-2" />
                  스마트 오류 접수
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  관리자 대시보드
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
