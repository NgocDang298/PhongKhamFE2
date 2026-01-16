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

export default function PatientMedicalHistoryPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [medicalHistory, setMedicalHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "patient") {
      router.push("/login");
      return;
    }
    loadMedicalHistory();
  }, [user, isAuthenticated, authLoading, router]);

  const loadMedicalHistory = async () => {
    try {
      setLoading(true);
      const response: any = await profileService.getMedicalHistory();
      const history = response.data || response || null;
      setMedicalHistory(history);
    } catch (error) {
      console.error("Error loading medical history:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Lịch sử khám bệnh">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Lịch sử khám bệnh">
      <Card>
        <CardHeader icon={<IconFileText size={20} />}>
          <CardTitle>Hồ sơ y tế</CardTitle>
        </CardHeader>
        <CardBody>
          {medicalHistory ? (
            <div className="space-y-8">
              <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <div>
                    <strong>Nhóm máu:</strong>{" "}
                    {medicalHistory.bloodType || "Chưa cập nhật"}
                  </div>
                </div>
              </div>

              {medicalHistory.allergies &&
                medicalHistory.allergies.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Dị ứng
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medicalHistory.allergies.map(
                        (allergy: string, index: number) => (
                          <li key={index}>{allergy}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {medicalHistory.chronicDiseases &&
                medicalHistory.chronicDiseases.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Bệnh mãn tính
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medicalHistory.chronicDiseases.map(
                        (disease: string, index: number) => (
                          <li key={index}>{disease}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {medicalHistory.medications &&
                medicalHistory.medications.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Thuốc đang dùng
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medicalHistory.medications.map(
                        (med: string, index: number) => (
                          <li key={index}>{med}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {medicalHistory.surgeries &&
                medicalHistory.surgeries.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Phẫu thuật
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medicalHistory.surgeries.map(
                        (surgery: string, index: number) => (
                          <li key={index}>{surgery}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {medicalHistory.familyHistory &&
                medicalHistory.familyHistory.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tiền sử gia đình
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {medicalHistory.familyHistory.map(
                        (history: string, index: number) => (
                          <li key={index}>{history}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}

              {medicalHistory.notes && (
                <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ghi chú
                  </h3>
                  <p className="text-gray-700">{medicalHistory.notes}</p>
                </div>
              )}

              {medicalHistory.examinations &&
                medicalHistory.examinations.length > 0 && (
                  <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Lịch sử khám bệnh
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Ngày khám</TableHead>
                          <TableHead>Bác sĩ</TableHead>
                          <TableHead>Chẩn đoán</TableHead>
                          <TableHead>Điều trị</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {medicalHistory.examinations.map((exam: any) => (
                          <TableRow key={exam._id}>
                            <TableCell>
                              {format(
                                new Date(exam.examDate),
                                "dd/MM/yyyy HH:mm",
                                { locale: vi }
                              )}
                            </TableCell>
                            <TableCell>
                              {typeof exam.doctorId === "object" &&
                              exam.doctorId
                                ? exam.doctorId.fullName
                                : "Không xác định"}
                            </TableCell>
                            <TableCell>{exam.diagnosis || "-"}</TableCell>
                            <TableCell>{exam.treatment || "-"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              Chưa có thông tin lịch sử khám bệnh
            </div>
          )}
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
