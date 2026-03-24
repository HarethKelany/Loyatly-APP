import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoyaltyCard from "@/components/LoyaltyCard";
import { Coffee, ArrowRight } from "lucide-react";

const Onboarding = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{ code: string; name: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      // Generate code
      const { data: codeData, error: codeError } = await supabase.rpc("generate_customer_code");
      if (codeError) throw codeError;

      const code = codeData as string;

      // Create customer
      const { data: customer, error: customerError } = await supabase
        .from("customers")
        .insert({ name, phone, email, code })
        .select()
        .single();

      if (customerError) {
        if (customerError.message.includes("duplicate")) {
          toast.error("A customer with this phone or email already exists");
        } else {
          throw customerError;
        }
        return;
      }

      // Create pass
      const serialNumber = `BAKEBAR-${code}-${Date.now()}`;
      await supabase.from("passes").insert({
        customer_id: customer.id,
        serial_number: serialNumber,
      });

      setRegistered({ code, name });
      toast.success("Welcome to Bakebar Loyalty! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground mb-4">
            <Coffee className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-serif text-foreground">BAKEBAR</h1>
          <p className="text-muted-foreground">Join our loyalty program — earn a free treat every 7 visits!</p>
        </div>

        {registered ? (
          <div className="space-y-6">
            <LoyaltyCard
              customerName={registered.name}
              customerCode={registered.code}
              stampCount={0}
              isRewardReady={false}
            />
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <p className="text-lg font-medium text-foreground">You're all set! 🎉</p>
                <p className="text-muted-foreground">
                  Your loyalty code is <span className="font-mono font-bold text-primary text-lg">{registered.code}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Pay with Apple Pay at Bakebar and your visits will be tracked automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-2">
              <h2 className="text-xl font-serif text-foreground">Create your loyalty card</h2>
              <p className="text-sm text-muted-foreground">Quick sign-up — no app needed</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 (555) 123-4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Creating your card..." : "Get My Loyalty Card"}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
