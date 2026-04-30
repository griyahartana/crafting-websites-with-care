import { Link } from "react-router-dom";
import { ArrowLeft, Search, MapPin, Star, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import bidanRina from "@/assets/bidan-rina.jpg";
import bidanDwi from "@/assets/bidan-dwi.jpg";
import bidanSiti from "@/assets/bidan-siti.jpg";

const bidans = [
  { id: "rina", name: "Bidan Rina Amelia, S.ST", img: bidanRina, rating: 4.9, reviews: 128, spec: "Kehamilan & Persalinan", exp: "8 tahun", dist: "2.3 km dari lokasi Anda" },
  { id: "dwi", name: "Bidan Dwi Lestari, S.ST", img: bidanDwi, rating: 4.8, reviews: 96, spec: "Laktasi & Bayi", exp: "6 tahun", dist: "3.1 km dari lokasi Anda" },
  { id: "siti", name: "Bidan Siti Nurhayati, S.ST", img: bidanSiti, rating: 4.9, reviews: 74, spec: "KIA & KB", exp: "10 tahun", dist: "4.0 km dari lokasi Anda" },
];

const filters = ["Semua", "Terdekat", "Spesialisasi"];

const CariBidan = () => {
  return (
    <div className="px-5 pt-2 pb-4 space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/app" className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-xl font-bold">Cari Bidan</h1>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Cari nama bidan atau spesialisasi..."
          className="w-full h-12 pl-11 pr-4 rounded-2xl bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {filters.map((f, i) => (
          <button
            key={f}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-smooth ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
            }`}
          >
            {f}
          </button>
        ))}
        <button className="ml-auto w-9 h-9 rounded-full bg-muted grid place-items-center shrink-0" aria-label="Filter">
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {bidans.map((b) => (
          <div key={b.id} className="rounded-2xl bg-card shadow-card p-3">
            <div className="flex gap-3">
              <img src={b.img} alt={b.name} loading="lazy" className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-snug">{b.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-semibold">{b.rating}</span>
                  <span className="text-xs text-muted-foreground">({b.reviews})</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Spesialisasi</p>
                <p className="text-xs font-medium">{b.spec}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Pengalaman {b.exp}</p>
              </div>
              <Button asChild size="sm" className="rounded-full text-xs h-8 px-4 self-end">
                <Link to={`/app/chat/${b.id}`}>Buat Janji</Link>
              </Button>
            </div>
            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-border">
              <MapPin className="w-3 h-3 text-muted-foreground" />
              <p className="text-[11px] text-muted-foreground">{b.dist}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CariBidan;
