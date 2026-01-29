"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import * as appointmentService from "@/lib/services/appointments";
import * as serviceService from "@/lib/services/services";
import { formatCurrency } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";
import {
  IconCurrencyDollar,
  IconPackage,
  IconFileText,
  IconBolt,
  IconChartBar,
  IconUsers,
  IconCalendar,
  IconSettings,
  IconTrendingUp,
  IconTrendingDown,
  IconActivity,
  IconBell,
  IconAlertCircle,
  IconCircleCheck,
} from "@tabler/icons-react";

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
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Chào buổi sáng");
    else if (hour < 18) setGreeting("Chào buổi chiều");
    else setGreeting("Chào buổi tối");
  }, []);

  useEffect(() => {
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
      <DashboardLayout navItems={ADMIN_NAV_ITEMS} title="Tổng quan">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DashboardLayout>
    );
  }

  const QUICK_ACTIONS = [
    { label: "Quản lý người dùng", icon: <IconUsers />, path: ROUTES.ADMIN_USERS, color: "bg-primary" },
    { label: "Quản lý dịch vụ", icon: <IconSettings />, path: ROUTES.ADMIN_SERVICES, color: "bg-secondary" },
    { label: "Lịch làm việc", icon: <IconCalendar />, path: ROUTES.ADMIN_SCHEDULES, color: "bg-tertiary" },
    { label: "Thống kê", icon: <IconChartBar />, path: ROUTES.ADMIN_STATISTICS, color: "bg-quaternary" },
  ];

  const revenueGrowth = stats.totalRevenue > 0 ? ((stats.paidAmount / stats.totalRevenue) * 100).toFixed(1) : 0;

  const REVENUE_STATS = [
    {
      label: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: <IconCurrencyDollar size={24} />,
      color: "primary",
      trend: { icon: <IconTrendingUp size={14} />, label: "+12.5%" },
    },
    {
      label: "Đã thanh toán",
      value: formatCurrency(stats.paidAmount),
      icon: <IconCircleCheck size={24} />,
      color: "tertiary",
      trend: { label: `${revenueGrowth}% tổng` },
    },
    {
      label: "Chưa thanh toán",
      value: formatCurrency(stats.unpaidAmount),
      icon: <IconFileText size={24} />,
      color: "secondary",
      trend: { icon: <IconTrendingDown size={14} />, label: "Cần xử lý" },
    },
  ];

  const SYSTEM_STATS = [
    {
      label: "Tổng dịch vụ",
      value: stats.totalServices,
      icon: <IconPackage size={24} />,
      color: "quaternary",
    },
    {
      label: "Lịch chờ xác nhận",
      value: stats.pendingAppointments,
      icon: <IconCalendar size={24} />,
      color: "tertiary",
    },
  ];

  const NOTIFICATIONS = [
    {
      show: stats.pendingAppointments > 0,
      color: "tertiary",
      icon: <IconAlertCircle size={20} />,
      title: "Lịch hẹn chờ xác nhận",
      message: `Có ${stats.pendingAppointments} lịch hẹn đang chờ xác nhận`,
      badge: "CẦN XỬ LÝ",
    },
    {
      show: stats.unpaidAmount > 0,
      color: "secondary",
      icon: <IconFileText size={20} />,
      title: "Hóa đơn chưa thanh toán",
      message: `Tổng ${formatCurrency(stats.unpaidAmount)} chưa được thanh toán`,
      badge: "THEO DÕI",
    },
    {
      show: true,
      color: "primary",
      icon: <IconCircleCheck size={20} />,
      title: "Hệ thống hoạt động tốt",
      message: "Tất cả các dịch vụ đang hoạt động bình thường",
      badge: "TRẠNG THÁI TỐT",
    },
  ];

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS} title="Tổng quan">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-primary leading-tight">
            {greeting}, <span className="text-gray-700">{user?.fullName || "Quản trị viên"}!</span>
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Theo dõi và quản lý toàn bộ hệ thống phòng khám của bạn.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Main Column - Left (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Quick Actions Hub */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBolt size={20} />
                <span>Thao tác nhanh</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => router.push(action.path)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 text-center">{action.label}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Revenue Statistics */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconChartBar size={20} />
                <span>Thống kê doanh thu</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {REVENUE_STATS.map((stat, idx) => (
                  <Card
                    key={idx}
                    className={`border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-${stat.color}/5 to-white`}
                  >
                    <CardBody className="!p-3">
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center flex-shrink-0 justify-center w-8 h-8 rounded-full bg-${stat.color}/10 text-${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wider mb-1">
                            {stat.label}
                          </div>
                          <div className="text-xl font-semibold text-gray-700">{stat.value}</div>
                          {stat.trend && (
                            <div className="flex items-center gap-1 mt-1">
                              {stat.trend.icon && <span className={`text-${stat.color}`}>{stat.trend.icon}</span>}
                              <span className={`text-xs font-semibold text-${stat.color}`}>{stat.trend.label}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>

            {/* System Overview */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconActivity size={20} />
                <span>Tổng quan hệ thống</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {SYSTEM_STATS.map((stat, idx) => (
                  <Card key={idx} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl bg-${stat.color}/10 text-${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-3xl font-semibold text-gray-700">{stat.value}</div>
                          <div className="text-xs font-medium text-gray-600 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column - Right (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Revenue Progress Widget */}
            <Card className="bg-gradient-to-br from-primary to-bubble text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <CardBody className="p-4 relative z-10">
                <IconTrendingUp className="mb-4 text-white/80" size={40} />
                <h4 className="text-xl font-semibold mb-3 text-white">Tỷ lệ thanh toán</h4>
                <div className="text-5xl font-bold mb-2">{revenueGrowth}%</div>
                <p className="text-white/90 leading-relaxed font-medium">
                  Doanh thu đã thu được {revenueGrowth}% tổng doanh thu trong tháng này
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Mục tiêu</span>
                    <span className="font-semibold">85%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${Math.min(parseFloat(revenueGrowth.toString()), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Alerts / Notifications Section */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBell size={20} />
                <span>Thông báo hệ thống</span>
              </h3>
              <div className="space-y-4">
                {NOTIFICATIONS.filter((notif) => notif.show).map((notif, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl bg-${notif.color}/10 border border-${notif.color}/20 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${notif.color} text-white flex items-center justify-center`}>
                      {notif.icon}
                    </div>
                    <div>
                      <h5 className={`text-sm font-semibold text-${notif.color}`}>{notif.title}</h5>
                      <p className={`text-sm text-${notif.color}/70 mt-1`}>{notif.message}</p>
                      <span className={`text-xs text-${notif.color} mt-2 block font-semibold`}>{notif.badge}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
