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
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/Skeleton";
import { ROUTES, INVOICE_STATUS_LABELS } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import * as patientService from "@/lib/services/patients";
import * as serviceService from "@/lib/services/services";
import * as examinationService from "@/lib/services/examinations";
import * as testRequestService from "@/lib/services/testRequests";
import { STAFF_NAV_ITEMS } from "@/lib/navigation";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconUserSquareRounded,
  IconReceipt,
  IconPlus,
  IconTrash,
  IconEdit,
  IconEye,
  IconX,
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/Badge";

export default function StaffInvoicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [examinations, setExaminations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [patientFilter, setPatientFilter] = useState<string>("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

  // Form data
  const [createFormData, setCreateFormData] = useState({
    patientId: "",
    examinationId: "",
    items: [] as Array<{
      type: "service" | "test";
      referenceId: string;
      quantity: number;
    }>,
  });

  const [updateFormData, setUpdateFormData] = useState({
    items: [] as Array<{
      type: "service" | "test";
      referenceId: string;
      quantity: number;
    }>,
  });

  useEffect(() => {
    if (authLoading) return;
    if (
      !isAuthenticated ||
      (user?.role !== "staff" && user?.role !== "admin")
    ) {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, statusFilter, patientFilter, router]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load invoices
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (patientFilter) {
        params.patientId = patientFilter;
      }
      const invoiceResponse: any = await invoiceService.getInvoices(params);
      const invoices =
        invoiceResponse.data?.invoices ||
        invoiceResponse.invoices ||
        invoiceResponse.data ||
        invoiceResponse ||
        [];
      setInvoices(invoices);

      // Load patients for filters and create form
      try {
        const patientResponse: any = await patientService.getPatients({});
        const patients =
          patientResponse.data?.patients ||
          patientResponse.patients ||
          patientResponse.data ||
          patientResponse ||
          [];
        setPatients(patients);
      } catch (err) {
        console.warn("Could not load patients:", err);
      }

      // Load services for create/update forms
      try {
        const serviceResponse: any = await serviceService.getServices({
          isActive: true,
        });
        const services =
          serviceResponse.data?.services ||
          serviceResponse.services ||
          serviceResponse.data ||
          serviceResponse ||
          [];
        setServices(services);
      } catch (err) {
        console.warn("Could not load services:", err);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (createFormData.patientId) {
      loadExaminations(createFormData.patientId);
    } else {
      setExaminations([]);
    }
  }, [createFormData.patientId]);

  const loadExaminations = async (patientId: string) => {
    try {
      const response: any = await examinationService.getExaminations({
        patientId,
        status: "done",
      });
      const exams =
        response.data?.examinations ||
        response.examinations ||
        response.data ||
        response ||
        [];
      setExaminations(exams);
    } catch (error) {
      console.error("Error loading examinations:", error);
      setExaminations([]);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFormData.examinationId || createFormData.items.length === 0) {
      toast.warn("Vui lòng chọn ca khám và thêm ít nhất một dịch vụ");
      return;
    }

    const hasEmptyReference = createFormData.items.some(
      (item) => !item.referenceId || item.referenceId.trim() === ""
    );
    if (hasEmptyReference) {
      toast.warn("Vui lòng chọn dịch vụ/xét nghiệm cho tất cả các mục");
      return;
    }

    try {
      const { patientId, ...data } = createFormData;
      await invoiceService.createInvoice(data);
      setIsCreateModalOpen(false);
      setCreateFormData({ patientId: "", examinationId: "", items: [] });
      toast.success("Tạo hóa đơn thành công!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo hóa đơn");
    }
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || updateFormData.items.length === 0) {
      toast.warn("Vui lòng thêm ít nhất một dịch vụ");
      return;
    }

    // Validate that all items have a valid referenceId
    const hasEmptyReference = updateFormData.items.some(
      (item) => !item.referenceId || item.referenceId.trim() === ""
    );
    if (hasEmptyReference) {
      toast.warn("Vui lòng chọn dịch vụ/xét nghiệm cho tất cả các mục");
      return;
    }

    try {
      await invoiceService.updateInvoice(selectedInvoice._id, updateFormData);
      setIsUpdateModalOpen(false);
      setSelectedInvoice(null);
      setUpdateFormData({ items: [] });
      toast.success("Cập nhật hóa đơn thành công!");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật hóa đơn");
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    if (
      !confirm("Xác nhận xóa hóa đơn này? Hành động này không thể hoàn tác.")
    ) {
      return;
    }
    try {
      await invoiceService.deleteInvoice(id);
      toast.success("Đã xóa hóa đơn thành công");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi xóa");
    }
  };

  const handlePayInvoice = async (id: string) => {
    if (!confirm("Xác nhận thanh toán hóa đơn này?")) {
      return;
    }
    try {
      await invoiceService.payInvoice(id);
      toast.success("Đã thanh toán hóa đơn thành công");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi thanh toán");
    }
  };

  const handleViewDetails = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsDetailModalOpen(true);
  };

  const handleOpenUpdateModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setUpdateFormData({
      items: invoice.items.map((item: any) => ({
        type: item.type || "service",
        referenceId:
          typeof item.serviceId === "object"
            ? item.serviceId._id
            : item.serviceId,
        quantity: item.quantity || 1,
      })),
    });
    setIsUpdateModalOpen(true);
  };

  const addItemToCreate = () => {
    setCreateFormData({
      ...createFormData,
      items: [
        ...createFormData.items,
        { type: "service", referenceId: "", quantity: 1 },
      ],
    });
  };

  const removeItemFromCreate = (index: number) => {
    setCreateFormData({
      ...createFormData,
      items: createFormData.items.filter((_, i) => i !== index),
    });
  };

  const updateItemInCreate = (index: number, field: string, value: any) => {
    const newItems = [...createFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setCreateFormData({ ...createFormData, items: newItems });
  };

  const addItemToUpdate = () => {
    setUpdateFormData({
      ...updateFormData,
      items: [
        ...updateFormData.items,
        { type: "service", referenceId: "", quantity: 1 },
      ],
    });
  };

  const removeItemFromUpdate = (index: number) => {
    setUpdateFormData({
      ...updateFormData,
      items: updateFormData.items.filter((_, i) => i !== index),
    });
  };

  const updateItemInUpdate = (index: number, field: string, value: any) => {
    const newItems = [...updateFormData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setUpdateFormData({ ...updateFormData, items: newItems });
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý hóa đơn">
        <Card>
          <CardHeader icon={<IconReceipt size={20} />}>
            <CardTitle>Danh sách hóa đơn</CardTitle>
            <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-10 w-56" />
              <Skeleton className="h-10 w-32" />
            </div>
          </CardHeader>
          <CardBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Số DV</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-16" />
                        <Skeleton className="h-8 w-16" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý hóa đơn">
      <Card>
        <CardHeader icon={<IconReceipt size={20} />}>
          <CardTitle>Danh sách hóa đơn</CardTitle>
          <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-48">
              <Select
                options={[
                  { value: "", label: "Tất cả trạng thái" },
                  { value: "paid", label: "Đã thanh toán" },
                  { value: "unpaid", label: "Chưa thanh toán" },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                fullWidth
              />
            </div>
            <div className="w-full md:w-56">
              <Select
                options={[
                  { value: "", label: "Tất cả bệnh nhân" },
                  ...patients.map((p) => ({
                    value: p._id,
                    label: p.fullName,
                  })),
                ]}
                value={patientFilter}
                onChange={(e) => setPatientFilter(e.target.value)}
                fullWidth
              />
            </div>
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              icon={<IconPlus size={16} />}
              className="whitespace-nowrap"
            >
              Tạo hóa đơn
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có hóa đơn nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Số DV</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
                    <TableCell>
                      #{invoice.invoiceNumber || invoice._id.slice(-6)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-gray-900">
                        {typeof invoice.patientId === "object" && invoice.patientId
                          ? invoice.patientId.fullName
                          : "Chưa cập nhật"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {typeof invoice.patientId === "object" && invoice.patientId
                          ? invoice.patientId.phone || invoice.patientId.phoneNumber
                          : ""}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(invoice.createdAt || ""), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>{invoice.items?.length || 0}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={invoice.status === "paid" ? "success" : "danger"}>
                        {
                          INVOICE_STATUS_LABELS[
                          invoice.status as keyof typeof INVOICE_STATUS_LABELS
                          ]
                        }
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(invoice)}
                          icon={<IconEye size={14} />}
                        >
                          Xem
                        </Button>
                        {invoice.status === "unpaid" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenUpdateModal(invoice)}
                              icon={<IconEdit size={14} />}
                            >
                              Sửa
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePayInvoice(invoice._id)}
                            >
                              Thanh toán
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              icon={<IconTrash size={14} />}
                              style={{ color: "#ef4444" }}
                            >
                              Xóa
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setCreateFormData({ patientId: "", examinationId: "", items: [] });
        }}
        title="Tạo hóa đơn mới"
        size="lg"
        footer={
          <div className="flex w-full gap-4 justify-end">
            <Button
              icon={<IconX size={20} />}
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setCreateFormData({
                  patientId: "",
                  examinationId: "",
                  items: [],
                });
              }}
            >
              Hủy
            </Button>
            <Button icon={<IconPlus size={20} />} onClick={handleCreateInvoice}>Tạo hóa đơn</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Bệnh nhân"
              options={[
                { value: "", label: "Chọn bệnh nhân" },
                ...patients.map((p) => ({
                  value: p._id,
                  label: `${p.fullName} - ${p.phone || p.phoneNumber || ""}`,
                })),
              ]}
              value={createFormData.patientId}
              onChange={(e) =>
                setCreateFormData({
                  ...createFormData,
                  patientId: e.target.value,
                  examinationId: "", // Reset exam when patient changes
                })
              }
              required
              fullWidth
            />

            <Select
              label="Ca khám (Đã xong)"
              options={[
                {
                  value: "",
                  label:
                    examinations.length > 0
                      ? "Chọn ca khám"
                      : "Không tìm thấy ca khám",
                },
                ...examinations.map((exam) => ({
                  value: exam._id,
                  label: `Ca khám: ${format(
                    new Date(exam.examDate),
                    "dd/MM/yyyy HH:mm"
                  )}`,
                })),
              ]}
              value={createFormData.examinationId}
              onChange={async (e) => {
                const examId = e.target.value;
                if (!examId) {
                  setCreateFormData({ ...createFormData, examinationId: "", items: [] });
                  return;
                }

                // 1. Tìm thông tin ca khám từ danh sách đã load
                const selectedExam = examinations.find(ex => ex._id === examId);

                // 2. Khởi tạo items với dịch vụ chính của ca khám
                let newItems: any[] = [];
                if (selectedExam?.serviceId) {
                  newItems.push({
                    type: "service",
                    referenceId: selectedExam.serviceId._id || selectedExam.serviceId,
                    quantity: 1
                  });
                }

                setCreateFormData({
                  ...createFormData,
                  examinationId: examId,
                  items: newItems
                });

                // 3. Tự động lấy thêm các xét nghiệm đã hoàn thành của ca khám này
                try {
                  const testRes: any = await testRequestService.getTestRequestsByExamination(examId);
                  const completedTests = (testRes.data || testRes || []).filter((t: any) => t.status === 'completed');

                  if (completedTests.length > 0) {
                    const testItems = completedTests.map((t: any) => ({
                      type: "test",
                      referenceId: t.serviceId?._id || t.serviceId,
                      quantity: 1
                    }));

                    setCreateFormData(prev => ({
                      ...prev,
                      items: [...prev.items, ...testItems]
                    }));
                  }
                } catch (err) {
                  console.error("Lỗi khi lấy danh sách xét nghiệm:", err);
                }
              }}
              required
              disabled={!createFormData.patientId || examinations.length === 0}
              fullWidth
            />
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <div className="space-y-1">
                <h4 className="font-semibold text-gray-900">Chi tiết dịch vụ thu phí</h4>
                <p className="text-xs text-gray-500 italic">Dịch vụ & Xét nghiệm được tự động tổng hợp từ ca khám</p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={addItemToCreate}
                icon={<IconPlus size={14} />}
              >
                Thêm thủ công
              </Button>
            </div>

            {createFormData.items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 bg-gray-50 rounded">
                Chưa có dịch vụ nào. Nhấn "Thêm dịch vụ" để bắt đầu.
              </div>
            ) : (
              <div className="space-y-3">
                {createFormData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <Select
                        label="Loại"
                        options={[
                          { value: "service", label: "Dịch vụ" },
                          { value: "test", label: "Xét nghiệm" },
                        ]}
                        value={item.type}
                        onChange={(e) =>
                          updateItemInCreate(index, "type", e.target.value)
                        }
                        fullWidth
                      />
                    </div>
                    <div className="flex-[2]">
                      <Select
                        label="Dịch vụ"
                        options={[
                          { value: "", label: "Chọn dịch vụ" },
                          ...services
                            .filter(
                              (s) =>
                                s.serviceType === item.type ||
                                s.serviceType === "examination"
                            )
                            .map((s) => ({
                              value: s._id,
                              label: `${s.name} - ${formatCurrency(s.price)}`,
                            })),
                        ]}
                        value={item.referenceId}
                        onChange={(e) =>
                          updateItemInCreate(
                            index,
                            "referenceId",
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Số lượng"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemInCreate(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        fullWidth
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemFromCreate(index)}
                      icon={<IconTrash size={14} />}
                      style={{ color: "#ef4444" }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Chi tiết hóa đơn"
        size="lg"
        footer={
          <Button
            icon={<IconX size={20} />}
            variant="outline"
            onClick={() => {
              setIsDetailModalOpen(false);
              setSelectedInvoice(null);
            }}
          >
            Đóng
          </Button>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded">
              <div>
                <strong>Mã hóa đơn:</strong> #
                {selectedInvoice.invoiceNumber || selectedInvoice._id.slice(-8)}
              </div>
              <div>
                <strong>Bệnh nhân:</strong>{" "}
                {typeof selectedInvoice.patientId === "object"
                  ? selectedInvoice.patientId.fullName
                  : "Chưa cập nhật"}
              </div>
              <div>
                <strong>Ngày tạo:</strong>{" "}
                {format(
                  new Date(selectedInvoice.createdAt),
                  "dd/MM/yyyy HH:mm",
                  { locale: vi }
                )}
              </div>
              <div>
                <strong>Trạng thái:</strong>{" "}
                <Badge variant={selectedInvoice.status === "paid" ? "success" : "danger"}>
                  {
                    INVOICE_STATUS_LABELS[
                    selectedInvoice.status as keyof typeof INVOICE_STATUS_LABELS
                    ]
                  }
                </Badge>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Chi tiết dịch vụ</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Dịch vụ</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Số lượng</TableHead>
                    <TableHead>Đơn giá</TableHead>
                    <TableHead>Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items?.map((item: any, index: number) => (
                    <TableRow key={index}>
                      <TableCell>
                        {typeof item.serviceId === "object"
                          ? item.serviceId.name
                          : item.serviceName || "Không xác định"}
                      </TableCell>
                      <TableCell>
                        {item.type === "service" ? "Dịch vụ" : "Xét nghiệm"}
                      </TableCell>
                      <TableCell>{item.quantity || 1}</TableCell>
                      <TableCell>{formatCurrency(item.price)}</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency((item.quantity || 1) * item.price)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex justify-end p-4 bg-gray-50 rounded">
              <div className="text-xl font-semibold">
                Tổng cộng: {formatCurrency(selectedInvoice.totalAmount)}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Update Invoice Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setSelectedInvoice(null);
          setUpdateFormData({ items: [] });
        }}
        title="Cập nhật hóa đơn"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsUpdateModalOpen(false);
                setSelectedInvoice(null);
                setUpdateFormData({ items: [] });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleUpdateInvoice}>Cập nhật</Button>
          </>
        }
      >
        {selectedInvoice && (
          <form onSubmit={handleUpdateInvoice} className="space-y-4">
            <div className="p-3 bg-blue-50 rounded text-sm text-blue-800">
              <strong>Lưu ý:</strong> Chỉ có thể cập nhật hóa đơn chưa thanh
              toán
            </div>

            <div className="p-4 bg-gray-50 rounded">
              <div>
                <strong>Bệnh nhân:</strong>{" "}
                {selectedInvoice.patientId?.fullName}
              </div>
              <div>
                <strong>Mã HĐ:</strong> #
                {selectedInvoice.invoiceNumber || selectedInvoice._id.slice(-8)}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Dịch vụ / Xét nghiệm</h4>
                <Button
                  type="button"
                  size="sm"
                  onClick={addItemToUpdate}
                  icon={<IconPlus size={14} />}
                >
                  Thêm dịch vụ
                </Button>
              </div>

              <div className="space-y-3">
                {updateFormData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-end p-3 bg-gray-50 rounded"
                  >
                    <div className="flex-1">
                      <Select
                        label="Loại"
                        options={[
                          { value: "service", label: "Dịch vụ" },
                          { value: "test", label: "Xét nghiệm" },
                        ]}
                        value={item.type}
                        onChange={(e) =>
                          updateItemInUpdate(index, "type", e.target.value)
                        }
                        fullWidth
                      />
                    </div>
                    <div className="flex-[2]">
                      <Select
                        label="Dịch vụ"
                        options={[
                          { value: "", label: "Chọn dịch vụ" },
                          ...services
                            .filter(
                              (s) =>
                                s.serviceType === item.type ||
                                s.serviceType === "examination"
                            )
                            .map((s) => ({
                              value: s._id,
                              label: `${s.name} - ${formatCurrency(s.price)}`,
                            })),
                        ]}
                        value={item.referenceId}
                        onChange={(e) =>
                          updateItemInUpdate(
                            index,
                            "referenceId",
                            e.target.value
                          )
                        }
                        fullWidth
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        label="Số lượng"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItemInUpdate(
                            index,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        fullWidth
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeItemFromUpdate(index)}
                      icon={<IconTrash size={14} />}
                      style={{ color: "#ef4444" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
