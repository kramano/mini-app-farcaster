
import { Button } from "@/components/ui/button";

interface ReceiveModalProps {
  onClose: () => void;
}

const ReceiveModal = ({ onClose }: ReceiveModalProps) => {
  const walletAddress = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="bg-gray-100 rounded-xl p-6">
          <div className="w-32 h-32 bg-white rounded-xl mx-auto mb-4 flex items-center justify-center">
            <div className="text-4xl">📱</div>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Your USDC Wallet Address
          </p>
          <div className="bg-white rounded-lg p-3 border-2 border-dashed border-gray-200">
            <code className="text-xs font-mono text-gray-800 break-all">
              {walletAddress}
            </code>
          </div>
        </div>
        
        <div className="text-sm text-gray-500">
          Send only USDC (SPL Token) to this address on Solana network
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1 h-12 rounded-xl"
        >
          Copy Address
        </Button>
        <Button
          onClick={onClose}
          className="flex-1 h-12 rounded-xl bg-green-600 hover:bg-green-700"
        >
          Done
        </Button>
      </div>
    </div>
  );
};

export default ReceiveModal;
