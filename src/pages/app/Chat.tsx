import { Link, useParams } from "react-router-dom";
import { ArrowLeft, MoreVertical, Paperclip, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import bidanRina from "@/assets/bidan-rina.jpg";
import bidanDwi from "@/assets/bidan-dwi.jpg";
import bidanSiti from "@/assets/bidan-siti.jpg";

const bidanMap: Record<string, { name: string; img: string }> = {
  rina: { name: "Bidan Rina Amelia, S.ST", img: bidanRina },
  dwi: { name: "Bidan Dwi Lestari, S.ST", img: bidanDwi },
  siti: { name: "Bidan Siti Nurhayati, S.ST", img: bidanSiti },
};

type Msg = { id: number; from: "bidan" | "me"; text: string; time: string };

const initial: Msg[] = [
  { id: 1, from: "bidan", text: "Halo Ayu, selamat pagi 🌷 Ada yang bisa saya bantu?", time: "09:41" },
  { id: 2, from: "me", text: "Pagi Bidan, saya ingin bertanya tentang gerakan bayi yang berkurang sejak kemarin.", time: "09:42" },
  { id: 3, from: "bidan", text: "Baik Ayu, sejak kapan gerakannya berkurang? Apakah ada keluhan lain seperti nyeri atau keluar cairan?", time: "09:44" },
  { id: 4, from: "me", text: "Sejak tadi malam, tidak ada nyeri tapi perut terasa lebih kencang.", time: "09:45" },
  { id: 5, from: "bidan", text: "Terima kasih informasinya. Coba istirahat miring ke kiri, minum air putih, dan hitung gerakan bayi selama 2 jam ya.", time: "09:47" },
  { id: 6, from: "me", text: "Baik Bidan, terima kasih 🙏", time: "09:48" },
];

const Chat = () => {
  const { id = "rina" } = useParams();
  const bidan = bidanMap[id] ?? bidanMap.rina;
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setMessages((m) => [...m, { id: Date.now(), from: "me", text: trimmed, time }]);
    setText("");
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { id: Date.now() + 1, from: "bidan", text: "Baik Ayu, saya catat ya. Apakah ada keluhan lain?", time },
      ]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full min-h-[750px]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Link to="/app/cari-bidan" className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <img src={bidan.img} alt={bidan.name} className="w-10 h-10 rounded-full object-cover" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted-foreground">Chat dengan Bidan</p>
          <p className="font-semibold text-sm truncate">{bidan.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground">Online</span>
          </div>
        </div>
        <button className="w-9 h-9 grid place-items-center rounded-full hover:bg-muted" aria-label="Menu">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-soft">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[78%] px-3.5 py-2.5 text-sm leading-relaxed shadow-card ${
                m.from === "me"
                  ? "bg-primary-soft/60 text-foreground rounded-2xl rounded-br-md"
                  : "bg-card text-foreground rounded-2xl rounded-bl-md"
              }`}
            >
              <p>{m.text}</p>
              <p className="text-[10px] text-muted-foreground mt-1 text-right">{m.time}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="border-t border-border bg-card px-3 py-3 flex items-center gap-2">
        <button className="w-10 h-10 grid place-items-center rounded-full hover:bg-muted shrink-0" aria-label="Lampiran">
          <Paperclip className="w-5 h-5 text-muted-foreground" />
        </button>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ketik pesan..."
          className="flex-1 h-11 px-4 rounded-full bg-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
        <button
          onClick={send}
          className="w-11 h-11 grid place-items-center rounded-full bg-primary text-primary-foreground shadow-soft shrink-0 disabled:opacity-50"
          disabled={!text.trim()}
          aria-label="Kirim"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Chat;
