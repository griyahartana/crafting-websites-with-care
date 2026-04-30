import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X, Share } from "lucide-react";

type BIPEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export const InstallPrompt = () => {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    if (standalone) return;
    if (sessionStorage.getItem("bk_install_dismissed")) return;

    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    if (ios) {
      const t = setTimeout(() => setShow(true), 1500);
      return () => {
        clearTimeout(t);
        window.removeEventListener("beforeinstallprompt", handler);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem("bk_install_dismissed", "1");
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-fade-up">
      <div className="rounded-2xl bg-card shadow-soft border border-border p-4 flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-gradient-primary grid place-items-center shrink-0">
          <Download className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Pasang BidanKita di HP</p>
          {isIOS ? (
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Tap <Share className="inline w-3.5 h-3.5 mx-0.5" /> di Safari, lalu pilih
              <span className="font-semibold"> "Add to Home Screen"</span>.
            </p>
          ) : (
            <p className="text-xs text-muted-foreground mt-1">
              Akses lebih cepat langsung dari layar utama.
            </p>
          )}
          {!isIOS && deferred && (
            <Button size="sm" onClick={install} className="mt-2 rounded-full h-8 px-4 text-xs">
              Pasang Sekarang
            </Button>
          )}
        </div>
        <button
          onClick={dismiss}
          aria-label="Tutup"
          className="text-muted-foreground hover:text-foreground transition-smooth"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
