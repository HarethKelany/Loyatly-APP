import { Coffee } from "lucide-react";

interface LoyaltyCardProps {
  customerName: string;
  customerCode: string;
  stampCount: number;
  isRewardReady: boolean;
  rewardItem?: string;
}

const TOTAL_STAMPS = 7;

const LoyaltyCard = ({ customerName, customerCode, stampCount, isRewardReady, rewardItem }: LoyaltyCardProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 ${isRewardReady ? "animate-reward-pulse" : ""}`}
      style={{ background: "linear-gradient(135deg, hsl(var(--coral)), hsl(20 100% 55%))", boxShadow: "0 10px 36px hsl(var(--coral) / 0.38)" }}
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 w-20 h-20 rounded-full bg-white/8" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide">BAKEBAR</h3>
            <p className="text-white/65 text-[11px] mt-0.5">Loyalty Card</p>
          </div>
          <div className="text-right">
            <p className="text-white/65 text-[10px]">Customer Code</p>
            <p className="text-white font-bold font-mono text-base tracking-wider">#{customerCode}</p>
          </div>
        </div>
        {isRewardReady ? (
          <div className="text-center py-3">
            <p className="text-white text-xl font-extrabold mb-0.5">🎉 Free {rewardItem || "Item"} Unlocked!</p>
            <p className="text-white/75 text-xs">Show this to the cashier to redeem</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3">
            {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
              <div
                key={i}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${i < stampCount ? "animate-stamp-pop" : ""}`}
                style={i < stampCount
                  ? { background: "rgba(255,255,255,1)", boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }
                  : { background: "rgba(255,255,255,0.22)", border: "1.5px dashed rgba(255,255,255,0.5)" }}
              >
                {i < stampCount && <Coffee className="w-4 h-4" style={{ color: "hsl(var(--coral))" }} />}
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
          <p className="text-white font-semibold text-sm">{customerName}</p>
          <p className="text-white/70 text-xs">{isRewardReady ? "Reward Ready!" : `${stampCount} / ${TOTAL_STAMPS} visits`}</p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
