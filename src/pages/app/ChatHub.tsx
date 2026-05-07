import { Link } from "react-router-dom";
import { Bot, ChevronRight, MessageCircle, ShieldCheck } from "lucide-react";
import { useMemo } from "react";
import { getStoredUser } from "@/lib/api";
import CariBidan from "./CariBidan";
import ChatInbox from "./ChatInbox";

const ChatHub = () => {
  const user = useMemo(() => getStoredUser(), []);
  if (user?.role === "midwife" || user?.role === "admin") return <ChatInbox />;

  return (
    <div className="safe-x space-y-4 pb-6 pt-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Konsultasi</p>
        <h1 className="mt-1 font-display text-2xl font-bold">Pilih ruang chat</h1>
        <p className="mt-1 text-sm text-muted-foreground">Mulai dengan AI untuk jawaban cepat, atau lanjut ke Bidan Titik untuk konsultasi manusia.</p>
      </div>

      <Link to="/app/ai" className="block rounded-3xl bg-gradient-to-br from-secondary to-primary-soft/40 p-5 shadow-card">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-card/80 text-primary">
            <Bot className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="font-display text-xl font-bold">Konsultasi AI</h2>
              <ChevronRight className="h-5 w-5 shrink-0" />
            </div>
            <p className="mt-1 text-sm text-muted-foreground">Tanya edukasi kehamilan, nutrisi, persiapan kontrol, dan keluhan ringan.</p>
            <div className="mt-3 flex items-start gap-2 rounded-2xl bg-card/70 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <p>AI bukan pengganti bidan atau dokter untuk diagnosis dan kondisi darurat.</p>
            </div>
          </div>
        </div>
      </Link>

      <div className="rounded-3xl bg-card p-4 shadow-card">
        <div className="mb-3 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/10 text-primary">
            <MessageCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Chat Bidan</h2>
            <p className="text-xs text-muted-foreground">Konsultasi langsung dengan Bidan Titik.</p>
          </div>
        </div>
        <CariBidan compact />
      </div>
    </div>
  );
};

export default ChatHub;
