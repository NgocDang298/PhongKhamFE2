"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/lib/constants";
import * as testRequestService from "@/lib/services/testRequests";

const navItems = [
  {
    label: "Tổng quan",
    path: ROUTES.LAB_DASHBOARD,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: "Yêu cầu xét nghiệm",
    path: ROUTES.LAB_TEST_REQUESTS,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    ),
  },
  {
    label: "Kết quả xét nghiệm",
    path: ROUTES.LAB_TEST_RESULTS,
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
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
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
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
