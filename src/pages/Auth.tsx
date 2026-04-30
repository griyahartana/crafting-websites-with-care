import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, HeartPulse, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, AuthSession, storeSession } from "@/lib/api";

type AuthProps = {
  mode: "login" | "register";
};

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(isRegister ? "" : "ayu@example.test");
  const [password, setPassword] = useState(isRegister ? "" : "ibu123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const session = await apiFetch<AuthSession>(isRegister ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      storeSession(session);
      navigate(session.user.role === "admin" ? "/app/admin" : "/app", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk");
    } finally {
      setLoading(false);
    }
  };

  const fillAdmin = () => {
    setEmail("admin@bidankita.test");
    setPassword("admin123");
  };

  return (
    <div className="min-h-screen bg-gradient-soft px-4 py-6">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <Link to="/app" className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-card">
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="rounded-3xl bg-card p-5 shadow-card">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary">
              {isRegister ? <UserPlus className="h-5 w-5" /> : <HeartPulse className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">BidanKita</p>
              <h1 className="font-display text-2xl font-bold">{isRegister ? "Buat Akun Ibu" : "Masuk Akun"}</h1>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isRegister && (
              <label className="block space-y-1.5 text-sm font-semibold">
                <span>Nama lengkap</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
                  placeholder="Contoh: Ayu Pratiwi"
                />
              </label>
            )}
            <label className="block space-y-1.5 text-sm font-semibold">
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
                placeholder="nama@email.com"
              />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
                placeholder="Minimal 6 karakter"
              />
            </label>

            {error && <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">{error}</p>}

            <Button type="submit" className="h-11 w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Daftar dan Masuk" : "Masuk"}
            </Button>
          </form>

          {!isRegister && (
            <button
              type="button"
              onClick={fillAdmin}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-secondary px-4 py-3 text-xs font-semibold text-secondary-foreground"
            >
              <ShieldCheck className="h-4 w-4" />
              Pakai akun admin demo
            </button>
          )}

          <p className="mt-5 text-center text-sm text-muted-foreground">
            {isRegister ? "Sudah punya akun?" : "Belum punya akun?"}{" "}
            <Link className="font-semibold text-primary" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Masuk" : "Daftar ibu"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
