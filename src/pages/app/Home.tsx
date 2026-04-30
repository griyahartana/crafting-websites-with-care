import { Link } from "react-router-dom";
import { Bell, Search, MessageCircle, CalendarPlus, Users, FileHeart } from "lucide-react";
import { useMemo } from "react";
import { getStoredUser } from "@/lib/api";
import article1 from "@/assets/article-1.png";

const quickActions = [
  { icon: MessageCircle, title: "Chat Bidan", desc: "Tanya & konsultasi", to: "/app/cari-bidan", bg: "bg-primary/10", color: "text-primary" },
  { icon: CalendarPlus, title: "Jadwal Kunjungan", desc: "Buat janji", to: "/app/kunjungan", bg: "bg-info/10", color: "text-info" },
  { icon: Users, title: "Kelas Ibu Hamil", desc: "Belajar bersama", to: "/app/tracking", bg: "bg-secondary", color: "text-secondary-foreground" },
  { icon: FileHeart, title: "Catatan Kehamilan", desc: "Tulis kondisi harian", to: "/app/catatan", bg: "bg-accent", color: "text-accent-foreground" },
];

const Home = () => {
  const user = useMemo(() => getStoredUser(), []);
  const firstName = user?.name?.trim().split(/\s+/)[0] ?? "Ibu";
  const greetingName = user?.role === "midwife" ? user.name : user?.role === "admin" ? "Admin" : firstName;

  return (
    <div className="safe-x space-y-5 pb-5 pt-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="min-w-0 pr-3">
          <h1 className="font-display text-2xl font-bold leading-tight">
            Halo, {greetingName} <span>👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {user?.role === "midwife" ? "Ada chat customer yang perlu dibalas?" : user?.role === "admin" ? "Kelola bidan dan customer hari ini." : "Apa kabar ibu hari ini?"}
          </p>
        </div>
        <button className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-card shadow-card" aria-label="Notifikasi">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari layanan, artikel, atau bidan..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {/* Pregnancy Card */}
      <div className="rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-5 shadow-card">
        <p className="text-sm font-medium text-secondary-foreground/80">Kehamilan Anda</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-3xl font-bold leading-tight text-foreground">
              24 <span className="text-base font-semibold">minggu 3 hari</span>
            </p>
          </div>
          <div className="shrink-0 text-3xl">🤰</div>
        </div>
        <div className="mt-3 h-2 rounded-full bg-card/60 overflow-hidden">
          <div className="h-full w-[60%] bg-primary rounded-full" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Trimester 2 • HPL 12 Agustus 2024</p>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-bold text-base mb-3">Aksi Cepat</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((a) => (
            <Link
              key={a.title}
              to={a.to}
              className="flex min-h-24 flex-col justify-between rounded-2xl bg-card p-3 shadow-card transition-smooth hover:-translate-y-0.5 min-[380px]:min-h-0 min-[380px]:flex-row min-[380px]:items-center min-[380px]:gap-3"
            >
              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${a.bg}`}>
                <a.icon className={`w-5 h-5 ${a.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-snug">{a.title}</p>
                <p className="text-[11px] text-muted-foreground truncate">{a.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Articles */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Artikel untuk Anda</h2>
          <button className="text-xs font-semibold text-primary">Lihat semua</button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-card p-3 shadow-card">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm leading-snug">
              Tips menjaga berat badan selama kehamilan
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">5 menit baca</p>
          </div>
          <img src={article1} alt="Artikel kehamilan" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl bg-secondary/30 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Home;
