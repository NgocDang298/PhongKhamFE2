"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { ROUTES, APPOINTMENT_STATUS_LABELS } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as profileService from "@/lib/services/profile";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import viLocale from "@fullcalendar/core/locales/vi";

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

  // Transform appointments to FullCalendar events
  const calendarEvents = appointments.map((apt) => ({
    id: apt._id,
    title:
      typeof apt.doctorId === "object" && apt.doctorId
        ? `Bác sĩ ${apt.doctorId.fullName}`
        : "Chưa chọn bác sĩ",
    start: apt.appointmentDate,
    end: new Date(
      new Date(apt.appointmentDate).getTime() + 60 * 60 * 1000
    ).toISOString(), // 1 hour duration
    backgroundColor: getStatusColor(apt.status),
    borderColor: getStatusColor(apt.status),
    extendedProps: {
      appointment: apt,
    },
  }));

  const handleEventClick = (clickInfo: any) => {
    const appointment = clickInfo.event.extendedProps.appointment;
    setSelectedAppointment(appointment);
    setDetailModalOpen(true);
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
          <CardTitle>Lịch hẹn</CardTitle>
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
                <span
                  className="px-3 py-1 text-xs font-medium rounded-full inline-block"
                  style={{
                    backgroundColor:
                      getStatusColor(selectedAppointment.status) + "20",
                    color: getStatusColor(selectedAppointment.status),
                  }}
                >
                  {
                    APPOINTMENT_STATUS_LABELS[
                      selectedAppointment.status as keyof typeof APPOINTMENT_STATUS_LABELS
                    ]
                  }
                </span>
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
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
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
          background-color: #f9fafb;
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
