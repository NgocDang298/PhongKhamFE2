import React, { ReactNode } from "react";
import {
    IconLayoutDashboard,
    IconCalendar,
    IconStethoscope,
    IconReceipt,
    IconUserSquareRounded,
    IconUsers,
    IconClipboardCheck,
    IconFlask,
    IconUsersGroup,
    IconActivity,
    IconClock,
    IconChartBar,
} from "@tabler/icons-react";
import { ROUTES } from "./constants";

export interface SubNavItem {
    label: string;
    path: string;
}

export interface NavItem {
    label: string;
    path?: string;
    icon: ReactNode;
    subNavItems?: SubNavItem[];
    roles?: string[];
}

export const PATIENT_NAV_ITEMS: NavItem[] = [
    {
        label: "Tổng quan",
        path: ROUTES.PATIENT_DASHBOARD,
        icon: <IconLayoutDashboard size={20} />,
    },
    {
        label: "Lịch hẹn",
        icon: <IconCalendar size={20} />,
        subNavItems: [
            { label: "Lịch hẹn của tôi", path: ROUTES.PATIENT_APPOINTMENTS },
            { label: "Đặt lịch mới", path: ROUTES.PATIENT_BOOK_APPOINTMENT },
        ],
    },
    {
        label: "Sức khỏe",
        icon: <IconStethoscope size={20} />,
        subNavItems: [
            { label: "Hồ sơ bệnh lý", path: ROUTES.PATIENT_MEDICAL_PROFILE },
            { label: "Lịch sử khám bệnh", path: ROUTES.PATIENT_MEDICAL_HISTORY },
        ],
    },
    {
        label: "Hóa đơn",
        path: ROUTES.PATIENT_INVOICES,
        icon: <IconReceipt size={20} />,
    },
    {
        label: "Thông tin cá nhân",
        path: ROUTES.PATIENT_PROFILE,
        icon: <IconUserSquareRounded size={20} />,
    },
];

export const DOCTOR_NAV_ITEMS: NavItem[] = [
    {
        label: "Tổng quan",
        path: ROUTES.DOCTOR_DASHBOARD,
        icon: <IconLayoutDashboard size={20} />,
    },
    {
        label: "Lịch hẹn",
        path: ROUTES.DOCTOR_APPOINTMENTS,
        icon: <IconCalendar size={20} />,
    },
    {
        label: "Ca khám bệnh",
        path: ROUTES.DOCTOR_EXAMINATIONS,
        icon: <IconStethoscope size={20} />,
    },
];

export const STAFF_NAV_ITEMS: NavItem[] = [
    {
        label: "Tổng quan",
        path: ROUTES.STAFF_DASHBOARD,
        icon: <IconLayoutDashboard size={20} />,
    },
    {
        label: "Lịch hẹn",
        path: ROUTES.STAFF_APPOINTMENTS,
        icon: <IconCalendar size={20} />,
    },
    {
        label: "Bệnh nhân",
        path: ROUTES.STAFF_PATIENTS,
        icon: <IconUsers size={20} />,
    },
    {
        label: "Dịch vụ",
        path: ROUTES.STAFF_SERVICES,
        icon: <IconActivity size={20} />,
    },
    {
        label: "Hóa đơn",
        path: ROUTES.STAFF_INVOICES,
        icon: <IconReceipt size={20} />,
    },
];

export const LAB_NAV_ITEMS: NavItem[] = [
    {
        label: "Tổng quan",
        path: ROUTES.LAB_DASHBOARD,
        icon: <IconLayoutDashboard size={20} />,
    },
    {
        label: "Yêu cầu xét nghiệm",
        path: ROUTES.LAB_TEST_REQUESTS,
        icon: <IconFlask size={20} />,
    },
    {
        label: "Kết quả xét nghiệm",
        path: ROUTES.LAB_TEST_RESULTS,
        icon: <IconClipboardCheck size={20} />,
    },
];

export const ADMIN_NAV_ITEMS: NavItem[] = [
    {
        label: "Tổng quan",
        path: ROUTES.ADMIN_DASHBOARD,
        icon: <IconLayoutDashboard size={20} />,
    },
    {
        label: "Quản trị người dùng",
        path: ROUTES.ADMIN_USERS,
        icon: <IconUsersGroup size={20} />,
    },
    {
        label: "Quản lý dịch vụ",
        path: ROUTES.ADMIN_SERVICES,
        icon: <IconActivity size={20} />,
    },
    {
        label: "Quản lý lịch làm việc",
        path: ROUTES.ADMIN_SCHEDULES,
        icon: <IconClock size={20} />,
    },
    {
        label: "Thống kê",
        path: ROUTES.ADMIN_STATISTICS,
        icon: <IconChartBar size={20} />,
    },
];
