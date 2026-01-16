"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRoute } from "@/lib/services/auth";
import { IconLoader2 } from "@tabler/icons-react";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to appropriate dashboard
        const defaultRoute = getDefaultRoute();
        router.push(defaultRoute);
      } else {
        // Redirect to login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--spacing-lg)",
        }}
      >
        <IconLoader2 size={64} color="white" className="animate-spin" />
        <p style={{ color: "white", fontSize: "var(--font-size-lg)" }}>
          Đang tải...
        </p>
      </div>
    </div>
  );
}
