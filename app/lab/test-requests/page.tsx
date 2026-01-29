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
import * as testRequestService from "@/lib/services/testRequests";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconFileText,
} from "@tabler/icons-react";

import { LAB_NAV_ITEMS } from "@/lib/navigation";
import Pagination from "@/components/ui/Pagination";
import Modal from "@/components/ui/Modal";
import Badge, { BadgeVariant } from "@/components/ui/Badge";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "waiting", label: "Chờ xử lý" },
  { value: "processing", label: "Đang xử lý" },
  { value: "completed", label: "Hoàn thành" },
];

export default function LabTestRequestsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("waiting");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Pagination state
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
    currentPage: 1,
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "lab_nurse") {
      router.push("/login");
      return;
    }
    loadTestRequests();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadTestRequests = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: pagination.limit,
        skip: pagination.skip,
      };

      if (statusFilter) {
        params.status = statusFilter;
      }

      const response: any = await testRequestService.getTestRequests(params);
      setTestRequests(response.data?.testRequests || []);
      setPagination(prev => ({
        ...prev,
        total: response.data?.total || 0
      }));
    } catch (error) {
      console.error("Error loading test requests:", error);
      toast.error("Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
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

  const handleViewDetail = async (id: string) => {
    try {
      setLoading(true);
      const res = await testRequestService.getTestRequest(id);
      setSelectedRequest(res.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Không thể tải chi tiết yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "waiting" | "processing" | "completed"
  ) => {
    try {
      await testRequestService.updateTestRequestStatus(id, status);
      loadTestRequests();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật trạng thái");
    }
  };

  const getStatusBadgeVariant = (status: string): BadgeVariant => {
    switch (status) {
      case "waiting":
        return "warning";
      case "processing":
        return "info";
      case "completed":
        return "success";
      default:
        return "gray";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      waiting: "Chờ xử lý",
      processing: "Đang xử lý",
      completed: "Hoàn thành",
    };
    return labels[status] || status;
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={LAB_NAV_ITEMS} title="Yêu cầu xét nghiệm">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={LAB_NAV_ITEMS} title="Yêu cầu xét nghiệm">
      <div className="mb-6 flex justify-between items-end gap-4">
        <div className="w-full max-w-xs">
          <Select
            label="Lọc theo trạng thái"
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      <Card>
        <CardHeader icon={<IconFileText size={20} />}>
          <CardTitle>Danh sách yêu cầu xét nghiệm ({pagination.total})</CardTitle>
        </CardHeader>
        <CardBody>
          {testRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có yêu cầu xét nghiệm nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">STT</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Dịch vụ</TableHead>
                  <TableHead>Ngày yêu cầu</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testRequests.map((request, index) => (
                  <TableRow key={request._id}>
                    <TableCell className="text-gray-500 font-medium">
                      {pagination.skip + index + 1}
                    </TableCell>
                    <TableCell className="font-medium text-gray-700">
                      {request.examId?.patientId?.fullName || "Chưa cập nhật"}
                    </TableCell>
                    <TableCell>
                      {request.serviceId?.name || request.testType || "Chưa xác định"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {getStatusLabel(request.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(request._id)}
                        >
                          Chi tiết
                        </Button>
                        {request.status === "waiting" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(request._id, "processing")}
                          >
                            Bắt đầu
                          </Button>
                        )}
                        {request.status === "processing" && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(request._id, "completed")}
                          >
                            Hoàn thành
                          </Button>
                        )}
                      </div>
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

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết yêu cầu xét nghiệm"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Bệnh nhân</span>
                <div className="font-semibold text-gray-700">{selectedRequest.examId?.patientId?.fullName}</div>
                <div className="text-xs text-gray-500">SĐT: {selectedRequest.examId?.patientId?.phone || "Chưa cập nhật"}</div>
                <div className="text-xs text-gray-500">Ngày sinh: {selectedRequest.examId?.patientId?.dateOfBirth ? format(new Date(selectedRequest.examId.patientId.dateOfBirth), "dd/MM/yyyy") : "Chưa cập nhật"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Bác sĩ chỉ định</span>
                <div className="font-semibold text-gray-700">{selectedRequest.examId?.doctorId?.fullName || "Chưa cập nhật"}</div>
                <div className="text-xs text-secondary font-medium">{selectedRequest.examId?.doctorId?.specialty}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Dịch vụ xét nghiệm</span>
                <div className="font-semibold text-primary text-xs">{selectedRequest.serviceId?.name}</div>
                <p className="text-xs text-gray-500">{selectedRequest.serviceId?.description}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Loại / Ghi chú</span>
                <div className="font-semibold text-gray-700">{selectedRequest.testType || "Không có ghi chú"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Trạng thái</span>
                <div>
                  <Badge variant={getStatusBadgeVariant(selectedRequest.status)}>
                    {getStatusLabel(selectedRequest.status)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest">Thời gian tạo</span>
                <div className="text-sm font-medium text-gray-700">{format(new Date(selectedRequest.createdAt), "dd/MM/yyyy HH:mm")}</div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
              {selectedRequest.status === "waiting" && (
                <Button onClick={() => { handleUpdateStatus(selectedRequest._id, "processing"); setIsDetailModalOpen(false); }}>Bắt đầu xét nghiệm</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
