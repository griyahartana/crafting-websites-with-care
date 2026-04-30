import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  Baby,
  CheckCircle2,
  Droplets,
  FileHeart,
  HeartPulse,
  Moon,
  Pill,
  Plus,
  Scale,
  Sparkles,
  ThermometerSun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PregnancyNote = {
  id: number;
  date: string;
  week: string;
  mood: string;
  symptoms: string[];
  babyMovement: string;
  weight: string;
  bloodPressure: string;
  sleep: string;
  water: string;
  vitamins: string;
  note: string;
};

const symptoms = ["Mual", "Pusing", "Kram", "Nyeri punggung", "Bengkak", "Kontraksi ringan"];
const moods = ["Tenang", "Lelah", "Cemas", "Bahagia"];

const initialNotes: PregnancyNote[] = [
  {
    id: 1,
    date: "30 April 2026",
    week: "24 minggu 3 hari",
    mood: "Tenang",
    symptoms: ["Nyeri punggung"],
    babyMovement: "Aktif, terasa 8 kali dalam 2 jam",
    weight: "62.4 kg",
    bloodPressure: "112/74",
    sleep: "7 jam",
    water: "7 gelas",
    vitamins: "Asam folat dan zat besi",
    note: "Perut terasa lebih nyaman setelah jalan pagi dan istirahat miring kiri.",
  },
  {
    id: 2,
    date: "29 April 2026",
    week: "24 minggu 2 hari",
    mood: "Lelah",
    symptoms: ["Mual", "Pusing"],
    babyMovement: "Normal, terasa setelah makan malam",
    weight: "62.2 kg",
    bloodPressure: "110/72",
    sleep: "6 jam",
    water: "6 gelas",
    vitamins: "Zat besi",
    note: "Mual di pagi hari berkurang setelah sarapan kecil.",
  },
];

const today = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date());

const CatatanKehamilan = () => {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedMood, setSelectedMood] = useState(moods[0]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(["Nyeri punggung"]);
  const [babyMovement, setBabyMovement] = useState("Aktif, terasa 8 kali dalam 2 jam");
  const [weight, setWeight] = useState("62.4");
  const [bloodPressure, setBloodPressure] = useState("112/74");
  const [sleep, setSleep] = useState("7");
  const [water, setWater] = useState("7");
  const [vitamins, setVitamins] = useState("Asam folat dan zat besi");
  const [note, setNote] = useState("Perut terasa lebih nyaman setelah jalan pagi.");
  const [saved, setSaved] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const latestNote = notes[0];
  const activeSymptoms = useMemo(() => latestNote?.symptoms.length ?? 0, [latestNote]);

  const toggleSymptom = (item: string) => {
    setSaved(false);
    setSelectedSymptoms((current) =>
      current.includes(item) ? current.filter((symptom) => symptom !== item) : [...current, item],
    );
  };

  const saveNote = () => {
    const newNote: PregnancyNote = {
      id: Date.now(),
      date: today,
      week: "24 minggu 3 hari",
      mood: selectedMood,
      symptoms: selectedSymptoms,
      babyMovement: babyMovement.trim() || "Belum dicatat",
      weight: `${weight || "-"} kg`,
      bloodPressure: bloodPressure || "-",
      sleep: `${sleep || "-"} jam`,
      water: `${water || "-"} gelas`,
      vitamins: vitamins.trim() || "Belum dicatat",
      note: note.trim() || "Tidak ada catatan tambahan.",
    };

    setNotes((current) => [newNote, ...current]);
    setSaved(true);
    setIsEditorOpen(false);
  };

  return (
    <div className="safe-x space-y-4 pb-6 pt-5">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-bold leading-tight">Catatan Kehamilan</h1>
          <p className="text-xs text-muted-foreground">Rekam kondisi ibu dan si kecil setiap hari</p>
        </div>
      </div>

      <div className="rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-secondary-foreground/80">Catatan terakhir</p>
            <p className="mt-1 font-display text-2xl font-bold leading-tight">{latestNote.week}</p>
            <p className="mt-2 text-xs text-muted-foreground">{latestNote.date} • Mood {latestNote.mood}</p>
          </div>
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card/80">
            <FileHeart className="h-5 w-5 text-primary" />
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <SummaryItem icon={Baby} label="Gerak" value="Aktif" />
          <SummaryItem icon={ThermometerSun} label="Keluhan" value={`${activeSymptoms}`} />
          <SummaryItem icon={Droplets} label="Minum" value={latestNote.water} />
        </div>
        <Button
          className="mt-4 h-12 w-full rounded-2xl shadow-soft"
          onClick={() => {
            setSaved(false);
            setIsEditorOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Tulis Catatan Baru
        </Button>
      </div>

      {saved && (
        <div className="flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3 text-sm">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="leading-relaxed">Catatan hari ini berhasil disimpan dan muncul di riwayat.</p>
        </div>
      )}

      <section className="rounded-3xl bg-card p-4 shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary">
            <Sparkles className="h-5 w-5 text-secondary-foreground" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-base">Isi saat ibu siap</h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Form catatan disimpan di popup agar halaman tetap ringan. Klik tombol di atas untuk mulai mencatat kondisi hari ini.
            </p>
          </div>
        </div>
      </section>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="bottom-2 left-2 right-2 top-auto flex max-h-[calc(100dvh-1rem)] w-auto max-w-none translate-x-0 translate-y-0 flex-col overflow-hidden rounded-[2rem] border-0 p-0 sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[calc(100vw-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2">
          <div className="shrink-0 bg-background/95 p-5 pb-3 backdrop-blur">
            <DialogHeader className="pr-7 text-left">
              <DialogTitle className="font-display text-2xl">Catatan Hari Ini</DialogTitle>
              <DialogDescription>{today} • 24 minggu 3 hari</DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 pb-4">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Perasaan ibu</p>
              <div className="grid grid-cols-2 gap-2 min-[380px]:grid-cols-4">
                {moods.map((mood) => (
                  <button
                    key={mood}
                    type="button"
                    onClick={() => {
                      setSelectedMood(mood);
                      setSaved(false);
                    }}
                    className={cn(
                      "h-10 rounded-2xl text-sm font-semibold transition-smooth",
                      selectedMood === mood
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "bg-muted hover:bg-secondary",
                    )}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Keluhan yang dirasakan</p>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => toggleSymptom(symptom)}
                    className={cn(
                      "rounded-full px-3 py-2 text-xs font-semibold transition-smooth",
                      selectedSymptoms.includes(symptom)
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Berat ibu" icon={Scale} suffix="kg" value={weight} onChange={setWeight} />
              <Field label="Tekanan darah" icon={HeartPulse} value={bloodPressure} onChange={setBloodPressure} />
              <Field label="Tidur" icon={Moon} suffix="jam" value={sleep} onChange={setSleep} />
              <Field label="Air putih" icon={Droplets} suffix="gelas" value={water} onChange={setWater} />
            </div>

            <TextField
              label="Gerakan bayi"
              icon={Baby}
              value={babyMovement}
              onChange={(value) => {
                setBabyMovement(value);
                setSaved(false);
              }}
              placeholder="Contoh: Aktif setelah makan siang"
            />

            <TextField
              label="Vitamin/obat"
              icon={Pill}
              value={vitamins}
              onChange={(value) => {
                setVitamins(value);
                setSaved(false);
              }}
              placeholder="Contoh: Asam folat, zat besi"
            />

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" /> Catatan tambahan
              </label>
              <textarea
                value={note}
                onChange={(event) => {
                  setNote(event.target.value);
                  setSaved(false);
                }}
                placeholder="Tulis hal penting yang ibu rasakan hari ini..."
                className="min-h-24 w-full resize-none rounded-2xl bg-muted px-4 py-3 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          <div className="safe-bottom shrink-0 border-t border-border bg-background/95 px-5 pt-3 backdrop-blur">
            <Button className="h-12 w-full rounded-2xl shadow-soft" onClick={saveNote}>
              <Plus className="h-4 w-4" /> Simpan Catatan
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-base">Riwayat Catatan</h2>
          <span className="text-xs font-semibold text-primary">{notes.length} catatan</span>
        </div>
        <div className="space-y-3">
          {notes.map((item) => (
            <NoteCard key={item.id} note={item} />
          ))}
        </div>
      </section>
    </div>
  );
};

const SummaryItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) => (
  <div className="rounded-2xl bg-card/70 p-3">
    <Icon className="mx-auto h-4 w-4 text-primary" />
    <p className="mt-1 font-bold leading-tight">{value}</p>
    <p className="text-[10px] text-muted-foreground">{label}</p>
  </div>
);

const Field = ({
  label,
  icon: Icon,
  suffix,
  value,
  onChange,
}: {
  label: string;
  icon: typeof Activity;
  suffix?: string;
  value: string;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
    <div className="flex h-11 items-center rounded-2xl bg-muted px-3 focus-within:ring-2 focus-within:ring-primary/30">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
      />
      {suffix && <span className="ml-2 text-xs text-muted-foreground">{suffix}</span>}
    </div>
  </label>
);

const TextField = ({
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof Activity;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) => (
  <label className="block">
    <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
      <Icon className="h-3.5 w-3.5" /> {label}
    </span>
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30"
    />
  </label>
);

const NoteCard = ({ note }: { note: PregnancyNote }) => (
  <article className="rounded-2xl bg-card p-4 shadow-card">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="font-semibold text-sm">{note.date}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{note.week} • Mood {note.mood}</p>
      </div>
      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">
        {note.symptoms.length} keluhan
      </span>
    </div>
    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
      <Info icon={Scale} label="Berat" value={note.weight} />
      <Info icon={HeartPulse} label="Tensi" value={note.bloodPressure} />
      <Info icon={Baby} label="Gerak bayi" value={note.babyMovement} />
      <Info icon={Pill} label="Vitamin" value={note.vitamins} />
    </div>
    <p className="mt-3 rounded-2xl bg-muted/70 p-3 text-xs leading-relaxed text-muted-foreground">{note.note}</p>
  </article>
);

const Info = ({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) => (
  <div className="min-w-0 rounded-2xl bg-muted/60 p-3">
    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
      <Icon className="h-3 w-3 shrink-0" />
      <span>{label}</span>
    </div>
    <p className="line-clamp-2 text-xs font-semibold leading-snug">{value}</p>
  </div>
);

export default CatatanKehamilan;
