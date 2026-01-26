"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as examinationService from "@/lib/services/examinations";
import * as appointmentService from "@/lib/services/appointments";
import {
  IconLayoutGrid,
  IconCalendar,
  IconFileText,
  IconClock,
  IconCircleCheck,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.DOCTOR_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.DOCTOR_APPOINTMENTS,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Ca khám",
    path: ROUTES.DOCTOR_EXAMINATIONS,
    icon: <IconFileText size={20} />,
  },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    processingExaminations: 0,
    completedExaminations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
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

      console.log("Loading dashboard stats for doctor:", user?._id);

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

      console.log("Dashboard raw responses:", {
        appointmentsRes,
        processingRes,
        completedRes,
      });

      // Handle unwrapped responses with multiple possible structures
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

      // Backend API already filters by current doctor, just filter by today's date
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

      console.log("Dashboard stats:", {
        todayAppointments: todayApts.length,
        processingExaminations: processingCount,
        completedExaminations: completedCount,
      });

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
      <DashboardLayout navItems={navItems} title="Tổng quan">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tổng quan">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-white to-gray-50">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl flex items-center justify-center shadow-inner"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                }}
              >
                <IconCalendar size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800 leading-none mb-1">
                  {stats.todayAppointments}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Lịch hẹn hôm nay
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-white to-gray-50">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl flex items-center justify-center shadow-inner"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                }}
              >
                <IconClock size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800 leading-none mb-1">
                  {stats.processingExaminations}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ca khám đang xử lý
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-300 border-none bg-gradient-to-br from-white to-gray-50">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="p-3 rounded-2xl flex items-center justify-center shadow-inner"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                }}
              >
                <IconCircleCheck size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800 leading-none mb-1">
                  {stats.completedExaminations}
                </div>
                <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  Ca khám đã hoàn thành
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
