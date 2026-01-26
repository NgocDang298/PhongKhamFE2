import React, { ReactNode } from "react";
import {
    IconLayoutDashboard,
    IconCalendar,
    IconStethoscope,
    IconReceipt,
    IconUser,
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
        icon: <IconUser size={20} />,
    },
];
