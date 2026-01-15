"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User, LoginRequest, RegisterRequest } from "@/types";
import * as authLib from "@/lib/services/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Listen for 401 unauthorized events from api interceptor
    const handleUnauthorized = () => {
      setUser(null);
      router.push("/login");
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);

    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [router]);

  useEffect(() => {
    // Check if user is logged in on mount
    // Sử dụng setTimeout để đảm bảo localStorage đã sẵn sàng
    const checkAuth = () => {
      try {
        const currentUser = authLib.getCurrentUser();
        const token = authLib.getToken();

        // Chỉ set user nếu có cả token và user data
        if (token && currentUser) {
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Đảm bảo chạy sau khi component mount
    if (typeof window !== "undefined") {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authLib.login(credentials);

      // Persist token and user data
      authLib.setToken(response.token);
      authLib.setCurrentUser(response.user);

      setUser(response.user);

      // Redirect to appropriate dashboard
      const dashboardRoute = authLib.getDashboardRoute(response.user.role);
      router.push(dashboardRoute);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      await authLib.register(data);
      // After successful registration, redirect to login
      router.push("/login");
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authLib.logout();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the server-side logout fails, we should clear local state
    } finally {
      authLib.removeToken();
      authLib.removeCurrentUser();
      setUser(null);
      router.push("/login");
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
