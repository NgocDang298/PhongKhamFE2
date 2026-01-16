"use client";

import React, { ReactNode, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ROLE_LABELS, ROUTES } from "@/lib/constants";
import {
  IconLayoutDashboard,
  IconMenu2,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import Button from "@/components/ui/Button";

interface NavItem {
  label: string;
  path: string;
  icon: ReactNode;
  roles?: string[];
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
}

export default function DashboardLayout({
  children,
  navItems,
  title,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role))
  );

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
                    fixed left-0 top-0 h-full bg-white border-r border-gray-200
                    transition-all duration-300 ease-in-out z-40
                    ${sidebarOpen ? "w-64" : "w-20"}
                `}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center p-4 border-b border-gray-200 ${
            sidebarOpen ? "justify-between" : "justify-center"
          }`}
        >
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && "justify-center"
            }`}
          >
            {sidebarOpen && (
              <>
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary text-white">
                  <IconLayoutDashboard size={24} />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  Clinic System
                </span>
              </>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <IconMenu2 size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.path || pathname?.startsWith(item.path + "/");
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-all duration-200
                                    ${
                                      isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-gray-700 hover:bg-gray-100"
                                    }
                                    ${!sidebarOpen && "justify-center"}
                                `}
              >
                <span
                  className={`flex-shrink-0 ${
                    isActive ? "text-primary" : "text-gray-500"
                  }`}
                >
                  {item.icon}
                </span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 space-y-3">
          {/* User Info */}
          <div
            className={`flex items-center gap-3 ${
              !sidebarOpen && "justify-center"
            }`}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
              {user?.fullName?.charAt(0) || user?.email?.charAt(0) || (
                <IconUser size={20} />
              )}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {user?.fullName || "User"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {user
                    ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]
                    : ""}
                </div>
              </div>
            )}
          </div>

          {/* Logout Button */}
          <Button
            variant="destructive"
            size="sm"
            onClick={handleLogout}
            icon={<IconLogout size={16} />}
            fullWidth
          >
            {sidebarOpen && "Đăng xuất"}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`
                    flex-1 flex flex-col transition-all duration-300
                    ${sidebarOpen ? "ml-64" : "ml-20"}
                `}
      >
        {/* Header */}
        <header className="bg-white flex items-center border-b border-gray-200 px-8 py-4 h-[73px]">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">{children}</div>
      </main>
    </div>
  );
}
