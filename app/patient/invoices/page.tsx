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

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.PATIENT_DASHBOARD,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.PATIENT_APPOINTMENTS,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: "Lịch sử khám",
    path: ROUTES.PATIENT_MEDICAL_HISTORY,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    label: "Hóa đơn",
    path: ROUTES.PATIENT_INVOICES,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Hồ sơ",
    path: ROUTES.PATIENT_PROFILE,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export default function PatientInvoicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
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
      <DashboardLayout navItems={navItems} title="Hóa đơn của tôi">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Hóa đơn của tôi">
      <div className="flex justify-between items-center mb-4">
        <div style={{ maxWidth: "300px" }}>
          <Select
            label="Lọc theo trạng thái"
            options={[
              { value: "", label: "Tất cả" },
              { value: "paid", label: "Đã thanh toán" },
              { value: "unpaid", label: "Chưa thanh toán" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            fullWidth
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách hóa đơn</CardTitle>
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
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Số lượng dịch vụ</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice._id}>
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
                      <span
                        className="px-2 py-1 text-xs font-medium rounded-full"
                        style={{
                          backgroundColor:
                            invoice.status === "paid"
                              ? "#10b98120"
                              : "#ef444420",
                          color:
                            invoice.status === "paid" ? "#10b981" : "#ef4444",
                        }}
                      >
                        {
                          INVOICE_STATUS_LABELS[
                            invoice.status as keyof typeof INVOICE_STATUS_LABELS
                          ]
                        }
                      </span>
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
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            onClick={() => {
              setIsModalOpen(false);
              setSelectedInvoice(null);
            }}
          >
            Đóng
          </button>
        }
      >
        {selectedInvoice && (
          <div className="space-y-6">
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
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor:
                      selectedInvoice.status === "paid"
                        ? "#10b98120"
                        : "#ef444420",
                    color:
                      selectedInvoice.status === "paid" ? "#10b981" : "#ef4444",
                  }}
                >
                  {
                    INVOICE_STATUS_LABELS[
                      selectedInvoice.status as keyof typeof INVOICE_STATUS_LABELS
                    ]
                  }
                </span>
              </div>
            </div>
            {selectedInvoice.items && selectedInvoice.items.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-4 text-gray-900">
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
                            : item.serviceName || "N/A"}
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
            <div className="flex justify-end p-4 text-xl font-bold bg-gray-50 rounded-lg mt-6">
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
