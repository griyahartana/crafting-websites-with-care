import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Inbox, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ChatThread, getStoredUser } from "@/lib/api";

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const ChatInbox = () => {
  const user = useMemo(() => getStoredUser(), []);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadThreads = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const data = await apiFetch<{ threads: ChatThread[] }>("/api/chat/threads");
      setThreads(data.threads);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Chat gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) loadThreads();
  }, [loadThreads, user]);

  if (!user) {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-display text-xl font-bold">Masuk untuk melihat chat</h1>
          <p className="mt-2 text-sm text-muted-foreground">Chat customer dan bidan akan tampil setelah login.</p>
          <Button asChild className="mt-4 h-11 w-full rounded-full">
            <Link to="/login">Masuk</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-x space-y-4 pb-5 pt-5">
      <div className="flex items-center gap-3">
        <Link to="/app" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Chat</p>
          <h1 className="font-display text-xl font-bold leading-tight">
            {user.role === "customer" ? "Riwayat Konsultasi" : "Chat Customer"}
          </h1>
        </div>
        <button onClick={loadThreads} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-muted" aria-label="Muat ulang">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {message && <p className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{message}</p>}

      {loading && (
        <div className="flex justify-center rounded-3xl bg-card p-6 shadow-card">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}

      {!loading && threads.length === 0 && (
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <Inbox className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h2 className="font-display text-lg font-bold">Belum ada chat</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {user.role === "customer" ? "Mulai chat dari halaman Cari Bidan." : "Pesan customer akan muncul di sini."}
          </p>
          {user.role === "customer" && (
            <Button asChild className="mt-4 h-11 w-full rounded-full">
              <Link to="/app/cari-bidan">Chat Bidan</Link>
            </Button>
          )}
        </div>
      )}

      <div className="space-y-3">
        {threads.map((thread) => {
          const name = user.role === "customer" ? thread.midwife_name : thread.customer_name;
          const avatar = user.role === "customer" ? thread.midwife_avatar_url : thread.customer_avatar_url;

          return (
          <Link key={thread.id} to={`/app/chat/${thread.midwife_id}?threadId=${thread.id}`} className="block rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-primary/10 font-bold text-primary">
                {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{name}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {user.role === "customer" ? "Konsultasi dengan bidan" : `Customer untuk ${thread.midwife_name}`}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(thread.updated_at)}</p>
              </div>
            </div>
          </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ChatInbox;
