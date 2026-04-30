import { NavLink, Outlet, useLocation } from "react-router-dom";
import { Home, MessageCircle, CalendarDays, Activity, User } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { to: "/app", label: "Beranda", icon: Home, end: true },
  { to: "/app/chat", label: "Chat", icon: MessageCircle },
  { to: "/app/kunjungan", label: "Kunjungan", icon: CalendarDays },
  { to: "/app/tracking", label: "Tracking", icon: Activity },
  { to: "/app/profil", label: "Profil", icon: User },
];

const StatusBar = () => (
  <div className="flex items-center justify-between px-6 pt-3 pb-1 text-xs font-semibold text-foreground/80">
    <span>9:41</span>
    <div className="flex items-center gap-1">
      <span>•••</span>
      <span>📶</span>
      <span>🔋</span>
    </div>
  </div>
);

export const AppLayout = () => {
  const location = useLocation();
  // Hide bottom nav on chat detail / fullscreen onboarding
  const hideNav = location.pathname.startsWith("/app/chat/");

  return (
    <div className="min-h-screen bg-gradient-soft py-4 lg:py-8 px-2">
      <div className="mx-auto w-full max-w-md bg-background rounded-[2.5rem] shadow-phone overflow-hidden border-8 border-foreground/5 relative min-h-[calc(100vh-2rem)] lg:min-h-[820px] lg:max-h-[900px] flex flex-col">
        <StatusBar />
        <main className="flex-1 overflow-y-auto pb-24">
          <Outlet />
        </main>
        {!hideNav && (
          <nav className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border px-2 py-2 pb-3">
            <div className="flex items-center justify-around">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    cn(
                      "flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-smooth min-w-0",
                      isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <t.icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
                      <span className="text-[10px] font-semibold">{t.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};
