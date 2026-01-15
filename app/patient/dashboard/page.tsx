"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as profileService from "@/lib/services/profile";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutDashboard,
  IconCalendar,
  IconCalendarPlus,
  IconFileText,
  IconReceipt,
  IconUser,
  IconClock,
  IconStethoscope,
  IconFileDescription,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.PATIENT_DASHBOARD,
    icon: <IconLayoutDashboard size={20} />,
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.PATIENT_APPOINTMENTS,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Đặt lịch",
    path: ROUTES.PATIENT_BOOK_APPOINTMENT,
    icon: <IconCalendarPlus size={20} />,
  },
  {
    label: "Lịch sử khám",
    path: ROUTES.PATIENT_MEDICAL_HISTORY,
    icon: <IconFileText size={20} />,
  },
  {
    label: "Hóa đơn",
    path: ROUTES.PATIENT_INVOICES,
    icon: <IconReceipt size={20} />,
  },
  {
    label: "Hồ sơ",
    path: ROUTES.PATIENT_PROFILE,
    icon: <IconUser size={20} />,
  },
];

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
      <DashboardLayout navItems={navItems} title="Tổng quan">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Đang tải...</div>
        </div>
      </DashboardLayout>
    );
  }

  const statusColors = {
    pending: "bg-warning-100 text-warning-700 border-warning-200",
    confirmed: "bg-success-100 text-success-700 border-success-200",
    cancelled: "bg-danger-100 text-danger-700 border-danger-200",
  };

  const statusLabels = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    cancelled: "Đã hủy",
  };

  return (
    <DashboardLayout navItems={navItems} title="Tổng quan">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary">
                <IconCalendar size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalAppointments}
                </div>
                <div className="text-sm text-gray-500">Tổng lịch hẹn</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-success-100 text-success-600">
                <IconClock size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.upcomingAppointments}
                </div>
                <div className="text-sm text-gray-500">Lịch hẹn sắp tới</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-purple-100 text-purple-600">
                <IconStethoscope size={28} />
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900">
                  {stats.totalExaminations}
                </div>
                <div className="text-sm text-gray-500">Ca khám</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch hẹn gần đây</CardTitle>
        </CardHeader>
        <CardBody>
          {recentAppointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <IconFileDescription
                size={48}
                className="mx-auto mb-4 text-gray-300"
              />
              <p>Chưa có lịch hẹn nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-primary/30 hover:bg-primary/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gray-100">
                      <IconCalendar size={24} className="text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {format(
                          new Date(apt.appointmentDate),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </div>
                      {typeof apt.doctorId === "object" && apt.doctorId && (
                        <div className="text-sm text-gray-500">
                          Bác sĩ: {apt.doctorId.fullName}
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full border ${
                      statusColors[apt.status as keyof typeof statusColors]
                    }`}
                  >
                    {statusLabels[apt.status as keyof typeof statusLabels]}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6">
            <button
              onClick={() => router.push(ROUTES.PATIENT_APPOINTMENTS)}
              className="w-full px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
            >
              Xem tất cả lịch hẹn
            </button>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
