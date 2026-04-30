import { Link } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  { title: "USG Rutin Trimester 2", date: "25 Mei 2024", time: "10:00", place: "Klinik Bidan Rina", status: "Akan datang" },
  { title: "Kunjungan ANC", date: "8 Juni 2024", time: "09:30", place: "Klinik Bidan Rina", status: "Akan datang" },
  { title: "Kelas Ibu Hamil", date: "12 Mei 2024", time: "16:00", place: "Online via Zoom", status: "Selesai" },
];

const Kunjungan = () => {
  return (
    <div className="px-5 pt-2 pb-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/app" className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Janji Kunjungan</h1>
      </div>

      <Button className="w-full rounded-2xl h-12 shadow-soft">
        <CalendarPlus className="w-4 h-4" /> Buat Janji Baru
      </Button>

      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl bg-card shadow-card p-4">
            <div className="flex items-start justify-between">
              <p className="font-semibold text-sm">{it.title}</p>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  it.status === "Selesai" ? "bg-muted text-muted-foreground" : "bg-secondary text-secondary-foreground"
                }`}
              >
                {it.status}
              </span>
            </div>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {it.date} • {it.time}</div>
              <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" /> {it.place}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Kunjungan;
