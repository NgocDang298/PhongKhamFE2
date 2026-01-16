"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as testRequestService from "@/lib/services/testRequests";
import {
  IconLayoutGrid,
  IconFileText,
  IconCircleCheck,
  IconClock,
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

export default function LabDashboard() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    waitingRequests: 0,
    processingRequests: 0,
    completedRequests: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Đợi auth loading hoàn tất trước khi check
    if (authLoading) return;

    if (!isAuthenticated || user?.role !== "lab_nurse") {
      router.push("/login");
      return;
    }
    loadStats();
  }, [user, isAuthenticated, authLoading, router]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [waitingRes, processingRes, completedRes] = await Promise.all([
        testRequestService.getTestRequests({ status: "waiting" }),
        testRequestService.getTestRequests({ status: "processing" }),
        testRequestService.getTestRequests({ status: "completed" }),
      ]);

      setStats({
        waitingRequests: waitingRes.data?.testRequests?.length || 0,
        processingRequests: processingRes.data?.testRequests?.length || 0,
        completedRequests: completedRes.data?.testRequests?.length || 0,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <DashboardLayout navItems={navItems} title="Tổng quan">
        <div className="flex items-center justify-center h-64 text-gray-500">
          Đang tải...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems} title="Tổng quan">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(245, 158, 11, 0.1)",
                  color: "#f59e0b",
                }}
              >
                <IconClock size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.waitingRequests}
                </div>
                <div className="text-sm text-gray-500">Chờ xử lý</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(59, 130, 246, 0.1)",
                  color: "#3b82f6",
                }}
              >
                <IconClock size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.processingRequests}
                </div>
                <div className="text-sm text-gray-500">Đang xử lý</div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardBody>
            <div className="flex items-center gap-4">
              <div
                className="flex items-center justify-center w-12 h-12 rounded-lg"
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  color: "#10b981",
                }}
              >
                <IconCircleCheck size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.completedRequests}
                </div>
                <div className="text-sm text-gray-500">Đã hoàn thành</div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
