import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Coins,
  Download,
  Egg,
  FileSpreadsheet,
  FileText,
  LayoutDashboard,
  LogOut,
  PackageCheck,
  Pencil,
  Plus,
  Printer,
  ShieldCheck,
  Stethoscope,
  Syringe,
  TrendingDown,
  TrendingUp,
  Truck,
  Trash2,
  Users,
  Wallet,
  Warehouse,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { clearAdminSession } from "@/lib/adminAuth";
import { loadAdminFarmState, saveAdminFarmState } from "@/lib/farmSync";
import { cn } from "@/lib/utils";

type Flock = {
  id: string;
  name: string;
  strain: string;
  ageWeeks: number;
  initialPopulation: number;
  deaths: number;
  culled: number;
  startedAt: string;
  houseType: string;
  targetProduction: number;
  plannedCullingDate: string;
};

type ProductionRecord = {
  id: string;
  date: string;
  flockId: string;
  eggCount: number;
  gradeA: number;
  gradeB: number;
  cracked: number;
  abnormal: number;
  deaths: number;
  note: string;
};

type FeedRecord = {
  id: string;
  date: string;
  flockId: string;
  incomingKg: number;
  usedKg: number;
  stockKg: number;
  pricePerKg: number;
  feedType: string;
};

type HealthStatus = "Terjadwal" | "Selesai" | "Perlu tindakan";
type HealthCategory = "Vaksin" | "Obat" | "Penyakit" | "Treatment";

type HealthRecord = {
  id: string;
  date: string;
  flockId: string;
  category: HealthCategory;
  name: string;
  status: HealthStatus;
  dosage: string;
  deaths: number;
  note: string;
};

type FinanceType = "Pemasukan" | "Pengeluaran";

type FinanceRecord = {
  id: string;
  date: string;
  type: FinanceType;
  category: "Pakan" | "Obat" | "Tenaga kerja" | "Penjualan telur" | "Lainnya";
  description: string;
  amount: number;
  soldEggs?: number;
};

type DailyForm = {
  date: string;
  flockId: string;
  eggCount: string;
  gradeA: string;
  gradeB: string;
  cracked: string;
  abnormal: string;
  feedUsedKg: string;
  deaths: string;
  note: string;
};

type FlockForm = {
  name: string;
  strain: string;
  ageWeeks: string;
  initialPopulation: string;
  deaths: string;
  culled: string;
  houseType: string;
  targetProduction: string;
  startedAt: string;
  plannedCullingDate: string;
};

type FeedForm = {
  date: string;
  flockId: string;
  incomingKg: string;
  usedKg: string;
  stockKg: string;
  pricePerKg: string;
  feedType: string;
};

type HealthForm = {
  date: string;
  flockId: string;
  category: HealthCategory;
  name: string;
  status: HealthStatus;
  dosage: string;
  deaths: string;
  note: string;
};

type FinanceForm = {
  date: string;
  type: FinanceType;
  category: FinanceRecord["category"];
  description: string;
  amount: string;
  soldEggs: string;
};

type FarmDataSnapshot = {
  flocks: Flock[];
  productionRecords: ProductionRecord[];
  feedRecords: FeedRecord[];
  healthRecords: HealthRecord[];
  financeRecords: FinanceRecord[];
};

type ReminderSeverity = "danger" | "warning" | "info" | "success";

type Reminder = {
  id: string;
  title: string;
  detail: string;
  due: string;
  severity: ReminderSeverity;
  icon: LucideIcon;
};

type ReportTable = {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
};

const STORAGE_KEYS = {
  flocks: "layerfarm.flocks",
  production: "layerfarm.production",
  feed: "layerfarm.feed",
  health: "layerfarm.health",
  finance: "layerfarm.finance",
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("id-ID");
const compactFormatter = new Intl.NumberFormat("id-ID", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

const toInputDate = (date: Date) => {
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 10);
};

const isoDaysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toInputDate(date);
};

const isoDaysFrom = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toInputDate(date);
};

const parseDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);

const diffDays = (targetIso: string, baseIso: string) => {
  const target = parseDate(targetIso).getTime();
  const base = parseDate(baseIso).getTime();
  return Math.ceil((target - base) / 86_400_000);
};

const formatDate = (isoDate: string) => dateFormatter.format(parseDate(isoDate));
const formatShortDate = (isoDate: string) => shortDateFormatter.format(parseDate(isoDate));
const formatNumber = (value: number) => numberFormatter.format(Math.round(value));
const formatCompact = (value: number) => compactFormatter.format(value);
const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatPercent = (value: number) => `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;
const formatDecimal = (value: number, digits = 2) => (Number.isFinite(value) ? value.toFixed(digits) : "0.00");

const safeDivide = (numerator: number, denominator: number) => (denominator > 0 ? numerator / denominator : 0);
const asNumber = (value: string) => Number(value) || 0;
const gramsToKg = (value: string) => asNumber(value) / 1000;
const populationOf = (flock: Flock) => Math.max(0, flock.initialPopulation - flock.deaths - flock.culled);

const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = <T,>(key: string, value: T) => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browser storage can be unavailable in private contexts.
  }
};

const makeProductionRecord = (
  flockId: string,
  date: string,
  eggCount: number,
  deaths = 0,
  note = "",
): ProductionRecord => {
  const gradeA = Math.round(eggCount * 0.8);
  const gradeB = Math.round(eggCount * 0.13);
  const cracked = Math.round(eggCount * 0.04);
  const abnormal = Math.max(0, eggCount - gradeA - gradeB - cracked);

  return {
    id: `${flockId}-prod-${date}`,
    date,
    flockId,
    eggCount,
    gradeA,
    gradeB,
    cracked,
    abnormal,
    deaths,
    note,
  };
};

const buildInitialFlocks = (): Flock[] => [
  {
    id: "flock-a1",
    name: "Kandang A1",
    strain: "Hy-Line Brown",
    ageWeeks: 42,
    initialPopulation: 5_000,
    deaths: 84,
    culled: 21,
    startedAt: isoDaysAgo(42 * 7),
    houseType: "Open house",
    targetProduction: 92,
    plannedCullingDate: isoDaysFrom(154),
  },
  {
    id: "flock-b2",
    name: "Kandang B2",
    strain: "Lohmann Brown",
    ageWeeks: 28,
    initialPopulation: 4_200,
    deaths: 32,
    culled: 10,
    startedAt: isoDaysAgo(28 * 7),
    houseType: "Semi closed house",
    targetProduction: 89,
    plannedCullingDate: isoDaysFrom(245),
  },
  {
    id: "flock-c3",
    name: "Kandang C3",
    strain: "ISA Brown",
    ageWeeks: 63,
    initialPopulation: 3_600,
    deaths: 144,
    culled: 68,
    startedAt: isoDaysAgo(63 * 7),
    houseType: "Open house",
    targetProduction: 84,
    plannedCullingDate: isoDaysFrom(41),
  },
];

const productionSeries: Record<string, number[]> = {
  "flock-a1": [4_525, 4_590, 4_560, 4_610, 4_680, 4_635, 4_690],
  "flock-b2": [3_410, 3_465, 3_520, 3_555, 3_610, 3_640, 3_675],
  "flock-c3": [2_880, 2_835, 2_790, 2_740, 2_725, 2_680, 2_640],
};

const feedSeries: Record<string, number[]> = {
  "flock-a1": [568, 572, 570, 575, 579, 576, 582],
  "flock-b2": [456, 462, 466, 468, 472, 475, 478],
  "flock-c3": [420, 418, 416, 412, 408, 405, 402],
};

const buildInitialProduction = (): ProductionRecord[] =>
  Object.entries(productionSeries).flatMap(([flockId, values]) =>
    values.map((eggCount, index) =>
      makeProductionRecord(
        flockId,
        isoDaysAgo(values.length - 1 - index),
        eggCount,
        flockId === "flock-c3" && index > 3 ? 1 : 0,
        index === values.length - 1 ? "Pencatatan pagi selesai" : "",
      ),
    ),
  );

const buildInitialFeed = (): FeedRecord[] => {
  const currentStock: Record<string, number> = {
    "flock-a1": 2_260,
    "flock-b2": 1_420,
    "flock-c3": 920,
  };

  return Object.entries(feedSeries).flatMap(([flockId, values]) =>
    values.map((usedKg, index) => {
      const daysFromLatest = values.length - 1 - index;
      return {
        id: `${flockId}-feed-${index}`,
        date: isoDaysAgo(daysFromLatest),
        flockId,
        incomingKg: index === 2 ? 2_000 : 0,
        usedKg,
        stockKg: Math.max(0, currentStock[flockId] + daysFromLatest * usedKg),
        pricePerKg: flockId === "flock-b2" ? 7_350 : 7_200,
        feedType: flockId === "flock-c3" ? "Layer mash 16%" : "Layer mash 17%",
      };
    }),
  );
};

const buildInitialHealth = (): HealthRecord[] => [
  {
    id: "health-1",
    date: isoDaysFrom(3),
    flockId: "flock-b2",
    category: "Vaksin",
    name: "ND IB booster",
    status: "Terjadwal",
    dosage: "Spray 1 dosis/ekor",
    deaths: 0,
    note: "Siapkan alat spray dan cek suhu kandang sebelum aplikasi.",
  },
  {
    id: "health-2",
    date: isoDaysAgo(2),
    flockId: "flock-c3",
    category: "Treatment",
    name: "Vitamin elektrolit",
    status: "Selesai",
    dosage: "1 gram/liter air",
    deaths: 1,
    note: "Nafsu makan membaik, produksi masih dipantau.",
  },
  {
    id: "health-3",
    date: isoDaysAgo(0),
    flockId: "flock-c3",
    category: "Penyakit",
    name: "Pantau gejala respirasi",
    status: "Perlu tindakan",
    dosage: "Observasi 24 jam",
    deaths: 0,
    note: "Ada penurunan produksi dan beberapa ayam lesu.",
  },
  {
    id: "health-4",
    date: isoDaysFrom(12),
    flockId: "flock-a1",
    category: "Vaksin",
    name: "EDS",
    status: "Terjadwal",
    dosage: "Injeksi sesuai SOP",
    deaths: 0,
    note: "Masuk kalender bulanan.",
  },
];

const buildInitialFinance = (): FinanceRecord[] => [
  {
    id: "fin-1",
    date: isoDaysAgo(0),
    type: "Pemasukan",
    category: "Penjualan telur",
    description: "Penjualan telur grade A dan B",
    amount: 18_950_000,
    soldEggs: 3_720,
  },
  {
    id: "fin-2",
    date: isoDaysAgo(0),
    type: "Pengeluaran",
    category: "Tenaga kerja",
    description: "Upah harian operator kandang",
    amount: 925_000,
  },
  {
    id: "fin-3",
    date: isoDaysAgo(1),
    type: "Pemasukan",
    category: "Penjualan telur",
    description: "Penjualan telur harian",
    amount: 18_420_000,
    soldEggs: 3_610,
  },
  {
    id: "fin-4",
    date: isoDaysAgo(2),
    type: "Pengeluaran",
    category: "Obat",
    description: "Vitamin, elektrolit, dan desinfektan",
    amount: 1_180_000,
  },
  {
    id: "fin-5",
    date: isoDaysAgo(3),
    type: "Pengeluaran",
    category: "Pakan",
    description: "Pembelian layer mash",
    amount: 43_200_000,
  },
  {
    id: "fin-6",
    date: isoDaysAgo(4),
    type: "Pemasukan",
    category: "Penjualan telur",
    description: "Penjualan telur ke agen",
    amount: 17_980_000,
    soldEggs: 3_525,
  },
];

const createDailyForm = (flockId: string): DailyForm => ({
  date: isoDaysAgo(0),
  flockId,
  eggCount: "",
  gradeA: "",
  gradeB: "",
  cracked: "",
  abnormal: "",
  feedUsedKg: "",
  deaths: "0",
  note: "",
});

const createFlockForm = (): FlockForm => ({
  name: "",
  strain: "",
  ageWeeks: "",
  initialPopulation: "",
  deaths: "0",
  culled: "0",
  houseType: "Open house",
  targetProduction: "90",
  startedAt: isoDaysAgo(0),
  plannedCullingDate: isoDaysFrom(365),
});

const createFeedForm = (flockId: string): FeedForm => ({
  date: isoDaysAgo(0),
  flockId,
  incomingKg: "",
  usedKg: "",
  stockKg: "",
  pricePerKg: "7200",
  feedType: "Layer mash 17%",
});

const createHealthForm = (flockId: string): HealthForm => ({
  date: isoDaysAgo(0),
  flockId,
  category: "Vaksin",
  name: "",
  status: "Terjadwal",
  dosage: "",
  deaths: "0",
  note: "",
});

const createFinanceForm = (): FinanceForm => ({
  date: isoDaysAgo(0),
  type: "Pemasukan",
  category: "Penjualan telur",
  description: "",
  amount: "",
  soldEggs: "",
});

const productionChartConfig = {
  produksi: { label: "Produksi telur", color: "#f59e0b" },
  target: { label: "Target", color: "#facc15" },
  retak: { label: "Retak", color: "#fb923c" },
  abnormal: { label: "Abnormal", color: "#ef4444" },
} satisfies ChartConfig;

const feedChartConfig = {
  pakan: { label: "Pakan terpakai", color: "#d97706" },
  mortalitas: { label: "Mortalitas", color: "#e11d48" },
} satisfies ChartConfig;

const financeChartConfig = {
  pendapatan: { label: "Pendapatan", color: "#f59e0b" },
  biaya: { label: "Biaya harian", color: "#ef4444" },
} satisfies ChartConfig;

const gradeColors = ["#f59e0b", "#facc15", "#fb923c", "#ef4444"];

const appTabs = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "kandang", label: "Kandang", icon: Warehouse },
  { value: "produksi", label: "Produksi", icon: Egg },
  { value: "pakan", label: "Pakan", icon: Wheat },
  { value: "kesehatan", label: "Kesehatan", icon: Syringe },
  { value: "keuangan", label: "Keuangan", icon: Wallet },
  { value: "laporan", label: "Laporan", icon: FileText },
];

const severityClasses: Record<ReminderSeverity, string> = {
  danger: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  info: "border-sky-200 bg-sky-50 text-sky-700",
  success: "border-amber-300 bg-yellow-100 text-amber-800",
};

const metricToneClasses = {
  green: "bg-yellow-100 text-amber-800 ring-amber-300",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  sky: "bg-sky-50 text-sky-700 ring-sky-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};

const escapeHtml = (value: string | number) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const downloadBlob = (content: string, filename: string, type: string) => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone,
  trend,
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone: keyof typeof metricToneClasses;
  trend?: "up" | "down";
}) {
  const TrendIcon = trend === "down" ? ArrowDownRight : ArrowUpRight;

  return (
    <div className="farm-card min-w-0 rounded-[8px] border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-zinc-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-zinc-950">{value}</p>
        </div>
        <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-[8px] ring-1", metricToneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3 flex min-w-0 items-center gap-2 text-sm text-zinc-600">
        {trend ? <TrendIcon className={cn("h-4 w-4", trend === "down" ? "text-rose-600" : "text-amber-600")} /> : null}
        <span className="min-w-0 break-words">{detail}</span>
      </div>
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("farm-card min-w-0 rounded-[8px] border border-zinc-200 bg-white p-4 shadow-sm", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-[8px] bg-zinc-100 text-zinc-700">
            <Icon className="h-4 w-4" />
          </div>
          <h2 className="text-base font-bold text-zinc-950">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-zinc-600">{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center">
      <p className="font-semibold text-zinc-800">{title}</p>
      <p className="mt-1 text-sm text-zinc-500">{detail}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: HealthStatus }) {
  const className =
    status === "Selesai"
      ? "border-amber-300 bg-yellow-100 text-amber-800"
      : status === "Perlu tindakan"
        ? "border-red-200 bg-red-50 text-red-700"
        : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <Badge variant="outline" className={cn("rounded-[6px] px-2 py-0.5", className)}>
      {status}
    </Badge>
  );
}

const Index = () => {
  const defaultFlocks = useMemo(() => buildInitialFlocks(), []);
  const firstFlockId = defaultFlocks[0]?.id ?? "flock-a1";

  const [flocks, setFlocks] = useState<Flock[]>(() => readStorage(STORAGE_KEYS.flocks, defaultFlocks));
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>(() =>
    readStorage(STORAGE_KEYS.production, buildInitialProduction()),
  );
  const [feedRecords, setFeedRecords] = useState<FeedRecord[]>(() => readStorage(STORAGE_KEYS.feed, buildInitialFeed()));
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>(() =>
    readStorage(STORAGE_KEYS.health, buildInitialHealth()),
  );
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>(() =>
    readStorage(STORAGE_KEYS.finance, buildInitialFinance()),
  );
  const [dailyForm, setDailyForm] = useState<DailyForm>(() => createDailyForm(firstFlockId));
  const [flockForm, setFlockForm] = useState<FlockForm>(() => createFlockForm());
  const [feedForm, setFeedForm] = useState<FeedForm>(() => createFeedForm(firstFlockId));
  const [healthForm, setHealthForm] = useState<HealthForm>(() => createHealthForm(firstFlockId));
  const [financeForm, setFinanceForm] = useState<FinanceForm>(() => createFinanceForm());
  const [activeTab, setActiveTab] = useState("dashboard");
  const flockFormRef = useRef<HTMLFormElement>(null);
  const dailyFormRef = useRef<HTMLFormElement>(null);
  const financeFormRef = useRef<HTMLFormElement>(null);
  const [editingFlockId, setEditingFlockId] = useState<string | null>(null);
  const [editingProductionId, setEditingProductionId] = useState<string | null>(null);
  const [editingFinanceId, setEditingFinanceId] = useState<string | null>(null);
  const [cloudStatus, setCloudStatus] = useState<"loading" | "saving" | "synced" | "offline">("loading");
  const cloudReadyRef = useRef(false);
  const cloudSaveTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const lastCloudUpdatedAtRef = useRef<string | null>(null);
  const lastPushedSnapshotRef = useRef("");
  const farmSnapshotRef = useRef<FarmDataSnapshot | null>(null);

  const today = isoDaysAgo(0);
  const last7Dates = useMemo(() => Array.from({ length: 7 }, (_, index) => isoDaysAgo(6 - index)), []);

  const farmSnapshot = useMemo<FarmDataSnapshot>(
    () => ({
      flocks,
      productionRecords,
      feedRecords,
      healthRecords,
      financeRecords,
    }),
    [feedRecords, financeRecords, flocks, healthRecords, productionRecords],
  );

  const applyCloudSnapshot = useCallback((snapshot: FarmDataSnapshot) => {
    if (Array.isArray(snapshot.flocks)) setFlocks(snapshot.flocks);
    if (Array.isArray(snapshot.productionRecords)) setProductionRecords(snapshot.productionRecords);
    if (Array.isArray(snapshot.feedRecords)) setFeedRecords(snapshot.feedRecords);
    if (Array.isArray(snapshot.healthRecords)) setHealthRecords(snapshot.healthRecords);
    if (Array.isArray(snapshot.financeRecords)) setFinanceRecords(snapshot.financeRecords);
  }, []);

  useEffect(() => writeStorage(STORAGE_KEYS.flocks, flocks), [flocks]);
  useEffect(() => writeStorage(STORAGE_KEYS.production, productionRecords), [productionRecords]);
  useEffect(() => writeStorage(STORAGE_KEYS.feed, feedRecords), [feedRecords]);
  useEffect(() => writeStorage(STORAGE_KEYS.health, healthRecords), [healthRecords]);
  useEffect(() => writeStorage(STORAGE_KEYS.finance, financeRecords), [financeRecords]);
  useEffect(() => {
    farmSnapshotRef.current = farmSnapshot;
  }, [farmSnapshot]);

  useEffect(() => {
    let cancelled = false;

    loadAdminFarmState<FarmDataSnapshot>()
      .then(async (remote) => {
        if (cancelled) return;
        if (remote.state) {
          lastPushedSnapshotRef.current = JSON.stringify(remote.state);
          applyCloudSnapshot(remote.state);
        } else if (farmSnapshotRef.current) {
          const saved = await saveAdminFarmState(farmSnapshotRef.current);
          lastPushedSnapshotRef.current = JSON.stringify(farmSnapshotRef.current);
          lastCloudUpdatedAtRef.current = saved.updatedAt;
        }
        if (remote.updatedAt) lastCloudUpdatedAtRef.current = remote.updatedAt;
        cloudReadyRef.current = true;
        setCloudStatus("synced");
      })
      .catch(() => {
        if (cancelled) return;
        cloudReadyRef.current = true;
        setCloudStatus("offline");
      });

    return () => {
      cancelled = true;
    };
  }, [applyCloudSnapshot]);

  useEffect(() => {
    const serialized = JSON.stringify(farmSnapshot);
    if (!cloudReadyRef.current || serialized === lastPushedSnapshotRef.current) return;

    setCloudStatus("saving");
    if (cloudSaveTimerRef.current) window.clearTimeout(cloudSaveTimerRef.current);

    cloudSaveTimerRef.current = window.setTimeout(() => {
      saveAdminFarmState(farmSnapshot)
        .then((remote) => {
          lastPushedSnapshotRef.current = serialized;
          lastCloudUpdatedAtRef.current = remote.updatedAt;
          setCloudStatus("synced");
        })
        .catch(() => setCloudStatus("offline"));
    }, 900);

    return () => {
      if (cloudSaveTimerRef.current) window.clearTimeout(cloudSaveTimerRef.current);
    };
  }, [farmSnapshot]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (!cloudReadyRef.current) return;

      loadAdminFarmState<FarmDataSnapshot>()
        .then((remote) => {
          if (!remote.state || !remote.updatedAt || remote.updatedAt === lastCloudUpdatedAtRef.current) return;
          lastPushedSnapshotRef.current = JSON.stringify(remote.state);
          lastCloudUpdatedAtRef.current = remote.updatedAt;
          applyCloudSnapshot(remote.state);
          setCloudStatus("synced");
        })
        .catch(() => setCloudStatus("offline"));
    }, 30000);

    return () => window.clearInterval(interval);
  }, [applyCloudSnapshot]);

  const flockNameById = useMemo(
    () => new Map(flocks.map((flock) => [flock.id, flock.name])),
    [flocks],
  );

  const getFlockName = useCallback((flockId: string) => flockNameById.get(flockId) ?? "Kandang", [flockNameById]);

  const latestFeedByFlock = useMemo(() => {
    const latest = new Map<string, FeedRecord>();

    feedRecords.forEach((record) => {
      const current = latest.get(record.flockId);
      if (!current || record.date > current.date || (record.date === current.date && record.id > current.id)) {
        latest.set(record.flockId, record);
      }
    });

    return latest;
  }, [feedRecords]);

  const todayProductions = useMemo(
    () => productionRecords.filter((record) => record.date === today),
    [productionRecords, today],
  );

  const eggToday = todayProductions.reduce((sum, record) => sum + record.eggCount, 0);
  const gradeAToday = todayProductions.reduce((sum, record) => sum + record.gradeA, 0);
  const gradeBToday = todayProductions.reduce((sum, record) => sum + record.gradeB, 0);
  const crackedToday = todayProductions.reduce((sum, record) => sum + record.cracked, 0);
  const abnormalToday = todayProductions.reduce((sum, record) => sum + record.abnormal, 0);
  const activePopulation = flocks.reduce((sum, flock) => sum + populationOf(flock), 0);
  const initialPopulation = flocks.reduce((sum, flock) => sum + flock.initialPopulation, 0);
  const totalDeaths = flocks.reduce((sum, flock) => sum + flock.deaths, 0);
  const totalCulled = flocks.reduce((sum, flock) => sum + flock.culled, 0);
  const mortalityRate = safeDivide(totalDeaths + totalCulled, initialPopulation) * 100;
  const productionRateToday = safeDivide(eggToday, activePopulation) * 100;
  const totalEggProduced = productionRecords.reduce((sum, record) => sum + record.eggCount, 0);
  const soldEggsTotal = financeRecords
    .filter((record) => record.type === "Pemasukan" && record.category === "Penjualan telur")
    .reduce((sum, record) => sum + (record.soldEggs ?? 0), 0);
  const unsoldEggStock = Math.max(0, totalEggProduced - soldEggsTotal);
  const feedStockTotal = flocks.reduce((sum, flock) => sum + (latestFeedByFlock.get(flock.id)?.stockKg ?? 0), 0);
  const feedUsedToday = feedRecords
    .filter((record) => record.date === today)
    .reduce((sum, record) => sum + record.usedKg, 0);

  const weeklyProductionRecords = productionRecords.filter((record) => record.date >= last7Dates[0]);
  const weeklyFeedRecords = feedRecords.filter((record) => record.date >= last7Dates[0]);
  const weeklyEggs = weeklyProductionRecords.reduce((sum, record) => sum + record.eggCount, 0);
  const weeklyFeed = weeklyFeedRecords.reduce((sum, record) => sum + record.usedKg, 0);
  const weeklyFcr = safeDivide(weeklyFeed, weeklyEggs * 0.062);

  const incomeTotal = financeRecords
    .filter((record) => record.type === "Pemasukan")
    .reduce((sum, record) => sum + record.amount, 0);
  const expenseTotal = financeRecords
    .filter((record) => record.type === "Pengeluaran")
    .reduce((sum, record) => sum + record.amount, 0);
  const marginTotal = incomeTotal - expenseTotal;
  const marginRate = safeDivide(marginTotal, incomeTotal) * 100;

  const flockPerformance = useMemo(() => {
    return flocks.map((flock) => {
      const population = populationOf(flock);
      const records = productionRecords.filter((record) => record.flockId === flock.id);
      const latestDate = records.reduce((latest, record) => (record.date > latest ? record.date : latest), "");
      const latestProduction = records
        .filter((record) => record.date === latestDate)
        .reduce((sum, record) => sum + record.eggCount, 0);
      const latestGradeA = records
        .filter((record) => record.date === latestDate)
        .reduce((sum, record) => sum + record.gradeA, 0);
      const latestCracked = records
        .filter((record) => record.date === latestDate)
        .reduce((sum, record) => sum + record.cracked, 0);
      const last7Feed = feedRecords.filter((record) => record.flockId === flock.id && record.date >= last7Dates[0]);
      const last7Production = records.filter((record) => record.date >= last7Dates[0]);
      const totalFeed = last7Feed.reduce((sum, record) => sum + record.usedKg, 0);
      const totalEgg = last7Production.reduce((sum, record) => sum + record.eggCount, 0);
      const avgFeed = safeDivide(totalFeed, Math.max(1, last7Dates.length));
      const latestFeed = latestFeedByFlock.get(flock.id);
      const productionRate = safeDivide(latestProduction, population) * 100;
      const eggMassKg = totalEgg * 0.062;
      const fcr = safeDivide(totalFeed, eggMassKg);
      const qualityRate = safeDivide(latestGradeA, latestProduction) * 100;
      const crackedRate = safeDivide(latestCracked, latestProduction) * 100;

      return {
        flock,
        population,
        latestDate,
        latestProduction,
        productionRate,
        targetGap: productionRate - flock.targetProduction,
        avgFeed,
        fcr,
        qualityRate,
        crackedRate,
        latestStock: latestFeed?.stockKg ?? 0,
        daysOfFeed: safeDivide(latestFeed?.stockKg ?? 0, avgFeed),
        mortalityRate: safeDivide(flock.deaths + flock.culled, flock.initialPopulation) * 100,
      };
    });
  }, [feedRecords, flocks, last7Dates, latestFeedByFlock, productionRecords]);

  const productionChartData = useMemo(
    () =>
      last7Dates.map((date) => {
        const dailyRecords = productionRecords.filter((record) => record.date === date);
        const eggCount = dailyRecords.reduce((sum, record) => sum + record.eggCount, 0);
        return {
          date: formatShortDate(date),
          produksi: eggCount,
          target: Math.round(activePopulation * 0.9),
          retak: dailyRecords.reduce((sum, record) => sum + record.cracked, 0),
          abnormal: dailyRecords.reduce((sum, record) => sum + record.abnormal, 0),
        };
      }),
    [activePopulation, last7Dates, productionRecords],
  );

  const feedAndMortalityData = useMemo(
    () =>
      last7Dates.map((date) => {
        const feedKg = feedRecords
          .filter((record) => record.date === date)
          .reduce((sum, record) => sum + record.usedKg, 0);
        const productionDeaths = productionRecords
          .filter((record) => record.date === date)
          .reduce((sum, record) => sum + record.deaths, 0);
        const healthDeaths = healthRecords
          .filter((record) => record.date === date)
          .reduce((sum, record) => sum + record.deaths, 0);

        return {
          date: formatShortDate(date),
          pakan: feedKg,
          mortalitas: productionDeaths + healthDeaths,
        };
      }),
    [feedRecords, healthRecords, last7Dates, productionRecords],
  );

  const financeChartData = useMemo(
    () =>
      last7Dates.map((date) => {
        const feedUsageCost = feedRecords
          .filter((record) => record.date === date)
          .reduce((sum, record) => sum + record.usedKg * record.pricePerKg, 0);
        const income = financeRecords
          .filter((record) => record.date === date && record.type === "Pemasukan")
          .reduce((sum, record) => sum + record.amount, 0);
        const expense = financeRecords
          .filter((record) => record.date === date && record.type === "Pengeluaran" && record.category !== "Pakan")
          .reduce((sum, record) => sum + record.amount, 0);

        return {
          date: formatShortDate(date),
          pendapatan: income,
          biaya: feedUsageCost + expense,
        };
      }),
    [feedRecords, financeRecords, last7Dates],
  );

  const gradeData = [
    { name: "Grade A", value: gradeAToday },
    { name: "Grade B", value: gradeBToday },
    { name: "Retak", value: crackedToday },
    { name: "Abnormal", value: abnormalToday },
  ].filter((item) => item.value > 0);

  const reminders = useMemo<Reminder[]>(() => {
    const list: Reminder[] = [];

    healthRecords
      .filter((record) => record.status !== "Selesai")
      .forEach((record) => {
        const days = diffDays(record.date, today);
        if (days <= 7) {
          list.push({
            id: `health-${record.id}`,
            title: `${record.category}: ${record.name}`,
            detail: `${getFlockName(record.flockId)} - ${days < 0 ? "terlewat" : "jatuh tempo"} ${formatDate(record.date)}`,
            due: record.date,
            severity: record.status === "Perlu tindakan" || days < 0 ? "danger" : "warning",
            icon: record.category === "Vaksin" ? Syringe : Stethoscope,
          });
        }
      });

    flockPerformance.forEach((performance) => {
      if (performance.daysOfFeed > 0 && performance.daysOfFeed < 4) {
        list.push({
          id: `feed-${performance.flock.id}`,
          title: `Stok pakan ${performance.flock.name} menipis`,
          detail: `Sisa ${formatDecimal(performance.daysOfFeed, 1)} hari pada konsumsi rata-rata ${formatNumber(performance.avgFeed)} kg/hari.`,
          due: today,
          severity: performance.daysOfFeed < 2 ? "danger" : "warning",
          icon: Wheat,
        });
      }

      if (performance.targetGap < -5) {
        list.push({
          id: `production-${performance.flock.id}`,
          title: `Produksi ${performance.flock.name} turun`,
          detail: `HD production ${formatPercent(performance.productionRate)}, target ${formatPercent(performance.flock.targetProduction)}.`,
          due: today,
          severity: "danger",
          icon: TrendingDown,
        });
      }

      const daysToCulling = diffDays(performance.flock.plannedCullingDate, today);
      if (daysToCulling >= 0 && daysToCulling <= 60) {
        list.push({
          id: `culling-${performance.flock.id}`,
          title: `Jadwal panen/afkir ${performance.flock.name}`,
          detail: `Rencana ${formatDate(performance.flock.plannedCullingDate)} atau ${daysToCulling} hari lagi.`,
          due: performance.flock.plannedCullingDate,
          severity: daysToCulling < 30 ? "warning" : "info",
          icon: CalendarClock,
        });
      }

      if (performance.mortalityRate > 4) {
        list.push({
          id: `mortality-${performance.flock.id}`,
          title: `Mortalitas ${performance.flock.name} perlu dicek`,
          detail: `Akumulasi mati/afkir ${formatPercent(performance.mortalityRate)} dari populasi awal.`,
          due: today,
          severity: "warning",
          icon: AlertTriangle,
        });
      }
    });

    if (list.length === 0) {
      list.push({
        id: "all-clear",
        title: "Operasional stabil",
        detail: "Tidak ada reminder kritis berdasarkan data hari ini.",
        due: today,
        severity: "success",
        icon: CheckCircle2,
      });
    }

    return list.sort((a, b) => a.due.localeCompare(b.due)).slice(0, 8);
  }, [flockPerformance, getFlockName, healthRecords, today]);

  const buildSummary = (days: number) => {
    const since = isoDaysAgo(days - 1);
    const productions = productionRecords.filter((record) => record.date >= since);
    const feeds = feedRecords.filter((record) => record.date >= since);
    const finances = financeRecords.filter((record) => record.date >= since);
    const eggs = productions.reduce((sum, record) => sum + record.eggCount, 0);
    const feedKg = feeds.reduce((sum, record) => sum + record.usedKg, 0);
    const deaths = productions.reduce((sum, record) => sum + record.deaths, 0);
    const income = finances.filter((record) => record.type === "Pemasukan").reduce((sum, record) => sum + record.amount, 0);
    const expense = finances.filter((record) => record.type === "Pengeluaran").reduce((sum, record) => sum + record.amount, 0);
    const soldEggs = finances
      .filter((record) => record.type === "Pemasukan" && record.category === "Penjualan telur")
      .reduce((sum, record) => sum + (record.soldEggs ?? 0), 0);

    return {
      eggs,
      soldEggs,
      feedKg,
      deaths,
      income,
      expense,
      margin: income - expense,
      fcr: safeDivide(feedKg, eggs * 0.062),
    };
  };

  const dailySummary = buildSummary(1);
  const weeklySummary = buildSummary(7);
  const monthlySummary = buildSummary(30);

  const reportTables = useMemo<ReportTable[]>(
    () => [
      {
        title: "Ringkasan KPI",
        headers: ["Metrik", "Nilai"],
        rows: [
          ["Populasi aktif", formatNumber(activePopulation)],
          ["Total telur diproduksi", formatNumber(totalEggProduced)],
          ["Telur terjual tercatat", formatNumber(soldEggsTotal)],
          ["Stok telur belum terjual", formatNumber(unsoldEggStock)],
          ["Produksi telur hari ini", formatNumber(eggToday)],
          ["HD production hari ini", formatPercent(productionRateToday)],
          ["FCR 7 hari", formatDecimal(weeklyFcr, 2)],
          ["Stok pakan", `${formatNumber(feedStockTotal)} kg`],
          ["Margin total", formatCurrency(marginTotal)],
        ],
      },
      {
        title: "Performa Kandang",
        headers: ["Kandang", "Strain", "Umur", "Populasi aktif", "Produksi", "HD production", "FCR", "Stok pakan"],
        rows: flockPerformance.map((item) => [
          item.flock.name,
          item.flock.strain,
          `${item.flock.ageWeeks} minggu`,
          formatNumber(item.population),
          formatNumber(item.latestProduction),
          formatPercent(item.productionRate),
          formatDecimal(item.fcr, 2),
          `${formatNumber(item.latestStock)} kg`,
        ]),
      },
      {
        title: "Reminder",
        headers: ["Prioritas", "Detail", "Tanggal"],
        rows: reminders.map((item) => [item.title, item.detail, formatDate(item.due)]),
      },
    ],
    [
      activePopulation,
      eggToday,
      feedStockTotal,
      flockPerformance,
      marginTotal,
      productionRateToday,
      reminders,
      soldEggsTotal,
      totalEggProduced,
      unsoldEggStock,
      weeklyFcr,
    ],
  );

  const handleDailySubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const flockId = dailyForm.flockId;
    const eggCount = asNumber(dailyForm.eggCount);
    const feedUsedKg = gramsToKg(dailyForm.feedUsedKg);
    const deaths = asNumber(dailyForm.deaths);
    const previousRecord = editingProductionId
      ? productionRecords.find((record) => record.id === editingProductionId)
      : undefined;

    if (!flockId || eggCount <= 0) return;

    const record: ProductionRecord = {
      id: editingProductionId ?? `prod-${Date.now()}`,
      date: dailyForm.date,
      flockId,
      eggCount,
      gradeA: asNumber(dailyForm.gradeA),
      gradeB: asNumber(dailyForm.gradeB),
      cracked: asNumber(dailyForm.cracked),
      abnormal: asNumber(dailyForm.abnormal),
      deaths,
      note: dailyForm.note,
    };

    setProductionRecords((current) =>
      editingProductionId
        ? current.map((item) => (item.id === editingProductionId ? record : item))
        : [record, ...current],
    );

    if (!editingProductionId && feedUsedKg > 0) {
      const latestFeed = latestFeedByFlock.get(flockId);
      setFeedRecords((current) => [
        {
          id: `feed-used-${Date.now()}`,
          date: dailyForm.date,
          flockId,
          incomingKg: 0,
          usedKg: feedUsedKg,
          stockKg: Math.max(0, (latestFeed?.stockKg ?? 0) - feedUsedKg),
          pricePerKg: latestFeed?.pricePerKg ?? 7_200,
          feedType: latestFeed?.feedType ?? "Layer mash",
        },
        ...current,
      ]);
    }

    if (previousRecord) {
      setFlocks((current) =>
        current.map((flock) => {
          if (previousRecord.flockId === flockId && flock.id === flockId) {
            return { ...flock, deaths: Math.max(0, flock.deaths + deaths - previousRecord.deaths) };
          }
          if (previousRecord.flockId !== flockId && flock.id === previousRecord.flockId) {
            return { ...flock, deaths: Math.max(0, flock.deaths - previousRecord.deaths) };
          }
          if (previousRecord.flockId !== flockId && flock.id === flockId) {
            return { ...flock, deaths: flock.deaths + deaths };
          }
          return flock;
        }),
      );
    } else if (deaths > 0) {
      setFlocks((current) =>
        current.map((flock) => (flock.id === flockId ? { ...flock, deaths: flock.deaths + deaths } : flock)),
      );
    }

    setDailyForm((current) => ({
      ...createDailyForm(flockId),
      date: current.date,
      flockId,
    }));
    setEditingProductionId(null);
  };

  const startProductionEdit = (record: ProductionRecord) => {
    setEditingProductionId(record.id);
    setDailyForm({
      date: record.date,
      flockId: record.flockId,
      eggCount: String(record.eggCount),
      gradeA: String(record.gradeA),
      gradeB: String(record.gradeB),
      cracked: String(record.cracked),
      abnormal: String(record.abnormal),
      feedUsedKg: "",
      deaths: String(record.deaths),
      note: record.note,
    });
    setActiveTab("produksi");
    window.setTimeout(() => {
      dailyFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      dailyFormRef.current?.querySelector("input")?.focus();
    }, 0);
  };

  const cancelProductionEdit = () => {
    setEditingProductionId(null);
    setDailyForm((current) => createDailyForm(current.flockId));
  };

  const deleteProductionRecord = (record: ProductionRecord) => {
    setProductionRecords((current) => current.filter((item) => item.id !== record.id));
    if (record.deaths > 0) {
      setFlocks((current) =>
        current.map((flock) =>
          flock.id === record.flockId ? { ...flock, deaths: Math.max(0, flock.deaths - record.deaths) } : flock,
        ),
      );
    }
    if (editingProductionId === record.id) {
      cancelProductionEdit();
    }
  };

  const startFinanceEdit = (record: FinanceRecord) => {
    setEditingFinanceId(record.id);
    setFinanceForm({
      date: record.date,
      type: record.type,
      category: record.category,
      description: record.description,
      amount: String(record.amount),
      soldEggs: record.soldEggs ? String(record.soldEggs) : "",
    });
    setActiveTab("keuangan");
    window.setTimeout(() => {
      financeFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      financeFormRef.current?.querySelector("input")?.focus();
    }, 0);
  };

  const cancelFinanceEdit = () => {
    setEditingFinanceId(null);
    setFinanceForm((current) => ({
      ...createFinanceForm(),
      date: current.date,
      type: current.type,
      category: current.category,
    }));
  };

  const deleteFinanceRecord = (record: FinanceRecord) => {
    setFinanceRecords((current) => current.filter((item) => item.id !== record.id));
    if (editingFinanceId === record.id) {
      cancelFinanceEdit();
    }
  };

  const handleFlockSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const initialPopulationValue = asNumber(flockForm.initialPopulation);
    if (!flockForm.name || initialPopulationValue <= 0) return;

    const id = editingFlockId ?? `flock-${Date.now()}`;
    const nextFlock: Flock = {
      id,
      name: flockForm.name,
      strain: flockForm.strain || "Layer strain",
      ageWeeks: asNumber(flockForm.ageWeeks),
      initialPopulation: initialPopulationValue,
      deaths: asNumber(flockForm.deaths),
      culled: asNumber(flockForm.culled),
      startedAt: flockForm.startedAt,
      houseType: flockForm.houseType,
      targetProduction: asNumber(flockForm.targetProduction),
      plannedCullingDate: flockForm.plannedCullingDate,
    };

    setFlocks((current) =>
      editingFlockId ? current.map((flock) => (flock.id === editingFlockId ? nextFlock : flock)) : [...current, nextFlock],
    );
    if (!editingFlockId) {
      setDailyForm((current) => ({ ...current, flockId: id }));
      setFeedForm((current) => ({ ...current, flockId: id }));
      setHealthForm((current) => ({ ...current, flockId: id }));
    }
    setEditingFlockId(null);
    setFlockForm(createFlockForm());
  };

  const handleFeedSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const flockId = feedForm.flockId;
    if (!flockId) return;

    const incomingKg = asNumber(feedForm.incomingKg);
    const usedKg = gramsToKg(feedForm.usedKg);
    const latestFeed = latestFeedByFlock.get(flockId);
    const stockKg = feedForm.stockKg
      ? asNumber(feedForm.stockKg)
      : Math.max(0, (latestFeed?.stockKg ?? 0) + incomingKg - usedKg);

    setFeedRecords((current) => [
      {
        id: `feed-${Date.now()}`,
        date: feedForm.date,
        flockId,
        incomingKg,
        usedKg,
        stockKg,
        pricePerKg: asNumber(feedForm.pricePerKg),
        feedType: feedForm.feedType,
      },
      ...current,
    ]);
    setFeedForm((current) => ({ ...createFeedForm(flockId), date: current.date }));
  };

  const handleHealthSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!healthForm.flockId || !healthForm.name) return;

    const deaths = asNumber(healthForm.deaths);
    setHealthRecords((current) => [
      {
        id: `health-${Date.now()}`,
        date: healthForm.date,
        flockId: healthForm.flockId,
        category: healthForm.category,
        name: healthForm.name,
        status: healthForm.status,
        dosage: healthForm.dosage,
        deaths,
        note: healthForm.note,
      },
      ...current,
    ]);

    if (deaths > 0) {
      setFlocks((current) =>
        current.map((flock) =>
          flock.id === healthForm.flockId ? { ...flock, deaths: flock.deaths + deaths } : flock,
        ),
      );
    }

    setHealthForm((current) => ({ ...createHealthForm(current.flockId), date: current.date }));
  };

  const handleFinanceSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = asNumber(financeForm.amount);
    if (!financeForm.description || amount <= 0) return;
    const isEggSale = financeForm.type === "Pemasukan" && financeForm.category === "Penjualan telur";

    const nextRecord: FinanceRecord = {
      id: editingFinanceId ?? `finance-${Date.now()}`,
      date: financeForm.date,
      type: financeForm.type,
      category: financeForm.category,
      description: financeForm.description,
      amount,
      soldEggs: isEggSale ? asNumber(financeForm.soldEggs) : 0,
    };

    setFinanceRecords((current) =>
      editingFinanceId
        ? current.map((record) => (record.id === editingFinanceId ? nextRecord : record))
        : [nextRecord, ...current],
    );
    setEditingFinanceId(null);
    setFinanceForm((current) => ({ ...createFinanceForm(), date: current.date, type: current.type, category: current.category }));
  };

  const exportExcel = () => {
    const tables = reportTables
      .map(
        (table) => `
          <h2>${escapeHtml(table.title)}</h2>
          <table>
            <thead><tr>${table.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
            <tbody>
              ${table.rows
                .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`)
                .join("")}
            </tbody>
          </table>
        `,
      )
      .join("");

    const html = `<!doctype html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #18181b; }
            h1 { font-size: 22px; }
            h2 { margin-top: 24px; font-size: 16px; }
            table { border-collapse: collapse; width: 100%; margin-top: 8px; }
            th, td { border: 1px solid #d4d4d8; padding: 8px; text-align: left; }
            th { background: #f4f4f5; }
          </style>
        </head>
        <body>
          <h1>Laporan LayerFarm OS - ${escapeHtml(formatDate(today))}</h1>
          ${tables}
        </body>
      </html>`;

    downloadBlob(html, `laporan-layerfarm-${today}.xls`, "application/vnd.ms-excel;charset=utf-8");
  };

  const exportPdf = () => window.print();

  const resetDemoData = () => {
    const nextFlocks = buildInitialFlocks();
    setFlocks(nextFlocks);
    setProductionRecords(buildInitialProduction());
    setFeedRecords(buildInitialFeed());
    setHealthRecords(buildInitialHealth());
    setFinanceRecords(buildInitialFinance());
    setDailyForm(createDailyForm(nextFlocks[0].id));
    setFeedForm(createFeedForm(nextFlocks[0].id));
    setHealthForm(createHealthForm(nextFlocks[0].id));
    setFinanceForm(createFinanceForm());
    setEditingFlockId(null);
    setEditingProductionId(null);
    setEditingFinanceId(null);
  };

  const focusFlockForm = () => {
    setEditingFlockId(null);
    setFlockForm(createFlockForm());
    setActiveTab("kandang");
    window.setTimeout(() => {
      flockFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      flockFormRef.current?.querySelector("input")?.focus();
    }, 0);
  };

  const startFlockEdit = (flock: Flock) => {
    setEditingFlockId(flock.id);
    setFlockForm({
      name: flock.name,
      strain: flock.strain,
      ageWeeks: String(flock.ageWeeks),
      initialPopulation: String(flock.initialPopulation),
      deaths: String(flock.deaths),
      culled: String(flock.culled),
      startedAt: flock.startedAt,
      houseType: flock.houseType,
      targetProduction: String(flock.targetProduction),
      plannedCullingDate: flock.plannedCullingDate,
    });
    setActiveTab("kandang");
    window.setTimeout(() => {
      flockFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      flockFormRef.current?.querySelector("input")?.focus();
    }, 0);
  };

  const cancelFlockEdit = () => {
    setEditingFlockId(null);
    setFlockForm(createFlockForm());
  };

  const removeFlock = (flockId: string) => {
    const remainingFlocks = flocks.filter((flock) => flock.id !== flockId);
    const nextFlockId = remainingFlocks[0]?.id ?? "";

    setFlocks(remainingFlocks);
    setProductionRecords((current) => current.filter((record) => record.flockId !== flockId));
    setFeedRecords((current) => current.filter((record) => record.flockId !== flockId));
    setHealthRecords((current) => current.filter((record) => record.flockId !== flockId));
    setDailyForm((current) => (current.flockId === flockId ? createDailyForm(nextFlockId) : current));
    setFeedForm((current) => (current.flockId === flockId ? createFeedForm(nextFlockId) : current));
    setHealthForm((current) => (current.flockId === flockId ? createHealthForm(nextFlockId) : current));
    if (editingFlockId === flockId) {
      cancelFlockEdit();
    }
  };

  const renderFlockSelect = (value: string, onValueChange: (value: string) => void) => (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="rounded-[8px] border-zinc-300 bg-white">
        <SelectValue placeholder="Pilih kandang" />
      </SelectTrigger>
      <SelectContent>
        {flocks.map((flock) => (
          <SelectItem key={flock.id} value={flock.id}>
            {flock.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const logoutAdmin = () => {
    clearAdminSession();
    window.location.assign("/login");
  };

  const cloudStatusText = {
    loading: "Sinkron cloud",
    saving: "Menyimpan cloud",
    synced: "Cloud tersimpan",
    offline: "Mode offline",
  }[cloudStatus];

  return (
    <div className="farm-page min-h-screen bg-yellow-50 text-zinc-950">
      <header className="no-print sticky top-0 z-40 border-b border-amber-200 bg-amber-50/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-3 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-11 w-11" />
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">LayerFarm OS</p>
              <h1 className="break-words text-lg font-bold leading-tight text-zinc-950 sm:text-2xl">
                Manajemen Peternakan Ayam Petelur
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              variant="outline"
              aria-label="Keluar admin"
              className="h-10 w-10 min-w-0 overflow-hidden rounded-[8px] border-amber-300 bg-white/75 px-0 text-xs hover:bg-yellow-100 sm:w-auto sm:px-4 sm:text-sm"
              onClick={logoutAdmin}
            >
              <LogOut className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="hidden sm:inline">Keluar</span>
            </Button>
            <Button
              variant="outline"
              aria-label="Reset data"
              className="h-10 w-10 min-w-0 overflow-hidden rounded-[8px] border-amber-300 bg-white/75 px-0 text-xs hover:bg-yellow-100 sm:w-auto sm:px-4 sm:text-sm"
              onClick={resetDemoData}
            >
              <ShieldCheck className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
            <Button
              variant="outline"
              aria-label="Export PDF"
              className="h-10 w-10 min-w-0 overflow-hidden rounded-[8px] border-amber-300 bg-white/75 px-0 text-xs hover:bg-yellow-100 sm:w-auto sm:px-4 sm:text-sm"
              onClick={exportPdf}
            >
              <Printer className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
            <Button
              aria-label="Export Excel"
              className="h-10 w-10 min-w-0 overflow-hidden rounded-[8px] bg-amber-500 px-0 text-xs text-amber-950 hover:bg-amber-600 sm:w-auto sm:px-4 sm:text-sm"
              onClick={exportExcel}
            >
              <FileSpreadsheet className="h-4 w-4 shrink-0 sm:mr-2" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 pb-28 pt-4 sm:px-6 sm:py-5 lg:px-8">
        <section className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-[6px] border-amber-300 bg-yellow-100 text-amber-800">
                Operasional {formatDate(today)}
              </Badge>
              <Badge variant="outline" className="rounded-[6px] border-zinc-200 bg-white text-zinc-600">
                {flocks.length} kandang aktif
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "rounded-[6px]",
                  cloudStatus === "offline"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-sky-200 bg-sky-50 text-sky-700",
                )}
              >
                {cloudStatusText}
              </Badge>
            </div>
            <h2 className="max-w-3xl text-xl font-bold tracking-normal text-zinc-950 sm:text-3xl">
              Kontrol harian produksi, pakan, kesehatan, dan keuangan.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
              Data tersimpan di cloud admin dan ikut sinkron di web maupun PWA LayerFarm.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 rounded-[8px] border border-zinc-200 bg-white p-3 text-sm shadow-sm sm:min-w-[360px]">
            <div>
              <p className="text-zinc-500">Income</p>
              <p className="font-bold text-amber-800">{formatCurrency(incomeTotal)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Expense</p>
              <p className="font-bold text-rose-700">{formatCurrency(expenseTotal)}</p>
            </div>
            <div>
              <p className="text-zinc-500">Margin</p>
              <p className={cn("font-bold", marginTotal >= 0 ? "text-amber-800" : "text-rose-700")}>
                {formatCurrency(marginTotal)}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Margin rate</p>
              <p className="font-bold text-zinc-950">{formatPercent(marginRate)}</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <MetricCard
            title="Populasi aktif"
            value={formatNumber(activePopulation)}
            detail={`${formatNumber(totalDeaths)} mati, ${formatNumber(totalCulled)} afkir`}
            icon={Users}
            tone="sky"
          />
          <MetricCard
            title="Produksi hari ini"
            value={formatNumber(eggToday)}
            detail={`HD production ${formatPercent(productionRateToday)}`}
            icon={Egg}
            tone="green"
            trend={productionRateToday >= 88 ? "up" : "down"}
          />
          <MetricCard
            title="Stok telur"
            value={formatNumber(unsoldEggStock)}
            detail={`${formatNumber(soldEggsTotal)} telur terjual tercatat`}
            icon={PackageCheck}
            tone="amber"
          />
          <MetricCard
                  title="Stok pakan"
                  value={`${formatCompact(feedStockTotal)} kg`}
                  detail={`${formatNumber(feedUsedToday * 1000)} gram terpakai hari ini`}
                  icon={Wheat}
            tone="amber"
          />
          <MetricCard
            title="FCR 7 hari"
            value={formatDecimal(weeklyFcr, 2)}
            detail={`Mortalitas kumulatif ${formatPercent(mortalityRate)}`}
            icon={Activity}
            tone="violet"
            trend={weeklyFcr <= 2.1 ? "up" : "down"}
          />
        </section>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <div className="no-print hidden overflow-x-auto md:block">
            <TabsList className="h-auto min-w-max justify-start gap-1 rounded-[8px] bg-zinc-200/70 p-1">
              {appTabs.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} className="rounded-[6px]">
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
              <Panel title="Grafik Produksi Telur" icon={BarChart3}>
                <ChartContainer config={productionChartConfig} className="h-[300px] w-full aspect-auto">
                  <AreaChart data={productionChartData} margin={{ left: 8, right: 8, top: 12, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={48} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="produksi"
                      stroke="var(--color-produksi)"
                      fill="var(--color-produksi)"
                      fillOpacity={0.18}
                      strokeWidth={2.5}
                    />
                    <Line type="monotone" dataKey="target" stroke="var(--color-target)" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ChartContainer>
              </Panel>

              <Panel
                title="Reminder Prioritas"
                icon={Bell}
                action={
                  <Badge variant="outline" className="rounded-[6px] border-zinc-200 text-zinc-600">
                    {reminders.length} item
                  </Badge>
                }
              >
                <div className="space-y-3">
                  {reminders.map((item) => (
                    <div key={item.id} className={cn("rounded-[8px] border p-3", severityClasses[item.severity])}>
                      <div className="flex items-start gap-3">
                        <item.icon className="mt-0.5 h-5 w-5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold leading-snug">{item.title}</p>
                          <p className="mt-1 text-sm opacity-90">{item.detail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              <Panel title="Grading Telur Hari Ini" icon={ClipboardList}>
                {gradeData.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-[150px_1fr] sm:items-center xl:grid-cols-1">
                    <ChartContainer config={{ telur: { label: "Telur", color: "#f59e0b" } }} className="mx-auto h-[190px] w-full max-w-[220px] aspect-auto">
                      <PieChart>
                        <Pie data={gradeData} dataKey="value" nameKey="name" innerRadius={48} outerRadius={78} paddingAngle={2}>
                          {gradeData.map((entry, index) => (
                            <Cell key={entry.name} fill={gradeColors[index % gradeColors.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                      </PieChart>
                    </ChartContainer>
                    <div className="space-y-2">
                      {gradeData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between gap-3 text-sm">
                          <span className="flex items-center gap-2 text-zinc-600">
                            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ backgroundColor: gradeColors[index] }} />
                            {item.name}
                          </span>
                          <span className="font-semibold text-zinc-950">{formatNumber(item.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <EmptyState title="Belum ada produksi hari ini" detail="Input produksi harian untuk melihat grading." />
                )}
              </Panel>

              <Panel title="Pakan dan Mortalitas" icon={Activity}>
                <ChartContainer config={feedChartConfig} className="h-[260px] w-full overflow-hidden aspect-auto">
                  <ComposedChart data={feedAndMortalityData} margin={{ left: 4, right: 18, top: 12, bottom: 4 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} interval="preserveStartEnd" />
                    <YAxis yAxisId="left" tickLine={false} axisLine={false} tickMargin={6} width={38} fontSize={12} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={6}
                      width={24}
                      fontSize={12}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar yAxisId="left" dataKey="pakan" fill="var(--color-pakan)" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="mortalitas" stroke="var(--color-mortalitas)" strokeWidth={2.5} />
                  </ComposedChart>
                </ChartContainer>
              </Panel>

              <Panel title="Biaya Harian dan Pendapatan" icon={Coins}>
                <ChartContainer config={financeChartConfig} className="h-[260px] w-full aspect-auto">
                  <AreaChart data={financeChartData} margin={{ left: 0, right: 8, top: 12, bottom: 0 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} width={58} tickFormatter={(value) => formatCompact(Number(value))} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area dataKey="pendapatan" type="monotone" fill="var(--color-pendapatan)" fillOpacity={0.14} stroke="var(--color-pendapatan)" strokeWidth={2} />
                    <Area dataKey="biaya" type="monotone" fill="var(--color-biaya)" fillOpacity={0.12} stroke="var(--color-biaya)" strokeWidth={2} />
                  </AreaChart>
                </ChartContainer>
              </Panel>
            </div>

            <Panel title="Performa Per Kandang" icon={Warehouse}>
              <div className="grid gap-3 md:hidden">
                {flockPerformance.map((item) => (
                  <div key={item.flock.id} className="rounded-[8px] border border-zinc-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-zinc-950">{item.flock.name}</p>
                        <p className="truncate text-xs text-zinc-500">{item.flock.strain}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "shrink-0 rounded-[6px] text-[11px]",
                          item.targetGap >= -3
                            ? "border-amber-300 bg-yellow-100 text-amber-800"
                            : item.targetGap >= -6
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-red-200 bg-red-50 text-red-700",
                        )}
                      >
                        {item.targetGap >= -3 ? "On target" : item.targetGap >= -6 ? "Pantau" : "Intervensi"}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-[8px] bg-zinc-50 p-2">
                        <p className="text-xs text-zinc-500">Populasi</p>
                        <p className="font-semibold">{formatNumber(item.population)}</p>
                      </div>
                      <div className="rounded-[8px] bg-zinc-50 p-2">
                        <p className="text-xs text-zinc-500">Produksi</p>
                        <p className="font-semibold">{formatNumber(item.latestProduction)}</p>
                      </div>
                      <div className="rounded-[8px] bg-zinc-50 p-2">
                        <p className="text-xs text-zinc-500">FCR</p>
                        <p className="font-semibold">{formatDecimal(item.fcr, 2)}</p>
                      </div>
                      <div className="rounded-[8px] bg-zinc-50 p-2">
                        <p className="text-xs text-zinc-500">Stok</p>
                        <p className="font-semibold">{formatNumber(item.latestStock)} kg</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-zinc-500">
                        <span>HD production</span>
                        <span>{formatPercent(item.productionRate)}</span>
                      </div>
                      <Progress value={Math.min(100, item.productionRate)} className="h-2 rounded-[4px] bg-zinc-100" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left text-sm">
                  <thead className="border-b border-zinc-200 text-xs uppercase tracking-[0.08em] text-zinc-500">
                    <tr>
                      <th className="py-3 pr-4">Kandang</th>
                      <th className="py-3 pr-4">Strain</th>
                      <th className="py-3 pr-4">Populasi aktif</th>
                      <th className="py-3 pr-4">Produksi</th>
                      <th className="py-3 pr-4">HD production</th>
                      <th className="py-3 pr-4">FCR</th>
                      <th className="py-3 pr-4">Stok pakan</th>
                      <th className="py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {flockPerformance.map((item) => (
                      <tr key={item.flock.id}>
                        <td className="py-3 pr-4 font-semibold text-zinc-950">{item.flock.name}</td>
                        <td className="py-3 pr-4 text-zinc-600">{item.flock.strain}</td>
                        <td className="py-3 pr-4">{formatNumber(item.population)}</td>
                        <td className="py-3 pr-4">{formatNumber(item.latestProduction)}</td>
                        <td className="py-3 pr-4">
                          <div className="flex min-w-[160px] items-center gap-3">
                            <Progress value={Math.min(100, item.productionRate)} className="h-2 rounded-[4px] bg-zinc-100" />
                            <span className="w-12 text-right font-semibold">{formatPercent(item.productionRate)}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">{formatDecimal(item.fcr, 2)}</td>
                        <td className="py-3 pr-4">{formatNumber(item.latestStock)} kg</td>
                        <td className="py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "rounded-[6px]",
                              item.targetGap >= -3
                                ? "border-amber-300 bg-yellow-100 text-amber-800"
                                : item.targetGap >= -6
                                  ? "border-amber-200 bg-amber-50 text-amber-700"
                                  : "border-red-200 bg-red-50 text-red-700",
                            )}
                          >
                            {item.targetGap >= -3 ? "On target" : item.targetGap >= -6 ? "Pantau" : "Intervensi"}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </TabsContent>

          <TabsContent value="kandang" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.3fr]">
              <Panel title={editingFlockId ? "Edit Flock/Kandang" : "Tambah Flock/Kandang"} icon={editingFlockId ? Pencil : Plus}>
                <form ref={flockFormRef} onSubmit={handleFlockSubmit} className="grid gap-3 sm:grid-cols-2">
                  {editingFlockId ? (
                    <div className="rounded-[8px] border border-amber-200 bg-yellow-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2">
                      Mode edit aktif. Ubah nama atau detail kandang lalu tekan <span className="font-semibold">Update Kandang</span>.
                    </div>
                  ) : null}
                  <Field label="Nama kandang">
                    <Input className="rounded-[8px]" value={flockForm.name} onChange={(event) => setFlockForm((current) => ({ ...current, name: event.target.value }))} placeholder="Kandang D4" />
                  </Field>
                  <Field label="Strain">
                    <Input className="rounded-[8px]" value={flockForm.strain} onChange={(event) => setFlockForm((current) => ({ ...current, strain: event.target.value }))} placeholder="Hy-Line Brown" />
                  </Field>
                  <Field label="Umur ayam (minggu)">
                    <Input type="number" min="0" className="rounded-[8px]" value={flockForm.ageWeeks} onChange={(event) => setFlockForm((current) => ({ ...current, ageWeeks: event.target.value }))} />
                  </Field>
                  <Field label="Jumlah awal">
                    <Input type="number" min="0" className="rounded-[8px]" value={flockForm.initialPopulation} onChange={(event) => setFlockForm((current) => ({ ...current, initialPopulation: event.target.value }))} />
                  </Field>
                  <Field label="Jumlah mati">
                    <Input type="number" min="0" className="rounded-[8px]" value={flockForm.deaths} onChange={(event) => setFlockForm((current) => ({ ...current, deaths: event.target.value }))} />
                  </Field>
                  <Field label="Jumlah afkir">
                    <Input type="number" min="0" className="rounded-[8px]" value={flockForm.culled} onChange={(event) => setFlockForm((current) => ({ ...current, culled: event.target.value }))} />
                  </Field>
                  <Field label="Tipe kandang">
                    <Input className="rounded-[8px]" value={flockForm.houseType} onChange={(event) => setFlockForm((current) => ({ ...current, houseType: event.target.value }))} />
                  </Field>
                  <Field label="Target produksi (%)">
                    <Input type="number" min="0" max="100" className="rounded-[8px]" value={flockForm.targetProduction} onChange={(event) => setFlockForm((current) => ({ ...current, targetProduction: event.target.value }))} />
                  </Field>
                  <Field label="Tanggal masuk">
                    <Input type="date" className="rounded-[8px]" value={flockForm.startedAt} onChange={(event) => setFlockForm((current) => ({ ...current, startedAt: event.target.value }))} />
                  </Field>
                  <Field label="Rencana panen/afkir">
                    <Input type="date" className="rounded-[8px]" value={flockForm.plannedCullingDate} onChange={(event) => setFlockForm((current) => ({ ...current, plannedCullingDate: event.target.value }))} />
                  </Field>
                  <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[1fr_auto]">
                    <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600" type="submit">
                      {editingFlockId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingFlockId ? "Update Kandang" : "Simpan Kandang"}
                    </Button>
                    {editingFlockId ? (
                      <Button type="button" variant="outline" className="rounded-[8px] border-zinc-300" onClick={cancelFlockEdit}>
                        Batal Edit
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Panel>

              <Panel
                title="Data Kandang/Flock"
                icon={Warehouse}
                action={
                  <Button
                    type="button"
                    onClick={focusFlockForm}
                    className="h-9 rounded-[8px] bg-amber-500 px-3 text-xs text-amber-950 hover:bg-amber-600 sm:text-sm"
                  >
                    <Plus className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Tambah Kandang</span>
                    <span className="sm:hidden">Tambah</span>
                  </Button>
                }
              >
                {flockPerformance.length === 0 ? (
                  <EmptyState
                    title="Belum ada kandang"
                    detail="Tambahkan kandang baru untuk mulai mencatat populasi, produksi telur, pakan, dan kesehatan."
                  />
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    {flockPerformance.map((item) => (
                      <div key={item.flock.id} className="rounded-[8px] border border-zinc-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-zinc-950">{item.flock.name}</p>
                          <p className="text-sm text-zinc-500">{item.flock.strain} - {item.flock.houseType}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className="rounded-[6px] border-zinc-200">
                            {item.flock.ageWeeks} minggu
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-[8px] border-amber-200 text-amber-800 hover:bg-yellow-100"
                            onClick={() => startFlockEdit(item.flock)}
                            aria-label={`Edit ${item.flock.name}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-[8px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label={`Hapus ${item.flock.name}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-sm rounded-[8px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus {item.flock.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data kandang ini akan dihapus dari daftar bersama riwayat produksi, pakan, dan kesehatan yang terhubung.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-[8px]">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-[8px] bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => removeFlock(item.flock.id)}
                                >
                                  Hapus Kandang
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-zinc-500">Awal</p>
                          <p className="font-semibold">{formatNumber(item.flock.initialPopulation)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Aktif</p>
                          <p className="font-semibold">{formatNumber(item.population)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Mati/Afkir</p>
                          <p className="font-semibold">{formatNumber(item.flock.deaths + item.flock.culled)}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Mortalitas</p>
                          <p className="font-semibold">{formatPercent(item.mortalityRate)}</p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="mb-1 flex justify-between text-xs text-zinc-500">
                          <span>HD production</span>
                          <span>{formatPercent(item.productionRate)}</span>
                        </div>
                        <Progress value={Math.min(100, item.productionRate)} className="h-2 rounded-[4px] bg-zinc-100" />
                      </div>
                    </div>
                    ))}
                  </div>
                )}
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="produksi" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <Panel title="Input Produksi Telur Harian" icon={Egg}>
                <form ref={dailyFormRef} onSubmit={handleDailySubmit} className="grid gap-3 sm:grid-cols-2">
                  {editingProductionId ? (
                    <div className="sm:col-span-2 rounded-[8px] border border-amber-200 bg-yellow-50 px-3 py-2 text-sm text-amber-900">
                      Mode edit aktif. Ubah data lalu tekan <span className="font-semibold">Update Produksi</span>.
                    </div>
                  ) : null}
                  <Field label="Tanggal">
                    <Input type="date" className="rounded-[8px]" value={dailyForm.date} onChange={(event) => setDailyForm((current) => ({ ...current, date: event.target.value }))} />
                  </Field>
                  <Field label="Kandang">
                    {renderFlockSelect(dailyForm.flockId, (value) => setDailyForm((current) => ({ ...current, flockId: value })))}
                  </Field>
                  <Field label="Total telur">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.eggCount} onChange={(event) => setDailyForm((current) => ({ ...current, eggCount: event.target.value }))} />
                  </Field>
                  <Field label="Grade A">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.gradeA} onChange={(event) => setDailyForm((current) => ({ ...current, gradeA: event.target.value }))} />
                  </Field>
                  <Field label="Grade B">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.gradeB} onChange={(event) => setDailyForm((current) => ({ ...current, gradeB: event.target.value }))} />
                  </Field>
                  <Field label="Telur retak">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.cracked} onChange={(event) => setDailyForm((current) => ({ ...current, cracked: event.target.value }))} />
                  </Field>
                  <Field label="Telur abnormal">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.abnormal} onChange={(event) => setDailyForm((current) => ({ ...current, abnormal: event.target.value }))} />
                  </Field>
                  <Field label="Pakan terpakai (gram)">
                    <Input type="number" min="0" step="1" className="rounded-[8px]" value={dailyForm.feedUsedKg} onChange={(event) => setDailyForm((current) => ({ ...current, feedUsedKg: event.target.value }))} placeholder="Contoh: 3300" />
                  </Field>
                  <Field label="Ayam mati hari ini">
                    <Input type="number" min="0" className="rounded-[8px]" value={dailyForm.deaths} onChange={(event) => setDailyForm((current) => ({ ...current, deaths: event.target.value }))} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Catatan">
                      <Textarea className="rounded-[8px]" value={dailyForm.note} onChange={(event) => setDailyForm((current) => ({ ...current, note: event.target.value }))} placeholder="Contoh: suhu tinggi, egg belt normal, grading selesai." />
                    </Field>
                  </div>
                  <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[1fr_auto]">
                    <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600" type="submit">
                      {editingProductionId ? <Pencil className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                      {editingProductionId ? "Update Produksi" : "Simpan Produksi"}
                    </Button>
                    {editingProductionId ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="rounded-[8px] border-zinc-300"
                        onClick={cancelProductionEdit}
                      >
                        Batal Edit
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Panel>

              <Panel title="Riwayat Produksi dan Produktivitas" icon={ClipboardList}>
                <div className="grid gap-3">
                  {productionRecords.slice(0, 14).map((record) => (
                    <div key={record.id} className="rounded-[8px] border border-zinc-200 p-3 text-sm sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-950">{getFlockName(record.flockId)}</p>
                          <p className="text-xs text-zinc-500">{formatDate(record.date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="rounded-[8px] bg-yellow-100 px-3 py-1.5 text-right text-amber-900">
                            <p className="text-base font-bold leading-none">{formatNumber(record.eggCount)}</p>
                            <p className="mt-0.5 text-[11px] text-amber-700">telur</p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-[8px] border-amber-200 text-amber-800 hover:bg-yellow-100"
                            aria-label={`Edit produksi ${formatDate(record.date)} ${getFlockName(record.flockId)}`}
                            onClick={() => startProductionEdit(record)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-[8px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label={`Hapus produksi ${formatDate(record.date)} ${getFlockName(record.flockId)}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-sm rounded-[8px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus riwayat produksi?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Data produksi {formatDate(record.date)} untuk {getFlockName(record.flockId)} akan dihapus dari laporan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-[8px]">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-[8px] bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => deleteProductionRecord(record)}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-5">
                        <div className="rounded-[8px] bg-yellow-100 p-2 text-amber-800">
                          <p className="font-semibold">{formatNumber(record.gradeA)}</p>
                          <p>Grade A</p>
                        </div>
                        <div className="rounded-[8px] bg-sky-50 p-2 text-sky-700">
                          <p className="font-semibold">{formatNumber(record.gradeB)}</p>
                          <p>Grade B</p>
                        </div>
                        <div className="rounded-[8px] bg-amber-50 p-2 text-amber-700">
                          <p className="font-semibold">{formatNumber(record.cracked)}</p>
                          <p>Retak</p>
                        </div>
                        <div className="rounded-[8px] bg-red-50 p-2 text-red-700">
                          <p className="font-semibold">{formatNumber(record.abnormal)}</p>
                          <p>Abnormal</p>
                        </div>
                        <div className="rounded-[8px] bg-zinc-50 p-2 text-zinc-700">
                          <p className="font-semibold">{formatNumber(record.deaths)}</p>
                          <p>Mati</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="pakan" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <Panel title="Catatan Pakan Masuk dan Terpakai" icon={Truck}>
                <form onSubmit={handleFeedSubmit} className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tanggal">
                    <Input type="date" className="rounded-[8px]" value={feedForm.date} onChange={(event) => setFeedForm((current) => ({ ...current, date: event.target.value }))} />
                  </Field>
                  <Field label="Kandang">
                    {renderFlockSelect(feedForm.flockId, (value) => setFeedForm((current) => ({ ...current, flockId: value })))}
                  </Field>
                  <Field label="Jenis pakan">
                    <Input className="rounded-[8px]" value={feedForm.feedType} onChange={(event) => setFeedForm((current) => ({ ...current, feedType: event.target.value }))} />
                  </Field>
                  <Field label="Pakan masuk (kg)">
                    <Input type="number" min="0" className="rounded-[8px]" value={feedForm.incomingKg} onChange={(event) => setFeedForm((current) => ({ ...current, incomingKg: event.target.value }))} />
                  </Field>
                  <Field label="Pakan terpakai (gram)">
                    <Input type="number" min="0" step="1" className="rounded-[8px]" value={feedForm.usedKg} onChange={(event) => setFeedForm((current) => ({ ...current, usedKg: event.target.value }))} placeholder="Contoh: 3300" />
                  </Field>
                  <Field label="Stok akhir (kg)">
                    <Input type="number" min="0" className="rounded-[8px]" value={feedForm.stockKg} onChange={(event) => setFeedForm((current) => ({ ...current, stockKg: event.target.value }))} placeholder="Otomatis bila kosong" />
                  </Field>
                  <Field label="Harga/kg">
                    <Input type="number" min="0" className="rounded-[8px]" value={feedForm.pricePerKg} onChange={(event) => setFeedForm((current) => ({ ...current, pricePerKg: event.target.value }))} />
                  </Field>
                  <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600 sm:col-span-2" type="submit">
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Simpan Pakan
                  </Button>
                </form>
              </Panel>

              <Panel title="Stok Pakan dan FCR" icon={Wheat}>
                <div className="space-y-3">
                  {flockPerformance.map((item) => (
                    <div key={item.flock.id} className="rounded-[8px] border border-zinc-200 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">{item.flock.name}</p>
                          <p className="text-sm text-zinc-500">FCR {formatDecimal(item.fcr, 2)} - konsumsi {formatNumber(item.avgFeed)} kg/hari</p>
                        </div>
                        <Badge variant="outline" className={cn("rounded-[6px]", item.daysOfFeed < 4 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-amber-300 bg-yellow-100 text-amber-800")}>
                          {formatDecimal(item.daysOfFeed, 1)} hari stok
                        </Badge>
                      </div>
                      <div className="mt-3">
                        <div className="mb-1 flex justify-between text-xs text-zinc-500">
                          <span>{formatNumber(item.latestStock)} kg tersedia</span>
                          <span>Target aman 7 hari</span>
                        </div>
                        <Progress value={Math.min(100, safeDivide(item.daysOfFeed, 7) * 100)} className="h-2 rounded-[4px] bg-zinc-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="kesehatan" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <Panel title="Jadwal Vaksin, Obat, dan Treatment" icon={Syringe}>
                <form onSubmit={handleHealthSubmit} className="grid gap-3 sm:grid-cols-2">
                  <Field label="Tanggal">
                    <Input type="date" className="rounded-[8px]" value={healthForm.date} onChange={(event) => setHealthForm((current) => ({ ...current, date: event.target.value }))} />
                  </Field>
                  <Field label="Kandang">
                    {renderFlockSelect(healthForm.flockId, (value) => setHealthForm((current) => ({ ...current, flockId: value })))}
                  </Field>
                  <Field label="Kategori">
                    <Select value={healthForm.category} onValueChange={(value: HealthCategory) => setHealthForm((current) => ({ ...current, category: value }))}>
                      <SelectTrigger className="rounded-[8px] border-zinc-300 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Vaksin">Vaksin</SelectItem>
                        <SelectItem value="Obat">Obat</SelectItem>
                        <SelectItem value="Penyakit">Penyakit</SelectItem>
                        <SelectItem value="Treatment">Treatment</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Status">
                    <Select value={healthForm.status} onValueChange={(value: HealthStatus) => setHealthForm((current) => ({ ...current, status: value }))}>
                      <SelectTrigger className="rounded-[8px] border-zinc-300 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Terjadwal">Terjadwal</SelectItem>
                        <SelectItem value="Selesai">Selesai</SelectItem>
                        <SelectItem value="Perlu tindakan">Perlu tindakan</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nama vaksin/obat/penyakit">
                    <Input className="rounded-[8px]" value={healthForm.name} onChange={(event) => setHealthForm((current) => ({ ...current, name: event.target.value }))} />
                  </Field>
                  <Field label="Dosis / SOP">
                    <Input className="rounded-[8px]" value={healthForm.dosage} onChange={(event) => setHealthForm((current) => ({ ...current, dosage: event.target.value }))} />
                  </Field>
                  <Field label="Kematian terkait">
                    <Input type="number" min="0" className="rounded-[8px]" value={healthForm.deaths} onChange={(event) => setHealthForm((current) => ({ ...current, deaths: event.target.value }))} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Histori treatment">
                      <Textarea className="rounded-[8px]" value={healthForm.note} onChange={(event) => setHealthForm((current) => ({ ...current, note: event.target.value }))} placeholder="Catatan gejala, tindakan, respons ayam, atau follow-up." />
                    </Field>
                  </div>
                  <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600 sm:col-span-2" type="submit">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Simpan Kesehatan
                  </Button>
                </form>
              </Panel>

              <Panel title="Histori Kesehatan" icon={Stethoscope}>
                <div className="space-y-3">
                  {healthRecords.map((record) => (
                    <div key={record.id} className="rounded-[8px] border border-zinc-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-zinc-950">{record.name}</p>
                          <p className="text-sm text-zinc-500">{formatDate(record.date)} - {getFlockName(record.flockId)} - {record.category}</p>
                        </div>
                        <StatusBadge status={record.status} />
                      </div>
                      <div className="mt-3 grid gap-2 text-sm text-zinc-600 sm:grid-cols-3">
                        <p><span className="font-semibold text-zinc-800">Dosis:</span> {record.dosage || "-"}</p>
                        <p><span className="font-semibold text-zinc-800">Mati:</span> {record.deaths}</p>
                        <p><span className="font-semibold text-zinc-800">Catatan:</span> {record.note || "-"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="keuangan" className="mt-5 space-y-4">
            <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
              <Panel title="Input Keuangan Sederhana" icon={Wallet}>
                <form ref={financeFormRef} onSubmit={handleFinanceSubmit} className="grid gap-3 sm:grid-cols-2">
                  {editingFinanceId ? (
                    <div className="rounded-[8px] border border-amber-200 bg-yellow-50 px-3 py-2 text-sm text-amber-900 sm:col-span-2">
                      Mode edit aktif. Ubah transaksi lalu tekan <span className="font-semibold">Update Transaksi</span>.
                    </div>
                  ) : null}
                  <Field label="Tanggal">
                    <Input type="date" className="rounded-[8px]" value={financeForm.date} onChange={(event) => setFinanceForm((current) => ({ ...current, date: event.target.value }))} />
                  </Field>
                  <Field label="Tipe">
                    <Select value={financeForm.type} onValueChange={(value: FinanceType) => setFinanceForm((current) => ({ ...current, type: value }))}>
                      <SelectTrigger className="rounded-[8px] border-zinc-300 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pemasukan">Pemasukan</SelectItem>
                        <SelectItem value="Pengeluaran">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Kategori">
                    <Select value={financeForm.category} onValueChange={(value: FinanceRecord["category"]) => setFinanceForm((current) => ({ ...current, category: value }))}>
                      <SelectTrigger className="rounded-[8px] border-zinc-300 bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Penjualan telur">Penjualan telur</SelectItem>
                        <SelectItem value="Pakan">Pakan</SelectItem>
                        <SelectItem value="Obat">Obat</SelectItem>
                        <SelectItem value="Tenaga kerja">Tenaga kerja</SelectItem>
                        <SelectItem value="Lainnya">Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Nominal">
                    <Input type="number" min="0" className="rounded-[8px]" value={financeForm.amount} onChange={(event) => setFinanceForm((current) => ({ ...current, amount: event.target.value }))} />
                  </Field>
                  {financeForm.type === "Pemasukan" && financeForm.category === "Penjualan telur" ? (
                    <Field label="Jumlah telur terjual">
                      <Input
                        type="number"
                        min="0"
                        className="rounded-[8px]"
                        value={financeForm.soldEggs}
                        onChange={(event) => setFinanceForm((current) => ({ ...current, soldEggs: event.target.value }))}
                        placeholder="Contoh: 1200"
                      />
                    </Field>
                  ) : null}
                  <div className="sm:col-span-2">
                    <Field label="Deskripsi">
                      <Input className="rounded-[8px]" value={financeForm.description} onChange={(event) => setFinanceForm((current) => ({ ...current, description: event.target.value }))} placeholder="Contoh: penjualan telur ke agen utama" />
                    </Field>
                  </div>
                  <div className="grid gap-2 sm:col-span-2 sm:grid-cols-[1fr_auto]">
                    <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600" type="submit">
                      {editingFinanceId ? <Pencil className="mr-2 h-4 w-4" /> : <Coins className="mr-2 h-4 w-4" />}
                      {editingFinanceId ? "Update Transaksi" : "Simpan Transaksi"}
                    </Button>
                    {editingFinanceId ? (
                      <Button type="button" variant="outline" className="rounded-[8px] border-zinc-300" onClick={cancelFinanceEdit}>
                        Batal Edit
                      </Button>
                    ) : null}
                  </div>
                </form>
              </Panel>

              <Panel title="Margin dan Estimasi Laba Rugi" icon={Coins}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[8px] border border-amber-300 bg-yellow-100 p-4">
                    <p className="text-sm text-amber-800">Pemasukan</p>
                    <p className="mt-1 text-xl font-bold text-amber-900">{formatCurrency(incomeTotal)}</p>
                  </div>
                  <div className="rounded-[8px] border border-rose-200 bg-rose-50 p-4">
                    <p className="text-sm text-rose-700">Pengeluaran</p>
                    <p className="mt-1 text-xl font-bold text-rose-800">{formatCurrency(expenseTotal)}</p>
                  </div>
                  <div className="rounded-[8px] border border-zinc-200 bg-zinc-50 p-4">
                    <p className="text-sm text-zinc-600">Estimasi laba rugi</p>
                    <p className={cn("mt-1 text-xl font-bold", marginTotal >= 0 ? "text-amber-800" : "text-rose-700")}>
                      {formatCurrency(marginTotal)}
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid gap-3">
                  {financeRecords.map((record) => (
                    <div key={record.id} className="rounded-[8px] border border-zinc-200 p-3 text-sm sm:p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-950">{record.category}</p>
                          <p className="mt-1 break-words text-xs text-zinc-500 sm:text-sm">{record.description}</p>
                          <p className="mt-2 text-xs text-zinc-500">{formatDate(record.date)}</p>
                          {record.type === "Pemasukan" && record.category === "Penjualan telur" ? (
                            <p className="mt-1 text-xs font-semibold text-amber-800">
                              {formatNumber(record.soldEggs ?? 0)} telur terjual
                            </p>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant="outline" className={cn("rounded-[6px]", record.type === "Pemasukan" ? "border-amber-300 bg-yellow-100 text-amber-800" : "border-rose-200 bg-rose-50 text-rose-700")}>
                            {record.type}
                          </Badge>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-9 w-9 rounded-[8px] border-amber-200 text-amber-800 hover:bg-yellow-100"
                            onClick={() => startFinanceEdit(record)}
                            aria-label={`Edit transaksi ${record.category}`}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-9 w-9 rounded-[8px] border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                aria-label={`Hapus transaksi ${record.category}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-sm rounded-[8px]">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Hapus transaksi keuangan?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Transaksi {record.type.toLowerCase()} {formatCurrency(record.amount)} untuk {record.category} akan dihapus dari laporan.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-[8px]">Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="rounded-[8px] bg-red-600 text-white hover:bg-red-700"
                                  onClick={() => deleteFinanceRecord(record)}
                                >
                                  Hapus
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <div className="mt-3 rounded-[8px] bg-zinc-50 px-3 py-2 text-right">
                        <p className="text-xs text-zinc-500">Nominal</p>
                        <p className={cn("text-lg font-bold", record.type === "Pemasukan" ? "text-amber-800" : "text-rose-700")}>
                          {formatCurrency(record.amount)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </TabsContent>

          <TabsContent value="laporan" className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Laporan harian", summary: dailySummary, icon: ClipboardList },
                { title: "Laporan mingguan", summary: weeklySummary, icon: BarChart3 },
                { title: "Laporan bulanan", summary: monthlySummary, icon: FileSpreadsheet },
              ].map((item) => (
                <Panel key={item.title} title={item.title} icon={item.icon}>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Produksi telur</span>
                      <span className="font-semibold">{formatNumber(item.summary.eggs)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Telur terjual</span>
                      <span className="font-semibold">{formatNumber(item.summary.soldEggs)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Pakan terpakai</span>
                      <span className="font-semibold">{formatNumber(item.summary.feedKg)} kg</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">FCR</span>
                      <span className="font-semibold">{formatDecimal(item.summary.fcr, 2)}</span>
                    </div>
                    <div className="flex justify-between gap-3">
                      <span className="text-zinc-500">Mortalitas</span>
                      <span className="font-semibold">{item.summary.deaths}</span>
                    </div>
                    <div className="flex justify-between gap-3 border-t border-zinc-200 pt-3">
                      <span className="text-zinc-500">Margin</span>
                      <span className={cn("font-bold", item.summary.margin >= 0 ? "text-amber-800" : "text-rose-700")}>
                        {formatCurrency(item.summary.margin)}
                      </span>
                    </div>
                  </div>
                </Panel>
              ))}
            </div>

            <Panel
              title="Snapshot Laporan Investor"
              icon={FileText}
              action={
                <div className="no-print flex flex-wrap gap-2">
                  <Button variant="outline" className="rounded-[8px] border-zinc-300" onClick={exportPdf}>
                    <Printer className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  <Button className="rounded-[8px] bg-amber-500 hover:bg-amber-600" onClick={exportExcel}>
                    <Download className="mr-2 h-4 w-4" />
                    Excel
                  </Button>
                </div>
              }
            >
              <div className="space-y-5">
                {reportTables.map((table) => (
                  <div key={table.title}>
                    <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.08em] text-zinc-500">{table.title}</h3>
                    <div className="grid gap-2 md:hidden">
                      {table.rows.map((row, rowIndex) => (
                        <div key={`${table.title}-mobile-${rowIndex}`} className="rounded-[8px] border border-zinc-200 p-3 text-sm">
                          {row.map((cell, cellIndex) => (
                            <div key={`${table.title}-mobile-${rowIndex}-${cellIndex}`} className="flex justify-between gap-3 py-1.5">
                              <span className="text-zinc-500">{table.headers[cellIndex]}</span>
                              <span className="max-w-[58%] text-right font-semibold text-zinc-900">{cell}</span>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="hidden overflow-x-auto md:block">
                      <table className="w-full min-w-[640px] text-left text-sm">
                        <thead className="border-b border-zinc-200 text-xs uppercase tracking-[0.08em] text-zinc-500">
                          <tr>
                            {table.headers.map((header) => (
                              <th key={header} className="py-3 pr-4">
                                {header}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {table.rows.map((row, rowIndex) => (
                            <tr key={`${table.title}-${rowIndex}`}>
                              {row.map((cell, cellIndex) => (
                                <td key={`${table.title}-${rowIndex}-${cellIndex}`} className="py-3 pr-4">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </TabsContent>
        </Tabs>
      </main>
      <nav className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-amber-200 bg-amber-50/95 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 shadow-[0_-12px_30px_-24px_rgba(24,24,27,0.55)] backdrop-blur md:hidden">
        <div className="mx-auto grid w-full max-w-[390px] min-w-0 grid-cols-7 gap-1">
          {appTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                "flex min-w-0 flex-col items-center justify-center gap-1 rounded-[8px] px-0.5 py-2 text-[9px] font-semibold leading-none transition-colors min-[380px]:text-[10px]",
                activeTab === tab.value
                  ? "bg-yellow-100 text-amber-800"
                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900",
              )}
              aria-label={tab.label}
            >
              <tab.icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Index;
