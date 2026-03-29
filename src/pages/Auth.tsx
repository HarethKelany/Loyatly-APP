import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Coffee, ArrowRight, Mail, Lock } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const { session, role, profileLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session && !profileLoading && role) {
      if (role === "SUPER_ADMIN") navigate("/admin");
      else if (role === "RESTAURANT_OWNER") navigate("/owner");
      else navigate("/dashboard");
    }
  }, [session, role, profileLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      } else {
        const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
        if (error) throw error;
        toast.success("Account created!");
      }
    } catch (error: any) { toast.error(error.message || "Authentication failed"); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="hero-teal px-6 pt-16 pb-14 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white mb-5 shadow-sm">
          <Coffee className="w-8 h-8" style={{ color: "hsl(var(--teal))" }} />
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-1">{isLogin ? "Welcome Back" : "Create Account"}</h1>
        <p className="text-sm text-white/80">{isLogin ? "Sign in to your account" : "Join the Bakebar family"}</p>
      </div>
      <div className="px-5 -mt-7 relative z-10 flex-1">
        <div className="bg-card rounded-3xl border border-border shadow-xl p-6">
          <h2 className="text-lg font-extrabold text-foreground mb-5">{isLogin ? "Sign In" : "Sign Up"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="pl-10 h-12 rounded-xl bg-muted border-0 text-sm" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-10 h-12 rounded-xl bg-muted border-0 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 mt-2" style={{ background: "hsl(var(--teal))" }}>
              {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          </form>
          <div className="mt-5 text-center">
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-sm text-muted-foreground">
              {isLogin
                ? <span>Don't have an account? <span className="font-semibold" style={{ color: "hsl(var(--teal))" }}>Sign up</span></span>
                : <span>Already have an account? <span className="font-semibold" style={{ color: "hsl(var(--teal))" }}>Sign in</span></span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
