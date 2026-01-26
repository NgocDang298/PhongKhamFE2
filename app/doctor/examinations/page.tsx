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
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ROUTES, EXAMINATION_STATUS_LABELS } from "@/lib/constants";
import * as examinationService from "@/lib/services/examinations";
import * as appointmentService from "@/lib/services/appointments";
import * as profileService from "@/lib/services/profile";
import * as directoryService from "@/lib/services/directory";
import * as serviceService from "@/lib/services/services";
import * as testRequestService from "@/lib/services/testRequests";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconFileText,
  IconPlus,
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

export default function DoctorExaminationsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [examinations, setExaminations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [testServices, setTestServices] = useState<any[]>([]);
  const [labNurses, setLabNurses] = useState<any[]>([]);
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isTestRequestModalOpen, setIsTestRequestModalOpen] = useState(false);
  const [selectedExamination, setSelectedExamination] = useState<any>(null);
  const [startFormData, setStartFormData] = useState({
    appointmentId: "",
    serviceId: "",
  });
  const [updateFormData, setUpdateFormData] = useState({
    diagnosis: "",
    treatment: "",
    doctorNote: "",
    resultSummary: "",
  });
  const [testRequestFormData, setTestRequestFormData] = useState({
    testType: "",
    serviceId: "",
    labNurseId: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "doctor") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load examinations and appointments (critical data)
      const [examsRes, appointmentsRes] = await Promise.all([
        profileService.getMyExaminations({
          status: statusFilter as any,
        }),
        appointmentService.getAppointments({ status: "confirmed" }),
      ]);

      console.log("Raw examinations response:", examsRes);
      console.log("Raw appointments response:", appointmentsRes);

      // Handle response structure - API interceptor already unwraps response.data
      // Response could be: { examinations: [], total: number } or direct array or { data: { examinations: [] } }
      let examinationsRes: any = examsRes;
      let examinationsData: any[] = [];
      if (Array.isArray(examinationsRes)) {
        examinationsData = examinationsRes;
      } else if (
        examinationsRes?.examinations &&
        Array.isArray(examinationsRes.examinations)
      ) {
        examinationsData = examinationsRes.examinations;
      } else if (examinationsRes?.data) {
        if (Array.isArray(examinationsRes.data)) {
          examinationsData = examinationsRes.data;
        } else if (
          examinationsRes.data?.examinations &&
          Array.isArray(examinationsRes.data.examinations)
        ) {
          examinationsData = examinationsRes.data.examinations;
        }
      }

      let appointmentsResult: any = appointmentsRes;
      let appointmentsData: any[] = [];
      if (Array.isArray(appointmentsResult)) {
        appointmentsData = appointmentsResult;
      } else if (
        appointmentsResult?.appointments &&
        Array.isArray(appointmentsResult.appointments)
      ) {
        appointmentsData = appointmentsResult.appointments;
      } else if (appointmentsResult?.data) {
        if (Array.isArray(appointmentsResult.data)) {
          appointmentsData = appointmentsResult.data;
        } else if (appointmentsResult.data?.appointments) {
          appointmentsData = appointmentsResult.data.appointments;
        }
      }

      setExaminations(examinationsData);
      setAppointments(appointmentsData);

      if (isAuthenticated) {
        try {
          const servicesRes = await serviceService.getServices({
            serviceType: "examination",
            isActive: true,
          });

          let servicesData: any[] = [];
          if (Array.isArray(servicesRes)) {
            servicesData = servicesRes;
          } else if (
            (servicesRes as any)?.services &&
            Array.isArray((servicesRes as any).services)
          ) {
            servicesData = (servicesRes as any).services;
          } else if (servicesRes?.data) {
            servicesData = Array.isArray(servicesRes.data)
              ? servicesRes.data
              : (servicesRes.data as any).services || [];
          }
          setServices(servicesData);
        } catch (err) {
          console.warn("Failed to load examination services:", err);
        }

        // Load Test Services
        try {
          const testServicesRes = await serviceService.getServices({
            serviceType: "test",
            isActive: true,
          });
          console.log("Test Services Response:", testServicesRes);

          let testServicesData: any[] = [];
          if (Array.isArray(testServicesRes)) {
            testServicesData = testServicesRes;
          } else if (
            (testServicesRes as any)?.services &&
            Array.isArray((testServicesRes as any).services)
          ) {
            testServicesData = (testServicesRes as any).services;
          } else if (testServicesRes?.data) {
            testServicesData = Array.isArray(testServicesRes.data)
              ? testServicesRes.data
              : (testServicesRes.data as any).services || [];
          }
          setTestServices(testServicesData);
        } catch (err) {
          console.warn("Failed to load test services:", err);
        }

        // Load Lab Nurses
        try {
          const labNursesRes = await directoryService.getNurses();
          console.log("Lab Nurses Response:", labNursesRes);

          let labNursesData: any[] = [];
          if (Array.isArray(labNursesRes)) {
            labNursesData = labNursesRes;
          } else if (labNursesRes?.data && Array.isArray(labNursesRes.data)) {
            labNursesData = labNursesRes.data;
          }
          setLabNurses(labNursesData);
        } catch (err) {
          console.warn("Failed to load lab nurses:", err);
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setExaminations([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamination = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find the selected appointment to get staffId from confirmedBy
      const selectedAppointment = appointments.find(
        (apt) => apt._id === startFormData.appointmentId
      );

      // Get staffId from appointment's confirmedBy or undefined if missing
      const staffId = selectedAppointment?.confirmedBy
        ? typeof selectedAppointment.confirmedBy === "object"
          ? selectedAppointment.confirmedBy._id
          : selectedAppointment.confirmedBy
        : undefined;

      if (!staffId) {
        console.warn("Starting examination without confirmedBy staff ID");
      }

      const dataToSubmit: any = {
        ...startFormData,
      };

      // Only include staffId if it exists
      if (staffId) {
        dataToSubmit.staffId = staffId;
      }

      await examinationService.startExamination(dataToSubmit);
      setIsStartModalOpen(false);
      setStartFormData({ appointmentId: "", serviceId: "" });
      toast.success("Đã bắt đầu ca khám thành công!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi bắt đầu ca khám");
    }
  };

  const handleUpdateExamination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamination) return;
    try {
      await examinationService.updateExamination(
        selectedExamination._id,
        updateFormData
      );
      setIsUpdateModalOpen(false);
      setSelectedExamination(null);
      setUpdateFormData({
        diagnosis: "",
        treatment: "",
        doctorNote: "",
        resultSummary: "",
      });
      toast.success("Cập nhật thông tin ca khám thành công!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  const handleCompleteExamination = async () => {
    if (!selectedExamination) return;
    try {
      await examinationService.completeExamination(
        selectedExamination._id,
        updateFormData
      );
      setIsUpdateModalOpen(false);
      setSelectedExamination(null);
      setUpdateFormData({
        diagnosis: "",
        treatment: "",
        doctorNote: "",
        resultSummary: "",
      });
      toast.success("Đã hoàn thành ca khám!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi hoàn thành ca khám");
    }
  };

  const handleOpenUpdateModal = async (exam: any) => {
    setSelectedExamination(exam);
    setUpdateFormData({
      diagnosis: exam.diagnosis || "",
      treatment: exam.treatment || "",
      doctorNote: exam.doctorNote || "",
      resultSummary: exam.resultSummary || "",
    });

    // Load test requests for this examination
    try {
      const testRequestsRes =
        await testRequestService.getTestRequestsByExamination(exam._id);
      let testRequestsData: any[] = [];
      if (Array.isArray(testRequestsRes)) {
        testRequestsData = testRequestsRes;
      } else if (testRequestsRes?.data && Array.isArray(testRequestsRes.data)) {
        testRequestsData = testRequestsRes.data;
      }
      setTestRequests(testRequestsData);
    } catch (error) {
      console.warn("Could not load test requests:", error);
      setTestRequests([]);
    }

    setIsUpdateModalOpen(true);
  };

  const handleOpenTestRequestModal = () => {
    setTestRequestFormData({
      testType: "",
      serviceId: "",
      labNurseId: "",
    });
    setIsTestRequestModalOpen(true);
  };

  const handleCreateTestRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExamination) return;

    try {
      await testRequestService.createTestRequest({
        examId: selectedExamination._id,
        ...testRequestFormData,
      });

      // Reload test requests
      const testRequestsRes =
        await testRequestService.getTestRequestsByExamination(
          selectedExamination._id
        );
      let testRequestsData: any[] = [];
      if (Array.isArray(testRequestsRes)) {
        testRequestsData = testRequestsRes;
      } else if (testRequestsRes?.data && Array.isArray(testRequestsRes.data)) {
        testRequestsData = testRequestsRes.data;
      }
      setTestRequests(testRequestsData);

      setIsTestRequestModalOpen(false);
      setTestRequestFormData({
        testType: "",
        serviceId: "",
        labNurseId: "",
      });
      toast.success("Đã tạo yêu cầu xét nghiệm thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo yêu cầu xét nghiệm");
    }
  };

  const getTestRequestStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return { bg: "#f59e0b20", color: "#f59e0b" };
      case "processing":
        return { bg: "#3b82f620", color: "#3b82f6" };
      case "completed":
        return { bg: "#10b98120", color: "#10b981" };
      default:
        return { bg: "#6b728020", color: "#6b7280" };
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Ca khám">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Ca khám">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 text-gray-600">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div style={{ maxWidth: "300px" }}>
            <Select
              label="Lọc theo trạng thái"
              options={[
                { value: "", label: "Tất cả" },
                { value: "processing", label: "Đang khám" },
                { value: "done", label: "Hoàn thành" },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
            />
          </div>
          <Button
            onClick={() => setIsStartModalOpen(true)}
            icon={<IconPlus size={16} />}
          >
            Bắt đầu ca khám
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader icon={<IconFileText size={20} />}>
          <CardTitle>Danh sách ca khám</CardTitle>
        </CardHeader>
        <CardBody>
          {examinations.length === 0 ? (
            <div className="text-center py-12 text-gray-500 italic">
              Chưa có ca khám nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày khám</TableHead>
                  <TableHead>Chẩn đoán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examinations.map((exam) => (
                  <TableRow key={exam._id}>
                    <TableCell>
                      {typeof exam.patientId === "object" && exam.patientId
                        ? exam.patientId.fullName
                        : "Không xác định"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(exam.examDate), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>{exam.diagnosis || "-"}</TableCell>
                    <TableCell>
                      <span
                        className="px-2 py-1 text-xs font-semibold rounded-full"
                        style={{
                          backgroundColor:
                            exam.status === "done" ? "#10b98120" : "#3b82f620",
                          color: exam.status === "done" ? "#10b981" : "#3b82f6",
                        }}
                      >
                        {
                          EXAMINATION_STATUS_LABELS[
                          exam.status as keyof typeof EXAMINATION_STATUS_LABELS
                          ]
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenUpdateModal(exam)}
                      >
                        {exam.status === "processing" ? "Cập nhật" : "Xem/Sửa"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Start Examination Modal */}
      <Modal
        isOpen={isStartModalOpen}
        onClose={() => {
          setIsStartModalOpen(false);
          setStartFormData({ appointmentId: "", serviceId: "" });
        }}
        title="Bắt đầu ca khám"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsStartModalOpen(false);
                setStartFormData({ appointmentId: "", serviceId: "" });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleStartExamination}>Bắt đầu</Button>
          </>
        }
      >
        <form onSubmit={handleStartExamination} className="space-y-4">
          <Select
            label="Chọn lịch hẹn"
            name="appointmentId"
            options={[
              { value: "", label: "Chọn lịch hẹn" },
              ...appointments
                .filter((apt) => {
                  const doctorId =
                    typeof apt.doctorId === "object"
                      ? apt.doctorId._id
                      : apt.doctorId;
                  return doctorId === user?._id && apt.status === "confirmed";
                })
                .map((apt) => ({
                  value: apt._id,
                  label: `${typeof apt.patientId === "object" && apt.patientId
                      ? apt.patientId.fullName
                      : "Không xác định"
                    } - ${format(
                      new Date(apt.appointmentDate),
                      "dd/MM/yyyy HH:mm",
                      { locale: vi }
                    )}`,
                })),
            ]}
            value={startFormData.appointmentId}
            onChange={(e) =>
              setStartFormData({
                ...startFormData,
                appointmentId: e.target.value,
              })
            }
            required
            fullWidth
          />
          <Select
            label="Chọn dịch vụ"
            name="serviceId"
            options={[
              { value: "", label: "Chọn dịch vụ" },
              ...services.map((s) => ({
                value: s._id,
                label: `${s.name} - ${s.price.toLocaleString("vi-VN")}đ`,
              })),
            ]}
            value={startFormData.serviceId}
            onChange={(e) =>
              setStartFormData({ ...startFormData, serviceId: e.target.value })
            }
            required
            fullWidth
          />
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
            người xác nhận lịch hẹn.
          </div>
        </form>
      </Modal>

      {/* Update Examination Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedExamination(null);
          setUpdateFormData({
            diagnosis: "",
            treatment: "",
            doctorNote: "",
            resultSummary: "",
          });
        }}
        title="Cập nhật ca khám"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setSelectedExamination(null);
                setUpdateFormData({
                  diagnosis: "",
                  treatment: "",
                  doctorNote: "",
                  resultSummary: "",
                });
              }}
            >
              Hủy
            </Button>
            {selectedExamination?.status === "processing" && (
              <Button variant="primary" onClick={handleCompleteExamination}>
                Hoàn thành
              </Button>
            )}
            <Button onClick={handleUpdateExamination}>Cập nhật</Button>
          </>
        }
      >
        <form onSubmit={handleUpdateExamination} className="space-y-4">
          <Textarea
            label="Chẩn đoán"
            name="diagnosis"
            value={updateFormData.diagnosis}
            onChange={(e) =>
              setUpdateFormData({
                ...updateFormData,
                diagnosis: e.target.value,
              })
            }
            fullWidth
            rows={3}
          />
          <Textarea
            label="Điều trị"
            name="treatment"
            value={updateFormData.treatment}
            onChange={(e) =>
              setUpdateFormData({
                ...updateFormData,
                treatment: e.target.value,
              })
            }
            fullWidth
            rows={3}
          />
          <Textarea
            label="Ghi chú của bác sĩ"
            name="doctorNote"
            value={updateFormData.doctorNote}
            onChange={(e) =>
              setUpdateFormData({
                ...updateFormData,
                doctorNote: e.target.value,
              })
            }
            fullWidth
            rows={2}
          />
          <Textarea
            label="Tóm tắt kết quả"
            name="resultSummary"
            value={updateFormData.resultSummary}
            onChange={(e) =>
              setUpdateFormData({
                ...updateFormData,
                resultSummary: e.target.value,
              })
            }
            fullWidth
            rows={2}
          />

          <div className="mt-4 border-t pt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-lg">Yêu cầu xét nghiệm</h3>
              {selectedExamination?.status === "processing" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleOpenTestRequestModal}
                >
                  + Thêm yêu cầu
                </Button>
              )}
            </div>

            {testRequests.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded">
                Chưa có yêu cầu xét nghiệm nào
              </div>
            ) : (
              <div className="space-y-3">
                {testRequests.map((req, index) => {
                  const statusStyle = getTestRequestStatusColor(req.status);
                  return (
                    <div
                      key={req._id || index}
                      className="p-3 border rounded-lg bg-gray-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">
                          {typeof req.serviceId === "object"
                            ? req.serviceId.name
                            : "Dịch vụ xét nghiệm"}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {req.testType}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          Y tá:{" "}
                          {typeof req.labNurseId === "object"
                            ? req.labNurseId.fullName
                            : "Chưa phân công"}
                        </div>
                      </div>
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                        }}
                      >
                        {req.status === "waiting"
                          ? "Chờ xử lý"
                          : req.status === "processing"
                            ? "Đang thực hiện"
                            : "Hoàn thành"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Create Test Request Modal */}
      <Modal
        isOpen={isTestRequestModalOpen}
        onClose={() => setIsTestRequestModalOpen(false)}
        title="Tạo yêu cầu xét nghiệm"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setIsTestRequestModalOpen(false)}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateTestRequest}>Tạo yêu cầu</Button>
          </>
        }
      >
        <form onSubmit={handleCreateTestRequest} className="space-y-4">
          <Select
            label="Chọn dịch vụ xét nghiệm"
            value={testRequestFormData.serviceId}
            onChange={(e) =>
              setTestRequestFormData({
                ...testRequestFormData,
                serviceId: e.target.value,
              })
            }
            options={[
              { value: "", label: "Chọn dịch vụ" },
              ...testServices.map((s) => ({
                value: s._id,
                label: `${s.name} - ${s.price.toLocaleString("vi-VN")}đ`,
              })),
            ]}
            required
            fullWidth
          />
          <Select
            label="Chọn y tá thực hiện (Tùy chọn)"
            value={testRequestFormData.labNurseId}
            onChange={(e) =>
              setTestRequestFormData({
                ...testRequestFormData,
                labNurseId: e.target.value,
              })
            }
            options={[
              { value: "", label: "Chọn y tá" },
              ...labNurses.map((n) => ({
                value: n._id,
                label: n.fullName,
              })),
            ]}
            fullWidth
          />
          <Input
            label="Mô tả yêu cầu / Loại xét nghiệm"
            value={testRequestFormData.testType}
            onChange={(e) =>
              setTestRequestFormData({
                ...testRequestFormData,
                testType: e.target.value,
              })
            }
            placeholder="VD: Xét nghiệm máu tổng quát..."
            required
            fullWidth
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}
