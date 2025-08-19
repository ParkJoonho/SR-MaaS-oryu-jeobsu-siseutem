import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Download, Search } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Error, ErrorListResponse } from "@shared/schema";

export default function ErrorTable() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("모든 상태");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: errorData, isLoading } = useQuery<ErrorListResponse>({
    queryKey: ['/api/errors', search, status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (status && status !== '모든 상태') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', '20');
      
      return apiRequest(`/api/errors?${params.toString()}`);
    },
    retry: false,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      await apiRequest(`/api/errors/${id}`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/errors'] });
      toast({
        title: "상태 업데이트",
        description: "오류 상태가 성공적으로 업데이트되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다. 다시 로그인하겠습니다...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "상태 업데이트 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const deleteErrorMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest(`/api/errors/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/errors'] });
      queryClient.invalidateQueries({ queryKey: ['/api/stats/errors'] });
      toast({
        title: "삭제 완료",
        description: "오류가 성공적으로 삭제되었습니다.",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "인증 오류",
          description: "로그인이 필요합니다. 다시 로그인하겠습니다...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "오류",
        description: "삭제 중 문제가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "긴급":
        return "bg-red-100 text-red-800";
      case "높음":
        return "bg-yellow-100 text-yellow-800";
      case "보통":
        return "bg-blue-100 text-blue-800";
      case "낮음":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleStatusChange = (errorId: number, newStatus: string) => {
    updateStatusMutation.mutate({ id: errorId, status: newStatus });
  };

  const handleDelete = (errorId: number) => {
    if (confirm("정말로 이 오류를 삭제하시겠습니까?")) {
      deleteErrorMutation.mutate(errorId);
    }
  };

  const handleExport = () => {
    toast({
      title: "내보내기",
      description: "데이터 내보내기 기능이 곧 제공될 예정입니다.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>오류 목록 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const errors = errorData?.errors || [];
  const total = errorData?.total || 0;
  const totalPages = Math.ceil(total / 20);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>오류 목록 관리</CardTitle>
          <div className="flex space-x-3 mt-3 sm:mt-0">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="검색..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 text-sm"
                  data-testid="input-search"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-32" data-testid="select-status-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="모든 상태">모든 상태</SelectItem>
                  <SelectItem value="접수됨">접수됨</SelectItem>
                  <SelectItem value="처리중">처리중</SelectItem>
                  <SelectItem value="완료">완료</SelectItem>
                  <SelectItem value="보류">보류</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleExport}
              variant="outline"
              size="sm"
              data-testid="button-export"
            >
              <Download className="w-4 h-4 mr-1" />
              내보내기
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  제목
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  시스템
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  신고일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {errors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <p className="text-lg font-medium">오류가 없습니다</p>
                      <p className="text-sm">검색 조건을 변경하거나 새로운 오류를 신고해보세요.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                errors.map((error: Error) => (
                  <tr key={error.id} className="hover:bg-gray-50" data-testid={`row-error-${error.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{error.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {error.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getPriorityColor(error.priority)}>
                        {error.priority}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.system}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Select
                        value={error.status}
                        onValueChange={(value) => handleStatusChange(error.id, value)}
                      >
                        <SelectTrigger className="w-24" data-testid={`select-status-${error.id}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="접수됨">접수됨</SelectItem>
                          <SelectItem value="처리중">처리중</SelectItem>
                          <SelectItem value="완료">완료</SelectItem>
                          <SelectItem value="보류">보류</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {error.createdAt ? new Date(error.createdAt).toLocaleDateString('ko-KR') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-view-${error.id}`}
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        data-testid={`button-edit-${error.id}`}
                      >
                        <Edit className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(error.id)}
                        data-testid={`button-delete-${error.id}`}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-4">
            <div className="flex-1 flex justify-between sm:hidden">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                data-testid="button-prev-mobile"
              >
                이전
              </Button>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                data-testid="button-next-mobile"
              >
                다음
              </Button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700" data-testid="text-pagination-info">
                  총 <span className="font-medium">{total}</span>건 중{" "}
                  <span className="font-medium">{(page - 1) * 20 + 1}</span>-
                  <span className="font-medium">{Math.min(page * 20, total)}</span>건
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="rounded-l-md"
                    data-testid="button-prev"
                  >
                    이전
                  </Button>
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className="rounded-none"
                        data-testid={`button-page-${pageNum}`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="rounded-r-md"
                    data-testid="button-next"
                  >
                    다음
                  </Button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
