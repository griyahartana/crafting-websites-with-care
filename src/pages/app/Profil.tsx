import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { Camera, Settings, Heart, FileText, HelpCircle, LogOut, ChevronRight, ShieldCheck, LogIn, Inbox, Loader2 } from "lucide-react";
import { apiFetch, clearSession, getStoredUser, storeUser, User } from "@/lib/api";

const menu = [
  { icon: FileText, label: "Catatan Kehamilan", to: "/app/catatan" },
  { icon: Heart, label: "Bidan Favorit", to: "/app/cari-bidan" },
  { icon: Settings, label: "Pengaturan", to: "/app/profil" },
  { icon: HelpCircle, label: "Bantuan", to: "/app/chat" },
];

const Profil = () => {
  const [loggedOut, setLoggedOut] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(() => getStoredUser());
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [notice, setNotice] = useState("");
  const user = useMemo(() => (loggedOut ? null : currentUser), [currentUser, loggedOut]);
  const adminItems = user?.role === "admin" ? [{ icon: ShieldCheck, label: "Admin Bidan", to: "/app/admin" }] : [];
  const chatItems =
    user?.role === "admin" || user?.role === "midwife" ? [{ icon: Inbox, label: "Chat Customer", to: "/app/inbox" }] : [];
  const items = [...adminItems, ...chatItems, ...menu];

  const logout = () => {
    clearSession();
    setLoggedOut(true);
  };

  const uploadAvatar = async (file?: File) => {
    if (!file || !user) return;
    setNotice("");
    if (file.size > 500_000) {
      setNotice("Foto maksimal 500 KB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      setSavingAvatar(true);
      try {
        const data = await apiFetch<{ user: User }>("/api/auth/profile", {
          method: "PATCH",
          body: JSON.stringify({ name: user.name, avatar_url: String(reader.result) }),
        });
        storeUser(data.user);
        setCurrentUser(data.user);
        setNotice("Foto profil berhasil diperbarui.");
      } catch (err) {
        setNotice(err instanceof Error ? err.message : "Foto profil gagal disimpan");
      } finally {
        setSavingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="safe-x space-y-5 pb-5 pt-5">
      <h1 className="font-display text-xl font-bold leading-tight">Profil</h1>

      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-5 text-primary-foreground shadow-soft">
        <div className="flex items-center gap-4">
          <label className="relative grid h-16 w-16 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full bg-primary-foreground/20 text-2xl font-bold">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              (user?.name ?? "Ayu").charAt(0).toUpperCase()
            )}
            {user && (
              <>
                <span className="absolute bottom-0 right-0 grid h-6 w-6 place-items-center rounded-full bg-card text-primary shadow-card">
                  {savingAvatar ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => uploadAvatar(event.target.files?.[0])}
                />
              </>
            )}
          </label>
          <div className="min-w-0">
            <p className="truncate font-display text-xl font-bold">{user?.name ?? "Ayu Pratiwi"}</p>
            <p className="text-sm opacity-90">{user ? `${user.role} • ${user.email}` : "Trimester 2 • 24 minggu"}</p>
          </div>
        </div>
      </div>

      {notice && <p className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{notice}</p>}

      <div className="rounded-2xl bg-card shadow-card divide-y divide-border">
        {items.map((m) => (
          <Link key={m.label} to={m.to} className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-smooth">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-secondary">
              <m.icon className="w-4 h-4 text-secondary-foreground" />
            </div>
            <span className="flex-1 text-left text-sm font-medium">{m.label}</span>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          </Link>
        ))}
      </div>

      {user ? (
        <button onClick={logout} className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold text-destructive">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      ) : (
        <Link to="/login" className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-primary">
          <LogIn className="w-4 h-4" /> Masuk / Daftar
        </Link>
      )}
    </div>
  );
};

export default Profil;
