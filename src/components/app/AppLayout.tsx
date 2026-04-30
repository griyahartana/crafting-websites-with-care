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

export const AppLayout = () => {
  const location = useLocation();
  // Hide bottom nav on chat detail / fullscreen onboarding.
  const hideNav = location.pathname.startsWith("/app/chat/");

  return (
    <div className="app-screen bg-gradient-soft md:px-4 md:py-6">
      <div className="app-frame mx-auto flex w-full max-w-md flex-col overflow-hidden bg-background shadow-none md:rounded-[2rem] md:border md:border-border/70 md:shadow-phone">
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain scroll-smooth">
          <Outlet />
        </main>
        {!hideNav && (
          <nav className="bottom-nav-safe z-20 shrink-0 border-t border-border bg-card/95 px-2 pt-2 backdrop-blur-md">
            <div className="grid grid-cols-5 gap-1">
              {tabs.map((t) => (
                <NavLink
                  key={t.to}
                  to={t.to}
                  end={t.end}
                  className={({ isActive }) =>
                    cn(
                      "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 transition-smooth",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <t.icon className={cn("w-5 h-5", isActive && "fill-primary/10")} />
                      <span className="max-w-full truncate text-[10px] font-semibold leading-none">{t.label}</span>
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
