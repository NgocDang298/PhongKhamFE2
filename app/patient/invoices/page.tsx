"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { ROUTES, INVOICE_STATUS_LABELS } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import {
  IconReceipt,
  IconX,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import Pagination from "@/components/ui/Pagination";

export default function PatientInvoicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadInvoices();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      if (!user?._id) return;
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response: any = await invoiceService.getPatientInvoices(
        user._id,
        params
      );
      const invoices =
        response.data?.invoices ||
        response.invoices ||
        response.data ||
        response ||
        [];
      setInvoices(invoices);
    } catch (error) {
      console.error("Error loading invoices:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Hóa đơn của tôi">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Hóa đơn của tôi">
      <Card>
        <CardHeader icon={<IconReceipt size={20} />}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <CardTitle>Danh sách hóa đơn</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="w-full md:w-56">
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
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {invoices.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có hóa đơn nào
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">STT</TableHead>
                    <TableHead>Mã hóa đơn</TableHead>
                    <TableHead>Ngày tạo</TableHead>
                    <TableHead>Số lượng dịch vụ</TableHead>
                    <TableHead>Tổng tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices
                    .slice((currentPage - 1) * limit, currentPage * limit)
                    .map((invoice, index) => (
                      <TableRow key={invoice._id}>
                        <TableCell className="font-medium">
                          {(currentPage - 1) * limit + index + 1}
                        </TableCell>
                        <TableCell>
                          #{invoice.invoiceNumber || invoice._id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          {format(new Date(invoice.createdAt || ""), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell>{invoice.items?.length || 0}</TableCell>
                        <TableCell>{formatCurrency(invoice.totalAmount)}</TableCell>
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
                          <button
                            className="text-primary hover:text-primary-600 font-medium"
                            onClick={() => {
                              setSelectedInvoice(invoice);
                              setIsModalOpen(true);
                            }}
                          >
                            Xem chi tiết
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>

              <Pagination
                total={invoices.length}
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

      {/* Invoice Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedInvoice(null);
        }}
        title="Chi tiết hóa đơn"
        size="lg"
        footer={
          <Button
            icon={<IconX size={20} />}
            variant="outline"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedInvoice(null);
            }}
          >
            Đóng
          </Button>
        }
      >
        {selectedInvoice && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <strong>Mã hóa đơn:</strong> #
                {selectedInvoice.invoiceNumber || selectedInvoice._id.slice(-8)}
              </div>
              <div>
                <strong>Ngày tạo:</strong>{" "}
                {format(
                  new Date(selectedInvoice.createdAt || ""),
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
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-4 text-gray-700">
                  Chi tiết dịch vụ
                </h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tên dịch vụ</TableHead>
                      <TableHead>Số lượng</TableHead>
                      <TableHead>Đơn giá</TableHead>
                      <TableHead>Thành tiền</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items.map((item: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          {typeof item.serviceId === "object" && item.serviceId
                            ? item.serviceId.name
                            : item.serviceName || "Chưa cập nhật"}
                        </TableCell>
                        <TableCell>{item.quantity || 1}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          {formatCurrency((item.quantity || 1) * item.price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="flex justify-end p-4 text-xl font-semibold bg-gray-50 rounded-lg mt-4">
              <strong>
                Tổng cộng: {formatCurrency(selectedInvoice.totalAmount)}
              </strong>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
