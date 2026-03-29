import { Link } from "react-router-dom";
import { MapPin, Clock, Mail, Coffee, CreditCard, Store } from "lucide-react";
import LoyaltyCard from "@/components/LoyaltyCard";

const Index = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <div className="hero-coral px-6 pt-14 pb-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-5 shadow-sm">
        <Coffee className="w-8 h-8" style={{ color: "hsl(var(--coral))" }} />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">BAKEBAR</h1>
      <p className="text-sm text-white/80 italic">Come for the coffee. Stay for the bakes.</p>
    </div>
    <div className="px-5 -mt-6 relative z-10">
      <p className="text-center text-[10px] text-muted-foreground uppercase tracking-widest mb-3 font-semibold">Your card looks like this</p>
      <LoyaltyCard customerName="Jane Doe" customerCode="04821" stampCount={4} isRewardReady={false} />
    </div>
    <div className="px-5 mt-5 grid grid-cols-2 gap-3">
      <Link to="/join" className="block">
        <div className="bg-card rounded-2xl border border-border p-4 h-full flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="icon-box-coral w-10 h-10 rounded-xl flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
          <p className="text-sm font-bold text-foreground leading-snug">Get Your Loyalty Card</p>
          <div className="w-full py-2 rounded-xl text-center text-xs font-bold text-white mt-auto" style={{ background: "hsl(var(--coral))" }}>Get Started →</div>
        </div>
      </Link>
      <Link to="/join?tab=restaurant" className="block">
        <div className="bg-card rounded-2xl border border-border p-4 h-full flex flex-col gap-3 transition-all hover:shadow-md hover:-translate-y-0.5">
          <div className="icon-box-teal w-10 h-10 rounded-xl flex items-center justify-center"><Store className="w-5 h-5" /></div>
          <p className="text-sm font-bold text-foreground leading-snug">Register Your Restaurant</p>
          <div className="w-full py-2 rounded-xl text-center text-xs font-bold text-white mt-auto" style={{ background: "hsl(var(--teal))" }}>Register Now →</div>
        </div>
      </Link>
    </div>
    <div className="px-5 mt-5 flex flex-col gap-2.5">
      {([[MapPin, "123 El Tahrir Street, Zamalek, Cairo"], [Clock, "Mon–Fri 7am–4pm · Sat–Sun 8am–5pm"], [Mail, "hello@bakebar.cafe"]] as const).map(([Icon, text], i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="icon-box-coral w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"><Icon className="w-4 h-4" /></span>
          <span className="text-sm text-muted-foreground">{text}</span>
        </div>
      ))}
    </div>
    <div className="mt-auto py-4 text-center text-xs text-muted-foreground border-t border-border">© {new Date().getFullYear()} Bakebar. All rights reserved.</div>
  </div>
);

export default Index;
