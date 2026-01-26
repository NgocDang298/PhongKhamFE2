"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { ROUTES } from "@/lib/constants";
import * as profileService from "@/lib/services/profile";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { PATIENT_NAV_ITEMS } from "@/lib/navigation";
import {
  IconUser,
  IconPhone,
  IconMail,
  IconMapPin,
  IconId,
  IconCalendar,
  IconGenderBigender,
  IconEdit,
  IconShieldLock,
  IconActivity,
  IconStethoscope,
  IconUserSquareRounded,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import Select from "@/components/ui/Select";

export default function PatientProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    email: "",
    emergencyPhone: "",
    cccd: "",
    gender: "",
    dateOfBirth: "",
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
      const data = response.data;
      setProfileData(data);
      if (data?.profile) {
        setFormData({
          fullName: data.profile.fullName || "",
          phone: data.profile.phone || "",
          address: data.profile.address || "",
          email: data.profile.email || "",
          emergencyPhone: data.profile.emergencyPhone || "",
          cccd: data.profile.cccd || "",
          gender: data.profile.gender || "",
          dateOfBirth: data.profile.dateOfBirth ? format(new Date(data.profile.dateOfBirth), "yyyy-MM-dd") : "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      await profileService.updateProfile(formData);
      setIsEditing(false);
      loadProfile();
      toast.success("Cập nhật thông tin thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật");
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Hồ sơ của tôi">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  const profile = profileData?.profile;
  const userAccount = profileData?.user;
  const stats = profileData?.stats;

  return (
    <DashboardLayout navItems={PATIENT_NAV_ITEMS} title="Hồ sơ của tôi">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Main Content - Personal Info */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-gray-200">
            <CardHeader className="flex border-b border-gray-200 pb-4 items-center justify-between">
              <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                <IconUserSquareRounded size={20} />
                <span>Thông tin cá nhân</span>
              </h3>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  icon={<IconEdit size={16} />}
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(false)}
                    icon={<IconX size={16} />}
                  >
                    Hủy
                  </Button>
                  <Button
                    size="sm"
                    type="submit"
                    form="profile-form"
                    icon={<IconCheck size={16} />}
                  >
                    Lưu
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardBody>
              <form id="profile-form" onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Họ và tên"
                    name="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconUser size={18} />}
                  />
                  <Input
                    label="Số điện thoại"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconPhone size={18} />}
                  />
                  <Input
                    label="Địa chỉ"
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconMapPin size={18} />}
                  />
                  <Input
                    label="Email liên hệ"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconMail size={18} />}
                  />
                  <Input
                    label="Mã định danh (CCCD)"
                    name="cccd"
                    value={formData.cccd}
                    fullWidth
                    disabled={true} // CCDD typically non-editable through profile update
                    icon={<IconId size={18} />}
                  />
                  <Input
                    label="Ngày sinh"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconCalendar size={18} />}
                  />
                  <Select
                    label="Giới tính"
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    options={[
                      { value: "male", label: "Nam" },
                      { value: "female", label: "Nữ" },
                      { value: "other", label: "Khác" },
                    ]}
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconGenderBigender size={18} />}
                  />
                  <Input
                    label="SĐT khẩn cấp"
                    name="emergencyPhone"
                    value={formData.emergencyPhone}
                    onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                    fullWidth
                    disabled={!isEditing}
                    icon={<IconPhone size={18} />}
                  />
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Account Info Card */}
          <Card className="border border-gray-200">
            <CardHeader className="border-b border-gray-200 pb-4">
              <h3 className="text-lg w-full font-semibold text-primary flex items-center gap-2">
                <IconShieldLock size={20} />
                <span>Thông tin tài khoản</span>
              </h3>
            </CardHeader>
            <CardBody className="p-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Email đăng nhập</span>
                  <span className="text-gray-800 font-semibold">{userAccount?.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Mã số định danh (CCCD)</span>
                  <span className="text-gray-800 font-semibold">{userAccount?.cccd}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                  <span className="text-gray-500 font-medium">Ngày tạo tài khoản</span>
                  <span className="text-gray-800 font-semibold">{userAccount?.createdAt ? format(new Date(userAccount.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "-"}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-500 font-medium">Vai trò người dùng</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full uppercase tracking-wider">{userAccount?.role}</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Stats & Summary */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-gray-200 shadow-sm">
            <CardBody className="p-4">
              <div className="flex items-center gap-4 text-gray-800 mb-4 border-b border-gray-100 pb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <IconActivity size={24} />
                </div>
                <div>
                  <h5 className="font-bold">Chỉ số hoạt động</h5>
                  <p className="text-sm text-gray-500 mt-1">Theo dõi hoạt động khám chữa bệnh.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stats?.totalAppointments || 0}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Tổng lịch hẹn</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100/50">
                  <div className="text-2xl font-bold text-gray-800 mb-1">{stats?.totalExaminations || 0}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Ca khám bệnh</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                <span className="text-gray-500">Ngày tham gia:</span>
                <span className="font-semibold text-gray-800 uppercase text-sm">{profile?.registerDate ? format(new Date(profile.registerDate), "dd/MM/yyyy") : "-"}</span>
              </div>
            </CardBody>
          </Card>

          <Card className="border border-gray-200">
            <CardBody className="p-4">
              <div className="flex items-center gap-4 text-gray-800">
                <div className="w-12 h-12 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                  <IconStethoscope size={24} />
                </div>
                <div>
                  <h5 className="font-bold">Hồ sơ y tế</h5>
                  <p className="text-sm text-gray-500 mt-1">Xem đầy đủ bệnh sử và hồ sơ y tế của bạn.</p>
                </div>
              </div>
              <Button
                fullWidth
                className="mt-4 bg-tertiary hover:bg-tertiary/90 border-none"
                onClick={() => router.push(ROUTES.PATIENT_MEDICAL_PROFILE)}
              >
                Xem hồ sơ bệnh lý
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}


