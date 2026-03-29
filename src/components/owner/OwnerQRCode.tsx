import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download } from "lucide-react";

const OwnerQRCode = ({ restaurantId, restaurantName }: { restaurantId: string; restaurantName: string }) => {
  const joinUrl = `${window.location.origin}/join?r=${restaurantId}`;
  const handleDownload = () => {
    const svg = document.querySelector(".owner-qr-area svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 600; canvas.height = 600;
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      ctx?.drawImage(img, 0, 0, 600, 600);
      const a = document.createElement("a");
      a.download = `${restaurantName.toLowerCase().replace(/\s+/g, "-")}-qr.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl p-5 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--teal)), hsl(190 80% 45%))" }}>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/20 mb-3">
          <QrCode className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-base font-extrabold text-white">Your QR Code</h2>
        <p className="text-xs text-white/80 mt-1">Print and display at your counter so customers can join</p>
      </div>
      <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-2xl shadow-sm owner-qr-area">
          <QRCodeSVG value={joinUrl} size={200} bgColor="#ffffff" fgColor="#14102a" level="M" />
        </div>
        <div className="text-center">
          <p className="font-extrabold text-foreground text-sm">{restaurantName}</p>
          <p className="text-xs text-muted-foreground mt-0.5">Scan to join loyalty program</p>
        </div>
        <button onClick={handleDownload} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white active:scale-95" style={{ background: "hsl(var(--teal))" }}>
          <Download className="w-4 h-4" /> Download QR Code
        </button>
      </div>
      <div className="bg-muted rounded-xl p-3">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Join URL</p>
        <p className="text-xs font-mono text-foreground break-all">{joinUrl}</p>
      </div>
    </div>
  );
};

export default OwnerQRCode;
