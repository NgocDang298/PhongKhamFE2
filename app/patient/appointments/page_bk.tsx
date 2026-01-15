"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { ROUTES, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as profileService from "@/lib/services/profile";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.PATIENT_DASHBOARD,
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
    label: "Lịch hẹn",
    path: ROUTES.PATIENT_APPOINTMENTS,
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
    label: "Đặt lịch",
    path: ROUTES.PATIENT_BOOK_APPOINTMENT,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
  },
];

export default function PatientAppointments() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadAppointments();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      console.log("Fetching appointments with params:", params);

      // Sử dụng getMyAppointments để lấy lịch hẹn của chính bệnh nhân
      const response = await profileService.getMyAppointments(params);

      console.log("Appointments API response:", response);

      // Handle different response formats
      if (response.data) {
        if (Array.isArray(response.data)) {
          // Response is directly an array
          setAppointments(response.data);
        } else if (
          response.data.appointments &&
          Array.isArray(response.data.appointments)
        ) {
          // Response has appointments property
          setAppointments(response.data.appointments);
        } else {
          console.warn("Unexpected response format:", response.data);
          setAppointments([]);
        }
      } else {
        setAppointments([]);
      }
    } catch (error: any) {
      console.error("Error loading appointments:", error);
      setError(
        error.message || "Không thể tải danh sách lịch hẹn. Vui lòng thử lại."
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedAppointment) return;
    try {
      await appointmentService.cancelAppointment(selectedAppointment._id);
      setCancelModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "cancelled":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <DashboardLayout navItems={navItems} title="Lịch hẹn của tôi">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div style={{ maxWidth: "300px" }}>
          <Select
            label="Lọc theo trạng thái"
            options={[
              { value: "", label: "Tất cả" },
              { value: "pending", label: "Chờ xác nhận" },
              { value: "confirmed", label: "Đã xác nhận" },
              { value: "cancelled", label: "Đã hủy" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          />
        </div>
        <Button
          onClick={() => router.push(ROUTES.PATIENT_BOOK_APPOINTMENT)}
          icon={
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          }
        >
          Đặt lịch mới
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              Đang tải...
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
              <Button onClick={loadAppointments} variant="outline">
                Thử lại
              </Button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có lịch hẹn nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ngày giờ</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell>
                      {format(
                        new Date(apt.appointmentDate),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>
                      {typeof apt.doctorId === "object" && apt.doctorId
                        ? apt.doctorId.fullName
                        : "Chưa chọn bác sĩ"}
                    </TableCell>
                    <TableCell>
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor: getStatusColor(apt.status) + "20",
                          color: getStatusColor(apt.status),
                        }}
                      >
                        {
                          APPOINTMENT_STATUS_LABELS[
                            apt.status as keyof typeof APPOINTMENT_STATUS_LABELS
                          ]
                        }
                      </span>
                    </TableCell>
                    <TableCell>{apt.note || "-"}</TableCell>
                    <TableCell>
                      {apt.status === "pending" ||
                      apt.status === "confirmed" ? (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(apt);
                            setCancelModalOpen(true);
                          }}
                        >
                          Hủy
                        </Button>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      <Modal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Xác nhận hủy lịch hẹn"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Đóng
            </Button>
            <Button variant="danger" onClick={handleCancel}>
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
        {selectedAppointment && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              background: "#f3f4f6",
              borderRadius: "0.5rem",
            }}
          >
            <div>
              <strong>Ngày giờ:</strong>{" "}
              {format(
                new Date(selectedAppointment.appointmentDate),
                "dd/MM/yyyy HH:mm",
                { locale: vi }
              )}
            </div>
            {typeof selectedAppointment.doctorId === "object" &&
              selectedAppointment.doctorId && (
                <div>
                  <strong>Bác sĩ:</strong>{" "}
                  {selectedAppointment.doctorId.fullName}
                </div>
              )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
