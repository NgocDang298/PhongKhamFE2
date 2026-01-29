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
import { SERVICE_TYPE_LABELS } from "@/lib/constants";
import { STAFF_NAV_ITEMS } from "@/lib/navigation";
import * as serviceService from "@/lib/services/services";
import { formatCurrency } from "@/lib/utils";
import {
  IconSettings,
} from "@tabler/icons-react";


export default function StaffServicesPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (
      !isAuthenticated ||
      (user?.role !== "staff" && user?.role !== "admin")
    ) {
      router.push("/login");
      return;
    }
    loadServices();
  }, [user, isAuthenticated, authLoading, router]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const response: any = await serviceService.getServices({});
      const services =
        response.data?.services || response.data || response || [];
      setServices(services);
    } catch (error) {
      console.error("Error loading services:", error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Danh sách dịch vụ">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Danh sách dịch vụ">
      <Card>
        <CardHeader icon={<IconSettings size={20} />}>
          <CardTitle>Dịch vụ khám bệnh</CardTitle>
        </CardHeader>
        <CardBody>
          {services.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có dịch vụ nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên dịch vụ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá</TableHead>
                  <TableHead>Mô tả</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service._id}>
                    <TableCell>{service.name}</TableCell>
                    <TableCell>
                      {
                        SERVICE_TYPE_LABELS[
                        service.serviceType as keyof typeof SERVICE_TYPE_LABELS
                        ]
                      }
                    </TableCell>
                    <TableCell>{formatCurrency(service.price)}</TableCell>
                    <TableCell>{service.description || "Không có mô tả"}</TableCell>
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
