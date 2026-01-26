"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import * as appointmentService from "@/lib/services/appointments";
import * as serviceService from "@/lib/services/services";
import { formatCurrency } from "@/lib/utils";
import {
  IconLayoutGrid,
  IconUserSquareRounded,
  IconSettings,
  IconCalendar,
  IconChartBar,
  IconCurrencyDollar,
  IconPackage,
  IconFileText,
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

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    paidAmount: 0,
    unpaidAmount: 0,
    totalServices: 0,
    pendingAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadStats();
  }, [user, isAuthenticated, authLoading, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [revenueRes, servicesRes, appointmentsRes] = await Promise.all([
        invoiceService.getRevenueStatistics({ period: "monthly" }),
        serviceService.getServices(),
        appointmentService.getAppointments({ status: "pending" }),
      ]);

      setStats({
        totalRevenue: revenueRes.data?.totalRevenue || 0,
        paidAmount: revenueRes.data?.paidAmount || 0,
        unpaidAmount: revenueRes.data?.unpaidAmount || 0,
        totalServices: servicesRes.data?.services?.length || 0,
        pendingAppointments: appointmentsRes.data?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tổng quan">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tổng quan">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                }}
              >
                <IconCurrencyDollar size={20} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {formatCurrency(stats.totalRevenue)}
                </div>
                <div className="text-sm text-gray-500">Tổng doanh thu</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                }}
              >
                <IconPackage size={20} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {stats.totalServices}
                </div>
                <div className="text-sm text-gray-500">Tổng dịch vụ</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                }}
              >
                <IconCalendar size={20} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {stats.pendingAppointments}
                </div>
                <div className="text-sm text-gray-500">
                  Lịch hẹn chờ xác nhận
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                }}
              >
                <IconFileText size={20} />
              </div>
              <div>
                <div className="text-2xl font-semibold text-gray-800">
                  {formatCurrency(stats.unpaidAmount)}
                </div>
                <div className="text-sm text-gray-500">Chưa thanh toán</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Tổng quan doanh thu</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Tổng doanh thu
                </div>
                <div className="text-2xl font-semibold text-gray-800">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Đã thanh toán
                </div>
                <div className="text-2xl font-semibold text-emerald-600">
                  {formatCurrency(stats.paidAmount)}
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Chưa thanh toán
                </div>
                <div className="text-2xl font-semibold text-red-600">
                  {formatCurrency(stats.unpaidAmount)}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
