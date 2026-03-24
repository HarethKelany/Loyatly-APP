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
    <div className={`relative overflow-hidden rounded-2xl p-6 ${isRewardReady ? 'reward-card animate-reward-pulse' : 'reward-card'}`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-primary-foreground" />
        <div className="absolute bottom-4 left-4 w-20 h-20 rounded-full border border-primary-foreground" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-serif text-primary-foreground">BAKEBAR</h3>
            <p className="text-primary-foreground/70 text-sm">Loyalty Card</p>
          </div>
          <div className="text-right">
            <p className="text-primary-foreground/70 text-xs">Customer Code</p>
            <p className="text-primary-foreground font-mono text-lg font-bold tracking-wider">{customerCode}</p>
          </div>
        </div>

        {/* Stamps */}
        {isRewardReady ? (
          <div className="text-center py-4">
            <p className="text-primary-foreground text-2xl font-serif mb-1">🎉 Free {rewardItem || 'Item'} Unlocked!</p>
            <p className="text-primary-foreground/80 text-sm">Show this to the cashier to redeem</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-3 py-4">
            {Array.from({ length: TOTAL_STAMPS }).map((_, i) => (
              <div
                key={i}
                className={`stamp-dot ${i < stampCount ? 'stamp-dot-filled' : 'stamp-dot-empty'} ${i < stampCount ? 'animate-stamp-pop' : ''}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {i < stampCount && (
                  <Coffee className="w-5 h-5 m-auto mt-2 text-primary-foreground" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-foreground/20">
          <p className="text-primary-foreground font-medium">{customerName}</p>
          <p className="text-primary-foreground/70 text-sm">
            {isRewardReady ? 'Reward Ready!' : `${stampCount} / ${TOTAL_STAMPS} visits`}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyCard;
