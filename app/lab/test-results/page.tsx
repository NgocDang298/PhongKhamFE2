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
import { uploadFiles } from "@/lib/services/upload";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconCircleCheck,
  IconFilter,
  IconRefresh,
  IconPhoto,
  IconX,
  IconUserSquareRounded,
  IconMicroscope,
  IconNurse,
  IconClock,
  IconSend,
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
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]); // URLs from server after upload

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

    setLoading(true);
    try {
      let resultDataValue;
      try {
        resultDataValue = JSON.parse(formData.resultData);
      } catch {
        resultDataValue = formData.resultData;
      }

      const finalResultData = {
        ...(typeof resultDataValue === "object" ? resultDataValue : { value: resultDataValue }),
        notes: formData.notes,
      };

      // Combine existing images with newly uploaded images
      const allImageUrls = [
        ...(existingResult?.images || []),
        ...uploadedImageUrls,
      ];

      if (existingResult) {
        await testResultService.updateTestResult(existingResult._id, {
          resultData: finalResultData,
          ...(allImageUrls.length > 0 && { images: allImageUrls }),
        });
        toast.success("Cập nhật kết quả thành công");
      } else {
        await testResultService.createTestResult({
          testRequestId: selectedRequest._id,
          resultData: finalResultData,
          labNurseId: user?._id || selectedRequest.labNurseId?._id,
          ...(allImageUrls.length > 0 && { images: allImageUrls }),
        });
        toast.success("Lưu kết quả thành công");
      }

      handleCloseModal();
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi lưu kết quả");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setExistingResult(null);
    setFormData({ resultData: "", notes: "" });
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setUploadedImageUrls([]);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      // Create preview URLs immediately
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);

      // Upload files to API
      try {
        toast.info("Đang tải ảnh lên...");
        const uploadResponse = await uploadFiles(files);
        const urls = uploadResponse.data?.urls || [];

        if (urls.length > 0) {
          setUploadedImageUrls(prev => [...prev, ...urls]);
          toast.success(`Tải lên thành công ${urls.length} ảnh`);
        } else {
          throw new Error("Không nhận được URL ảnh từ server");
        }
      } catch (error: any) {
        toast.error("Lỗi khi tải ảnh lên: " + (error.message || "Vui lòng thử lại"));
        // Remove the preview URLs if upload failed
        newPreviews.forEach(url => URL.revokeObjectURL(url));
        setPreviewUrls(prev => prev.slice(0, -files.length));
      }
    }
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setUploadedImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleOpenModal = async (request: any) => {
    try {
      setLoading(true);
      const requestRes = await testRequestService.getTestRequest(request._id);
      const detailedRequest = requestRes.data;

      setSelectedRequest(detailedRequest);
      setIsModalOpen(true);

      try {
        const resultRes = await testResultService.getTestResultByRequest(request._id);
        if (resultRes.data) {
          const resultData = resultRes.data.resultData;
          setExistingResult(resultRes.data);

          let displayData = "";
          if (resultData) {
            if (typeof resultData === 'object') {
              // If it's a simple {value: ...} object, just show the value
              if (resultData.value && Object.keys(resultData).length <= 2) {
                displayData = resultData.value;
              } else {
                // Otherwise format as key-value pairs for readability
                displayData = Object.entries(resultData)
                  .filter(([key]) => key !== 'notes')
                  .map(([key, val]) => `${key}: ${val}`)
                  .join('\n');
              }
            } else {
              displayData = resultData;
            }
          }

          setFormData({
            resultData: displayData,
            notes: resultData?.notes || resultRes.data.notes || "",
          });
        } else {
          setExistingResult(null);
          setFormData({ resultData: "", notes: "" });
        }
      } catch (error) {
        setExistingResult(null);
        setFormData({ resultData: "", notes: "" });
      }
    } catch (error) {
      console.error("Error loading test request details:", error);
      toast.error("Không thể tải thông tin chi tiết yêu cầu");
    } finally {
      if (!isModalOpen) setLoading(false);
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
    return request.serviceId?.name || "Chưa có dịch vụ";
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
      <span className={`px-2 py-0.5 text-xs text-nowrap font-semibold rounded-md border ${badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-600'}`}>
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
                  <TableHead>Loại xét nghiệm</TableHead>
                  <TableHead>Y tá</TableHead>
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
        onClose={handleCloseModal}
        title={existingResult ? "Chi tiết kết quả xét nghiệm" : "Nhập kết quả xét nghiệm mới"}
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={handleCloseModal}
              icon={<IconX size={18} />}
            >
              Hủy
            </Button>
            <Button
              loading={loading}
              onClick={handleCreateResult}
              icon={<IconSend size={18} />}
            >
              {existingResult ? "Cập nhật kết quả" : "Gửi kết quả"}
            </Button>
          </>
        }
      >
        {selectedRequest && (
          <div className="space-y-6">
            {/* Patient & Service Summary Card */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <IconUserSquareRounded size={14} />
                  Bệnh nhân
                </span>
                <div className="font-semibold text-gray-800 text-sm">{getPatientName(selectedRequest)}</div>
                <div className="text-xs text-gray-500">
                  NS: {selectedRequest.examId?.patientId?.dateOfBirth ? format(new Date(selectedRequest.examId.patientId.dateOfBirth), "dd/MM/yyyy") : "-"}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <IconMicroscope size={14} />
                  Dịch vụ xét nghiệm
                </span>
                <div className="font-semibold text-primary">{getServiceName(selectedRequest)}</div>
                <div className="text-sm text-gray-500 italic">(Nhóm: {selectedRequest.testType})</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <IconNurse size={14} />
                  Người thực hiện
                </span>
                <div className="font-semibold text-gray-800 text-sm">{selectedRequest.labNurseId?.fullName || "Chưa xác định"}</div>
              </div>
              <div className="space-y-1">
                <span className="text-xs font-semibold text-primary uppercase tracking-widest flex items-center gap-1.5">
                  <IconClock size={14} />
                  Thời gian yêu cầu
                </span>
                <div className="font-semibold text-gray-800 text-sm">{format(new Date(selectedRequest.requestedAt || selectedRequest.createdAt), "dd/MM/yyyy HH:mm")}</div>
              </div>
            </div>

            <div className="space-y-6">
              {existingResult && selectedRequest.status === 'completed' ? (
                /* VIEW MODE: Professional Medical Report Style */
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-primary flex items-center gap-2">
                      <IconCircleCheck size={18} />
                      NỘI DUNG KẾT QUẢ XÉT NGHIỆM
                    </label>
                    <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[140px] text-gray-800 leading-relaxed whitespace-pre-wrap text-base font-medium">
                      {formData.resultData || "Chưa có nội dung kết quả."}
                    </div>
                  </div>

                  {formData.notes && (
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest px-1">Ghi chú lâm sàng</label>
                      <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-gray-600 text-sm italic">
                        {formData.notes}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* EDIT/CREATE MODE: User Friendly Input */
                <form onSubmit={handleCreateResult} className="space-y-5">
                  <div className="space-y-1">
                    <Textarea
                      label="Nội dung kết quả / Chỉ số đo được"
                      name="resultData"
                      value={formData.resultData}
                      onChange={(e) =>
                        setFormData({ ...formData, resultData: e.target.value })
                      }
                      required
                      fullWidth
                      rows={2}
                      placeholder="VD: Hemoglobin: 14.5 g/dL, Hồng cầu: 4.8 triệu/mm3..."
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-1">
                    <Textarea
                      label="Ghi chú thêm từ y tá"
                      name="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      fullWidth
                      rows={2}
                      placeholder="Mẫu bệnh phẩm đạt yêu cầu, không có bất thường về kỹ thuật..."
                    />
                  </div>
                </form>
              )}

              {/* IMAGE GALLERY SECTION (Visual Evidence) */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <label className="text-sm font-semibold text-primary flex items-center gap-2">
                  <IconPhoto size={18} />
                  HÌNH ẢNH MINH CHỨNG (NẾU CÓ)
                </label>

                <div className="flex flex-wrap gap-4">
                  {/* Current Images from Backend */}
                  {existingResult?.images?.map((img: string, idx: number) => (
                    <div key={`existing-${idx}`} className="group relative w-28 h-28 rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                      <img src={img} alt="Result" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-semibold uppercase tracking-tighter">Ảnh cũ</span>
                      </div>
                    </div>
                  ))}

                  {/* New Selected Files Previews */}
                  {previewUrls.map((url, idx) => (
                    <div key={`new-${idx}`} className="relative w-28 h-28 rounded-xl overflow-hidden border-2 border-primary shadow-sm">
                      <img src={url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <IconX size={14} />
                      </button>
                    </div>
                  ))}

                  {selectedRequest.status !== 'completed' && (
                    <label className="w-28 h-28 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all text-gray-400 hover:text-primary shadow-sm bg-gray-50/50">
                      <IconPhoto size={28} />
                      <span className="text-[10px] font-semibold mt-1 uppercase">Thêm ảnh</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  )}
                </div>
                {selectedRequest.status !== 'completed' && (
                  <p className="text-[10px] text-gray-500 italic px-1">Định dạng hỗ trợ: JPG, PNG, WEBP. Tối đa 5MB/tập tin.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
