
import { Button } from "@/components/ui/button";

import { WalletAction } from "@/constants/wallet";

interface WalletCardProps {
  onAction: (action: WalletAction) => void;
  usdcBalance?: number;
}

const WalletCard = ({ onAction, usdcBalance }: WalletCardProps) => {
  // Format the balance with 2 decimal places
  const formattedBalance = usdcBalance !== undefined 
    ? usdcBalance
    : 0.00;
  const isEarning = true;
  const currentEarning = "+$0.027";
  const apy = "5.5%";

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            💳 USDC Yield Wallet
          </h1>
        </div>

        {/* Balance Display */}
        <div className="text-center space-y-2">
          <div className="text-4xl font-bold text-gray-900">
            {formattedBalance} <span className="text-2xl text-gray-600">USDC</span>
          </div>
          {isEarning && (
            <div className="text-sm text-green-600 font-medium">
              Currently Earning: {currentEarning} ({apy} APY)
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => onAction("send")}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ➤ Send USDC
          </Button>

          <Button
            onClick={() => onAction("receive")}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            ⇩ Receive USDC
          </Button>

          <Button
            onClick={() => {
              onAction("earn");
            }}
            className="w-full h-14 text-lg font-semibold rounded-2xl bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            📈 Start Earning
          </Button>

          <Button
              onClick={() => {
                onAction("topup");
              }}
              className="w-full h-14 text-lg font-semibold rounded-2xl bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            💰 Top Up
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
