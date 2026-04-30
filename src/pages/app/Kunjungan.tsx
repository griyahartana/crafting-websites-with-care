import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { format, parseISO, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Edit3,
  Loader2,
  MapPin,
  Stethoscope,
  Trash2,
  UserRound,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiFetch, Appointment as ApiAppointment, Customer, getStoredUser, Midwife } from "@/lib/api";
import { cn } from "@/lib/utils";

const today = startOfDay(new Date());

const services = [
  { value: "anc", label: "Kunjungan ANC", duration: "30 menit", mode: "Klinik" as const },
  { value: "usg", label: "USG Rutin Trimester 2", duration: "45 menit", mode: "Klinik" as const },
  { value: "laktasi", label: "Konsultasi Laktasi", duration: "30 menit", mode: "Online" as const },
  { value: "kelas", label: "Kelas Ibu Hamil", duration: "60 menit", mode: "Online" as const },
];

const timeSlots = ["08:00", "09:30", "10:30", "13:00", "14:30", "16:00", "18:30"];
const statuses: ApiAppointment["status"][] = ["Akan datang", "Selesai", "Dibatalkan"];
const statusLabel = (status: ApiAppointment["status"]) => (status === "Selesai" ? "Sudah ditangani" : status);

const formatDate = (date: string) => format(parseISO(date), "d MMMM yyyy", { locale: localeId });
const formatShortDate = (date: string) => format(parseISO(date), "EEE, d MMM", { locale: localeId });

const Kunjungan = () => {
  const user = useMemo(() => getStoredUser(), []);
  const canManage = user?.role === "admin" || user?.role === "midwife";
  const [appointments, setAppointments] = useState<ApiAppointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [midwives, setMidwives] = useState<Midwife[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [selectedTime, setSelectedTime] = useState("09:30");
  const [selectedService, setSelectedService] = useState(services[0].value);
  const [selectedMidwifeId, setSelectedMidwifeId] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<ApiAppointment["status"]>("Akan datang");
  const [notes, setNotes] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<ApiAppointment | null>(null);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastSaved, setLastSaved] = useState<ApiAppointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const service = services.find((item) => item.value === selectedService) ?? services[0];
  const midwife = midwives.find((item) => String(item.id) === selectedMidwifeId) ?? midwives[0];
  const selectedPlace = service.mode === "Online" ? "Online via Video Call" : midwife?.clinic ?? "Klinik Bidan Titik";

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setMessage("");
    try {
      const [appointmentData, midwifeData, customerData] = await Promise.all([
        apiFetch<{ appointments: ApiAppointment[] }>("/api/appointments"),
        apiFetch<{ midwives: Midwife[] }>("/api/midwives"),
        canManage ? apiFetch<{ customers: Customer[] }>("/api/customers") : Promise.resolve({ customers: [] }),
      ]);
      setAppointments(appointmentData.appointments);
      setMidwives(midwifeData.midwives);
      setCustomers(customerData.customers);
      if (!selectedMidwifeId && midwifeData.midwives[0]) setSelectedMidwifeId(String(midwifeData.midwives[0].id));
      if (!selectedCustomerId && customerData.customers[0]) setSelectedCustomerId(String(customerData.customers[0].id));
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Data kunjungan gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, [canManage, selectedCustomerId, selectedMidwifeId, user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((item) => item.status === "Akan datang")
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [appointments],
  );

  const historyAppointments = useMemo(
    () =>
      appointments
        .filter((item) => item.status !== "Akan datang")
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`)),
    [appointments],
  );

  const bookedTimes = useMemo(() => {
    if (!selectedDate) return [];
    const selected = format(selectedDate, "yyyy-MM-dd");
    return appointments
      .filter((item) => item.status === "Akan datang" && item.date === selected && item.id !== editingAppointment?.id)
      .map((item) => item.time);
  }, [appointments, editingAppointment?.id, selectedDate]);

  const nextAppointment = upcomingAppointments[0];
  const isSelectedTimeBooked = bookedTimes.includes(selectedTime);

  const resetForm = () => {
    setEditingAppointment(null);
    setSelectedDate(today);
    setSelectedTime("09:30");
    setSelectedService(services[0].value);
    setSelectedStatus("Akan datang");
    setNotes("");
    if (midwives[0]) setSelectedMidwifeId(String(midwives[0].id));
    if (customers[0]) setSelectedCustomerId(String(customers[0].id));
  };

  const openCreateDialog = () => {
    resetForm();
    setIsSchedulerOpen(true);
  };

  const openEditDialog = (item: ApiAppointment) => {
    const matchingService = services.find((serviceItem) => serviceItem.label === item.title) ?? services[0];
    setEditingAppointment(item);
    setSelectedDate(parseISO(item.date));
    setSelectedTime(item.time);
    setSelectedService(matchingService.value);
    setSelectedMidwifeId(String(item.midwife_id));
    setSelectedCustomerId(String(item.customer_id));
    setSelectedStatus(item.status);
    setNotes(item.notes ?? "");
    setIsSchedulerOpen(true);
  };

  const saveAppointment = async () => {
    if (!selectedDate || isSelectedTimeBooked || !midwife) return;
    if (canManage && !selectedCustomerId) {
      setMessage("Pilih customer terlebih dahulu");
      return;
    }

    setSaving(true);
    setMessage("");
    const payload = {
      customerId: canManage ? Number(selectedCustomerId) : undefined,
      midwifeId: Number(selectedMidwifeId || midwife.id),
      title: service.label,
      date: format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime,
      place: selectedPlace,
      mode: service.mode,
      status: canManage ? selectedStatus : "Akan datang",
      notes,
    };

    try {
      const saved = editingAppointment
        ? await apiFetch<{ appointment: ApiAppointment }>(`/api/appointments/${editingAppointment.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          })
        : await apiFetch<{ appointment: ApiAppointment }>("/api/appointments", {
            method: "POST",
            body: JSON.stringify(payload),
          });
      setLastSaved(saved.appointment);
      setIsSchedulerOpen(false);
      setIsSuccessOpen(true);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Janji kunjungan gagal disimpan");
    } finally {
      setSaving(false);
    }
  };

  const deleteAppointment = async (item: ApiAppointment) => {
    const approved = window.confirm(`Hapus janji ${item.customer_name} untuk ${item.title}?`);
    if (!approved) return;
    setLoading(true);
    setActionLoadingId(item.id);
    setMessage("");
    try {
      await apiFetch(`/api/appointments/${item.id}`, { method: "DELETE" });
      await loadData();
      setMessage("Janji kunjungan berhasil dihapus.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Janji kunjungan gagal dihapus");
    } finally {
      setLoading(false);
      setActionLoadingId(null);
    }
  };

  const markAppointmentHandled = async (item: ApiAppointment) => {
    if (item.status === "Selesai") return;
    setActionLoadingId(item.id);
    setMessage("");
    try {
      await apiFetch<{ appointment: ApiAppointment }>(`/api/appointments/${item.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          customerId: item.customer_id,
          midwifeId: item.midwife_id,
          title: item.title,
          date: item.date,
          time: item.time,
          place: item.place,
          mode: item.mode,
          status: "Selesai",
          notes: item.notes ?? "",
        }),
      });
      await loadData();
      setMessage(`Janji ${item.customer_name} sudah ditandai Sudah ditangani.`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Status janji gagal diperbarui");
    } finally {
      setActionLoadingId(null);
    }
  };

  if (!user) {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <CalendarCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-display text-xl font-bold">Login untuk melihat janji</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk sebagai customer, bidan, atau admin untuk mengelola kunjungan.</p>
          <Button asChild className="mt-4 h-11 w-full rounded-full">
            <Link to="/login">Masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-x space-y-4 pb-6 pt-5">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight">{canManage ? "Kelola Janji" : "Janji Kunjungan"}</h1>
          <p className="text-xs text-muted-foreground">
            {canManage ? "Lihat nama customer dan atur jadwal kunjungan" : "Buat dan pantau jadwal bersama bidan"}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-foreground/80">Jadwal berikutnya</p>
            <p className="mt-1 font-display text-2xl font-bold leading-tight">
              {nextAppointment ? formatShortDate(nextAppointment.date) : "Belum ada janji"}
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              {nextAppointment
                ? `${nextAppointment.customer_name} • ${nextAppointment.title} • ${nextAppointment.time}`
                : canManage
                  ? "Belum ada customer yang membuat janji kunjungan."
                  : "Buat janji pertama dengan Bidan Titik."}
            </p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card/80">
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-primary" /> : <CalendarCheck className="h-5 w-5 text-primary" />}
          </div>
        </div>
        <Button className="mt-4 h-12 w-full rounded-2xl shadow-soft" onClick={openCreateDialog}>
          <CalendarPlus className="h-4 w-4" /> {canManage ? "Tambah Janji Customer" : "Buat Janji Baru"}
        </Button>
      </div>

      {message && <p className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{message}</p>}

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">{upcomingAppointments.length}</p>
          <p className="text-[11px] text-muted-foreground">Mendatang</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">{historyAppointments.length}</p>
          <p className="text-[11px] text-muted-foreground">Ditangani/Batal</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">{canManage ? customers.length : "7"}</p>
          <p className="text-[11px] text-muted-foreground">{canManage ? "Customer" : "Slot/hari"}</p>
        </div>
      </div>

      <AppointmentSection
        title="Jadwal Mendatang"
        countLabel={`${upcomingAppointments.length} janji`}
        items={upcomingAppointments}
        canManage={canManage}
        actionLoadingId={actionLoadingId}
        onEdit={openEditDialog}
        onDelete={deleteAppointment}
        onMarkHandled={markAppointmentHandled}
      />

      <AppointmentSection
        title="Riwayat Kunjungan"
        countLabel={`${historyAppointments.length} riwayat`}
        items={historyAppointments}
        canManage={canManage}
        actionLoadingId={actionLoadingId}
        onEdit={openEditDialog}
        onDelete={deleteAppointment}
        onMarkHandled={markAppointmentHandled}
      />

      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="bottom-2 left-2 right-2 top-auto flex max-h-[calc(100dvh-1rem)] w-auto max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-[2rem] border-0 p-0 sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="shrink-0 bg-background/95 p-5 pb-3 backdrop-blur">
            <DialogHeader className="pr-7 text-left">
              <DialogTitle className="font-display text-2xl">{editingAppointment ? "Edit Janji Kunjungan" : "Buat Janji Kunjungan"}</DialogTitle>
              <DialogDescription>
                {canManage ? "Pilih customer, layanan, tanggal, dan status kunjungan." : "Pilih tanggal, layanan, dan slot jam yang masih tersedia."}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            {canManage && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" /> Customer
                </label>
                <Select value={selectedCustomerId} onValueChange={setSelectedCustomerId}>
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-muted/60">
                    <SelectValue placeholder="Pilih customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.name} • {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="rounded-3xl bg-card p-2 shadow-card">
              <Calendar
                mode="single"
                selected={selectedDate}
                defaultMonth={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                disabled={{ before: today }}
                locale={localeId}
                className="mx-auto w-fit"
                classNames={{
                  caption_label: "text-sm font-bold",
                  head_cell: "text-muted-foreground rounded-md w-8 min-[370px]:w-9 font-normal text-[0.75rem]",
                  cell: "h-8 w-8 min-[370px]:h-9 min-[370px]:w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:rounded-md",
                  day: "h-8 w-8 min-[370px]:h-9 min-[370px]:w-9 p-0 font-normal aria-selected:opacity-100",
                  day_today: "bg-secondary text-secondary-foreground",
                  day_selected:
                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                }}
              />
            </div>

            <div className="grid gap-3">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <Stethoscope className="h-3.5 w-3.5" /> Layanan
                </label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-muted/60">
                    <SelectValue placeholder="Pilih layanan" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label} • {item.duration}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <UserRound className="h-3.5 w-3.5" /> Bidan
                </label>
                <Select value={selectedMidwifeId} onValueChange={setSelectedMidwifeId}>
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-muted/60">
                    <SelectValue placeholder="Pilih bidan" />
                  </SelectTrigger>
                  <SelectContent>
                    {midwives.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {canManage && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground">Status</label>
                  <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ApiAppointment["status"])}>
                    <SelectTrigger className="h-12 rounded-2xl border-border bg-muted/60">
                      <SelectValue placeholder="Pilih status" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabel(status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground">Slot Jam</p>
                {bookedTimes.length > 0 && <p className="text-[11px] text-muted-foreground">Ada slot terpakai</p>}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const booked = bookedTimes.includes(slot);
                  const active = selectedTime === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked}
                      onClick={() => setSelectedTime(slot)}
                      className={cn(
                        "h-10 rounded-2xl text-sm font-semibold transition-smooth",
                        active && !booked
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "bg-muted text-foreground hover:bg-secondary",
                        booked && "cursor-not-allowed bg-muted/50 text-muted-foreground line-through opacity-60",
                      )}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Catatan tambahan untuk kunjungan..."
              className="min-h-24 w-full resize-none rounded-2xl bg-muted/60 p-4 text-sm outline-none ring-primary/30 focus:ring-2"
            />

            <div className="rounded-2xl bg-muted/60 p-3">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                {service.mode === "Online" ? (
                  <Video className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <p>
                  {service.label} bersama {midwife?.name ?? "Bidan Titik"} di {selectedPlace}. Estimasi durasi {service.duration}.
                </p>
              </div>
            </div>
          </div>

          <div className="safe-bottom shrink-0 border-t border-border bg-background/95 px-5 pt-3 backdrop-blur">
            <Button
              className="h-12 w-full rounded-2xl shadow-soft"
              disabled={!selectedDate || isSelectedTimeBooked || saving || (canManage && !selectedCustomerId)}
              onClick={saveAppointment}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarPlus className="h-4 w-4" />}
              {editingAppointment ? "Simpan Perubahan" : "Buat Janji Kunjungan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="bottom-4 left-4 right-4 top-auto w-auto max-w-none translate-x-0 translate-y-0 rounded-3xl border-0 p-5 sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-sm sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary/10">
            <CheckCircle2 className="h-7 w-7 text-primary" />
          </div>
          <DialogHeader className="text-center">
            <DialogTitle className="font-display text-2xl">Janji berhasil disimpan</DialogTitle>
            <DialogDescription>Jadwal kunjungan sudah tersimpan dan bisa dilihat oleh customer, bidan, dan admin.</DialogDescription>
          </DialogHeader>
          {lastSaved && (
            <div className="rounded-2xl bg-muted/70 p-4 text-sm">
              <p className="font-bold">{lastSaved.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">Customer: {lastSaved.customer_name}</p>
              <p className="mt-2 text-muted-foreground">
                {formatDate(lastSaved.date)} • {lastSaved.time}
              </p>
              <p className="mt-1 text-muted-foreground">{lastSaved.place}</p>
            </div>
          )}
          <Button className="h-11 rounded-2xl" onClick={() => setIsSuccessOpen(false)}>
            Oke, saya mengerti
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const AppointmentSection = ({
  title,
  countLabel,
  items,
  canManage,
  actionLoadingId,
  onEdit,
  onDelete,
  onMarkHandled,
}: {
  title: string;
  countLabel: string;
  items: ApiAppointment[];
  canManage: boolean;
  actionLoadingId: number | null;
  onEdit: (item: ApiAppointment) => void;
  onDelete: (item: ApiAppointment) => void;
  onMarkHandled: (item: ApiAppointment) => void;
}) => (
  <section>
    <div className="mb-3 flex items-center justify-between">
      <h2 className="font-bold text-base">{title}</h2>
      <span className="text-xs font-semibold text-primary">{countLabel}</span>
    </div>
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">Belum ada janji di bagian ini.</p>}
      {items.map((item) => (
        <AppointmentCard
          key={item.id}
          item={item}
          canManage={canManage}
          isActionLoading={actionLoadingId === item.id}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkHandled={onMarkHandled}
        />
      ))}
    </div>
  </section>
);

const AppointmentCard = ({
  item,
  canManage,
  isActionLoading,
  onEdit,
  onDelete,
  onMarkHandled,
}: {
  item: ApiAppointment;
  canManage: boolean;
  isActionLoading: boolean;
  onEdit: (item: ApiAppointment) => void;
  onDelete: (item: ApiAppointment) => void;
  onMarkHandled: (item: ApiAppointment) => void;
}) => (
  <div className="rounded-2xl bg-card p-4 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-snug">{item.title}</p>
        {canManage && <p className="mt-1 text-xs font-semibold text-primary">{item.customer_name}</p>}
        <p className="mt-1 text-[11px] text-muted-foreground">{item.midwife_name}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          item.status === "Akan datang"
            ? "bg-secondary text-secondary-foreground"
            : item.status === "Selesai"
              ? "bg-primary/10 text-primary"
              : "bg-destructive/10 text-destructive",
        )}
      >
        {statusLabel(item.status)}
      </span>
    </div>
    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 shrink-0" />
        <span>
          {formatDate(item.date)} • {item.time}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {item.mode === "Online" ? (
          <Video className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <MapPin className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>{item.place}</span>
      </div>
      {item.notes && <p className="pt-1 leading-relaxed">{item.notes}</p>}
    </div>
    {canManage && (
      <div className="mt-3 space-y-2">
        {item.status === "Akan datang" && (
          <Button type="button" className="h-10 w-full rounded-full text-xs" disabled={isActionLoading} onClick={() => onMarkHandled(item)}>
            {isActionLoading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />}
            Sudah ditangani
          </Button>
        )}
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="secondary" className="h-9 rounded-full text-xs" disabled={isActionLoading} onClick={() => onEdit(item)}>
            <Edit3 className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Button type="button" variant="destructive" className="h-9 rounded-full text-xs" disabled={isActionLoading} onClick={() => onDelete(item)}>
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      </div>
    )}
  </div>
);

export default Kunjungan;
