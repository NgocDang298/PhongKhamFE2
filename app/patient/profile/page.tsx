"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants";
import * as profileService from "@/lib/services/profile";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconCalendar,
  IconFileText,
  IconReceipt,
  IconUser,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.PATIENT_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Lịch hẹn",
    path: ROUTES.PATIENT_APPOINTMENTS,
    icon: <IconCalendar size={20} />,
  },
  {
    label: "Lịch sử khám",
    path: ROUTES.PATIENT_MEDICAL_HISTORY,
    icon: <IconFileText size={20} />,
  },
  {
    label: "Hóa đơn",
    path: ROUTES.PATIENT_INVOICES,
    icon: <IconReceipt size={20} />,
  },
  {
    label: "Hồ sơ",
    path: ROUTES.PATIENT_PROFILE,
    icon: <IconUser size={20} />,
  },
];

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadProfile();
  }, [user, isAuthenticated, authLoading, router]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response: any = await profileService.getProfile();
      const profileData = response.data || response || null;
      setProfile(profileData);
      setFormData({
        fullName: profileData?.fullName || "",
        phone: profileData?.phone || "",
        address: profileData?.address || "",
        email: profileData?.email || "",
      });
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await profileService.updateProfile(formData);
      setIsEditing(false);
      loadProfile();
      alert("Cập nhật thông tin thành công!");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Hồ sơ của tôi">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Hồ sơ của tôi">
      <Card>
        <CardHeader icon={<IconUser size={20} />}>
          <CardTitle>Thông tin cá nhân</CardTitle>
        </CardHeader>
        <CardBody>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
              <Input
                label="Họ và tên"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
                fullWidth
              />
              <Input
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                fullWidth
              />
              <Input
                label="Địa chỉ"
                name="address"
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                fullWidth
              />
              <Input
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                fullWidth
              />
              <div className="flex gap-4 pt-4">
                <Button type="submit">Lưu thay đổi</Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Hủy
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 max-w-lg">
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>Họ và tên:</strong> {profile?.fullName || "-"}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>Số điện thoại:</strong> {profile?.phone || "-"}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>Địa chỉ:</strong> {profile?.address || "-"}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>Email:</strong> {profile?.email || "-"}
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>CCCD:</strong> {profile?.cccd || "-"}
              </div>
              {profile?.dateOfBirth && (
                <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                  <strong>Ngày sinh:</strong>{" "}
                  {format(new Date(profile.dateOfBirth), "dd/MM/yyyy", {
                    locale: vi,
                  })}
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-100 last:border-0">
                <strong>Giới tính:</strong>{" "}
                {profile?.gender === "male"
                  ? "Nam"
                  : profile?.gender === "female"
                  ? "Nữ"
                  : profile?.gender || "-"}
              </div>
              <div className="pt-6">
                <Button onClick={() => setIsEditing(true)}>
                  Chỉnh sửa thông tin
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
