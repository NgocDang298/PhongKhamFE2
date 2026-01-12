'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Modal from '@/components/ui/Modal';
import { ROUTES, DAYS_OF_WEEK, DAY_LABELS } from '@/lib/constants';
import * as workScheduleService from '@/lib/services/workSchedules';
import * as directoryService from '@/lib/services/directory';
import type { WorkSchedule, Doctor, LabNurse } from '@/types';
import styles from './page.module.css';

const navItems = [
    {
        label: 'Tổng quan',
        path: ROUTES.ADMIN_DASHBOARD,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
            </svg>
        ),
    },
    {
        label: 'Quản lý tài khoản',
        path: ROUTES.ADMIN_USERS,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: 'Lịch làm việc',
        path: ROUTES.ADMIN_SCHEDULES,
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
            </svg>
        ),
    },
];

interface ScheduleWithPerson extends WorkSchedule {
    personName?: string;
    personType?: 'doctor' | 'nurse';
}

export default function AdminSchedulesPage() {
    const router = useRouter();
    const { user, isAuthenticated, loading: authLoading } = useAuth();
    const [schedules, setSchedules] = useState<ScheduleWithPerson[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [nurses, setNurses] = useState<LabNurse[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPerson, setSelectedPerson] = useState<{
        id: string;
        name: string;
        type: 'doctor' | 'nurse';
    } | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduleWithPerson | null>(null);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        doctorId: '',
        labNurseId: '',
        dayOfWeek: '',
        shiftStart: '',
        shiftEnd: '',
        note: '',
    });
    const [quickCreateData, setQuickCreateData] = useState({
        doctorId: '',
        labNurseId: '',
        selectedDays: [] as number[],
        shifts: [
            { start: '08:00', end: '12:00', note: 'Ca sáng' },
            { start: '13:00', end: '17:00', note: 'Ca chiều' },
        ],
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        if (authLoading) return;
        if (!isAuthenticated || user?.role !== 'admin') {
            router.push('/login');
            return;
        }
        loadData();
    }, [user, isAuthenticated, authLoading, router]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [doctorsRes, nursesRes] = await Promise.all([
                directoryService.getDoctors(),
                directoryService.getNurses(),
            ]);

            setDoctors(doctorsRes.data || []);
            setNurses(nursesRes.data || []);
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const loadPersonSchedules = async (personId: string, type: 'doctor' | 'nurse') => {
        try {
            setLoading(true);
            const scheduleRes =
                type === 'doctor'
                    ? await workScheduleService.getDoctorSchedule(personId)
                    : await workScheduleService.getNurseSchedule(personId);

            if (scheduleRes.data) {
                const personName =
                    type === 'doctor'
                        ? doctors.find((d) => d._id === personId)?.fullName || ''
                        : nurses.find((n) => n._id === personId)?.fullName || '';

                setSchedules(
                    scheduleRes.data.map((schedule: WorkSchedule) => ({
                        ...schedule,
                        personName,
                        personType: type,
                    }))
                );
            } else {
                setSchedules([]);
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPerson = (personId: string, personName: string, type: 'doctor' | 'nurse') => {
        setSelectedPerson({ id: personId, name: personName, type });
        loadPersonSchedules(personId, type);
    };

    const handleOpenModal = (schedule?: ScheduleWithPerson) => {
        if (schedule) {
            setEditingSchedule(schedule);
            setFormData({
                doctorId: typeof schedule.doctorId === 'object' ? schedule.doctorId._id : schedule.doctorId || '',
                labNurseId: typeof schedule.labNurseId === 'object' ? schedule.labNurseId._id : schedule.labNurseId || '',
                dayOfWeek: schedule.dayOfWeek.toString(),
                shiftStart: schedule.shiftStart,
                shiftEnd: schedule.shiftEnd,
                note: schedule.note || '',
            });
        } else {
            setEditingSchedule(null);
            // Pre-fill with selected person if available
            setFormData({
                doctorId: selectedPerson?.type === 'doctor' ? selectedPerson.id : '',
                labNurseId: selectedPerson?.type === 'nurse' ? selectedPerson.id : '',
                dayOfWeek: '',
                shiftStart: '',
                shiftEnd: '',
                note: '',
            });
        }
        setIsModalOpen(true);
        setError('');
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingSchedule(null);
        setFormData({
            doctorId: '',
            labNurseId: '',
            dayOfWeek: '',
            shiftStart: '',
            shiftEnd: '',
            note: '',
        });
        setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.doctorId && !formData.labNurseId) {
            setError('Vui lòng chọn bác sĩ hoặc y tá');
            return;
        }

        if (!formData.dayOfWeek || !formData.shiftStart || !formData.shiftEnd) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            const scheduleData: any = {
                dayOfWeek: parseInt(formData.dayOfWeek),
                shiftStart: formData.shiftStart,
                shiftEnd: formData.shiftEnd,
                note: formData.note,
            };

            if (formData.doctorId) {
                scheduleData.doctorId = formData.doctorId;
            } else {
                scheduleData.labNurseId = formData.labNurseId;
            }

            if (editingSchedule) {
                await workScheduleService.updateWorkSchedule(editingSchedule._id, scheduleData);
            } else {
                await workScheduleService.createWorkSchedule(scheduleData);
            }

            handleCloseModal();
            if (selectedPerson) {
                loadPersonSchedules(selectedPerson.id, selectedPerson.type);
            }
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra');
        }
    };

    const handleQuickCreate = async () => {
        if (!quickCreateData.doctorId && !quickCreateData.labNurseId) {
            setError('Vui lòng chọn bác sĩ hoặc y tá');
            return;
        }

        if (quickCreateData.selectedDays.length === 0) {
            setError('Vui lòng chọn ít nhất một ngày');
            return;
        }

        if (quickCreateData.shifts.length === 0) {
            setError('Vui lòng thêm ít nhất một ca');
            return;
        }

        setCreating(true);
        setError('');

        try {
            const schedulesToCreate: any[] = [];

            quickCreateData.selectedDays.forEach((day) => {
                quickCreateData.shifts.forEach((shift) => {
                    const scheduleData: any = {
                        dayOfWeek: day,
                        shiftStart: shift.start,
                        shiftEnd: shift.end,
                        note: shift.note,
                    };

                    if (quickCreateData.doctorId) {
                        scheduleData.doctorId = quickCreateData.doctorId;
                    } else {
                        scheduleData.labNurseId = quickCreateData.labNurseId;
                    }

                    schedulesToCreate.push(scheduleData);
                });
            });

            // Create all schedules in parallel
            await Promise.all(
                schedulesToCreate.map((schedule) => workScheduleService.createWorkSchedule(schedule))
            );

            setIsQuickCreateOpen(false);
            const createdPersonId = quickCreateData.doctorId || quickCreateData.labNurseId;
            const createdPersonType = quickCreateData.doctorId ? 'doctor' : 'nurse';
            const createdPersonName =
                createdPersonType === 'doctor'
                    ? doctors.find((d) => d._id === createdPersonId)?.fullName || ''
                    : nurses.find((n) => n._id === createdPersonId)?.fullName || '';

            setQuickCreateData({
                doctorId: '',
                labNurseId: '',
                selectedDays: [],
                shifts: [
                    { start: '08:00', end: '12:00', note: 'Ca sáng' },
                    { start: '13:00', end: '17:00', note: 'Ca chiều' },
                ],
            });

            // Reload schedules if viewing the person's schedule
            if (selectedPerson && selectedPerson.id === createdPersonId) {
                loadPersonSchedules(createdPersonId, createdPersonType);
            } else {
                // Auto-select the person whose schedule was created
                handleSelectPerson(createdPersonId, createdPersonName, createdPersonType);
            }

            alert(`Đã tạo thành công ${schedulesToCreate.length} ca làm việc!`);
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tạo lịch');
        } finally {
            setCreating(false);
        }
    };

    const toggleDay = (day: number) => {
        setQuickCreateData((prev) => ({
            ...prev,
            selectedDays: prev.selectedDays.includes(day)
                ? prev.selectedDays.filter((d) => d !== day)
                : [...prev.selectedDays, day],
        }));
    };

    const addShift = () => {
        setQuickCreateData((prev) => ({
            ...prev,
            shifts: [...prev.shifts, { start: '08:00', end: '12:00', note: '' }],
        }));
    };

    const removeShift = (index: number) => {
        setQuickCreateData((prev) => ({
            ...prev,
            shifts: prev.shifts.filter((_, i) => i !== index),
        }));
    };

    const updateShift = (index: number, field: 'start' | 'end' | 'note', value: string) => {
        setQuickCreateData((prev) => ({
            ...prev,
            shifts: prev.shifts.map((shift, i) => (i === index ? { ...shift, [field]: value } : shift)),
        }));
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) {
            return;
        }

        try {
            await workScheduleService.deleteWorkSchedule(id);
            if (selectedPerson) {
                loadPersonSchedules(selectedPerson.id, selectedPerson.type);
            }
        } catch (err: any) {
            alert(err.message || 'Có lỗi xảy ra khi xóa');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
            // Clear the other field when one is selected
            ...(name === 'doctorId' && value ? { labNurseId: '' } : {}),
            ...(name === 'labNurseId' && value ? { doctorId: '' } : {}),
        }));
    };

    if (authLoading || loading) {
        return (
            <DashboardLayout navItems={navItems} title="Quản lý lịch làm việc">
                <div className={styles.loading}>Đang tải...</div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems} title="Quản lý lịch làm việc">
            <div className={styles.header}>
                <div className={styles.headerButtons}>
                    <Button
                        variant="outline"
                        onClick={() => setIsQuickCreateOpen(true)}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                <polyline points="17 6 23 6 23 12" />
                            </svg>
                        }
                    >
                        Tạo nhanh
                    </Button>
                    <Button
                        onClick={() => handleOpenModal()}
                        icon={
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                        }
                    >
                        Tạo lịch đơn lẻ
                    </Button>
                </div>
            </div>

            <div className={styles.contentGrid}>
                {/* Danh sách bác sĩ và y tá */}
                <Card className={styles.personListCard}>
                    <CardHeader>
                        <CardTitle>Danh sách nhân viên</CardTitle>
                    </CardHeader>
                    <CardBody>
                        <div className={styles.personList}>
                            <div className={styles.personSection}>
                                <h3 className={styles.sectionTitle}>Bác sĩ</h3>
                                {doctors.length === 0 ? (
                                    <div className={styles.empty}>Chưa có bác sĩ</div>
                                ) : (
                                    doctors.map((doctor) => (
                                        <button
                                            key={doctor._id}
                                            className={`${styles.personItem} ${
                                                selectedPerson?.id === doctor._id && selectedPerson?.type === 'doctor'
                                                    ? styles.personItemActive
                                                    : ''
                                            }`}
                                            onClick={() => handleSelectPerson(doctor._id, doctor.fullName, 'doctor')}
                                        >
                                            <div className={styles.personInfo}>
                                                <div className={styles.personName}>{doctor.fullName}</div>
                                                <div className={styles.personMeta}>{doctor.specialty}</div>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    ))
                                )}
                            </div>

                            <div className={styles.personSection}>
                                <h3 className={styles.sectionTitle}>Y tá xét nghiệm</h3>
                                {nurses.length === 0 ? (
                                    <div className={styles.empty}>Chưa có y tá</div>
                                ) : (
                                    nurses.map((nurse) => (
                                        <button
                                            key={nurse._id}
                                            className={`${styles.personItem} ${
                                                selectedPerson?.id === nurse._id && selectedPerson?.type === 'nurse'
                                                    ? styles.personItemActive
                                                    : ''
                                            }`}
                                            onClick={() => handleSelectPerson(nurse._id, nurse.fullName, 'nurse')}
                                        >
                                            <div className={styles.personInfo}>
                                                <div className={styles.personName}>{nurse.fullName}</div>
                                            </div>
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6" />
                                            </svg>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Lịch làm việc của người được chọn */}
                <Card className={styles.scheduleCard}>
                    <CardHeader>
                        <CardTitle>
                            {selectedPerson
                                ? `Lịch làm việc - ${selectedPerson.name}`
                                : 'Chọn nhân viên để xem lịch làm việc'}
                        </CardTitle>
                    </CardHeader>
                    <CardBody>
                        {!selectedPerson ? (
                            <div className={styles.empty}>Vui lòng chọn một bác sĩ hoặc y tá để xem lịch làm việc</div>
                        ) : loading ? (
                            <div className={styles.loading}>Đang tải...</div>
                        ) : schedules.length === 0 ? (
                            <div className={styles.empty}>Chưa có lịch làm việc</div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Thứ</TableHead>
                                        <TableHead>Giờ bắt đầu</TableHead>
                                        <TableHead>Giờ kết thúc</TableHead>
                                        <TableHead>Ghi chú</TableHead>
                                        <TableHead>Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {schedules.map((schedule) => (
                                        <TableRow key={schedule._id}>
                                            <TableCell>
                                                {DAY_LABELS[schedule.dayOfWeek as keyof typeof DAY_LABELS]}
                                            </TableCell>
                                            <TableCell>{schedule.shiftStart}</TableCell>
                                            <TableCell>{schedule.shiftEnd}</TableCell>
                                            <TableCell>{schedule.note || '-'}</TableCell>
                                            <TableCell>
                                                <div className={styles.actions}>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleOpenModal(schedule)}
                                                    >
                                                        Sửa
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDelete(schedule._id)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardBody>
                </Card>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingSchedule ? 'Cập nhật lịch làm việc' : 'Tạo lịch làm việc mới'}
                size="md"
                footer={
                    <>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editingSchedule ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </>
                }
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    {error && (
                        <div className={styles.error}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className={styles.roleSelection}>
                        <Select
                            label="Chọn bác sĩ"
                            name="doctorId"
                            options={[
                                { value: '', label: 'Chọn bác sĩ' },
                                ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
                            ]}
                            value={formData.doctorId}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!formData.labNurseId}
                        />
                        <div className={styles.divider}>hoặc</div>
                        <Select
                            label="Chọn y tá"
                            name="labNurseId"
                            options={[
                                { value: '', label: 'Chọn y tá' },
                                ...nurses.map((n) => ({ value: n._id, label: n.fullName })),
                            ]}
                            value={formData.labNurseId}
                            onChange={handleChange}
                            fullWidth
                            disabled={!!formData.doctorId}
                        />
                    </div>

                    <Select
                        label="Thứ trong tuần"
                        name="dayOfWeek"
                        options={DAYS_OF_WEEK.map((day) => ({ value: day.value.toString(), label: day.label }))}
                        value={formData.dayOfWeek}
                        onChange={handleChange}
                        required
                        fullWidth
                    />

                    <div className={styles.timeRow}>
                        <Input
                            label="Giờ bắt đầu"
                            name="shiftStart"
                            type="time"
                            value={formData.shiftStart}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <Input
                            label="Giờ kết thúc"
                            name="shiftEnd"
                            type="time"
                            value={formData.shiftEnd}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                    </div>

                    <Input
                        label="Ghi chú (tùy chọn)"
                        name="note"
                        type="text"
                        placeholder="Ví dụ: Ca sáng, Ca chiều..."
                        value={formData.note}
                        onChange={handleChange}
                        fullWidth
                    />
                </form>
            </Modal>

            {/* Quick Create Modal */}
            <Modal
                isOpen={isQuickCreateOpen}
                onClose={() => {
                    setIsQuickCreateOpen(false);
                    setQuickCreateData({
                        doctorId: '',
                        labNurseId: '',
                        selectedDays: [],
                        shifts: [
                            { start: '08:00', end: '12:00', note: 'Ca sáng' },
                            { start: '13:00', end: '17:00', note: 'Ca chiều' },
                        ],
                    });
                    setError('');
                }}
                title="Tạo lịch làm việc nhanh"
                size="lg"
                footer={
                    <>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsQuickCreateOpen(false);
                                setQuickCreateData({
                                    doctorId: '',
                                    labNurseId: '',
                                    selectedDays: [],
                                    shifts: [
                                        { start: '08:00', end: '12:00', note: 'Ca sáng' },
                                        { start: '13:00', end: '17:00', note: 'Ca chiều' },
                                    ],
                                });
                                setError('');
                            }}
                        >
                            Hủy
                        </Button>
                        <Button onClick={handleQuickCreate} loading={creating}>
                            Tạo {quickCreateData.selectedDays.length * quickCreateData.shifts.length} ca
                        </Button>
                    </>
                }
            >
                <div className={styles.quickCreateForm}>
                    {error && (
                        <div className={styles.error}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="12" />
                                <line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className={styles.roleSelection}>
                        <Select
                            label="Chọn bác sĩ"
                            name="doctorId"
                            options={[
                                { value: '', label: 'Chọn bác sĩ' },
                                ...doctors.map((d) => ({ value: d._id, label: d.fullName })),
                            ]}
                            value={quickCreateData.doctorId}
                            onChange={(e) =>
                                setQuickCreateData((prev) => ({
                                    ...prev,
                                    doctorId: e.target.value,
                                    labNurseId: e.target.value ? '' : prev.labNurseId,
                                }))
                            }
                            fullWidth
                            disabled={!!quickCreateData.labNurseId}
                        />
                        <div className={styles.divider}>hoặc</div>
                        <Select
                            label="Chọn y tá"
                            name="labNurseId"
                            options={[
                                { value: '', label: 'Chọn y tá' },
                                ...nurses.map((n) => ({ value: n._id, label: n.fullName })),
                            ]}
                            value={quickCreateData.labNurseId}
                            onChange={(e) =>
                                setQuickCreateData((prev) => ({
                                    ...prev,
                                    labNurseId: e.target.value,
                                    doctorId: e.target.value ? '' : prev.doctorId,
                                }))
                            }
                            fullWidth
                            disabled={!!quickCreateData.doctorId}
                        />
                    </div>

                    <div>
                        <label className={styles.label}>Chọn các ngày trong tuần</label>
                        <div className={styles.daysGrid}>
                            {DAYS_OF_WEEK.map((day) => (
                                <button
                                    key={day.value}
                                    type="button"
                                    className={`${styles.dayButton} ${
                                        quickCreateData.selectedDays.includes(day.value) ? styles.dayButtonActive : ''
                                    }`}
                                    onClick={() => toggleDay(day.value)}
                                >
                                    {day.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className={styles.shiftsHeader}>
                            <label className={styles.label}>Các ca làm việc</label>
                            <Button variant="outline" size="sm" onClick={addShift}>
                                + Thêm ca
                            </Button>
                        </div>
                        <div className={styles.shiftsList}>
                            {quickCreateData.shifts.map((shift, index) => (
                                <div key={index} className={styles.shiftItem}>
                                    <Input
                                        label="Giờ bắt đầu"
                                        type="time"
                                        value={shift.start}
                                        onChange={(e) => updateShift(index, 'start', e.target.value)}
                                        fullWidth
                                    />
                                    <Input
                                        label="Giờ kết thúc"
                                        type="time"
                                        value={shift.end}
                                        onChange={(e) => updateShift(index, 'end', e.target.value)}
                                        fullWidth
                                    />
                                    <Input
                                        label="Ghi chú"
                                        type="text"
                                        placeholder="Ca sáng, Ca chiều..."
                                        value={shift.note}
                                        onChange={(e) => updateShift(index, 'note', e.target.value)}
                                        fullWidth
                                    />
                                    {quickCreateData.shifts.length > 1 && (
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => removeShift(index)}
                                            icon={
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            }
                                        >
                                            Xóa
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={styles.preview}>
                        <strong>Xem trước:</strong> Sẽ tạo{' '}
                        <strong>{quickCreateData.selectedDays.length * quickCreateData.shifts.length}</strong> ca làm việc
                        <br />
                        ({quickCreateData.selectedDays.length} ngày × {quickCreateData.shifts.length} ca)
                    </div>
                </div>
            </Modal>
        </DashboardLayout>
    );
}

