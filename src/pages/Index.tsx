import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, ArrowRight, Gift, Smartphone, Download, Wallet, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              A breakfast and brunch café in Cairo. We keep things simple — a focused menu, quality ingredients, and a space designed to make your morning feel like it matters.
            </p>
            <p className="text-base text-muted-foreground/80 max-w-md mx-auto">
              No noise, no gimmicks. Just well-made food and the kind of atmosphere that makes you want to slow down for an hour.
            </p>
            <p className="text-sm font-serif text-primary italic">
              Come for the coffee. Stay for the bakes.
            </p>
            {/* Dual CTA Cards */}
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {/* Customer Card */}
              <Link to="/join" className="block group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Wallet className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif text-foreground">Get Your Loyalty Card</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Scan, collect stamps, and earn rewards at your favorite restaurants.
                    </p>
                    <Button className="w-full">
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Restaurant Owner Card */}
              <Link to="/register/restaurant" className="block group">
                <Card className="h-full border-2 border-secondary hover:border-accent/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-secondary group-hover:bg-accent/10 transition-colors">
                      <Store className="w-7 h-7 text-secondary-foreground" />
                    </div>
                    <h3 className="text-xl font-serif text-foreground">Register Your Restaurant</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Set up your loyalty program, customize your card, and track your customers.
                    </p>
                    <Button variant="outline" className="w-full">
                      Register Now <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
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

      {/* QR Code Section */}
      <div className="surface-warm py-16">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-serif text-foreground">Scan to Join</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Print this QR code and place it at the counter — customers scan it to sign up instantly.
          </p>
          <Card className="inline-block border-0 shadow-lg bg-background p-2 qr-print-area">
            <CardContent className="p-6">
              <QRCodeSVG
                value={`${window.location.origin}/join`}
                size={200}
                bgColor="hsl(35, 30%, 97%)"
                fgColor="hsl(25, 20%, 12%)"
                level="M"
                includeMargin={false}
              />
              <p className="mt-4 text-sm font-medium text-foreground font-serif">BAKEBAR LOYALTY</p>
              <p className="text-xs text-muted-foreground">Scan to get your free loyalty card</p>
            </CardContent>
          </Card>
          <div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const svg = document.querySelector('.qr-print-area svg');
                if (!svg) return;
                const svgData = new XMLSerializer().serializeToString(svg);
                const canvas = document.createElement('canvas');
                canvas.width = 600; canvas.height = 600;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                img.onload = () => {
                  ctx?.drawImage(img, 0, 0, 600, 600);
                  const a = document.createElement('a');
                  a.download = 'bakebar-qr.png';
                  a.href = canvas.toDataURL('image/png');
                  a.click();
                };
                img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
              }}
            >
              <Download className="w-4 h-4 mr-1" /> Download QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
