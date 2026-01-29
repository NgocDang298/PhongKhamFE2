"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import { STAFF_NAV_ITEMS } from "@/lib/navigation";
import * as appointmentService from "@/lib/services/appointments";
import * as patientService from "@/lib/services/patients";
import * as invoiceService from "@/lib/services/invoices";
import {
  IconLayoutGrid,
  IconCalendar,
  IconUserSquareRounded,
  IconFileText,
  IconSettings,
  IconBolt,
  IconBell,
  IconAlertCircle,
  IconUsers,
  IconChevronRight,
  IconActivity,
  IconBriefcase,
  IconTrendingUp,
  IconChecklist,
} from "@tabler/icons-react";

export default function StaffDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    totalPatients: 0,
    unpaidInvoices: 0,
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
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (
      !isAuthenticated ||
      (user?.role !== "staff" && user?.role !== "admin")
    ) {
      router.push("/login");
      return;
    }
    loadStats();
  }, [user, isAuthenticated, authLoading, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, patientsRes, invoicesRes] = await Promise.all([
        appointmentService.getAppointments({ status: "pending" }),
        patientService.getPatients(),
        invoiceService.getInvoices({ status: "unpaid" }),
      ]);

      setStats({
        pendingAppointments: appointmentsRes.data?.length || 0,
        totalPatients: patientsRes.data?.length || 0,
        unpaidInvoices: invoicesRes.data?.invoices?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Tổng quan">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  const QUICK_ACTIONS = [
    { label: "Tiếp đón & Lịch hẹn", icon: <IconCalendar />, path: ROUTES.STAFF_APPOINTMENTS, color: "bg-primary" },
    { label: "Hồ sơ bệnh nhân", icon: <IconUserSquareRounded />, path: ROUTES.STAFF_PATIENTS, color: "bg-tertiary" },
    { label: "Thanh toán hóa đơn", icon: <IconFileText />, path: ROUTES.STAFF_INVOICES, color: "bg-secondary" },
    { label: "Cài đặt hệ thống", icon: <IconSettings />, path: "/staff/settings", color: "bg-quaternary" },
  ];

  const NOTIFICATIONS = [
    {
      show: stats.pendingAppointments > 0,
      color: "primary",
      icon: <IconAlertCircle size={20} />,
      title: "Lịch hẹn mới",
      message: `Có ${stats.pendingAppointments} lịch hẹn đang chờ bạn xác nhận và sắp xếp.`,
      badge: "ƯU TIÊN",
    },
    {
      show: stats.unpaidInvoices > 0,
      color: "tertiary",
      icon: <IconFileText size={20} />,
      title: "Hóa đơn chờ thu phí",
      message: `Hiện có ${stats.unpaidInvoices} hóa đơn đã hoàn thành khám chưa được thanh toán.`,
      badge: "CẦN THU PHÍ",
    },
  ];

  return (
    <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Tổng quan">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-primary leading-tight">
            {greeting}, <span className="text-gray-700">{user?.fullName || "Nhân viên"}!</span>
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Chào mừng bạn trở lại. Hãy kiểm tra các lịch hẹn và hóa đơn cần xử lý trong ngày.</p>
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

            {/* Dashboard Stats */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconActivity size={20} />
                <span>Số liệu trong ngày</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Lịch hẹn chờ", value: stats.pendingAppointments, icon: <IconCalendar />, color: "primary" },
                  { label: "Tổng bệnh nhân", value: stats.totalPatients, icon: <IconUserSquareRounded />, color: "tertiary" },
                  { label: "Hóa đơn chưa thu", value: stats.unpaidInvoices, icon: <IconFileText />, color: "secondary" },
                ].map((stat, idx) => (
                  <Card
                    key={idx}
                    className={`border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50`}
                  >
                    <CardBody className="!p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-2xl bg-${stat.color}/10 text-${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-700">{stat.value}</div>
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Tasks List (Mock) */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4 justify-between border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                  <IconChecklist size={20} />
                  <span>Danh sách công việc</span>
                </h3>
              </div>
              <div className="space-y-2">
                {[
                  { title: "Xác nhận lịch hẹn từ Bệnh nhân Nguyễn Văn A", time: "10 phút trước", status: "pending" },
                  { title: "Thu phí hóa đơn #INV-2023001", time: "25 phút trước", status: "urgent" },
                  { title: "Cập nhập hồ sơ y tế bệnh nhân Trần Thị B", time: "1 giờ trước", status: "completed" },
                ].map((task, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-primary/30 transition-all cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-10 rounded-full ${task.status === 'urgent' ? 'bg-secondary' : task.status === 'pending' ? 'bg-primary' : 'bg-success'}`}></div>
                      <div>
                        <div className="font-semibold text-gray-700 group-hover:text-primary transition-colors">{task.title}</div>
                        <div className="text-xs text-gray-400">{task.time}</div>
                      </div>
                    </div>
                    <IconChevronRight size={18} className="text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar Column - Right (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Work Efficiency Widget */}
            <Card className="bg-gradient-to-br from-tertiary to-primary text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <CardBody className="p-4 relative z-10">
                <IconBriefcase className="mb-4 text-white/80" size={40} />
                <h4 className="text-xl font-semibold mb-3 text-white">Tiến độ công việc</h4>
                <div className="text-5xl font-bold mb-2">78%</div>
                <p className="text-white/90 leading-relaxed font-medium text-sm">
                  Bạn đã hoàn thành 78% mục tiêu công việc được giao trong ngày hôm nay.
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Hiệu suất tháng</span>
                    <span className="font-semibold">+12.5%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div className="bg-white rounded-full h-2 transition-all w-[78%]"></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notifications Section */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBell size={20} />
                <span>Thông báo hệ thống</span>
              </h3>
              <div className="space-y-4">
                {NOTIFICATIONS.filter(n => n.show).map((notif, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl bg-${notif.color}/5 border border-${notif.color}/10 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full bg-${notif.color} text-white flex items-center justify-center`}>
                      {notif.icon}
                    </div>
                    <div>
                      <h5 className={`text-sm font-semibold text-${notif.color}`}>{notif.title}</h5>
                      <p className={`text-sm text-${notif.color}/70 mt-1`}>{notif.message}</p>
                      <span className={`text-xs text-${notif.color} mt-2 block font-semibold uppercase`}>{notif.badge}</span>
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

