import { Coffee, Gift } from "lucide-react";

interface StampProgressProps {
  stampCount: number;
  total?: number;
}

const StampProgress = ({ stampCount, total = 7 }: StampProgressProps) => {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            i < stampCount
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted text-muted-foreground border-2 border-dashed border-muted-foreground/30'
          }`}
        >
          {i < total - 1 ? (
            i < stampCount ? <Coffee className="w-4 h-4" /> : <span className="text-xs">{i + 1}</span>
          ) : (
            <Gift className={`w-4 h-4 ${i < stampCount ? '' : ''}`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default StampProgress;
