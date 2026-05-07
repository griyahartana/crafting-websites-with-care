import { Link } from "react-router-dom";
import { ArrowLeft, Bot, History, Loader2, MessageCirclePlus, Send, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { AiMessage, AiThread, apiFetch, getStoredUser } from "@/lib/api";
import { cn } from "@/lib/utils";

const starterPrompts = [
  "Apa tanda bahaya kehamilan yang harus saya waspadai?",
  "Saya mual di pagi hari, apa yang bisa saya lakukan?",
  "Bagaimana cara menjaga nutrisi saat hamil trimester 2?",
];

const welcomeMessage: AiMessage = {
  id: 0,
  role: "assistant",
  content:
    "Halo, saya Asisten AI BidanKita. Ibu bisa tanya seputar edukasi kehamilan, persiapan kontrol, nutrisi, atau keluhan ringan. Untuk kondisi darurat, segera hubungi Bidan Titik atau fasilitas kesehatan terdekat.",
};

const preview = (value?: string | null) => {
  if (!value) return "Belum ada pesan";
  return value.length > 64 ? `${value.slice(0, 64)}...` : value;
};

const formatThreadTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const AiChat = () => {
  const user = useMemo(() => getStoredUser(), []);
  const [threads, setThreads] = useState<AiThread[]>([]);
  const [activeThread, setActiveThread] = useState<AiThread | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([welcomeMessage]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    window.setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }, 50);
  };

  const loadThreads = useCallback(async () => {
    if (!user) return;
    try {
      const data = await apiFetch<{ threads: AiThread[] }>("/api/ai/threads");
      setThreads(data.threads);
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Riwayat AI gagal dimuat");
    }
  }, [user]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  const startNewChat = () => {
    setActiveThread(null);
    setMessages([welcomeMessage]);
    setText("");
    setNotice("");
    scrollToBottom();
  };

  const openThread = async (thread: AiThread) => {
    setHistoryLoading(true);
    setNotice("");
    try {
      const data = await apiFetch<{ thread: AiThread; messages: AiMessage[] }>(`/api/ai/messages?threadId=${thread.id}`);
      setActiveThread(data.thread);
      setMessages(data.messages.length ? data.messages : [welcomeMessage]);
      scrollToBottom();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Riwayat AI gagal dibuka");
    } finally {
      setHistoryLoading(false);
    }
  };

  const sendMessage = async (value = text) => {
    const trimmed = value.trim();
    if (!trimmed || loading || !user) return;

    const userMessage: AiMessage = { id: Date.now(), role: "user", content: trimmed };
    const nextMessages = [...messages.filter((message) => message.id !== 0), userMessage];
    setMessages(activeThread ? [...messages, userMessage] : [welcomeMessage, userMessage]);
    setText("");
    setNotice("");
    setLoading(true);
    scrollToBottom();

    try {
      const data = await apiFetch<{ thread: AiThread; message: { role: "assistant"; content: string } }>("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
          threadId: activeThread?.id,
          messages: nextMessages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });
      setActiveThread(data.thread);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          thread_id: data.thread.id,
          role: "assistant",
          content: data.message.content,
        },
      ]);
      await loadThreads();
      scrollToBottom();
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Konsultasi AI gagal diproses");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <Bot className="mx-auto mb-3 h-9 w-9 text-primary" />
          <h1 className="font-display text-xl font-bold">Masuk untuk konsultasi AI</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk atau daftar agar konsultasi bisa berjalan aman melalui backend BidanKita.</p>
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

  const showStarters = messages.length === 1 && messages[0].id === 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="safe-x shrink-0 border-b border-border bg-card py-3">
        <div className="flex items-center gap-3">
          <Link to="/app/chat" className="grid h-9 w-9 shrink-0 place-items-center rounded-full hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-muted-foreground">Konsultasi cepat</p>
            <h1 className="truncate font-display text-lg font-bold">Asisten AI BidanKita</h1>
          </div>
          <Button type="button" size="icon" variant="secondary" className="h-9 w-9 rounded-full" onClick={startNewChat} aria-label="Chat baru">
            <MessageCirclePlus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-3 flex items-start gap-2 rounded-2xl bg-secondary/70 px-3 py-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p>AI membantu edukasi awal. Untuk diagnosis, obat, atau tanda bahaya, tetap hubungi bidan/dokter.</p>
        </div>
      </div>

      <div className="safe-x shrink-0 border-b border-border bg-background py-2">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <History className="h-3.5 w-3.5" />
            Riwayat AI
          </div>
          {historyLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
        </div>
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          <button
            type="button"
            onClick={startNewChat}
            className={cn(
              "min-w-28 rounded-2xl px-3 py-2 text-left text-xs font-semibold shadow-card",
              !activeThread ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
            )}
          >
            Chat baru
            <span className="mt-0.5 block text-[10px] font-medium opacity-75">Mulai topik baru</span>
          </button>
          {threads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => openThread(thread)}
              className={cn(
                "min-w-44 rounded-2xl px-3 py-2 text-left shadow-card",
                activeThread?.id === thread.id ? "bg-primary text-primary-foreground" : "bg-card text-foreground",
              )}
            >
              <span className="block truncate text-xs font-bold">{thread.title}</span>
              <span className="mt-0.5 block truncate text-[10px] opacity-75">{preview(thread.latest_message)}</span>
              <span className="mt-1 block text-[10px] opacity-60">{formatThreadTime(thread.updated_at)}</span>
            </button>
          ))}
        </div>
      </div>

      {notice && <p className="safe-x shrink-0 bg-destructive/10 py-2 text-xs font-semibold text-destructive">{notice}</p>}

      <div ref={scrollRef} className="safe-x min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-gradient-soft py-4">
        {messages.map((message) => (
          <div key={message.id} className={cn("flex items-end gap-2", message.role === "user" ? "justify-end" : "justify-start")}>
            {message.role === "assistant" && (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
            )}
            <div
              className={cn(
                "max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-card min-[380px]:max-w-[78%]",
                message.role === "user" ? "rounded-br-md bg-primary-soft/70" : "rounded-bl-md bg-card",
              )}
            >
              <p className="mb-1 text-[11px] font-semibold text-muted-foreground">
                {message.role === "user" ? "Anda" : "Asisten AI"}
              </p>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            {message.role === "user" && (
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                <UserRound className="h-4 w-4" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 rounded-2xl bg-card px-3.5 py-2.5 text-sm text-muted-foreground shadow-card">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            AI sedang menyusun jawaban...
          </div>
        )}
        {showStarters && (
          <div className="space-y-2 pt-1">
            {starterPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                className="flex w-full items-center gap-2 rounded-2xl bg-card px-3 py-2 text-left text-xs font-semibold shadow-card"
                onClick={() => sendMessage(prompt)}
              >
                <Sparkles className="h-3.5 w-3.5 shrink-0 text-primary" />
                {prompt}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="safe-x flex shrink-0 items-center gap-2 border-t border-border bg-card py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && sendMessage()}
          placeholder="Tanya AI seputar kehamilan..."
          className="h-11 min-w-0 flex-1 rounded-full bg-muted px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={() => sendMessage()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-soft disabled:opacity-50"
          disabled={!text.trim() || loading}
          aria-label="Kirim"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
};

export default AiChat;
