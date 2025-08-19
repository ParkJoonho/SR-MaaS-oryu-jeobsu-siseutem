import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { Bug, BarChart3, FileText, Users, Clock, CheckCircle } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            환영합니다, {(user as any)?.firstName || '사용자'}님
          </h1>
          <p className="text-lg text-gray-600">
            SR-MaaS 통합정보시스템 오류 관리 시스템에서 효율적으로 오류를 관리하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/error-submit">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Bug className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">오류 접수</CardTitle>
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

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">오류 이력</CardTitle>
                  <CardDescription>내 오류 신고 이력</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                과거에 신고한 오류들의 처리 상황과 이력을 확인할 수 있습니다.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 오류</CardTitle>
              <Bug className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                전체 접수된 오류
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리 중</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                현재 처리 중인 오류
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">처리 완료</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                처리 완료된 오류
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                시스템 사용자 수
              </p>
            </CardContent>
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
                <h3 className="font-medium text-gray-900">1. 오류 접수</h3>
                <p className="text-sm text-gray-600">
                  시스템에서 오류가 발생했을 때 '오류 접수' 메뉴를 클릭하여 상세한 정보를 입력하세요.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">2. 자동 제목 생성</h3>
                <p className="text-sm text-gray-600">
                  오류 내용을 10자 이상 입력하면 AI가 자동으로 적절한 제목을 생성해드립니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">3. 현황 관리</h3>
                <p className="text-sm text-gray-600">
                  관리자 대시보드에서 오류 처리 현황과 통계를 실시간으로 확인할 수 있습니다.
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-gray-900">4. 처리 추적</h3>
                <p className="text-sm text-gray-600">
                  접수된 오류의 처리 상태를 실시간으로 추적하고 해결 과정을 모니터링하세요.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Link href="/error-submit">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Bug className="w-4 h-4 mr-2" />
                  오류 접수하기
                </Button>
              </Link>
              <Link href="/admin-dashboard">
                <Button variant="outline">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  대시보드 보기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
