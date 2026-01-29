"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as examinationService from "@/lib/services/examinations";
import * as appointmentService from "@/lib/services/appointments";
import {
  IconCalendar,
  IconFileText,
  IconClock,
  IconCircleCheck,
  IconBolt,
  IconStethoscope,
  IconActivity,
  IconBell,
  IconAlertCircle,
  IconTrendingUp,
} from "@tabler/icons-react";
import { DOCTOR_NAV_ITEMS } from "@/lib/navigation";

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    processingExaminations: 0,
    completedExaminations: 0,
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

    if (!isAuthenticated || user?.role !== "doctor") {
      router.push("/login");
      return;
    }
    loadStats();
  }, [user, isAuthenticated, authLoading, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const [appointmentsRes, processingRes, completedRes] = (await Promise.all(
        [
          appointmentService.getAppointments({ status: "confirmed" }),
          examinationService.getExaminations({
            status: "processing",
            doctorId: user?._id,
          }),
          examinationService.getExaminations({
            status: "done",
            doctorId: user?._id,
            limit: 1,
          }),
        ]
      )) as [any, any, any];

      let appointments: any[] = [];
      if (Array.isArray(appointmentsRes)) {
        appointments = appointmentsRes;
      } else if (
        appointmentsRes?.appointments &&
        Array.isArray(appointmentsRes.appointments)
      ) {
        appointments = appointmentsRes.appointments;
      } else if (appointmentsRes?.data) {
        if (Array.isArray(appointmentsRes.data)) {
          appointments = appointmentsRes.data;
        } else if (appointmentsRes.data?.appointments) {
          appointments = appointmentsRes.data.appointments;
        }
      }

      const todayApts =
        appointments.filter((apt: any) => {
          const aptDate = new Date(apt.appointmentDate)
            .toISOString()
            .split("T")[0];
          return aptDate === today;
        }) || [];

      const processingCount =
        processingRes?.examinations?.length ||
        processingRes?.data?.examinations?.length ||
        (Array.isArray(processingRes) ? processingRes.length : 0);

      const completedCount =
        completedRes?.total || completedRes?.data?.total || 0;

      setStats({
        todayAppointments: todayApts.length,
        processingExaminations: processingCount,
        completedExaminations: completedCount,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={DOCTOR_NAV_ITEMS} title="Tổng quan">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DashboardLayout>
    );
  }

  const QUICK_ACTIONS = [
    { label: "Lịch hẹn", icon: <IconCalendar />, path: ROUTES.DOCTOR_APPOINTMENTS, color: "bg-primary" },
    { label: "Ca khám", icon: <IconStethoscope />, path: ROUTES.DOCTOR_EXAMINATIONS, color: "bg-tertiary" },
  ];

  const NOTIFICATIONS = [
    {
      show: stats.todayAppointments > 0,
      color: "primary",
      icon: <IconAlertCircle size={20} />,
      title: "Lịch hẹn hôm nay",
      message: `Bạn có ${stats.todayAppointments} lịch hẹn đã xác nhận trong ngày hôm nay`,
      badge: "HÔM NAY",
    },
    {
      show: stats.processingExaminations > 0,
      color: "tertiary",
      icon: <IconClock size={20} />,
      title: "Ca khám đang xử lý",
      message: `Hiện có ${stats.processingExaminations} ca khám đang chờ bạn hoàn tất`,
      badge: "CẦN XỬ LÝ",
    },
  ];

  const completionRate = stats.completedExaminations > 0
    ? Math.min(((stats.completedExaminations / (stats.completedExaminations + stats.processingExaminations)) * 100), 100).toFixed(0)
    : 0;

  return (
    <DashboardLayout navItems={DOCTOR_NAV_ITEMS} title="Tổng quan">
      <div className="max-w-[1600px] mx-auto">
        {/* Welcome Section */}
        <div className="mb-4">
          <h2 className="text-3xl font-extrabold text-primary leading-tight">
            {greeting}, <span className="text-gray-700">BS. {user?.fullName || "Bác sĩ"}!</span>
          </h2>
          <p className="text-gray-500 mt-2 text-lg">Chúc bạn một ngày làm việc hiệu quả và tràn đầy năng lượng.</p>
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
              <div className="grid grid-cols-2 gap-4">
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
                <span>Thống kê công việc</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Lịch hẹn hôm nay", value: stats.todayAppointments, icon: <IconCalendar />, color: "primary" },
                  { label: "Ca khám đang xử lý", value: stats.processingExaminations, icon: <IconClock />, color: "tertiary" },
                  { label: "Ca khám đã hoàn thành", value: stats.completedExaminations, icon: <IconCircleCheck />, color: "quaternary" },
                ].map((stat, idx) => (
                  <Card
                    key={idx}
                    className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
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
          </div>

          {/* Sidebar Column - Right (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {/* Performance Widget */}
            <Card className="bg-gradient-to-br from-primary to-bubble text-white border-none shadow-xl overflow-hidden relative">
              <div className="absolute top-[-10%] right-[-10%] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <CardBody className="p-4 relative z-10">
                <IconTrendingUp className="mb-4 text-white/80" size={40} />
                <h4 className="text-xl font-semibold mb-3 text-white">Hiệu suất làm việc</h4>
                <div className="text-5xl font-bold mb-2">{completionRate}%</div>
                <p className="text-white/90 leading-relaxed font-medium">
                  Tỷ lệ hoàn thành ca khám của bạn trong thời gian gần đây
                </p>
                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">Mục tiêu</span>
                    <span className="font-semibold">90%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-2">
                    <div
                      className="bg-white rounded-full h-2 transition-all"
                      style={{ width: `${completionRate}%` }}
                    ></div>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Notifications Section */}
            <section className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg border-b border-b-gray-200 pb-4 font-semibold text-primary mb-4 flex items-center gap-2">
                <IconBell size={20} />
                <span>Thông báo</span>
              </h3>
              <div className="space-y-4">
                {NOTIFICATIONS.filter((n) => n.show).map((notif, idx) => (
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
