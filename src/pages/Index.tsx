import { Link } from "react-router-dom";
import heroIllustration from "@/assets/hero-illustration.png";
import mockupScreens from "@/assets/mockup-screens.png";
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

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50">
        <nav className="container mx-auto flex items-center justify-between py-4">
          <a href="#" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-primary grid place-items-center shadow-soft">
              <Baby className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold">BidanKita</span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#fitur" className="hover:text-primary transition-smooth">Fitur</a>
            <a href="#cara" className="hover:text-primary transition-smooth">Cara Kerja</a>
            <a href="#tampilan" className="hover:text-primary transition-smooth">Tampilan</a>
            <a href="#testimoni" className="hover:text-primary transition-smooth">Testimoni</a>
          </div>
          <Button asChild className="rounded-full px-6 shadow-soft"><Link to="/onboarding">Buka Aplikasi</Link></Button>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-hero">
        <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-secondary/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-accent/40 blur-3xl" />
        <div className="container mx-auto relative grid lg:grid-cols-2 gap-12 items-center py-20 lg:py-28">
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-card/80 backdrop-blur px-4 py-2 rounded-full text-sm font-medium text-primary shadow-card mb-6">
              <Sparkles className="w-4 h-4" />
              Pendamping kehamilan #1 untuk ibu Indonesia
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.05] text-foreground">
              Konsultasi Bidan,
              <span className="block text-primary">teman sehat ibu & bayi.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl leading-relaxed">
              Pendamping tepercaya untuk setiap langkah kehamilan. Chat bidan,
              jadwalkan kunjungan, ikuti kelas ibu hamil, dan pantau perkembangan
              si kecil — semua dalam satu aplikasi yang menenangkan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full px-8 h-14 text-base shadow-soft">
                <Link to="/onboarding">Mulai Sekarang <ArrowRight className="ml-1 w-4 h-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-base bg-card/60">
                <Link to="/app">Sudah punya akun? Masuk</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap gap-6">
              {trustBadges.map((b) => (
                <div key={b.label} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-card grid place-items-center shadow-card">
                    <b.icon className={`w-5 h-5 ${b.color}`} />
                  </div>
                  <span className="text-sm font-semibold text-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative animate-float">
            <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl rounded-full" />
            <img
              src={heroIllustration}
              alt="Ilustrasi ibu hamil bersama bidan tepercaya"
              width={1024}
              height={1024}
              className="relative w-full max-w-lg mx-auto"
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="fitur" className="py-24 bg-background">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-primary font-semibold mb-3">Fitur Utama</p>
            <h2 className="text-4xl lg:text-5xl font-bold">
              Semua yang ibu butuhkan, dalam genggaman.
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Dirancang bersama bidan untuk pengalaman yang hangat, aman, dan mudah dipakai.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="group p-8 rounded-3xl bg-card shadow-card hover:shadow-soft hover:-translate-y-2 transition-smooth border border-border/50"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary grid place-items-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
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
      <section id="cara" className="py-24 bg-gradient-soft">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-primary font-semibold mb-3">Cara Kerja</p>
            <h2 className="text-4xl lg:text-5xl font-bold">Tiga langkah mudah</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((s) => (
              <div key={s.n} className="relative p-8 rounded-3xl bg-card shadow-card">
                <div className="text-6xl font-bold font-display text-primary/20 mb-2">{s.n}</div>
                <h3 className="text-2xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREENS */}
      <section id="tampilan" className="py-24 bg-background">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-12">
            <p className="text-primary font-semibold mb-3">Tampilan Aplikasi</p>
            <h2 className="text-4xl lg:text-5xl font-bold">Desain yang menenangkan</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Warna lembut, ilustrasi ramah, dan navigasi yang mudah untuk pengalaman nyaman di setiap tahap kehamilan.
            </p>
          </div>
          <div className="rounded-3xl overflow-hidden shadow-phone bg-gradient-soft p-6 lg:p-10">
            <img
              src={mockupScreens}
              alt="Tampilan layar aplikasi BidanKita: onboarding, beranda, daftar bidan, chat, dan tracking kesehatan"
              loading="lazy"
              className="w-full rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimoni" className="py-24 bg-gradient-soft">
        <div className="container mx-auto">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-primary font-semibold mb-3">Cerita Mereka</p>
            <h2 className="text-4xl lg:text-5xl font-bold">Dipercaya ribuan ibu & bidan</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-8 rounded-3xl bg-card shadow-card border border-border/50">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <div className="w-11 h-11 rounded-full bg-secondary grid place-items-center">
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
      <section className="py-24 bg-background">
        <div className="container mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-primary p-12 lg:p-20 text-center shadow-soft">
            <div className="absolute -top-10 -right-10 w-60 h-60 rounded-full bg-primary-soft/30 blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-60 h-60 rounded-full bg-accent/30 blur-2xl" />
            <div className="relative max-w-2xl mx-auto">
              <Heart className="w-12 h-12 text-primary-foreground mx-auto mb-6" />
              <h2 className="text-4xl lg:text-5xl font-bold text-primary-foreground mb-4">
                Untuk setiap ibu, untuk setiap langkah.
              </h2>
              <p className="text-primary-foreground/90 text-lg mb-8">
                Kami di sini menemani ibu dari trimester pertama hingga si kecil lahir dengan sehat.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button asChild size="lg" variant="secondary" className="rounded-full px-8 h-14 text-base">
                  <Link to="/onboarding">Coba Aplikasinya</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="rounded-full px-8 h-14 text-base bg-transparent text-primary-foreground border-primary-foreground/40 hover:bg-primary-foreground/10 hover:text-primary-foreground">
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
            <div className="w-8 h-8 rounded-xl bg-gradient-primary grid place-items-center">
              <Baby className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">BidanKita</span>
          </div>
          <p>© 2026 BidanKita. Dibuat dengan ❤️ untuk ibu Indonesia.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
