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
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Pagination from "@/components/ui/Pagination";
import * as testResultService from "@/lib/services/testResults";
import * as testRequestService from "@/lib/services/testRequests";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconCircleCheck,
  IconFilter,
  IconRefresh,
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
  const [existingResult, setExistingResult] = useState<any>(null);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    currentPage: 1,
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: "completed" as "waiting" | "processing" | "completed" | "",
    fromDate: "",
    toDate: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "lab_nurse") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, router, filters, pagination.skip, pagination.limit]);

  const loadData = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: pagination.limit,
        skip: pagination.skip,
      };

      if (filters.status) params.status = filters.status;
      if (filters.fromDate) params.fromDate = filters.fromDate;
      if (filters.toDate) params.toDate = filters.toDate;

      const response = await testRequestService.getTestRequests(params);
      setTestRequests(response.data?.testRequests || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0,
      }));
    } catch (error) {
      console.error("Error loading test results:", error);
      toast.error("Không thể tải danh sách kết quả xét nghiệm");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: "completed",
      fromDate: "",
      toDate: "",
    });
    setPagination(prev => ({ ...prev, skip: 0, currentPage: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: newPage,
      skip: (newPage - 1) * prev.limit,
    }));
  };

  const handlePageSizeChange = (newSize: number) => {
    setPagination(prev => ({
      ...prev,
      limit: newSize,
      skip: 0,
      currentPage: 1,
    }));
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

  const handleOpenModal = async (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);

    // Try to load existing result
    try {
      const result = await testResultService.getTestResultByRequest(request._id);
      if (result.data) {
        setExistingResult(result.data);
        setFormData({
          resultData: typeof result.data.resultData === 'object'
            ? JSON.stringify(result.data.resultData, null, 2)
            : result.data.resultData || "",
          notes: result.data.resultData?.notes || "",
        });
      }
    } catch (error) {
      // No existing result, keep form empty
      setExistingResult(null);
      setFormData({ resultData: "", notes: "" });
    }
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

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const getStatusBadge = (status: string) => {
    const badges = {
      waiting: "bg-yellow-100 text-yellow-700 border-yellow-200",
      processing: "bg-blue-100 text-blue-700 border-blue-200",
      completed: "bg-green-100 text-green-700 border-green-200",
    };
    const labels = {
      waiting: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-md border ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-600'}`}>
        {labels[status as keyof typeof labels] || status}
      </span>
    );
  };

  return (
    <DashboardLayout navItems={LAB_NAV_ITEMS} title="Kết quả xét nghiệm">
      {/* Filter Panel */}
      <Card className="mb-6">
        <CardHeader icon={<IconFilter size={20} />}>
          <CardTitle>Bộ lọc tìm kiếm</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              label="Trạng thái"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: "", label: "Tất cả trạng thái" },
                { value: "waiting", label: "Chờ xử lý" },
                { value: "processing", label: "Đang xử lý" },
                { value: "completed", label: "Hoàn thành" },
              ]}
              fullWidth
            />
            <Input
              label="Từ ngày"
              type="date"
              value={filters.fromDate}
              onChange={(e) => handleFilterChange('fromDate', e.target.value)}
              fullWidth
            />
            <Input
              label="Đến ngày"
              type="date"
              value={filters.toDate}
              onChange={(e) => handleFilterChange('toDate', e.target.value)}
              fullWidth
            />
            <div className="flex items-end gap-2">
              <Button
                variant="outline"
                onClick={handleResetFilters}
                icon={<IconRefresh size={16} />}
                fullWidth
              >
                Đặt lại
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader icon={<IconCircleCheck size={20} />}>
          <CardTitle>Danh sách kết quả xét nghiệm ({pagination.total})</CardTitle>
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
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Loại XN</TableHead>
                  <TableHead>Y tá XN</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày yêu cầu</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRequests.map((request, index) => (
                  <TableRow key={request._id}>
                    <TableCell className="text-gray-500 font-medium">
                      {pagination.skip + index + 1}
                    </TableCell>
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
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {format(new Date(request.createdAt || request.requestedAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenModal(request)}
                      >
                        {request.status === 'completed' ? 'Xem' : 'Nhập KQ'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Pagination
            total={pagination.total}
            limit={pagination.limit}
            skip={pagination.skip}
            onPageChange={handlePageChange}
            onLimitChange={handlePageSizeChange}
          />
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

            {selectedRequest.status === 'completed' && existingResult ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-primary">Kết quả chi tiết</label>
                  <div className="p-4 bg-white border border-gray-200 rounded-xl min-h-[100px] text-gray-800 whitespace-pre-wrap">
                    {formData.resultData || "Chưa có dữ liệu kết quả"}
                  </div>
                </div>

                <Textarea
                  label="Ghi chú"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  fullWidth
                  disabled
                  rows={3}
                />
              </>
            ) : (
              <form onSubmit={handleCreateResult} className="space-y-4">
                <Textarea
                  label="Kết quả xét nghiệm (JSON hoặc văn bản)"
                  name="resultData"
                  value={formData.resultData}
                  onChange={(e) =>
                    setFormData({ ...formData, resultData: e.target.value })
                  }
                  required
                  fullWidth
                  rows={6}
                  placeholder='{"value": "123", "unit": "mg/dL"} hoặc ghi chú văn bản'
                  helperText="Nhập kết quả dưới dạng JSON hoặc văn bản tự do"
                />
                <Textarea
                  label="Ghi chú thêm"
                  name="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  fullWidth
                  rows={3}
                />
              </form>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
