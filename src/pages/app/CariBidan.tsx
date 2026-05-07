import { Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Star, SlidersHorizontal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, Midwife } from "@/lib/api";
import bidanRina from "@/assets/bidan-rina.jpg";

const fallbackBidans: Midwife[] = [
  { id: 1, name: "Bidan Titik", email: "rina@bidankita.test", role: "midwife", rating: 4.9, reviews: 128, specialty: "Kehamilan & Persalinan", clinic: "Klinik Bidan Titik", distance: "2.3 km dari lokasi Anda" },
];

const filters = ["Semua", "Terdekat", "Spesialisasi"];

type CariBidanProps = {
  compact?: boolean;
};

const CariBidan = ({ compact = false }: CariBidanProps) => {
  const [bidans, setBidans] = useState<Midwife[]>(fallbackBidans);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    apiFetch<{ midwives: Midwife[] }>("/api/midwives")
      .then((data) => {
        if (data.midwives.length) setBidans(data.midwives);
        setNotice("");
      })
      .catch(() => setNotice("Mode lokal aktif. Setelah deploy, daftar bidan tersambung ke Cloudflare D1."));
  }, []);

  const filtered = useMemo(() => {
    const value = query.toLowerCase().trim();
    if (!value) return bidans;
    return bidans.filter((b) => `${b.name} ${b.specialty ?? ""} ${b.clinic ?? ""}`.toLowerCase().includes(value));
  }, [bidans, query]);

  return (
    <div className={compact ? "space-y-3" : "safe-x space-y-4 pb-5 pt-5"}>
      {!compact && (
        <div className="flex items-center gap-3">
          <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-display text-xl font-bold leading-tight">Cari Bidan</h1>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama bidan atau spesialisasi..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {notice && <p className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{notice}</p>}

      {!compact && (
        <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold transition-smooth ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
          <button className="ml-auto grid h-9 w-9 shrink-0 place-items-center rounded-full bg-muted" aria-label="Filter">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card shadow-card p-3">
            <div className="flex gap-3">
              <img src={bidanRina} alt={b.name} loading="lazy" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{b.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{b.rating ?? 5}</span>
                  <span className="text-xs text-muted-foreground">({b.reviews ?? 0})</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Spesialisasi</p>
                <p className="text-xs font-medium">{b.specialty ?? "KIA & Kehamilan"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{b.clinic ?? "Klinik BidanKita"}</p>
              </div>
              <Button asChild size="sm" className="hidden h-8 self-end rounded-full px-4 text-xs min-[380px]:inline-flex">
                <Link to={`/app/chat/${b.id}`}>Chat</Link>
              </Button>
            </div>
            <Button asChild size="sm" className="mt-3 h-10 w-full rounded-full text-xs min-[380px]:hidden">
              <Link to={`/app/chat/${b.id}`}>Chat Bidan</Link>
            </Button>
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
              <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">{b.distance ?? "Tersedia konsultasi online"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CariBidan;
