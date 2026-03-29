import { Coffee, Gift } from "lucide-react";

interface StampProgressProps { stampCount: number; total?: number; }

const StampProgress = ({ stampCount, total = 7 }: StampProgressProps) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
        style={i < stampCount
          ? { background: "hsl(var(--coral))", boxShadow: "0 0 6px hsl(var(--coral) / 0.4)" }
          : { background: "hsl(var(--border))", border: "1.5px dashed hsl(var(--coral) / 0.3)" }}>
        {i === total - 1
          ? <Gift className="w-2.5 h-2.5" style={{ color: i < stampCount ? "white" : "hsl(var(--muted-foreground))" }} />
          : i < stampCount && <Coffee className="w-2.5 h-2.5 text-white" />}
      </div>
    ))}
  </div>
);

export default StampProgress;
