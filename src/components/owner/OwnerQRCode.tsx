import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download } from "lucide-react";

interface Props {
  restaurantId: string;
  restaurantName: string;
}

const OwnerQRCode = ({ restaurantId, restaurantName }: Props) => {
  const joinUrl = `${window.location.origin}/join?r=${restaurantId}`;

  const handleDownload = () => {
    const svg = document.querySelector(".owner-qr-area svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 600;
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
    <div className="max-w-md mx-auto space-y-6">
      <Card className="border-0 surface-warm">
        <CardHeader>
          <CardTitle className="font-serif text-lg flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" /> Your QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            Print this QR code and display it at your counter. Customers scan it to join your loyalty program.
          </p>
          <div className="inline-block bg-background p-4 rounded-2xl shadow-lg owner-qr-area">
            <QRCodeSVG
              value={joinUrl}
              size={200}
              bgColor="hsl(35, 30%, 97%)"
              fgColor="hsl(25, 20%, 12%)"
              level="M"
            />
            <p className="mt-3 text-sm font-serif font-medium text-foreground">{restaurantName}</p>
            <p className="text-xs text-muted-foreground">Scan to join loyalty program</p>
          </div>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-1" /> Download QR Code
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default OwnerQRCode;
