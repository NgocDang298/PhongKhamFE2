"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import type { UserRole } from "@/types";
import {
  IconActivity,
  IconAlertCircle,
  IconArrowLeft,
  IconChevronRight,
} from "@tabler/icons-react";

// Chỉ cho phép đăng ký Patient - các role khác chỉ admin mới tạo được
const ROLE_OPTIONS = [{ value: "patient", label: "Bệnh nhân", icon: "👤" }];

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [formData, setFormData] = useState({
    // Common fields
    fullName: "",
    email: "",
    phone: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
    // Patient fields
    cccd: "",
    // Doctor fields
    specialty: "",
    degree: "",
    birthYear: "",
    workExperience: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);

    try {
      const registerData: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        password: formData.password,
        role: selectedRole,
      };

      // Chỉ cho phép đăng ký patient
      registerData.cccd = formData.cccd;

      const response = await register(registerData);
      toast.success(response.message || "Đăng ký thành công!");

      // Redirect patients to medical profile page
      if (selectedRole === "patient") {
        router.push("/patient/medical-profile?required=true");
      }
      // Redirect is handled by AuthContext for other roles
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Đăng ký thất bại";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 py-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src="/images/login/background.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/40"></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <Card
          className="glass backdrop-blur-xl border-white/20 shadow-2xl"
          glass
        >
          <CardHeader>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-indigo-50 backdrop-blur-sm">
                <IconActivity
                  size={32}
                  className="text-primary"
                  strokeWidth={2.5}
                />
              </div>
              <div>
                <CardTitle className="text-black text-3xl">
                  Đăng Ký Tài Khoản
                </CardTitle>
                <CardDescription>
                  {step === 1
                    ? "Chọn vai trò của bạn"
                    : "Điền thông tin cá nhân"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            {step === 1 ? (
              <div className="flex flex-col gap-4">
                {ROLE_OPTIONS.map((role) => (
                  <button
                    key={role.value}
                    onClick={() => handleRoleSelect(role.value as UserRole)}
                    className="p-6 border-2 border-gray-200 rounded-2xl bg-white/80 flex items-center gap-4 text-lg font-semibold transition-all hover:border-primary hover:bg-white hover:-translate-y-1 hover:shadow-lg group"
                  >
                    <span className="text-3xl">{role.icon}</span>
                    <span className="flex-1 text-left">{role.label}</span>
                    <IconChevronRight className="text-gray-400 group-hover:text-primary transition-colors" />
                  </button>
                ))}
                <Link href="/login" className="mt-4">
                  <Button variant="ghost" fullWidth>
                    Đã có tài khoản? Đăng nhập
                  </Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
                    <IconAlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <Input
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  placeholder="0987654321"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 text-base border-2 border-gray-200 rounded-xl bg-white/50 backdrop-blur-sm focus:border-primary focus:outline-none transition-colors"
                  >
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>

                <Input
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Địa chỉ"
                  name="address"
                  type="text"
                  placeholder="123 Đường ABC, Quận XYZ"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Số CCCD"
                  name="cccd"
                  type="text"
                  placeholder="12 số"
                  value={formData.cccd}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Mật khẩu"
                  name="password"
                  type="password"
                  placeholder="Ít nhất 6 ký tự"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <Input
                  label="Xác nhận mật khẩu"
                  name="confirmPassword"
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  fullWidth
                />

                <div className="flex gap-4 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    fullWidth
                    icon={<IconArrowLeft size={18} />}
                  >
                    Quay lại
                  </Button>
                  <Button
                    type="submit"
                    fullWidth
                    loading={loading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Đăng ký
                  </Button>
                </div>
              </form>
            )}
          </CardBody>
        </Card>

        <p className="text-center mt-8 text-white/80 text-sm">
          © 2024 Clinic Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
