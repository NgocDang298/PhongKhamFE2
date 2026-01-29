"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
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
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import Input from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as patientService from "@/lib/services/patients";
import { STAFF_NAV_ITEMS } from "@/lib/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconPlus,
  IconTable,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import viLocale from "@fullcalendar/core/locales/vi";
import Pagination from "@/components/ui/Pagination";


export default function StaffAppointmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isConfirmConfirmModalOpen, setIsConfirmConfirmModalOpen] = useState(false);
  const [isRejectConfirmModalOpen, setIsRejectConfirmModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAutoAssignModalOpen, setIsAutoAssignModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentDate: "",
    note: "",
  });
  const [autoAssignFormData, setAutoAssignFormData] = useState({
    patientId: "",
    appointmentDate: "",
    note: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (
      !isAuthenticated ||
      (user?.role !== "staff" && user?.role !== "admin")
    ) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, patientsRes, doctorsRes] = await Promise.all([
        appointmentService.getAppointments(
          statusFilter ? { status: statusFilter as any } : {}
        ),
        patientService.getPatients(),
        appointmentService.getDoctors(),
      ]);
      const appointmentsData = appointmentsRes?.data || appointmentsRes || [];
      const patientsData = patientsRes?.data || patientsRes || [];
      const doctorsData = doctorsRes?.data || doctorsRes || [];

      const appointments = Array.isArray(appointmentsData)
        ? appointmentsData
        : [];
      const patients = Array.isArray(patientsData) ? patientsData : [];
      const doctors = Array.isArray(doctorsData) ? doctorsData : [];
      setAppointments(appointments);
      setPatients(patients);
      setDoctors(doctors);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "pending":
        return "warning";
      case "confirmed":
        return "success";
      case "in-progress":
        return "info";
      case "cancelled":
        return "danger";
      case "completed":
        return "purple";
      default:
        return "gray";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "confirmed":
        return "#10b981";
      case "in-progress":
        return "#3b82f6";
      case "cancelled":
        return "#ef4444";
      case "completed":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  const calendarEvents = appointments.map((apt) => {
    const patientName =
      typeof apt.patientId === "object" && apt.patientId
        ? apt.patientId.fullName
        : patients.find((p) => p._id === apt.patientId)?.fullName ||
        "Chưa cập nhật";

    const doctorName =
      typeof apt.doctorId === "object" && apt.doctorId
        ? apt.doctorId.fullName
        : doctors.find((d) => d._id === apt.doctorId)?.fullName || "Chưa chọn bác sĩ";

    return {
      id: apt._id,
      title: `${patientName} - BS: ${doctorName}`,
      start: apt.appointmentDate,
      end: new Date(
        new Date(apt.appointmentDate).getTime() + 60 * 60 * 1000
      ).toISOString(), // 1 hour duration
      backgroundColor: getStatusColor(apt.status),
      borderColor: getStatusColor(apt.status),
      extendedProps: {
        appointment: apt,
      },
    };
  });

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setIsDetailModalOpen(true);
  };

  const handleConfirm = async (id: string) => {
    try {
      await appointmentService.confirmAppointment(id);
      toast.success("Đã xác nhận lịch hẹn!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xác nhận");
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    try {
      await appointmentService.rejectAppointment(id, reason);
      toast.success("Đã từ chối lịch hẹn");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi từ chối");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await appointmentService.createAppointment({
        patientId: formData.patientId,
        doctorId: formData.doctorId || undefined,
        appointmentDate: formData.appointmentDate,
        note: formData.note,
      });
      setIsCreateModalOpen(false);
      setFormData({
        patientId: "",
        doctorId: "",
        appointmentDate: "",
        note: "",
      });
      toast.success("Tạo lịch hẹn mới thành công!");
      await loadData();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo lịch hẹn");
    }
  };

  const handleAutoAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Convert datetime-local to ISO format
      const appointmentDate = new Date(
        autoAssignFormData.appointmentDate
      ).toISOString();

      const response = await appointmentService.autoAssignAppointment({
        patientId: autoAssignFormData.patientId,
        appointmentDate: appointmentDate,
        note: autoAssignFormData.note,
      });

      // Show success message with doctor info
      const doctorInfo = response.data?.doctorId;
      const doctorName =
        typeof doctorInfo === "object" ? doctorInfo.fullName : "Không xác định";
      const specialty =
        typeof doctorInfo === "object" ? doctorInfo.specialty : "";

      toast.success(
        <div>
          <p className="font-semibold">Đặt lịch thành công!</p>
          <p className="text-sm">Bác sĩ: {doctorName}</p>
          {specialty && <p className="text-sm">Chuyên khoa: {specialty}</p>}
          <p className="text-sm">
            Trạng thái:{" "}
            {response.data?.status === "confirmed"
              ? "Đã xác nhận"
              : "Chờ xác nhận"}
          </p>
        </div>
      );

      setIsAutoAssignModalOpen(false);
      setAutoAssignFormData({
        patientId: "",
        appointmentDate: "",
        note: "",
      });
      await loadData();
      setCurrentPage(1);
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi đặt lịch tự động");
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý lịch hẹn">
        <Card>
          <CardHeader icon={<IconCalendar size={20} />}>
            <CardTitle>Quản lý lịch hẹn</CardTitle>
            <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-36" />
              <Skeleton className="h-10 w-36" />
            </div>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <Skeleton className="h-96 w-full" />
            </div>
          </CardBody>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý lịch hẹn">
      <Card>
        <CardHeader icon={<IconCalendar size={20} />}>
          <CardTitle>
            {viewMode === "calendar" ? "Lịch khám bệnh" : "Danh sách lịch hẹn"}
          </CardTitle>
          <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
            <div className="flex items-center bg-gray-100 p-1 h-10 rounded-lg border">
              <button
                type="button"
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "calendar"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <IconCalendar size={18} />
                Lịch
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === "table"
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
                  }`}
              >
                <IconTable size={18} />
                D.Sách
              </button>
            </div>
            <div className="w-full md:w-56">
              <Select
                options={[
                  { value: "", label: "Lọc theo trạng thái" },
                  { value: "pending", label: "Chờ xác nhận" },
                  { value: "confirmed", label: "Đã xác nhận" },
                  { value: "in-progress", label: "Đang khám" },
                  { value: "completed", label: "Hoàn thành" },
                  { value: "cancelled", label: "Đã hủy" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAutoAssignModalOpen(true)}
                icon={<IconPlus size={16} />}
                className="whitespace-nowrap"
              >
                Tự động
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                icon={<IconPlus size={16} />}
                className="whitespace-nowrap"
              >
                Tạo mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {appointments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có lịch hẹn nào
            </div>
          ) : viewMode === "calendar" ? (
            <div className="fullcalendar-wrapper">
              <FullCalendar
                plugins={[
                  dayGridPlugin,
                  timeGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="dayGridMonth"
                locale={viLocale}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
                }}
                buttonText={{
                  today: "Hôm nay",
                  month: "Tháng",
                  week: "Tuần",
                  day: "Ngày",
                  list: "Danh sách hồ sơ",
                }}
                events={calendarEvents}
                eventClick={handleEventClick}
                height="auto"
                eventTimeFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                slotLabelFormat={{
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                }}
                nowIndicator={true}
                dayMaxEvents={true}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Bệnh nhân</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Ngày giờ</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ghi chú</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .slice((currentPage - 1) * limit, currentPage * limit)
                    .map((apt, index) => (
                      <TableRow key={apt._id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          {typeof apt.patientId === "object" && apt.patientId
                            ? apt.patientId.fullName
                            : patients.find((p) => p._id === apt.patientId)
                              ?.fullName || "Chưa cập nhật"}
                        </TableCell>
                        <TableCell>
                          {typeof apt.doctorId === "object" && apt.doctorId
                            ? apt.doctorId.fullName
                            : apt.doctorId || "Chưa chọn bác sĩ"}
                        </TableCell>
                        <TableCell>
                          {format(
                            new Date(apt.appointmentDate),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(apt.status)}>
                            {
                              APPOINTMENT_STATUS_LABELS[
                              apt.status as keyof typeof APPOINTMENT_STATUS_LABELS
                              ]
                            }
                          </Badge>
                        </TableCell>
                        <TableCell>{apt.note || "Không có ghi chú"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {apt.status === "pending" && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setIsConfirmConfirmModalOpen(true);
                                  }}
                                  icon={<IconCheck size={18} />}
                                >
                                  Xác nhận
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedAppointment(apt);
                                    setIsRejectConfirmModalOpen(true);
                                  }}
                                  icon={<IconX size={18} />}
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <Pagination
                total={appointments.length}
                limit={limit}
                skip={(currentPage - 1) * limit}
                onPageChange={setCurrentPage}
                onLimitChange={(newLimit) => {
                  setLimit(newLimit);
                  setCurrentPage(1);
                }}
              />
            </>
          )}
        </CardBody>
      </Card>

      <style jsx global>{`
        .fullcalendar-wrapper {
          --fc-border-color: #e5e7eb;
          --fc-button-bg-color: #6366f1;
          --fc-button-border-color: #6366f1;
          --fc-button-hover-bg-color: #4f46e5;
          --fc-button-hover-border-color: #4f46e5;
          --fc-button-active-bg-color: #4338ca;
          --fc-button-active-border-color: #4338ca;
          --fc-today-bg-color: rgba(99, 102, 241, 0.1);
        }

        .fc {
          font-family: inherit;
        }

        .fc .fc-button {
          padding: 0.5rem 1rem;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: capitalize;
          border-radius: 0.5rem;
          box-shadow: none;
        }

        .fc .fc-button:focus {
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
        }

        .fc .fc-toolbar-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
        }

        .fc .fc-col-header-cell {
          padding: 0.75rem 0;
          font-weight: 600;
          font-size: 0.875rem;
          color: #6b7280;
          text-transform: uppercase;
          background-color: #EFF0F7;
        }

        .fc .fc-daygrid-day-number {
          padding: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number {
          background-color: #6366f1;
          color: white;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .fc .fc-event {
          border-radius: 0.375rem;
          padding: 0.25rem 0.4rem;
          font-size: 0.8125rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .fc .fc-event:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .fc .fc-list-event:hover td {
          background-color: #f3f4f6;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb;
        }
      `}</style>

      {/* Confirm Confirmation Modal */}
      <Modal
        isOpen={isConfirmConfirmModalOpen}
        onClose={() => {
          setIsConfirmConfirmModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Xác nhận lịch hẹn"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsConfirmConfirmModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={<IconCheck size={20} />}
              onClick={() => {
                if (selectedAppointment) {
                  handleConfirm(selectedAppointment._id);
                  setIsConfirmConfirmModalOpen(false);
                  setSelectedAppointment(null);
                }
              }}
            >
              Xác nhận ngay
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconCheck size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Xác nhận lịch hẹn</h3>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn xác nhận lịch hẹn cho bệnh nhân{" "}
            <span className="font-semibold">
              {typeof selectedAppointment?.patientId === "object"
                ? selectedAppointment?.patientId.fullName
                : patients.find((p) => p._id === selectedAppointment?.patientId)?.fullName}
            </span>?
          </p>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectConfirmModalOpen}
        onClose={() => {
          setIsRejectConfirmModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Từ chối lịch hẹn"
        size="sm"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsRejectConfirmModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              icon={<IconX size={20} />}
              onClick={() => {
                if (selectedAppointment) {
                  handleReject(selectedAppointment._id);
                  setIsRejectConfirmModalOpen(false);
                  setSelectedAppointment(null);
                }
              }}
            >
              Xác nhận từ chối
            </Button>
          </>
        }
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <IconX size={32} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Từ chối lịch hẹn</h3>
          <p className="text-gray-600">
            Bạn có chắc chắn muốn từ chối lịch hẹn của bệnh nhân{" "}
            <span className="font-semibold">
              {typeof selectedAppointment?.patientId === "object"
                ? selectedAppointment?.patientId.fullName
                : patients.find((p) => p._id === selectedAppointment?.patientId)?.fullName}
            </span> không? Hành động này không thể hoàn tác.
          </p>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Chi tiết lịch hẹn"
        size="md"
        footer={
          <div className="flex justify-between w-full">
            <div className="flex gap-2">
              {selectedAppointment?.status === "pending" && (
                <>
                  <Button
                    variant="outline"
                    icon={<IconCheck size={20} />}
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsConfirmConfirmModalOpen(true);
                    }}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    variant="danger"
                    icon={<IconX size={20} />}
                    onClick={() => {
                      setIsDetailModalOpen(false);
                      setIsRejectConfirmModalOpen(true);
                    }}
                  >
                    Từ chối
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsDetailModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Đóng
            </Button>
          </div>
        }
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
                <Badge variant={getStatusBadgeVariant(selectedAppointment.status)}>
                  {
                    APPOINTMENT_STATUS_LABELS[
                    selectedAppointment.status as keyof typeof APPOINTMENT_STATUS_LABELS
                    ]
                  }
                </Badge>
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">
                Bệnh nhân
              </label>
              <div className="font-medium">
                {typeof selectedAppointment.patientId === "object" &&
                  selectedAppointment.patientId
                  ? selectedAppointment.patientId.fullName
                  : patients.find(
                    (p) => p._id === selectedAppointment.patientId
                  )?.fullName || "Chưa cập nhật"}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                SĐT:{" "}
                {typeof selectedAppointment.patientId === "object" &&
                  selectedAppointment.patientId
                  ? selectedAppointment.patientId.phone
                  : patients.find(
                    (p) => p._id === selectedAppointment.patientId
                  )?.phone || "Chưa cập nhật"}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-500 block mb-1">Bác sĩ</label>
              <div className="font-medium">
                {typeof selectedAppointment.doctorId === "object" &&
                  selectedAppointment.doctorId
                  ? selectedAppointment.doctorId.fullName
                  : doctors.find((d) => d._id === selectedAppointment.doctorId)
                    ?.fullName || "Chưa chọn bác sĩ"}
              </div>
            </div>

            {selectedAppointment.note && (
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Ghi chú
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200 italic">
                  "{selectedAppointment.note}"
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setFormData({
            patientId: "",
            doctorId: "",
            appointmentDate: "",
            note: "",
          });
        }}
        title="Tạo lịch hẹn mới"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsCreateModalOpen(false);
                setFormData({
                  patientId: "",
                  doctorId: "",
                  appointmentDate: "",
                  note: "",
                });
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={<IconCheck size={20} />}
              onClick={handleCreate}
            >
              Tạo lịch hẹn
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Select
            label="Chọn bệnh nhân"
            name="patientId"
            options={[
              { value: "", label: "Chọn bệnh nhân" },
              ...patients.map((p) => ({
                value: p._id,
                label: `${p.fullName} - ${p.phone}`,
              })),
            ]}
            value={formData.patientId}
            onChange={(e) =>
              setFormData({ ...formData, patientId: e.target.value })
            }
            required
            fullWidth
          />
          <Select
            label="Chọn bác sĩ (tùy chọn)"
            name="doctorId"
            options={[
              { value: "", label: "Chưa chọn bác sĩ" },
              ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
            ]}
            value={formData.doctorId}
            onChange={(e) =>
              setFormData({ ...formData, doctorId: e.target.value })
            }
            fullWidth
          />
          <Input
            label="Ngày giờ hẹn"
            name="appointmentDate"
            type="datetime-local"
            value={formData.appointmentDate}
            onChange={(e) =>
              setFormData({ ...formData, appointmentDate: e.target.value })
            }
            required
            fullWidth
          />
          <Input
            label="Ghi chú (tùy chọn)"
            name="note"
            type="text"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            fullWidth
          />
        </form>
      </Modal>

      {/* Auto-Assign Appointment Modal */}
      <Modal
        isOpen={isAutoAssignModalOpen}
        onClose={() => {
          setIsAutoAssignModalOpen(false);
          setAutoAssignFormData({
            patientId: "",
            appointmentDate: "",
            note: "",
          });
        }}
        title="Đặt lịch tự động (Hệ thống chọn bác sĩ)"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsAutoAssignModalOpen(false);
                setAutoAssignFormData({
                  patientId: "",
                  appointmentDate: "",
                  note: "",
                });
              }}
            >
              Hủy
            </Button>
            <Button
              variant="primary"
              icon={<IconCheck size={20} />}
              onClick={handleAutoAssign}
            >
              Đặt lịch
            </Button>
          </>
        }
      >
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Lưu ý:</strong> Hệ thống sẽ tự động chọn bác sĩ phù hợp nhất
            dựa trên:
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 list-disc">
            <li>Lịch làm việc của bác sĩ</li>
            <li>Số lượng lịch hẹn hiện tại</li>
            <li>Thời gian khám mong muốn</li>
          </ul>
        </div>

        <form onSubmit={handleAutoAssign} className="space-y-4">
          <Select
            label="Chọn bệnh nhân"
            name="patientId"
            options={[
              { value: "", label: "Chọn bệnh nhân" },
              ...patients.map((p) => ({
                value: p._id,
                label: `${p.fullName} - ${p.phone}`,
              })),
            ]}
            value={autoAssignFormData.patientId}
            onChange={(e) =>
              setAutoAssignFormData({
                ...autoAssignFormData,
                patientId: e.target.value,
              })
            }
            required
            fullWidth
          />
          <Input
            label="Ngày giờ hẹn"
            name="appointmentDate"
            type="datetime-local"
            value={autoAssignFormData.appointmentDate}
            onChange={(e) =>
              setAutoAssignFormData({
                ...autoAssignFormData,
                appointmentDate: e.target.value,
              })
            }
            required
            fullWidth
          />
          <Input
            label="Ghi chú (tùy chọn)"
            name="note"
            type="text"
            value={autoAssignFormData.note}
            onChange={(e) =>
              setAutoAssignFormData({
                ...autoAssignFormData,
                note: e.target.value,
              })
            }
            fullWidth
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}
