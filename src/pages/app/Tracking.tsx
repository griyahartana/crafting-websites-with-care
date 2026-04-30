import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Bell, Heart, ChevronRight } from "lucide-react";

const appointments = [
  { icon: Calendar, title: "Jadwal USG Rutin", time: "25 Mei 2024 • 10:00", color: "bg-info/10 text-info" },
  { icon: Bell, title: "Kunjungan ANC Berikutnya", time: "8 Juni 2024 • 09:30", color: "bg-accent text-accent-foreground" },
];

const stats = [
  { label: "Berat", value: "650", unit: "g", note: "+50 g" },
  { label: "Panjang", value: "31.2", unit: "cm", note: "+2.1 cm" },
  { label: "Detak Jantung", value: "145", unit: "bpm", note: "Normal", icon: true },
];

const Tracking = () => {
  return (
    <div className="safe-x space-y-4 pb-5 pt-5">
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-3 pr-3">
          <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-bold leading-tight">Pantau Kesehatan</h1>
        </div>
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-card shadow-card" aria-label="Kalender">
          <Calendar className="w-4 h-4" />
        </button>
      </div>

      {/* Pregnancy progress */}
      <div className="rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-foreground/80">Perkembangan Kehamilan</p>
            <p className="font-display text-2xl font-bold mt-1">
              24 <span className="text-sm font-semibold">minggu 3 hari</span>
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-semibold">Trimester 2</span>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-card/60 overflow-hidden">
            <div className="h-full w-[60%] bg-primary rounded-full" />
          </div>
          <span className="text-xs font-semibold">60%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">HPL 12 Agustus 2024 (108 hari lagi)</p>
      </div>

      {/* Appointments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Pengingat & Janji</h2>
          <button className="text-xs font-semibold text-primary">Lihat semua</button>
        </div>
        <div className="space-y-2">
          {appointments.map((a) => (
            <div key={a.title} className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
              <div className={`w-10 h-10 rounded-xl grid place-items-center ${a.color}`}>
                <a.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-[11px] text-muted-foreground">{a.time}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Baby growth */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Pertumbuhan Si Kecil</h2>
          <button className="text-xs font-semibold text-primary">Lihat detail</button>
        </div>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl bg-card shadow-card p-3 text-center">
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
              {s.icon && <Heart className="w-3.5 h-3.5 fill-destructive text-destructive mx-auto mt-1" />}
              <p className="font-display text-lg font-bold mt-0.5">
                {s.value}
                <span className="text-[10px] font-semibold ml-0.5">{s.unit}</span>
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trend chart */}
      <div className="rounded-2xl bg-card shadow-card p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="font-semibold text-sm">Tren Perkembangan</p>
          <button className="text-xs font-semibold text-primary">Lihat grafik</button>
        </div>
        <p className="text-[11px] text-muted-foreground mb-2">Berat Janin (perkiraan)</p>
        <svg viewBox="0 0 280 100" className="w-full h-24">
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,90 C40,85 60,75 90,65 C120,55 150,40 180,30 C210,22 240,15 280,8 L280,100 L0,100 Z"
            fill="url(#g)"
          />
          <path
            d="M0,90 C40,85 60,75 90,65 C120,55 150,40 180,30 C210,22 240,15 280,8"
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          <circle cx="180" cy="30" r="4" fill="hsl(var(--primary))" />
        </svg>
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
          <span>16 mg</span><span>20 mg</span><span>24 mg</span><span>28 mg</span><span>32 mg</span><span>36 mg</span><span>40 mg</span>
        </div>
      </div>
    </div>
  );
};

export default Tracking;
