import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthProps = {
  mode: "login" | "register";
};

const DEMO_EMAIL = "owner@hartanafarm.test";
const DEMO_PASSWORD = "farm12345";

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const isRegister = mode === "register";
  const [farmName, setFarmName] = useState(isRegister ? "" : "Hartana Farm");
  const [name, setName] = useState(isRegister ? "" : "Owner Hartana Farm");
  const [email, setEmail] = useState(isRegister ? "" : DEMO_EMAIL);
  const [password, setPassword] = useState(isRegister ? "" : DEMO_PASSWORD);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password || (isRegister && (!name || !farmName))) {
      setError("Lengkapi data akun terlebih dahulu.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      localStorage.setItem(
        "layerfarm_session",
        JSON.stringify({
          farmName: farmName || "Hartana Farm",
          name: name || "Owner Hartana Farm",
          email,
          role: "owner",
          signedInAt: new Date().toISOString(),
        }),
      );
      setLoading(false);
      navigate("/app", { replace: true });
    }, 450);
  };

  const fillDemo = () => {
    setFarmName("Hartana Farm");
    setName("Owner Hartana Farm");
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <Link
          to="/"
          className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-[8px] border border-zinc-200 bg-white shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="rounded-[8px] border border-zinc-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <BrandLogo className="h-11 w-11" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">LayerFarm OS</p>
              <h1 className="text-2xl font-bold">{isRegister ? "Buat Akun Farm" : "Masuk Dashboard"}</h1>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {isRegister && (
              <>
                <div className="space-y-1.5">
                  <Label>Nama farm</Label>
                  <Input
                    value={farmName}
                    onChange={(event) => setFarmName(event.target.value)}
                    className="rounded-[8px]"
                    placeholder="Contoh: Hartana Farm"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nama pemilik/operator</Label>
                  <Input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="rounded-[8px]"
                    placeholder="Contoh: Adit Hartana"
                  />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-[8px]"
                placeholder="owner@farm.com"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-[8px]"
                placeholder="Minimal 8 karakter"
              />
            </div>

            {error && <p className="rounded-[8px] bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</p>}

            <Button type="submit" className="h-11 w-full rounded-[8px] bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
              {isRegister ? "Daftar dan Buka Dashboard" : "Masuk ke Dashboard"}
            </Button>
          </form>

          {!isRegister && (
            <button
              type="button"
              onClick={fillDemo}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-[8px] bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800"
            >
              Pakai akun demo owner
            </button>
          )}

          <p className="mt-5 text-center text-sm text-zinc-500">
            {isRegister ? "Sudah punya akun farm?" : "Belum punya akun farm?"}{" "}
            <Link className="font-semibold text-emerald-700" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "Masuk" : "Daftar SaaS"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
