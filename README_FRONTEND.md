# 🏥 Clinic Management System - Frontend

Giao diện Next.js thông minh cho hệ thống quản lý phòng khám với đầy đủ 62 APIs.

## 📋 Tổng quan

Frontend được xây dựng với Next.js 16, TypeScript, và Tailwind CSS, hỗ trợ đầy đủ các chức năng:

- ✅ Authentication (Đăng nhập, Đăng ký, Đổi mật khẩu)
- ✅ Quản lý lịch hẹn (11 APIs)
- ✅ Quản lý bệnh nhân (5 APIs)
- ✅ Quản lý ca khám (6 APIs)
- ✅ Quản lý xét nghiệm (10 APIs)
- ✅ Quản lý dịch vụ (6 APIs)
- ✅ Quản lý hóa đơn (6 APIs)
- ✅ Quản lý lịch làm việc (6 APIs)
- ✅ Quản lý hồ sơ (6 APIs)

## 🎯 Các Role được hỗ trợ

1. **Patient (Bệnh nhân)**
   - Dashboard với thống kê
   - Đặt lịch hẹn
   - Xem lịch sử khám bệnh
   - Xem hóa đơn
   - Quản lý hồ sơ

2. **Doctor (Bác sĩ)**
   - Dashboard với thống kê ca khám
   - Quản lý lịch hẹn
   - Quản lý ca khám
   - Xem lịch làm việc

3. **Staff (Nhân viên)**
   - Dashboard với thống kê
   - Quản lý lịch hẹn
   - Quản lý bệnh nhân walk-in
   - Quản lý hóa đơn

4. **Lab Nurse (Y tá xét nghiệm)**
   - Dashboard với thống kê yêu cầu
   - Quản lý yêu cầu xét nghiệm
   - Tạo và cập nhật kết quả xét nghiệm

5. **Admin (Quản trị viên)**
   - Dashboard với thống kê doanh thu
   - Quản lý dịch vụ
   - Quản lý lịch làm việc
   - Xem thống kê chi tiết

## 📁 Cấu trúc dự án

```
clinic-frontend/
├── app/                          # Next.js App Router
│   ├── patient/                  # Pages cho Patient
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   │   ├── page.tsx          # Danh sách lịch hẹn
│   │   │   └── book/
│   │   │       └── page.tsx      # Đặt lịch hẹn
│   │   ├── medical-history/
│   │   ├── invoices/
│   │   └── profile/
│   ├── doctor/                   # Pages cho Doctor
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── examinations/
│   │   └── schedule/
│   ├── staff/                    # Pages cho Staff
│   │   ├── dashboard/
│   │   ├── appointments/
│   │   ├── patients/
│   │   └── invoices/
│   ├── lab/                      # Pages cho Lab Nurse
│   │   ├── dashboard/
│   │   ├── test-requests/
│   │   └── test-results/
│   ├── admin/                    # Pages cho Admin
│   │   ├── dashboard/
│   │   ├── services/
│   │   ├── schedules/
│   │   └── statistics/
│   ├── login/
│   ├── register/
│   └── layout.tsx
├── src/
│   ├── components/
│   │   ├── ui/                   # UI Components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Textarea.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   └── layout/
│   │       └── DashboardLayout.tsx
│   ├── contexts/
│   │   └── AuthContext.tsx       # Authentication context
│   ├── lib/
│   │   ├── api.ts                # Axios instance & interceptors
│   │   ├── auth.ts               # Auth utilities
│   │   ├── constants.ts          # Constants & routes
│   │   ├── utils.ts              # Utility functions
│   │   └── services/            # API service functions
│   │       ├── appointments.ts
│   │       ├── patients.ts
│   │       ├── directory.ts
│   │       ├── medicalProfile.ts
│   │       ├── examinations.ts
│   │       ├── testRequests.ts
│   │       ├── testResults.ts
│   │       ├── services.ts
│   │       ├── invoices.ts
│   │       ├── workSchedules.ts
│   │       └── profile.ts
│   └── types/
│       └── index.ts              # TypeScript types
└── package.json
```

## 🚀 Cài đặt và chạy

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Cài đặt

```bash
npm install
```

### Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### Build production

```bash
npm run build
npm start
```

## 🔧 Cấu hình

### API Base URL

Cấu hình trong `src/lib/constants.ts`:

```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

Hoặc tạo file `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 📚 API Services

Tất cả 62 APIs đã được implement trong thư mục `src/lib/services/`:

### Authentication (4 APIs)
- ✅ Register
- ✅ Login
- ✅ Change Password
- ✅ Logout

### Appointments (11 APIs)
- ✅ Create appointment
- ✅ Get appointments list
- ✅ Get available slots
- ✅ Confirm/Cancel/Reject appointment
- ✅ Get suggested slots
- ✅ Get doctors list
- ✅ Get available dates/slots by doctor

### Directory (5 APIs)
- ✅ Create walk-in patient
- ✅ Get patients list
- ✅ Get doctors list
- ✅ Get staffs list
- ✅ Get nurses list

### Medical Profile (2 APIs)
- ✅ Create/Get medical profile
- ✅ Create/Get patient medical profile

### Examinations (6 APIs)
- ✅ Start examination
- ✅ Get examination details
- ✅ Get examination by appointment
- ✅ Get examinations list
- ✅ Update examination
- ✅ Complete examination

### Test Requests (5 APIs)
- ✅ Create test request
- ✅ Get test requests by examination
- ✅ Get test request details
- ✅ Update test request status
- ✅ Get test requests list

### Test Results (5 APIs)
- ✅ Create test result
- ✅ Get test result by request
- ✅ Update test result
- ✅ Get test results by examination
- ✅ Get patient test results

### Services (6 APIs)
- ✅ Create service
- ✅ Get services list
- ✅ Get service details
- ✅ Update service
- ✅ Delete service
- ✅ Get active services

### Invoices (6 APIs)
- ✅ Create invoice
- ✅ Get invoices list
- ✅ Get invoice details
- ✅ Pay invoice
- ✅ Get patient invoices
- ✅ Get revenue statistics

### Work Schedules (6 APIs)
- ✅ Create work schedule
- ✅ Get doctor schedule
- ✅ Get nurse schedule
- ✅ Update work schedule
- ✅ Delete work schedule
- ✅ Get available staff

### Profile (6 APIs)
- ✅ Get profile
- ✅ Update profile
- ✅ Upload avatar
- ✅ Get medical history
- ✅ Get my appointments
- ✅ Get my examinations

## 🎨 UI Components

### Button
```tsx
<Button variant="primary" size="lg" loading={false} fullWidth>
    Click me
</Button>
```

### Card
```tsx
<Card>
    <CardHeader>
        <CardTitle>Title</CardTitle>
    </CardHeader>
    <CardBody>Content</CardBody>
</Card>
```

### Input
```tsx
<Input
    label="Email"
    type="email"
    placeholder="email@example.com"
    required
    fullWidth
/>
```

### Select
```tsx
<Select
    label="Choose option"
    options={[
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' }
    ]}
    fullWidth
/>
```

### Modal
```tsx
<Modal
    isOpen={isOpen}
    onClose={() => setIsOpen(false)}
    title="Modal Title"
>
    Content
</Modal>
```

### Table
```tsx
<Table>
    <TableHeader>
        <TableRow>
            <TableHead>Name</TableHead>
        </TableRow>
    </TableHeader>
    <TableBody>
        <TableRow>
            <TableCell>John Doe</TableCell>
        </TableRow>
    </TableBody>
</Table>
```

## 🔐 Authentication Flow

1. User đăng nhập với CCCD và password
2. Token được lưu trong localStorage
3. Token được tự động thêm vào header của mọi request
4. Nếu token hết hạn (401), user được redirect về trang login
5. User có thể đăng xuất để xóa token

## 🛣️ Routes

### Public Routes
- `/login` - Đăng nhập
- `/register` - Đăng ký

### Patient Routes
- `/patient/dashboard` - Dashboard
- `/patient/appointments` - Danh sách lịch hẹn
- `/patient/appointments/book` - Đặt lịch hẹn
- `/patient/medical-history` - Lịch sử khám bệnh
- `/patient/invoices` - Hóa đơn
- `/patient/profile` - Hồ sơ

### Doctor Routes
- `/doctor/dashboard` - Dashboard
- `/doctor/appointments` - Lịch hẹn
- `/doctor/examinations` - Ca khám

### Staff Routes
- `/staff/dashboard` - Dashboard
- `/staff/appointments` - Lịch hẹn
- `/staff/patients` - Bệnh nhân
- `/staff/invoices` - Hóa đơn
- `/staff/services` - Dịch vụ

### Lab Nurse Routes
- `/lab/dashboard` - Dashboard
- `/lab/test-requests` - Yêu cầu xét nghiệm
- `/lab/test-results` - Kết quả xét nghiệm

### Admin Routes
- `/admin/dashboard` - Dashboard
- `/admin/services` - Quản lý dịch vụ
- `/admin/schedules` - Quản lý lịch làm việc
- `/admin/statistics` - Thống kê

## 🎯 Tính năng nổi bật

1. **Responsive Design**: Giao diện tương thích với mọi thiết bị
2. **Role-based Access Control**: Mỗi role có dashboard và menu riêng
3. **Real-time Updates**: Sử dụng SWR cho data fetching
4. **Error Handling**: Xử lý lỗi toàn diện với thông báo rõ ràng
5. **Loading States**: Hiển thị trạng thái loading cho mọi thao tác
6. **Form Validation**: Validation phía client cho tất cả forms
7. **Type Safety**: TypeScript đầy đủ cho type safety

## 📝 Notes

- Tất cả dates sử dụng ISO 8601 format
- Token authentication với Bearer token
- Pagination mặc định: limit 50, max 100
- Error messages hiển thị bằng tiếng Việt

## 🔄 Next Steps

Để hoàn thiện hệ thống, có thể thêm:

1. [ ] Thêm các trang còn thiếu (examinations, test requests, etc.)
2. [ ] Thêm pagination cho các danh sách
3. [ ] Thêm search và filter nâng cao
4. [ ] Thêm export data (PDF, Excel)
5. [ ] Thêm notifications/real-time updates
6. [ ] Thêm dark mode
7. [ ] Thêm i18n cho đa ngôn ngữ
8. [ ] Thêm unit tests và E2E tests

## 📄 License

© 2024 Clinic Management System. All rights reserved.

