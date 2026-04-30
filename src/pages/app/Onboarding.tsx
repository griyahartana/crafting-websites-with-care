import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroIllustration from "@/assets/hero-illustration.png";

const Onboarding = () => {
  return (
    <div className="flex flex-col h-full px-6 pt-6 pb-6 bg-gradient-hero min-h-[750px]">
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="font-display text-3xl font-bold text-primary">Konsultasi Bidan</h1>
        <p className="text-muted-foreground mt-2">Teman sehat ibu &amp; bayi</p>
        <div className="my-6 relative w-full max-w-xs animate-float">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full" />
          <img
            src={heroIllustration}
            alt="Ibu hamil bersama bidan"
            width={1024}
            height={1024}
            className="relative w-full"
          />
        </div>
        <div className="flex gap-1.5 mb-6">
          <span className="w-6 h-1.5 rounded-full bg-primary" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
        </div>
      </div>
      <div className="space-y-3">
        <Button asChild size="lg" className="w-full rounded-full h-14 text-base shadow-soft">
          <Link to="/app">Mulai Sekarang</Link>
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/app" className="text-primary font-semibold">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Onboarding;
