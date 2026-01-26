"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as profileService from "@/lib/services/profile";
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconCalendar,
  IconClock,
  IconStethoscope,
  IconFileDescription,
  IconMessage2,
  IconBolt,
  IconHeartRateMonitor,
  IconChevronRight,
  IconBell,
  IconCalendarPlus,
  IconReceipt,
  IconUserSquareRounded,
  IconFileText,
} from "@tabler/icons-react";

export default function PatientDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalAppointments: 0,
    upcomingAppointments: 0,
    totalExaminations: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState<any[]>([]);
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

    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }

    loadData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [profileRes, appointmentsRes] = await Promise.all([
        profileService.getProfile(),
        profileService.getMyAppointments({ limit: 5 }),
      ]);

      if (profileRes.data?.stats) {
        setStats({
          totalAppointments: profileRes.data.stats.totalAppointments || 0,
          totalExaminations: profileRes.data.stats.totalExaminations || 0,
          upcomingAppointments: profileRes.data.stats.upcomingAppointments || 0,
        });
      }

      if (appointmentsRes.data?.appointments) {
        setRecentAppointments(appointmentsRes.data.appointments);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Tổng quan">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors = {
    pending: "bg-tertiary/10 text-tertiary border-tertiary/20",
    confirmed: "bg-primary/10 text-primary border-primary/20",
    cancelled: "bg-secondary/10 text-secondary border-secondary/20",
  };

  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };

  const QUICK_ACTIONS = [
    { label: "Đặt lịch mới", icon: <IconCalendarPlus />, path: ROUTES.PATIENT_BOOK_APPOINTMENT, color: "bg-primary" },
    { label: "Xem hồ sơ", icon: <IconFileText />, path: ROUTES.PATIENT_MEDICAL_PROFILE, color: "bg-secondary" },
    { label: "Xem hóa đơn", icon: <IconReceipt />, path: ROUTES.PATIENT_INVOICES, color: "bg-tertiary" },
    { label: "Tài khoản", icon: <IconUserSquareRounded />, path: ROUTES.PATIENT_PROFILE, color: "bg-quaternary" },
  ];

  const HEALTH_TIPS = [
    "Uống đủ 2 lít nước mỗi ngày để cơ thể luôn khỏe mạnh.",
    "Bổ sung nhiều rau xanh và trái cây trong các bữa ăn.",
    "Duy trì thói quen tập thể dục ít nhất 30 phút mỗi ngày.",
    "Ngủ đủ 7-8 tiếng để tái tạo năng lượng cho ngày mới.",
  ];

  const randomTip = HEALTH_TIPS[Math.floor(Math.random() * HEALTH_TIPS.length)];

  return (
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Tổng quan">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-primary leading-tight">
            {greeting}, <span className="text-gray-800">{user?.fullName || "Bệnh nhân"}</span>!
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Hôm nay bạn cảm thấy thế nào? Hãy theo dõi tình trạng sức khỏe của mình nhé.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Column - Left (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Actions Hub */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBolt size={20} />
                <span>Thao tác nhanh</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => router.push(action.path)}
                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      {action.icon}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{action.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Tổng lịch hẹn", value: stats.totalAppointments, icon: <IconCalendar />, color: "bg-primary/10 text-primary" },
                  { label: "Sắp tới", value: stats.upcomingAppointments, icon: <IconClock />, color: "bg-secondary/10 text-secondary" },
                  { label: "Ca khám", value: stats.totalExaminations, icon: <IconStethoscope />, color: "bg-tertiary/10 text-tertiary" },
                ].map((stat, idx) => (
                  <Card key={idx} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <CardBody className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div>
                          <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </section>
            {/* Recent Appointments Feed */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center mb-4 justify-between border-b border-gray-200 pb-4">
                <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                  <IconCalendar size={20} />
                  <span>Lịch hẹn gần đây</span>
                </h3>
                <button
                  onClick={() => router.push(ROUTES.PATIENT_APPOINTMENTS)}
                  className="text-primary text-sm font-semibold flex items-center gap-1 hover:underline"
                >
                  Xem tất cả <IconChevronRight size={16} />
                </button>
              </div>
              <Card className="border-none shadow-sm overflow-hidden">
                <CardBody className="!p-0">
                  {recentAppointments.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <IconFileDescription size={64} className="mx-auto mb-4 text-gray-200" />
                      <p className="font-medium">Chưa có lịch hẹn nào được ghi nhận</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50 space-y-2">
                      {recentAppointments.map((apt) => (
                        <div
                          key={apt._id}
                          className="flex items-center rounded-lg cursor-pointer justify-between p-5 hover:bg-gray-100 bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-5">
                            <div className="flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 border border-gray-200">
                              <span className="text-xs font-semibold uppercase">{format(new Date(apt.appointmentDate), "MMM", { locale: vi })}</span>
                              <span className="text-xl font-bold text-gray-800">{format(new Date(apt.appointmentDate), "dd")}</span>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {format(new Date(apt.appointmentDate), "HH:mm", { locale: vi })} — Lịch khám bệnh
                              </div>
                              {typeof apt.doctorId === "object" && apt.doctorId && (
                                <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                  <IconStethoscope size={14} /> Bác sĩ: {apt.doctorId.fullName}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-sm font-semibold rounded-full border shadow-sm ${statusColors[apt.status as keyof typeof statusColors]}`}>
                            {statusLabels[apt.status as keyof typeof statusLabels]}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>
            </section>
          </div>

          {/* Sidebar Column - Right (4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Health Tip Widget */}
            <Card className="bg-gradient-to-br from-primary to-bubble text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <CardBody className="p-4 relative z-10">
                <IconHeartRateMonitor className="mb-4 text-white/80" size={40} />
                <h4 className="text-xl font-semibold mb-3 text-white">Lời khuyên hôm nay</h4>
                <p className="text-white/90 leading-relaxed font-medium italic">"{randomTip}"</p>
                <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-widest text-white/60">Health Insight</span>
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-white/20 border-2 border-primary"></div>)}
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notifications / Alerts Section */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBell size={20} />
                <span>Thông báo mới</span>
              </h3>
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <IconMessage2 size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-primary">Tin nhắn từ bác sĩ</h5>
                    <p className="text-sm text-primary/70 mt-1">Bác sĩ Nguyễn Văn A đã phản hồi lời nhắn của bạn...</p>
                    <span className="text-xs text-primary mt-2 block font-semibold">2 GIỜ TRƯỚC</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-tertiary/5 border border-tertiary/10 flex gap-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-tertiary text-white flex items-center justify-center">
                    <IconFileDescription size={20} />
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-tertiary">Kết quả xét nghiệm</h5>
                    <p className="text-sm text-tertiary/70 mt-1">Kết quả xét nghiệm tổng quát ngày 20/01 đã có...</p>
                    <span className="text-xs text-tertiary mt-2 block font-semibold">HÔM QUA</span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
