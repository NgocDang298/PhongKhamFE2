"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getPatients } from "@/lib/services/patients";
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
} from "@tabler/icons-react";
import Pagination from "@/components/ui/Pagination";
import { ADMIN_NAV_ITEMS } from "@/lib/navigation";

const ROLE_OPTIONS = [
  { value: "doctor", label: "Bác sĩ" },
  { value: "staff", label: "Nhân viên" },
  { value: "lab_nurse", label: "Y tá xét nghiệm" },
  { value: "patient", label: "Bệnh nhân" },
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
  const [loading, setLoading] = useState(false); // Used for create form
  const [error, setError] = useState("");
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
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${user.role === "doctor"
                            ? "bg-blue-100 text-blue-800"
                            : user.role === "staff"
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "lab_nurse"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-green-100 text-green-800"
                            }`}
                        >
                          {user.role === "doctor"
                            ? "Bác sĩ"
                            : user.role === "staff"
                              ? "Nhân viên"
                              : user.role === "lab_nurse"
                                ? "Y tá xét nghiệm"
                                : "Bệnh nhân"}
                        </span>
                      </TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
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
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleViewUser(user)}
                          icon={<IconEye size={16} />}
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
        onClose={() => setIsDetailModalOpen(false)}
        title="Chi tiết tài khoản"
        size="lg"
        footer={
          <Button onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
        }
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                Thông tin chung
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">
                    {getProfileIdLabel(selectedUser.role)}
                  </span>
                  <span
                    className="text-base font-medium text-gray-700 break-all"
                    title={selectedUser._id}
                  >
                    {selectedUser._id}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">
                    Mã tài khoản (User ID)
                  </span>
                  <span
                    className="text-base font-medium text-gray-700 break-all"
                    title={getAccountId(selectedUser)}
                  >
                    {getAccountId(selectedUser)}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Họ và tên</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.fullName}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Vai trò</span>
                  <div className="text-base font-medium text-gray-700 break-all">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${selectedUser.role === "doctor"
                        ? "bg-blue-100 text-blue-800"
                        : selectedUser.role === "staff"
                          ? "bg-purple-100 text-purple-800"
                          : selectedUser.role === "patient"
                            ? "bg-green-100 text-green-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                    >
                      {selectedUser.role === "doctor"
                        ? "Bác sĩ"
                        : selectedUser.role === "staff"
                          ? "Nhân viên"
                          : selectedUser.role === "patient"
                            ? "Bệnh nhân"
                            : "Y tá xét nghiệm"}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Email</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.email || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Số điện thoại</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.phone || "-"}
                  </span>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Giới tính</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.gender === "male"
                      ? "Nam"
                      : selectedUser.gender === "female"
                        ? "Nữ"
                        : selectedUser.gender === "other"
                          ? "Khác"
                          : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Ngày sinh</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.dateOfBirth
                      ? new Date(selectedUser.dateOfBirth).toLocaleDateString(
                        "vi-VN"
                      )
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">CCCD</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.cccd || "-"}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-500">Địa chỉ</span>
                  <span className="text-base font-medium text-gray-700 break-all">
                    {selectedUser.address || "-"}
                  </span>
                </div>
              </div>
            </div>

            {selectedUser.role === "doctor" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
                  Thông tin bác sĩ
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Chuyên khoa</span>
                    <span className="text-base font-medium text-gray-700 break-all">
                      {selectedUser.specialty || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Bằng cấp</span>
                    <span className="text-base font-medium text-gray-700 break-all">
                      {selectedUser.degree || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Năm sinh</span>
                    <span className="text-base font-medium text-gray-700 break-all">
                      {selectedUser.birthYear || "-"}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-gray-500">Kinh nghiệm</span>
                    <span className="text-base font-medium text-gray-700 break-all">
                      {selectedUser.workExperience
                        ? `${selectedUser.workExperience} năm`
                        : "-"}
                    </span>
                  </div>
                </div>
              </div>
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
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleSubmit} loading={loading}>
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
              <Input
                label="Bằng cấp"
                name="degree"
                type="text"
                placeholder="Bác sĩ, Thạc sĩ, Tiến sĩ..."
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
