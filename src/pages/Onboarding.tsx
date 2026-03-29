import { useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LoyaltyCard from "@/components/LoyaltyCard";
import {
  Coffee,
  ArrowRight,
  Store,
  Upload,
  X,
  MapPin,
  Phone,
  Image as ImageIcon,
} from "lucide-react";

/* ─── Customer tab (original flow) ─── */
const CustomerTab = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState<{
    code: string;
    name: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !email) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    try {
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_customer_code"
      );
      if (codeError) throw codeError;
      const code = codeData as string;
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
      const serialNumber = `BAKEBAR-${code}-${Date.now()}`;
      await supabase
        .from("passes")
        .insert({ customer_id: customer.id, serial_number: serialNumber });
      setRegistered({ code, name });
      toast.success("Welcome to Bakebar Loyalty! 🎉");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return registered ? (
    <div className="space-y-6">
      <LoyaltyCard
        customerName={registered.name}
        customerCode={registered.code}
        stampCount={0}
        isRewardReady={false}
      />
      <Card>
        <CardContent className="pt-6 text-center space-y-3">
          <p className="text-lg font-medium text-foreground">
            You're all set! 🎉
          </p>
          <p className="text-muted-foreground">
            Your loyalty code is{" "}
            <span className="font-mono font-bold text-primary text-lg">
              {registered.code}
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Pay with Apple Pay at Bakebar and your visits will be tracked
            automatically.
          </p>
        </CardContent>
      </Card>
    </div>
  ) : (
    <Card className="border-0 shadow-lg max-w-md mx-auto">
      <CardHeader className="pb-2">
        <h2 className="text-xl font-serif text-foreground">
          Create your loyalty card
        </h2>
        <p className="text-sm text-muted-foreground">
          Quick sign-up — no app needed
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Creating your card..." : "Get My Loyalty Card"}
            {!loading && <ArrowRight className="ml-2 w-4 h-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

/* ─── Restaurant registration tab ─── */

const CUISINE_TYPES = [
  "Egyptian",
  "Italian",
  "Asian Fusion",
  "Seafood",
  "Fast Food",
  "Café / Bakery",
  "Other",
];
const CITIES = [
  "Cairo",
  "Alexandria",
  "Giza",
  "Sharm El-Sheikh",
  "Hurghada",
  "Other",
];
const BRANCH_COUNTS = ["1", "2–5", "6–15", "16+"];
const COUNTRY_CODES = [
  { value: "+20", label: "+20 🇪🇬" },
  { value: "+1", label: "+1 🇺🇸" },
  { value: "+44", label: "+44 🇬🇧" },
  { value: "+971", label: "+971 🇦🇪" },
  { value: "+966", label: "+966 🇸🇦" },
];

interface UploadedFile {
  file: File;
  preview: string;
}

const RequiredStar = () => (
  <span className="text-destructive ml-0.5">*</span>
);

const SectionHeading = ({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <h3 className="text-lg font-serif text-foreground">{title}</h3>
  </div>
);

const RestaurantTab = () => {
  const [form, setForm] = useState({
    restaurantName: "",
    cuisineType: "",
    description: "",
    city: "",
    district: "",
    streetAddress: "",
    branchName: "",
    branchCount: "",
    mapsLink: "",
    ownerName: "",
    email: "",
    countryCode: "+20",
    phone: "",
    whatsapp: "",
    website: "",
    instagram: "",
  });
  const [logo, setLogo] = useState<UploadedFile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const setSelect = (key: string) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast.error("Please upload a PNG or JPG file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File must be under 5 MB");
      return;
    }
    const img = new window.Image();
    img.onload = () => {
      if (img.width < 200 || img.height < 200) {
        toast.error("Image must be at least 200×200 pixels");
        URL.revokeObjectURL(img.src);
        return;
      }
      setLogo({ file, preview: URL.createObjectURL(file) });
    };
    img.src = URL.createObjectURL(file);
  };

  const removeLogo = () => {
    if (logo) URL.revokeObjectURL(logo.preview);
    setLogo(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const missing: string[] = [];
    if (!form.restaurantName.trim()) missing.push("Restaurant name");
    if (!form.streetAddress.trim()) missing.push("Street address");
    if (!form.ownerName.trim()) missing.push("Owner / manager name");
    if (!form.email.trim()) missing.push("Email");
    if (!form.phone.trim()) missing.push("Phone number");
    if (missing.length) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }
    setSubmitted(true);
    toast.success("Registration submitted successfully!");
  };

  const handleSaveDraft = () => {
    toast.success("Draft saved");
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto">
        <Card className="border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.05)]">
          <CardContent className="pt-6 text-center space-y-3">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[hsl(var(--success)/0.15)] mb-2">
              <Store className="w-7 h-7 text-[hsl(var(--success))]" />
            </div>
            <h2 className="text-xl font-serif text-foreground">
              Registration submitted!
            </h2>
            <p className="text-muted-foreground">
              We've received your restaurant details. Our team will review your
              application and get back to you within 2 business days.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setSubmitted(false)}
            >
              Submit another
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-8">
      {/* ── Section 1: Restaurant Details ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeading icon={Store} title="Restaurant Details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Restaurant name <RequiredStar />
              </Label>
              <Input
                value={form.restaurantName}
                onChange={set("restaurantName")}
                placeholder="e.g. Cairo Grill House"
              />
            </div>
            <div className="space-y-2">
              <Label>Cuisine type</Label>
              <Select
                value={form.cuisineType}
                onValueChange={setSelect("cuisineType")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {CUISINE_TYPES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Short description</Label>
            <Textarea
              value={form.description}
              onChange={set("description")}
              placeholder="Tell customers what makes your restaurant special…"
              className="resize-none"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Location & Branch ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeading icon={MapPin} title="Location & Branch" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>City</Label>
              <Select
                value={form.city}
                onValueChange={setSelect("city")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>District / neighbourhood</Label>
              <Input
                value={form.district}
                onChange={set("district")}
                placeholder="e.g. Zamalek"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>
                Street address <RequiredStar />
              </Label>
              <Input
                value={form.streetAddress}
                onChange={set("streetAddress")}
                placeholder="Full street address"
              />
            </div>
            <div className="space-y-2">
              <Label>Branch name / identifier</Label>
              <Input
                value={form.branchName}
                onChange={set("branchName")}
                placeholder="e.g. Downtown Branch"
              />
            </div>
            <div className="space-y-2">
              <Label>Number of branches</Label>
              <Select
                value={form.branchCount}
                onValueChange={setSelect("branchCount")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {BRANCH_COUNTS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Google Maps link</Label>
              <Input
                type="url"
                value={form.mapsLink}
                onChange={set("mapsLink")}
                placeholder="https://maps.google.com/…"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Contact Information ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeading icon={Phone} title="Contact Information" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label>
                Owner / manager full name <RequiredStar />
              </Label>
              <Input
                value={form.ownerName}
                onChange={set("ownerName")}
                placeholder="Full name"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Email address <RequiredStar />
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="you@restaurant.com"
              />
            </div>
            <div className="space-y-2">
              <Label>
                Phone number <RequiredStar />
              </Label>
              <div className="flex gap-2">
                <Select
                  value={form.countryCode}
                  onValueChange={setSelect("countryCode")}
                >
                  <SelectTrigger className="w-[120px] shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((cc) => (
                      <SelectItem key={cc.value} value={cc.value}>
                        {cc.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="1234567890"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>WhatsApp number</Label>
              <Input
                type="tel"
                value={form.whatsapp}
                onChange={set("whatsapp")}
                placeholder="WhatsApp number"
              />
            </div>
            <div className="space-y-2">
              <Label>Website URL</Label>
              <Input
                type="url"
                value={form.website}
                onChange={set("website")}
                placeholder="https://yourrestaurant.com"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Instagram handle</Label>
              <Input
                value={form.instagram}
                onChange={set("instagram")}
                placeholder="@yourrestaurant"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 4: Brand Logo Upload ── */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <SectionHeading icon={ImageIcon} title="Brand Logo" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          {!logo ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleFileSelect(e.dataTransfer.files);
              }}
              className="w-full border-2 border-dashed border-input rounded-xl p-8 flex flex-col items-center gap-3 hover:border-primary/50 hover:bg-muted/40 transition-colors cursor-pointer"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                <span className="font-medium text-primary">Click to upload</span>{" "}
                or drag and drop
              </p>
              <p className="text-xs text-muted-foreground">
                PNG or JPG · Min 200×200px · Max 5 MB
              </p>
            </button>
          ) : (
            <div className="flex items-center gap-4 p-4 border border-border rounded-xl bg-muted/30">
              <img
                src={logo.preview}
                alt="Logo preview"
                className="w-16 h-16 rounded-lg object-cover border border-border"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {logo.file.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(logo.file.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={removeLogo}
                className="shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Actions ── */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pb-8">
        <Button
          type="button"
          variant="outline"
          onClick={handleSaveDraft}
        >
          Save draft
        </Button>
        <Button type="submit" size="lg">
          Submit registration
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </form>
  );
};

/* ─── Drivers placeholder ─── */
const DriversTab = () => (
  <div className="max-w-md mx-auto text-center py-12 space-y-4">
    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-muted">
      <Truck className="w-7 h-7 text-muted-foreground" />
    </div>
    <h2 className="text-xl font-serif text-foreground">Driver sign-up coming soon</h2>
    <p className="text-muted-foreground">
      We're building a driver network. Check back shortly!
    </p>
  </div>
);

/* ─── Main page ─── */
const Onboarding = () => {
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") === "restaurant" ? "restaurant" : "customer";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-4 pt-8 md:pt-12">
      <div className="w-full max-w-3xl space-y-8">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground mb-2">
            <Coffee className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-serif text-foreground">Join Bakebar</h1>
          <p className="text-muted-foreground text-sm">
            Choose how you'd like to get started
          </p>
        </div>

        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="customer">For customers</TabsTrigger>
            <TabsTrigger value="restaurant">For restaurants</TabsTrigger>
            <TabsTrigger value="driver">For drivers</TabsTrigger>
          </TabsList>

          <TabsContent value="customer" className="mt-6">
            <CustomerTab />
          </TabsContent>

          <TabsContent value="restaurant" className="mt-6">
            <RestaurantTab />
          </TabsContent>

          <TabsContent value="driver" className="mt-6">
            <DriversTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Onboarding;
