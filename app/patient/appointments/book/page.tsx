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
import Modal from "@/components/ui/Modal";
import { ROUTES } from "@/lib/constants";
import * as appointmentService from "@/lib/services/appointments";
import * as profileService from "@/lib/services/profile";
import { format, isSameDay, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import {
  IconCalendarPlus,
  IconAlertCircle,
  IconUserCheck,
  IconBolt,
  IconCheck,
  IconClock,
  IconUserSquareRounded,
  IconCalendar,
  IconCalendarCheck,
  IconX,
  IconStethoscope,
  IconFileText,
} from "@tabler/icons-react";
import { toast } from "react-toastify";

type BookingMode = "by-doctor" | "auto-assign";

export default function BookAppointmentPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  // States
  const [bookingMode, setBookingMode] = useState<BookingMode>("by-doctor");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [note, setNote] = useState("");

  // Profile check
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  // Loading & Error
  const [loading, setLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [datesLoading, setDatesLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [specialtiesLoading, setSpecialtiesLoading] = useState(false);
  const [error, setError] = useState("");

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadDoctors();
    loadSpecialties();
    checkMedicalProfile();
  }, [user, isAuthenticated, authLoading, router]);

  const checkMedicalProfile = async () => {
    if (hasCheckedProfile) return;

    try {
      const response = await profileService.getMedicalHistory();
      const history = (response as any).data || response || null;
      setMedicalHistory(history);

      // Check if medical history is incomplete
      // Important fields: bloodType, allergies, chronicDiseases, etc.
      const isIncomplete = !history?.bloodType ||
        (!history?.allergies || history.allergies.length === 0) ||
        (!history?.chronicDiseases || history.chronicDiseases.length === 0);

      if (isIncomplete) {
        setIsProfileModalOpen(true);
      }
      setHasCheckedProfile(true);
    } catch (error) {
      console.error("Error checking medical history:", error);
      setHasCheckedProfile(true);
    }
  };

  // Load available dates when doctor changes
  useEffect(() => {
    if (bookingMode === "by-doctor") {
      if (selectedDoctorId) {
        loadAvailableDates(selectedDoctorId);
      } else {
        setAvailableDates([]);
      }
    } else {
      // auto-assign mode: generate next 14 days
      const dates = [];
      const start = new Date();
      for (let i = 0; i < 14; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        dates.push(format(d, "yyyy-MM-dd"));
      }
      setAvailableDates(dates);
    }
    setSelectedDate("");
    setSelectedSlot("");
    setSelectedSpecialty("");
    setAvailableSlots([]);
  }, [selectedDoctorId, bookingMode]);

  // Load slots when date/specialty/doctor changes
  useEffect(() => {
    if (selectedDate) {
      if (bookingMode === "auto-assign" && !selectedSpecialty) {
        setAvailableSlots([]);
        return;
      }
      loadAvailableSlots();
      setSelectedSlot("");
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDate, selectedSpecialty, selectedDoctorId, bookingMode]);

  const loadDoctors = async () => {
    try {
      setDoctorsLoading(true);
      const response: any = await appointmentService.getDoctors();
      const docs = response.data || response || [];
      setDoctors(docs);
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error("Không thể tải danh sách bác sĩ");
    } finally {
      setDoctorsLoading(false);
    }
  };

  const loadSpecialties = async () => {
    try {
      setSpecialtiesLoading(true);
      const response: any = await appointmentService.getSpecialties();
      const data = response.data || response || [];
      setSpecialties(data);
    } catch (error) {
      console.error("Error loading specialties:", error);
    } finally {
      setSpecialtiesLoading(false);
    }
  };

  const loadAvailableDates = async (doctorId: string) => {
    try {
      setDatesLoading(true);
      const response: any = await appointmentService.getAvailableDates(doctorId);
      const dates = response.data || response || [];
      setAvailableDates(dates);
    } catch (error) {
      console.error("Error loading available dates:", error);
    } finally {
      setDatesLoading(false);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedDate) return;
    try {
      setSlotsLoading(true);
      let response: any;

      if (bookingMode === "by-doctor") {
        if (!selectedDoctorId) return;
        response = await appointmentService.getDoctorAvailableSlots({
          doctorId: selectedDoctorId,
          date: selectedDate,
        });
      } else {
        response = await appointmentService.getAvailableSlots({
          date: selectedDate,
          specialty: selectedSpecialty,
        });
      }

      const slots = response.data || response || [];
      // If auto-assign, slots might not have "isBooked" flag from backend, 
      // but usually availableSlots logic only returns free ones anyway.
      setAvailableSlots(slots);
    } catch (error) {
      console.error("Error loading slots:", error);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDate || !selectedSlot) {
      setError("Vui lòng chọn ngày và giờ khám");
      return;
    }

    if (bookingMode === "by-doctor" && !selectedDoctorId) {
      setError("Vui lòng chọn bác sĩ");
      return;
    }

    if (bookingMode === "auto-assign" && !selectedSpecialty) {
      setError("Vui lòng chọn chuyên khoa");
      return;
    }

    setLoading(true);
    try {
      let response: any;
      if (bookingMode === "by-doctor") {
        response = await appointmentService.createDoctorAppointment({
          doctorId: selectedDoctorId,
          appointmentDate: selectedSlot,
          note,
        });
        const doctorName = response.data?.doctorId?.fullName || "Bác sĩ";
        toast.success(`Đặt lịch thành công với ${doctorName}. Đang chờ xác nhận.`);
      } else {
        response = await appointmentService.autoAssignAppointment({
          appointmentDate: selectedSlot,
          specialty: selectedSpecialty,
          note,
        });
        const assignedDoctor = response.data?.doctorId?.fullName;
        toast.success(
          assignedDoctor
            ? `Hệ thống đã xếp bác sĩ: ${assignedDoctor}`
            : "Đặt lịch nhanh thành công! Hệ thống đang sắp xếp bác sĩ."
        );
      }

      router.push(ROUTES.PATIENT_APPOINTMENTS);
    } catch (err: any) {
      setError(err.message || "Đặt lịch thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d._id === selectedDoctorId);

  return (
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Đặt lịch hẹn">
      <div className="w-full space-y-4">
        {/* Selection Mode */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => setBookingMode("by-doctor")}
            className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${bookingMode === "by-doctor"
              ? "border-primary bg-primary/5 shadow-md"
              : "border-gray-200 bg-white hover:border-primary/40"
              }`}
          >
            <div className={`p-3 rounded-xl ${bookingMode === "by-doctor" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
              <IconUserCheck size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Đặt theo yêu cầu</h3>
              <p className="text-sm text-gray-500 mt-1">
                Tự chọn bác sĩ bạn tin tưởng. Xem trước lịch làm việc của từng người.
              </p>
            </div>
            {bookingMode === "by-doctor" && <IconCheck className="ml-auto text-primary" size={24} />}
          </button>

          <button
            onClick={() => setBookingMode("auto-assign")}
            className={`p-6 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${bookingMode === "auto-assign"
              ? "border-tertiary bg-tertiary/5 shadow-md"
              : "border-gray-200 bg-white hover:border-tertiary/40"
              }`}
          >
            <div className={`p-3 rounded-xl ${bookingMode === "auto-assign" ? "bg-tertiary text-white" : "bg-gray-100 text-gray-500"}`}>
              <IconBolt size={28} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg">Đặt lịch nhanh</h3>
              <p className="text-sm text-gray-500 mt-1">
                Hệ thống tự động sắp xếp bác sĩ còn rảnh cho bạn. Tiết kiệm thời gian.
              </p>
            </div>
            {bookingMode === "auto-assign" && <IconCheck className="ml-auto text-tertiary" size={24} />}
          </button>
        </div>

        <Card className="border-none shadow-xl overflow-visible">
          <CardHeader icon={<IconCalendarPlus size={24} className="text-primary" />}>
            <CardTitle>Chi tiết đăng ký</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <form onSubmit={handleSubmit} className="divide-y divide-gray-100">
              {error && (
                <div className="p-4 mx-6 mt-4 flex items-center gap-3 text-red-600 bg-red-50 border border-red-100 rounded-xl">
                  <IconAlertCircle size={20} />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Step 1: Doctor Selection (Only for By Doctor mode) */}
              {bookingMode === "by-doctor" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">1</div>
                    <label className="text-base font-semibold text-gray-800">Chọn bác sĩ chuyên khoa</label>
                  </div>

                  {doctorsLoading ? (
                    <div className="h-10 bg-gray-100 animate-pulse rounded-lg w-full"></div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {doctors.map((doc) => (
                        <div
                          key={doc._id}
                          onClick={() => setSelectedDoctorId(doc._id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3 ${selectedDoctorId === doc._id
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-gray-200 hover:border-primary/50"
                            }`}
                        >
                          <img
                            src={
                              doc?.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${doc.fullName}`
                            }
                            alt={doc.fullName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 bg-primary/5"
                          />
                          <div>
                            <div className="font-semibold text-gray-900 leading-tight">{doc.fullName}</div>
                            <div className="text-xs text-primary font-medium mt-0.5 uppercase tracking-wider">{doc.specialty}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Date Selection */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {bookingMode === "by-doctor" ? "2" : "1"}
                  </div>
                  <label className="text-base font-semibold text-gray-800">Chọn ngày khám</label>
                </div>

                <div className="space-y-3">
                  {bookingMode === "by-doctor" && !selectedDoctorId ? (
                    <div className="text-sm text-gray-400 italic">Vui lòng chọn bác sĩ trước</div>
                  ) : datesLoading ? (
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => <div key={i} className="h-20 w-16 bg-gray-100 animate-pulse rounded-xl"></div>)}
                    </div>
                  ) : availableDates.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {availableDates.map((dateStr) => {
                        const date = parseISO(dateStr);
                        const isSelected = selectedDate === dateStr;
                        return (
                          <button
                            key={dateStr}
                            type="button"
                            onClick={() => setSelectedDate(dateStr)}
                            className={`flex flex-col items-center justify-center min-w-[70px] p-3 rounded-xl border transition-all ${isSelected
                              ? "border-primary bg-primary text-white shadow-lg shadow-primary/30"
                              : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
                              }`}
                          >
                            <span className={`text-[10px] uppercase font-bold tracking-widest ${isSelected ? "text-white/80" : "text-gray-400"}`}>
                              {format(date, "EEE", { locale: vi })}
                            </span>
                            <span className="text-lg font-bold">{format(date, "dd")}</span>
                            <span className="text-[10px] font-medium">{format(date, "MM/yyyy")}</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl text-sm italic">
                      {bookingMode === "by-doctor"
                        ? "Bác sĩ này hiện chưa có lịch trống. Vui lòng chọn bác sĩ khác hoặc chọn 'Đặt lịch nhanh'."
                        : "Hiện tại không có ngày trống nào khả dụng."}
                    </div>
                  )}
                </div>
              </div>

              {/* Step: Specialty Selection (Only for Auto-Assign mode) */}
              {bookingMode === "auto-assign" && (
                <div className="p-4 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">2</div>
                    <label className="text-base font-semibold text-gray-800">Chọn chuyên khoa</label>
                  </div>

                  {specialtiesLoading ? (
                    <div className="h-10 bg-gray-100 animate-pulse rounded-lg w-full"></div>
                  ) : !selectedDate ? (
                    <div className="text-sm text-gray-400 italic">Vui lòng chọn ngày trước</div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {specialties.map((spec) => (
                        <div
                          key={spec}
                          onClick={() => setSelectedSpecialty(spec)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${selectedSpecialty === spec
                            ? "border-primary bg-primary/5 ring-1 ring-primary"
                            : "border-gray-200 hover:border-primary/50"
                            }`}
                        >
                          <div className={`p-2 rounded-lg ${selectedSpecialty === spec ? "bg-primary text-white" : "bg-gray-100 text-gray-400"}`}>
                            <IconStethoscope size={18} />
                          </div>
                          <span className={`text-sm font-semibold ${selectedSpecialty === spec ? "text-primary" : "text-gray-700"}`}>
                            {spec}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Slot Selection */}
              <div className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {bookingMode === "by-doctor" ? "3" : "3"}
                  </div>
                  <label className="text-base font-semibold text-gray-800">Khung giờ rảnh</label>
                </div>

                {bookingMode === "auto-assign" && !selectedSpecialty ? (
                  <div className="text-sm text-gray-400 italic">Vui lòng chọn chuyên khoa để xem giờ rảnh</div>
                ) : !selectedDate ? (
                  <div className="text-sm text-gray-400 italic">Vui lòng chọn ngày trước</div>
                ) : slotsLoading ? (
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg"></div>)}
                  </div>
                ) : availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {availableSlots.map((slot: any) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          className={`flex flex-col items-center justify-center p-3 text-sm font-bold border rounded-xl transition-all ${isSelected
                            ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                            : "border-gray-200 bg-white text-gray-700 hover:border-primary/50"
                            } ${slot.isBooked ? "opacity-50 grayscale cursor-not-allowed bg-gray-50" : ""}`}
                          onClick={() => !slot.isBooked && setSelectedSlot(slot.time)}
                          disabled={slot.isBooked}
                        >
                          <div className="flex items-center gap-1">
                            <IconClock size={14} className={isSelected ? "text-white/70" : "text-gray-400"} />
                            {format(new Date(slot.time), "HH:mm")}
                          </div>
                          {slot.isBooked && <span className="text-[10px] font-normal mt-1">Đã hết</span>}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 text-gray-500 rounded-xl text-sm italic">
                    Không có khung giờ nào khả dụng cho ngày này.
                  </div>
                )}
              </div>

              {/* Final: Note & Submit */}
              <div className="p-4 space-y-4">
                <Textarea
                  label="Ghi chú thêm về sức khỏe"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Tôi muốn khám sức khỏe định kỳ, tôi đang bị đau dạ dày..."
                  fullWidth
                  rows={3}
                />

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button
                    type="submit"
                    size="sm"
                    loading={loading}
                    className="flex-1"
                    icon={<IconCalendarCheck size={20} />}
                  >
                    Xác nhận đặt lịch
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(ROUTES.PATIENT_APPOINTMENTS)}
                    icon={<IconX size={20} />}
                    size="sm"
                  >
                    Hủy bỏ
                  </Button>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2 italic">
                  * Lịch hẹn sau khi đặt sẽ ở trạng thái Chờ xác nhận từ bệnh viện.
                </p>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>

      {/* Medical Profile Reminder Modal */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Cập nhật hồ sơ y tế"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => setIsProfileModalOpen(false)}
            >
              Để sau
            </Button>
            <Button
              variant="primary"
              icon={<IconFileText size={20} />}
              onClick={() => {
                setIsProfileModalOpen(false);
                router.push(ROUTES.PATIENT_MEDICAL_PROFILE);
              }}
            >
              Cập nhật ngay
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-4 p-4 bg-tertiary/10 rounded-xl border border-tertiary/20">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-tertiary text-white flex items-center justify-center">
              <IconAlertCircle size={24} />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-tertiary mb-2">
                Hồ sơ y tế chưa đầy đủ
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                Để đảm bảo quá trình khám bệnh diễn ra thuận lợi và bác sĩ có thể tư vấn chính xác nhất,
                chúng tôi khuyến nghị bạn nên cập nhật đầy đủ thông tin hồ sơ y tế trước khi đặt lịch khám.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-medium text-gray-700">Thông tin y tế cần bổ sung:</h5>
            <div className="space-y-2">
              {!medicalHistory?.bloodType && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconX size={16} className="text-secondary" />
                  <span>Nhóm máu (Rất quan trọng)</span>
                </div>
              )}
              {(!medicalHistory?.allergies || medicalHistory.allergies.length === 0) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconX size={16} className="text-secondary" />
                  <span>Dị ứng thuốc/thực phẩm</span>
                </div>
              )}
              {(!medicalHistory?.chronicDiseases || medicalHistory.chronicDiseases.length === 0) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconX size={16} className="text-secondary" />
                  <span>Bệnh mãn tính (Tiểu đường, Tim mạch...)</span>
                </div>
              )}
              {(!medicalHistory?.medications || medicalHistory.medications.length === 0) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <IconX size={16} className="text-secondary" />
                  <span>Các loại thuốc đang sử dụng</span>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
            <p className="text-xs text-gray-600">
              <strong className="text-primary">Lưu ý:</strong> Bạn vẫn có thể đặt lịch khám mà không cần cập nhật ngay,
              tuy nhiên việc có đầy đủ thông tin sẽ giúp bác sĩ phục vụ bạn tốt hơn.
            </p>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
