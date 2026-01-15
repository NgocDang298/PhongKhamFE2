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

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.ADMIN_DASHBOARD,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Quản lý tài khoản",
    path: ROUTES.ADMIN_USERS,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: "Quản lý dịch vụ",
    path: ROUTES.ADMIN_SERVICES,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="2" x2="12" y2="6" />
        <line x1="12" y1="18" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    label: "Quản lý lịch làm việc",
    path: ROUTES.ADMIN_SCHEDULES,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Thống kê",
    path: ROUTES.ADMIN_STATISTICS,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="8" width="18" height="4" rx="1" />
                  <path d="M12 8v13" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
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
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Tổng doanh thu
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRevenue)}
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Đã thanh toán
                </div>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(stats.paidAmount)}
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-xl">
                <div className="text-sm font-medium text-gray-500 mb-2">
                  Chưa thanh toán
                </div>
                <div className="text-2xl font-bold text-red-600">
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
