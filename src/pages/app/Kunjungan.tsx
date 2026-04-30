import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, format, isSameDay, startOfDay } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
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
import { cn } from "@/lib/utils";

type Appointment = {
  id: number;
  title: string;
  date: Date;
  time: string;
  place: string;
  midwife: string;
  status: "Akan datang" | "Selesai";
  mode: "Klinik" | "Online";
};

const today = startOfDay(new Date());

const services = [
  { value: "anc", label: "Kunjungan ANC", duration: "30 menit", mode: "Klinik" as const },
  { value: "usg", label: "USG Rutin Trimester 2", duration: "45 menit", mode: "Klinik" as const },
  { value: "laktasi", label: "Konsultasi Laktasi", duration: "30 menit", mode: "Online" as const },
  { value: "kelas", label: "Kelas Ibu Hamil", duration: "60 menit", mode: "Online" as const },
];

const midwives = [
  { value: "rina", label: "Bidan Rina Amelia, S.ST", place: "Klinik Bidan Rina" },
  { value: "dwi", label: "Bidan Dwi Lestari, S.ST", place: "Klinik Keluarga Sehat" },
  { value: "siti", label: "Bidan Siti Nurhayati, S.ST", place: "Klinik Ibu & Anak Siti" },
];

const timeSlots = ["08:00", "09:30", "10:30", "13:00", "14:30", "16:00", "18:30"];

const initialAppointments: Appointment[] = [
  {
    id: 1,
    title: "USG Rutin Trimester 2",
    date: addDays(today, 25),
    time: "10:00",
    place: "Klinik Bidan Rina",
    midwife: "Bidan Rina Amelia, S.ST",
    status: "Akan datang",
    mode: "Klinik",
  },
  {
    id: 2,
    title: "Kunjungan ANC",
    date: addDays(today, 39),
    time: "09:30",
    place: "Klinik Bidan Rina",
    midwife: "Bidan Rina Amelia, S.ST",
    status: "Akan datang",
    mode: "Klinik",
  },
  {
    id: 3,
    title: "Kelas Ibu Hamil",
    date: addDays(today, -12),
    time: "16:00",
    place: "Online via Video Call",
    midwife: "Bidan Dwi Lestari, S.ST",
    status: "Selesai",
    mode: "Online",
  },
];

const formatDate = (date: Date) => format(date, "d MMMM yyyy", { locale: localeId });
const formatShortDate = (date: Date) => format(date, "EEE, d MMM", { locale: localeId });

const Kunjungan = () => {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(today, 3));
  const [selectedTime, setSelectedTime] = useState("09:30");
  const [selectedService, setSelectedService] = useState(services[0].value);
  const [selectedMidwife, setSelectedMidwife] = useState(midwives[0].value);
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastCreated, setLastCreated] = useState<Appointment | null>(null);

  const service = services.find((item) => item.value === selectedService) ?? services[0];
  const midwife = midwives.find((item) => item.value === selectedMidwife) ?? midwives[0];

  const upcomingAppointments = useMemo(
    () =>
      appointments
        .filter((item) => item.status === "Akan datang")
        .sort((a, b) => a.date.getTime() - b.date.getTime()),
    [appointments],
  );

  const historyAppointments = useMemo(
    () =>
      appointments
        .filter((item) => item.status === "Selesai")
        .sort((a, b) => b.date.getTime() - a.date.getTime()),
    [appointments],
  );

  const bookedTimes = useMemo(() => {
    if (!selectedDate) return [];
    return appointments
      .filter((item) => item.status === "Akan datang" && isSameDay(item.date, selectedDate))
      .map((item) => item.time);
  }, [appointments, selectedDate]);

  const nextAppointment = upcomingAppointments[0];
  const selectedPlace = service.mode === "Online" ? "Online via Video Call" : midwife.place;
  const isSelectedTimeBooked = bookedTimes.includes(selectedTime);

  const createAppointment = () => {
    if (!selectedDate || isSelectedTimeBooked) return;

    const newAppointment: Appointment = {
      id: Date.now(),
      title: service.label,
      date: selectedDate,
      time: selectedTime,
      place: selectedPlace,
      midwife: midwife.label,
      status: "Akan datang",
      mode: service.mode,
    };

    setAppointments((current) => [newAppointment, ...current]);
    setLastCreated(newAppointment);
    setIsSchedulerOpen(false);
    setIsSuccessOpen(true);
  };

  return (
    <div className="safe-x space-y-4 pb-6 pt-5">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight">Janji Kunjungan</h1>
          <p className="text-xs text-muted-foreground">Kelola jadwal tanpa ribet</p>
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
                ? `${nextAppointment.title} • ${nextAppointment.time}`
                : "Buat janji pertama dengan bidan pilihan ibu."}
            </p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card/80">
            <CalendarCheck className="h-5 w-5 text-primary" />
          </div>
        </div>
        <Button className="mt-4 h-12 w-full rounded-2xl shadow-soft" onClick={() => setIsSchedulerOpen(true)}>
          <CalendarPlus className="h-4 w-4" /> Buat Janji Baru
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">{upcomingAppointments.length}</p>
          <p className="text-[11px] text-muted-foreground">Mendatang</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">{historyAppointments.length}</p>
          <p className="text-[11px] text-muted-foreground">Selesai</p>
        </div>
        <div className="rounded-2xl bg-card p-3 text-center shadow-card">
          <p className="font-display text-xl font-bold">7</p>
          <p className="text-[11px] text-muted-foreground">Slot/hari</p>
        </div>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-base">Jadwal Mendatang</h2>
          <span className="text-xs font-semibold text-primary">{upcomingAppointments.length} janji</span>
        </div>
        <div className="space-y-3">
          {upcomingAppointments.map((item) => (
            <AppointmentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-base">Riwayat Kunjungan</h2>
          <span className="text-xs font-semibold text-muted-foreground">{historyAppointments.length} selesai</span>
        </div>
        <div className="space-y-3">
          {historyAppointments.map((item) => (
            <AppointmentCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <Dialog open={isSchedulerOpen} onOpenChange={setIsSchedulerOpen}>
        <DialogContent className="bottom-2 left-2 right-2 top-auto flex max-h-[calc(100dvh-1rem)] w-auto max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-[2rem] border-0 p-0 sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="shrink-0 bg-background/95 p-5 pb-3 backdrop-blur">
            <DialogHeader className="pr-7 text-left">
              <DialogTitle className="font-display text-2xl">Buat Janji Kunjungan</DialogTitle>
              <DialogDescription>Pilih tanggal, layanan, bidan, dan slot jam yang masih tersedia.</DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            <div className="rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-4">
              <p className="text-sm font-medium text-secondary-foreground/80">Pilihan saat ini</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-2xl bg-card/70 p-3">
                  <p className="text-muted-foreground">Tanggal</p>
                  <p className="mt-1 font-bold">{selectedDate ? formatShortDate(selectedDate) : "Pilih"}</p>
                </div>
                <div className="rounded-2xl bg-card/70 p-3">
                  <p className="text-muted-foreground">Jam</p>
                  <p className="mt-1 font-bold">{selectedTime}</p>
                </div>
              </div>
            </div>

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
                <Select value={selectedMidwife} onValueChange={setSelectedMidwife}>
                  <SelectTrigger className="h-12 rounded-2xl border-border bg-muted/60">
                    <SelectValue placeholder="Pilih bidan" />
                  </SelectTrigger>
                  <SelectContent>
                    {midwives.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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

            <div className="rounded-2xl bg-muted/60 p-3">
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                {service.mode === "Online" ? (
                  <Video className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                ) : (
                  <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                )}
                <p>
                  {service.label} bersama {midwife.label} di {selectedPlace}. Estimasi durasi {service.duration}.
                </p>
              </div>
            </div>
          </div>

          <div className="safe-bottom shrink-0 border-t border-border bg-background/95 px-5 pt-3 backdrop-blur">
            <Button
              className="h-12 w-full rounded-2xl shadow-soft"
              disabled={!selectedDate || isSelectedTimeBooked}
              onClick={createAppointment}
            >
              <CalendarPlus className="h-4 w-4" /> Buat Janji Kunjungan
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
            <DialogTitle className="font-display text-2xl">Janji berhasil dibuat</DialogTitle>
            <DialogDescription>
              Jadwal baru sudah masuk ke daftar dan bisa ibu lihat di bagian Jadwal Mendatang.
            </DialogDescription>
          </DialogHeader>
          {lastCreated && (
            <div className="rounded-2xl bg-muted/70 p-4 text-sm">
              <p className="font-bold">{lastCreated.title}</p>
              <p className="mt-2 text-muted-foreground">
                {formatDate(lastCreated.date)} • {lastCreated.time}
              </p>
              <p className="mt-1 text-muted-foreground">{lastCreated.place}</p>
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

const AppointmentCard = ({ item }: { item: Appointment }) => (
  <div className="rounded-2xl bg-card p-4 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-sm leading-snug">{item.title}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{item.midwife}</p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
          item.status === "Akan datang"
            ? "bg-secondary text-secondary-foreground"
            : "bg-muted text-muted-foreground",
        )}
      >
        {item.status}
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
    </div>
  </div>
);

export default Kunjungan;
