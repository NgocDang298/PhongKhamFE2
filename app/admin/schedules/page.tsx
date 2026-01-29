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
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { ROUTES, DAYS_OF_WEEK, DAY_LABELS } from "@/lib/constants";
import * as workScheduleService from "@/lib/services/workSchedules";
import * as directoryService from "@/lib/services/directory";
import type { WorkSchedule, Doctor, LabNurse } from "@/types";
import {
  IconLayoutGrid,
  IconUserSquareRounded,
  IconClock,
  IconTrendingUp,
  IconPlus,
  IconChevronRight,
  IconAlertCircle,
  IconX,
  IconCalendar,
} from "@tabler/icons-react";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";
import Pagination from "@/components/ui/Pagination";

interface ScheduleWithPerson extends WorkSchedule {
  personName?: string;
  personType?: "doctor" | "nurse";
}

export default function AdminSchedulesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleWithPerson[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [nurses, setNurses] = useState<LabNurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState<{
    id: string;
    name: string;
    type: "doctor" | "nurse";
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] =
    useState<ScheduleWithPerson | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    doctorId: "",
    labNurseId: "",
    dayOfWeek: "",
    shiftStart: "",
    shiftEnd: "",
    note: "",
  });
  const [quickCreateData, setQuickCreateData] = useState({
    doctorId: "",
    labNurseId: "",
    selectedDays: [] as number[],
    shifts: [
      { start: "08:00", end: "12:00", note: "Ca sáng" },
      { start: "13:00", end: "17:00", note: "Ca chiều" },
    ],
  });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [doctorsRes, nursesRes] = await Promise.all([
        directoryService.getDoctors(),
        directoryService.getNurses(),
      ]);

      setDoctors(doctorsRes.data || []);
      setNurses(nursesRes.data || []);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const loadPersonSchedules = async (
    personId: string,
    type: "doctor" | "nurse"
  ) => {
    try {
      setLoading(true);
      const scheduleRes =
        type === "doctor"
          ? await workScheduleService.getDoctorSchedule(personId)
          : await workScheduleService.getNurseSchedule(personId);

      if (scheduleRes.data) {
        const personName =
          type === "doctor"
            ? doctors.find((d) => d._id === personId)?.fullName || ""
            : nurses.find((n) => n._id === personId)?.fullName || "";

        setSchedules(
          scheduleRes.data.map((schedule: WorkSchedule) => ({
            ...schedule,
            personName,
            personType: type,
          }))
        );
      } else {
        setSchedules([]);
      }
    } catch (error) {
      console.error("Error loading schedules:", error);
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPerson = (
    personId: string,
    personName: string,
    type: "doctor" | "nurse"
  ) => {
    setSelectedPerson({ id: personId, name: personName, type });
    loadPersonSchedules(personId, type);
  };

  const handleOpenModal = (schedule?: ScheduleWithPerson) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        doctorId:
          typeof schedule.doctorId === "object"
            ? schedule.doctorId._id
            : schedule.doctorId || "",
        labNurseId:
          typeof schedule.labNurseId === "object"
            ? schedule.labNurseId._id
            : schedule.labNurseId || "",
        dayOfWeek: schedule.dayOfWeek.toString(),
        shiftStart: schedule.shiftStart,
        shiftEnd: schedule.shiftEnd,
        note: schedule.note || "",
      });
    } else {
      setEditingSchedule(null);
      // Pre-fill with selected person if available
      setFormData({
        doctorId: selectedPerson?.type === "doctor" ? selectedPerson.id : "",
        labNurseId: selectedPerson?.type === "nurse" ? selectedPerson.id : "",
        dayOfWeek: "",
        shiftStart: "",
        shiftEnd: "",
        note: "",
      });
    }
    setIsModalOpen(true);
    setError("");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setFormData({
      doctorId: "",
      labNurseId: "",
      dayOfWeek: "",
      shiftStart: "",
      shiftEnd: "",
      note: "",
    });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.doctorId && !formData.labNurseId) {
      setError("Vui lòng chọn bác sĩ hoặc y tá");
      return;
    }

    if (!formData.dayOfWeek || !formData.shiftStart || !formData.shiftEnd) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const scheduleData: any = {
        dayOfWeek: parseInt(formData.dayOfWeek),
        shiftStart: formData.shiftStart,
        shiftEnd: formData.shiftEnd,
        note: formData.note,
      };

      if (formData.doctorId) {
        scheduleData.doctorId = formData.doctorId;
      } else {
        scheduleData.labNurseId = formData.labNurseId;
      }

      if (editingSchedule) {
        await workScheduleService.updateWorkSchedule(
          editingSchedule._id,
          scheduleData
        );
      } else {
        await workScheduleService.createWorkSchedule(scheduleData);
      }

      handleCloseModal();
      if (selectedPerson) {
        loadPersonSchedules(selectedPerson.id, selectedPerson.type);
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateData.doctorId && !quickCreateData.labNurseId) {
      setError("Vui lòng chọn bác sĩ hoặc y tá");
      return;
    }

    if (quickCreateData.selectedDays.length === 0) {
      setError("Vui lòng chọn ít nhất một ngày");
      return;
    }

    if (quickCreateData.shifts.length === 0) {
      setError("Vui lòng thêm ít nhất một ca");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const schedulesToCreate: any[] = [];

      quickCreateData.selectedDays.forEach((day) => {
        quickCreateData.shifts.forEach((shift) => {
          const scheduleData: any = {
            dayOfWeek: day,
            shiftStart: shift.start,
            shiftEnd: shift.end,
            note: shift.note,
          };

          if (quickCreateData.doctorId) {
            scheduleData.doctorId = quickCreateData.doctorId;
          } else {
            scheduleData.labNurseId = quickCreateData.labNurseId;
          }

          schedulesToCreate.push(scheduleData);
        });
      });

      // Create all schedules in parallel
      await Promise.all(
        schedulesToCreate.map((schedule) =>
          workScheduleService.createWorkSchedule(schedule)
        )
      );

      setIsQuickCreateOpen(false);
      const createdPersonId =
        quickCreateData.doctorId || quickCreateData.labNurseId;
      const createdPersonType = quickCreateData.doctorId ? "doctor" : "nurse";
      const createdPersonName =
        createdPersonType === "doctor"
          ? doctors.find((d) => d._id === createdPersonId)?.fullName || ""
          : nurses.find((n) => n._id === createdPersonId)?.fullName || "";

      setQuickCreateData({
        doctorId: "",
        labNurseId: "",
        selectedDays: [],
        shifts: [
          { start: "08:00", end: "12:00", note: "Ca sáng" },
          { start: "13:00", end: "17:00", note: "Ca chiều" },
        ],
      });

      // Reload schedules if viewing the person's schedule
      if (selectedPerson && selectedPerson.id === createdPersonId) {
        loadPersonSchedules(createdPersonId, createdPersonType);
      } else {
        // Auto-select the person whose schedule was created
        handleSelectPerson(
          createdPersonId,
          createdPersonName,
          createdPersonType
        );
      }

      toast.success(
        `Đã tạo thành công ${schedulesToCreate.length} ca làm việc!`
      );
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi tạo lịch");
    } finally {
      setCreating(false);
    }
  };

  const toggleDay = (day: number) => {
    setQuickCreateData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter((d) => d !== day)
        : [...prev.selectedDays, day],
    }));
  };

  const addShift = () => {
    setQuickCreateData((prev) => ({
      ...prev,
      shifts: [...prev.shifts, { start: "08:00", end: "12:00", note: "" }],
    }));
  };

  const removeShift = (index: number) => {
    setQuickCreateData((prev) => ({
      ...prev,
      shifts: prev.shifts.filter((_, i) => i !== index),
    }));
  };

  const updateShift = (
    index: number,
    field: "start" | "end" | "note",
    value: string
  ) => {
    setQuickCreateData((prev) => ({
      ...prev,
      shifts: prev.shifts.map((shift, i) =>
        i === index ? { ...shift, [field]: value } : shift
      ),
    }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa lịch làm việc này?")) {
      return;
    }

    try {
      await workScheduleService.deleteWorkSchedule(id);
      toast.success("Đã xóa lịch làm việc thành công");
      if (selectedPerson) {
        loadPersonSchedules(selectedPerson.id, selectedPerson.type);
      }
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      // Clear the other field when one is selected
      ...(name === "doctorId" && value ? { labNurseId: "" } : {}),
      ...(name === "labNurseId" && value ? { doctorId: "" } : {}),
    }));
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={ADMIN_NAV_ITEMS} title="Quản lý lịch làm việc">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS} title="Quản lý lịch làm việc">
      <div className="flex justify-end mb-4">
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setIsQuickCreateOpen(true)}
            icon={<IconTrendingUp size={16} />}
          >
            Tạo nhanh
          </Button>
          <Button
            onClick={() => handleOpenModal()}
            icon={<IconPlus size={16} />}
          >
            Tạo lịch đơn lẻ
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Danh sách bác sĩ và y tá */}
        <Card className="lg:col-span-1">
          <CardHeader icon={<IconUserSquareRounded size={20} />}>
            <CardTitle>Danh sách nhân viên</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Bác sĩ
                </h3>
                {doctors.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm italic">
                    Chưa có bác sĩ
                  </div>
                ) : (
                  doctors.map((doctor) => (
                    <button
                      key={doctor._id}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-left ${selectedPerson?.id === doctor._id &&
                        selectedPerson?.type === "doctor"
                        ? "!border-primary bg-primary/5 text-primary"
                        : ""
                        }`}
                      onClick={() =>
                        handleSelectPerson(
                          doctor._id,
                          doctor.fullName,
                          "doctor"
                        )
                      }
                    >
                      <div className="flex-1 mr-2">
                        <div className="font-semibold truncate">
                          {doctor.fullName}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {doctor.specialty}
                        </div>
                      </div>
                      <IconChevronRight size={20} />
                    </button>
                  ))
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  Y tá xét nghiệm
                </h3>
                {nurses.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm italic">
                    Chưa có y tá
                  </div>
                ) : (
                  nurses.map((nurse) => (
                    <button
                      key={nurse._id}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:border-primary/50 hover:bg-primary/5 transition-all text-left ${selectedPerson?.id === nurse._id &&
                        selectedPerson?.type === "nurse"
                        ? "!border-primary bg-primary/5 text-primary"
                        : ""
                        }`}
                      onClick={() =>
                        handleSelectPerson(nurse._id, nurse.fullName, "nurse")
                      }
                    >
                      <div className="flex-1 mr-2">
                        <div className="font-semibold truncate">
                          {nurse.fullName}
                        </div>
                      </div>
                      <IconChevronRight size={20} />
                    </button>
                  ))
                )}
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Lịch làm việc của người được chọn */}
        <Card className="lg:col-span-3">
          <CardHeader icon={<IconCalendar size={20} />}>
            <CardTitle>
              {selectedPerson
                ? `Lịch làm việc - ${selectedPerson.name}`
                : "Chọn nhân viên để xem lịch làm việc"}
            </CardTitle>
          </CardHeader>
          <CardBody>
            {!selectedPerson ? (
              <div className="text-center py-12 text-gray-500">
                Vui lòng chọn một bác sĩ hoặc y tá để xem lịch làm việc
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-48 text-gray-500">
                Đang tải...
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-12 text-gray-500 italic">
                Chưa có lịch làm việc
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">STT</TableHead>
                      <TableHead>Thứ</TableHead>
                      <TableHead>Giờ bắt đầu</TableHead>
                      <TableHead>Giờ kết thúc</TableHead>
                      <TableHead>Ghi chú</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {schedules
                      .slice((currentPage - 1) * limit, currentPage * limit)
                      .map((schedule, index) => (
                        <TableRow key={schedule._id}>
                          <TableCell className="font-medium">
                            {(currentPage - 1) * limit + index + 1}
                          </TableCell>
                          <TableCell>
                            {
                              DAY_LABELS[
                              schedule.dayOfWeek as keyof typeof DAY_LABELS
                              ]
                            }
                          </TableCell>
                          <TableCell>{schedule.shiftStart}</TableCell>
                          <TableCell>{schedule.shiftEnd}</TableCell>
                          <TableCell>{schedule.note || "Không có ghi chú"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenModal(schedule)}
                              >
                                Sửa
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(schedule._id)}
                              >
                                Xóa
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>

                <Pagination
                  total={schedules.length}
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
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={
          editingSchedule ? "Cập nhật lịch làm việc" : "Tạo lịch làm việc mới"
        }
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button onClick={handleSubmit}>
              {editingSchedule ? "Cập nhật" : "Tạo mới"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg text-sm">
              <IconAlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select
              label="Chọn bác sĩ"
              name="doctorId"
              options={[
                { value: "", label: "Chọn bác sĩ" },
                ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
              ]}
              value={formData.doctorId}
              onChange={handleChange}
              fullWidth
              disabled={!!formData.labNurseId}
            />
            <div className="text-gray-500 text-sm italic">hoặc</div>
            <Select
              label="Chọn y tá"
              name="labNurseId"
              options={[
                { value: "", label: "Chọn y tá" },
                ...nurses.map((n) => ({ value: n._id, label: n.fullName })),
              ]}
              value={formData.labNurseId}
              onChange={handleChange}
              fullWidth
              disabled={!!formData.doctorId}
            />
          </div>

          <Select
            label="Thứ trong tuần"
            name="dayOfWeek"
            options={DAYS_OF_WEEK.map((day) => ({
              value: day.value.toString(),
              label: day.label,
            }))}
            value={formData.dayOfWeek}
            onChange={handleChange}
            required
            fullWidth
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giờ bắt đầu"
              name="shiftStart"
              type="time"
              value={formData.shiftStart}
              onChange={handleChange}
              required
              fullWidth
            />
            <Input
              label="Giờ kết thúc"
              name="shiftEnd"
              type="time"
              value={formData.shiftEnd}
              onChange={handleChange}
              required
              fullWidth
            />
          </div>

          <Input
            label="Ghi chú (tùy chọn)"
            name="note"
            type="text"
            placeholder="Ví dụ: Ca sáng, Ca chiều..."
            value={formData.note}
            onChange={handleChange}
            fullWidth
          />
        </form>
      </Modal>

      {/* Quick Create Modal */}
      <Modal
        isOpen={isQuickCreateOpen}
        onClose={() => {
          setIsQuickCreateOpen(false);
          setQuickCreateData({
            doctorId: "",
            labNurseId: "",
            selectedDays: [],
            shifts: [
              { start: "08:00", end: "12:00", note: "Ca sáng" },
              { start: "13:00", end: "17:00", note: "Ca chiều" },
            ],
          });
          setError("");
        }}
        title="Tạo lịch làm việc nhanh"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsQuickCreateOpen(false);
                setQuickCreateData({
                  doctorId: "",
                  labNurseId: "",
                  selectedDays: [],
                  shifts: [
                    { start: "08:00", end: "12:00", note: "Ca sáng" },
                    { start: "13:00", end: "17:00", note: "Ca chiều" },
                  ],
                });
                setError("");
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleQuickCreate} loading={creating}>
              Tạo{" "}
              {quickCreateData.selectedDays.length *
                quickCreateData.shifts.length}{" "}
              ca
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg text-sm">
              <IconAlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] items-center gap-4">
            <Select
              label="Chọn bác sĩ"
              name="doctorId"
              options={[
                { value: "", label: "Chọn bác sĩ" },
                ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
              ]}
              value={quickCreateData.doctorId}
              onChange={(e) =>
                setQuickCreateData((prev) => ({
                  ...prev,
                  doctorId: e.target.value,
                  labNurseId: e.target.value ? "" : prev.labNurseId,
                }))
              }
              fullWidth
              disabled={!!quickCreateData.labNurseId}
            />
            <div className="text-gray-500 text-sm italic">hoặc</div>
            <Select
              label="Chọn y tá"
              name="labNurseId"
              options={[
                { value: "", label: "Chọn y tá" },
                ...nurses.map((n) => ({ value: n._id, label: n.fullName })),
              ]}
              value={quickCreateData.labNurseId}
              onChange={(e) =>
                setQuickCreateData((prev) => ({
                  ...prev,
                  labNurseId: e.target.value,
                  doctorId: e.target.value ? "" : prev.doctorId,
                }))
              }
              fullWidth
              disabled={!!quickCreateData.doctorId}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Chọn các ngày trong tuần
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  className={`py-2 text-sm font-medium border rounded-lg transition-all ${quickCreateData.selectedDays.includes(day.value)
                    ? "!border-primary bg-primary text-white shadow-md shadow-primary/20"
                    : "border-gray-200 text-gray-600 hover:border-primary/50"
                    }`}
                  onClick={() => toggleDay(day.value)}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Các ca làm việc
              </label>
              <Button variant="outline" size="sm" onClick={addShift}>
                + Thêm ca
              </Button>
            </div>
            <div className="space-y-4">
              {quickCreateData.shifts.map((shift, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-[1fr,1fr,2fr,auto] gap-4 p-4 bg-gray-50 rounded-xl items-end border border-gray-200"
                >
                  <Input
                    label="Giờ bắt đầu"
                    type="time"
                    value={shift.start}
                    onChange={(e) =>
                      updateShift(index, "start", e.target.value)
                    }
                    fullWidth
                  />
                  <Input
                    label="Giờ kết thúc"
                    type="time"
                    value={shift.end}
                    onChange={(e) => updateShift(index, "end", e.target.value)}
                    fullWidth
                  />
                  <Input
                    label="Ghi chú"
                    type="text"
                    placeholder="Ca sáng, Ca chiều..."
                    value={shift.note}
                    onChange={(e) => updateShift(index, "note", e.target.value)}
                    fullWidth
                  />
                  {quickCreateData.shifts.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeShift(index)}
                      icon={<IconX size={16} />}
                    >
                      Xóa
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-primary text-sm shadow-inner">
            <strong>Xem trước:</strong> Sẽ tạo{" "}
            <strong>
              {quickCreateData.selectedDays.length *
                quickCreateData.shifts.length}
            </strong>{" "}
            ca làm việc
            <br />({quickCreateData.selectedDays.length} ngày ×{" "}
            {quickCreateData.shifts.length} ca)
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
