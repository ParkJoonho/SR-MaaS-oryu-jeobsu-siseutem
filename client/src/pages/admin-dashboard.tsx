import { useEffect } from "react";
import DashboardStats from "@/components/dashboard-stats";
import ErrorTable from "@/components/error-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import type { MonthlyStatsResponse, CategoryStatsResponse } from "@shared/schema";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function AdminDashboard() {
  const { data: monthlyStats } = useQuery<MonthlyStatsResponse[]>({
    queryKey: ['/api/stats/monthly'],
  });

  const { data: categoryStats } = useQuery<CategoryStatsResponse[]>({
    queryKey: ['/api/stats/categories'],
  });

  const monthlyChartData = monthlyStats ? {
    labels: monthlyStats.map((stat) => stat.month),
    datasets: [
      {
        label: '오류 접수',
        data: monthlyStats.map((stat) => stat.errors),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1
      },
      {
        label: '해결 완료',
        data: monthlyStats.map((stat) => stat.resolved),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.1
      }
    ]
  } : null;

  const categoryChartData = categoryStats ? {
    labels: categoryStats.map((stat) => stat.category),
    datasets: [{
      data: categoryStats.map((stat) => stat.count),
      backgroundColor: [
        'rgb(59, 130, 246)',
        'rgb(16, 185, 129)',
        'rgb(245, 158, 11)',
        'rgb(239, 68, 68)',
        'rgb(107, 114, 128)'
      ]
    }]
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Dashboard Stats */}
      <DashboardStats />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>월별 오류 접수 현황</CardTitle>
            <select className="text-sm border-gray-300 rounded-md" data-testid="select-time-range">
              <option>최근 6개월</option>
              <option>최근 1년</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {monthlyChartData && (
                <Line data={monthlyChartData} options={chartOptions} />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>오류 유형별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {categoryChartData && (
                <Doughnut data={categoryChartData} options={doughnutOptions} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Management Table */}
      <ErrorTable />
    </div>
  );
}
