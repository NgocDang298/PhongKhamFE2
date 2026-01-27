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
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import { Skeleton } from "@/components/ui/Skeleton";
import { GENDER_OPTIONS } from "@/lib/constants";
import { STAFF_NAV_ITEMS } from "@/lib/navigation";
import * as patientService from "@/lib/services/patients";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconUserSquareRounded,
  IconSearch,
  IconPlus,
} from "@tabler/icons-react";


export default function StaffPatientsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
    address: "",
    phone: "",
    cccd: "",
    email: "",
    password: "",
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
    loadPatients();
  }, [user, isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        loadPatients();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      loadPatients();
    }
  }, [searchTerm]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response: any = await patientService.getPatients(
        searchTerm ? { search: searchTerm } : {}
      );
      const patients = response.data || response || [];
      setPatients(patients);
    } catch (error) {
      console.error("Error loading patients:", error);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await patientService.createWalkInPatient(formData);
      setIsModalOpen(false);
      setFormData({
        fullName: "",
        gender: "male",
        dateOfBirth: "",
        address: "",
        phone: "",
        cccd: "",
        email: "",
        password: "",
      });
      loadPatients();
      toast.success("Tạo bệnh nhân walk-in thành công!");
    } catch (error: any) {
      toast.error(error.message || "Có lỗi xảy ra khi tạo bệnh nhân");
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý bệnh nhân">
        <Card>
          <CardHeader icon={<IconUserSquareRounded size={20} />}>
            <CardTitle>Danh sách bệnh nhân</CardTitle>
            <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardHeader>
          <CardBody>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>CCCD</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
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
    <DashboardLayout navItems={STAFF_NAV_ITEMS} title="Quản lý bệnh nhân">
      <Card>
        <CardHeader icon={<IconUserSquareRounded size={20} />}>
          <CardTitle>Danh sách bệnh nhân</CardTitle>
          <div className="ml-auto flex flex-col md:flex-row items-center gap-3">
            <div className="w-full md:w-80">
              <Input
                type="text"
                placeholder="Tìm tên, CCCD, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                fullWidth
                icon={<IconSearch size={18} />}
              />
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              icon={<IconPlus size={16} />}
              className="whitespace-nowrap"
            >
              Tạo bệnh nhân walk-in
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {patients.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Không tìm thấy bệnh nhân nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>SĐT</TableHead>
                  <TableHead>CCCD</TableHead>
                  <TableHead>Giới tính</TableHead>
                  <TableHead>Ngày sinh</TableHead>
                  <TableHead>Địa chỉ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient._id}>
                    <TableCell>{patient.fullName}</TableCell>
                    <TableCell>{patient.phone}</TableCell>
                    <TableCell>{patient.cccd}</TableCell>
                    <TableCell>
                      {patient.gender === "male"
                        ? "Nam"
                        : patient.gender === "female"
                          ? "Nữ"
                          : "Khác"}
                    </TableCell>
                    <TableCell>
                      {format(new Date(patient.dateOfBirth), "dd/MM/yyyy", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell>{patient.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create Patient Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setFormData({
            fullName: "",
            gender: "male",
            dateOfBirth: "",
            address: "",
            phone: "",
            cccd: "",
            email: "",
            password: "",
          });
        }}
        title="Tạo bệnh nhân walk-in"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setFormData({
                  fullName: "",
                  gender: "male",
                  dateOfBirth: "",
                  address: "",
                  phone: "",
                  cccd: "",
                  email: "",
                  password: "",
                });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo bệnh nhân</Button>
          </>
        }
      >
        <form
          onSubmit={handleCreate}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
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
            label="Số CCCD"
            name="cccd"
            type="text"
            value={formData.cccd}
            onChange={(e) => setFormData({ ...formData, cccd: e.target.value })}
            required
            fullWidth
          />
          <Select
            label="Giới tính"
            name="gender"
            options={GENDER_OPTIONS}
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value as any })
            }
            required
            fullWidth
          />
          <Input
            label="Ngày sinh"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
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
            required
            fullWidth
          />
          <Input
            label="Email (tùy chọn)"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            fullWidth
          />
          <Input
            label="Mật khẩu (tùy chọn)"
            name="password"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            fullWidth
            helperText="Nếu để trống, mật khẩu mặc định là: 123456"
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}
