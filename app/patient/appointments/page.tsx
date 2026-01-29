"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import Badge, { BadgeVariant } from "@/components/ui/Badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ROUTES, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as profileService from "@/lib/services/profile";
import { Skeleton } from "@/components/ui/Skeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Pagination from "@/components/ui/Pagination";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import viLocale from "@fullcalendar/core/locales/vi";
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import {
  IconCalendar,
  IconPlus,
  IconAlertCircle,
  IconTable,
  IconX,
  IconTrash,
} from "@tabler/icons-react";

export default function PatientAppointments() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"calendar" | "table">("calendar");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  useEffect(() => {
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

      const response = await profileService.getMyAppointments(params);

      if (response.data) {
        if (Array.isArray(response.data)) {
          setAppointments(response.data);
        } else if (
          response.data.appointments &&
          Array.isArray(response.data.appointments)
        ) {
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
      toast.success("Đã hủy lịch hẹn thành công");
      loadAppointments();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi hủy lịch hẹn");
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
        return "#f59e0b"; // Orange
      case "confirmed":
        return "#10b981"; // Green
      case "in-progress":
        return "#3b82f6"; // Blue
      case "cancelled":
        return "#ef4444"; // Red
      case "completed":
        return "#8b5cf6"; // Purple
      default:
        return "#6b7280"; // Gray
    }
  };

  const calendarEvents = appointments.map((apt) => {
    const doctorName =
      typeof apt.doctorId === "object" && apt.doctorId
        ? apt.doctorId.fullName
        : "Chưa chọn bác sĩ";

    const specialty =
      typeof apt.doctorId === "object" && apt.doctorId?.specialty
        ? ` - ${apt.doctorId.specialty}`
        : "";

    return {
      id: apt._id,
      title: `${doctorName}${specialty}`,
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
    setDetailModalOpen(true);
  };

  return (
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Lịch hẹn của tôi">
      <Card>
        <CardHeader icon={<IconCalendar size={20} />}>
          <CardTitle>
            {viewMode === "calendar" ? "Lịch hẹn" : "Danh sách lịch hẹn"}
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
            <Button
              onClick={() => router.push(ROUTES.PATIENT_BOOK_APPOINTMENT)}
              icon={<IconPlus size={16} />}
              className="whitespace-nowrap"
            >
              Đặt lịch mới
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="space-y-4 pt-4">
              <Skeleton className="h-96 w-full" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-lg border border-red-100">
                <IconAlertCircle size={20} />
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
                  list: "Danh sách",
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
                editable={false}
                selectable={false}
                selectMirror={true}
                dayMaxEvents={true}
              />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Bác sĩ</TableHead>
                    <TableHead>Chuyên khoa</TableHead>
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
                          {typeof apt.doctorId === "object" && apt.doctorId
                            ? apt.doctorId.fullName
                            : "Chưa chọn"}
                        </TableCell>
                        <TableCell>
                          {typeof apt.doctorId === "object" && apt.doctorId
                            ? apt.doctorId.specialty || "Chưa cập nhật"
                            : "Chưa cập nhật"}
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
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(apt);
                              setDetailModalOpen(true);
                            }}
                          >
                            Chi tiết
                          </Button>
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

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedAppointment(null);
        }}
        title="Chi tiết lịch hẹn"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setDetailModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Đóng
            </Button>
            {selectedAppointment &&
              (selectedAppointment.status === "pending" ||
                selectedAppointment.status === "confirmed") && (
                <Button
                  variant="danger"
                  icon={<IconTrash size={20} />}
                  onClick={() => {
                    setDetailModalOpen(false);
                    setCancelModalOpen(true);
                  }}
                >
                  Hủy lịch hẹn
                </Button>
              )}
          </>
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
              <label className="text-sm text-gray-500 block mb-1">Bác sĩ</label>
              <div className="font-medium">
                {typeof selectedAppointment.doctorId === "object" &&
                  selectedAppointment.doctorId
                  ? selectedAppointment.doctorId.fullName
                  : "Chưa chọn bác sĩ"}
              </div>
              {typeof selectedAppointment.doctorId === "object" &&
                selectedAppointment.doctorId?.specialty && (
                  <div className="text-sm text-gray-600 mt-1">
                    Chuyên khoa: {selectedAppointment.doctorId.specialty || "Chưa cập nhật"}
                  </div>
                )}
            </div>

            {selectedAppointment.note && (
              <div>
                <label className="text-sm text-gray-500 block mb-1">
                  Ghi chú
                </label>
                <div className="p-3 bg-gray-50 rounded-lg text-gray-700 border border-gray-200">
                  {selectedAppointment.note}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Cancel Modal */}
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
              icon={<IconX size={20} />}
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedAppointment(null);
              }}
            >
              Đóng
            </Button>
            <Button
              variant="danger"
              icon={<IconTrash size={20} />}
              onClick={handleCancel}
            >
              Xác nhận hủy
            </Button>
          </>
        }
      >
        <p>Bạn có chắc chắn muốn hủy lịch hẹn này không?</p>
        {selectedAppointment && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="mb-2">
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
          font-size: 1.5rem;
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
          padding: 0.25rem 0.5rem;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fc .fc-event:hover {
          opacity: 0.8;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .fc .fc-list-event:hover td {
          background-color: #f3f4f6;
        }

        .fc .fc-list-event-title {
          font-weight: 500;
        }

        .fc .fc-list-event-time {
          color: #6b7280;
        }

        .fc-theme-standard td,
        .fc-theme-standard th {
          border-color: #e5e7eb;
        }

        .fc-theme-standard .fc-scrollgrid {
          border-color: #e5e7eb;
        }
      `}</style>
    </DashboardLayout>
  );
}
