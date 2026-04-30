import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Loader2, MoreVertical, Paperclip, RefreshCw, Send } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { apiFetch, ChatMessage, getStoredUser } from "@/lib/api";
import bidanRina from "@/assets/bidan-rina.jpg";

const bidanMap: Record<string, { name: string; img: string }> = {
  "1": { name: "Bidan Titik", img: bidanRina },
  "3": { name: "Bidan Titik", img: bidanRina },
  rina: { name: "Bidan Titik", img: bidanRina },
};

type ThreadInfo = {
  id: number;
  customer_id: number;
  midwife_id: number;
  customer_name?: string;
  midwife_name?: string;
  customer_avatar_url?: string | null;
  midwife_avatar_url?: string | null;
};

type Msg = {
  id: number;
  from: "bidan" | "me";
  senderName: string;
  senderRole: string;
  avatarUrl?: string | null;
  text: string;
  time: string;
};

const formatTime = (value?: string) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const Chat = () => {
  const { id = "1" } = useParams();
  const [searchParams] = useSearchParams();
  const threadId = searchParams.get("threadId");
  const user = useMemo(() => getStoredUser(), []);
  const bidan = bidanMap[id] ?? bidanMap["1"];
  const backTo = user?.role === "admin" || user?.role === "midwife" ? "/app/inbox" : "/app/cari-bidan";
  const [thread, setThread] = useState<ThreadInfo | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (silent = false) => {
    if (!user) return;
    const numericId = Number(id);
    if (!threadId && !Number.isFinite(numericId)) return;

    if (!silent) {
      setLoading(true);
      setNotice("");
    }
    try {
      const query = threadId ? `threadId=${threadId}` : `midwifeId=${numericId}`;
      const data = await apiFetch<{ thread: ThreadInfo; messages: ChatMessage[] }>(`/api/chat/messages?${query}`);
      setThread(data.thread);
      setMessages(
        data.messages.map((message) => ({
          id: message.id,
          from: message.sender_id === user.id ? "me" : "bidan",
          senderName: message.sender_id === user.id ? "Anda" : message.sender_name,
          senderRole: message.sender_role === "midwife" ? "Bidan" : message.sender_role === "admin" ? "Admin" : "Customer",
          avatarUrl: message.sender_avatar_url,
          text: message.body,
          time: formatTime(message.created_at),
        })),
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Chat belum tersambung");
    } finally {
      if (!silent) setLoading(false);
    }
  }, [id, threadId, user]);

  useEffect(() => {
    loadMessages();
    const timer = window.setInterval(() => loadMessages(true), 4000);
    return () => window.clearInterval(timer);
  }, [loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !user) return;
    const optimistic: Msg = {
      id: Date.now(),
      from: "me",
      senderName: "Anda",
      senderRole: user.role === "midwife" ? "Bidan" : user.role === "admin" ? "Admin" : "Customer",
      avatarUrl: user.avatar_url,
      text: trimmed,
      time: formatTime(),
    };
    setMessages((current) => [...current, optimistic]);
    setText("");

    try {
      const payload = threadId ? { threadId: Number(threadId), body: trimmed } : { midwifeId: Number(id), body: trimmed };
      const data = await apiFetch<{ thread: ThreadInfo; messages: ChatMessage[] }>("/api/chat/messages", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setThread(data.thread);
      setMessages(
        data.messages.map((message) => ({
          id: message.id,
          from: message.sender_id === user.id ? "me" : "bidan",
          senderName: message.sender_id === user.id ? "Anda" : message.sender_name,
          senderRole: message.sender_role === "midwife" ? "Bidan" : message.sender_role === "admin" ? "Admin" : "Customer",
          avatarUrl: message.sender_avatar_url,
          text: message.body,
          time: formatTime(message.created_at),
        })),
      );
      setNotice("");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Pesan gagal dikirim");
    }
  };

  if (!user) {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <h1 className="font-display text-xl font-bold">Masuk untuk chat bidan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Buat akun ibu atau masuk agar percakapan tersimpan di Cloudflare D1.</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button asChild variant="secondary" className="h-11 rounded-full">
              <Link to="/register">Daftar</Link>
            </Button>
            <Button asChild className="h-11 rounded-full">
              <Link to="/login">Masuk</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const partnerName =
    user.role === "customer"
      ? thread?.midwife_name ?? bidan.name
      : thread?.customer_name ?? "Customer";
  const partnerAvatar =
    user.role === "customer" ? thread?.midwife_avatar_url : thread?.customer_avatar_url;
  const partnerInitial = partnerName.charAt(0).toUpperCase();
  const headerSubtitle = user.role === "customer" ? "Konsultasi customer dan bidan" : "Percakapan customer";

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="safe-x flex shrink-0 items-center gap-3 border-b border-border bg-card py-3">
        <Link to={backTo} className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {partnerAvatar ? (
          <img src={partnerAvatar} alt={partnerName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : user.role === "customer" ? (
          <img src={bidan.img} alt={partnerName} className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/10 font-bold text-primary">
            {partnerInitial}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{headerSubtitle}</p>
          <p className="truncate text-sm font-semibold">{partnerName}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">{loading ? "Memuat..." : "Realtime aktif"}</span>
          </div>
        </div>
        <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label="Menu">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {notice && <p className="safe-x shrink-0 bg-secondary py-2 text-xs font-semibold text-secondary-foreground">{notice}</p>}

      <div ref={scrollRef} className="safe-x min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gradient-soft py-4">
        {loading && (
          <div className="flex justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}
        {messages.length === 0 && !loading && (
          <p className="rounded-2xl bg-card p-4 text-center text-sm text-muted-foreground shadow-card">
            Belum ada pesan. Mulai konsultasi dengan bidan di sini.
          </p>
        )}
        {messages.map((message) => (
          <div key={message.id} className={`flex items-end gap-2 ${message.from === "me" ? "justify-end" : "justify-start"}`}>
            {message.from !== "me" && (
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-bold text-secondary-foreground">
                {message.avatarUrl ? <img src={message.avatarUrl} alt={message.senderName} className="h-full w-full object-cover" /> : message.senderName.charAt(0).toUpperCase()}
              </div>
            )}
            <div
              className={`max-w-[86%] px-3.5 py-2.5 text-sm leading-relaxed shadow-card min-[380px]:max-w-[78%] ${
                message.from === "me"
                  ? "rounded-2xl rounded-br-md bg-primary-soft/60 text-foreground"
                  : "rounded-2xl rounded-bl-md bg-card text-foreground"
              }`}
            >
              <div className="mb-1 flex items-center justify-between gap-3">
                <p className="text-[11px] font-semibold text-muted-foreground">{message.senderName}</p>
                <p className="text-[10px] font-medium text-muted-foreground">{message.senderRole}</p>
              </div>
              <p>{message.text}</p>
              <p className="mt-1 text-right text-[10px] text-muted-foreground">{message.time}</p>
            </div>
            {message.from === "me" && (
              <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                {user.avatar_url ? <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" /> : user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="safe-x flex shrink-0 items-center gap-2 border-t border-border bg-card py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted" aria-label="Lampiran">
          <Paperclip className="h-5 w-5 text-muted-foreground" />
        </button>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          placeholder="Ketik pesan..."
          className="h-11 min-w-0 flex-1 rounded-full bg-muted px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={send}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft disabled:opacity-50"
          disabled={!text.trim() || loading}
          aria-label="Kirim"
        >
          <Send className="h-4 w-4" />
        </button>
        <button
          onClick={() => loadMessages()}
          className="hidden h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted min-[430px]:grid"
          aria-label="Muat ulang chat"
        >
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
