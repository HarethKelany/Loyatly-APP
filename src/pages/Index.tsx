import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight, Users, Gift, Smartphone } from "lucide-react";
import LoyaltyCard from "@/components/LoyaltyCard";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-primary-foreground mb-4">
              <Coffee className="w-10 h-10" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif text-foreground">BAKEBAR</h1>
            <p className="text-xl text-muted-foreground max-w-lg mx-auto">
              Earn a free treat every 7 visits. No app needed — your loyalty card lives in Apple Wallet.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/join">
                <Button size="lg">
                  <Smartphone className="w-5 h-5 mr-2" /> Join Loyalty Program
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button size="lg" variant="outline">
                  <Users className="w-5 h-5 mr-2" /> Staff Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Preview Card */}
          <div className="max-w-sm mx-auto mt-12">
            <LoyaltyCard
              customerName="Jane Doe"
              customerCode="04821"
              stampCount={4}
              isRewardReady={false}
            />
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-serif text-foreground text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
          {[
            {
              icon: Smartphone,
              title: "Sign Up",
              desc: "Scan the QR code, enter your details, and add your card to Apple Wallet",
            },
            {
              icon: Coffee,
              title: "Earn Stamps",
              desc: "Every time you pay with Apple Pay at Bakebar, a stamp is logged automatically",
            },
            {
              icon: Gift,
              title: "Get Rewarded",
              desc: "After 7 visits, unlock a free treat! Show your card to the cashier to redeem",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-lg font-serif text-foreground">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
