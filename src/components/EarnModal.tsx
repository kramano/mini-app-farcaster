
import { Button } from "@/components/ui/button";

interface EarnModalProps {
  onClose: () => void;
}

const EarnModal = ({ onClose }: EarnModalProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="bg-purple-50 rounded-xl p-4 text-center">
          <div className="text-2xl mb-2">📈</div>
          <h3 className="font-semibold text-purple-900 mb-1">
            Earn 5.5% APY on your USDC
          </h3>
          <p className="text-sm text-purple-700">
            Start earning yield on your idle USDC tokens
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount to Deposit (USDC)
          </label>
          <input
            type="number"
            placeholder="0.00"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
          />
          <div className="text-xs text-gray-500 mt-1">
            Available: $12.34 USDC
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <div className="text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Est. daily earnings:</span>
              <span>$0.027</span>
            </div>
            <div className="flex justify-between">
              <span>Est. monthly earnings:</span>
              <span>$0.81</span>
            </div>
            <div className="flex justify-between font-medium">
              <span>Annual yield (5.5% APY):</span>
              <span>$9.72</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={onClose}
          variant="outline"
          className="flex-1 h-12 rounded-xl"
        >
          Cancel
        </Button>
        <Button
          className="flex-1 h-12 rounded-xl bg-purple-600 hover:bg-purple-700"
        >
          Start Earning
        </Button>
      </div>
    </div>
  );
};

export default EarnModal;
