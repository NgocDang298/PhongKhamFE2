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
import Modal from "@/components/ui/Modal";
import Textarea from "@/components/ui/Textarea";
import * as testResultService from "@/lib/services/testResults";
import * as testRequestService from "@/lib/services/testRequests";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconCircleCheck,
} from "@tabler/icons-react";

import { LAB_NAV_ITEMS } from "@/lib/navigation";

export default function LabTestResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    resultData: "",
    notes: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "lab_nurse") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await testRequestService.getTestRequests({ status: "completed" });
      setTestRequests(response.data?.testRequests || []);
    } catch (error) {
      console.error("Error loading test results:", error);
      toast.error("Không thể tải danh sách kết quả xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      let resultData;
      try {
        resultData = JSON.parse(formData.resultData);
      } catch {
        resultData = formData.resultData; // If not JSON, treat as a string value
      }
      await testResultService.createTestResult({
        testRequestId: selectedRequest._id,
        resultData: {
          ...(typeof resultData === "object"
            ? resultData
            : { value: resultData }),
          notes: formData.notes,
        },
      });
      setIsModalOpen(false);
      setSelectedRequest(null);
      setFormData({ resultData: "", notes: "" });
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu kết quả");
    }
  };

  const handleOpenModal = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={LAB_NAV_ITEMS} title="Kết quả xét nghiệm">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  const getPatientName = (request: any) => {
    return request.examId?.patientId?.fullName || "Không xác định";
  };

  const getServiceName = (request: any) => {
    return request.serviceId?.name || "N/A";
  };

  return (
    <DashboardLayout navItems={LAB_NAV_ITEMS} title="Kết quả xét nghiệm">
      <Card>
        <CardHeader icon={<IconCircleCheck size={20} />}>
          <CardTitle>Danh sách kết quả xét nghiệm</CardTitle>
        </CardHeader>
        <CardBody>
          {testRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có kết quả xét nghiệm nào hoàn thành
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Loại xét nghiệm</TableHead>
                  <TableHead>Y tá xét nghiệm</TableHead>
                  <TableHead>Ngày hoàn thành</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRequests.map((request) => (
                  <TableRow key={request._id}>
                    <TableCell className="font-medium text-gray-800">
                      {getPatientName(request)}
                    </TableCell>
                    <TableCell>
                      {getServiceName(request)}
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-md">
                        {request.testType || "-"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {request.labNurseId?.fullName || "-"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(request)}
                      >
                        Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Update Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          setFormData({ resultData: "", notes: "" });
        }}
        title="Nhập kết quả xét nghiệm"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRequest(null);
                setFormData({ resultData: "", notes: "" });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateResult}>Lưu kết quả</Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bệnh nhân</span>
                <div className="font-bold text-gray-800">{getPatientName(selectedRequest)}</div>
                <div className="text-xs text-gray-500">
                  NS: {selectedRequest.examId?.patientId?.dateOfBirth ? format(new Date(selectedRequest.examId.patientId.dateOfBirth), "dd/MM/yyyy") : "-"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Dịch vụ</span>
                <div className="font-bold text-primary">{getServiceName(selectedRequest)}</div>
                <div className="text-xs text-gray-500 italic">Loại: {selectedRequest.testType || "N/A"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Người thực hiện</span>
                <div className="font-bold text-gray-800">{selectedRequest.labNurseId?.fullName || "Chưa xác định"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ngày yêu cầu</span>
                <div className="font-bold text-gray-800">{format(new Date(selectedRequest.requestedAt), "dd/MM/yyyy HH:mm")}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-primary">Kết quả chi tiết</label>
              <div className="p-4 bg-white border border-gray-200 rounded-xl min-h-[100px] text-gray-800 whitespace-pre-wrap">
                {formData.resultData || "Chưa có dữ liệu kết quả"}
              </div>
            </div>

            <Textarea
              label="Ghi chú thêm"
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              fullWidth
              disabled // Keep read-only for history view
              rows={3}
            />
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
