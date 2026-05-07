import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2, LockKeyhole } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAdminSession, storeAdminSession, validateAdminLogin } from "@/lib/adminAuth";

type AuthProps = {
  mode: "login" | "register";
};

const Auth = ({ mode }: AuthProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegister = mode === "register";
  const [farmName, setFarmName] = useState("Hartana Farm");
  const [name, setName] = useState("Admin Hartana Farm");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const fromPath = (location.state as { from?: string } | null)?.from || "/";

  useEffect(() => {
    if (getAdminSession()) navigate(fromPath, { replace: true });
  }, [fromPath, navigate]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Masukkan email dan password admin.");
      return;
    }

    if (!validateAdminLogin(email, password)) {
      setError("Email atau password admin tidak sesuai.");
      return;
    }

    setLoading(true);
    window.setTimeout(() => {
      storeAdminSession({
        farmName: farmName || "Hartana Farm",
        name: name || "Admin Hartana Farm",
        email: email.trim().toLowerCase(),
        role: "admin",
        signedInAt: new Date().toISOString(),
      });
      setLoading(false);
      navigate(fromPath, { replace: true });
    }, 450);
  };

  return (
    <div className="min-h-screen bg-yellow-50 px-4 py-6 text-zinc-950">
      <main className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <div className="rounded-[8px] border border-amber-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <BrandLogo className="h-11 w-11" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-800">LayerFarm OS</p>
              <h1 className="text-2xl font-bold">Gateway Admin</h1>
              <p className="mt-1 text-xs text-zinc-500">Masuk untuk membuka dashboard operasional.</p>
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

            <Button type="submit" className="h-11 w-full rounded-[8px] bg-amber-500 hover:bg-amber-600" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LockKeyhole className="mr-2 h-4 w-4" />}
              Masuk sebagai Admin
            </Button>
          </form>

          <p className="mt-5 rounded-[8px] border border-amber-200 bg-yellow-50 px-3 py-2 text-xs leading-5 text-amber-900">
            Area ini hanya untuk admin farm. Dashboard, laporan, dan data operasional akan terkunci sampai login berhasil.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Auth;
