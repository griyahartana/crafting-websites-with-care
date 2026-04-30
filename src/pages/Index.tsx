import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShieldCheck,
  Lock,
  Smile,
  MessageCircle,
  CalendarCheck,
  BookOpen,
  Activity,
  Star,
  ArrowRight,
  Baby,
  Stethoscope,
  Sparkles,
  ClipboardList,
} from "lucide-react";

const trustBadges = [
  { icon: ShieldCheck, label: "Tepercaya", color: "text-primary" },
  { icon: Heart, label: "Peduli", color: "text-accent-foreground" },
  { icon: Lock, label: "Aman", color: "text-info" },
  { icon: Smile, label: "Nyaman", color: "text-secondary-foreground" },
];

const features = [
  {
    icon: MessageCircle,
    title: "Konsultasi Langsung",
    desc: "Chat dengan bidan profesional kapan pun ibu butuh dukungan.",
  },
  {
    icon: CalendarCheck,
    title: "Janji Kunjungan",
    desc: "Atur jadwal USG, ANC, dan kunjungan rutin dalam satu tempat.",
  },
  {
    icon: BookOpen,
    title: "Edukasi Ibu Hamil",
    desc: "Artikel & kelas tepercaya untuk setiap trimester kehamilan.",
  },
  {
    icon: Activity,
    title: "Pantau Perkembangan",
    desc: "Catat berat, panjang, dan detak jantung si kecil dengan mudah.",
  },
];

const steps = [
  { n: "01", title: "Daftar & Lengkapi Profil", desc: "Buat akun dalam hitungan menit dan masukkan data kehamilan ibu." },
  { n: "02", title: "Pilih Bidan Favorit", desc: "Telusuri bidan berdasarkan spesialisasi, jarak, dan rating." },
  { n: "03", title: "Konsultasi & Pantau", desc: "Chat, buat janji, dan pantau perkembangan ibu & bayi setiap hari." },
];

const testimonials = [
  {
    name: "Ayu Pratiwi",
    role: "Ibu, 24 minggu",
    text: "Sangat membantu! Setiap kekhawatiran kecil bisa langsung saya tanyakan ke Bidan Rina. Tenang banget rasanya.",
  },
  {
    name: "Sari Wulandari",
    role: "Ibu menyusui",
    text: "Fitur tracking-nya lengkap. Saya bisa lihat tren berat janin dan jadwal ANC tanpa ribet catat manual.",
  },
  {
    name: "Bidan Rina A., S.ST",
    role: "Mitra Bidan",
    text: "Platform yang ramah, baik untuk ibu maupun kami para bidan. Komunikasi jadi lebih hangat & terstruktur.",
  },
];

const appShortcuts = [
  {
    icon: MessageCircle,
    title: "Chat bidan langsung",
    desc: "Mulai konsultasi dari daftar bidan dan lanjutkan percakapan di ruang chat.",
    to: "/app/cari-bidan",
  },
  {
    icon: CalendarCheck,
    title: "Atur kunjungan",
    desc: "Buat dan pantau jadwal USG, ANC, atau kelas ibu hamil.",
    to: "/app/kunjungan",
  },
  {
    icon: ClipboardList,
    title: "Pantau kehamilan",
    desc: "Lihat usia kehamilan, pengingat, dan perkembangan si kecil.",
    to: "/app/tracking",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <nav className="container mx-auto flex items-center justify-between gap-3 py-3 sm:py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-primary shadow-soft">
              <Baby className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold sm:text-xl">BidanKita</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#fitur" className="hover:text-primary transition-smooth">Fitur</a>
            <a href="#cara" className="hover:text-primary transition-smooth">Cara Kerja</a>
            <a href="#aplikasi" className="hover:text-primary transition-smooth">Aplikasi</a>
            <a href="#testimoni" className="hover:text-primary transition-smooth">Testimoni</a>
          </div>
          <Button asChild className="h-10 rounded-full px-4 text-sm shadow-soft sm:px-6"><Link to="/onboarding">Buka Aplikasi</Link></Button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="container mx-auto relative grid items-center gap-10 py-14 sm:py-18 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 text-sm font-medium text-primary shadow-card backdrop-blur">
              <Sparkles className="w-4 h-4" />
              Pendamping kehamilan untuk ibu Indonesia
            </div>
            <h1 className="text-4xl font-bold leading-[1.08] text-foreground sm:text-5xl lg:text-6xl">
              Konsultasi Bidan,
              <span className="block text-primary">teman sehat ibu & bayi.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Pendamping tepercaya untuk setiap langkah kehamilan. Chat bidan,
              jadwalkan kunjungan, ikuti kelas ibu hamil, dan pantau perkembangan
              si kecil — semua dalam satu aplikasi yang menenangkan.
            </p>
            <div className="mt-7 grid gap-3 sm:flex sm:flex-wrap">
              <Button asChild size="lg" className="h-[52px] rounded-full px-7 text-base shadow-soft sm:h-14 sm:px-8">
                <Link to="/onboarding">Mulai Sekarang <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-[52px] rounded-full bg-card/60 px-7 text-base sm:h-14 sm:px-8">
                <Link to="/app">Sudah punya akun? Masuk</Link>
              </Button>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6">
              {trustBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-card shadow-card">
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <img
              src={heroIllustration}
              alt="Ilustrasi ibu hamil bersama bidan tepercaya"
              width={1024}
              height={1024}
              className="relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-lg"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fitur" className="bg-background py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <p className="text-primary font-semibold mb-3">Fitur Utama</p>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Semua yang ibu butuhkan, dalam genggaman.
            </h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Dirancang bersama bidan untuk pengalaman yang hangat, aman, dan mudah dipakai.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group rounded-3xl border border-border/50 bg-card p-6 shadow-card transition-smooth hover:-translate-y-2 hover:shadow-soft sm:p-8"
              >
                <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-secondary transition-smooth group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="w-7 h-7 text-secondary-foreground group-hover:text-primary-foreground transition-smooth" />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="cara" className="bg-gradient-soft py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <p className="text-primary font-semibold mb-3">Cara Kerja</p>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Tiga langkah mudah</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((s) => (
              <div key={s.n} className="relative rounded-3xl bg-card p-6 shadow-card sm:p-8">
                <div className="text-6xl font-bold font-display text-primary/20 mb-2">{s.n}</div>
                <h3 className="mb-3 text-xl font-bold sm:text-2xl">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* APP SHORTCUTS */}
      <section id="aplikasi" className="bg-background py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-primary font-semibold mb-3">Aplikasi Siap Dipakai</p>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Buka fitur, langsung jalan</h2>
            <p className="mt-4 text-base text-muted-foreground sm:text-lg">
              Setiap bagian sudah berupa halaman interaktif, bukan gambar pratinjau. Coba dari HP untuk merasakan alurnya.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {appShortcuts.map((item) => (
              <Link
                key={item.title}
                to={item.to}
                className="group flex min-h-48 flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 shadow-card transition-smooth hover:-translate-y-1 hover:shadow-soft"
              >
                <div>
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-secondary">
                    <item.icon className="h-6 w-6 text-secondary-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.desc}</p>
                </div>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-primary">
                  Buka fitur <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimoni" className="bg-gradient-soft py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-16">
            <p className="text-primary font-semibold mb-3">Cerita Mereka</p>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">Dipercaya ribuan ibu & bidan</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-3xl border border-border/50 bg-card p-6 shadow-card sm:p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary">
                    <Stethoscope className="w-5 h-5 text-secondary-foreground" />
                  </div>
                  <div>
                    <p className="font-bold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background py-16 sm:py-24">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-6 text-center shadow-soft sm:p-12 lg:p-20">
            <div className="relative max-w-2xl mx-auto">
              <Heart className="w-12 h-12 text-primary-foreground mx-auto mb-6" />
              <h2 className="mb-4 text-3xl font-bold text-primary-foreground sm:text-4xl lg:text-5xl">
                Untuk setiap ibu, untuk setiap langkah.
              </h2>
              <p className="mb-8 text-base text-primary-foreground/90 sm:text-lg">
                Kami di sini menemani ibu dari trimester pertama hingga si kecil lahir dengan sehat.
              </p>
              <div className="grid gap-3 sm:flex sm:flex-wrap sm:justify-center">
                <Button asChild size="lg" variant="secondary" className="h-14 rounded-full px-8 text-base">
                  <Link to="/onboarding">Coba Aplikasinya</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-14 rounded-full border-primary-foreground/40 bg-transparent px-8 text-base text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <Link to="/app">Masuk ke Akun</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-10 bg-background">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-primary">
              <Baby className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">BidanKita</span>
          </div>
          <p className="text-center md:text-right">© 2026 BidanKita. Dibuat dengan ❤️ untuk ibu Indonesia.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
