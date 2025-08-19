import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, BarChart3, Users, Shield } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">
                <Bug className="inline-block w-6 h-6 text-blue-600 mr-2" />
                SR-MaaS 통합정보시스템 오류 관리 시스템
              </h1>
            </div>
            <Button onClick={() => window.location.href = "/api/login"} data-testid="button-login">
              로그인
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            스마트한 오류 관리
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            AI 자동 제목 생성과 체계적인 관리 시스템으로 
            효율적인 오류 해결을 경험해보세요
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={() => window.location.href = "/api/login"} data-testid="button-get-started">
              시작하기
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <Bug className="w-8 h-8 text-blue-600 mb-2" />
              <CardTitle>AI 자동 제목 생성</CardTitle>
              <CardDescription>
                오류 내용을 분석하여 적절한 제목을 자동으로 생성합니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-green-600 mb-2" />
              <CardTitle>실시간 통계</CardTitle>
              <CardDescription>
                오류 현황과 처리 상태를 실시간으로 모니터링할 수 있습니다
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-8 h-8 text-purple-600 mb-2" />
              <CardTitle>협업 관리</CardTitle>
              <CardDescription>
                팀원들과 함께 오류를 효율적으로 추적하고 해결합니다
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </main>
    </div>
  );
}
