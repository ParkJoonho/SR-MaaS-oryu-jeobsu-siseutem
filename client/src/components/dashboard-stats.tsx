import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, CheckCircle, PauseCircle } from "lucide-react";
import type { ErrorStatsResponse } from "@shared/schema";

export default function DashboardStats() {
  const { data: stats, isLoading } = useQuery<ErrorStatsResponse>({
    queryKey: ['/api/stats/errors'],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 space-y-2">
                  <div className="w-20 h-4 bg-gray-200 rounded"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="text-red-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">새로운 오류</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="stat-new-errors">
                {stats?.newErrors || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="text-yellow-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">처리 중</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="stat-in-progress">
                {stats?.inProgress || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="text-green-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">완료</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="stat-completed">
                {stats?.completed || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <PauseCircle className="text-gray-600 w-6 h-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">보류</p>
              <p className="text-2xl font-semibold text-gray-900" data-testid="stat-on-hold">
                {stats?.onHold || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
