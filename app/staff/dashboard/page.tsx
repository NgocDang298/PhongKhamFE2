"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ROUTES } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as patientService from "@/lib/services/patients";
import * as invoiceService from "@/lib/services/invoices";
import {
  IconLayoutGrid,
  IconCalendar,
  IconUserSquareRoundeds,
  IconFileText,
  IconSettings,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.STAFF_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.STAFF_APPOINTMENTS,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Bệnh nhân",
    path: ROUTES.STAFF_PATIENTS,
    icon: <IconUserSquareRoundeds size={20} />,
  },
  {
    label: "Hóa đơn",
    path: ROUTES.STAFF_INVOICES,
    icon: <IconFileText size={20} />,
  },
  {
    label: "Dịch vụ",
    path: ROUTES.STAFF_SERVICES,
    icon: <IconSettings size={20} />,
  },
];

export default function StaffDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    pendingAppointments: 0,
    totalPatients: 0,
    unpaidInvoices: 0,
  });
  const [loading, setLoading] = useState(true);

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
      <DashboardLayout navItems={navItems} title="Tổng quan">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tổng quan">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-xl"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                }}
              >
                <IconCalendar size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800">
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
                className="flex items-center justify-center w-14 h-14 rounded-xl"
                style={{
                  background: "rgba(99, 102, 241, 0.1)",
                  color: "#6366f1",
                }}
              >
                <IconUserSquareRoundeds size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800">
                  {stats.totalPatients}
                </div>
                <div className="text-sm text-gray-500">Tổng bệnh nhân</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-14 h-14 rounded-xl"
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#ef4444",
                }}
              >
                <IconFileText size={20} />
              </div>
              <div>
                <div className="text-3xl font-semibold text-gray-800">
                  {stats.unpaidInvoices}
                </div>
                <div className="text-sm text-gray-500">
                  Hóa đơn chưa thanh toán
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader icon={<IconLayoutGrid size={20} />}>
            <CardTitle>Thao tác nhanh</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push(ROUTES.STAFF_APPOINTMENTS)}
                variant="outline"
                fullWidth
                icon={<IconCalendar size={20} />}
              >
                Quản lý lịch hẹn
              </Button>
              <Button
                onClick={() => router.push(ROUTES.STAFF_PATIENTS)}
                variant="outline"
                fullWidth
                icon={<IconUserSquareRoundeds size={20} />}
              >
                Quản lý bệnh nhân
              </Button>
              <Button
                onClick={() => router.push(ROUTES.STAFF_INVOICES)}
                variant="outline"
                fullWidth
                icon={<IconFileText size={20} />}
              >
                Quản lý hóa đơn
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
