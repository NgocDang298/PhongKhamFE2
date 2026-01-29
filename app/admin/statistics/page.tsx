"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Select from "@/components/ui/Select";
import { ROUTES } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconUserSquareRounded,
  IconSettings,
  IconCalendar,
  IconChartBar,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.ADMIN_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Quản lý tài khoản",
    path: ROUTES.ADMIN_USERS,
    icon: <IconUserSquareRounded size={20} />,
  },
  {
    label: "Quản lý dịch vụ",
    path: ROUTES.ADMIN_SERVICES,
    icon: <IconSettings size={20} />,
  },
  {
    label: "Quản lý lịch làm việc",
    path: ROUTES.ADMIN_SCHEDULES,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Thống kê",
    path: ROUTES.ADMIN_STATISTICS,
    icon: <IconChartBar size={20} />,
  },
];

export default function AdminStatisticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("monthly");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadStatistics();
  }, [user, isAuthenticated, authLoading, period, router]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response: any = await invoiceService.getRevenueStatistics({
        period: period as "daily" | "monthly" | "yearly",
      });
      const stats = response.data || response || null;
      setStatistics(stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Thống kê doanh thu">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Thống kê doanh thu">
      <div className="flex justify-between items-center mb-4">
        <div style={{ maxWidth: "300px" }}>
          <Select
            label="Chọn kỳ thống kê"
            options={[
              { value: "daily", label: "Theo ngày" },
              { value: "monthly", label: "Theo tháng" },
              { value: "yearly", label: "Theo năm" },
            ]}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tổng doanh thu</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-semibold text-gray-700">
                {formatCurrency(statistics.totalRevenue || 0)}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tổng số hóa đơn</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-semibold text-gray-700">
                {statistics.totalInvoices || 0}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn đã thanh toán</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-semibold text-gray-700">
                {statistics.paidInvoices || 0}
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Hóa đơn chưa thanh toán</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-2xl font-semibold text-gray-700">
                {statistics.unpaidInvoices || 0}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {statistics &&
        statistics.revenueByPeriod &&
        statistics.revenueByPeriod.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Chi tiết doanh thu theo{" "}
                {period === "daily"
                  ? "ngày"
                  : period === "monthly"
                    ? "tháng"
                    : "năm"}
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {statistics.revenueByPeriod.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-700">
                      {period === "daily"
                        ? format(new Date(item.period), "dd/MM/yyyy", {
                          locale: vi,
                        })
                        : period === "monthly"
                          ? format(new Date(item.period), "MM/yyyy", {
                            locale: vi,
                          })
                          : item.period}
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      {formatCurrency(item.revenue || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
    </DashboardLayout>
  );
}
