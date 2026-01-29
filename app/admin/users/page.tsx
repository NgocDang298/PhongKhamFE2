"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getPatients, updatePatient } from "@/lib/services/patients";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Modal from "@/components/ui/Modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/Table";
import { ROUTES, GENDER_OPTIONS } from "@/lib/constants";
import * as authLib from "@/lib/services/auth";
import * as directoryService from "@/lib/services/directory";
import type { UserRole, Doctor, Staff, LabNurse, Patient } from "@/types";
import {
  IconLayoutGrid,
  IconUserSquareRounded,
  IconClock,
  IconPlus,
  IconRefresh,
  IconEye,
  IconAlertCircle,
  IconInfoCircle,
  IconStethoscope,
  IconX,
  IconCheck,
  IconPencil,
} from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";
import { Badge } from "@/components/ui/Badge";

const ROLE_OPTIONS = [
  { value: "doctor", label: "Bác sĩ" },
  { value: "staff", label: "Nhân viên" },
  { value: "lab_nurse", label: "Y tá xét nghiệm" },
  { value: "patient", label: "Bệnh nhân" },
];

const DEGREE_OPTIONS = [
  { value: "Bác sĩ", label: "Bác sĩ (BS)" },
  { value: "Bác sĩ Chuyên khoa I", label: "Bác sĩ Chuyên khoa I (BSCKI)" },
  { value: "Bác sĩ Chuyên khoa II", label: "Bác sĩ Chuyên khoa II (BSCKII)" },
  { value: "Thạc sĩ", label: "Thạc sĩ (ThS)" },
  { value: "Tiến sĩ", label: "Tiến sĩ (TS)" },
  { value: "Phó giáo sư", label: "Phó giáo sư (PGS)" },
  { value: "Giáo sư", label: "Giáo sư (GS)" },
];

interface UserWithRole {
  _id: string;
  fullName: string;
  email?: string;
  phone?: string;
  role: UserRole;
  specialty?: string;
  cccd?: string;
  userId: string | { _id: string;[key: string]: any };
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  address?: string;
  degree?: string;
  birthYear?: number;
  workExperience?: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRole | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false); // Used for create form
  const [updateLoading, setUpdateLoading] = useState(false);
  const [error, setError] = useState("");
  const [editFormData, setEditFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
    address: "",
    cccd: "",
    specialty: "",
    degree: "",
    birthYear: "",
    workExperience: "",
  });
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [formData, setFormData] = useState({
    role: "doctor" as UserRole,
    fullName: "",
    email: "",
    phone: "",
    gender: "male" as "male" | "female" | "other",
    dateOfBirth: "",
    address: "",
    password: "",
    cccd: "",
    // Doctor fields
    specialty: "",
    degree: "",
    birthYear: "",
    workExperience: "",
  });

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtered users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === "" ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery);

    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Paginated users
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  const handleViewUser = (user: UserWithRole) => {
    setSelectedUser(user);
    setIsEditMode(false);
    setEditFormData({
      fullName: user.fullName || "",
      email: user.email || "",
      phone: user.phone || "",
      gender: user.gender || "male",
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : "",
      address: user.address || "",
      cccd: user.cccd || "",
      specialty: user.specialty || "",
      degree: user.degree || "",
      birthYear: user.birthYear ? user.birthYear.toString() : "",
      workExperience: user.workExperience ? user.workExperience.toString() : "",
    });
    setIsDetailModalOpen(true);
  };

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/login");
      return;
    }

    // Fetch users list
    fetchUsers();
  }, [user, isAuthenticated, authLoading, router]);

  const fetchUsers = async () => {
    setFetchLoading(true);
    setFetchError("");

    try {
      const [doctorsRes, staffsRes, nursesRes, patientsRes] = await Promise.all(
        [
          directoryService.getDoctors(),
          directoryService.getStaffs(),
          directoryService.getNurses(),
          getPatients(),
        ]
      );

      const mapUserWithRole = (item: any, role: UserRole): UserWithRole => {
        const account = typeof item.userId === "object" ? item.userId : {};
        return {
          ...item,
          role,
          email: item.email || account.email || "",
          cccd: item.cccd || account.cccd || "",
          phone: item.phone || account.phone || account.sdt || "",
          fullName: item.fullName || account.fullName || "",
          gender: item.gender || account.gender || "other",
          dateOfBirth: item.dateOfBirth || account.dateOfBirth || "",
          address: item.address || account.address || "",
        };
      };

      const allUsers: UserWithRole[] = [
        ...(doctorsRes.data || []).map((doc: Doctor) =>
          mapUserWithRole(doc, "doctor")
        ),
        ...(staffsRes.data || []).map((staff: Staff) =>
          mapUserWithRole(staff, "staff")
        ),
        ...(nursesRes.data || []).map((nurse: LabNurse) =>
          mapUserWithRole(nurse, "lab_nurse")
        ),
        ...(patientsRes.data || []).map((patient: Patient) =>
          mapUserWithRole(patient, "patient")
        ),
      ];

      setUsers(allUsers);
    } catch (err: any) {
      setFetchError(err.message || "Không thể tải danh sách tài khoản");
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value as UserRole;
    setFormData({
      ...formData,
      role: newRole,
      // Reset role-specific fields
      specialty: "",
      degree: "",
      birthYear: "",
      workExperience: "",
      cccd: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const registerData: any = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        address: formData.address,
        password: formData.password || "123456", // Default password
        role: formData.role,
      };

      if (formData.cccd) {
        registerData.cccd = formData.cccd;
      }

      if (formData.role === "doctor") {
        registerData.specialty = formData.specialty;
        if (formData.degree) registerData.degree = formData.degree;
        if (formData.birthYear)
          registerData.birthYear = parseInt(formData.birthYear);
        if (formData.workExperience)
          registerData.workExperience = parseInt(formData.workExperience);
      }

      await authLib.register(registerData);
      setIsModalOpen(false);
      resetForm();
      // Refresh users list
      fetchUsers();
      toast.success("Tạo tài khoản thành công!");
    } catch (err: any) {
      toast.error(err.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      role: "doctor",
      fullName: "",
      email: "",
      phone: "",
      gender: "male",
      dateOfBirth: "",
      address: "",
      password: "",
      cccd: "",
      specialty: "",
      degree: "",
      birthYear: "",
      workExperience: "",
    });
    setError("");
  };

  // Helper to get Account ID safely
  const getAccountId = (user: UserWithRole) => {
    if (typeof user.userId === "object" && user.userId) {
      return user.userId._id;
    }
    return user.userId;
  };

  // Helper to get Profile ID label
  const getProfileIdLabel = (role: string) => {
    switch (role) {
      case "doctor":
        return "Mã bác sĩ";
      case "staff":
        return "Mã nhân viên";
      case "lab_nurse":
        return "Mã y tá";
      case "patient":
        return "Mã bệnh nhân";
      default:
        return "Mã hồ sơ";
    }
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setUpdateLoading(true);
    setError("");

    try {
      const updateData: any = {
        fullName: editFormData.fullName,
        email: editFormData.email,
        phone: editFormData.phone,
        gender: editFormData.gender,
        dateOfBirth: editFormData.dateOfBirth,
        address: editFormData.address,
      };

      if (editFormData.cccd) {
        updateData.cccd = editFormData.cccd;
      }

      if (selectedUser.role === "doctor") {
        updateData.specialty = editFormData.specialty;
        if (editFormData.degree) updateData.degree = editFormData.degree;
        if (editFormData.birthYear) updateData.birthYear = parseInt(editFormData.birthYear);
        if (editFormData.workExperience) updateData.workExperience = parseInt(editFormData.workExperience);
      }

      // Gọi API dựa trên vai trò
      if (selectedUser.role === "doctor") {
        await directoryService.updateDoctor(selectedUser._id, updateData);
      } else if (selectedUser.role === "staff") {
        await directoryService.updateStaff(selectedUser._id, updateData);
      } else if (selectedUser.role === "lab_nurse") {
        await directoryService.updateNurse(selectedUser._id, updateData);
      } else if (selectedUser.role === "patient") {
        await updatePatient(selectedUser._id, updateData);
      }

      toast.success("Cập nhật thông tin thành công!");
      setIsEditMode(false);
      setIsDetailModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || "Cập nhật thông tin thất bại");
    } finally {
      setUpdateLoading(false);
    }
  };

  return (
    <DashboardLayout navItems={ADMIN_NAV_ITEMS} title="Quản lý tài khoản">
      <Card>
        <CardHeader icon={<IconUserSquareRounded size={20} />}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
            <CardTitle>Danh sách tài khoản</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Input
                type="text"
                placeholder="Tìm theo tên, email, SĐT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64"
              />
              <Select
                options={[
                  { value: "all", label: "Tất cả vai trò" },
                  ...ROLE_OPTIONS,
                ]}
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="w-full sm:w-48"
              />
              <Button
                onClick={fetchUsers}
                variant="outline"
                size="sm"
                icon={<IconRefresh size={16} />}
              >
                Làm mới
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                icon={<IconPlus size={16} />}
                size="sm"
              >
                Tạo tài khoản mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {fetchLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p>Đang tải danh sách tài khoản...</p>
            </div>
          ) : fetchError ? (
            <div className="flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg text-sm">
              <IconAlertCircle size={20} />
              {fetchError}
              <Button onClick={fetchUsers} variant="outline" size="sm">
                Thử lại
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Chưa có tài khoản nào trong hệ thống.</p>
              <p>
                Hãy tạo tài khoản mới bằng nút "Tạo tài khoản Chi tiết lịch hẹn
                mới" ở trên.
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>STT</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Thông tin khác</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedUsers.map((user, index) => (
                    <TableRow key={user._id}>
                      <TableCell className="text-gray-500 font-medium">
                        {startIndex + index + 1}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            user.role === "doctor"
                              ? "info"
                              : user.role === "staff"
                                ? "purple"
                                : user.role === "lab_nurse"
                                  ? "warning"
                                  : "success"
                          }
                        >
                          {user.role === "doctor"
                            ? "Bác sĩ"
                            : user.role === "staff"
                              ? "Nhân viên"
                              : user.role === "lab_nurse"
                                ? "Y tá xét nghiệm"
                                : "Bệnh nhân"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email || "Chưa cập nhật"}</TableCell>
                      <TableCell>{user.phone || "Chưa cập nhật"}</TableCell>
                      <TableCell>
                        {user.role === "doctor" && user.specialty ? (
                          <span className="text-sm text-blue-600 font-medium">
                            {user.specialty}
                          </span>
                        ) : user.cccd ? (
                          <span className="text-sm text-gray-500">
                            CCCD: {user.cccd}
                          </span>
                        ) : (
                          "Chưa cập nhật"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          icon={<IconEye size={18} />}
                        >
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredUsers.length > 0 && (
                <Pagination
                  total={filteredUsers.length}
                  limit={itemsPerPage}
                  skip={(currentPage - 1) * itemsPerPage}
                  onPageChange={(page) => setCurrentPage(page)}
                  onLimitChange={(newLimit) => {
                    setItemsPerPage(newLimit);
                    setCurrentPage(1);
                  }}
                  pageSizeOptions={[10, 20, 50, 100]}
                />
              )}
            </>
          )}
        </CardBody>
      </Card>
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setIsEditMode(false);
          setError("");
        }}
        title={isEditMode ? "Chỉnh sửa tài khoản" : "Chi tiết tài khoản"}
        size="lg"
        footer={
          isEditMode ? (
            <>
              <Button
                variant="outline"
                icon={<IconX size={20} />}
                onClick={() => {
                  setIsEditMode(false);
                  setError("");
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleUpdateUser}
                loading={updateLoading}
                icon={<IconCheck size={20} />}
              >
                Cập nhật
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                icon={<IconX size={20} />}
                onClick={() => setIsDetailModalOpen(false)}
              >
                Đóng
              </Button>
              <Button
                onClick={() => setIsEditMode(true)}
                icon={<IconPencil size={20} />}
              >
                Chỉnh sửa
              </Button>
            </>
          )
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-4 text-red-800 bg-red-50 border border-red-200 rounded-lg text-sm">
                <IconAlertCircle size={20} />
                {error}
              </div>
            )}

            {!isEditMode ? (
              // View Mode
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-primary mb-3 flex items-center gap-2">
                    <IconInfoCircle size={20} />
                    Thông tin chung
                  </h3>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <Table>
                      <TableBody>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 w-1/3 font-medium text-gray-500 py-3">
                            {getProfileIdLabel(selectedUser.role)}
                          </TableCell>
                          <TableCell className="font-semibold text-gray-700 py-3">
                            {selectedUser._id}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Mã tài khoản (User ID)
                          </TableCell>
                          <TableCell className="font-semibold text-gray-700 py-3">
                            {getAccountId(selectedUser)}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Họ và tên
                          </TableCell>
                          <TableCell className="font-semibold text-gray-700 py-3 uppercase">
                            {selectedUser.fullName}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Vai trò
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              variant={
                                selectedUser.role === "doctor"
                                  ? "info"
                                  : selectedUser.role === "staff"
                                    ? "purple"
                                    : selectedUser.role === "patient"
                                      ? "success"
                                      : "warning"
                              }
                            >
                              {selectedUser.role === "doctor"
                                ? "Bác sĩ"
                                : selectedUser.role === "staff"
                                  ? "Nhân viên"
                                  : selectedUser.role === "patient"
                                    ? "Bệnh nhân"
                                    : "Y tá xét nghiệm"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Email
                          </TableCell>
                          <TableCell className="text-gray-700 py-3 italic">
                            {selectedUser.email || "Chưa cập nhật"}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Số điện thoại
                          </TableCell>
                          <TableCell className="font-semibold text-primary py-3">
                            {selectedUser.phone || "Chưa cập nhật"}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Giới tính / Ngày sinh
                          </TableCell>
                          <TableCell className="text-gray-700 py-3">
                            {`${selectedUser.gender === "male" ? "Nam" : selectedUser.gender === "female" ? "Nữ" : "Khác"} - ${selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString("vi-VN") : "Chưa cập nhật"}`}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent border-b border-gray-100">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Số CCCD
                          </TableCell>
                          <TableCell className="text-gray-700 py-3 font-mono">
                            {selectedUser.cccd || "Chưa cập nhật"}
                          </TableCell>
                        </TableRow>
                        <TableRow className="hover:bg-transparent">
                          <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                            Địa chỉ
                          </TableCell>
                          <TableCell className="text-gray-700 py-3 leading-relaxed">
                            {selectedUser.address || "Chưa cập nhật"}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {selectedUser.role === "doctor" && (
                  <div>
                    <h3 className="text-lg font-semibold text-secondary mb-3 flex items-center gap-2">
                      <IconStethoscope size={20} />
                      Thông tin chuyên môn
                    </h3>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <Table>
                        <TableBody>
                          <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableCell className="bg-gray-50/50 w-1/3 font-medium text-gray-500 py-3">
                              Chuyên khoa
                            </TableCell>
                            <TableCell className="font-semibold text-blue-600 py-3">
                              {selectedUser.specialty || "Chưa cập nhật"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                              Bằng cấp
                            </TableCell>
                            <TableCell className="text-gray-700 py-3 font-medium">
                              {selectedUser.degree || "Chưa cập nhật"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent border-b border-gray-100">
                            <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                              Năm sinh
                            </TableCell>
                            <TableCell className="text-gray-700 py-3">
                              {selectedUser.birthYear || "Chưa cập nhật"}
                            </TableCell>
                          </TableRow>
                          <TableRow className="hover:bg-transparent">
                            <TableCell className="bg-gray-50/50 font-medium text-gray-500 py-3">
                              Kinh nghiệm
                            </TableCell>
                            <TableCell className="text-gray-700 py-3 font-semibold">
                              {selectedUser.workExperience
                                ? `${selectedUser.workExperience} năm`
                                : "Chưa cập nhật"}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Edit Mode
              <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold text-primary flex items-center gap-2">
                    <IconInfoCircle size={20} />
                    Thông tin chung
                  </h3>
                </div>

                <Input
                  label="Họ và tên"
                  name="fullName"
                  type="text"
                  value={editFormData.fullName}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                />

                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                />

                <Input
                  label="Số điện thoại"
                  name="phone"
                  type="tel"
                  value={editFormData.phone}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                />

                <Select
                  label="Giới tính"
                  name="gender"
                  options={GENDER_OPTIONS}
                  value={editFormData.gender}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                />

                <Input
                  label="Ngày sinh"
                  name="dateOfBirth"
                  type="date"
                  value={editFormData.dateOfBirth}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                />

                <Input
                  label="Số CCCD"
                  name="cccd"
                  type="text"
                  value={editFormData.cccd}
                  onChange={handleEditFormChange}
                  fullWidth
                />

                <Input
                  label="Địa chỉ"
                  name="address"
                  type="text"
                  value={editFormData.address}
                  onChange={handleEditFormChange}
                  required
                  fullWidth
                  className="md:col-span-2"
                />

                {selectedUser.role === "doctor" && (
                  <>
                    <div className="md:col-span-2 mt-4">
                      <h3 className="text-lg font-semibold text-secondary flex items-center gap-2">
                        <IconStethoscope size={20} />
                        Thông tin chuyên môn
                      </h3>
                    </div>

                    <Input
                      label="Chuyên khoa"
                      name="specialty"
                      type="text"
                      value={editFormData.specialty}
                      onChange={handleEditFormChange}
                      required
                      fullWidth
                    />

                    <Select
                      label="Bằng cấp"
                      name="degree"
                      options={DEGREE_OPTIONS}
                      value={editFormData.degree}
                      onChange={handleEditFormChange}
                      fullWidth
                    />

                    <Input
                      label="Năm sinh"
                      name="birthYear"
                      type="number"
                      value={editFormData.birthYear}
                      onChange={handleEditFormChange}
                      fullWidth
                    />

                    <Input
                      label="Số năm kinh nghiệm"
                      name="workExperience"
                      type="number"
                      value={editFormData.workExperience}
                      onChange={handleEditFormChange}
                      fullWidth
                    />
                  </>
                )}
              </form>
            )}
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title="Tạo tài khoản mới"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              icon={<IconX size={20} />}
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              loading={loading}
              icon={<IconCheck size={20} />}
            >
              Tạo tài khoản
            </Button>
          </>
        }
      >
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {error && (
            <div className="md:col-span-2 flex items-center gap-2 p-4 mb-4 text-red-800 bg-red-50 border border-red-200 rounded-lg text-sm">
              <IconAlertCircle size={20} />
              {error}
            </div>
          )}

          <Select
            label="Vai trò"
            name="role"
            options={ROLE_OPTIONS}
            value={formData.role}
            onChange={handleRoleChange}
            required
            fullWidth
          />

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

          <Select
            label="Giới tính"
            name="gender"
            options={GENDER_OPTIONS}
            value={formData.gender}
            onChange={handleChange}
            required
            fullWidth
          />

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
            fullWidth
            helperText="CCCD dùng để đăng nhập"
          />

          {formData.role === "doctor" && (
            <>
              <Input
                label="Chuyên khoa"
                name="specialty"
                type="text"
                placeholder="Nội khoa, Ngoại khoa..."
                value={formData.specialty}
                onChange={handleChange}
                required
                fullWidth
              />
              <Select
                label="Bằng cấp"
                name="degree"
                options={DEGREE_OPTIONS}
                value={formData.degree}
                onChange={handleChange}
                fullWidth
              />
              <Input
                label="Năm sinh"
                name="birthYear"
                type="number"
                placeholder="1980"
                value={formData.birthYear}
                onChange={handleChange}
                fullWidth
              />
              <Input
                label="Số năm kinh nghiệm"
                name="workExperience"
                type="number"
                placeholder="10"
                value={formData.workExperience}
                onChange={handleChange}
                fullWidth
              />
            </>
          )}

          <Input
            label="Mật khẩu"
            name="password"
            type="password"
            placeholder="Để trống sẽ dùng mật khẩu mặc định: 123456"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            helperText="Nếu để trống, mật khẩu mặc định là: 123456"
          />
        </form>
      </Modal>
    </DashboardLayout>
  );
}
