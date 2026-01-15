"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
import {
  IconActivity,
  IconIdBadge2,
  IconLock,
  IconAlertCircle,
} from "@tabler/icons-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    cccd: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData);
      // Redirect is handled by AuthContext
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/login/background.jpg"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900/40"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <Card className="glass backdrop-blur-xl border-white/20 shadow-2xl">
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
                <CardTitle className="text-black text-3xl">Đăng Nhập</CardTitle>
                <CardDescription>
                  Chào mừng bạn đến với Hệ thống Quản lý Phòng khám
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardBody>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="flex items-center gap-3 p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
                  <IconAlertCircle size={20} />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <Input
                label="Số CCCD"
                name="cccd"
                type="text"
                placeholder="Nhập số CCCD (12 số)"
                value={formData.cccd}
                onChange={handleChange}
                required
                fullWidth
                icon={<IconIdBadge2 size={20} className="text-gray-700" />}
                className="bg-white/90 backdrop-blur-sm"
              />

              <Input
                label="Mật khẩu"
                name="password"
                type="password"
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                fullWidth
                icon={<IconLock size={20} className="text-gray-700" />}
                className="bg-white/90 backdrop-blur-sm"
              />

              <Button
                type="submit"
                fullWidth
                loading={loading}
                className="bg-primary hover:bg-primary/90"
              >
                Đăng nhập
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-700 font-semibold">
                    hoặc
                  </span>
                </div>
              </div>

              <Link href="/register" className="block">
                <Button type="button" variant="outline" fullWidth>
                  Tạo tài khoản mới
                </Button>
              </Link>
            </form>
          </CardBody>
        </Card>

        <p className="text-center mt-8 text-white/80 text-sm">
          © 2024 Clinic Management System. All rights reserved.
        </p>
      </div>
    </div>
  );
}
