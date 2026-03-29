import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Coffee, ArrowRight, Wallet, Store, MapPin, Phone, Mail, Clock } from "lucide-react";
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
            <p className="text-sm font-serif text-primary italic">
              Come for the coffee. Stay for the bakes.
            </p>

            {/* CTA Cards */}
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto pt-2">
              {/* Customer */}
              <Link to="/join" className="block group">
                <Card className="h-full border-2 border-primary/20 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                      <Wallet className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="text-xl font-serif text-foreground">Get Your Loyalty Card</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sign up, collect stamps, and earn rewards with every visit.
                    </p>
                    <Button className="w-full">
                      Get Started <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>

              {/* Owner */}
              <Link to="/join?tab=restaurant" className="block group">
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

          {/* Loyalty Card Preview */}
          <div className="max-w-sm mx-auto mt-14">
            <p className="text-center text-xs text-muted-foreground mb-4 font-serif uppercase tracking-widest">Your card looks like this</p>
            <LoyaltyCard
              customerName="Jane Doe"
              customerCode="04821"
              stampCount={4}
              isRewardReady={false}
            />
          </div>
        </div>
      </div>

      {/* About Us */}
      <div className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 py-16 max-w-4xl">
          <h2 className="text-3xl font-serif text-foreground text-center mb-12">About Us</h2>
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Story */}
            <div className="space-y-4">
              <h3 className="text-xl font-serif text-foreground">Who We Are</h3>
              <p className="text-muted-foreground leading-relaxed">
                Bakebar is a breakfast and brunch café born in Cairo with one idea in mind — that mornings deserve more attention. We serve a focused, well-crafted menu using quality ingredients, in a calm space built for slowing down.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our loyalty program is our way of saying thank you to the regulars who make Bakebar what it is. No points, no tiers — just stamps and a free treat when you've earned it.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-5">
              <h3 className="text-xl font-serif text-foreground">Find Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-muted-foreground">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span>123 El Tahrir Street, Zamalek, Cairo, Egypt</span>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-5 h-5 text-primary shrink-0" />
                  <a href="tel:+20211234567" className="hover:text-foreground transition-colors">+20 2 1234 5678</a>
                </li>
                <li className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-5 h-5 text-primary shrink-0" />
                  <a href="mailto:hello@bakebar.cafe" className="hover:text-foreground transition-colors">hello@bakebar.cafe</a>
                </li>
                <li className="flex items-start gap-3 text-muted-foreground">
                  <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <div>
                    <p>Mon – Fri: 7:00 AM – 4:00 PM</p>
                    <p>Sat – Sun: 8:00 AM – 5:00 PM</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Bakebar. All rights reserved.
      </div>

    </div>
  );
};

export default Index;
