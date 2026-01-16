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
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import { ROUTES } from "@/lib/constants";
import * as testResultService from "@/lib/services/testResults";
import * as testRequestService from "@/lib/services/testRequests";
import * as directoryService from "@/lib/services/directory";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  IconLayoutGrid,
  IconFileText,
  IconCircleCheck,
} from "@tabler/icons-react";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.LAB_DASHBOARD,
    icon: <IconLayoutGrid size={20} />,
  },
  {
    label: "Yêu cầu xét nghiệm",
    path: ROUTES.LAB_TEST_REQUESTS,
    icon: <IconFileText size={20} />,
  },
  {
    label: "Kết quả xét nghiệm",
    path: ROUTES.LAB_TEST_RESULTS,
    icon: <IconCircleCheck size={20} />,
  },
];

export default function LabTestResultsPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [testRequests, setTestRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [formData, setFormData] = useState({
    resultData: "",
    notes: "",
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || user?.role !== "lab_nurse") {
      router.push("/login");
      return;
    }
    loadData();
  }, [user, isAuthenticated, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [requestsRes, resultsRes] = await Promise.all([
        testRequestService.getTestRequests({ status: "completed" }),
        testResultService.getTestResultsByExamination(""),
      ]);
      setTestRequests(requestsRes.data?.testRequests || []);
      // Load results for each request
      const results = await Promise.all(
        (requestsRes.data?.testRequests || []).map(async (req: any) => {
          try {
            const result = await testResultService.getTestResultByRequest(
              req._id
            );
            return result.data;
          } catch {
            return null;
          }
        })
      );
      setTestResults(results.filter(Boolean));
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      let resultData;
      try {
        resultData = JSON.parse(formData.resultData);
      } catch {
        resultData = formData.resultData; // If not JSON, treat as a string value
      }
      await testResultService.createTestResult({
        testRequestId: selectedRequest._id,
        resultData: {
          ...(typeof resultData === "object"
            ? resultData
            : { value: resultData }),
          notes: formData.notes,
        },
      });
      setIsModalOpen(false);
      setSelectedRequest(null);
      setFormData({ resultData: "", notes: "" });
      loadData();
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleOpenModal = (request: any) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Kết quả xét nghiệm">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Kết quả xét nghiệm">
      <Card>
        <CardHeader icon={<IconCircleCheck size={20} />}>
          <CardTitle>Danh sách kết quả xét nghiệm</CardTitle>
        </CardHeader>
        <CardBody>
          {testResults.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Chưa có kết quả xét nghiệm nào
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Loại xét nghiệm</TableHead>
                  <TableHead>Ngày hoàn thành</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((result) => (
                  <TableRow key={result._id}>
                    <TableCell>
                      {typeof result.testRequestId === "object" &&
                      (result.testRequestId as any).examId
                        ? typeof (result.testRequestId as any).examId ===
                            "object" &&
                          (result.testRequestId as any).examId.patientId
                          ? typeof (result.testRequestId as any).examId
                              .patientId === "object"
                            ? (result.testRequestId as any).examId.patientId
                                .fullName
                            : "N/A"
                          : "N/A"
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {typeof result.testRequestId === "object" &&
                      result.testRequestId?.testType
                        ? typeof result.testRequestId.testType === "object"
                          ? result.testRequestId.testType.name
                          : result.testRequestId.testType
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {format(
                        new Date(result.createdAt || ""),
                        "dd/MM/yyyy HH:mm",
                        { locale: vi }
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const request = testRequests.find(
                            (r) =>
                              r._id === result.testRequestId?._id ||
                              r._id === result.testRequestId
                          );
                          if (request) handleOpenModal(request);
                        }}
                      >
                        Xem/Sửa
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Create/Update Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRequest(null);
          setFormData({ resultData: "", notes: "" });
        }}
        title="Nhập kết quả xét nghiệm"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRequest(null);
                setFormData({ resultData: "", notes: "" });
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleCreateResult}>Lưu kết quả</Button>
          </>
        }
      >
        {selectedRequest && (
          <form onSubmit={handleCreateResult} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
              <div>
                <strong>Bệnh nhân:</strong>{" "}
                {selectedRequest.examId &&
                typeof selectedRequest.examId === "object" &&
                (selectedRequest.examId as any).patientId
                  ? typeof (selectedRequest.examId as any).patientId ===
                    "object"
                    ? (selectedRequest.examId as any).patientId.fullName
                    : "N/A"
                  : "N/A"}
              </div>
              <div>
                <strong>Loại xét nghiệm:</strong>{" "}
                {typeof selectedRequest.testType === "object" &&
                selectedRequest.testType
                  ? selectedRequest.testType.name
                  : selectedRequest.testType || "N/A"}
              </div>
            </div>
            <Textarea
              label="Kết quả xét nghiệm (JSON hoặc văn bản)"
              name="resultData"
              value={formData.resultData}
              onChange={(e) =>
                setFormData({ ...formData, resultData: e.target.value })
              }
              required
              fullWidth
              rows={6}
              placeholder='{"value": "123", "unit": "mg/dL"} hoặc ghi chú văn bản'
            />
            <Textarea
              label="Ghi chú"
              name="notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              fullWidth
              rows={3}
            />
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
