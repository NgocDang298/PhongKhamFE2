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
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import {
  IconCalendarPlus,
  IconAlertCircle,
} from "@tabler/icons-react";

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
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Đặt lịch hẹn">
      <Card>
        <CardHeader icon={<IconCalendarPlus size={20} />}>
          <CardTitle>Đặt lịch hẹn mới</CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
            {error && (
              <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg">
                <IconAlertCircle size={20} />
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
                      className={`flex flex-col items-center justify-center p-3 text-sm font-medium border rounded-lg transition-all ${selectedSlot === slot.time
                        ? "!border-primary bg-primary/10 text-primary"
                        : "border-gray-200 text-gray-700 hover:border-primary/50"
                        } ${slot.isBooked
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
