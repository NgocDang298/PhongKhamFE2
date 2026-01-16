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
import * as examinationService from "@/lib/services/examinations";
import * as serviceService from "@/lib/services/services";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconFileText,
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

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStartExamModalOpen, setIsStartExamModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "doctor") {
      router.push("/login");
      return;
    }
    loadAppointments();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }

      console.log("Loading appointments with params:", params);

      // Doctor doesn't have access to /patients endpoint
      // The /appointments API already returns populated patient data in patientId field
      const appointmentsResponse = (await appointmentService.getAppointments(
        params
      )) as any;

      console.log("Raw appointments response:", appointmentsResponse);

      // Response is already unwrapped by interceptor
      // Handle different response structures:
      // 1. { appointments: [], total: number } - paginated response
      // 2. { data: [...] } - wrapped in data property
      // 3. [...] - direct array
      let appointmentsData: any[] = [];
      if (Array.isArray(appointmentsResponse)) {
        appointmentsData = appointmentsResponse;
      } else if (
        appointmentsResponse?.appointments &&
        Array.isArray(appointmentsResponse.appointments)
      ) {
        appointmentsData = appointmentsResponse.appointments;
      } else if (appointmentsResponse?.data) {
        if (Array.isArray(appointmentsResponse.data)) {
          appointmentsData = appointmentsResponse.data;
        } else if (appointmentsResponse.data?.appointments) {
          appointmentsData = appointmentsResponse.data.appointments;
        }
      }

      console.log("Processed appointments:", appointmentsData);
      console.log("Sample appointment:", appointmentsData[0]);

      // Backend API already filters by current doctor, no need to filter again
      setAppointments(appointmentsData);

      // Load services for start examination feature
      try {
        const servicesRes = (await serviceService.getServices({
          serviceType: "examination",
          isActive: true,
        })) as any;
        let servicesData: any[] = [];
        if (Array.isArray(servicesRes)) {
          servicesData = servicesRes;
        } else if (
          servicesRes?.services &&
          Array.isArray(servicesRes.services)
        ) {
          servicesData = servicesRes.services;
        } else if (servicesRes?.data) {
          servicesData = Array.isArray(servicesRes.data)
            ? servicesRes.data
            : servicesRes.data.services || [];
        }
        setServices(servicesData);
      } catch (error) {
        console.warn("Could not load services:", error);
        setServices([]);
      }
    } catch (error) {
      console.error("Error loading appointments:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleOpenStartExam = (appointment: any) => {
    setSelectedAppointment(appointment);
    setSelectedServiceId("");
    setIsStartExamModalOpen(true);
  };

  const handleStartExamination = async () => {
    if (!selectedAppointment || !selectedServiceId) {
      alert("Vui lòng chọn dịch vụ");
      return;
    }

    try {
      // Get staffId from appointment's confirmedBy or undefined if missing
      // We allow starting without staffId if the backend permits or if it was auto-confirmed
      const staffId = selectedAppointment.confirmedBy
        ? typeof selectedAppointment.confirmedBy === "object"
          ? selectedAppointment.confirmedBy._id
          : selectedAppointment.confirmedBy
        : undefined;

      if (!staffId) {
        console.warn("Starting examination without confirmedBy staff ID");
      }

      const dataToSubmit: any = {
        appointmentId: selectedAppointment._id,
        serviceId: selectedServiceId,
      };

      // Only include staffId if it exists
      if (staffId) {
        dataToSubmit.staffId = staffId;
      }

      await examinationService.startExamination(dataToSubmit);
      setIsStartExamModalOpen(false);
      setSelectedAppointment(null);
      setSelectedServiceId("");
      alert("Đã bắt đầu ca khám thành công!");
      router.push(ROUTES.DOCTOR_EXAMINATIONS);
    } catch (error: any) {
      console.error("Start examination error:", error);
      alert(error.message || "Có lỗi xảy ra khi bắt đầu ca khám");
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

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Lịch hẹn của tôi">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Lịch hẹn của tôi">
      <div className="flex justify-between items-center mb-4">
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
      </div>

      <Card>
        <CardHeader icon={<IconCalendar size={20} />}>
          <CardTitle>Danh sách lịch hẹn</CardTitle>
        </CardHeader>
        <CardBody>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              Chưa có lịch hẹn nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày giờ</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ghi chú</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((apt) => (
                  <TableRow key={apt._id}>
                    <TableCell>
                      {typeof apt.patientId === "object" && apt.patientId
                        ? apt.patientId.fullName
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(apt.appointmentDate),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full"
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
                      <div style={{ display: "flex", gap: "8px" }}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(apt)}
                        >
                          Xem chi tiết
                        </Button>
                        {apt.status === "confirmed" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleOpenStartExam(apt)}
                          >
                            Bắt đầu khám
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* View Details Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Chi tiết lịch hẹn"
        size="md"
        footer={
          <Button
            variant="outline"
            onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedAppointment(null);
            }}
          >
            Đóng
          </Button>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Bệnh nhân
                </label>
                <div className="font-medium">
                  {typeof selectedAppointment.patientId === "object" &&
                  selectedAppointment.patientId
                    ? selectedAppointment.patientId.fullName
                    : "N/A"}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Ngày giờ
                </label>
                <div className="font-medium">
                  {format(
                    new Date(selectedAppointment.appointmentDate),
                    "dd/MM/yyyy HH:mm",
                    { locale: vi }
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Trạng thái
                </label>
                <div>
                  <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full">
                    {
                      APPOINTMENT_STATUS_LABELS[
                        selectedAppointment.status as keyof typeof APPOINTMENT_STATUS_LABELS
                      ]
                    }
                  </span>
                </div>
              </div>
              {selectedAppointment.confirmedBy && (
                <div>
                  <label className="text-sm text-gray-500 block mb-1">
                    Người xác nhận
                  </label>
                  <div className="font-medium">
                    {typeof selectedAppointment.confirmedBy === "object"
                      ? selectedAppointment.confirmedBy.fullName || "N/A"
                      : "ID: " + selectedAppointment.confirmedBy}
                  </div>
                </div>
              )}
            </div>

            {selectedAppointment.note && (
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Ghi chú
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-100">
                  {selectedAppointment.note}
                </div>
              </div>
            )}

            {/* More patient info if available */}
            {typeof selectedAppointment.patientId === "object" &&
              selectedAppointment.patientId && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <h4 className="font-medium mb-2 text-gray-900">
                    Thông tin bệnh nhân
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Giới tính:</span>{" "}
                      {selectedAppointment.patientId.gender === "male"
                        ? "Nam"
                        : selectedAppointment.patientId.gender === "female"
                        ? "Nữ"
                        : "Khác"}
                    </div>
                    <div>
                      <span className="text-gray-500">Số điện thoại:</span>{" "}
                      {selectedAppointment.patientId.phoneNumber || "N/A"}
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Địa chỉ:</span>{" "}
                      {selectedAppointment.patientId.address || "N/A"}
                    </div>
                  </div>
                </div>
              )}
          </div>
        )}
      </Modal>

      {/* Start Examination Modal */}
      <Modal
        isOpen={isStartExamModalOpen}
        onClose={() => {
          setIsStartExamModalOpen(false);
          setSelectedAppointment(null);
          setSelectedServiceId("");
        }}
        title="Bắt đầu ca khám"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsStartExamModalOpen(false);
                setSelectedAppointment(null);
                setSelectedServiceId("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleStartExamination}>Bắt đầu</Button>
          </>
        }
      >
        {selectedAppointment && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <strong>Bệnh nhân:</strong>{" "}
              {typeof selectedAppointment.patientId === "object" &&
              selectedAppointment.patientId
                ? selectedAppointment.patientId.fullName
                : "N/A"}
            </div>
            <div>
              <strong>Ngày giờ:</strong>{" "}
              {format(
                new Date(selectedAppointment.appointmentDate),
                "dd/MM/yyyy HH:mm",
                { locale: vi }
              )}
            </div>
            <Select
              label="Chọn dịch vụ"
              options={[
                { value: "", label: "Chọn dịch vụ" },
                ...services.map((s) => ({
                  value: s._id,
                  label: `${s.name} - ${s.price.toLocaleString("vi-VN")}đ`,
                })),
              ]}
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
              fullWidth
            />
            {!selectedAppointment.confirmedBy && (
              <div className="p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-100">
                <strong>Lưu ý:</strong> Lịch hẹn này chưa có thông tin nhân viên
                xác nhận. Bạn vẫn có thể bắt đầu khám, nhưng vui lòng kiểm tra
                kỹ thông tin.
              </div>
            )}
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                fontSize: "14px",
                color: "#6b7280",
              }}
            >
              <strong>Lưu ý:</strong> Nhân viên sẽ được tự động chọn dựa trên
              người xác nhận lịch hẹn (nếu có).
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
