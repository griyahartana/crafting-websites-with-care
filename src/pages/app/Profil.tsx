import { Link } from "react-router-dom";
import { Settings, Heart, FileText, HelpCircle, LogOut, ChevronRight } from "lucide-react";

const menu = [
  { icon: FileText, label: "Catatan Kehamilan" },
  { icon: Heart, label: "Bidan Favorit" },
  { icon: Settings, label: "Pengaturan" },
  { icon: HelpCircle, label: "Bantuan" },
];

const Profil = () => {
  return (
    <div className="px-5 pt-2 pb-4 space-y-5">
      <h1 className="font-display text-xl font-bold">Profil</h1>

      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-soft">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary-foreground/20 grid place-items-center text-2xl font-bold">
            A
          </div>
          <div>
            <p className="font-display text-xl font-bold">Ayu Pratiwi</p>
            <p className="text-sm opacity-90">Trimester 2 • 24 minggu</p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-card shadow-card divide-y divide-border">
        {menu.map((m) => (
          <button key={m.label} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-smooth">
            <div className="w-9 h-9 rounded-xl bg-secondary grid place-items-center">
              <m.icon className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium">{m.label}</span>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>
        ))}
      </div>

      <Link to="/" className="flex items-center justify-center gap-2 text-sm font-semibold text-destructive py-3">
        <LogOut className="w-4 h-4" /> Keluar
      </Link>
    </div>
  );
};

export default Profil;
