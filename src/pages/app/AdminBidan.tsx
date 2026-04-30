import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Loader2, Plus, RefreshCw, Save, ShieldCheck, Stethoscope, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch, ChatThread, Customer, getStoredUser, Midwife } from "@/lib/api";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  specialty: "Kehamilan & Persalinan",
  clinic: "Klinik BidanKita",
  distance: "Tersedia konsultasi online",
  rating: "5",
  reviews: "0",
};

const emptyCustomerForm = {
  id: "",
  name: "",
  email: "",
  password: "",
};

const AdminBidan = () => {
  const user = useMemo(() => getStoredUser(), []);
  const [midwife, setMidwife] = useState<Midwife | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [customerForm, setCustomerForm] = useState(emptyCustomerForm);
  const isEditing = Boolean(midwife);
  const isEditingCustomer = Boolean(customerForm.id);

  const syncForm = (value: Midwife | null) => {
    if (!value) {
      setForm(emptyForm);
      return;
    }
    setForm({
      name: value.name,
      email: value.email,
      password: "",
      specialty: value.specialty ?? "Kehamilan & Persalinan",
      clinic: value.clinic ?? "Klinik BidanKita",
      distance: value.distance ?? "Tersedia konsultasi online",
      rating: String(value.rating ?? 5),
      reviews: String(value.reviews ?? 0),
    });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    setMessage("");
    try {
      const [midwifeData, threadData] = await Promise.all([
        apiFetch<{ midwives: Midwife[] }>("/api/midwives"),
        apiFetch<{ threads: ChatThread[] }>("/api/chat/threads").catch(() => ({ threads: [] })),
      ]);
      const customerData = await apiFetch<{ customers: Customer[] }>("/api/admin/customers");
      const onlyMidwife = midwifeData.midwives[0] ?? null;
      setMidwife(onlyMidwife);
      syncForm(onlyMidwife);
      setCustomers(customerData.customers);
      setThreads(threadData.threads);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Data admin gagal dimuat");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === "admin") loadData();
  }, [loadData, user?.role]);

  const submitMidwife = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      ...form,
      rating: Number(form.rating) || 5,
      reviews: Number(form.reviews) || 0,
    };

    try {
      if (midwife) {
        await apiFetch(`/api/admin/midwives/${midwife.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Data bidan berhasil diperbarui.");
      } else {
        await apiFetch("/api/admin/midwives", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Akun bidan berhasil dibuat.");
      }
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Data bidan gagal disimpan");
      setLoading(false);
    }
  };

  const deleteMidwife = async () => {
    if (!midwife) return;
    const approved = window.confirm("Hapus bidan ini beserta thread chat terkait?");
    if (!approved) return;

    setLoading(true);
    setMessage("");
    try {
      await apiFetch(`/api/admin/midwives/${midwife.id}`, { method: "DELETE" });
      setMidwife(null);
      syncForm(null);
      setThreads([]);
      setMessage("Bidan berhasil dihapus. Admin bisa membuat satu bidan baru.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Bidan gagal dihapus");
    } finally {
      setLoading(false);
    }
  };

  const submitCustomer = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      name: customerForm.name,
      email: customerForm.email,
      password: customerForm.password,
    };

    try {
      if (customerForm.id) {
        await apiFetch(`/api/admin/customers/${customerForm.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        setMessage("Data customer berhasil diperbarui.");
      } else {
        await apiFetch("/api/admin/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        setMessage("Customer baru berhasil dibuat.");
      }
      setCustomerForm(emptyCustomerForm);
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Data customer gagal disimpan");
      setLoading(false);
    }
  };

  const editCustomer = (customer: Customer) => {
    setCustomerForm({
      id: String(customer.id),
      name: customer.name,
      email: customer.email,
      password: "",
    });
  };

  const deleteCustomer = async (customer: Customer) => {
    const approved = window.confirm(`Hapus customer ${customer.name} beserta chat dan sesi loginnya?`);
    if (!approved) return;

    setLoading(true);
    setMessage("");
    try {
      await apiFetch(`/api/admin/customers/${customer.id}`, { method: "DELETE" });
      if (customerForm.id === String(customer.id)) setCustomerForm(emptyCustomerForm);
      setMessage("Customer berhasil dihapus.");
      await loadData();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Customer gagal dihapus");
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-display text-xl font-bold">Login admin diperlukan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Masuk sebagai admin untuk mengelola satu akun bidan dan melihat chat customer.</p>
          <Button asChild className="mt-4 h-11 w-full rounded-full">
            <Link to="/login">Masuk Admin</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="safe-x flex min-h-full flex-col justify-center gap-4 py-6">
        <div className="rounded-3xl bg-card p-5 text-center shadow-card">
          <ShieldCheck className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h1 className="font-display text-xl font-bold">Khusus admin bidan</h1>
          <p className="mt-2 text-sm text-muted-foreground">Akun ini belum memiliki akses admin.</p>
          <Button asChild variant="secondary" className="mt-4 h-11 w-full rounded-full">
            <Link to="/login">Ganti Akun</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="safe-x space-y-4 pb-5 pt-5">
      <div className="flex items-center gap-3">
        <Link to="/app/profil" className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Admin</p>
          <h1 className="font-display text-xl font-bold leading-tight">CRUD Bidan</h1>
        </div>
        <button onClick={loadData} className="ml-auto grid h-10 w-10 place-items-center rounded-full bg-muted" aria-label="Muat ulang">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      <form onSubmit={submitMidwife} className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">{isEditing ? "Edit Bidan Utama" : "Tambah Satu Bidan"}</h2>
        </div>

        {[
          ["name", "Nama bidan"],
          ["email", "Email bidan"],
          ["password", isEditing ? "Password bidan baru (opsional)" : "Password minimal 6 karakter"],
          ["specialty", "Spesialisasi"],
          ["clinic", "Nama klinik"],
          ["distance", "Jarak/status layanan"],
          ["rating", "Rating"],
          ["reviews", "Jumlah ulasan"],
        ].map(([field, placeholder]) => (
          <input
            key={field}
            type={field === "password" ? "password" : field === "email" ? "email" : field === "rating" || field === "reviews" ? "number" : "text"}
            step={field === "rating" ? "0.1" : undefined}
            value={form[field as keyof typeof form]}
            onChange={(event) => setForm((current) => ({ ...current, [field]: event.target.value }))}
            className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
            placeholder={placeholder}
          />
        ))}

        {message && <p className="rounded-2xl bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground">{message}</p>}

        <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
          <Button className="h-11 rounded-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditing ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
            {isEditing ? "Simpan" : "Buat Bidan"}
          </Button>
          <Button type="button" variant="destructive" className="h-11 rounded-full" disabled={loading || !midwife} onClick={deleteMidwife}>
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus
          </Button>
        </div>
      </form>

      {midwife && (
        <section className="rounded-2xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bidan Aktif</p>
          <p className="mt-1 font-semibold">{midwife.name}</p>
          <p className="text-xs text-muted-foreground">{midwife.email}</p>
          <p className="mt-2 text-sm">{midwife.specialty ?? "KIA & Kehamilan"}</p>
          <p className="text-xs text-muted-foreground">{midwife.clinic ?? "Klinik BidanKita"}</p>
        </section>
      )}

      <section className="space-y-2">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-bold">Pendaftar Customer</h2>
        </div>

        <form onSubmit={submitCustomer} className="space-y-3 rounded-3xl bg-card p-4 shadow-card">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {isEditingCustomer ? "Edit customer" : "Tambah customer"}
          </p>
          <input
            value={customerForm.name}
            onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))}
            className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
            placeholder="Nama customer"
          />
          <input
            type="email"
            value={customerForm.email}
            onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))}
            className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
            placeholder="Email customer"
          />
          <input
            type="password"
            value={customerForm.password}
            onChange={(event) => setCustomerForm((current) => ({ ...current, password: event.target.value }))}
            className="h-11 w-full rounded-2xl bg-muted px-4 text-sm outline-none ring-primary/30 focus:ring-2"
            placeholder={isEditingCustomer ? "Password baru customer (opsional)" : "Password minimal 6 karakter"}
          />
          <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2">
            <Button className="h-11 rounded-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isEditingCustomer ? <Save className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
              {isEditingCustomer ? "Update Customer" : "Buat Customer"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="h-11 rounded-full"
              disabled={loading || !isEditingCustomer}
              onClick={() => setCustomerForm(emptyCustomerForm)}
            >
              Batal Edit
            </Button>
          </div>
        </form>

        {customers.length === 0 && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">Belum ada pendaftar customer.</p>}
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary/10 font-bold text-primary">
                {customer.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{customer.name}</p>
                <p className="truncate text-xs text-muted-foreground">{customer.email}</p>
                {customer.created_at && <p className="mt-1 text-[11px] text-muted-foreground">Daftar: {customer.created_at}</p>}
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button type="button" variant="secondary" className="h-10 rounded-full text-xs" onClick={() => editCustomer(customer)}>
                Edit
              </Button>
              <Button type="button" variant="destructive" className="h-10 rounded-full text-xs" onClick={() => deleteCustomer(customer)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Hapus
              </Button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold">Chat Customer</h2>
          <Link to="/app/inbox" className="text-xs font-semibold text-primary">Lihat semua</Link>
        </div>
        {threads.length === 0 && <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">Belum ada thread chat customer.</p>}
        {threads.slice(0, 3).map((thread) => (
          <Link key={thread.id} to={`/app/chat/${thread.midwife_id}?threadId=${thread.id}`} className="block rounded-2xl bg-card p-4 shadow-card">
            <p className="font-semibold">{thread.customer_name}</p>
            <p className="text-sm text-muted-foreground">Dengan {thread.midwife_name}</p>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default AdminBidan;
