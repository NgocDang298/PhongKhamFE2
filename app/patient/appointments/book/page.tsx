"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import { ROUTES } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import { format } from "date-fns";

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

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadDoctors();
  }, [user, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate]);

  const loadDoctors = async () => {
    try {
      const response: any = await appointmentService.getDoctors();
      const doctors = response.data || response || [];
      if (doctors) {
        setDoctors(
          doctors.map((d: any) => ({ value: d._id, label: d.fullName }))
        );
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      const response: any = await appointmentService.getAllSlotsWithStatus({
        doctorId: selectedDoctor,
        date: selectedDate,
      });
      const slots = response.data || response || [];
      if (slots) {
        setAvailableSlots(slots);
      }
    } catch (error) {
      console.error("Error loading slots:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDoctor || !selectedSlot) {
      setError("Vui lòng chọn bác sĩ và thời gian");
      return;
    }

    setLoading(true);
    try {
      await appointmentService.createDoctorAppointment({
        patientId: user?._id,
        doctorId: selectedDoctor,
        appointmentDate: selectedSlot,
        note,
      });
      router.push(ROUTES.PATIENT_APPOINTMENTS);
    } catch (err: any) {
      setError(err.message || "Đặt lịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <DashboardLayout navItems={navItems} title="Đặt lịch hẹn">
      <Card>
        <CardHeader>
          <CardTitle>Đặt lịch hẹn mới</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg">
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
            )}

            <Select
              label="Chọn bác sĩ"
              options={[{ value: "", label: "Chọn bác sĩ" }, ...doctors]}
              value={selectedDoctor}
              onChange={(e) => {
                setSelectedDoctor(e.target.value);
                setSelectedSlot("");
              }}
              required
              fullWidth
            />

            <Input
              label="Chọn ngày"
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedSlot("");
              }}
              min={today}
              required
              fullWidth
            />

            {availableSlots.length > 0 && (
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  Chọn giờ
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {availableSlots.map((slot: any) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={`flex flex-col items-center justify-center p-3 text-sm font-medium border rounded-lg transition-all ${
                        selectedSlot === slot.time
                          ? "!border-primary bg-primary/10 text-primary"
                          : "border-gray-200 text-gray-700 hover:border-primary/50"
                      } ${
                        slot.isBooked
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                          : ""
                      }`}
                      onClick={() =>
                        !slot.isBooked && setSelectedSlot(slot.time)
                      }
                      disabled={slot.isBooked}
                    >
                      {format(new Date(slot.time), "HH:mm")}
                      {slot.isBooked && (
                        <span className="text-[10px] font-normal">Đã đặt</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              label="Ghi chú (tùy chọn)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú nếu có..."
              fullWidth
            />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(ROUTES.PATIENT_APPOINTMENTS)}
              >
                Hủy
              </Button>
              <Button type="submit" loading={loading}>
                Đặt lịch
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
