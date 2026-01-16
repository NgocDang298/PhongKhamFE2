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
import Button from "@/components/ui/Button";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import { ROUTES, INVOICE_STATUS_LABELS } from "@/lib/constants";
import * as invoiceService from "@/lib/services/invoices";
import * as examinationService from "@/lib/services/examinations";
import * as serviceService from "@/lib/services/services";
import { formatCurrency, formatDate } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconUsers,
  IconReceipt,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.STAFF_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.STAFF_APPOINTMENTS,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Bệnh nhân",
    path: ROUTES.STAFF_PATIENTS,
    icon: <IconUsers size={20} />,
  },
  {
    label: "Hóa đơn",
    path: ROUTES.STAFF_INVOICES,
    icon: <IconReceipt size={20} />,
  },
];

export default function StaffInvoicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;
    if (
      !isAuthenticated ||
      (user?.role !== "staff" && user?.role !== "admin")
    ) {
      router.push("/login");
      return;
    }
    loadInvoices();
  }, [user, isAuthenticated, authLoading, statusFilter, router]);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      const response: any = await invoiceService.getInvoices(params);
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

  const handlePay = async (id: string) => {
    if (!confirm("Xác nhận thanh toán hóa đơn này?")) {
      return;
    }
    try {
      await invoiceService.payInvoice(id);
      loadInvoices();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Quản lý hóa đơn">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Quản lý hóa đơn">
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
        <CardHeader icon={<IconReceipt size={20} />}>
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
                  <TableHead>Bệnh nhân</TableHead>
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
                      {typeof invoice.patientId === "object" &&
                      invoice.patientId
                        ? invoice.patientId.fullName
                        : "Không xác định"}
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
                      {invoice.status === "unpaid" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePay(invoice._id)}
                        >
                          Thanh toán
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
